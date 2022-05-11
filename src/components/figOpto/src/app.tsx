import React from "react";
import ReactDOM from "react-dom";
import { FinsembleProvider } from "@finsemble/finsemble-ui/react/components/FinsembleProvider";
import "@finsemble/finsemble-ui/react/assets/css/finsemble.css";
import "../../../../public/assets/css/theme.css";
const FigOpto = () => {
	console.log("My code is running");
	/* Your functional react component code here */

	return <>{
		/*Your render code here*/
		<h1>FIG Optimizer</h1>
	}</>;

};

ReactDOM.render(
	<FinsembleProvider>
		<FigOpto/>
	</FinsembleProvider>,
	document.getElementById("FigOpto-tsx")
);
