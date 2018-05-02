# Yellowfin README 

## Installation 

To install the Yellowfin example:
1. Extract the _yellowfinExample.zip_
2. Execute the _addYellowfin.js_ script. The script can take the path (relative or absolute) to the Finsemble project as an argument:
    ```bash
    node addYellowfin.js ../finsemble-seed
    ```
3. Test installation by executing `npm run dev` for the Finsemble application
    - Select the Yellowfin component or Yellowfin Report Launcher component from the apps menu to begin

## What does the install script do?

### 1. Installs the Yellowfin service
The Yellowfin example requires a service to talk to the Yellowfin server. The script copies the service files and the corresponding client to _src/services/yellowfin_.

The service configuration is then added to _/config/application/services.json_ to tell Finsemble to load the service. The configuration added to _services.json_ can be found in the _yellowfin.services.json_ file in the Yellowfin example package.

### 2. Installs the Yellowfin example components
The Yellowfin example components are copied to _src/components/yellowfin_. These components are added to the Finsemble build process by adding the webpack configuration found in _yellowfin.webpack.components.entries.json_ to _build/webpack/webpack.components.entries.json_. The example components are added to the Finsemble application by adding the component configuration found in _yellowfin.components.json_ to _configs/application/components.json_. 

The components added are:
- **filterComponent** - A component slaved to the `jsComponent` to be used for filtering in Finsemble.
- **filterStatus** - A component used to show the data shared from a report via the Linker.
- **jsComponent** - A component for displaying reports using the Yellowfin Javascript API. 
- **launcher** - A Finsemble component to list and launch Yellowfin reports using the Yellowfin API 
- **launcherLocal** - A version of the report launcher pointing to localhost (for development use).
- **yellowfin** - A viewer for the Yellowfin app, displays the default, or can be used programmatically to launch a specific view such as the report creator.

### 3. Installs dependencies
The yellowfin example depends on the jquery, jquery.soap and jquery-xml2json, so the script installs those dependencies.

### 4. Checks the Finsemble version used by the seed project
The Yellowfin example requires Finsemble 2.4 or newer to work properly.

## Configuring the Yellowfin service and credentials
The Yellowfin server that the service will talk to is configured in the Yellowfin service, found in _src/services/yellowfin/yellowfinService.js_. The variables used for this configuration can be found at the top of that file:

```javascript
// yellowfin demo data
let yellowfinProtocol = "http://";
let yellowfinHost = "18.130.26.97";
let yellowfinPort = "80";
let yellowfinPath = "/JsAPI";
let yellowfinReportPath = "/JsAPI?api=reports";
let yellowfinAdminUser = "admin@yellowfin.com.au";
let yellowfinAdminPass = "test";
let yellowfinUser = "consumer@yellowfin.bi";
let yellowfinPass = "test";
```

This maybe changed to integrate with either the Preferences service (allowing user configuration) or Dynamic Config (allowing it to be configured using an entitlements system).

The server settings are retrieved from the service by the components and/or passed between them during spawning and stored as part of their state in the workspaces.
