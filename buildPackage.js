(() => {
    "use strict";

    // #region Imports
    const archiver = require("archiver");
    const copyDir = require("copy-dir");
    const fs = require("fs");
    const path = require("path");
    const rimraf = require("rimraf");
    // #endregion

    const exampleFolder = path.join(__dirname, "yellowfinExample");
    const zipFilename = "yellowfinExample.zip";

    // #region Functions
    /**
     * Create ZIP file.
     * 
     * @param {string} filename The name of the ZIP file to create
     * @param {string[]} fileFilter Array of file filters to include in ZIP
     * @param {function} cb Callback called when error occurs or ZIP file has been created. 
     */
    const createZip = (filename, fileFilter, cb) => {
        const output = fs.createWriteStream(path.join(__dirname, filename));
        const archive = archiver("zip");

        output.on("close", () => { cb(null); });

        archive.on("error", err => { cb(err); });

        archive.pipe(output);

        fileFilter.forEach(value => archive.glob(value, { dot: true }));

        archive.finalize();
    }
    // #endregion

    console.log("Creating Yellowfin example package");

    // Delete existing ZIP
    if (fs.existsSync(zipFilename)) {
        console.log("\tDeleting existing ZIP")
        fs.unlinkSync(zipFilename);
    }

    // Create yellowfinExample folder
    if (fs.existsSync(exampleFolder)) {
        // Delete directory if it exists
        console.log(`\tDeleting ${exampleFolder}`);
        rimraf.sync(exampleFolder);
    }

    // Create directory
    fs.mkdirSync(exampleFolder);

    // copy src/services to yellowfinExample/services
    console.log("\tCopying services");
    copyDir.sync(path.join(__dirname, "src", "services"), path.join(exampleFolder, "services"));

    // copy src/components to yellowfinExample/components
    console.log("\tCopying components");
    copyDir.sync(path.join(__dirname, "src", "components"), path.join(exampleFolder, "components"));

    // Create yellowfin.components.json in yellowfinExample
    console.log("\tCopying component config");
    fs.copyFileSync(
        path.join(__dirname, "configs", "application", "components.json"),
        path.join(exampleFolder, "yellowfin.components.json"));

    // Create yellowfin.services.json in yellowfinExample
    console.log("\tCopying service config");
    fs.copyFileSync(
        path.join(__dirname, "configs", "application", "services.json"),
        path.join(exampleFolder, "yellowfin.services.json"));

    // Create yellowfin.webpack.components.entries.json in yellowfinExample
    console.log("\tCopying build config");
    fs.copyFileSync(
        path.join(__dirname, "build", "webpack", "webpack.components.entries.json"),
        path.join(exampleFolder, "yellowfin.webpack.components.entries.json"));

    // copy addYellowfin.js to yellowfinExample
    console.log("\tCopying setup script");
    fs.copyFileSync(
        path.join(__dirname, "addYellowfin.js"),
        path.join(exampleFolder, "addYellowfin.js"));

    // Create zip folder of the exampleFolder contents.
    console.log("\tCreating ZIP package");
    createZip(
        zipFilename,
        [path.join(exampleFolder, "**", "*")],
        () => { console.log("Package created"); process.exit() });
})()