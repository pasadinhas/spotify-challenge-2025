import SpotifyEmbededTrack from "../SpotifyEmbededTrack";

interface TrackProps {
  date: string;
  player: string;
  songId?: string | undefined;
}

export default function Track({ date, player, songId }: TrackProps) {
  return (
    <div key={player}>
      <h5 className="text-xl font-bold text-center">{date}</h5>
      <h6 className="text-lg text-center mb-5">{player}</h6>
      {songId && <SpotifyEmbededTrack songId={songId} />}
    </div>
  );
}
