# Sample v4 to v5 Advanced App Launcher Quick Components and Favourites Migration Service Example

_*IMPORTANT*_ - This recipe only applies when migrating to Finsemble v5.4.4+ and specifically when using the Advanced App Lancher

When customers migrate from Finsemble v4 to Finsembe v5.4.4 the application was not migrating the user's Quick Components and Favourites. This recipe, with appropriate modifications, can handle the migration of Advanced App Launcher data (Quick Components and Favourites) for your users.

## Installation

1. Copy the `src/services/SampleMigration` directory from this branch in your Finsemble `src/services` directory.
2. In the `finsemble.importConfig` array of your [manifest](https://documentation.chartiq.com/finsemble/tutorial-Configuration.html) or _/configs/application/config.json_ file to include references to the service `config.json` file:

   ```json
   "importConfig": [
       ...
       "$applicationRoot/services/SampleMigration/config.json",
       ...
   ],
   ```

3. Install if needed and start Finsemble: `npm install; npm run dev`.
4. All of your v4 Quick Components and Favourites should be displayed in Finsemble v5.

## Migration Details

This recipe assumes that:

- The Advanced App Lancher data gets stored into a [DistributedStore](https://documentation.finsemble.com/tutorial-DistributedStore.html) named `Finsemble-AppLauncher-Store`.

* v4 storage `topic`: `finsemble`
* v4 storage `key` for favourited apps: `toolbarPins`

--

- v5 storage `topic`: `favourites`
- v5 storage `key` for favourited apps: `allCurrentFavorites`

Ensure you have the correct storage, topics and keys in your custom migration service.

## Warning

Note that this recipe is **a destructive migration** in that it will DELETE the v4 favourited apps storage entry. Hence, please be sure to test your migration extensively before applying it to your user's data and/or modify the migration to create backups of the migrated workspaces.
