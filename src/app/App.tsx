import React, { useEffect, useState } from "react";
import "./App.css";
import { Schedule, getRules, getPlaylistIndices } from "./scheduler/Schedule";
import Spotify from "./Spotify";
import SpotifyEmbededTrack from "./SpotifyEmbededTrack";

const CALENDAR = {
  January: 31,
  February: 28,
  March: 31,
  April: 30,
  May: 31,
  June: 30,
  July: 31,
  August: 31,
  September: 30,
  October: 31,
  November: 30,
  December: 31,
} as const;

type MONTH = keyof typeof CALENDAR;

const NOW = new Date();

function App() {
  const [debugMode, setDebugMode] = useState(false);
  const [month, setMonth] = useState<MONTH>(
    () => new Date().toLocaleString("default", { month: "long" }) as MONTH
  );
  const [day, setDay] = useState(() => new Date().getDate());
  const selectedDate = new Date(
    2025,
    Object.keys(CALENDAR).indexOf(month),
    day
  );
  const isFuture = (date: Date) => !debugMode && date > NOW;
  const [playlistTracks, setPlaylistTracks] =
    useState<SpotifyApi.PlaylistTrackObject[]>();
  useEffect(() => {
    (async function () {
      setPlaylistTracks(
        await Spotify.getPlaylistTracks("2fFCa8euP1YhQX3WPmEsz7")
      );
    })();
  }, []);

  const rule = getRules(selectedDate);
  const similarRules = Schedule.filter((r) => r.rule === rule.rule);

  return (
    <div className="min-w-full min-h-full flex flex-col content-center justify-center pt-20">
      <h1 className="mb-20 text-5xl font-extrabold text-center">
        {selectedDate.toLocaleDateString("default", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </h1>
      <h2 className="mb-10 text-3xl font-bold text-center">
        {isFuture(selectedDate)
          ? "Come back on this day to see the rule"
          : rule.rule}
      </h2>
      <p className="text-center mb-10">
        {isFuture(selectedDate) ? "???" : rule.description}
      </p>
      {rule.notes && (
        <p className="text-center mb-10">
          {isFuture(selectedDate) ? "???" : rule.notes}
        </p>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 min-w-full gap-5 px-5">
        {similarRules.map((r, index) => {
          if (isFuture(r.date)) {
            return (
              <div>
                <h5 className="mb-10 text-xl font-bold text-center">???</h5>
              </div>
            );
          }
          const tracks = getPlaylistIndices(r.date).map(i => (playlistTracks || [])[i]);

          return (
            <div key={index}>
              <h5 className="mb-10 text-xl font-bold text-center">
                {r.date.toLocaleString("default", {
                  month: "long",
                  day: "numeric",
                })}
              </h5>
              <h6 className="text-lg text-center">{r.player}</h6>
              <SpotifyEmbededTrack songId={tracks[0]?.track?.uri} />
            </div>
          );
        })}
      </div>
      <div className="flex min-w-full mt-20 px-5 gap-8 justify-around">
        <select
          className="bg-white
          text-gray-900
            border
          border-gray-300
            rounded-md
            shadow-sm
            p-2
            w-2/3
            max-w-lg"
          id="month"
          value={month}
          onChange={(e) => setMonth(e.target.value as MONTH)}
        >
          {Object.keys(CALENDAR).map((month) => (
            <option key={month}>{month}</option>
          ))}
        </select>
        <select
          className="bg-white
          text-gray-900  
            border
          border-gray-300
            rounded-md
            shadow-sm
            p-2
            w-1/3
            max-w-md"
          id="day"
          value={day}
          onChange={(e) => setDay(Number(e.target.value))}
        >
          {Array(CALENDAR[month])
            .fill(0)
            .map((_, day) => (
              <option key={day}>{day + 1}</option>
            ))}
        </select>
      </div>
      <label className="mt-20 px-5 flex flex-row gap-3">
        <input
          type="checkbox"
          checked={debugMode}
          onChange={() => setDebugMode(!debugMode)}
        />
        <span className="text-white">Debug mode</span>
      </label>
    </div>
  );
}

export default App;
