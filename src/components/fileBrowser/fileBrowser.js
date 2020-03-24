const fileBrowse = () => {
	// TODO: Make the query be able to take an initial directory
	const selectedFolder = document.getElementById("selectedFolder");
	const params = {
		selectedFolder: selectedFolder.value
	};
	FSBL.Clients.RouterClient.query("Windowless.SelectDirectory", params, (err, res) => { 
		if (err) {
			alert(err);
		} else {
			selectedFolder.value = res.data.selectedPath;
		}
	});
};

const listFolderContents = () => {
	const selectedFolder = document.getElementById("selectedFolder");

	if (selectedFolder.value === "") {
		alert("Folder must be selected before listing contents");
		return;
	}

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
	const filename = document.getElementById("filename");
	const contents = document.getElementById("fileContents");

	if (filename.value === "") {
		alert("Filename must be specified to save a file");
		return;
	} else if (folder.value === "") {
		alert("Selected Folder must be specified to save a file.");
		return;
	}

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
		const container = document.createElement("div");
		container.id = "container";
		document.body.appendChild(container);

		const title = document.createElement("h1");
		title.appendChild(document.createTextNode("File Browser"));
		container.appendChild(title);

		const fileBrowseButton = document.createElement("button");
		fileBrowseButton.appendChild(document.createTextNode("Browser for Folder"));
		fileBrowseButton.onclick = fileBrowse;
		container.appendChild(fileBrowseButton);

		let spacer = document.createElement("div");
		spacer.className = "spacer2";
		container.appendChild(spacer);

		const selectedFolderLabel = document.createElement("label");
		selectedFolderLabel.for = "selectedFolder";
		selectedFolderLabel.appendChild(document.createTextNode("Selected Folder"));
		container.appendChild(selectedFolderLabel);

		const folderTextField = document.createElement("input");
		folderTextField.id = "selectedFolder";
		folderTextField.readOnly = true;
		container.appendChild(folderTextField);

		spacer = document.createElement("div");
		spacer.className = "spacer2";
		container.appendChild(spacer);

		const listFolderContentsButton = document.createElement("button");
		listFolderContentsButton.appendChild(document.createTextNode("List Folder Contents"));
		listFolderContentsButton.onclick = listFolderContents;
		container.appendChild(listFolderContentsButton);

		container.appendChild(document.createElement("br"));

		const folderListingLabel = document.createElement("label");
		folderListingLabel.for = "folderListing";
		folderListingLabel.appendChild(document.createTextNode("Folder Listing"));
		container.appendChild(folderListingLabel);

		const folderListing = document.createElement("ul");
		folderListing.id = "folderListing";
		container.appendChild(folderListing);

		container.appendChild(document.createElement("br"));

		const filenameLabel = document.createElement("label");
		filenameLabel.for = "filename"
		filenameLabel.appendChild(document.createTextNode("Filename"));
		container.appendChild(filenameLabel);

		const filenameTextField = document.createElement("input");
		filenameTextField.id = "filename";
		filenameTextField.defaultValue = "test.txt";
		container.appendChild(filenameTextField);

		container.appendChild(document.createElement("br"));

		const fileContentsLabel = document.createElement("label");
		fileContentsLabel.for = "fileContents"
		fileContentsLabel.appendChild(document.createTextNode("File Contents"));
		container.appendChild(fileContentsLabel);

		const fileContentsField = document.createElement("textarea");
		fileContentsField.id = "fileContents";
		container.appendChild(fileContentsField);

		container.appendChild(document.createElement("br"));

		const writeFileButton = document.createElement("button");
		writeFileButton.appendChild(document.createTextNode("Write File"));
		writeFileButton.onclick = writeFile;
		container.appendChild(writeFileButton);

	} catch (e) {
		FSBL.Clients.Logger.error(e);
	}
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady)
} else {
	window.addEventListener("FSBLReady", FSBLReady)
}