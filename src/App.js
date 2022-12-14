import {
    BrowserRouter as Router,
    Routes,
    Route,
  } from 'react-router-dom';
import ThemeProvider from 'react-bootstrap/ThemeProvider'

import 'bootstrap/dist/css/bootstrap.min.css';

import {Entrance} from './features/entrance';
import {Recovery} from './features/recovery';

function App() {
    return (
        <ThemeProvider
            breakpoints={['xxxl', 'xxl', 'xl', 'lg', 'md', 'sm', 'xs', 'xxs']}
            minBreakpoint="xxs"
        >
            <Router basename="/vfb-league">
                <Routes>
                    <Route
                        exact
                        path="/"
                        element={<Entrance />}
                    />
                    <Route
                        path="/home"
                        element={<Entrance />}
                    />
                    <Route
                        path="/profile"
                        element={<Entrance tab='profile'/>}
                    />
                    <Route
                        path="/match/:matchDetail"
                        element={<Entrance tab='match' />}
                    />
                    <Route
                        path="/youtube"
                        element={<Entrance tab='youtube' />}
                    />
                    <Route
                        path="/video"
                        element={<Entrance tab='video' />}
                    />
                    <Route
                        path="/youtubeToken"
                        element={<Entrance tab='youtubeToken' />}
                    />
                    <Route
                        path="/login"
                        element={<Entrance tab='login' />}
                    />
                    <Route
                        path="/signup"
                        element={<Entrance tab='signup' />}
                    />
                    <Route
                        path="/availability"
                        element={<Entrance tab='availability' />}
                    />
                    <Route
                        path="/captain"
                        element={<Entrance tab='captain' />}
                    />
                    <Route
                        path="/recovery"
                        element={<Recovery />}
                    />
                    <Route
                        path="/privacy"
                        element={<Entrance tab='privacy' />}
                    />
                </Routes>
            </Router>
        </ThemeProvider>
    );
}

export default App;
