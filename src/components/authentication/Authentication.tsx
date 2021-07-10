/*!
 * Copyright 2020 by ChartIQ, Inc.
 * All rights reserved.
 *
 * This is a sample Finsemble Authentication Component written using React hooks. It is meant as a starting point
 * for you to build your own Authentication Component. Use the `useAuth()` react hook, or the Finsemble client API
 * to interact with Finsemble's authentication capabilities.
 *
 * See https://documentation.finsemble.com/tutorial-Authentication.html for a tutorial on how to use authentication.
 */

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { FinsembleProvider } from "@finsemble/finsemble-ui/react/components/FinsembleProvider";
import { useAuth, useAuthSimulator } from "@finsemble/finsemble-ui/react/hooks";
import { authorizationCode, authorize, getToken, getUserInfo } from './oAuthPKCE'
import "@finsemble/finsemble-ui/react/assets/css/finsemble.css";
import "@finsemble/finsemble-ui/react/assets/css/dialogs.css";
import "@finsemble/finsemble-ui/react/assets/css/authentication.css";
import "../../../assets/css/theme.css";



const { log: finsembleLog, error: finsembleError } = FSBL.Clients.Logger

const log = (item: any) => {
	finsembleLog(item)
	console.log(item)
}

const error = (error: any) => {
	finsembleError(error)
	console.error(error)
}

export const Authentication = () => {
	// Make sure this dialog shows on top of the splash screen
	useEffect(() => FSBL.Clients.WindowClient.bringWindowToFront(), []);

	const { quitApplication, publishAuthorization } = useAuth();
	const [authURL, setAuthURL] = useState('')


	useEffect(() => {


		const authenticate = async () => {

			try {

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

				function uuid() {
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

				/* main code */

				const currentLocation = new URL(window.location.href);
				const authorizationCode = currentLocation.searchParams.get("code");
				const CLIENT_ID = "Az8HDa8YLNw0sKApZsPwsonOTMRRyXnl"
				const REDIRECT_URL = `${window.location.origin}/authentication/Authentication.html`
				const ENDPOINT = "https://dev-xo6vgelc.eu.auth0.com"

				// this should be a randomly generated string
				let CODE_VERIFIER

				if (!authorizationCode) {

					const state = "SU8nskju26XowSCg3bx2LeZq7MwKcwnQ7h6vQY8twd9QJECHRKs14OwXPdpNBI58"

					CODE_VERIFIER = createCodeVerifier()
					saveStateAndVerifier(state, CODE_VERIFIER)

					log(CODE_VERIFIER)

					const codeChallenge = await digestHex(CODE_VERIFIER);
					const scopes = "openid email"


					const authURL = `${ENDPOINT}/authorize?
					scope=${scopes}&
					response_type=code&
					state=${state}&
					client_id=${CLIENT_ID}&
					redirect_uri=${REDIRECT_URL}&
					code_challenge=${codeChallenge}&
					code_challenge_method=S256`

					setAuthURL(authURL)

					window.location.href = authURL


				} else {

					const AUTHORIZATION_CODE = currentLocation.searchParams.get("code")
					const initialCodeVerifier = window.sessionStorage.getItem("code_verifier");

					log(initialCodeVerifier)
					log(AUTHORIZATION_CODE)


					const data = {
						grant_type: "authorization_code",
						client_id: CLIENT_ID,
						code_verifier: initialCodeVerifier,
						code: AUTHORIZATION_CODE,
						redirect_uri: REDIRECT_URL,
					}


					const result = await fetch(`${ENDPOINT}/oauth/token`,
						{
							mode: "cors",
							method: 'POST',
							headers: {
								'Content-type': 'application/json'
							},
							body: JSON.stringify(data)
						})

					type token = { access_token: string, id_token: string, scope: string, expires_in: number, token_type: string }


					const token: token = await result.json()

					log(token)


					const getUserInfo = await fetch(`${ENDPOINT}/userinfo`, {
						"method": "GET",
						"headers": {
							"Authorization": `Bearer ${token.access_token}`,
							"Content-Type": "application/json"
						}
					})

					const userInfo = await getUserInfo.json()

					const username = userInfo.email

						/**
				 * This is the most important step. Once your back end server has authenticated the user
				 * call publishAuthorization() from the useAuth() hook. The first parameter (username) is
				 * required. The second parameter (credentials) is option. Credentials can contain anything
				 * that is useful for session management, such as user ID, tokens, etc.
				 */
					publishAuthorization(username, { token, CLIENT_ID });

				}
			} catch (err) {
				error(err)
			}

		};

		authenticate();
	}, []);



	/**
	 * What follows is a cookie-cutter form written in React Hooks style. There is nothing here that
	 * is proprietary to Finsemble. Your form should be built as needed to support your login process.
	 * CSS Styles are imported from "Authentication.css" (see imports above).
	 */
	return (
		<>
			<div className="fsbl-auth-top">
				<img className="fsbl-company-logo" />
				<div className="fsbl-close">
					<i className="ff-close" onClick={quitApplication}></i>
				</div>
				{authURL.length && <a href={authURL}>Login</a>}
			</div>


		</>
	);
};

ReactDOM.render(
	<FinsembleProvider>
		<Authentication />
	</FinsembleProvider>,
	document.getElementById("Authentication-tsx")
);
