#!/usr/bin/env bash

indexPath="./node_modules/@chartiq/finsemble-electron-adapter/startup/devIndex.js"
cwd="./node_modules/@chartiq/finsemble-electron-adapter"
electronPath="./node_modules/.bin/electron"
debugArg="--remote-debugging-port=9090 --inspect=5858"
manifest="http://localhost:3375/configs/openfin/manifest-local.json"

set ELECTRON_DEV=true && ${electronPath} ${indexPath} ${debugArg} --manifest ${manifest}
