

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

const randomBase64Generator = () => window.btoa(uuid())

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

// check for missing values in an object
const hasMissingValues = (obj: object) => {
  const res = Object.entries(obj).filter(([, value]) => !value)

  if (res.length) {
    return res.map(([keys]) => keys)
  }
  else {
    return false
  }
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
      scope = "openid email",
      state = "SU8nskju26XowSCg3bx2LeZq7MwKcwnQ7h6vQY8twd9QJECHRKs14OwXPdpNBI58",
      redirect_uri = "https://dev-xo6vgelc.eu.auth0.com/authorize",
      endpoint = "https://dev-xo6vgelc.eu.auth0.com" ,
      clientID= "Az8HDa8YLNw0sKApZsPwsonOTMRRyXnl"
})
 * ```
 */
export async function authorize(params?: {
  scope?: string,
  state?: string,
  redirectURI?: string,
  endpoint?: string,
  clientID?: string
}) {

  try {


    const { err, data: authConfigData } = await FSBL.Clients.ConfigClient.getValue({ field: "finsemble.authentication.startup" });

    if (err) throw new Error("cannot access the config client in authentication component");



    const endpoint = params?.endpoint ?? authConfigData?.endpoint

    if (!endpoint) { return new Error(`Data provided to getToken (phase 2) is missing an endpoint URL e.g. http://AUTH_PROVIDER.com/authorize`) }



    const codeVerifier = randomBase64Generator()
    const codeChallenge = await digestHex(codeVerifier);
    const state = randomBase64Generator()

    // save the code verifier in the window session state to save for later
    saveStateAndVerifier(state, codeVerifier)


    const url = new URL(endpoint);
    const { searchParams } = url;

    const urlParams = {
      scope: params?.scope ?? authConfigData?.scope ?? "openid",
      response_type: "code",
      state,
      client_id: params?.clientID ?? authConfigData?.client_id,
      redirect_uri: params?.redirectURI ?? authConfigData?.redirect_uri,
      code_challenge: codeChallenge,
      code_challenge_method: "S256"
    }

    // if we are missing values for the data then we want to log and error
    if (hasMissingValues(urlParams)) { return new Error(`Data provided to getToken (phase 2) is missing values: ${hasMissingValues(urlParams)} `) }

    debugLog("PKCE auth phase 1 - Redirecting to login")


    // set the search params for the url using the urlParams object
    Object.entries(urlParams).forEach(([key, value]: [string, any]) => searchParams.set(key, value))

    url.search = searchParams.toString();

    // navigate to the auth endpoint with the above params
    window.location.href = url.toString()

  } catch (err) {
    errorLog(err)
    return err
  }


}


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
export async function getToken(params?: {
  clientID?: string,
  redirectURI?: string,
  endpoint?: string,
}) {

  try {
    const currentLocation = new URL(window.location.href);
    const authorizationCode = currentLocation.searchParams.get("code") ?? ""
    const stateFromLocation = currentLocation.searchParams.get("state") ?? ""
    const initialCodeVerifier = window.sessionStorage.getItem("code_verifier") ?? "";

    const { err, data: authConfigData } = await FSBL.Clients.ConfigClient.getValue({ field: "finsemble.authentication.startup" });

    if (err) throw new Error("cannot access the config client in authentication component");

    const endpoint = params?.endpoint ?? authConfigData?.endpoint

    if (!endpoint) { return new Error(`Data provided to getToken (phase 2) is missing an endpoint URL e.g. http://localhost:3375/token`) }


    const formData = {
      grant_type: "authorization_code",
      client_id: params?.clientID ?? authConfigData?.client_id,
      code_verifier: initialCodeVerifier,
      code: authorizationCode,
      redirect_uri: params?.redirectURI ?? authConfigData?.redirect_uri,
      state: stateFromLocation
    }


    // if we are missing values for the data then we want to log and error
    if (hasMissingValues(formData)) { return new Error(`Data provided to getToken (phase 2) is missing values: ${hasMissingValues(formData)} `) }

    debugLog("PKCE auth phase 2 - Access Token")

    const body = new URLSearchParams(formData).toString()

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
    endpoint: endpointURL
  }: {
    accessToken: string,
      endpoint?: string
  }) {

  const { err, data: authConfigData } = await FSBL.Clients.ConfigClient.getValue({ field: "finsemble.authentication.startup" });

  if (err) throw new Error("cannot access the config client in authentication component");


  const endpoint = endpointURL ?? authConfigData?.endpoint

  if (!endpoint) { return new Error(`Data provided to getToken (phase 2) is missing an endpoint URL e.g. http://AUTH_PROVIDER.com/userInfo`) }


  debugLog("PKCE auth phase 3 - Get User Info")

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







