import {useState, useEffect} from 'react';

import {supabase} from './supabaseClient';

export const Video = ({user}) => {
    const [videoIds, setVideoIds] = useState(null);

    useEffect(() => {
        supabase.from('video').select('id').eq('user', user.id).then(({data}) => {
            setVideoIds(data.map((video) => video.id));
        });
    }, [user])

    return (
        <>
            <h3>Your uploads</h3>
            {
                !videoIds && <p>You don't have any video uploaded.</p>
            }
            {
                videoIds &&
                videoIds.map((videoId) => (
                    <iframe
                        key={videoId}
                        title="video"
                        width="420"
                        height="315"
                        src={`https://www.youtube.com/embed/${videoId}`}
                    />
                ))
            }
        </>
    );
}