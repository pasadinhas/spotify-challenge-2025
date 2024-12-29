export default function SpotifyEmbededTrack({ songId }: { songId: string | undefined }) {
  if (!songId) {
    return "<no song>"
  }
  return (
      <iframe
        className="rounded-xl"
        src={`https://open.spotify.com/embed/track/${songId.replace("spotify:track:", "")}?utm_source=generator`}
        width="100%"
        height="160"
        frameBorder="0"
        allowFullScreen={false}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      ></iframe>
  );
}