const fileBrowse = () => {
	// TODO: Make the query be able to take an initial directory
	const params = {
		//initialDirectory: ""
	};
	FSBL.Clients.RouterClient.query("Windowless.SelectDirectory", params, (err, res) => { 
		if (err) {
			alert(err);
		} else {
			const selectedFolder = document.getElementById("selectedFolder");
			selectedFolder.value = res.data.selectedPath;
		}
	});
};

const listFolderContents = () => {
	const selectedFolder = document.getElementById("selectedFolder");
	const params = {
		folder: selectedFolder.value
	};
	FSBL.Clients.RouterClient.query("Windowless.DirectoryList", params, (err, res) => { 
		if (err) {
			alert(err);
		} else {
			const fileList = res.data;
			const folderListing = document.getElementById("folderListing");
			folderListing.innerHTML = "";
			fileList.forEach(file => {
				const item = document.createElement("li");
				item.appendChild(document.createTextNode(file));
				folderListing.appendChild(item);
			});
		}
	});
};

const writeFile = () => {
	const folder = document.getElementById("selectedFolder");
	const filename = document.getElementById("fileName");
	const contents = document.getElementById("fileContents");
	const filePath = `${folder.value}\\${filename.value}`;
	const params = {
		filename: filePath,
		contents: contents.value
	};
	FSBL.Clients.RouterClient.query("Windowless.WriteFile", params);
};

const FSBLReady = () => {
	try {
		// Do things with FSBL in here.
		const fileBrowseButton = document.createElement("button");
		fileBrowseButton.appendChild(document.createTextNode("Browser for Folder"));
		fileBrowseButton.onclick = fileBrowse;
		document.body.appendChild(fileBrowseButton);

		document.body.appendChild(document.createElement("br"));

		const folderTextField = document.createElement("input");
		folderTextField.id = "selectedFolder";
		document.body.appendChild(folderTextField);

		document.body.appendChild(document.createElement("br"));

		const listFolderContentsButton = document.createElement("button");
		listFolderContentsButton.appendChild(document.createTextNode("List Folder Contents"));
		listFolderContentsButton.onclick = listFolderContents;
		document.body.appendChild(listFolderContentsButton);

		document.body.appendChild(document.createElement("br"));

		const folderListing = document.createElement("ul");
		folderListing.id = "folderListing";
		document.body.appendChild(folderListing);

		document.body.appendChild(document.createElement("br"));

		const fileNameTextField = document.createElement("input");
		fileNameTextField.id = "fileName";
		document.body.appendChild(fileNameTextField);

		document.body.appendChild(document.createElement("br"));

		const fileContentsField = document.createElement("textarea");
		fileContentsField.id = "fileContents";
		document.body.appendChild(fileContentsField);

		document.body.appendChild(document.createElement("br"));

		const writeFileButton = document.createElement("button");
		writeFileButton.appendChild(document.createTextNode("Write File"));
		writeFileButton.onclick = writeFile;
		document.body.appendChild(writeFileButton);

	} catch (e) {
		FSBL.Clients.Logger.error(e);
	}
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady)
} else {
	window.addEventListener("FSBLReady", FSBLReady)
}