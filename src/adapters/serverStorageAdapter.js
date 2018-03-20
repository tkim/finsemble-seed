/**
 * This file is a copy of the default localStorage adapter, the default storage model used by finsemble-seed.
 * It's provided as an example. Feel free to modify, add to, or erase parts of it.
 *
 * Core Finsemble calls are written with key-value pair databases in mind. If you want to use a different database type, you will need to translate the key/value pairs passed in from finsemble so that you can successfully retrieve them at a later time.
 */

/**
 * We have a baseStorage model that provides some methods, such as `getCombinedKey`, which will return a nice key to save our value under. Example: `Finsemble:defaultUser:finsemble:activeWorkspace`. That key would hold the value of our activeWorkspace.
 */
var BaseStorage = require("@chartiq/finsemble").models.baseStorage;
var Logger = require("@chartiq/finsemble").Clients.Logger;
//Because calls to this storage adapter will likely come from many different windows, we will log successes and failures in the central logger.
Logger.start();
const axios = require("axios");
const path = require("path");
const SERVER_ENDPOINT = "/storageAdapter";
const SERVER_GET_ENDPOINT = SERVER_ENDPOINT + "/get";
const SERVER_SAVE_ENDPOINT = SERVER_ENDPOINT + "/save";

var Axios = axios.create({
    timeout: 1000,
    headers: { 'X-Custom-Header': 'foobar' }
});

var ServerStorageAdapter = function (uuid) {
    BaseStorage.call(this, arguments);
	/**
	 * Save method.
	 * @param {object} params
	 * @param {string} params.topic A topic under which the data should be stored.
	 * @param {string} params.key The key whose value is being set.
	 * @param {any} params.value The value being saved.
	 * @param {function} cb callback to be invoked upon save completion
	 */
    this.save = function (params, cb) {
        Logger.system.debug("savingggg", params);
        var combinedKey = this.getCombinedKey(this, params);
        console.log("ServerStorage.save", params);
        Axios.post(SERVER_SAVE_ENDPOINT, {
            key: combinedKey,
            value: JSON.stringify(params.value)
        })
            .then(response => {
                cb(null, { status: "success" });
            })
            .catch(err => {
                console.log("ERROR< TYPE OF", typeof err);
                cb(JSON.stringify(err), null);
            })
    };

    /**
	 * Get method.
	 * @param {object} params
	 * @param {string} params.topic A topic under which the data should be stored.
	 * @param {string} params.key The key whose value is being set.
	 * @param {function} cb callback to be invoked upon completion
	 */
    this.get = function (params, cb) {
        var combinedKey = this.getCombinedKey(this, params);
        console.log("ServerStorage.get");
        Axios.post(SERVER_GET_ENDPOINT, {
            key: combinedKey
        })
            .then(response => {
                let { data } = response;
                if (data === "") data = null;
                cb(null, data);
            })
            .catch(err => {
                console.log("ERROR", err);
                cb(JSON.stringify(err), null);
            })
    };

    // return prefix used to filter keys
    this.getKeyPreface = function (self, params) {
        var preface = self.baseName + ":" + self.userName + ":" + params.topic + ":";
        if ("keyPrefix" in params) {
            preface = preface + params.keyPrefix;
        }
        return preface;
    };

	/**
	 * Returns all keys stored in Storage.
	 * @param {*} params
	 * @param {*} cb
	 */
    this.keys = function (params, cb) {
        var keys = [];
        var keyPreface = this.getKeyPreface(this, params);
        var keysRegExp = new RegExp(keyPreface + ".*"); // regex to find all keys for this topic

        for (var i = 0, len = localStorage.length; i < len; ++i) {
            var oneKey = localStorage.key(i);
            if (keysRegExp.test(oneKey)) { // if key is for this topic then save it
                keys.push(oneKey);
            }
        }

        Logger.system.debug("Storage.keys for keyPreface=" + keyPreface + " with keys=" + keys);
        return cb(null, keys);
    };

	/**
	 * Delete method.
	 * @param {object} params
	 * @param {string} params.topic A topic under which the data should be stored.
	 * @param {string} params.key The key whose value is being deleted.
	 * @param {function} cb callback to be invoked upon completion
	 */
    this.delete = function (params, cb) {
        var combinedKey = this.getCombinedKey(this, params);
        localStorage.removeItem(combinedKey);
        Logger.system.debug("Storage.delete for key=" + combinedKey);
        return cb(null, { status: "success" });
    };

	/**
	 * This method should be used very, very judiciously. It's essentially a method designed to wipe the database for a particular user.
	 */
    this.clearCache = function (params, cb) {
        console.log("clear local cache");
        var arr = []; // Array to hold the keys
        // Iterate over localStorage and insert data related to the user into an array.
        for (var i = 0; i < localStorage.length; i++) {
            console.log("localStorage.key(i):::", localStorage.key(i).substring(0, (this.baseName + ":" + this.userName).length));
            if (localStorage.key(i).substring(0, (this.baseName + ":" + this.userName).length) === this.baseName + ":" + this.userName) {
                arr.push(localStorage.key(i));
            }
        }

        // Iterate over arr and remove the items by key
        for (var i = 0; i < arr.length; i++) {
            console.log("remove Iem", arr[i]);
            localStorage.removeItem(arr[i]);
        }
        return cb();
    };

	/**
	 * Wipes the storage container.
	 * @param {function} cb
	 */
    this.empty = function (cb) {
        localStorage.clear();
        Logger.system.debug("Storage.empty");
        return cb(null, { status: "success" });
    };

};


ServerStorageAdapter.prototype = new BaseStorage();
new ServerStorageAdapter("ServerStorageAdapter");

module.exports = ServerStorageAdapter;//Allows us to get access to the unintialized object