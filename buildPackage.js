(() => {
    "use strict";

    const copyDir = require("copy-dir");
    const fs = require("fs");
    const path = require("path");
    const rimraf = require("rimraf");

    const exampleFolder = path.join(__dirname, "yellowfinExample");

    // create yellowfinExample folder
    if (fs.existsSync(exampleFolder)) {
        // Delete directory if it exists
        rimraf.sync(exampleFolder);
    }

    // Create directory
    fs.mkdirSync(exampleFolder);

    // copy src/services to yellowfinExample/services
    copyDir.sync(path.join(__dirname, "src", "services"), path.join(exampleFolder, "services"));

    // copy src/components to yellowfinExample/components
    copyDir.sync(path.join(__dirname, "src", "components"), path.join(exampleFolder, "components"));

    // Create yellowfin.components.json in yellowfinExample
    fs.copyFileSync(
        path.join(__dirname, "configs", "application", "components.json"),
        path.join(exampleFolder, "yellowfin.components.json"));

    // Create yellowfin.services.json in yellowfinExample
    fs.copyFileSync(
        path.join(__dirname, "configs", "application", "services.json"),
        path.join(exampleFolder, "yellowfin.services.json"));


    // Create yellowfin.webpack.components.entries.json in yellowfinExample
    fs.copyFileSync(
        path.join(__dirname, "build", "webpack", "webpack.components.entries.json"),
        path.join(exampleFolder, "yellowfin.webpack.components.entries.json"));

    // copy addYellowfin.js to yellowfinExample
    fs.copyFileSync(
        path.join(__dirname, "addYellowfin.js"),
        path.join(exampleFolder, "addYellowfin.js"));

    // Zip folder
    // TODO: Add zip
})()