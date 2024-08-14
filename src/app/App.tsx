import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [me, setMe] = useState(null);

  useEffect(() => {
    fetch("https://api.spotify.com/v1/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
      .then((r) => r.json())
      .then((response) => setMe(response));
  }, []);

  return (
    <div className="App">
      <h1>Hello</h1>
      <p>I can see you... But you can <button style={{padding: '2px', background: '#4D1426'}} onClick={() => {
        localStorage.removeItem("access_token");
        window.location.href = window.location.href;
      }}>Log out</button></p>
      <br />
      <pre>{JSON.stringify(me, null, 2)}</pre>
    </div>
  );
}

export default App;
