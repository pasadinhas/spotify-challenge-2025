import Spotify from "./Spotify";
import SpotifyIcon from "./SpotifyIcon";
import "./SpotifyLoginButton.css";

function SpotifyLoginButton() {
  return (
    <a className="SpotifyLoginButton" href={Spotify.getAuthenticationUrl()}>
      <span className="SpotifyLoginButtonInner">
        <span className="SpotifyIcon">
          <SpotifyIcon />
        </span>
        <span>Authenticate with Spotify</span>
      </span>
    </a>
  );
}

export default SpotifyLoginButton;
