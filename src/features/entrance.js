import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import {Home} from './home';

export const Entrance = () => {
  return (
    <Tabs
      defaultActiveKey="profile"
      id="uncontrolled-tab-example"
      className="mb-3"
      fill
    >
      <Tab eventKey="home" title="Home">
        <Home />
      </Tab>
      <Tab eventKey="profile" title="Profile">
        <Home />
      </Tab>
      <Tab eventKey="contact" title="Contact" disabled>
        <Home />
      </Tab>
    </Tabs>
  );
}
