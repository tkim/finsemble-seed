export default class Vector {
	x: number = 0;
	y: number = 0;

	constructor(x?, y?) {
		if (x) {
			this.x = x;
		}
		if (y) {
			this.y = y;
		}
	}

	add(vector: Vector, factor = 1) {
		this.x += (vector.x * factor);
		this.y += (vector.y * factor);
	}
}
