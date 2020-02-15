import IGameObject from "./IGameObject";
import Input from "./Input";
import Ball from "./Ball";
import Wall from "./Wall";
import Vector from "./Vector";

export default class ServerEngine {
	channel: string;
	gameObjects: IGameObject[] = [];
	canvas: HTMLElement;
	offset:Vector = new Vector();
	boundsRequested:boolean = false;

	input: Input;

	millisecondsPerFrame = 40;

	previousTime: number;
	requestedFrame: number = null;

	constructor(canvasId?: any) {
		this.processBounds = this.processBounds.bind(this);
		this.update = this.update.bind(this);
		this.render = this.render.bind(this);
		this.loop = this.loop.bind(this);
		this.applyInput = this.applyInput.bind(this);
		if (canvasId) {
			this.canvas = document.getElementById(canvasId);
		}
		// this.setupInput();
	}

	applyInput(error: any, data: any) {
		if (error) {
			return
		}
		data.data.gameObjects.forEach((gameObject: IGameObject) => {
			let object = null;
			this.gameObjects.forEach(inList => {
				if (inList.id == gameObject.id) {
					object = inList;
				}
			});

			if (!object) {
				object = gameObject.type === "ball" ? new Ball(gameObject.id) : new Wall(gameObject.id);
				this.addGameObject(object);
			}

			delete gameObject.element;

			Object.assign(object, gameObject);
		});

		console.log(this.gameObjects);
	}

	addGameObject(gObject: IGameObject) {
		this.gameObjects.push(gObject);
		if (this.canvas) {
			this.canvas.appendChild(gObject.getRepresentation());
		}
	}

	update() {
		if(!this.boundsRequested) {
			this.boundsRequested = true;
			FSBL.Clients.WindowClient.getBounds(this.processBounds);
		}
		//
	}

	processBounds(error:any, bounds:any) {
		if (error) {
			return;
		}

		let rect = this.canvas.getBoundingClientRect();

		this.offset.x = - bounds.left - rect.x;
		this.offset.y  = - bounds.top - rect.y;

		this.boundsRequested = false;
	}


	start(): void {
		this.previousTime = performance.now();

		this.loop();
	}


	loop(): void {
		this.update();
		if (!this.requestedFrame) {
			this.requestedFrame = requestAnimationFrame(this.render)
		}
		setTimeout(this.loop, 10);
	}


	render(): void {
		this.gameObjects.forEach((gameObject) => {
			gameObject.render(this.offset);
		});

		this.requestedFrame = null;
	}
}
