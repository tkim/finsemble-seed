"use strict";
/*!
 * Copyright 2017 by ChartIQ, Inc.
 * All rights reserved.
 */
exports.__esModule = true;
/**
 * @introduction
 * <h2>Router Client Instance</h2>
 * Exports a single shared instance of the router client.  See {@link RouterClientConstructor} for the complete API definition with examples.
 *
 * Example:
 *
 *	// get a shared instance of RouterClient (shared within the containing component or service)
 *	var RouterClient = require('./routerClientInstance').default;
 *
 * @namespace routerClientInstance
 * @shouldBePublished false
 */
var routerClientConstructor_1 = require("./routerClientConstructor");
var RCConstructor = routerClientConstructor_1.RouterClientConstructor;
/** An instance of the IRouterClient interface, (that is, the Router Client).
 * All other clients are built on top of the RouterClient; its API is the
 * primary form of communication between the various components of Finsemble.
 */
var RouterClientInstance = new RCConstructor({
    clientName: "RouterClient.Rest"
});
exports["default"] = RouterClientInstance;
