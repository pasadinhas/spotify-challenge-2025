import { Player1, Player2, Player3 } from "../scheduler/Players";
import Time from "../scheduler/Time";
import { ScheduleDay } from "../scheduler/types";
import Track from "./Track";

interface TracksProps {
  scheduledDay: ScheduleDay;
  playlistTracks: SpotifyApi.PlaylistTrackObject[] | undefined;
}

export default function Tracks({ scheduledDay, playlistTracks }: TracksProps) {
  let tracks = [];
  if (Time.isFuture(scheduledDay.date)) {
    tracks = [
      <Track key={"track-1"} date="???" player="???" />,
      <Track key={"track-2"}  date="???" player="???" />,
      <Track key={"track-3"}  date="???" player="???" />,
    ];
  } else if (scheduledDay.sharedDay) {
    tracks = [
      <Track key={"track-1"}  date={formatDate(scheduledDay.date)} player={Player1} songId={songId(playlistTracks, scheduledDay.playlistIndices[0])} />,
      <Track key={"track-2"}  date={formatDate(scheduledDay.date)} player={Player2} songId={songId(playlistTracks, scheduledDay.playlistIndices[1])} />,
      <Track key={"track-3"}  date={formatDate(scheduledDay.date)} player={Player3} songId={songId(playlistTracks, scheduledDay.playlistIndices[2])} />,
    ];
  } else {
    const isTrack1Future = Time.isFuture(scheduledDay.allRules[0].date);
    const isTrack2Future = Time.isFuture(scheduledDay.allRules[1].date);
    const isTrack3Future = Time.isFuture(scheduledDay.allRules[2].date);

    tracks = [
      <Track key={"track-1"}  date={isTrack1Future ? "???" : formatDate(scheduledDay.allRules[0].date)} player={scheduledDay.allRules[0].player} songId={songId(playlistTracks, scheduledDay.playlistIndices[0])}/>,
      <Track key={"track-2"}  date={isTrack2Future ? "???" : formatDate(scheduledDay.allRules[1].date)} player={scheduledDay.allRules[1].player} songId={songId(playlistTracks, scheduledDay.playlistIndices[1])} />,
      <Track key={"track-3"}  date={isTrack3Future ? "???" : formatDate(scheduledDay.allRules[2].date)} player={scheduledDay.allRules[2].player} songId={songId(playlistTracks, scheduledDay.playlistIndices[2])} />,
    ];
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 min-w-full gap-5 px-5 pt-20 pb-5">
      {tracks}
    </div>
  );
}

function songId(playlistTracks: SpotifyApi.PlaylistTrackObject[] | undefined, index: number) {
  return (playlistTracks || [])[index]?.track?.uri
}

function formatDate(date: Date) {
  return date.toLocaleString("default", {
    month: "long",
    day: "numeric",
  });
}
