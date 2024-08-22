import axios from "axios";
import { getCodeChallenge, getCodeVerifier } from "./AuthenticationUtils";

const client = axios.create({
  baseURL: "https://api.spotify.com/",
  headers: {
    "Content-Type": "application/json",
  },
});

client.interceptors.request.use(
  (request) => {
    const accessToken = localStorage.getItem("access_token");
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
        await Spotify.refreshToken();
        // Update the authorization header with the new access token.
        const accessToken = localStorage.getItem("access_token");
        client.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        return client(originalRequest); // Retry the original request with the new access token.
      } catch (refreshError) {
        // Handle refresh token errors by clearing stored tokens and redirecting to the login page.
        console.error("Token refresh failed:", refreshError);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = Spotify.getAuthenticationUrl();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error); // For all other errors, return the error as is.
  }
);

const Spotify = {
  AuthorizationUrl: "https://accounts.spotify.com/authorize",
  TokenUrl: "https://accounts.spotify.com/api/token",
  ClientId: "5be8aded076246b89bf39e6e698bfd7a",
  RedirectUrl: "http://localhost:3000",
  Scopes: "user-read-email",

  async getCurrentUser(
    tryRefreshToken: boolean = true
  ): Promise<SpotifyApi.CurrentUsersProfileResponse> {
    try {
      const response = await axios.get("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      return response.data;
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 401 &&
        tryRefreshToken
      ) {
        await this.refreshToken();
        return this.getCurrentUser(false);
      }
      throw error;
    }
  },

  async refreshToken(): Promise<void> {
    // refresh token that has been previously stored
    const refreshToken = localStorage.getItem("refresh_token");

    if (refreshToken == null) {
      throw new Error(
        "Cannot refresh the access token without a refresh token"
      );
    }

    try {
      const response = await axios.post(
        Spotify.TokenUrl,
        new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          client_id: Spotify.ClientId,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      localStorage.setItem("access_token", response.data.access_token);
      if (response.data.refresh_token) {
        localStorage.setItem("refresh_token", response.data.refresh_token);
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      throw error;
    }
  },

  async authenticate(code: string): Promise<any> {
    console.log(`[OAuth2] Requesting authorization token using code: ${code}`);
    let codeVerifier = localStorage.getItem("code_verifier");

    if (codeVerifier == null) {
      throw new Error("Code verifier is null: authentication flow failed.");
    }

    try {
      const response = await axios.post(
        Spotify.TokenUrl,
        new URLSearchParams({
          client_id: Spotify.ClientId,
          grant_type: "authorization_code",
          code: code,
          redirect_uri: Spotify.RedirectUrl,
          code_verifier: codeVerifier,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
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

  getAuthenticationUrl() {
    window.localStorage.setItem("code_verifier", getCodeVerifier());

    const authUrl = new URL(Spotify.AuthorizationUrl);

    const params = {
      response_type: "code",
      client_id: Spotify.ClientId,
      scope: Spotify.Scopes,
      code_challenge_method: "S256",
      code_challenge: getCodeChallenge(),
      redirect_uri: Spotify.RedirectUrl,
    };

    authUrl.search = new URLSearchParams(params).toString();

    return authUrl.toString();
  },
};

export default Spotify;
