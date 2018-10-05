const axios = require("axios");
const fs = require("fs");
const readline = require('readline')
var authors = new Map();
var authorsTemp = []

// Reads in a file of provided author ids and filters relevant data to an output file for use
// in the RUScholars system
// For now, the entire file will be read into memory, but as the file size expands, a file stream
// will need to be used
async function readAuthorFile(fileName) {
	authorsTemp = fs.readFileSync('test.txt').toString().split("\n");

	console.log(authorsTemp);
}

async function getAuthorData(authorId) {

	// Assemble URL
	var url = "https://api.elsevier.com/content/author/author_id/"+authorId+"?apiKey=53dbebb3541a6f89921f6495a85d039e";

	console.log("url = " + url)

	// Handle response
	let authorPromise = axios.get(url)
		.then(response => {

			// DEBUG
			// console.log(response.data["author-retrieval-response"])

			return response.data["author-retrieval-response"][0];

		})
		.catch(error => {
			console.log(error);
		})

	return authorPromise;
}

async function createAuthor(authorData) {


	// DEBUG

	// console.log("***AUTHOR DATA***")
	// console.log(authorData)

	// console.log("=================")
	// console.log("***COREDATA***")
	// console.log(authorData["coredata"]);

	// END DEBUG

	var author = 
	{
		"authorId": parseInt( (authorData["coredata"]['dc:identifier']).substring(10)),
		"eid": authorData["coredata"]["eid"],
		"document-count": authorData["coredata"]["document-count"],
		"cited-by-count": authorData["coredata"]["cited-by-count"],
		"citation-count": authorData["coredata"]["citation-count"],
		"affiliation-current-id": authorData["affiliation-current"]["@id"],
		"affiliation-current-name": authorData["author-profile"]["affiliation-current"]["affiliation"]["ip-doc"]["afdispname"],
		"subject-areas": authorData["subject-areas"]
	}

	console.log(author)
}

async function populateAuthors() {
	await readAuthorFile("test.txt");

	for(i in authorsTemp) {
		var data = (await getAuthorData(authorsTemp[i]));

		// DEBUG
		// console.log(data);

		 authors.set(authorsTemp[i], await createAuthor(data));
	}

	// DEBUG
	console.log("Populated Author Map.")
	console.log(authors.get(57201419005))
}

(async ()=> { 
	await populateAuthors();
})()