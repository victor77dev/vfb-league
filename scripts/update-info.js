const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');
const pdfReader = require('pdfjs-dist/legacy/build/pdf.js');

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

const args = process.argv.slice(2);

// It has a shorten form for team 7 as name is too long
const clubName = 'Kiefhol';

const downloadFile = async (url, path) => {
    const res = await fetch(url);

    const fileStream = fs.createWriteStream(path);

    await new Promise((resolve, reject) => {
        res.body.pipe(fileStream);
        res.body.on("error", reject);
        fileStream.on("finish", resolve);
    });
};

const parseMatch = async (pdf) => {
    const totalPage = pdf.numPages;

    const matches = [];

    for (let i = 1; i <= totalPage; i++) {
        let textData = {};

        const page = await pdf.getPage(i);

        const textContent = await page.getTextContent();

        let items = textContent.items;

        let timetableStart = false;

        for (let chunk of items) {
            timetableStart |= chunk.str.includes('Datum,');

            if (!timetableStart) continue;

            const tempY = Math.floor(chunk.transform[5]);
            const positionY = Object.keys(textData).find((key) => Math.abs(key - tempY) < 2) || tempY;
            const index = positionY * (totalPage - i + 1);

            if (textData[index] === undefined) {
                textData[index] = chunk.str + ',';
            } else {
                textData[index] += chunk.str + ',';
            }
        }

        let matchDate;

        const year = new Date().getFullYear();

        Object.keys(textData).sort((a, b) => (b - a))
            .forEach((key) => {
                const row = textData[key];

                const dateRegex = new RegExp(`.+,.?,.*(${year}|${year + 1})`);
                const date = row.match(dateRegex);

                if (date?.length > 0) {
                    matchDate = date?.[0].replace(/,/g, '');
                }

                if (row.includes(clubName)) {
                    let time;
                    let removeTime;

                    if (date?.length > 0) {
                        const timeRegex = new RegExp(`.+,.?,.*(${year}|${year + 1}),.?,[\\d]+:[\\d]+`);
                        const replaceRegex = new RegExp(`.+,.?,.*(${year}|${year + 1}),.?,`);
                        time = row.match(timeRegex)?.[0]
                            .replace(replaceRegex, '');

                        removeTime = row.replace(timeRegex, '');
                    } else {
                        time = row.match(/[\d]+:[\d]+/)?.[0];
                        removeTime = row.replace(/[\d]+:[\d]+/, '');
                    }

                    const extra = removeTime.match(/^ [a-z]/)?.[0];
                    removeTime = removeTime.replace(/^ [a-z]/, '');

                    const remaining = removeTime.split(',').filter((text) => text.match(/[^ \r\n]+/));

                    const venue = remaining[0].trim();

                    const home = remaining[1].trim();

                    const guest = remaining[2].trim();

                    matches.push({
                        date: matchDate,
                        time,
                        venue,
                        home,
                        guest,
                        extra,
                    })
                }
            });
    }

    return matches;
}

const parseHall = async (pdf) => {
    const totalPage = pdf.numPages;

    let textData = {};

    const addressList = {};

    for (let i = 1; i <= totalPage; i++) {
        const page = await pdf.getPage(i);

        const textContent = await page.getTextContent();

        let items = textContent.items;

        let hallStart = false;

        for (let chunk of items) {
            const found = chunk.str.includes('Hallenverzeichnis');
            hallStart |= found;

            if (!hallStart || found) continue;

            const tempY = Math.floor(chunk.transform[5]);
            const positionY = Object.keys(textData).find((key) => Math.abs(key - tempY) < 2) || tempY;
            const index = positionY * (totalPage - i + 1);

            if (textData[index] === undefined) {
                textData[index] = chunk.str;
            } else {
                textData[index] += chunk.str;
            }
        }

        let count = 0;
        let id;

        Object.keys(textData).sort((a, b) => (b - a))
            .forEach((key) => {
                const row = textData[key];

                if (count % 2 === 0) {
                    // Address code
                    id = row.match(/[äöüÄÖÜß\w]+/)?.[0];
                } else {
                    // Actual address
                    addressList[id] = row;
                }

                count++;
            });
    }

    return addressList;
}

const getMatchList = async (team, url) => {
    const today = new Date().toISOString().slice(0, 10);

    const dir = `temp/${today}`;
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, {recursive: true});
    }

    const filePath = `${dir}/raw_${team}_${today}.pdf`;
    await downloadFile(url, filePath);

    const pdf = await pdfReader.getDocument(filePath).promise;

    const rawMatch = await parseMatch(pdf);
    const halls = await parseHall(pdf);

    const matches = rawMatch.map((match) => {
        return {
            ...match,
            venue: halls[match.venue],
            team,
            isHome: match.home.indexOf(clubName) >= 0,
        }
    })

    file = fs.createWriteStream(`${dir}/${team}_${today}.csv`);

    file.on('error', (err) => {
        console.error('Error: file can\'t save');
    });

    matches.forEach(({
        date,
        time,
        venue,
        home,
        guest,
    }) => {
        file.write(`${date},${time},${venue?.replace(',', ' ')},${home},${guest}\n`);
    });

    file.end();

    return matches;
}

const convertRomanToNum = (roman) => {
    switch(roman) {
        case 'I':
            return 1;
        case 'II':
            return 2;
        case 'III':
            return 3;
        case 'IV':
            return 4;
        case 'V':
            return 5;
        case 'VI':
            return 6;
        case 'VII':
            return 7;
        default:
            return 0;
    }
}

const getPlayerList = async (male, url) => {
    const today = new Date().toISOString().slice(0, 10);
    
    const dir = `temp/${today}`;
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, {recursive: true});
    }

    const filePath = `${dir}/raw_player_${male ? 'men' : 'women'}_${today}.html`;
    await downloadFile(url, filePath);

    const dom = await JSDOM.fromFile(filePath);

    const rows = dom.window.document.querySelectorAll('table>tbody>tr');

    const players = [];

    rows.forEach((row) => {
        const data = row.querySelectorAll('td');

        const single = parseInt(data[0]?.textContent?.replace(/\/\d+/, ''), 10);
        const double = parseInt(data[0]?.textContent?.replace(/\d+\//, ''), 10);
        const team = convertRomanToNum(data[1]?.textContent);
        const name = data[3]?.children[0].textContent;
        const gender = male ? 'M' : 'F';

        if (name) {
            players.push({
                single,
                double,
                team,
                name,
                restrict: team,
                gender,
            })
        }
    });

    file = fs.createWriteStream(`${dir}/players_${male ? 'men' : 'women'}_${today}.csv`);

    file.on('error', (err) => {
        console.error('Error: file can\'t save');
    });

    players.forEach(({
        single,
        double,
        team,
        name
    }) => {
        file.write(`${single},${double},${name}\n`);
    });

    file.end();

    return players;
}

const baseUrl = 'https://bvbb-badminton.liga.nu';

const getScheduleUrl = async (url) => {
    const page = await fetch(url)

    const content = await page.text();

    const dom = new JSDOM(content);

    const result = dom.window.document.querySelector('table~a')?.href;

    return `${baseUrl}${result}`;
}

const findAndUpdateMatch = async (supabase, match) => {
    let { data, error, status } = await supabase
        .from('matches')
        .select('*')
        .like('home', match.home)
        .like('guest', match.guest);

        console.log(match);

        if (data.length > 0) {
            const found = data[0];
            const checkDate = found.date === match.date.replace(/[A-z]*\. /, '');
            const checkTime = found.time === match.time;
            const checkVenue = found.venue === match.venue;

            console.log('checking update');
            if (!(checkDate && checkTime && checkVenue)) {
                console.log('need udpate', match, found, found.id)
                let { data, error, status } = await supabase
                    .from('matches')
                    .update({
                        date: match.date.replace(/[A-z]*\. /, ''),
                        time: match.time,
                        venue: match.venue,
                    })
                    .eq('id', found.id);

                console.log(data, error, status)
            }
        } else {
            console.log('not found', match)
            insertMatch(supabase, {
                ...match,
                date: match.date.replace(/[A-z]*\. /, ''),
            });
        }
    console.log('Update finished');
}

const insertMatch = async (supabase, match) => {
    console.log('Insert match')
    let { data, error, status } = await supabase
        .from('matches')
        .insert(match);
        console.log(error)
    console.log(data, error, status);
}

const updatePlayers = async (supabase, players) => {
    let { data, error, status } = await supabase
        .from('players')
        .upsert(players, {
            onConflict: 'name',
        });
    console.log(data, error, status);
}

const getMatches = async () => {
    const supabaseLib = await import('./supabase.js');
    let supabase = await supabaseLib.initClient();

    const { data, error } = await supabase.auth.signInWithPassword({
        email: process.env.SUPABASE_ADMIN_EMAIL,
        password: process.env.SUPABASE_ADMIN_PASSWORD,
    })

    const token = data?.session.access_token;
    supabase = await supabaseLib.initClient(token);

    const url1 = await getScheduleUrl('https://bvbb-badminton.liga.nu/cgi-bin/WebObjects/nuLigaBADDE.woa/wa/groupPage?championship=BBMM+23%2F24&group=32076');
    const url2 = await getScheduleUrl('https://bvbb-badminton.liga.nu/cgi-bin/WebObjects/nuLigaBADDE.woa/wa/groupPage?championship=BBMM+23%2F24&group=32117');
    const url3 = await getScheduleUrl('https://bvbb-badminton.liga.nu/cgi-bin/WebObjects/nuLigaBADDE.woa/wa/groupPage?championship=BBMM+23%2F24&group=32118');
    const url4 = await getScheduleUrl('https://bvbb-badminton.liga.nu/cgi-bin/WebObjects/nuLigaBADDE.woa/wa/groupPage?championship=BBMM+23%2F24&group=32123');
    const url5 = await getScheduleUrl('https://bvbb-badminton.liga.nu/cgi-bin/WebObjects/nuLigaBADDE.woa/wa/groupPage?championship=BBMM+23%2F24&group=32122');
    const url6 = await getScheduleUrl('https://bvbb-badminton.liga.nu/cgi-bin/WebObjects/nuLigaBADDE.woa/wa/groupPage?championship=BBMM+23%2F24&group=32125');
    const url7 = await getScheduleUrl('https://bvbb-badminton.liga.nu/cgi-bin/WebObjects/nuLigaBADDE.woa/wa/groupPage?championship=BBMM+23%2F24&group=32124');

    const matches = [];

    matches.push(...await getMatchList(1, url1));
    matches.push(...await getMatchList(2, url2));
    matches.push(...await getMatchList(3, url3));
    matches.push(...await getMatchList(4, url4));
    matches.push(...await getMatchList(5, url5));
    matches.push(...await getMatchList(6, url6));
    matches.push(...await getMatchList(7, url7));

    matches.forEach((match) => {
        findAndUpdateMatch(supabase, match)
    });
}

const getPlayers = async () => {
    const supabaseLib = await import('./supabase.js');
    let supabase = await supabaseLib.initClient();

    const { data, error } = await supabase.auth.signInWithPassword({
        email: process.env.SUPABASE_ADMIN_EMAIL,
        password: process.env.SUPABASE_ADMIN_PASSWORD,
    })

    const token = data?.session.access_token;
    supabase = await supabaseLib.initClient(token);

    const men = await getPlayerList(true, 'https://bvbb-badminton.liga.nu/cgi-bin/WebObjects/nuLigaBADDE.woa/wa/clubPools?displayTyp=vorrunde&club=18281&contestType=Herren&seasonName=2023%2F24');
    const women = await getPlayerList(false, 'https://bvbb-badminton.liga.nu/cgi-bin/WebObjects/nuLigaBADDE.woa/wa/clubPools?displayTyp=vorrunde&club=18281&contestType=Damen&seasonName=2023%2F24');

    updatePlayers(supabase, [...men, ...women]);
}

const getAllInfo = async () => {
    getMatches();
    getPlayers();
}

if (args[0] === 'match') {
    getMatches();
} else if (args[0] === 'player') {
    getPlayers();
} else if (args[0] === 'all') {
    getAllInfo();
}
