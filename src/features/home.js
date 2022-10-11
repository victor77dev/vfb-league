import {Filter} from '../components/filter';
import {TeamFilter} from '../components/teamFilter';

import {Matches} from './matches';

export const Home = ({team, matches, setFilteredTeam}) => {
    return (
        <>
            <div>
                <a href="https://bvbb-badminton.liga.nu/cgi-bin/WebObjects/nuLigaBADDE.woa/wa/clubMeetings?club=18281"><b>Official site for match schedule</b></a>
            </div>
            <Filter>
                <TeamFilter team={team} setFilteredTeam={setFilteredTeam} />
            </Filter>
            <Matches id="home" matches={matches?.filter((match) => team[match.team - 1])}/>
        </>
    );
}
