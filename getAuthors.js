const axios = require("axios");
const fs = require("fs");
const readline = require('readline')
var authors = new Map();
var authorsTemp = []

// Reads in a file of provided author ids and filters relevant data to an output file for use
// in the RUScholars system

function readAuthorFile(fileName) {
	fs.readFile(fileName, function(err, data) {
	    if(err) throw err;
	    authorsTemp = parseInt(data.toString().split("\n"));

	    // DEBUG
	    console.log("On call: ", authorsTemp)
	});
}

async function getAuthorData(authorId) {

	// Assemble URL
	var url = "https://api.elsevier.com/content/author/author_id/"+authorId+"?apiKey=53dbebb3541a6f89921f6495a85d039e";

	// Handle response
	let authorPromise = axios.get(url)
		.then(response => {
			return response.data["author-retrieval-response"].coredata;
		})
		.catch(error => {
			console.log(error);
		})

	return authorPromise;
}

function createAuthor(authorData) {
	var author = 
	{
		"authorId": parseInt(authorData["dc:identifier"].substring(10)),
		"document-count": authorData["document-count"],
		"cited-by-count": authorData["cited-by-count"],
		"citation-count": authorData["citation-count"],
		"affiliation-current-id": authorData["affiliation-current-id"].id,
		"affiliation-current-name": authorData["author-profile"]["affiliation-current"]["affiliation"]["ip-doc"]["afdispname"],
		"subject-areas": authorData["subject-areas"]
	}
}

async function populateAuthors() {
	await readAuthorFile("test.txt");

	for(i in authorsTemp) {
		var data = (await getAuthorData(authorsTemp[i]));
		authors.set(authorsTemp[i], createAuthor(data));
	}

	// DEBUG
	console.log("Populated Author Map.")
	console.log(authors.get(57201419005))
}

(async ()=> { 
	await populateAuthors();
})()