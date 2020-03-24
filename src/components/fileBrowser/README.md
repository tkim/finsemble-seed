# File System Access Via a Native Service

This repo contains the HTML5 component to use to communicate with the C# windowless component that:

- Browses for folders
- Lists a folder's contents
- Writes a file to disk

See the [C# recipe](https://github.com/ChartIQ/finsemble-dotnet-seed/tree/recipes/file-system-access-via-native-service) for more information.

## Installation

To install and run the file-system-access-via-native-service example, please follow the instructions below:

1. Add the `fileBrowser` component folder to your _src/components_ directory
1. Either add the configuration in [_config.json_](./config.json) to your _configs/application/components.json_ file OR import it in your _configs/application/config.json_ file:
    ```
        ...,
        "importConfig": [
            ...,
            "$applicationRoot/components/fileBrowser/config.json"
        ]
    ```
1. You will also need to install the component from the C# recipe, referenced above