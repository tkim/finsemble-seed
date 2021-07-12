

/* Helper functions */

async function digestHex(message: string) {
  // encode as (utf-8) Uint8Array
  const msgUint8 = new TextEncoder().encode(message);
  // create the hash buffer array
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  // make uint array for the buffer
  let uintArr = new Uint8Array(hashBuffer);
  // create new uint binary string by destructuring the array
  let uintString = String.fromCharCode(...uintArr)
  // convert binary string to Base64
  const binaryString = window.btoa(uintString)
  // the string can only contain unreserved characters ( [A-Z] / [a-z] / [0–9] / “-” / “.” / “_” / “~" ) with length between 43 and 128 characters
  return binaryString
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function uuid(): string {
  // @ts-ignore
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, function (c: number) {
    return (c ^ window.crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  })
}

const createCodeVerifier = () => window.btoa(uuid())

function saveStateAndVerifier(state: string, codeVerifier: string) {
  /*
  Don't overwrite our saved state if location has the state parameter.
  This means we got authorization from the AS, and we need to compare them later.
 */
  if (window.location.search.includes("state")) return;
  const storage = window.sessionStorage;
  storage.clear();
  storage.setItem("state", state);
  storage.setItem("code_verifier", codeVerifier);
}

/* end helper functions */


/**
 * Logging helpers
 */
const finsembleLogger = FSBL.Clients.Logger

const log = (...item: any) => {
  finsembleLogger.log(item)
  console.log(item)
}

const errorLog = (...error: any) => {
  finsembleLogger.error(error)
  console.error(error)
}

const debugLog = (...item: any) => {
  finsembleLogger.debug(item)
  console.debug(item)
}

/**
 * we generate the URL and navigate the page to the authenication endpoint.
 * Once the authentication has been completed redirect to this page.
 *
 * @example
 * ```javascript
 * authorize({
      scopes = "openid email",
      state = "SU8nskju26XowSCg3bx2LeZq7MwKcwnQ7h6vQY8twd9QJECHRKs14OwXPdpNBI58",
      redirect_uri = "https://dev-xo6vgelc.eu.auth0.com/authorize",
      endpoint = "https://dev-xo6vgelc.eu.auth0.com" ,
      clientID= "Az8HDa8YLNw0sKApZsPwsonOTMRRyXnl"
})
 * ```
 */
export async function authorize({
  scopes = "openid email",
  state = "SU8nskju26XowSCg3bx2LeZq7MwKcwnQ7h6vQY8twd9QJECHRKs14OwXPdpNBI58",
  redirectURI,
  endpoint,
  clientID
}: {
    scopes?: string,
  state?: string,
    redirectURI?: string,
  endpoint: string,
    clientID?: string
}) {

  try {


    const { err, data: authConfigData } = await FSBL.Clients.ConfigClient.getValue({ field: "finsemble.authentication.startup" });

    if (err) throw new Error("cannot access the config client in authentication component");

    // get client_id and redirect_uri from either the params or from the config, if we can't find either then throw an error

    const client_id = clientID ?? authConfigData?.client_id
    const redirect_uri = redirectURI ?? authConfigData?.redirect_uri

    if (!redirect_uri || !client_id) return new Error("redirect_uri or client_id is missing or empty")

    log(client_id, redirect_uri)

    const codeVerifier = createCodeVerifier()

    // save the code verifier in the window session state to save for later
    saveStateAndVerifier(state, codeVerifier)

    const codeChallenge = await digestHex(codeVerifier);

    const url = new URL(endpoint);
    const { searchParams } = url;

    const urlParams = {
      scope: scopes,
      response_type: "code",
      state,
      client_id,
      redirect_uri,
      code_challenge: codeChallenge,
      code_challenge_method: "S256"
    }


    Object.entries(urlParams).forEach(([key, value]: [string, any]) => {
      console.log(key, value)
      searchParams.set(key, value)
    })

    url.search = searchParams.toString();

    log(url)

    debugLog("PKCE auth phase 1")


    // navigate to the auth endpoint with the above params
    window.location.href = url.toString()

  } catch (err) {
    errorLog(err)
    return err
  }


}


// /oauth/token

/**
 * Get the token after authorization - the main difference between authorization and token is the endpoint URL.
 *
 * _Note:_ Return data will be specific to your endpoint and may be different from the example below.
 * @example
 * ```javascript
   const token =  await getToken({
                                  clientID= "Az8HDa8YLNw0sKApZsPwsonOTMRRyXnl"
                                  redirect_uri = "https://dev-xo6vgelc.eu.auth0.com/oauth/token",
                                  endpoint = "https://dev-xo6vgelc.eu.auth0.com" ,
                                });

  const accessToken = token.access_token;
 * ```
 */
export async function getToken({
  clientID,
  redirectURI,
  endpoint,
}: {
    clientID?: string,
    redirectURI?: string,
  endpoint: string,
}) {

  try {
    const currentLocation = new URL(window.location.href);
    const authorizationCode = currentLocation.searchParams.get("code")
    const stateFromLocation = currentLocation.searchParams.get("state");
    const initialCodeVerifier = window.sessionStorage.getItem("code_verifier");

    const { err, data: authConfigData } = await FSBL.Clients.ConfigClient.getValue({ field: "finsemble.authentication.startup" });

    if (err) throw new Error("cannot access the config client in authentication component");

    // get client_id and redirect_uri from either the params or from the config, if we can't find either then throw an error

    const client_id = clientID ?? authConfigData?.client_id
    const redirect_uri = redirectURI ?? authConfigData?.redirect_uri

    if (!redirect_uri || !client_id || !initialCodeVerifier || !authorizationCode || !stateFromLocation) return new Error("one of the data sending valies is missing or empty")
    // TODO:make better error message


    const data: {
      grant_type: string,
      client_id: string,
      code_verifier: string,
      code: string,
      redirect_uri: string,
      state: string
    } = {
      grant_type: "authorization_code",
      client_id,
      code_verifier: initialCodeVerifier,
      code: authorizationCode,
      redirect_uri,
      state: stateFromLocation
    }

    log(data)

    debugLog("PKCE auth phase 2")

    const body = new URLSearchParams(data).toString()

    const result = await fetch(endpoint,
      {
        mode: "cors",
        method: 'POST',
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json"
        },
        body
      })
    // const result = await fetch(endpoint,
    //   {
    //     mode: "cors",
    //     cache: "no-cache",
    //     credentials: "same-origin",
    //     method: 'POST',
    //     headers: {
    //       'Content-type': 'application/json'
    //     },
    //     body: JSON.stringify(data)
    //   })

    //  if the token returns different data please change this type to reflect
    type token = { access_token: string, id_token: string, scope: string, expires_in: number, token_type: string }

    const token: token = await result.json()

    return token

  } catch (err) {
    errorLog(err);
    return err
  }

}


/**
 * Using the access token get the userInformation via your user endpoint.
 *
 * _Note:_ Return data will be specific to your endpoint and may be different from the example below.
 *
 * @example
 * ```javascript
 * const userData = await getUserInfo({ accessToken: "YOUR_ACCESS_TOKEN",
                                        endpoint: "https://dev-xo6vgelc.eu.auth0.com/userinfo"})
   const email = userData.email
 * ```
 */
export async function getUserInfo(
  {
    accessToken,
    endpoint
  }: {
    accessToken: string,
      endpoint: string
  }) {
  debugLog("PKCE auth phase 3")

  const getUserInfo = await fetch(endpoint, {
    "method": "GET",
    "headers": {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    }
  })

  const userInfo = await getUserInfo.json()

  return userInfo
}







