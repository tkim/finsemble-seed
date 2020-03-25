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

			// Add heading
			const header = document.createElement("tr");
			folderListing.appendChild(header);

			const nameHeading = document.createElement("th");
			nameHeading.appendChild(document.createTextNode("Name"));
			header.appendChild(nameHeading);

			const modifiedHeading = document.createElement("th");
			modifiedHeading.appendChild(document.createTextNode("Modified"));
			header.appendChild(modifiedHeading);

			const typeHeading = document.createElement("th");
			typeHeading.appendChild(document.createTextNode("Type"));
			header.appendChild(typeHeading);

			const sizeHeading = document.createElement("th");
			sizeHeading.appendChild(document.createTextNode("Size"));
			header.appendChild(sizeHeading);

			fileList.forEach(file => {
				const item = document.createElement("tr");
				folderListing.appendChild(item);

				const name = document.createElement("td");
				name.appendChild(document.createTextNode(file.name));
				item.appendChild(name);

				const modified = document.createElement("td");
				modified.appendChild(document.createTextNode(file.modified));
				item.appendChild(modified);

				const type = document.createElement("td");
				type.appendChild(document.createTextNode(file.type));
				item.appendChild(type);
				
				const size = document.createElement("td");
				size.appendChild(document.createTextNode(file.size ? file.size : ""));
				item.appendChild(size);
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

		const folderListing = document.createElement("table");
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