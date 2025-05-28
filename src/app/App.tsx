import React, { useEffect, useState } from "react";
import Schedule from "./scheduler/Schedule";
import Spotify from "./Spotify";
import Time from "./scheduler/Time";
import DatePicker from "./components/DatePicker";
import RulePicker from "./components/RulePicker";
import SelectedRule from "./components/SelectedRule";
import Tracks from "./components/Tracks";
import { IS_DEV_ENV } from "./helpers";

// Use the 2024 playlist for dev
const PLAYLIST_ID = IS_DEV_ENV ? "2fFCa8euP1YhQX3WPmEsz7" : "0E0dbVRdTkUO8sqdxGgFsU";

function App() {
  const [debugMode, setDebugMode] = useState(false);

  const [playlistTracks, setPlaylistTracks] =
    useState<SpotifyApi.PlaylistTrackObject[]>();
  useEffect(() => {
    (async function () {
      setPlaylistTracks(
        await Spotify.getPlaylistTracks(PLAYLIST_ID)
      );
    })();
  }, []);

  const [month, setMonth] = useState(() => new Date().getMonth());
  const [day, setDay] = useState(() => new Date().getDate());
  const scheduledDay = Schedule.on(new Date(2025, month, day));

  return (
    <div className="min-w-full min-h-full flex flex-col content-center justify-center pt-20">
      <SelectedRule scheduledDay={scheduledDay} />
      <Tracks scheduledDay={scheduledDay} playlistTracks={playlistTracks} />
      <DatePicker day={day} setDay={setDay} month={month} setMonth={setMonth} />
      <RulePicker setDay={setDay} setMonth={setMonth} />

      {IS_DEV_ENV && (
        <label className="mt-20 px-5 flex flex-row gap-3">
          <input
            type="checkbox"
            checked={debugMode}
            onChange={() => {
              Time.debugMode = !debugMode;
              setDebugMode(!debugMode);
            }}
          />
          <span className="text-white">Debug mode</span>
        </label>
      )}
    </div>
  );
}

export default App;
