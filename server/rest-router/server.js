const express = require("express");
const app = express();

const { restFinsembleActions, subscribe } = require("./restRouter");
const { spawn, publish } = restFinsembleActions;

app.get("/finsemble/spawn/:component/:params?", (request, response) => {
	const { component, params = {} } = request.params;
	spawn(component, params, (err, res) => {
		response.send(
			`Spawned the ${component} and got this... ${JSON.stringify(res)}`
		);
	});
});
app.get("/finsemble/publish/:topic/:data", (request, response) => {
	const { topic, data } = request.params;
	publish(topic, data);
	response.send("Published");
});
app.get("/finsemble/subscribe/:topic", async (request, response) => {
	const { topic } = request.params;
	const res = await subscribe(topic);
	response.send(res);
});

app.listen(5000);
