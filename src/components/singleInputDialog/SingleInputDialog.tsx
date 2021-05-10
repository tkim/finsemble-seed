/*!
 * Copyright 2017 by ChartIQ, Inc.
 * All rights reserved.
 */
import React from "react";
import ReactDOM from "react-dom";
import { FinsembleProvider } from "@finsemble/finsemble-ui/react/components/FinsembleProvider";
import { SingleInputDialog } from "@finsemble/finsemble-ui/react/components/singleInputDialog";
import "@finsemble/finsemble-ui/react/assets/css/finsemble.css";
import "../../../assets/css/theme.css";

import CustomSingleInputDiaglog from "./CustomSingleInputDialog";

ReactDOM.render(
	<FinsembleProvider>
		{/* <SingleInputDialog /> */}
		<CustomSingleInputDiaglog />
	</FinsembleProvider>,
	document.getElementById("SingleInputDialog-tsx")
);
