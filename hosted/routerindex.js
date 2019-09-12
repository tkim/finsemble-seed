// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"Ihov":[function(require,module,exports) {
/*! WSS://Chartiq.com
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
// This routerTransport module is shared between router clients and the router service.  It supports
// the addition of new transports without any change to the router code. Each transport is
// point-to-point between a router client and the router service (i.e. hub and spoke).  Each router
// client can use a different transport (i.e. the router service connects to them all).
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
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
  addTransport: function addTransport(transportName, transportConstructor) {
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
  getActiveTransports: function getActiveTransports(params) {
    var transportNames = []; // convenience funciton to add transport to active list only if it's not already in the list

    function addToActive(transportName) {
      if (transportNames.indexOf(transportName) === -1) {
        // if not already in the list, then add it
        transportNames.push(transportName);
      }
    } // if OpenFin IAB available, then add IAB to active list


    if (fin && fin.desktop && fin.desktop.InterApplicationBus) addToActive("OpenFinBus"); // If electron, always have FinsembleTransport active

    if (fin && fin.container === "Electron") addToActive("FinsembleTransport"); // if shared worker available, then add shared-worker transport to active list

    if (SharedWorker) addToActive("SharedWorker"); // add whatever the sameDomainTrasnport is to the active list

    addToActive(params.sameDomainTransport); // add whatever the crossDomainTrasnport is to the active list

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
  getDefaultTransport: function getDefaultTransport(params, incomingMessageHandler, source, destination) {
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
  getRecommendedTransport: function getRecommendedTransport(params, incomingMessageHandler, source, destination) {
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
  getTransport: function getTransport(params, transportName, incomingMessageHandler, source, destination) {
    var self = this;
    return new Promise(function (resolve, reject) {
      var transportConstructor = self.activeTransports[transportName];
      console.log("Mark TransportConstructor", transportConstructor);

      if (transportConstructor) {
        new transportConstructor(params, incomingMessageHandler, source, destination, function (newTransport) {
          resolve(newTransport); //Set me to just return the correct transport. 
        });
      } else {
        reject("unknown router transport name: " + transportName);
      }
    });
  }
}; //////////////////////////////////////////////////////////////
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
    } catch (err) {
      result = defaultValue;
    }

    if (typeof result === "undefined") result = defaultValue;
  }

  return result;
}

;
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

  var self = this; // receives incoming messages then passes on to parent (what's passed to parent should be same routerMessage received in send()

  function finsembleMessageHandler(routerMessage) {
    var incomingTransportInfo = {
      "transportID": self.identifier(),
      "client": routerMessage.clientMessage.header.origin
    };
    console.log("FinsembleTransport Incoming Transport", incomingTransportInfo, "Message", routerMessage);
    parentMessageHandler(incomingTransportInfo, routerMessage.clientMessage);
  } //required function for the parent (i.e. routeClient or routeService)


  this.send = function (transport, routerMessage) {
    var dest;
    var message; // decide how to route the message based on whether client or routerservice is sending

    if (arguments.length === 1) {
      // clients use just one parameter, so send client message to RouterService
      dest = "ROUTER_SERVICE";
      routerMessage = arguments[0];
      message = {
        clientMessage: routerMessage
      }; // no client property needed to route on server since always going to router service
    } else {
      // router service uses both parameters, so send router-service mssage to a client
      dest = "ROUTER_CLIENT";
      routerMessage = arguments[1];
      message = {
        client: transport.client,
        clientMessage: routerMessage
      }; // client property used to router on server
    }

    console.log("FinsembleTransport Outgoing Transport", dest, "NewMessage", message);
    routerServerSocket.send(JSON.stringify({
      dest: dest,
      message: message
    }));
  }; //required function for the parent (i.e. routeClient or routeService)


  this.identifier = function () {
    return "FinsembleTransport";
  };

  console.log("FinsembleTransport Transport Initializing for " + source + " using " + SOCKET_SERVER_ADDRESS);
  console.log("FinsembleTransport Transport Initializing for " + source + " using " + SOCKET_SERVER_ADDRESS);

  function connectTimeoutHandler() {
    console.log("FinsembleTransport Connection Timeout for " + source);
    callback(self);
  } // set up for receiving incoming messages


  var routerServerSocket;

  if (SOCKET_SERVER_ADDRESS.startsWith("ws:") || SOCKET_SERVER_ADDRESS.startsWith("wss:")) {
    routerServerSocket = new WebSocket(SOCKET_SERVER_ADDRESS);
  } else {
    console.error("wss not found as SOCKET_SERVER_ADDRESS.  Use wss!", SOCKET_SERVER_ADDRESS);
    routerServerSocket = new WebSocket(SOCKET_SERVER_ADDRESS);
  }

  var connectTimer = setTimeout(connectTimeoutHandler, 3000); // cleared in setServiceOnline

  routerServerSocket.addEventListener("open", function () {
    clearTimeout(connectTimer);
    console.log("FinsembleTransport Connected to Server");
    console.log("FinsembleTransport Connected to Server"); // TODO: Currently all messages are broadcast to everyone and filtering happens here. Need to implement a system similar to socket.io to prevent this or only send messages to proper destinations.

    routerServerSocket.addEventListener("message", function (event) {
      var data = JSON.parse(event.data);

      if (source === "RouterService" && data.dest == "ROUTER_SERVICE") {
        finsembleMessageHandler(data.message);
      } else if (source === data.message.client) {
        finsembleMessageHandler(data.message);
      }
    });
    callback(self);
  });
}; // add the transports to the available/active list


RouterTransport.addTransport("FinsembleTransport", RouterTransportImplementation.FinsembleTransport);
exports.default = RouterTransport;
},{}],"YdeX":[function(require,module,exports) {
/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var routerTransport_1 = __importDefault(require("./routerTransport"));

var queue = []; // should never be used, but message sent before router ready will be queue

/**
 * @introduction
 *
 * <h2>Router Client</h2>
 *
 * The Router Client sends and receives event messages between Finsemble components and services. See the <a href=tutorial-TheRouter.html>Router tutorial</a> for an overview of the Router's functionality.
 *
 * Router callbacks for incoming messages are **always** in the form `callback(error, event)`. If `error` is null, then the incoming data is always in `event.data`. If `error` is set, it contains a diagnostic object and message. On error, the `event` parameter is not undefined.
 *
 *
 * @constructor
 * @hideconstructor
 * @publishedName RouterClient
 * @param {string} clientName router base client name for human readable messages (window name is concatenated to baseClientName)
 * @param {string=} transportName router transport name, currently either "SharedWorker" or "OpenFinBus" (usually this is autoconfigured internally but can be selected for testing or special configurations)
 */

exports.RouterClientConstructor = function (params) {
  var _this = this; ///////////////////////////
  // Private Data
  ///////////////////////////


  var baseClientName = params.clientName;
  var transportName = params.transportName;
  var handshakeHandler;
  var timeCalibrationHandler;
  var mapListeners = {};
  var mapResponders = {};
  var mapPubSubResponders = {};
  var mapPubSubResponderState = {};
  var mapPubSubResponderRegEx = {};
  var pubsubListOfSubscribers = {};
  var mapSubscribersID = {};
  var mapSubscribersTopic = {};
  var mapQueryResponses = {};
  var mapQueryResponseTimeOut = {};
  var clientName;
  var transport = null;
  var isRouterReady = false;
  var parentReadyCallbackQueue = []; // must be queue because may be multiple waiters

  var self = this;
  this.startupTime = 0;
  var UUID = create_UUID(); /////////////////////////////////////////////////////////////////////
  // Private Message Contructors for Communicating with RouterService
  /////////////////////////////////////////////////////////////////////

  function InitialHandshakeMessage() {
    this.header = {
      "origin": clientName,
      "type": "initialHandshake"
    };
  }

  function TimeCalibrationHandshakeMessage(clientBaseTime, serviceBaseTime) {
    this.header = {
      "origin": clientName,
      "type": "timeCalibration"
    };
    this.clientBaseTime = clientBaseTime;
    this.serviceBaseTime = serviceBaseTime;
  }

  function AddListenerMessage(channel) {
    this.header = {
      "origin": clientName,
      "type": "addListener",
      "channel": channel
    };
  }

  function TransmitMessage(toChannel, data, options) {
    this.header = {
      "origin": clientName,
      "type": "transmit",
      "channel": toChannel
    };
    this.data = data;
    this.options = options;
  }

  function RemoveListenerMessage(channel) {
    this.header = {
      "origin": clientName,
      "type": "removeListener",
      "channel": channel
    };
  }

  function addResponderMessage(channel) {
    this.header = {
      "origin": clientName,
      "type": "addResponder",
      "channel": channel
    };
  }

  function QueryMessage(queryID, channel, data) {
    this.header = {
      "origin": clientName,
      "type": "query",
      "queryID": queryID,
      "channel": channel
    };
    this.data = data;
  }

  function QueryResponseMessage(queryID, error, data) {
    this.header = {
      "origin": clientName,
      "type": "queryResponse",
      "queryID": queryID,
      "error": error
    };
    this.data = data;
  }

  function RemoveResponderMessage(channel) {
    this.header = {
      "origin": clientName,
      "type": "removeResponder",
      "channel": channel
    };
  }

  function SubscribeMessage(subscribeID, topic) {
    this.header = {
      "origin": clientName,
      "type": "subscribe",
      "subscribeID": subscribeID,
      "topic": topic
    };
  }

  function UnsubscribeMessage(subscribeID, topic) {
    this.header = {
      "origin": clientName,
      "type": "unsubscribe",
      "subscribeID": subscribeID,
      "topic": topic
    };
  }

  function PublishMessage(topic, data) {
    this.header = {
      "origin": clientName,
      "type": "publish",
      "topic": topic
    };
    this.data = data;
  }

  function NotifyMessage(subscribeID, topic, error, data) {
    this.header = {
      "origin": clientName,
      "type": "notify",
      "subscribeID": subscribeID,
      "topic": topic,
      "error": error
    };
    this.data = data;
  }

  function AddPubSubResponderMessage(topic) {
    this.header = {
      "origin": clientName,
      "type": "addPubSubResponder",
      "topic": topic
    };
  }

  function RemovePubSubResponderMessage(topic) {
    this.header = {
      "origin": clientName,
      "type": "removePubSubResponder",
      "topic": topic
    };
  }

  function JoinGroupMessage(group) {
    this.header = {
      "origin": clientName,
      "type": "joinGroup",
      "group": group
    };
  }

  function LeaveGroupMessage(group) {
    this.header = {
      "origin": clientName,
      "type": "leaveGroup",
      "group": group
    };
  }

  function GroupTransmitMessage(group, toChannel, message, data) {
    this.header = {
      "origin": clientName,
      "type": "groupTransmit",
      "group": group,
      "channel": toChannel
    };
    this.data = data;
  } //////////////////////
  // Private Functions
  //////////////////////
  // router client is being terminated so cleanup


  function destructor(event) {
    console.log("WINDOW LIFECYCLE:Shutdown:RouterClient:Shutting down.");
    self.disconnectAll(); // this will let the router know the client is terminating
  } // invoked when router init is complete


  function onReadyCallBack() {
    self.startupTime = performance.now() - self.startupTime;
    console.log("WINDOW LIFECYCLE:STARTUP:RouterClient Ready");
    isRouterReady = true; // invoke all the parent callbacks waiting for router to be ready

    while (parentReadyCallbackQueue.length > 0) {
      console.log("WINDOW LIFECYCLE:STARTUP:RouterClient parentReady invoked");
      var nextParentCallback = parentReadyCallbackQueue.shift();
      nextParentCallback();
    }
  } // called once on router-client creation


  function constructor(clientName, transportName) {
    console.log("WINDOW LIFECYCLE:STARTUP:RouterClient Constructor:Name:", clientName);
    var callbackCounter = 0;

    function processManifest() {
      console.log("WINDOW LIFECYCLE:STARTUP:RouterClient:processManifest"); //If manifest is a string, then there was an error getting the manifest because in a separate application

      asyncConnectToEventRouter(clientName, transportName, onReadyCallBack);
      /**** establish connection to router service ****/
    } //This is the only place we need to wait for desktop.main


    window.addEventListener("load", function () {
      self.startupTime = performance.now();
      processManifest();
    });
  }

  function create_UUID() {
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c == 'x' ? r : r & 0x3 | 0x8).toString(16);
    });
    return uuid;
  } // connects to event-router service. will retry various ways if needed


  function asyncConnectToEventRouter(clientName, transportName, onReadyCallBack) {
    // var transportNotSpecified = (typeof (transportName) === "undefined");
    var myTimer;
    var myRetryCounter;
    var isFinished = false;
    var handshakeFailedCount = 0; // var finConfig = manifest.finsemble;
    // var isElectron = fin && fin.container == "Electron";

    var routerParams = {
      FinsembleUUID: UUID,
      applicationRoot: "wss://127.0.0.1:3376",
      routerDomainRoot: "localhost",
      forceWindowTransport: {},
      sameDomainTransport: "SharedWorker",
      crossDomainTransport: "FinsembleTransport",
      transportSettings: {},
      IAC: {}
    };

    function getClientTransport() {
      transport = routerTransport_1.default.getTransport(routerParams, transportName, incomingMessageHandler, clientName, "RouterService").then(transportReady).catch(errHandler);
    }

    function transportReady(transportObj) {
      myRetryCounter = 0;
      transport = transportObj;
      handshakeHandler = finished; // set function to receive handshake response

      sendHandshake();
      myTimer = setInterval(sendHandshake, 200); // start time to retry if response not recieved back from router service
    }

    function handshakeFailedHandler() {
      clearInterval(myTimer);
      handshakeFailedCount++;

      if (handshakeFailedCount <= 3) {
        getClientTransport();
      } else {
        var failureMessage = "Router " + transport.identifier() + " failure for window " + window.name + " after multiple retries.";
        console.log("MARK FAILURE:", failureMessage);
      }
    }

    function sendHandshake() {
      sendToRouterService(new InitialHandshakeMessage());

      if (myRetryCounter++ > 50) {
        handshakeFailedHandler();
      }
    }

    function finished() {
      if (!isFinished) {
        // ensure only invoked once
        isFinished = true;
        clearInterval(myTimer);

        if (queue) {
          // this should not happen with proper startup order, which waits on routerClient to be ready
          for (var i = 0; i < queue.length; i++) {
            var msg = queue[i];
            transport.send(msg);
          }
        } // notify initialization is complete


        if (onReadyCallBack) {
          onReadyCallBack();
        }
      }
    }

    function errHandler(errorMessage) {
      console.log("RouterClientError", errorMessage);
    } // main code for this asyncConnectToEventRouter function -- only executed once


    getClientTransport();
  } // provides unique id within one router client for queries


  function clientID() {
    return clientName + "." + UUID;
  } // returns true if this routerClient originated the message


  function originatedHere() {
    return this.header.origin === this.header.lastClient;
  } // invoke client callbacks in the input array (that are attached to a specific channel and listener type)


  function invokeListenerCallbacks(map, message) {
    var originalClientCallbackArray = map[message.header.channel] || {};
    var clientCallbackArray = [];

    if (clientCallbackArray === undefined) {} else {
      message.originatedHere = originatedHere; // add local function to test origin
      //@note, have to operate off of a copy because a callback may call removeListener, which will modify map[message.header.channel].

      originalClientCallbackArray.forEach(function (cb) {
        clientCallbackArray.push(cb);
      });

      for (var i = 0; i < clientCallbackArray.length; i++) {
        // for each callback defined for the channel
        clientCallbackArray[i](null, message); // invoke the callback; the error parameter is always null for this case
      }
    }
  }

  function sendQueryResponse(err, responseData) {
    //@todo consider removing this log. Why log it? Why not log it _only_ if the dev wants a particular message logged. This can cause problems.
    sendToRouterService(new QueryResponseMessage(this.header.queryID, err, responseData));
  } // invoke responder-listener callback (attached to a specific channel)


  function invokeResponderCallback(map, queryMessage) {
    var responderCallback = map[queryMessage.header.channel];

    if (responderCallback === undefined) {
      responderCallback(null, queryMessage); // invoke the callback (no error), queryMessage);
    } else {
      if (!queryMessage.header.error) {
        queryMessage.originatedHere = originatedHere; // add local function to test origin

        queryMessage.sendQueryResponse = sendQueryResponse.bind(queryMessage); // add callback function to message so responder can respond to query

        responderCallback(null, queryMessage); // invoke the callback (no error)
      } else {
        // invoke the callback with error since  flag in message (from router service)
        responderCallback(queryMessage.header.error, null);
        delete map[queryMessage.header.channel]; // this is a bad responder (e.g. duplicate) so remove it
      }
    }
  } // add a callbackHandler into the query-response map for the given queryID


  function addQueryResponseCallBack(map, queryID, responseCallback) {
    map[queryID] = responseCallback;
  } // add timer to wait for query response


  function addQueryResponseTimeout(mapQueryResponseTimeOut, newQueryID, channel, timeout) {
    if (timeout > 0) {
      mapQueryResponseTimeOut[newQueryID] = setTimeout(function () {
        console.log("RouterClient: timeout waiting on query response on channel " + channel + " for queryID " + newQueryID + " on timer " + mapQueryResponseTimeOut[newQueryID] + " timeout=" + timeout);
      }, timeout);
    }
  } // delete timer waiting on query response (if it exists)


  function deleteQueryResponseTimeout(mapQueryResponseTimeOut, newQueryID) {
    var theTimer = mapQueryResponseTimeOut[newQueryID];

    if (theTimer !== undefined) {
      clearTimeout(theTimer);
    }
  } // invoke query-response callback (that is attached to a specific channel and listener type)


  function invokeQueryResponseCallback(map, responseMessage) {
    var clientCallback = map[responseMessage.header.queryID];

    if (clientCallback === undefined) {
      console.log("RouterClient: no handler for incoming query response", "QUERY ID", responseMessage.header.queryID);
    } else {
      // delete any existing timer waiting on the response
      deleteQueryResponseTimeout(mapQueryResponseTimeOut, responseMessage.header.queryID);

      if (!responseMessage.header.error) {
        //@todo consider removing this log. Why log it? Why not log it _only_ if the dev wants a particular message logged. This can cause problems.
        console.log("RouterClient: incoming query response", "RESPONSE MESSAGE", responseMessage, "QUERY ID", responseMessage.header.queryID);
        clientCallback(null, responseMessage); // invoke the callback passing the response message
      } else {
        console.log("RouterClient: incoming queryResponse error", responseMessage.header, "QUERY ID", responseMessage.header.queryID);
        clientCallback(responseMessage.header.error, responseMessage); // error from router service so pass it back instead of a message
      }

      delete map[responseMessage.header.queryID];
    }
  } // add responder callbackHandler for the given channel


  function addResponderCallBack(map, channel, callback) {
    var status = false;
    var clientCallback = map[channel];

    if (clientCallback === undefined) {
      map[channel] = callback;
      status = true;
    }

    return status;
  } // support function for sendNotifyToSubscriber -- maintains local list of subscribers for pubsub responder


  function addToPubSubListOfSubscribers(pubsubListOfSubscribers, topic, subscribeID) {
    if (!(topic in pubsubListOfSubscribers)) {
      pubsubListOfSubscribers[topic] = [subscribeID];
    } else {
      pubsubListOfSubscribers[topic].push(subscribeID);
    }
  } // support function for addPubSubResponder -- add pubsub responder callbackHandler for the given channel


  function addPubSubResponderCallBack(topic, subscribeCallback, publishCallback, unsubscribeCallback) {
    var status = false;
    var callbacks = mapPubSubResponders[topic.toString()];

    if (callbacks === undefined) {
      if (topic instanceof RegExp) {
        mapPubSubResponderRegEx[topic.toString()] = topic;
        console.log("RouterClient: PubSub RegEx added for topic " + topic.toString()); // Note: topic may be a RegEx, so use toString() where applicable
      }

      mapPubSubResponders[topic.toString()] = {
        "subscribeCallback": subscribeCallback,
        "publishCallback": publishCallback,
        "unsubscribeCallback": unsubscribeCallback
      };
      status = true;
    }

    return status;
  } // callback function for invokeSubscribePubSubCallback to notify new subscriber


  function sendNotifyToSubscriber(err, notifyData) {
    //@todo consider removing this log. Why log it? Why not log it _only_ if the dev wants a particular message logged. This can cause problems.
    sendToRouterService(new NotifyMessage(this.header.subscribeID, this.header.topic, err, notifyData));

    if (!err) {
      // add new subscriber to list
      addToPubSubListOfSubscribers(pubsubListOfSubscribers, this.header.topic, this.header.subscribeID);
      console.log("RouterClient: incoming subscription added", "TOPIC", this.header.topic, "MESSAGE", this);
    } else {
      console.log("RouterClient: incoming subscription rejected by pubsub responder", "TOPIC", this.header.topic, "MESSAGE", this);
    }
  } // for incoming subscribe: invoke notify callback for pubsub responder


  function invokeSubscribePubSubCallback(subscribeMessage) {
    var callbacks = mapPubSubResponders[subscribeMessage.header.topic]; //@todo consider removing this log. Why log it? Why not log it _onlY_ if the dev wants a particular message logged. This can cause problems.

    if (callbacks === undefined) {
      // if undefined then may be a matching RegEx topic
      for (var key in mapPubSubResponderRegEx) {
        if (mapPubSubResponderRegEx[key].test(subscribeMessage.header.topic)) {
          callbacks = mapPubSubResponders[key];
          var initialState = mapPubSubResponderState[subscribeMessage.header.topic]; // may already be initial state defined from publish

          if (initialState === undefined) {
            // if there isn't already state defined then use default from regEx
            initialState = mapPubSubResponderState[key]; // initialize the state from RegEx topic
          }

          mapPubSubResponderState[subscribeMessage.header.topic] = initialState;
          break;
        }
      }
    }

    if (callbacks === undefined) {
      // if still undefined
      console.log("RouterClient: no pubsub responder defined for incoming subscribe", subscribeMessage);
    } else {
      if (subscribeMessage.header.error) {
        // the router service uses the subscribe message in this case to return a pubsub error (ToDO: consider a generic error message)
        console.log("RouterClient: pubsub error received from router service: " + JSON.stringify(subscribeMessage.header.error));
      } else {
        subscribeMessage.sendNotifyToSubscriber = sendNotifyToSubscriber; // add callback function to message so pubsub responder can respond with Notify message

        if (callbacks.subscribeCallback) {
          subscribeMessage.data = mapPubSubResponderState[subscribeMessage.header.topic];
          callbacks.subscribeCallback(null, subscribeMessage); // invoke the callback (no error)
        } else {
          // since no subscribe callback defined, use default functionality
          subscribeMessage.sendNotifyToSubscriber(null, mapPubSubResponderState[subscribeMessage.header.topic]); // must invoke from message to set this properly
        }
      }
    }
  } // support function for removeSubscriber callback --  remove one subscribeID from array for the given subscription topic


  function removeFromPubSubListOfSubscribers(pubsubListOfSubscribers, topic, subscribeID) {
    var removed = false;

    if (topic in pubsubListOfSubscribers) {
      var list = pubsubListOfSubscribers[topic];

      for (var i = 0; i < list.length; i++) {
        if (subscribeID === list[i]) {
          list.splice(i, 1);

          if (list.length === 0) {
            delete pubsubListOfSubscribers[topic];
          }

          removed = true;
          console.log("RouterClient: PubSub removeListener", "TOPIC", topic, "FROM", subscribeID);
          break;
        }
      }
    }

    if (!removed) {
      console.log("RouterClient: tried to remove non-existant listener on " + topic + " from " + JSON.stringify(subscribeID));
    }
  } // callback function for invokeUnsubscribePubSubCallback to remove the subscriber from the subscription


  function removeSubscriber() {
    removeFromPubSubListOfSubscribers(pubsubListOfSubscribers, this.header.topic, this.header.subscribeID);
  } // for incoming unsubscribe: invoke unsubscribe callback for pubsub servier


  function invokeUnsubscribePubSubCallback(unsubscribeMessage) {
    var callbacks = mapPubSubResponders[unsubscribeMessage.header.topic];

    if (callbacks === undefined) {
      // if undefined then may be a matching RegEx topic
      for (var key in mapPubSubResponderRegEx) {
        if (mapPubSubResponderRegEx[key].test(unsubscribeMessage.header.topic)) {
          callbacks = mapPubSubResponders[key];
          break;
        }
      }
    }

    if (callbacks === undefined) {
      // if still undefined
      console.log("RouterClient: no pubsub responder defined for incoming unsubscribe", "TOPIC", unsubscribeMessage.header.topic, "UNSUBSCRIBE MESSAGE", unsubscribeMessage);
    } else {
      unsubscribeMessage.removeSubscriber = removeSubscriber; // add callback function to message for pubsub responder (but must always remove)

      if (callbacks.unsubscribeCallback) {
        console.log("RouterClient: incoming unsubscribe callback", "TOPIC", unsubscribeMessage.header.topic, "UNSUBSCRIBE MESSAGE", unsubscribeMessage);
        callbacks.unsubscribeCallback(null, unsubscribeMessage); // invoke the callback (no error)
      } else {
        // since no unsubscribe callback defined, use default functionality
        console.log("RouterClient: incoming unsubscribe", "TOPIC", unsubscribeMessage.header.topic, "UNSUBSCRIBE MESSAGE", unsubscribeMessage);
        unsubscribeMessage.removeSubscriber();
      }
    }
  } // callback function for invokePublishPubSubCallback to send Notify


  function sendNotifyToAllSubscribers(err, notifyData) {
    if (!err) {
      mapPubSubResponderState[this.header.topic] = notifyData; // store new state

      var listOfSubscribers = pubsubListOfSubscribers[this.header.topic];

      if (typeof listOfSubscribers !== "undefined") {
        // confirm subscribers to send to, if none then nothing to do
        for (var i = 0; i < listOfSubscribers.length; i++) {
          console.log("RouterClient: sending pubsub notify", "TOPIC", this.header.topic, "NOTIFY DATA", notifyData);
          sendToRouterService(new NotifyMessage(listOfSubscribers[i], this.header.topic, err, notifyData));
        }
      }
    } else {
      console.log("RouterClient: income publish rejected by pubsub responder", err, notifyData);
    }
  } // for incoming Publish: invoke publish callback for pubsub servier


  function invokePublishPubSubCallback(publishMessage) {
    var callbacks = mapPubSubResponders[publishMessage.header.topic];

    if (callbacks === undefined) {
      // if undefined then may be a matching RegEx topic
      for (var key in mapPubSubResponderRegEx) {
        if (mapPubSubResponderRegEx[key].test(publishMessage.header.topic)) {
          callbacks = mapPubSubResponders[key];
          break;
        }
      }
    }

    if (callbacks === undefined) {
      // if still undefined
      console.log("RouterClient: no pubsub responder defined for incoming publish", "TOPIC", publishMessage.header.topic, "PUBLISH MESSAGE", publishMessage);
    } else {
      publishMessage.sendNotifyToAllSubscribers = sendNotifyToAllSubscribers; // add callback function to message so pubsub responder can respond to publish

      if (callbacks.publishCallback) {
        console.log("RouterClient: incoming PubSub publish callback invoked", "TOPIC", publishMessage.header.topic, "PUBLISH MESSAGE", publishMessage);
        callbacks.publishCallback(null, publishMessage); // invoke the callback (no error)
      } else {
        // since no pubish callback defined, use default functionality
        console.log("RouterClient: incoming PubSub publish", "TOPIC", publishMessage.header.topic, "PUBLISH MESSAGE", publishMessage);
        publishMessage.sendNotifyToAllSubscribers(null, publishMessage.data); // must call from publish message (like a callback) so 'this' is properly set
      }
    }
  } // for incoming Notify: invoke notify callback (that are attached to a specific channel and listener type)


  function invokeNotifyCallback(mapSubscribersID, notifyMessage) {
    var notifyCallback = mapSubscribersID[notifyMessage.header.subscribeID];

    if (notifyCallback === undefined) {
      console.log("RouterClient: no subscription handler defined for incoming notify for subscriberID", notifyMessage.header.subscribeID, notifyMessage);
    } else {
      if (!notifyMessage.header.error) {
        notifyMessage.originatedHere = originatedHere; // add local function to test origin

        console.log("RouterClient: incoming PubSub notify", "SUBSCRIBER ID", notifyMessage.header.subscribeID, "NOTIFY MESSAGE", notifyMessage);
        notifyCallback(null, notifyMessage); // invoke the callback passing the response message
      } else {
        console.log("RouterClient: incoming PubSub notify error for subscriberID", "SUBSCRIBER ID", notifyMessage.header.subscribeID, "NOTIFY MESSAGE", notifyMessage);
        notifyCallback(notifyMessage.header.error, notifyMessage); // error from router service so pass it back instead of a message
      }
    }
  } // outgoing Unsubscribe: remove subscriber callbackHandler for the given channel


  function removeSubscriberCallBack(mapSubscribersID, subscribeID) {
    var status = false;
    var notifyCallback = mapSubscribersID[subscribeID];

    if (notifyCallback !== undefined) {
      delete mapSubscribersID[subscribeID];
      status = true;
    }

    return status;
  } // for outgoing addSubscriber -- add a callback Handler for the subscribe


  function addSubscriberCallBack(mapSubscribersID, subscribeID, notifyCallback, topic) {
    mapSubscribersID[subscribeID] = notifyCallback;
    mapSubscribersTopic[subscribeID] = topic;
  } // for removePubSubResponder: remove responder callbackHandler for the given channel


  function removeResponderCallBack(map, channel) {
    var status = false;
    var clientCallback = map[channel];

    if (clientCallback !== undefined) {
      delete map[channel];
      status = true;
    }

    return status;
  } // for addListener: add a callbackHandler into the specified map (which depends on listener type) for the given channel


  function addListenerCallBack(map, channel, callback) {
    var firstChannelClient = false;
    var clientCallbackArray = map[channel];

    if (clientCallbackArray === undefined || clientCallbackArray.length === 0) {
      map[channel] = [callback];
      firstChannelClient = true;
    } else {
      clientCallbackArray.push(callback);
    }

    return firstChannelClient;
  } // for removeListener: remove a callbackHandler from the specified map (which depends on listener type) for the given channel


  function removeListenerCallBack(map, channel, callback) {
    var lastChannelClient = false;
    var clientCallbackArray = map[channel];

    if (clientCallbackArray !== undefined) {
      var index = clientCallbackArray.indexOf(callback);

      if (index > -1) {
        clientCallbackArray.splice(index, 1);

        if (clientCallbackArray.length === 0) {
          lastChannelClient = true;
        }
      } else {
        console.log("no listener defined for channel: " + channel);
      }
    }

    return lastChannelClient;
  } // route incoming message to appropriate callback, which depends on the message type and channel


  function routeIncomingMessage(incomingMessage) {
    console.log("Incoming Message Type", incomingMessage.header.type, incomingMessage);

    switch (incomingMessage.header.type) {
      case "transmit":
        invokeListenerCallbacks(mapListeners, incomingMessage);
        break;

      case "query":
        invokeResponderCallback(mapResponders, incomingMessage);
        break;

      case "queryResponse":
        invokeQueryResponseCallback(mapQueryResponses, incomingMessage);
        break;

      case "notify":
        invokeNotifyCallback(mapSubscribersID, incomingMessage);
        break;

      case "publish":
        invokePublishPubSubCallback(incomingMessage);
        break;

      case "subscribe":
        invokeSubscribePubSubCallback(incomingMessage);
        break;

      case "unsubscribe":
        invokeUnsubscribePubSubCallback(incomingMessage);
        break;

      case "timeCalibration":
        timeCalibrationHandler(incomingMessage);
        break;

      case "initialHandshakeResponse":
        handshakeHandler();
        break;

      default:
    }
  }

  function clone(from, to) {
    if (from === null || _typeof(from) !== "object") {
      return from;
    } // if (from.constructor != Object && from.constructor != Array) return from;


    if (from.constructor == Date || from.constructor == RegExp || from.constructor == Function || from.constructor == String || from.constructor == Number || from.constructor == Boolean) {
      return new from.constructor(from);
    }

    to = to || new from.constructor();

    for (var n in from) {
      to[n] = typeof to[n] === "undefined" ? clone(from[n], null) : to[n];
    }

    return to;
  } // *** all incoming messages from underlying transport arrive here ***
  // although incoming transport information is available, it is not passed on because not needed


  function incomingMessageHandler(incomingTransportInfo, message) {
    // ToDo: good place to put a function to validate incoming message/data
    message.header.lastClient = clientName; // add last client for diagnostics

    message.header.incomingTransportInfo = incomingTransportInfo;
    routeIncomingMessage(message);
  } // *** all outbound messages exit here though the appropriate transport ***


  function sendToRouterService(message) {
    if (!transport || transport instanceof Promise) {
      console.log("RouterClient: Queuing message since router initialization not complete", message);
      queue.push(message);
    } else {
      transport.send(message);
    }
  }
  /**
   * Estimates offset to align the reference time with Router Service.  Does this by exchanging messages with RouterService, getting the service's time, and estimating communication delay.
   *
   * @private
   */


  this.calibrateTimeWithRouterService = function (callback) {
    var TARGET_HANDSHAKE_COUNT = 5;
    var handshakeCounter = 0;
    var timeOffset;
    var offsetForFastest;
    var fastestRRT = Infinity;

    function calibrationCalculation(finalHandshakeMessage) {
      var timeOffset = 0;

      for (var i = 1; i < TARGET_HANDSHAKE_COUNT; i++) {
        var startClientTime = finalHandshakeMessage.clientBaseTime[i - 1];
        var stopClientTime = finalHandshakeMessage.clientBaseTime[i];
        var rtt = stopClientTime - startClientTime; // round-trip time

        var serviceTime = finalHandshakeMessage.serviceBaseTime[i - 1];
        var offset = serviceTime - (startClientTime + rtt / 2);

        if (rtt < fastestRRT) {
          fastestRRT = rtt;
          offsetForFastest = offset;
        }

        timeOffset += offset;
        console.log("calibrationCalculation Intermediate Values", "lastRRT", rtt, "lastOffset", offset, "fastestOffset", offsetForFastest, "fastestRRT", fastestRRT);
      }

      timeOffset /= TARGET_HANDSHAKE_COUNT - 1;
      console.log("RouterClient calibrationCalculation", "Average Offset", timeOffset, "Choosen FastestOffset", offsetForFastest, finalHandshakeMessage);
      callback(offsetForFastest); // use the offset with the shortest RTT since it is often the most accurate
    }

    function timeCalibrationHandlerFunction(message) {
      handshakeCounter++;

      if (handshakeCounter > TARGET_HANDSHAKE_COUNT) {
        calibrationCalculation(message); // enough handshake data gather, so do the calibration
      } else {
        message.clientBaseTime.push(window.performance.timing.navigationStart + window.performance.now());
        sendToRouterService(new TimeCalibrationHandshakeMessage(message.clientBaseTime, message.serviceBaseTime));
      }
    }

    timeCalibrationHandler = timeCalibrationHandlerFunction; // used in routeIncomingMessage to route handshake response back to handler

    timeCalibrationHandler(new TimeCalibrationHandshakeMessage([], [])); // invoke first time to start exchanging handshakes; will be invoked each time handshake message received back from FouterService
  };
  /**
   * Backward compatibility?
   * @private
   */


  this.ready = function (cb) {
    return _this.onReady(cb);
  };
  /**
  * Get router client name.
  *
  * @param {string} newClientName string identify the client
  * FSBL.Clients.RouterClient.setClientName("MyComponent");
  * @private
  */


  this.getClientName = function () {
    console.log("RouterClient.getClientName", clientName);
    return clientName;
  }; /////////////////////////////////////////////
  // Public Functions -- The Router Client API
  /////////////////////////////////////////////

  /**
   * Checks if router is ready. May be invoked multiple times. Invokes cb when ready, which may be immediately.  Router is not ready until underlying transport to router service is ready.
   *
   * @param {function} cb callback function to invoke when router is ready
   */


  this.onReady = function (cb) {
    // Validate.args(cb, "function");
    if (isRouterReady) {
      cb();
    } else {
      parentReadyCallbackQueue.push(cb);
    }
  };
  /**
   * Add listener for incoming transmit events on specified channel. Each of the incoming events will trigger the specified event handler. The number of listeners is not limited (either local to this Finsemble window or in a separate Finsemble window).
   *
   * See [transmit]{@link RouterClientConstructor#transmit} for sending a cooresponding event message to listener. See [removeListener]{@link RouterClientConstructor#removeListener} to remove the listener.
   *
   * @param {string} channel any unique string to identify the channel (must match correspond transmit channel name)
   * @param {function} eventHandler function (see example below)
   * @example
   *
   * FSBL.Clients.RouterClient.addListener("SomeChannelName", function (error, response) {
   * 	if (error) {
   *			console.log("ChannelA Error: " + JSON.stringify(error));
   *		} else {
   *			var data = response.data;
   *			console.log("ChannelA Response: " + JSON.stringify(response));
   *		}
   * });
   *
   */


  this.addListener = function (channel, eventHandler) {
    console.log("RouterClient.addListener", "CHANNEL", channel); // Validate.args(channel, "string", eventHandler, "function");

    var firstChannelClient = addListenerCallBack(mapListeners, channel, eventHandler);

    if (firstChannelClient) {
      sendToRouterService(new AddListenerMessage(channel));
    }
  };
  /**
   * Transmit event to all listeners on the specified channel. If no listeners the event is discarded without error. All listeners to the channel in this Finsemble window and other Finsemble windows will receive the transmit.
   *
   * See [addListener]{@link RouterClientConstructor#addListener} to add a listener to receive the transmit.
   *
   * @param {string} toChannel any unique string to identify the channel (must match correspond listener channel name)
   * @param {any} event any object or primitive type to be transmitted
   * @param {object} [options] Options object for your transmit
   * @param {boolean} [options.suppressWarnings=false] By default, the Router will log warnings if you transmit to a channel with no listeners. Set this to true to eliminate those warnings.
   * @example
   *
   * FSBL.Clients.RouterClient.transmit("SomeChannelName", event);
   *
   */


  this.transmit = function (toChannel, event, options) {
    // if (!Logger.isLogMessage(toChannel)) { // logger messages
    if (options === void 0) {
      options = {
        suppressWarnings: false
      };
    }

    console.log("RouterClient.transmit", "TO CHANNEL", toChannel, "EVENT", event); // }
    // Validate.args(toChannel, "string", event, "any");

    sendToRouterService(new TransmitMessage(toChannel, event, options));
  };
  /* @TODO - This works via object reference - it relies on the physical pointer to the function object originally passed in.
  This is very confusing, and not idiomatic. Moreover, it entirely prevents a user from using anonymous functions, which will fall
  quite unexpected if the user isn't prepared. A better API would be to pass in some unique ID, or have a unique ID automatically generated,
  that could then be passed to this function, e.g:
    RouterClient.addlistener('some-channel', 'my-unique-listener-id', () => { });
  RouterClient.removeListener('some-channel', 'my-unique-listeenr-id');*/

  /**
   * Remove event listener from specified channel for the specific event handler (only listeners created locally can be removed).
   *
   * See [addListener]{@link RouterClientConstructor#addListener} for corresponding add of a listener.
   *
   * @param {string} channel unique channel name to remove listener from
   * @param {function} eventHandler function used for the event handler when the listener was added
   */


  this.removeListener = function (channel, eventHandler) {
    console.log("RouterClient.removelistener", "CHANNEL", channel, "EVENT HANDLER", eventHandler); // Validate.args(channel, "string", eventHandler, "function");

    var lastChannelListener = removeListenerCallBack(mapListeners, channel, eventHandler);

    if (lastChannelListener) {
      sendToRouterService(new RemoveListenerMessage(channel));
    }
  };
  /**
   * Add a query responder to the specified channel. The responder's queryEventHander function will receive all incoming queries for the specified channel (whether from this Finsemble window or remote Finsemble windows).
   *
   * *Note:* Only one responder is allowed per channel within the Finsemble application.
   *
   * See [query]{@link RouterClientConstructor#query} for sending a corresponding query-event message to this responder.
   *
   * @param {string} channel any unique string to identify the channel (must match correspond query channel name); only one responder allower per channel
   * @param {function} queryEventHandler function to handle the incoming query (see example below); note incoming queryMessage contains function to send response
   * @example
   *
   * FSBL.Clients.RouterClient.addResponder("ResponderChannelName", function (error, queryMessage) {
   *	if (error) {
   *		console.log('addResponder failed: ' + JSON.stringify(error));
   *	} else {
   *	console.log("incoming data=" + queryMessage.data);
   * 	var response="Back at ya"; // Responses can be objects or strings
   *	queryMessage.sendQueryResponse(null, response); // A QUERY RESPONSE MUST BE SENT OR THE REMOTE SIDE WILL HANG
   *	}
   * });
   *
   */


  this.addResponder = function (channel, queryEventHandler) {
    console.log("RouterClient.addResponder", "CHANNEL", channel); // Validate.args(channel, "string", queryEventHandler, "function");

    var status = addResponderCallBack(mapResponders, channel, queryEventHandler);

    if (status) {
      sendToRouterService(new addResponderMessage(channel));
    } else {
      console.log("RouterClient.addResponder: Responder already locally defined for channel " + channel);
      queryEventHandler({
        "RouteClient QueryError": "Responder already locally defined for channel" + channel
      }, null); // immediately invoke callback passing error
    }
  };
  /**
   * Send a query to responder listening on specified channel. The responder may be in this Finsemble window or another Finsemble window.
   *
   * See [addResponder]{@link RouterClientConstructor#addResponder} to add a responder to receive the query.
   *
   * @param {string} responderChannel a unique string that identifies the channel (must match the channel name on which a responder is listening)
   * @param {object} queryEvent event message sent to responder
   * @param {any} params optional params
   * @param {number} [params.timeout=20000]  timeout value for a query-response timer.  Timer defaults to 5000 milliseconds if no params value is passed in. Set timeout to zero to wait indefinitely. If the timer expires, this function call will return with an error.
   * @param {function} responseEventHandler event handler to receive the query response (sent from a responder that is listening on this channel)
   *
   * @example
   *
   * FSBL.Clients.RouterClient.query("someChannelName", {}, function (error, queryResponseMessage) {
   *	if (error) {
   *		console.log('query failed: ' + JSON.stringify(error));
   *	} else {
   *		// process income query response message
   *		var responseData = queryResponseMessage.data;
   *		console.log('query response: ' + JSON.stringify(queryResponseMessage));
   *	}
   * });
   *
   * FSBL.Clients.RouterClient.query("someChannelName", { queryKey: "abc123"}, { timeout: 1000 }, function (error, queryResponseMessage) {
   *	if (!error) {
   *		// process income query response message
   *		var responseData = queryResponseMessage.data;
   *	}
   * }); */


  this.query = function (responderChannel, queryEvent, params, responseEventHandler) {
    if (responseEventHandler === void 0) {
      responseEventHandler = Function.prototype;
    }

    var newQueryID = clientID() + "." + responderChannel;
    var timestamp = window.performance.timing.navigationStart + window.performance.now();
    var navstart = window.performance.timing.navigationStart;
    var timenow = window.performance.now(); // these timer values used for logging diagnostices

    console.log("RouterClient.query", "RESPONDER CHANNEL", responderChannel, "QUERY EVENT", queryEvent, "PARAMS", params, "QUERYID", newQueryID, {
      timestamp: timestamp,
      navstart: navstart,
      timenow: timenow
    });

    if (arguments.length === 3) {
      responseEventHandler = params;
      params = {
        timeout: 20000
      };
    } // Validate.args(responderChannel, "string", queryEvent, "any=", params, "object=", responseEventHandler, "function");


    params = params || {}; // (Validate as any).args2("params.timeout", params.timeout, "number");

    function promiseResolver(resolve) {
      //Allows us to await on queries, cleaning up code quite a bit.
      var modifiedHandler = function modifiedHandler(err, response) {
        resolve({
          err: err,
          response: response
        });
        responseEventHandler(err, response);
      };

      addQueryResponseCallBack(mapQueryResponses, newQueryID, modifiedHandler);
      addQueryResponseTimeout(mapQueryResponseTimeOut, newQueryID, responderChannel, params.timeout);
      sendToRouterService(new QueryMessage(newQueryID, responderChannel, queryEvent));
    }

    return new Promise(promiseResolver);
  };
  /**
   * Remove query responder from specified channel. Only a locally added responder can be removed (i.e. a responder defined in the same component or service).
   *
   * See [addResponder]{@link RouterClientConstructor#addResponder} for corresponding add of a query responder.
   *
   * @param {string} responderChannel string identifying the channel to remove responder from
   *
   * @example
   *
   * FSBL.Clients.RouterClient.removeResponder("someChannelName");
   *
   */


  this.removeResponder = function (responderChannel) {
    console.log("RouterClient.removeResponder", "RESPONDER CHANNEL", responderChannel); // Validate.args(responderChannel, "string");

    var status = removeResponderCallBack(mapResponders, responderChannel);

    if (status) {
      sendToRouterService(new RemoveResponderMessage(responderChannel));
    }
  };
  /**
   * Add a PubSub responder for specified topic. All subscribes and publishes to the topic will comes to responder (whether from local window or another window). Only one PubSub responder allowed per topic value in Finsemble application; however, the topic value may be a regular-expression representing a set of related topics, in which case the PubSub responder will responder to all matching topics. When a regEx topic is used, the same default functionality is provides for each matching topic -- the difference is only one PubSub responder is needed to cover a set of related topics, plus the same callback handers can be used (if provided).
   *
   * All the callback function are optional because each PubSub responder comes with build-in default functionality (described below).
   *
   * Note an exact topic match will take precedence over a regEx match, but otherwise results are unpredictable for overlapping RegEx topics.
   *
   * See [subscribe]{@link RouterClientConstructor#subscribe} and [publish]{@link RouterClientConstructor#publish} for corresponding functions sending to the PubSub responder.
   *
   * @param {string} topic unique topic for this responder, or a topic RegEx (e.g. '/abc.+/') to handle a set of topics
   * @param {object} [initialState] initial state for the topic (defaults to empty struct); can be any object
   * @param {object} [params] optional parameters
   * @param {function} [params.subscribeCallback] allows responder know of incoming subscription and accept or reject it (default is to accept)
   * @param {function} [params.publishCallback] allows responder to use the publish data to form a new state (default is the publish data becomes the new state)
   * @param {function} [params.unsubscribeCallback] allows responder to know of the unsubscribe, but it must be accepted (the default accepts)
   * @param {function} [callback] optional callback(err,res) function. If addPubSubResponder failed then err set; otherwise, res set to "success"
   *
   * @example
   *
   * function subscribeCallback(error, subscribe) {
   * 	if (subscribe) {
   * 		// must make this callback to accept or reject the subscribe (default is to accept). First parm is err and second is the initial state
   * 		subscribe.sendNotifyToSubscriber(null, { "NOTIFICATION-STATE": "One" });
   * 	}
   * }
   * function publishCallback(error, publish) {
   * 	if (publish) {
   * 		// must make this callback to send notify to all subscribers (if error parameter set then notify will not be sent)
   * 		publish.sendNotifyToAllSubscribers(null, publish.data);
   * 	}
   * }
   * function unsubscribeCallback(error, unsubscribe) {
   * 	if (unsubscribe) {
   * 		// must make this callback to acknowledge the unsubscribe
   * 		unsubscribe.removeSubscriber();
   * 	}
   * }
   * FSBL.Clients.RouterClient.addPubSubResponder("topicABC", { "State": "start" },
   * 	{
   * 		subscribeCallback:subscribeCallback,
   * 		publishCallback:publishCallback,
   * 		unsubscribeCallback:unsubscribeCallback
   * 	});
   *
   *   or
   *
   * FSBL.Clients.RouterClient.addPubSubResponder("topicABC", { "State": "start" });
   *
   *   or
   *
   * FSBL.Clients.RouterClient.addPubSubResponder(\/topicA*\/, { "State": "start" });
   *
   */


  this.addPubSubResponder = function (topic, initialState, params, callback) {
    var error;
    var response;
    console.log("RouterClient.addPubSubResponder", "TOPIC", topic, "INITIAL STATE", initialState, "PARAMS", params); // Validate.args(topic, "any", initialState, "object=", params, "object=");

    params = params || {}; // Validate.args2("params.subscribeCallback", params.subscribeCallback, "function=", "params.publishCallback", params.publishCallback, "function=") &&
    // 	(Validate as any).args2("params.unsubscribeCallback", params.unsubscribeCallback, "function=");

    var status = addPubSubResponderCallBack(topic, params.subscribeCallback, params.publishCallback, params.unsubscribeCallback);

    if (status) {
      initialState = initialState || {};
      mapPubSubResponderState[topic.toString()] = clone(initialState, null);
      sendToRouterService(new AddPubSubResponderMessage(topic.toString()));
      response = "success";
    } else {
      error = "RouterClient.addPubSubResponder: Responder already locally defined for topic " + topic;
      console.log(error);
    }

    if (callback) {
      callback(error, response);
    }
  };
  /**
   * Remove pubsub responder from specified topic. Only locally created responders (i.e. created in local window) can be removed.
   *
   * See [addPubSubResponder]{@link RouterClientConstructor#addPubSubResponder} for corresponding add of a SubPub responder.
   *
   * @param {string} topic unique topic for responder being removed (may be RegEx, but if so much be exact regEx used previously with addPubSubResponder)
   *
   * @example
   *
   * FSBL.Clients.RouterClient.removePubSubResponder("topicABC");
   *
   */


  this.removePubSubResponder = function (topic) {
    console.log("RouterClient.removePubSubResponder", "TOPIC", topic); // Validate.args(topic, "any");

    var status = removeResponderCallBack(mapPubSubResponders, topic);

    if (status) {
      delete mapPubSubResponderState[topic.toString()]; // remove corresponding state

      delete mapPubSubResponderRegEx[topic.toString()]; // may be a RegEx

      sendToRouterService(new RemovePubSubResponderMessage(topic));
    } else {
      console.log("RouterClient.removePubSubResponder failed: Could not find responder for topic " + topic);
    }
  };
  /**
   * Subscribe to a PubSub Responder. Each responder topic can have many subscribers (local in this window or remote in other windows). Each subscriber immediately (but asyncronouly) receives back current state in a notify; new notifys are receive for each publish sent to the same topic.
   *
   * See [addPubSubResponder]{@link RouterClientConstructor#addPubSubResponder} for corresponding add of a SubPub responder to handle the subscribe. See [publish]{@link RouterClientConstructor#publish} for corresponding publish to notify the subscriber.
   *
   * @param {string} topic topic being subscribed to
   * @param {function} notifyCallback invoked for each income notify for the given topic (i.e. initial notify plus for each publish)
   * @returns {object} subscribe-id optionally used for unsubscribing later
   *
   * @example
   *
   * var subscribeId = RouterClient.subscribe("topicABC", function(err,notify) {
   *		if (!err) {
   *			var notificationStateData = notify.data;
   *			// do something with notify data
   *  	}
   * });
   *
   */


  this.subscribe = function (topic, notifyCallback) {
    console.log("RouterClient.subscribe", "TOPIC", topic); // Validate.args(topic, "string", notifyCallback, "function");

    var subscribeID = clientID();
    addSubscriberCallBack(mapSubscribersID, subscribeID, notifyCallback, topic);
    sendToRouterService(new SubscribeMessage(subscribeID, topic));
    return {
      "subscribeID": subscribeID,
      "topic": topic
    };
  };
  /**
   * Publish to a PubSub Responder, which will trigger a corresponding Notify to be sent to all subscribers (local in this window or remote in other windows). There can be multiple publishers for a topic (again, in same window or remote windows)
   *
   * See [addPubSubResponder]{@link RouterClientConstructor#addPubSubResponder} for corresponding add of a SubPub responder to handle the publish (i.e. sending notifications to all subscriber). See [Subscribe]{@link RouterClientConstructor#addPubSubResponder} for corresponding subscription to receive publish results (in the form of a notify event)
   *
   * @param {string} topic topic being published to
   * @param {object} event topic state to be published to all subscriber (unless the SubPub responder optionally modifies in between)
   *
   * @example
   *
   * FSBL.Clients.RouterClient.publish("topicABC", topicState);
   *
   */


  this.publish = function (topic, event) {
    console.log("RouterClient.publish", "TOPIC", topic, "EVENT", event); // Validate.args(topic, "string", event, "any");

    sendToRouterService(new PublishMessage(topic, event));
  };
  /**
   * Unsubscribe from PubSub responder so no more notifications received (but doesn't affect other subscriptions). Only works from the window the PubSub responder was created in.
   *
   * See [subscribe]{@link RouterClientConstructor#subscribe} for corresponding subscription being removed.
   *
   * @param {object} subscribeID the id return from the corresponding subscribe for the topic
   *
   * @example
   *
   * FSBL.Clients.RouterClient.unsubscribe(subscribeId);
   *
   */


  this.unsubscribe = function (subscribeIDStruct) {
    console.log("RouterClient.unsubscribe", "SUBSCRIBE ID", subscribeIDStruct); // Validate.args(subscribeIDStruct, "object") && (Validate as any).args2("subscribeIDStruct.subscribeID", subscribeIDStruct.subscribeID, "string");

    var deletedSubscriber = removeSubscriberCallBack(mapSubscribersID, subscribeIDStruct.subscribeID);

    if (deletedSubscriber) {
      sendToRouterService(new UnsubscribeMessage(subscribeIDStruct.subscribeID, subscribeIDStruct.topic));
    } else {
      console.log("RouterClient.unsubscribe: Could not find subscribeID for topic " + subscribeIDStruct.topic);
    }
  };
  /**
   * Test an incoming router message to see if it originated from the same origin (e.g. a trusted source...not cross-domain). Currently same origin is known only because a sharedWorker transport is used (by definition SharedWorkers do not work cross-domain).  This means any message coming in over the Inter-application Bus will not be trusted; however, by default all same-origin components and services connect to the router using a SharedWorker transport.
   * @param {object} incomingMessage an incoming router message (e.g. transmit, query, notification) to test to see if trusted.
   *
   * @example
   * FSBL.Clients.RouterClient.trustedMessage(incomingRouterMessage);
   */


  this.trustedMessage = function (incomingMessage) {
    var isTrusted = true; // temporarily make all trusted so no problems if changing router transport

    console.log("RouterClient.trustedMessage header", incomingMessage.header);

    if (incomingMessage.header.originIncomingTransportInfo.transportID === "SharedWorker") {
      isTrusted = true;
    }

    return isTrusted;
  };
  /*
   * @TODO: consider adding disconnectAllListerns(), disconnectAllResponders(), disconnectAllSubscribers()
  */

  /**
   * Removes all listeners, responders, and subscribers for this router client -- automatically called when client is shutting down. Can be called multiple times.
   */


  this.disconnectAll = function () {
    console.log("RouterClient.disconnectAll");

    for (var channel in mapListeners) {
      console.log("RouterClient.disconnectAll is removing listener on " + channel);
      sendToRouterService(new RemoveListenerMessage(channel));
      delete mapListeners[channel];
    }

    for (var responderChannel in mapResponders) {
      console.log("RouterClient.disconnectAll is removing responder on " + responderChannel);
      sendToRouterService(new RemoveResponderMessage(responderChannel));
      delete mapResponders[responderChannel];
    }

    for (var topic in mapPubSubResponders) {
      console.log("RouterClient.disconnectAll is removing pubsub responder on " + topic);
      sendToRouterService(new RemovePubSubResponderMessage(topic));
      delete mapPubSubResponders[topic.toString()]; // could be a RegEx

      delete mapPubSubResponderState[topic.toString()]; // remove corresponding state

      delete mapPubSubResponderRegEx[topic.toString()]; // may be a RegEx
    }

    for (var subscribeID in mapSubscribersID) {
      var stopic = mapSubscribersTopic[subscribeID];
      console.log("RouterClient.disconnectAll is removing subscriber on " + stopic);
      sendToRouterService(new UnsubscribeMessage(subscribeID, stopic));
      delete mapSubscribersID[subscribeID];
      delete mapSubscribersTopic[subscribeID];
    }
  }; //Prevent the loggerService window's routerClient from logging to itself. Instead, log locally for it. It's unlikely that we need to get the loggerService's routermessages. If we do, just uncomment this.
  // if (System.Window.getCurrent().name === "loggerService") {
  // 	Logger = new LocalLogger();
  // }


  clientName = baseClientName + "." + window.name;
  /** @TODO - Move this to factory function, something like getRouterClient. */
  // if (clientName in Globals.FSBLData.RouterClients) { // if previously constructed then return that existing client
  // 	console.log(`"RouterClient Check: reusing existing client for ${clientName}`);
  // 	console.debug(`"RouterClient Check: reusing existing client for ${clientName}`, window);
  // } else {
  // 	console.log(`"RouterClient Check: constructing new client for ${clientName}`);
  // 	console.debug(`"RouterClient Check: constructing new client for ${clientName}`, window);
  // Globals.FSBLData.RouterClients[clientName] = this;

  constructor(clientName, "FinsembleTransport"); // constructure new router client
  // }

  return this;
};
},{"./routerTransport":"Ihov"}],"DcA4":[function(require,module,exports) {
"use strict";
/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/

Object.defineProperty(exports, "__esModule", {
  value: true
});
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
  clientName: "RouterClient"
});
exports.default = RouterClientInstance;
},{"./routerClientConstructor":"YdeX"}],"p47B":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var LauncherClient =
/** @class */
function () {
  function LauncherClient(routerClient) {
    if (routerClient.default) {
      this.routerClient = routerClient.default;
    } else {
      this.routerClient = routerClient;
    }
  }

  LauncherClient.prototype.Spawn = function (component, parameters, callback) {
    var parameters = {};
    parameters["component"] = component;
    this.routerClient.query("Launcher.spawn", parameters, {}, callback);
  }; //-----------------------------------------------------------------------------------------------------------


  LauncherClient.prototype.ShowWindow = function (windowIdentifier, parameters, callback) {
    parameters["windowIdentifier"] = windowIdentifier;
    parameters["relativeWindow"] = windowClient.windowIdentifier;
    this.routerClient.query("Launcher.showWindow", parameters, {}, callback);
  };

  LauncherClient.prototype.AddToGroups = function (parameters, callback) {
    if (parameters["windowIdentifier"] == null) {
      parameters["windowIdentifier"] = windowClient.windowIdentifier;
    }

    this.routerClient.query("LauncherService.addWindowToGroups", parameters, {}, callback);
  };

  LauncherClient.prototype.BringWindowsToFront = function (parameters, callback) {
    // if (parameters["windowList"] == null && parameters["groupName"] == null && parameters["componentType"] == null) {
    parameters["windowList"] = windowClient.windowIdentifier; // }

    this.routerClient.transmit("LauncherService.bringWindowsToFront", parameters);
    callback;
  };

  return LauncherClient;
}();

exports.default = LauncherClient;
},{}],"ny1/":[function(require,module,exports) {
"use strict";

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var routerClientInstance_1 = __importDefault(require("./routerClient/routerClientInstance"));

var launcherClient_1 = __importDefault(require("./clientBridge/launcherClient"));

var launcherClient = new launcherClient_1.default(routerClientInstance_1.default);
window.finsembleActions = {
  transmit: function transmit(topic, data) {
    routerClientInstance_1.default.transmit(topic, JSON.stringify(data), {});
  },
  spawn: function spawn(component, params) {
    launcherClient.Spawn(component, params, function () {});
  },
  publish: function publish(topic, data) {
    routerClientInstance_1.default.publish(topic, data);
  },
  subscribe: function subscribe(topic, callback) {
    routerClientInstance_1.default.subscribe(topic, callback);
  },
  query: function query(topic, data, callback) {
    routerClientInstance_1.default.query(topic, data, callback); //Typical callback
    // function (error, queryResponseMessage) {
    // 	if (error) {
    // 		console.log('query failed: ' + JSON.stringify(error));
    // 	} else {
    // 		// process income query response message
    // 		console.log('query response: ', queryResponseMessage);
    // 	}
    // }
  }
};
},{"./routerClient/routerClientInstance":"DcA4","./clientBridge/launcherClient":"p47B"}]},{},["ny1/"], null)