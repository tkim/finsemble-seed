[![Finsemble Logo](https://documentation.chartiq.com/finsemble/styles/img/Finsemble_Logo_Dark.svg)](https://documentation.chartiq.com/finsemble/)

# Finsemble Seed Project

To get started with Finsemble, check out the [seed project tutorial](https://www.chartiq.com/tutorials/finsemble-seed-project). This tutorial walks you through setting up the seed project and introduces you to the basic concepts of developing a Finsemble smart desktop.

For everything you need to know about Finsemble, including our API documentation, check out the [developer documentation](https://documentation.chartiq.com/finsemble).

## Project structure

The Finsemble seed project provides a basic structure to help developers get up and running as quickly as possible. The seed project provides the skeleton of a Finsemble application that can be extended to suit your organization's needs. It also includes some functionality to make development faster and easier, like a basic build process.

- _gulpfile.js_ - The main gulpfile for the project includes the basic tasks used to build and run a Finsemble application for development.
- _gulpfile-extension.js_ (optional) - File that can be used to add/modify the functionality of the gulpfile. This file is included to prevent conflicts when upgrading your base project.
- _build/webpack_ - Includes all of the files used by the seed project to build the application.
    - _webpack.finsemble-built-in.entries.json_ - This specifies the entry and output files for the files built for a default Finsemble smart desktop.
    - _webpack.components.entries.json_ - This file is where developer-added files should be listed. This file is empty in the base Finsemble seed project to prevent merge conflicts when updating the seed project.
    - _webpack.adapters.entries.json_ - This file is for any storage adapters that need to be built. They are no longer housed in the same webpack configuration as components, as they cannot use the same plugins as components use.
- _configs/application_ - This folder contains all of the base configurations for the Finsemble application. _component.json_, _config.json_ and _services.json_ are empty and developer-added configuration should go here. The files in this folder are merged together to build the application configuration. This configuration can be changed at run time using dynamic configuration.
- _configs/openfin_ - Contains the application manifest used to start up the Finsemble application. The default manifest for development is included, and additional configurations can be placed in this folder.
- _configs/other/server-environment-startup.json_ - Used to define the development and production server configurations used by the Finsemble application.
- _server_ - Contains the server that hosts the built _dist_ folder for development purposes.
    - _server/server-extensions.md_ - Optional file that can be used to add functionality to the development server.
- _src_ - The folder where your Finsemble components should be placed for the Finsemble build process.
- _src-built-in_ - Includes the source for the default UI components included with the Finsemble seed project. These files can be extended as desired, but, if you do extend these components, we recommend you copy the folder to the _src_ directory to prevent merge conflicts when upgrading the seed project.
    - _src-built-in/adapters_ - Contains an example Storage Adapter that saves data to local storage.
    - _src-built-in/components/assets_ - Contains the SASS, CSS and images used to create Finsemble's look and feel.
- _tutorials_ - Contains the source for the components used by our [seed project tutorial](https://www.chartiq.com/tutorials/?slug=finsemble-seed-project).

## Upgrading
If you are moving from a version of the Finsemble seed project older than 2.3, please see the [instructions here](https://github.com/ChartIQ/finsemble-seed/tree/master/migration/2.3).

---

## Java POC

The purpose of this POC is to demonstrate the use of Finsemble's Java API with Java Swing and with a Tomcat server. This project includes a number of Java based components: Java Swing, JSP HTML component (hosted by started Tomcat server), Tomcat menu launchers (start/stop from script and services), and a Tomcat manager component. The project also includes an HTML/JavaScript component. These components are able to share context within Finsemble demonstrated by synchronizing a color between all of the different components. 

Included components:
- **commerzbank_poc_html** - Standard HTML/JavaScript component listening for color changes
- **commerzbank_poc_swing** - Java Swing application that can change the selected color, and publish the color to other components
- **commerzbank_poc_headless** - A small windowless Java application that sends log messages to Finsemble every second
- **commerzbank_poc_jsp** - JSP application hosted by Tomcat. Can Launch the Java Swing example and the HTML example using either the Java API or the JavaScript API.
- **Start Tomcat Script** - Starts the Tomcat server via the startup script
- **Stop Tomcat Script** - Stops the Tomcat server via the shutdown script
- **Start Tomcat Service** -  Starts the Tomcat service via the command line (requires administrator privileges)
- **Stop Tomcat Service** -  Stops the Tomcat service via the command line (requires administrator privileges)
- **Tomcat manager** - Simple component that can start and stop the Tomcat server and track whether it is currently running. 

### Setup

1) Install [Tomcat](https://tomcat.apache.org/download-90.cgi) - Default location is _C:\Program Files\Apache Software Foundation/Tomcat 9.0_. If your install location is different, please update the `tomcatPath` in _configs/openfin/manifest-local.json_.
1) Check out `master` of [finsemble-jar](https://github.com/ChartIQ/finsemble-jar) project
1) Run `mvn install` on the project to install it locally
1) Check out `POC/Commerzbank` of [finsemble-java-example](https://github.com/ChartIQ/finsemble-java-example)
1) Run `mvn package` to build the JAR and WAR files
1) Copy the generated _CommerzPOCWebApp.war_ to the Tomcat webapps directory (e.g. _C:\Program Files\Apache Software Foundation\Tomcat 9.0\webapps_)
1) Update the `javaExampleJarPath` in _configs/openfin/manifest-local.json_ to point the _target_ directory of the `finsemble-java-example` project.
1) Checkout the `POC/Commerzbank` of [finsemble-seed](https://github.com/ChartIQ/finsemble-seed) (this project)
1) Run `npm install`
1) Run `npm run dev` to start finsemble

### Walk-through

1) Launch **Tomcat Manager** from the **Apps** menu
1) Click the **Start Embedded Tomcat** button to start the ebedded Tomcat server
    - The status in the Tomcat manager should change from "Stopped" to "Running"
    - The **commerz_poc_jsp** app should open
1) Click the **Start Tomcat Script** button to start the Tomcat server
    - You should see a command window showing that server has started
    - The status in the Tomcat manager should change from "Stopped" to "Running"
    - The **commerz_poc_jsp** app should open
1) Click the **Spawn Swing by Servlet** button in **commerz_poc_jsp** component
    - The **Commerz POC Swing** window should open
1) Click the **Spawn HTML by Servlet** button in **commerz_poc_jsp** component
    - The **commerz_poc_html** window should open
1) Click the **Spawn Swing by JavaScript** button in **commerz_poc_jsp** component
    - The **Commerz POC Swing** window should open
1) Click the **Spawn HTML by JavaScript** button in **commerz_poc_jsp** component
    - The **commerz_poc_html** window should open
1) In one of the **Commerz POC Swing** windows, click the **Change Color** button then click the **Publish Color** button
    - All of the open windows should update with the new color
1) Click **Default Workspace** on the toolbar, then click **Save As** and give the new workspace a name
1) Click the Workspace menu and click the name of the newly created workspace
    - The windows of the workspace should close and reload with the same state (e.g. color)
1) Close both **Commerz POC Swing** windows, both **commerz_poc_html** windows and the **commerz_poc_jsp** window
1) Click **Stop Tomcat Script** in the **Tomcat Manager** window
    - The status in the **Tomcat Manager** window should change to "Stopped"
1) Click **Stop Embedded Tomcat** in the **Tomcat Manager** window
    - The status in the **Tomcat Manager** window should change to "Stopped"
1) Launch **commerz_poc_jsp** from the **Apps* menu
    - The window should be blank because the Tomcat server is stopped
1) Click on the Finsemble icon at the left of the toolbar, then click **Central Logger** from the menu
1) Under **Filters**, type "headless" into the first field
1) Click **commerz_poc_headless** from the **Apps** menu
    - You should see "Commerz POC headless event was raised" messages in the central logger every five seconds
