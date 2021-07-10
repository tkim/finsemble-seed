

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





const currentLocation = new URL(window.location.href);
export const authorizationCode = currentLocation.searchParams.get("code");


/*
=====
Change the variables below to match your URLS & credentials
======
*/
const clientID = "Az8HDa8YLNw0sKApZsPwsonOTMRRyXnl"

// using window.location.origin means that we do not have to change the origin url per environment
const redirectURL = `${window.location.origin}/authentication/Authentication.html`

const authorizationEndpoint = "https://dev-xo6vgelc.eu.auth0.com/authorize"
const tokenEndpoint = "https://dev-xo6vgelc.eu.auth0.com/auth/token"
const userInfoEndpoint = "https://dev-xo6vgelc.eu.auth0.com/userinfo"


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
  redirectURI: redirect_uri,
  endpoint,
  clientID
}: {
  scopes: string,
  state?: string,
  redirectURI: string,
  endpoint: string,
  clientID: string
}) {

  const codeVerifier = createCodeVerifier()

  // save the code verifier in the window session state to save for later
  saveStateAndVerifier(state, codeVerifier)

  const codeChallenge = await digestHex(codeVerifier);


  const authURL = `${endpoint}?
      scope=${scopes}&
      response_type=code&
      state=${state}&
      client_id=${clientID}&
      redirect_uri=${redirect_uri}&
      code_challenge=${codeChallenge}&
      code_challenge_method=S256`

  // navigate to the auth endpoint with the above params
  window.location.href = authURL
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
  clientID: client_id,
  redirectURI: redirect_uri,
  endpoint,
}: {
  clientID: string,
  redirectURI: string,
  endpoint: string,
}) {

  const authorizationCode = currentLocation.searchParams.get("code")
  const initialCodeVerifier = window.sessionStorage.getItem("code_verifier");


  const data = {
    grant_type: "authorization_code",
    client_id,
    code_verifier: initialCodeVerifier,
    code: authorizationCode,
    redirect_uri,
  }


  const result = await fetch(`${endpoint}`,
    {
      mode: "cors",
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify(data)
    })

  //  if the token returns different data please change this type to reflect
  type token = { access_token: string, id_token: string, scope: string, expires_in: number, token_type: string }

  const token: token = await result.json()

  return token
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
    endoint
  }: {
    accessToken: string,
    endoint: string
  }) {
  const getUserInfo = await fetch(`${endoint}`, {
    "method": "GET",
    "headers": {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    }
  })

  const userInfo = await getUserInfo.json()

  return userInfo
}







