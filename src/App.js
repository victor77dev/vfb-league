import ThemeProvider from 'react-bootstrap/ThemeProvider'

import 'bootstrap/dist/css/bootstrap.min.css';

import {Entrance} from './features/entrance';

function App() {
  return (
    <ThemeProvider
      breakpoints={['xxxl', 'xxl', 'xl', 'lg', 'md', 'sm', 'xs', 'xxs']}
      minBreakpoint="xxs"
    >
      <Entrance />
    </ThemeProvider>
  );
}

export default App;
