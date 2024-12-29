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
      <Track date="???" player="???" />,
      <Track date="???" player="???" />,
      <Track date="???" player="???" />,
    ];
  } else if (scheduledDay.sharedDay) {
    tracks = [
      <Track date={formatDate(scheduledDay.date)} player={Player1} songId={songId(playlistTracks, scheduledDay.playlistIndices[0])} />,
      <Track date={formatDate(scheduledDay.date)} player={Player2} songId={songId(playlistTracks, scheduledDay.playlistIndices[1])} />,
      <Track date={formatDate(scheduledDay.date)} player={Player3} songId={songId(playlistTracks, scheduledDay.playlistIndices[2])} />,
    ];
  } else {
    tracks = [
      <Track date={formatDate(scheduledDay.allRules[0].date)} player={scheduledDay.allRules[0].player} songId={songId(playlistTracks, scheduledDay.playlistIndices[0])}/>,
      <Track date={formatDate(scheduledDay.allRules[1].date)} player={scheduledDay.allRules[1].player} songId={songId(playlistTracks, scheduledDay.playlistIndices[1])} />,
      <Track date={formatDate(scheduledDay.allRules[2].date)} player={scheduledDay.allRules[2].player} songId={songId(playlistTracks, scheduledDay.playlistIndices[2])} />,
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
