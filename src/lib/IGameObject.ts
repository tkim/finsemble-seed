import Vector from "./Vector";

export default interface IGameObject {
	id: string;
	type: string;
	width: number;
	height: number;
	position: Vector;
	velocity?: Vector;
	canCollide: boolean;
	applyCollision?: Function;

	applyInput(inputs: any): void;

	update(elapsedTime): void;

	render(offset?:Vector): void;

	getRepresentation(): any;
}
