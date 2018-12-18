const scrimCSS = require("./scrim.css");
const scrimHTMLFragment = `<div id="finsemble-loading-scrim" class="fin-dots" style="background: black; position: fixed; top:-32px; left:0; height:calc(100vh + 32px); width:100vw; z-index: 2147483647; display: flex; align-items: center; justify-content: center;">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 101.1 19.19" style="height: 100px; margin -32px;">
	<g id="Layer_2" data-name="Layer 2">
		<g id="Layer_1-2" data-name="Layer 1">
			<circle class="cls-2 circle1" cx="3.6" cy="9.59" r="3.6"/>
			<circle class="cls-2 circle2" cx="24.44" cy="9.59" r="3.6"/>

			<g class="circle3">
				<polygon class="cls-1" points="50.57 19.17 41.7 15.81 41.7 10.15 50.57 13.51 50.57 19.17"/>
				<path class="cls-1" d="M50.58,19.19l-8.89-3.37V10.13l8.89,3.37ZM41.72,15.8l8.83,3.35V13.52l-8.83-3.35Z"/>
				<polygon class="cls-2" points="51.08 12.17 50.55 12.33 50.51 6.78 41.69 10.13 50.55 13.49 59.41 10.13 51.09 6.97 51.08 6.98 51.08 12.17"/>
				<polygon class="cls-2" points="59.41 3.36 50.51 6.77 41.69 3.36 50.55 0 59.41 3.36"/>
				<path class="cls-1" d="M41.69,9l8.86,3.31V6.77L41.69,3.36Z"/>
			</g>

			<circle class="cls-2 circle4" cx="76.65" cy="9.59" r="3.6"/>
			<circle class="cls-2 circle5" cx="97.5" cy="9.59" r="3.6"/>
		</g>
	</g>
</svg>
</div>`;
const scrimHTML = `<style>${scrimCSS}</style>${scrimHTMLFragment}`;

document.addEventListener("DOMContentLoaded", () => {
	console.log("adding scrim");
	document.body.innerHTML += scrimHTML;

	window.removeFinsembleLoadingScrim = () => {
		document.getElementById("finsemble-loading-scrim").style.display = "none";
	}
})