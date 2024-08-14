const AUTHORIZATION_URL = "https://accounts.spotify.com/authorize";
const TOKEN_URL = "https://accounts.spotify.com/api/token";
const CLIENT_ID = "5be8aded076246b89bf39e6e698bfd7a";
const REDIRECT_URL = "http://localhost:3000";
const SCOPES = "user-read-email";

function generateRandomString(length: number) {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

async function sha256(plain: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest("SHA-256", data);
}

function base64encode(input: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

const codeVerifier = generateRandomString(64);

const hashed = await sha256(codeVerifier);
const codeChallenge = base64encode(hashed);

function generateAuthenticationUrl() {
  window.localStorage.setItem("code_verifier", codeVerifier);

  const authUrl = new URL(AUTHORIZATION_URL);

  const params = {
    response_type: "code",
    client_id: CLIENT_ID,
    scope: SCOPES,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
    redirect_uri: REDIRECT_URL,
  };

  authUrl.search = new URLSearchParams(params).toString();

  return authUrl.toString();
}

function requestAuthorizationToken(code: string) {
  console.log(`[OAuth2] Requesting authorization token using code: ${code}`)
  let codeVerifier = localStorage.getItem('code_verifier');

  if (codeVerifier == null) {
    throw new Error("Code verifier is null: authentication flow failed.")
  }
      
  const payload = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URL,
      code_verifier: codeVerifier,
    }),
  }
  
  return fetch(TOKEN_URL, payload)
    .then(body => body.json())
    .then(response => {
      console.log(response);
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      return response;
    })
}

export { codeVerifier, codeChallenge, generateAuthenticationUrl, requestAuthorizationToken };
