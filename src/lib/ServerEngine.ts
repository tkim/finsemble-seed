import IGameObject from "./IGameObject";
import Input from "./Input";

export default class ServerEngine {
	channel: string;
	gameObjects: IGameObject[] = [];
	canvas: HTMLElement;

	input: Input;

	millisecondsPerFrame = 40;

	router: any;
	previousTime: number;
	currentTime: number;
	elapsedTime: number;
	requestedFrame: number = null;
	lag = 0.0;

	constructor(canvasId?: any, router?: any) {
		this.router = router;
		this.update = this.update.bind(this);
		this.render = this.render.bind(this);
		this.loop = this.loop.bind(this);
		if (canvasId) {
			this.canvas = document.getElementById(canvasId);
		}
		// this.setupInput();
	}

	public static crossedOnX(obj1: IGameObject, obj2: IGameObject) {
		return (obj1.position.x < obj2.position.x && obj1.position.x + obj1.width > obj2.position.x) ||
			(obj2.position.x < obj1.position.x && obj2.position.x + obj2.width > obj1.position.x);
	}

	public static crossedOnY(obj1: IGameObject, obj2: IGameObject) {
		return (obj1.position.y < obj2.position.y && obj1.position.y + obj1.height > obj2.position.y) ||
			(obj2.position.y < obj1.position.y && obj2.position.y + obj2.height > obj1.position.y);
	}

	addGameObject(gObject: IGameObject) {
		this.gameObjects.push(gObject);
		if (this.canvas) {
			this.canvas.appendChild(gObject.getRepresentation());
		}
	}

	start(): void {
		this.previousTime = performance.now();

		this.loop();
	}

	loop(): void {
		this.currentTime = performance.now();
		this.elapsedTime = this.currentTime - this.previousTime;
		this.previousTime = this.currentTime;
		this.lag += this.elapsedTime;

		this.update(this.elapsedTime);

		if (!this.requestedFrame) {
			this.requestedFrame = requestAnimationFrame(this.render)
		}
		setTimeout(this.loop, 10);
	}

	setupInput(): void {
		this.input = new Input();
		// Listen for input
		this.input.on("updated", (inputObject: any) => {
			this.gameObjects.forEach((gameObject) => {
				gameObject.applyInput(inputObject);
			})
		})
	}

	update(elapsedTime: number): void {
		this.detectCollisions();
		this.gameObjects.forEach((gameObject) => {
			gameObject.update(elapsedTime);
		});
	}

	detectCollisions() {
		for (let k = 0; k < this.gameObjects.length - 1; k++) {
			if (!this.gameObjects[k].canCollide) {
				continue;
			}
			for (let n = k + 1; n < this.gameObjects.length; n++) {
				if (!this.gameObjects[n].canCollide) {
					continue;
				}
				if (this.isCollided(this.gameObjects[k], this.gameObjects[n])) {
					// console.log("Obj1", this.gameObjects[k].position, this.gameObjects[k].width, this.gameObjects[k].height)
					// console.log("Obj2", this.gameObjects[n].position, this.gameObjects[n].width, this.gameObjects[n].height);
					if (this.gameObjects[k].applyCollision) {
						this.gameObjects[k].applyCollision(this.gameObjects[n]);
					}

					if (this.gameObjects[n].applyCollision) {
						this.gameObjects[n].applyCollision(this.gameObjects[k]);
					}
				}
			}
		}
	}

	isCollided(obj1: IGameObject, obj2: IGameObject): boolean {
		let collided = false;

		let correctYToHit = (obj1.position.y + obj1.height + 1 > obj2.position.y) && (obj1.position.y < obj2.position.y + obj2.height + 1);
		let correctXToHit = (obj1.position.x + obj1.width + 1 > obj2.position.x) && (obj1.position.x < obj2.position.x + obj2.width + 1);

		if (correctXToHit && correctYToHit) {
			collided = true;
		}
		return collided;
	}

	render(): void {
		this.gameObjects.forEach((gameObject) => {
			this.detectCollisions();
		});
		let data = JSON.parse(JSON.stringify(this.gameObjects));
		this.router.transmit(this.channel, {"gameObjects": data});

		this.requestedFrame = null;
	}
}
