import axios from "axios";

const CLIENT_ID = "5be8aded076246b89bf39e6e698bfd7a";
const CLIENT_SECRET = "bfebf0293e5a4fc59fc348e30afcf093";
const LOCAL_STORAGE_ACCESS_TOKEN_KEY = "spotify_2025_access_token";

const client = axios.create({
  baseURL: "https://api.spotify.com/",
  headers: {
    "Content-Type": "application/json",
  },
});

client.interceptors.request.use(
  (request) => {
    const accessToken = localStorage.getItem(LOCAL_STORAGE_ACCESS_TOKEN_KEY);
    console.log("[AuthInterceptor] Setting access token in the request: " + accessToken)
    if (accessToken) {
      request.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return request;
  },
  (error) => {
    return Promise.reject(error);
  }
);

client.interceptors.response.use(
  (response) => response, // Directly return successful responses.
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark the request as retried to avoid infinite loops.
      try {
        await Spotify.authenticate();
        // Update the authorization header with the new access token.
        const accessToken = localStorage.getItem(LOCAL_STORAGE_ACCESS_TOKEN_KEY);
        client.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${accessToken}`;
        return client(originalRequest); // Retry the original request with the new access token.
      } catch (authError) {
        // Handle refresh token errors by clearing stored tokens and redirecting to the login page.
        console.error("Automatic authentication failed:", authError);
        localStorage.removeItem(LOCAL_STORAGE_ACCESS_TOKEN_KEY);
        return Promise.reject(authError);
      }
    }
    return Promise.reject(error); // For all other errors, return the error as is.
  }
);

const Spotify = {
  async getPlaylist(id: string): Promise<SpotifyApi.PlaylistObjectFull> {
    const response = await client.get(`/v1/playlists/${id}`);
    return response.data;
  },

  async getPlaylistTracks(id: string): Promise<SpotifyApi.PlaylistTrackObject[]> {
    let result: SpotifyApi.PlaylistTrackObject[] = []
    let playlist = await this.getPlaylist(id);
    if (!playlist) return [];
    result = [...result, ...playlist.tracks.items]
    while (playlist.tracks.next) {
      const tracks: SpotifyApi.PagingObject<SpotifyApi.PlaylistTrackObject> = (await client.get(playlist.tracks.next)).data
      playlist.tracks = tracks
      result = [...result, ...playlist.tracks.items]
    }
    return result
  },

  async authenticate(): Promise<any> {
    console.log(`[OAuth2] Requesting authorization token`);
    try {
      const response = await axios.post(
        "https://accounts.spotify.com/api/token",
        new URLSearchParams({
          grant_type: "client_credentials",
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization:
              "Basic " +
              Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
          },
        }
      );
      localStorage.setItem(LOCAL_STORAGE_ACCESS_TOKEN_KEY, response.data.access_token);
      return response.data;
    } catch (error) {
      console.error("Error during authentication:", error);
      throw error;
    }
  },
};

export default Spotify;
