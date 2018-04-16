# YellowFin README 

## Installation 

### 1. Setup the YellowFin service
Copy service source files to: */src/services/yellowfin/*
and client to:                */src/clients/yellowfinClient.js*

Then add the service configuration below to */config/application/services.json*:
```json
{
    "comment": "Houses config for any custom services that you'd like to import into Finsemble.",
    "services": {
        "yellowfinService": {
            "visible": false,
            "showDevConsoleOnVisible": true,
            "active": true,
            "name": "yellowfinService",
            "html": "/services/yellowfin/yellowfin.html",
            "file": "/services/yellowfin/yellowfinService.js"
        }
    }
}
```

### 2. Install the components by copying their sources over:
- */src/components/yellowFin*                
  - A viewer for the YellowFin app, displays the default, or can be used programatically to launch a specific view such as the report creator.
- */src/components/yellowFinLauncher*        
  - A Finsemble component to list and launch YellowFin reports using the YellowFin API 
- */src/components/yellowFinLauncherLocal*   
  - A version of the report launcher pointing to localhost for development use.
- */src/components/yellowFinJSComponent*     
  - A component for displaying reports using the YF Javascript API. 
- */src/components/yellowFinFilterComponent* 
  - A component slaved to the JS component to be used for filtering in Finsemble.

and add the following configuraitons for them to */configs/application/components.json*:
```JSON
{
    "comment": "Component configuration",
    "components": {
        "yellowFinJSComponent": {
            "window": {
                "url": "$applicationRoot/components/yellowFinJSComponent/yellowFinJSComponent.html",
                "frame": false,
                "resizable": true,
                "autoShow": true,
                "top": "center",
                "left": "center",
                "width": 400,
                "height": 500
            },
            "component": {
                "inject": false
            },
            "foreign": {
                "services": {
                    "dockingService": {
                        "canGroup": true,
                        "isArrangable": true
                    }
                },
                "components": {
                    "App Launcher": {
                        "launchableByUser": false
                    },
                    "Window Manager": {
                        "FSBLHeader": true,
                        "persistWindowState": true,
                        "showLinker": true
                    },
                    "Toolbar": {
                        "iconClass": "yellowFinJSComponent"
                    }
                }
            }
        },
        "yellowFinFilterComponent": {
            "window": {
                "url": "$applicationRoot/components/yellowFinFilterComponent/yellowFinFilterComponent.html",
                "frame": false,
                "resizable": true,
                "autoShow": true,
                "top": "center",
                "left": "center",
                "width": 250,
                "height": 400
            },
            "component": {
                "inject": false
            },
            "foreign": {
                "services": {
                    "dockingService": {
                        "canGroup": true,
                        "isArrangable": true
                    }
                },
                "components": {
                    "App Launcher": {
                        "launchableByUser": false
                    },
                    "Window Manager": {
                        "FSBLHeader": true,
                        "persistWindowState": true
                    },
                    "Toolbar": {
                        "iconClass": "yellowFinFilterComponent"
                    }
                }
            }
        },
        "YellowFin": {
            "window": {
                "url": "$applicationRoot/components/yellowFin/yellowFin.html",
                "frame": false,
                "resizable": true,
                "autoShow": true,
                "top": "center",
                "left": "center",
                "width": 1065,
                "height": 830
            },
            "component": {
                "inject": false
            },
            "foreign": {
                "services": {
                    "dockingService": {
                        "canGroup": true,
                        "isArrangable": true
                    }
                },
                "components": {
                    "App Launcher": {
                        "launchableByUser": true
                    },
                    "Window Manager": {
                        "FSBLHeader": true,
                        "persistWindowState": true
                    },
                    "Toolbar": {
                        "iconClass": "yellowFin"
                    }
                }
            }
        },
        "YellowFin Report Launcher": {
            "window": {
                "url": "$applicationRoot/components/yellowFinLauncher/yellowFinLauncher.html",
                "frame": false,
                "resizable": true,
                "autoShow": true,
                "top": "center",
                "left": "0",
                "width": 300,
                "height": 400
            },
            "component": {
                "inject": false
            },
            "foreign": {
                "services": {
                    "dockingService": {
                        "canGroup": true,
                        "isArrangable": true
                    }
                },
                "components": {
                    "App Launcher": {
                        "launchableByUser": true
                    },
                    "Window Manager": {
                        "FSBLHeader": true,
                        "persistWindowState": true
                    },
                    "Toolbar": {
                        "iconClass": "yellowFinLauncher"
                    }
                }
            }
        },
        "YellowFin Report Launcher Localhost": {
            "window": {
                "url": "$applicationRoot/components/yellowFinLauncherLocal/yellowFinLauncherLocal.html",
                "frame": false,
                "resizable": true,
                "autoShow": true,
                "top": "center",
                "left": "center",
                "width": 300,
                "height": 400
            },
            "component": {
                "inject": false
            },
            "foreign": {
                "services": {
                    "dockingService": {
                        "canGroup": true,
                        "isArrangable": true
                    }
                },
                "components": {
                    "App Launcher": {
                        "launchableByUser": true
                    },
                    "Window Manager": {
                        "FSBLHeader": true,
                        "persistWindowState": true
                    },
                    "Toolbar": {
                        "iconClass": "yellowFinLauncherLocal"
                    }
                }
            }
        }
    }
}
```

### 3. Configure the Yellowfin service and credentials
The YellowFin server that the service will talk to is configured in */src/services/yellowfin/yellowfinService.js*. The credentials for the Yellowfin demo server are:

```javascript
// yellowfin demo data
let yellowfinProtocol = "http://";
let yellowfinHost = "18.130.26.97";
let yellowfinPort = "80";
let yellowfinPath = "/JsAPI";
let yellowfinReportPath = "/JsAPI?api=reports";
let yellowfinUser = "admin@yellowfin.com.au";
let yellowfinPass = "test";
```

However, in future this maybe changed to integrate with either the Preferences service (allowing user configuration) or Dynamic Config (allowing it to be configured using an entitlements system).

The server settings are retrieved from the service by the components and/or passed between them during spawning and stored as part of their state in the weorkspace.


### 4. Build it and run
Execute `npm run dev` to build the seed project and then select the YellowFin component or YellowFin Report Launcher component from the apps menu to begin.