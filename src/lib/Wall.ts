import IGameObject from "./IGameObject";
import Vector from "./Vector";

export default class Wall implements IGameObject {
	id:string;
	canCollide: boolean = true;
	width: number = 20;
	height: number = 200;
	type: string = "wall";
	position: Vector;
	element;

	constructor(id, xPos?, yPos?) {
		this.id = id;
		this.position = new Vector(xPos, yPos);
		this.element = document.createElement("div");
		this.element.style.position = "absolute";
		this.element.id = this.id;
		this.element.style.width = this.width + 'px';
		this.element.style.height = this.height + 'px';
		this.element.style.left = this.position.x + 'px';
		this.element.style.top = this.position.y + 'px';
		this.element.className = "game-object";
		this.applyCollision = this.applyCollision.bind(this);
	}

	getRepresentation() {
		return this.element;
	}

	applyInput(inputs: any): void {
	}

	update(elapsedTime:number): void {

	}

	render(offset?:Vector): void {
		this.element.style.left = (this.position.x + (offset? offset.x : 0)) + 'px';
		this.element.style.top = (this.position.y + (offset? offset.y : 0)) +'px';
		this.element.style.width = this.width + 'px';
		this.element.style.height = this.height + 'px';
	}

	applyCollision(collidedWith: IGameObject) {
		if (this.id.includes("left")) {
			collidedWith.position.x = this.position.x + this.width + 1;
			collidedWith.velocity.x = collidedWith.velocity.x * -1;
		}

		if (this.id.includes("right")) {
			collidedWith.position.x = this.position.x - collidedWith.width - 1;
			collidedWith.velocity.x = collidedWith.velocity.x * -1;
		}

		if (this.id.includes("bottom")) {
			collidedWith.position.y = this.position.y - collidedWith.height - 1;
			collidedWith.velocity.y = collidedWith.velocity.y * -1;
		}

		if (this.id.includes("top")) {
			collidedWith.position.y = this.position.y + this.height + 1;
			collidedWith.velocity.y = collidedWith.velocity.y * -1;
		}
	}
}
