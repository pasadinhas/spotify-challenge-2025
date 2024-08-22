import axios from "axios";

const CLIENT_ID = "5be8aded076246b89bf39e6e698bfd7a";
const CLIENT_SECRET = "bfebf0293e5a4fc59fc348e30afcf093";

const client = axios.create({
  baseURL: "https://api.spotify.com/",
  headers: {
    "Content-Type": "application/json",
  },
});

client.interceptors.request.use(
  (request) => {
    const accessToken = localStorage.getItem("access_token");
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
        const accessToken = localStorage.getItem("access_token");
        client.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${accessToken}`;
        return client(originalRequest); // Retry the original request with the new access token.
      } catch (authError) {
        // Handle refresh token errors by clearing stored tokens and redirecting to the login page.
        console.error("Automatic authentication failed:", authError);
        localStorage.removeItem("access_token");
        return Promise.reject(authError);
      }
    }
    return Promise.reject(error); // For all other errors, return the error as is.
  }
);

const Spotify = {
  async getPlaylist(id: string): Promise<SpotifyApi.PlaylistBaseObject> {
    const response = await client.get(`/v1/playlists/${id}`);
    return response.data;
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
      console.log(response.data);
      localStorage.setItem("access_token", response.data.access_token);
      localStorage.setItem("refresh_token", response.data.refresh_token);
      return response.data;
    } catch (error) {
      console.error("Error during authentication:", error);
      throw error;
    }
  },
};

export default Spotify;
