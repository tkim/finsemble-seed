import ServerEngine from "../../lib/ServerEngine";
import Ball from "../../lib/Ball";
import Wall from "../../lib/Wall";

const Finsemble = require("@chartiq/finsemble");

Finsemble.Clients.Logger.start();
Finsemble.Clients.Logger.log("Controller Service starting up");
Finsemble.Clients.LauncherClient.initialize();

/**
 * TODO: Add service description here
 */
class ControllerService extends Finsemble.baseService {
	/**
	 * Initializes a new instance of the ControllerService class.
	 */
	constructor() {
		super({
			// Declare any service or client dependencies that must be available before your service starts up.
			startupDependencies: {
				// If the service is using another service directly via an event listener or a responder, that service
				// should be listed as a service start up dependency.
				services: [],
				// When ever you use a client API with in the service, it should be listed as a client startup
				// dependency. Any clients listed as a dependency must be initialized at the top of this file for your
				// service to startup.
				clients: [
					"launcherClient"
				]
			}
		});

		this.engine = new ServerEngine(null, Finsemble.Clients.RouterClient);
		this.engine.channel = "game1";


		// let leftWall1 = new Wall("leftWall1");
		// leftWall1.position.x = 850;
		// leftWall1.position.y = -1150;
		// leftWall1.width = 20;
		// leftWall1.height = 300;
		//
		// this.engine.addGameObject(leftWall1);
		//
		// let rightWall2 = new Wall("rightWall2");
		// rightWall2.width = 20;
		// rightWall2.position.x = 1150;
		// rightWall2.position.y = -1150;
		// rightWall2.height = 300;
		//
		// this.engine.addGameObject(rightWall2);
		//
		// let topWall1 = new Wall("topWall1");
		// topWall1.height = 20;
		// topWall1.position.x = 850 + 21;
		// topWall1.position.y = -1150;
		// topWall1.width = 300 - 22;
		//
		// this.engine.addGameObject(topWall1);
		//
		// let bottomWall1 = new Wall("bottomWall1");
		// bottomWall1.height = 20;
		// bottomWall1.position.x = 850 + 21;
		// bottomWall1.position.y = -1000 + 150 - 20;
		// bottomWall1.width = 300 - 22;

		// this.engine.addGameObject(bottomWall1);


		Finsemble.Clients.LauncherClient.getMonitorInfoAll((error, info) => {
			let monitor = info[1].availableRect;
			let ball = new Ball("logo");
			ball.position.x = monitor.left + 50;
			ball.position.y = monitor.top + 50;
			ball.speed = 100;
			ball.velocity.x = 100; //* Math.random() * (Math.random() > 0.5 ? 1 : -1);
			ball.velocity.y = 80; //* Math.random() * (Math.random() > 0.5 ? 1 : -1);
			ball.canCollide = true;
			this.engine.addGameObject(ball);


			let leftWall = new Wall("leftWall");
			leftWall.position.x = monitor.left;
			leftWall.position.y = monitor.top;
			leftWall.width = 20;
			leftWall.height = monitor.bottom - monitor.top;

			let rightWall = new Wall("rightWall");
			rightWall.width = 20;
			rightWall.position.x = monitor.right - rightWall.width;
			rightWall.position.y = monitor.top;
			rightWall.height = leftWall.height;

			let topWall = new Wall("topWall");
			topWall.height = 20;
			topWall.position.x = monitor.left + 21;
			topWall.position.y = monitor.top;
			topWall.width = monitor.right - monitor.left - 42;

			let bottomWall = new Wall("bottomWall");
			bottomWall.height = 20;
			bottomWall.width = monitor.right - monitor.left  - 42;
			bottomWall.position.x = monitor.left + 21;
			bottomWall.position.y = monitor.bottom - bottomWall.height;

			this.engine.addGameObject(leftWall);
			this.engine.addGameObject(topWall);
			this.engine.addGameObject(rightWall);
			this.engine.addGameObject(bottomWall);

			console.log(this.engine.gameObjects);
			this.engine.render();
		});

		this.engine.start();

		this.readyHandler = this.readyHandler.bind(this);

		this.onBaseServiceReady(this.readyHandler);
	}

	/**
	 * Fired when the service is ready for initialization
	 * @param {function} callback
	 */
	readyHandler(callback) {
		Finsemble.Clients.Logger.log("Controller Service ready");
		callback();
	}
}

const serviceInstance = new ControllerService();

serviceInstance.start();
export default serviceInstance;
