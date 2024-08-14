import React, { useEffect, useState } from "react";
import { AuthenticationRequired, CheckingAuthStatus } from "./LoadingPages";
import { requestAuthorizationToken } from "./spotify/Authentication";

enum AuthenticationState {
  CHECKING_AUTH_STATUS,
  AUTHENTICATION_REQUIRED,
  AUTHENTICATED,
}

type Props = {
  children: JSX.Element
}

function Authentication({children}: Props): JSX.Element {
  const [loadingState, setLoadingState] = useState(
    AuthenticationState.CHECKING_AUTH_STATUS
  );

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken != null) {
      setLoadingState(AuthenticationState.AUTHENTICATED);
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    console.log(`[App Start] URL Paramters: `, urlParams)

    let code = urlParams.get("code");
    if (code != null) {
        requestAuthorizationToken(code).then(response => {
          window.history.replaceState({}, document.title, window.location.pathname); // remove the query parameters from the URL
          setLoadingState(AuthenticationState.AUTHENTICATED)
        })
        return;
    }

    if (accessToken == null) {
      setLoadingState(AuthenticationState.AUTHENTICATION_REQUIRED);
      return;
    }
  }, []);

  switch (loadingState) {
    case AuthenticationState.CHECKING_AUTH_STATUS:
      return <CheckingAuthStatus />;
    case AuthenticationState.AUTHENTICATION_REQUIRED:
      return <AuthenticationRequired />;
  }

  return children;
}

export default Authentication;
