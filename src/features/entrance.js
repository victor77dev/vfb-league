import {useState, useEffect} from 'react';
import {useNavigate, useParams} from 'react-router-dom';

import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import {Home} from './home';
import {Profile} from './profile';
import {Signup} from './signup';
import {Login} from './login';
import {Availability} from './availability';
import {Captain} from './captain';
import {Match} from './match';
import {Youtube} from './youtube';
import {Video} from './video';
import {YoutubeToken} from './youtubeToken';
import {Privacy} from './privacy';
import {Cookies} from './cookies';

import {supabase} from './supabaseClient';

import {convertGermanDate} from '../utils/date';

const TEAM_FILTER = 'TeamFilter';

const NUM_OF_TEAM = 7;

export const Entrance = ({tab='home'}) => {
    const activeTab = tab;

    const navigate = useNavigate();


    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('state') === 'youtubeToken' && tab !== 'youtubeToken') {
            navigate('/youtubeToken', {
                code: params.get('code'),
            });
        }
    }, [navigate, tab]);

    const {matchDetail} = useParams();
    const [matches, setMatches] = useState(null);
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);

    const storedTeam = localStorage.getItem(TEAM_FILTER);
    if (storedTeam && storedTeam.length !== NUM_OF_TEAM) {
        localStorage.removeItem(TEAM_FILTER);
    }

    const [team, setFilteredTeam] = useState(storedTeam ?  JSON.parse(storedTeam) : Array(NUM_OF_TEAM).fill(true));

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        supabase.auth.onAuthStateChange((event, session) => {
            if (event === "PASSWORD_RECOVERY") {
                navigate('/recovery');
            }

            setSession(session);
            if (event === 'SIGNED_IN' && activeTab === 'login') {
                navigate('/home');
            }

            if (event === 'SIGNED_OUT') {
                navigate('/home');
            }
        });
    }, [navigate, activeTab]);

    useEffect(() => {
        supabase.from('matches').select('*')
            .then(({ data, error, status }) => {
                const count = new Array(NUM_OF_TEAM).fill(0)

                const modified = data
                    .map((match) => ({
                        ...match,
                        date: convertGermanDate(match.date),
                    }))
                    .sort((a, b) => {
                        if (a.date.getTime() !== b.date.getTime()) {
                            return a.date > b.date ? 1 : -1;
                        } else {
                            return a.time > b.time ? 1 : -1
                        }
                    })
                    .map((match) => {
                        count[match.team - 1]++;
                        return {
                            ...match,
                            code: `T${match.team}.${count[match.team - 1]}`,
                            map: encodeURI(`https://www.google.com/maps/search/?api=1&query=${match.venue}`),
                        }
                    });
                setMatches(modified);
            });
    }, []);

    useEffect(() => {
        const getProfile = async (session) => {
            const {user} = session;

            const {data} = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            const {data: role} = await supabase
                .from('captains')
                .select('*')
                .eq('id', user.id);

            if (role.length > 0) {
                setProfile({
                    ...data,
                    isCaptain: role[0].isCaptain,
                    isAdmin: role[0].isAdmin,
                    isYoutube: role[0].isYoutube,
                });
            } else {
                setProfile(data);
            }
        };

        if (!session) return;

        getProfile(session)
    }, [session]);

    useEffect(() => {
        const stored = localStorage.getItem(TEAM_FILTER);
        const current = JSON.stringify(team);

        if (!stored || stored !== current) {
            localStorage.setItem(TEAM_FILTER, current);
        }
    }, [team]);

    return (
        <Tabs
            activeKey={activeTab}
            onSelect={(key) => {
                navigate(`/${key}`);
            }}
            id="uncontrolled-tab-example"
            className="mb-3"
            fill={true}
            mountOnEnter={true}
        >
            <Tab eventKey="home" title="Home">
                <Home
                    team={team}
                    setFilteredTeam={setFilteredTeam}
                    matches={matches}
                />
            </Tab>
            {
                matchDetail &&
                    <Tab eventKey="match" title="Match">
                        <Match
                            match={matches?.find((match) => match.id === matchDetail)}
                            isCaptain={profile?.isCaptain}
                        />
                    </Tab>
            }
            {
                session &&
                    <Tab eventKey="profile" title="Profile">
                        <Profile session={session} profile={profile} />
                    </Tab>
            }
            {
                session &&
                    <Tab eventKey="youtube" title="Youtube">
                        <Youtube profile={profile} user={session.user} />
                    </Tab>
            }
            {
                session &&
                    <Tab eventKey="video" title="Video">
                        <Video user={session.user} />
                    </Tab>
            }
            {
                !session &&
                    <Tab eventKey="login" title="Login">
                        <Login />
                    </Tab>
            }
            {
                !session &&
                        <Tab eventKey="signup" title="Signup">
                            <Signup />
                        </Tab>
            }
            <Tab eventKey="availability" title="Availability">
                <Availability
                    profile={profile}
                    team={team}
                    setFilteredTeam={setFilteredTeam}
                    session={session}
                    matches={matches}
                />
            </Tab>
            {
                profile?.isCaptain &&
                    <Tab eventKey="captain" title="Captain">
                        <Captain
                            team={team}
                            setFilteredTeam={setFilteredTeam}
                            session={session}
                            matches={matches}
                        />
                    </Tab>
            }
            {
                profile?.isYoutube &&
                    <Tab eventKey="youtubeToken" title="Youtube Token">
                        <YoutubeToken />
                    </Tab>
            }
            <Tab eventKey="privacy" title="Privacy">
                <Privacy />
            </Tab>
            <Tab eventKey="cookies" title="Cookies">
                <Cookies />
            </Tab>
        </Tabs>
    );
}
