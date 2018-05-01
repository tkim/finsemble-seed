(() => {
    "use strict";

    // #region Imports
    const { exec } = require("child_process");
    const fs = require("fs");
    const path = require("path");
    // #endregion

    // #region Functions
    /**
     * Performs recursive copy of one folder to another.
     * 
     * @param {string} srcDir The source directory for the copy
     * @param {string} destDir The destination directory for the copy
     */
    const copy = (srcDir, destDir) => {
        // Create the destination folder, if it doesn't exist.
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir);
        }

        const list = fs.readdirSync(srcDir);
        list.forEach((file) => {
            const src = path.join(srcDir, file);
            const dest = path.join(destDir, file);
            const stat = fs.statSync(src);
            if (stat && stat.isDirectory()) {
                copy(src, dest);
            } else {
                try {
                    console.log(`copying file: ${dest}`);
                    fs.writeFileSync(dest, fs.readFileSync(src));
                } catch (e) {
                    console.error(`couldn't copy file: ${dest}`);
                }
            }
        });
    }

    /**
     * Gets the path to the seed project. If path is passed in via command line arguments, it is used, otherwise, it is
     * assumed that the script folder is a sub-folder of the seed project.
     * 
     * @param {string[]} args The process arguments
     * @returns The path to the seed project
     */
    const getSeedPath = (args) => {
        let seedPath;
        if (!args || (args.length === 2)) {
            // No args passed, use default
            seedPath = path.resolve(__dirname, "..");
        } else {
            // Read path from arguments
            const passedPath = path.resolve(args[2]);
            if (fs.existsSync(passedPath) && fs.statSync(passedPath).isDirectory()) {
                seedPath = passedPath;
            } else {
                console.error(`Path passed in does not exist: ${passedPath}`);
                process.exit(1);
            }
        }

        // Verify expected folders exist
        if (!fs.existsSync(path.join(seedPath, "src")) ||
            !fs.existsSync(path.join(seedPath, "build")) ||
            !fs.existsSync(path.join(seedPath, "configs"))) {
            console.error(`Expected paths not found. Seed project should have src, build and configs folders`);
            process.exit(1);
        }

        return seedPath;
    }
    // #endregion

    // #region Paths
    const seedPath = getSeedPath(process.argv);
    const serviceSrc = path.join(__dirname, "services", "yellowfin");
    const serviceDest = path.join(seedPath, "src", "services", "yellowfin");
    const componentSrc = path.join(__dirname, "components", "yellowfin");
    const componentDest = path.join(seedPath, "src", "components", "yellowfin");
    const webpackConfigPath = path.join(seedPath, "build", "webpack", "webpack.components.entries.json");
    const componentConfigPath = path.join(seedPath, "configs", "application", "components.json");
    const serviceConfigPath = path.join(seedPath, "configs", "application", "services.json");
    // #endregion

    const webpackConfig = require(webpackConfigPath);
    const yellowfinWebpackConfig = require("./yellowfin.webpack.components.entries.json");
    const componentConfig = require(componentConfigPath);
    const yellowfinComponentsConfig = require("./yellowfin.components.json");
    const serviceConfig = require(serviceConfigPath);
    const yellowfinServicesConfig = require("./yellowfin.services.json");

    // Update build
    const updatedWebpackConfig = Object.assign(webpackConfig, yellowfinWebpackConfig);
    fs.writeFileSync(webpackConfigPath, JSON.stringify(updatedWebpackConfig, null, "\t"));
    console.log(`Updated ${webpackConfigPath}`);

    // Update component configuration
    componentConfig.components = Object.assign(componentConfig.components, yellowfinComponentsConfig.components);
    fs.writeFileSync(componentConfigPath, JSON.stringify(componentConfig, null, "\t"));
    console.log(`Updated ${componentConfigPath}`);

    // Update service configuration
    serviceConfig.services = Object.assign(serviceConfig.services, yellowfinServicesConfig.services);
    fs.writeFileSync(serviceConfigPath, JSON.stringify(serviceConfig, null, "\t"));
    console.log(`Updated ${serviceConfigPath}`);

    // Copy yellowfin service
    copy(serviceSrc, serviceDest);
    console.log("Copied Yellowfin service and client");

    // Copy yellowfin components
    copy(componentSrc, componentDest);
    console.log("Copied Yellowfin components");

    const checkVersion = () => {
        // Check Finsemble version
        console.log(`Checking Finsemble version in ${seedPath}`);
        exec(
            "node ./node_modules/@chartiq/finsemble-cli/finsemble.js --version",
            { cwd: seedPath },
            (error, stdout, stderr) => {
                if (error) {
                    console.error(error);
                } else if (stderr && !stdout) {
                    console.error(stderr);
                } else {
                    if (!stdout.includes("Finsemble version")) {
                        console.error(`Finsemble not found in ${seedPath}, please run "npm install" in that folder first.`);
                    } else {
                        const results = /.*Finsemble version.*(\d+\.\d+\.\d+)/g.exec(stdout);
                        const finsembleVersion = results[1];

                        const versionParts = finsembleVersion.split(".");
                        if ((Number.parseInt(versionParts[0]) < 2) ||
                            ((versionParts[0] === "2") && Number.parseInt(versionParts[1]) < 4)) {
                            console.error(`Requires Finsemble 2.4 or newer. Version found: ${finsembleVersion}`);
                        } else {
                            console.log(`Finsemble version is good. Version found: ${finsembleVersion}`);
                            console.log("Done");
                        }
                    }
                }

                process.exit();
            });
    };

    // Install node modules
    console.log(`Installing required node modules to ${seedPath}`);
    exec(`npm install jquery jquery.soap jquery-xml2json --save-prod`, { cwd: seedPath }, (error, stdout, stderr) => {
        if (error) {
            console.error(error);
        } else if (stderr) {
            console.error(stderr);
        }

        checkVersion();
    });
})()