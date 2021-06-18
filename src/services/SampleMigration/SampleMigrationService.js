const Finsemble = require("@finsemble/finsemble-core");

const { Logger, StorageClient, ConfigClient, DistributedStoreClient } =
	Finsemble.Clients;

Logger.start();
Logger.log("SampleMigration Service starting up");

ConfigClient.initialize();
StorageClient.initialize();
DistributedStoreClient.initialize();

/**
 * This sample migration service, provides an example of a possible migration of data between
 * the Finsemble v4 and v5 Advanced App Lancher.
 *
 * This service will migrate all quick components added (and whether if they were favourited) by the user in V4 and migrate them
 * across to the Advanced App Lancher in Finsemble v5.
 */
class SampleMigrationService extends Finsemble.baseService {
	/**
	 * Initializes a new instance of the sampleMigrationService class.
	 */
	constructor() {
		super({
			// Declare any client dependencies that must be available before your service starts up.
			startupDependencies: {
				// When ever you use a client API with in the service, it should be listed as a client startup
				// dependency. Any clients listed as a dependency must be initialized at the top of this file for your
				// service to startup.
				clients: ["configClient", "storageClient", "distributedStoreClient"],
			},
		});

		this.readyHandler = this.readyHandler.bind(this);

		this.onBaseServiceReady(this.readyHandler);
	}

	/**
	 * Fired when the service is ready for initialization
	 * @param {function} callback
	 */
	async readyHandler(callback) {
		Logger.log("SampleMigration Service ready");

		// ************* DATA MIGRATION *************
		Logger.log("Starting data migration");
		this.normalizeAppDefinitions();
		this.migrateFavourites();
		Logger.log("Data migration finished");

		callback();
	}

	normalizeAppDefinitions() {
		Logger.log("Normalizing App Definitions");
		DistributedStoreClient.getStore(
			{
				store: "Finsemble-AppLauncher-Store",
				global: true,
			},
			(error, appLauncherStore) => {
				if (error) {
				} else {
					console.log(appLauncherStore);

					appLauncherStore.getValue("appDefinitions", (err, appDefinitions) => {
						if (err) {
							console.log("err", err);
						} else {
							Object.keys(appDefinitions).map((appID) => {
								appDefinitions[appID].canDelete = true; // this will allow user defined apps to be deleted from advanced app launcher v5
							});
							appLauncherStore.setValue({
								field: "appDefinitions",
								value: appDefinitions,
							});
						}
					});
				}
			}
		);
	}

	async migrateFavourites() {
		Logger.log("Migrating Favourites");
		const toolbarPins = await StorageClient.get({
			topic: "finsemble",
			key: "toolbarPins",
		});
		if (toolbarPins && Array.isArray(toolbarPins)) {
			Logger.log("Found v4 toolbarPins - converting data to v5");
			const convertedData = toolbarPins.map(this.v4Tov5AppDefinitionConverter);

			const allCurrentFavorites = await StorageClient.get({
				topic: "favorites",
				key: "allCurrentFavorites",
			});

			await StorageClient.save({
				topic: "favorites",
				key: "allCurrentFavorites",
				value: allCurrentFavorites
					? allCurrentFavorites.concat(convertedData)
					: convertedData,
			});
			await StorageClient.remove({ topic: "finsemble", key: "toolbarPins" });
		} else {
			Logger.log("No toolbarPins were found");
		}
	}

	v4Tov5AppDefinitionConverter(v4Data) {
		return {
			category: "Application",
			icon: {
				category: "Application",
				imageType: "initials",
				name: v4Data.component,
			},
			id: v4Data.component,
			name: v4Data.component,
		};
	}
}

const serviceInstance = new SampleMigrationService();

serviceInstance.start();
