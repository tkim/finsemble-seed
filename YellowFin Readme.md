# Yellowfin README 

## Installation 

To install the Yellowfin example:
1. Extract the _yellowfinExample.zip_.
2. Execute the _addYellowfin.js_ script. The script can take the path (relative or absolute) to the Finsemble project as an argument:
    ```bash
    node addYellowfin.js ../finsemble-seed
    ```
3. Test installation by executing `npm run dev` for the Finsemble application.
    - Select the Yellowfin component or Yellowfin Report Launcher component from the Apps menu to begin.

## What does the install script do?

### 1. Installs the Yellowfin Service
The Yellowfin example requires a microservice to talk to the Yellowfin server. The script copies the microservice files and the corresponding client to _src/services/yellowfin_.

The microservice configuration is then added to _/config/application/services.json_ to tell Finsemble to load the microservice. The configuration added to _services.json_ can be found in the _yellowfin.services.json_ file in the Yellowfin example package.

### 2. Installs the Yellowfin example components
The Yellowfin example components are copied to _src/components/yellowfin_. These components are added to the Finsemble build process by adding the Webpack configuration found in _yellowfin.webpack.components.entries.json_ to _build/webpack/webpack.components.entries.json_. The example components are added to the Finsemble application by adding the component configuration found in _yellowfin.components.json_ to _configs/application/components.json_. 

The components added are:
- **filterComponent** - A component slaved to the `jsComponent` to be used for filtering in Finsemble.
- **filterStatus** - A component used to show the data shared from a report via the Linker.
- **jsComponent** - A component for displaying reports using the Yellowfin Javascript API. 
- **launcher** - A Finsemble component to list and launch Yellowfin reports using the Yellowfin API. 
- **launcherLocal** - A version of the report launcher pointing to `localhost` (for development use).
- **yellowfin** - A viewer for the Yellowfin app; displays the default view, or can be used programmatically to launch a specific view such as the report creator.

### 3. Installs dependencies
The Yellowfin example depends on the jQuery, jQuery.soap and jQuery-xml2json, so the script installs those dependencies.

### 4. Checks the Finsemble version used by the seed project
The Yellowfin example requires Finsemble 2.4 or newer to work properly.

## Configuring the Yellowfin Service and credentials
The Yellowfin server that the microservice will talk to is configured in the Yellowfin Service found in _src/services/yellowfin/yellowfinService.js_. The variables used for this configuration can be found at the top of that file:

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

These configuration parameters could be saved via a [storage adapter](https://documentation.chartiq.com/finsemble/tutorial-CustomDataStorage.html) or [Dynamic Configuration](https://documentation.chartiq.com/finsemble/tutorial-dynamicConfiguration.html), allowing it to be configured using an entitlements system, then passed to the Yellowfin microservice.

The server settings are retrieved from the microservice by the components or passed between them during spawning and stored as part of their state in the workspaces.

## Configuring the Yellowfin server for CORS
Yellowfin supports CORS filtering out-of-the-box but needs to be configured to accept requests from localhost. To do so please add the following filter definitions to the web.xml file in the Apache Tomcat instance bundled with Yellowfin (in *Yellowfin/appserver/webapps/ROOT/WEB-INF/web.xml*):
``` xml
<filter>
        <filter-name>ResponseHeaderFilter</filter-name>
        <filter-class>com.hof.adapter.ResponseHeaderFilter</filter-class>
        <init-param>
            <param-name>Access-Control-Allow-Origin</param-name>
            <param-value>*</param-value>
         </init-param>
     <init-param>
            <param-name>Access-Control-Allow-Headers</param-name>
            <param-value>origin, content-type, accept, authorization, SOAPAction</param-value>
         </init-param>
     <init-param>
            <param-name>Access-Control-Allow-Credentials</param-name>
            <param-value>true</param-value>
         </init-param>
     <init-param>
            <param-name>Access-Control-Allow-Methods</param-name>
            <param-value>GET, POST, PUT, DELETE, OPTIONS, HEAD</param-value>
         </init-param>
     <init-param>
            <param-name>Access-Control-Max-Age</param-name>
            <param-value>1209600</param-value>
         </init-param>
  </filter>
  <filter-mapping>
    <filter-name>ResponseHeaderFilter</filter-name>
    <url-pattern>/webservices/*</url-pattern>
  </filter-mapping>
  <filter-mapping>
    <filter-name>ResponseHeaderFilter</filter-name>
    <url-pattern>/services/*</url-pattern>
  </filter-mapping>
  ```
  This is just a basic ServletFilter that adds particular headers to the response. The ResponseHeaderFilter is included with Yellowfin out-of-the-box.