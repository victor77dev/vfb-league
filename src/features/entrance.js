import {useState, useEffect} from 'react';

import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import {Home} from './home';
import {Profile} from './profile';
import {Signup} from './signup';
import {Recovery} from './recovery';
import {Login} from './login';
import {Availability} from './availability';

import {supabase} from './supabaseClient';

import {convertGermanDate} from '../utils/date';

const TEAM_FILTER = 'TeamFilter';

const NUM_OF_TEAM = 6;

export const Entrance = () => {
    const [matches, setMatches] = useState(null);
    const [session, setSession] = useState(null);
    const [activeTab, setActiveTab] = useState('home');
    const [recovery, setRecovery] = useState(false);

    const storedTeam = localStorage.getItem(TEAM_FILTER);
    const [team, setFilteredTeam] = useState(storedTeam ? JSON.parse(storedTeam) : Array(6).fill(true));

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)

            if (!recovery) {
                setActiveTab('home');
            }
        });

        supabase.auth.onAuthStateChange((event, session) => {
            if (event === "PASSWORD_RECOVERY") {
                setRecovery(true);
                setActiveTab('recovery');
            } else {
                setActiveTab('home');
            }

            setSession(session);
        });
    }, [recovery]);

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
                        }
                    });
                setMatches(modified);
            });

    }, []);


    useEffect(() => {
        const stored = localStorage.getItem(TEAM_FILTER);
        const current = JSON.stringify(team);

        if (!stored || stored !== current) {
            localStorage.setItem(TEAM_FILTER, current);
        }
    }, [team]);

    useEffect(() => {
        if (recovery) {
            setActiveTab('recovery');
        }
    }, [recovery]);

    return (
        <Tabs
            activeKey={activeTab}
            onSelect={(key) => {setActiveTab(key)}}
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
                session &&
                    <Tab eventKey="profile" title="Profile">
                        <Profile session={session}/>
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
            {
                recovery &&
                        <Tab eventKey="recovery" title="Recovery">
                            <Recovery />
                        </Tab>
            }
            <Tab eventKey="availability" title="Availability">
                <Availability
                    team={team}
                    setFilteredTeam={setFilteredTeam}
                    session={session}
                    matches={matches}
                />
            </Tab>
        </Tabs>
    );
}
