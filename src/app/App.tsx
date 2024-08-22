import React, { useEffect, useState } from "react";
import "./App.css";
import Spotify from "./Spotify";

function App() {
  const [playlist, setPlaylist] =
    useState<SpotifyApi.PlaylistBaseObject | null>(null);

  useEffect(() => {
    Spotify.getPlaylist("2fFCa8euP1YhQX3WPmEsz7").then((response) =>
      setPlaylist(response)
    );
  }, []);

  return (
    <div className="App">
      <h1>Hello</h1>
      <br />
      <pre>{JSON.stringify(playlist, null, 2)}</pre>
    </div>
  );
}

export default App;
