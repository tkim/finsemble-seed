import ClientEngine from "../../lib/ClientEngine";
import Vector from "../../lib/Vector";

const engine = new ClientEngine("board");
engine.channel = "game1";
const FSBLReady = () => {
	try {
		FSBL.Clients.RouterClient.addListener(engine.channel, engine.applyInput)
	} catch (e) {
		FSBL.Clients.Logger.error(e);
	}
	engine.offset = new Vector(100, 100);
	engine.start();
};

// @ts-ignore
if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady);
} else {
	window.addEventListener("FSBLReady", FSBLReady);
}
