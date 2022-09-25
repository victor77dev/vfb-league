import {useState, useEffect} from 'react';

import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import {Home} from './home';
import {Profile} from './profile';
import {Signup} from './signup';
import {Login} from './login';
import {Availability} from './availability';

import {supabase} from './supabaseClient';

const TEAM_FILTER = 'TeamFilter';

export const Entrance = () => {
    const [session, setSession] = useState(null);
    const [activeTab, setActiveTab] = useState('home');

    const storedTeam = localStorage.getItem(TEAM_FILTER);
    const [team, setFilteredTeam] = useState(storedTeam ? JSON.parse(storedTeam) : Array(6).fill(true));

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setActiveTab('home');
        })

        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            setActiveTab('home');
        })
    }, []);

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
            onSelect={(key) => {setActiveTab(key)}}
            id="uncontrolled-tab-example"
            className="mb-3"
            fill
        >
            <Tab eventKey="home" title="Home">
                <Home team={team} setFilteredTeam={setFilteredTeam}/>
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
            <Tab eventKey="availability" title="Availability">
                <Availability team={team} setFilteredTeam={setFilteredTeam}/>
            </Tab>
        </Tabs>
    );
}
