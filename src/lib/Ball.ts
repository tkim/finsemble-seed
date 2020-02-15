import IGameObject from "./IGameObject";
import Vector from "./Vector";

export default class Ball implements IGameObject {
	id;
	canCollide: boolean = true;
	position: Vector;
	velocity: Vector;
	type: string = "ball";
	width = 200;
	height = 200;
	speed = 250;
	inputs = {};
	element;

	constructor(id, xPos?, yPos?) {
		this.id = id;
		this.position = new Vector(xPos, yPos);
		this.velocity = new Vector();
		this.element = document.createElement("img");
		this.element.id = this.id;
		this.element.style.position = "absolute";
		this.element.className = "game-object";
		this.element.src = "http://localhost:3375/assets/img/finsembleLightBG_Solo@1.5x.png";
		this.element.style.width = this.width + 'px';
		this.element.style.height = this.height + 'px';
		this.element.style.left = this.position.x + 'px';
		this.element.style.top = this.position.y + 'px';
	}

	getRepresentation() {
		return this.element;
	}

	applyInput(inputs: any): void {
		this.inputs = inputs;
		if (this.inputs["ArrowRight"] || this.inputs["ArrowLeft"]) {
			this.velocity.x = this.inputs["ArrowRight"] ? this.speed : -this.speed;
		} else {
			this.velocity.x = 0;
		}

		if (this.inputs["ArrowDown"] || this.inputs["ArrowUp"]) {
			this.velocity.y = this.inputs["ArrowDown"] ? this.speed : -this.speed;
		} else {
			this.velocity.y = 0;
		}
	}

	update(elapsedTime): void {
		this.position.add(this.velocity, elapsedTime / 1000);
	}

	render(offset?:Vector): void {
		this.element.style.left = (this.position.x + (offset? offset.x : 0)) + 'px';
		this.element.style.top = (this.position.y + (offset? offset.y : 0)) +'px';
		this.element.style.width = this.width + 'px';
		this.element.style.height = this.height + 'px';
	}
}
