const EventEmitter = require('events');


export default class Input extends EventEmitter {


	constructor() {
		super();
		this.inputState = {};
		this.keyDown = this.keyDown.bind(this);
		this.keyUp = this.keyUp.bind(this);
		this.updated = this.updated.bind(this);
		this.mouseMove = this.mouseMove.bind(this);
		this.setup();
	}

	setup(): void {
		document.addEventListener("keydown", this.keyDown);
		document.addEventListener("keyup", this.keyUp);
		document.addEventListener("mousemove", this.mouseMove);
	}

	keyDown(event: KeyboardEvent) {
		this.inputState[event.key] = true;
		this.updated();
	}

	keyUp(event: KeyboardEvent): void {
		this.inputState[event.key] = false;
		this.updated();
	}

	mouseMove(event: MouseEvent) {
		this.inputState["mouse"] = event;
		this.updated();
	}

	updated(): void {
		this.emit("updated", this.inputState)
	}
}
