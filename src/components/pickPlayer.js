import {useState, useEffect} from 'react';

import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';

import {supabase} from '../features/supabaseClient';

const roles = {
    ws: "Women's Single (DE)",
    wd: "Women's Double (DD)",
    xd: "Mixed Double (GD)",
    md1: "Men's Double 1 (HD 1)",
    md2: "Men's Double 2 (HD 2)",
    ms1: "Men's Single 1 (HE 1)",
    ms2: "Men's Single 2 (HE 2)",
    ms3: "Men's Single 3 (HE 3)",
};

const selectRoles = async ({player, match, roles}) => {
    const {data: oldPlayers} = await supabase.from('matches')
        .select('players').eq('id', match);

    const {data} = await supabase.from('matches')
        .update({
            players: {...oldPlayers?.[0].players, [player]: roles},
        }).eq('id', match).select();

    return data?.[0]?.players;
}

const SelectedButton = ({selectPlayer, selected, isCaptain, nonEdit}) => {
    const [value, setValue] = useState(selected);

    useEffect(() => {
        setValue(selected);
    }, [selected]);

    if (!isCaptain || nonEdit) {
        if (value)
            return <p>✅</p>
        else
            return null;
    }

    return (
        <>
            <Button
                onClick={() => {selectPlayer(!selected)}}
                variant={value ? 'success': 'primary'}
            >
                {value ? '✅': 'Select'}
            </Button>
        </>
    );
}

const getRank = (players, playerInfo) => {
    const result = {};

    Object.keys(roles).forEach((key) => {
        const allPlayers = Object.keys(players)
            .filter((player) =>
                players[player]?.[
                    Object.keys(players[player])
                    .find((role) => role === key)
                ]
            );
        
        const sum = allPlayers
            .reduce((sum, value) => {
                if (
                    key === 'ws' ||
                    key === 'ms1' ||
                    key === 'ms2' ||
                    key === 'ms3'
                ) {
                    return sum + playerInfo
                        .find((player) => value === player.id)
                        .single;
                } else {
                    return sum + playerInfo
                        .find((player) => value === player.id)
                        .double;
                }
                } , 0);

        result[key] = {};
        result[key].value = sum;
        if (key === 'md1' || key === 'md2') {
            const player1 = playerInfo
                    .find((player) => allPlayers?.[0] === player.id)
                    ?.double;
            const player2 = playerInfo
                    .find((player) => allPlayers?.[1] === player.id)
                    ?.double;
            result[key].min = Math.min(player1, player2);
        }
    });

    if (result['ms1'].value > result['ms2'].value) {
        result['ms1'].error = true;
        result['ms2'].error = true;
    }

    if (result['ms2'].value > result['ms3'].value) {
        result['ms2'].error = true;
        result['ms3'].error = true;
    }

    if (result['md1'].value > result['md2'].value) {
        result['md1'].error = true;
        result['md2'].error = true;
    } else if (
        result['md1'].value === result['md2'].value &&
        result['md1'].min > result['md2'].min
    ) {
        result['md1'].error = true;
        result['md2'].error = true;
    }

    return result;
}

const RankRow = ({players, playerInfo}) => {
    const ranks = getRank(players, playerInfo);

    const red = {backgroundColor: 'red'};

    return (
        <tr>
            <td colSpan={3}><b>Rank</b></td>
            {
                Object.keys(roles).map((key) => {
                    return <td
                        style={ranks[key].error ? red: null}
                        key={`sum-${key}`}
                    >
                        {ranks[key].value}
                    </td>
                })
            }
        </tr>
    );
}

const Row = ({match, player, setMatch, isCaptain, nonEdit}) => {
    const array = [
        player.name, player.single, player.double,
    ];

    const playerRoles = match?.players?.[player.id];

    const selectPlayer = async (key, value) => {
        const updatedMatch = await selectRoles({
            player: player.id,
            match: match.id,
            roles: {...playerRoles, [key]: value},
        })

        setMatch({
            ...match,
            players: updatedMatch,
        });
    }

    return (
        <>
            <tr key={player.id} >
                {
                    array.map((value, index) => {
                        return <td key={`${player.id}-${index}`}>{value}</td>;
                    })
                }
                {
                    Object.keys(roles).map((key) => {
                        const selected = playerRoles?.[key];

                        return (
                            <td
                                key={`${player.id}-${key}`}
                            >
                                <SelectedButton
                                    role={key}
                                    selectPlayer={selectPlayer.bind(null, key)}
                                    selected={selected}
                                    isCaptain={isCaptain}
                                    nonEdit={nonEdit}
                                />
                            </td>
                        );
                    })
                }
            </tr>
        </>
    );
};

export const PickPlayer = ({match: orignalMatch, players, isCaptain}) => {
    const [selectedPlayers, setSelectedPlayers] = useState([]);
    const [match, setMatch] = useState(orignalMatch);
    const [nonEdit, setNonEdit] = useState(false);

    useEffect(() => {
        if (players && players.length > 0) {
            setSelectedPlayers(Object.keys(match.players)?.map(
                (key) => players?.find((player) => player.id === key)
            ));
        }
    }, [players, match])

    const columnSpan = 3 + Object.keys(roles).length;

    const female = selectedPlayers?.filter((a) => (a.gender === 'F'));
    const male = selectedPlayers?.filter((a) => (a.gender === 'M'));

    return (
        <>
        <Button
            onClick={() => {setNonEdit(!nonEdit)}}
        >
            {nonEdit ? 'Edit': 'View'}
        </Button>
        <Table bordered responsive hover>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Single rank</th>
                    <th>Double rank</th>
                    {
                        Object.keys(roles).map((key) => (
                            <th key={key}>{roles[key]}</th>
                        ))
                    }
                </tr>
            </thead>
            <tbody>
                <tr><td colSpan={columnSpan}><b>Female</b></td></tr>
                {
                    female?.sort((a, b) => (a.single > b.single ? 1 : -1))
                        .map((player) => {
                            return (
                                <Row
                                    key={`row-${player.id}`}
                                    player={player}
                                    match={match}
                                    setMatch={setMatch}
                                    nonEdit={nonEdit}
                                    isCaptain={isCaptain}
                                />
                            );
                        })
                }
                <tr><td colSpan={columnSpan}><b>Male</b></td></tr>
                {
                    male?.sort((a, b) => (a.single > b.single ? 1 : -1))
                        .map((player) => {
                            return (
                                <Row
                                    key={`row-${player.id}`}
                                    player={player}
                                    match={match}
                                    setMatch={setMatch}
                                    nonEdit={nonEdit}
                                    isCaptain={isCaptain}
                                />
                            );
                        })
                }
                {
                    selectedPlayers.length > 0 &&
                        <RankRow players={match?.players} playerInfo={selectedPlayers}/>
                }
            </tbody>
        </Table>
        </>
    );
}