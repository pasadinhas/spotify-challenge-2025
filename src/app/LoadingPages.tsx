import SpotifyLoginButton from "./spotify/SpotifyLoginButton"
import './LoadingPages.css'

function CheckingAuthStatus() {
    return <div className="AppLoading">
        Checking your Authentication with Spotify.
    </div>
}

function AuthenticationRequired() {
    return <div className="AppAuthenticationWall">
        <h1>Spotify Challenge 2025</h1>
        <p>We require access to Spotify in order to present the playlist and know who you are.</p>
        <br/>
        <SpotifyLoginButton />
    </div>
}

export {
    AuthenticationRequired,
    CheckingAuthStatus,
}