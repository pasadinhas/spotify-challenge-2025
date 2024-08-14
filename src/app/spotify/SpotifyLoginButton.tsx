import SpotifyIcon from "./SpotifyIcon";
import "./SpotifyLoginButton.css";
import { generateAuthenticationUrl } from "./Authentication";

function SpotifyLoginButton() {
  return (
    <a className="SpotifyLoginButton" href={generateAuthenticationUrl()}>
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
