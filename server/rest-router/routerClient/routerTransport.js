/*! WSS://Chartiq.com
 * Copyright 2017 by ChartIQ, Inc.
 * All rights reserved.
 */
// This routerTransport module is shared between router clients and the router service.  It supports
// the addition of new transports without any change to the router code. Each transport is
// point-to-point between a router client and the router service (i.e. hub and spoke).  Each router
// client can use a different transport (i.e. the router service connects to them all).
"use strict";
exports.__esModule = true;
var WebSocket = require("ws");
/**
 * @introduction
 * <h2>Router Transport</h2>
 * **Service-Level Module**.  Manages and contains the point-to-point transports (i.e., Layer 2) supported by Finsemble.
 * Each transport communicates between a Finsemble services or component (i.e. a router client on one end) and the Finsemble router service (another router client on the other end).
 *
 * Integration into routerService.js is automatic on startup.
 *
 * Developer Notes on Adding New Transport:
 * 1) Create new transport constructor.
 * 2) Call RouterTransport.addTransport() to make the transport constructor (see the bottom of this file)
 *
 * Each transport constructor must be implemented with the following interface:
 *
 *	ExampleTransportConstructor(params, parentMessageHandler, source, destination) where
 *
 * 			params is a passed in object including data that may (or may not) be needed for implementing the transport
 * 					params.FinsembleUUID: globally unique identifier for Finsemble (one per host machine)
 *					params.applicationRoot:  value of manifest.finsemble.applicationRoot,
 *					params.routerDomainRoot: value of manifest.finsemble.moduleRoot,
 *					params.sameDomainTransport: transport to use for same domain clients
 *					params.crossDomainTransport: transport to use for cross domain clients
 *					params.transportSettings: transport settings from finsemble.router.transportSettings if defined, otherwise an empty object
 *
 * 			parentMessageHandler(incomingTransportInfo, routerMessage) where
 * 					incomingTransportInfo is a transport-specific object containing essential information to route back to the same client.
 * 						The same object will be returned on a send() so the transport can use to send the message to that client.
 * 						It's up to the developer to decide what to put in the incomingTransportInfo object. The RouterService never
 * 						directly uses the object, except to do a property-based comparison for equality (so equality must be based on the top-level properties within the object.)
 * 					routerMessage is an object containing a single router message. The transport generally does not need to know the contents --
 * 						it only sends and receives these messages. However, the router's header (routerMessage.header) is available to the transport if needed.
 *
 * 			source is either the source's client name or "RouterService" (when the RouterService is the source)
 *
 * 			destination is either the destination's client name or "RouterService" (when the RouterService is the desgination)
 *
 * 			callback(this) returns the constructor.  Normally a constructor is not asyncronous, but support in case the constructed transport requires async initialization.
 *
 * The transport constructor must implement two functions.
 * 		1) send(transport, routerMessage) -- transport object contains destination transport info; routerMessage is the message to send
 * 		2) identifier() -- returns transport's name
 *
 * These functions along with the parentMessageHandler callback all that's needed to interface with the higher-level router (either a client or router service):
 *
 * The three transports implemented at the bottom of this file can serve as examples.
 *
 * @namespace RouterTransport
 */
var RouterTransport = {
    activeTransports: {},
    /**
     * Adds a new type of router transport to pass message between RouterClient and RouterService.
     *
     * @param {string} transportName identifies the new transport
     * @param {object} transportConstructor returns an instance of the new transport
     */
    addTransport: function (transportName, transportConstructor) {
        this.activeTransports[transportName] = transportConstructor;
        console.log("RouterTransport " + transportName + " added to activeTransports");
    },
    /**
     * Gets array of active transports.  What is active depends both on config and what is supported by the environment. Typically, if OF IAB is defined then the IAB transport is added to active list.  Likewise, if SharedWorker defined, then SharedWork transport added to the active list.  Special transports that don't have backwards compatability (e.g. FinsembleTransport) are only added if specified in the config.
     *
     * @param {string} params transport paramters
     *
     * @returns array of active transport names
     */
    getActiveTransports: function (params) {
        var transportNames = [];
        // convenience funciton to add transport to active list only if it's not already in the list
        function addToActive(transportName) {
            if (transportNames.indexOf(transportName) === -1) {
                // if not already in the list, then add it
                transportNames.push(transportName);
            }
        }
        /*  // if OpenFin IAB available, then add IAB to active list
        if (fin && fin.desktop && fin.desktop.InterApplicationBus)
          addToActive("OpenFinBus");
    
        // If electron, always have FinsembleTransport active
        if (fin && fin.container === "Electron") addToActive("FinsembleTransport");
    
        // if shared worker available, then add shared-worker transport to active list
        if (SharedWorker) addToActive("SharedWorker");
     */
        // add whatever the sameDomainTrasnport is to the active list
        addToActive(params.sameDomainTransport);
        // add whatever the crossDomainTrasnport is to the active list
        addToActive(params.crossDomainTransport);
        console.log("getActiveTransports", transportNames);
        return transportNames;
    },
    /**
     * Get default transport for event router&mdash;this is the most reliable transport across all contexts.
     *
     * @param {object} params parameters for transport
     * @param {any} incomingMessageHandler
     * @param {any} source
     * @param {any} destination
     * @returns the transport object
     */
    getDefaultTransport: function (params, incomingMessageHandler, source, destination) {
        return RouterTransport.getTransport(params, "FinsembleTransport", incomingMessageHandler, source, destination);
    },
    /**
     * Get best client transport based on the run-time context. Will only return cross-domain transport if current context is inter-domain.
     *
     * @param {object} params parameters for transport
     * @param {any} incomingMessageHandler
     * @param {any} source
     * @param {any} destination
     * @returns the transport object
     */
    getRecommendedTransport: function (params, incomingMessageHandler, source, destination) {
        return RouterTransport.getDefaultTransport(params, incomingMessageHandler, source, destination);
    },
    /**
     * Get a specific transport by name. The transport must be in list of the active transports (i.e. previously added).
     *
     * @param {object} params parameters for transport
     * @param {any} transportName
     * @param {any} incomingMessageHandler
     * @param {any} source
     * @param {any} destination
     * @returns the transport object
     */
    getTransport: function (params, transportName, incomingMessageHandler, source, destination) {
        var self = this;
        return new Promise(function (resolve, reject) {
            var transportConstructor = self.activeTransports[transportName];
            console.log("Mark TransportConstructor", transportConstructor);
            if (transportConstructor) {
                new transportConstructor(params, incomingMessageHandler, source, destination, function (newTransport) {
                    resolve(newTransport);
                    //Set me to just return the correct transport.
                });
            }
            else {
                reject("unknown router transport name: " + transportName);
            }
        });
    }
};
//////////////////////////////////////////////////////////////
// Below all transports are defined then added to active list
//////////////////////////////////////////////////////////////
var RouterTransportImplementation = {}; // a convenience namespace for router-transport implementations
function getDefault(base, path, defaultValue) {
    var result = defaultValue;
    if (base) {
        try {
            var properties = path.split(".");
            var currentValue = base;
            for (var i = 1; i < properties.length; i++) {
                currentValue = currentValue[properties[i]];
            }
            result = currentValue;
        }
        catch (err) {
            result = defaultValue;
        }
        if (typeof result === "undefined")
            result = defaultValue;
    }
    return result;
}
/*
 * Implements the FinsembleTransport (alternative to IAB without iFrame problems with supporting server commonly running on local server).
 *
 * Required Functions (used by transport clients):
 * 		send(event) -- transports the event
 * 		identifier() -- returns transport name/identifier
 *
 * @param {object} params various parms to support transports
 * @param {any} parentMessageHandler callback for incoming event
 * @param {any} source either the client name or "RouterService"
 * @param {any} destination either the client name or "RouterService" (unused in FinsembleTransport)
 */
//
RouterTransportImplementation.FinsembleTransport = function (params, parentMessageHandler, source, destination, callback) {
    /** @TODO - split into two separate vars for clarity. */
    var serverAddress = getDefault(params, "params.transportSettings.FinsembleTransport.serverAddress", getDefault(params, "params.IAC.serverAddress", "wss://localhost.chartiq.com:3376") //Read from Mark's Config file, take from seed manifest.
    );
    var SOCKET_SERVER_ADDRESS = serverAddress + "/router"; // "router" is the socket namespace used on server
    var self = this;
    // receives incoming messages then passes on to parent (what's passed to parent should be same routerMessage received in send()
    function finsembleMessageHandler(routerMessage) {
        var incomingTransportInfo = {
            transportID: self.identifier(),
            client: routerMessage.clientMessage.header.origin
        };
        console.log("FinsembleTransport Incoming Transport", incomingTransportInfo, "Message", routerMessage);
        parentMessageHandler(incomingTransportInfo, routerMessage.clientMessage);
    }
    //required function for the parent (i.e. routeClient or routeService)
    this.send = function (transport, routerMessage) {
        var dest;
        var message;
        // decide how to route the message based on whether client or routerservice is sending
        if (arguments.length === 1) {
            // clients use just one parameter, so send client message to RouterService
            dest = "ROUTER_SERVICE";
            routerMessage = arguments[0];
            message = { clientMessage: routerMessage }; // no client property needed to route on server since always going to router service
        }
        else {
            // router service uses both parameters, so send router-service mssage to a client
            dest = "ROUTER_CLIENT";
            routerMessage = arguments[1];
            message = { client: transport.client, clientMessage: routerMessage }; // client property used to router on server
        }
        console.log("FinsembleTransport Outgoing Transport", dest, "NewMessage", message);
        routerServerSocket.send(JSON.stringify({ dest: dest, message: message }));
    };
    //required function for the parent (i.e. routeClient or routeService)
    this.identifier = function () {
        return "FinsembleTransport";
    };
    console.log("FinsembleTransport Transport Initializing for " + source + " using " + SOCKET_SERVER_ADDRESS);
    console.log("FinsembleTransport Transport Initializing for " + source + " using " + SOCKET_SERVER_ADDRESS);
    function connectTimeoutHandler() {
        console.log("FinsembleTransport Connection Timeout for " + source);
        callback(self);
    }
    // set up for receiving incoming messages
    var routerServerSocket;
    if (SOCKET_SERVER_ADDRESS.startsWith("ws:") ||
        SOCKET_SERVER_ADDRESS.startsWith("wss:")) {
        routerServerSocket = new WebSocket(SOCKET_SERVER_ADDRESS);
    }
    else {
        console.error("wss not found as SOCKET_SERVER_ADDRESS.  Use wss!", SOCKET_SERVER_ADDRESS);
        routerServerSocket = new WebSocket(SOCKET_SERVER_ADDRESS);
    }
    var connectTimer = setTimeout(connectTimeoutHandler, 3000); // cleared in setServiceOnline
    routerServerSocket.addEventListener("open", function () {
        clearTimeout(connectTimer);
        console.log("FinsembleTransport Connected to Server");
        console.log("FinsembleTransport Connected to Server");
        // TODO: Currently all messages are broadcast to everyone and filtering happens here. Need to implement a system similar to socket.io to prevent this or only send messages to proper destinations.
        routerServerSocket.addEventListener("message", function (event) {
            var data = JSON.parse(event.data);
            if (source === "RouterService" && data.dest == "ROUTER_SERVICE") {
                finsembleMessageHandler(data.message);
            }
            else if (source === data.message.client) {
                finsembleMessageHandler(data.message);
            }
        });
        callback(self);
    });
};
// add the transports to the available/active list
RouterTransport.addTransport("FinsembleTransport", RouterTransportImplementation.FinsembleTransport);
exports["default"] = RouterTransport;
