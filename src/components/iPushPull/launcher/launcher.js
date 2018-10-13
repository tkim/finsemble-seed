//JQuery (can't get ES6 import to work for this yet)
const $ = require("jquery");
const Logger = FSBL.Clients.Logger;
import {getUserDetails, getUserDocs} from '../../../services/ipushpull/ipushpullClient';

//let ipp_domains = [];

FSBL.addEventListener('onReady', function () {
	const DocumentTemplate = $("template")[0];

	let clickDocument = function(event) {
		Logger.log(`Launching domain: ${event.data.domain}, page: ${event.data.page}`);
	
		FSBL.Clients.LauncherClient.spawn("iPushPull",
			{
				url: `https://www.ipushpull.com/embedapp/domains/${event.data.domain}/pages/${event.data.page}?contrast=dark`,
				position: "relative",
				left: "adjacent",
				top: 0,
				addToWorkspace: true,
				data: {	}
			}, function(err, response){
				console.log("Document showWindow error", response);
			}
		);
	};

	let getDocuments = function() {
		//could remove this step and cache the details in the finsemble config...
		getUserDetails(function(err, userDetails) {	
			if (err) {
				Logger.error("IPUSHPULL: Error retrieving user details!", err);
			} else {
				Logger.log("IPUSHPULL: Got details for user: " + userDetails.email, err);
	
				getUserDocs(userDetails, function(err, response) {
					if (err) {
						Logger.error("Failed to retrieve user documents: ", err);
					} else {
						$("#documents").empty();
						Logger.log("response: " + JSON.stringify(response, undefined, 2));	
	
						response.domains.forEach(domain => {
							//ipp_domains.push(domain);
							domain.current_user_domain_page_access.pages.forEach(page => {
								let Document_row = $(document.importNode(DocumentTemplate.content, true));
								
								Document_row.find("description").text(page.name );
								Document_row.find("category").text(domain.display_name);
								Document_row.find("domain").text(domain.id);
								Document_row.find("page").text(page.id);
								Document_row.find("description").parent().click({"domain": domain.id, "page": page.id}, clickDocument);
								$("#documents").append(Document_row);
							});
						});
					}
				});
			}
		});
	}
	
	$('.header #refreshButton').click(getDocuments);
	
	//FSBL.Clients.WindowClient.setWindowTitle(``);
	getDocuments();
}); 