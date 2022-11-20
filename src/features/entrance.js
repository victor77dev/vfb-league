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

import {supabase} from './supabaseClient';

import {convertGermanDate} from '../utils/date';

const TEAM_FILTER = 'TeamFilter';

const NUM_OF_TEAM = 6;

export const Entrance = ({tab='home'}) => {
    const activeTab = tab;

    const navigate = useNavigate();
    const {matchDetail} = useParams();
    const [matches, setMatches] = useState(null);
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);

    const storedTeam = localStorage.getItem(TEAM_FILTER);
    const [team, setFilteredTeam] = useState(storedTeam ? JSON.parse(storedTeam) : Array(6).fill(true));

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        supabase.auth.onAuthStateChange((event, session) => {
            if (event === "PASSWORD_RECOVERY") {
                navigate('/recovery');
            }

            setSession(session);
            navigate('/home');
        });
    }, [navigate]);

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

            const {data: isCaptain} = await supabase
                .from('captains')
                .select('isCaptain')
                .eq('id', user.id);

            if (isCaptain.length > 0) {
                setProfile({...data, isCaptain});
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
            fill
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
                        <Youtube session={session} profile={profile} />
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
        </Tabs>
    );
}
