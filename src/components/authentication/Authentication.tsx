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
import { authorize, getToken, getUserInfo } from './oAuthPKCE'
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





	useEffect(() => {


		const authenticate = async () => {
			/*
=====
Change the variables below to match your URLS & credentials for oAuthPKCE
======
*/

			// const authorizationEndpoint = "https://auth.pingone.eu/b801265c-fff6-499b-99a1-b3fd0b231025/as/authorize"
			// const tokenEndpoint = "https://auth.pingone.eu/b801265c-fff6-499b-99a1-b3fd0b231025/as/token"
			// const userInfoEndpoint = "https://auth.pingone.eu/b801265c-fff6-499b-99a1-b3fd0b231025/as/userinfo"

			try {

				const currentLocation = new URL(window.location.href);
				const authorizationCode = currentLocation.searchParams.get("code");

				// check for the authentication code in the search params,
				// if it doesn't exist then we need to do the authorization step else skip it and continue to get the token
				if (!authorizationCode) {

					authorize()

				} else {

					const token = await getToken()

					const accessToken = token.access_token

					const userInfo = await getUserInfo({ accessToken, endpoint: userInfoEndpoint })

					const username = userInfo.sub

					/**
					 * This is the most important step. Once your back end server has authenticated the user
					 * call publishAuthorization() from the useAuth() hook. The first parameter (username) is
					 * required. The second parameter (credentials) is option. Credentials can contain anything
					 * that is useful for session management, such as user ID, tokens, etc.
					 */
					publishAuthorization(username, { token, userInfo });

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
				<div className="fsbl-close">
					<i className="ff-close" onClick={quitApplication}></i>
				</div>
				<h1>Authenticating</h1>
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
