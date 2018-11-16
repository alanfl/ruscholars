const axios = require("axios");
const fs = require("fs");
const readline = require('readline')
const publications = require("./publications.js");
const API_KEY = "53dbebb3541a6f89921f6495a85d039e"

// Reads in a file of provided author ids and filters relevant data to an output file for use
// in the RUScholars system
// For now, the entire file will be read into memory, but as the file size expands, a file stream
// will need to be used
function readFile(fileName) {
	var authorsTemp = [];
	authorsTemp = fs.readFileSync('test.txt').toString().split("\n");

	return authorsTemp;
}

async function getAuthorData(authorId) {

	// Assemble URL
	var url = "https://api.elsevier.com/content/author/author_id/"+authorId+"?apiKey=" + API_KEY;

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

function createAuthor(authorData) {

	var data = authorData;
	// DEBUG

	// console.log("***AUTHOR DATA***")
	// console.log(authorData)

	// console.log("=================")
	// console.log("***COREDATA***")
	// console.log(authorData["coredata"]);

	// END DEBUG

	var author = 
	{
		"authorId": parseInt( (data["coredata"]['dc:identifier']).substring(10)),
		"eid": data["coredata"]["eid"],
		"document-count": data["coredata"]["document-count"],
		"documents": [],
		"cited-by-count": data["coredata"]["cited-by-count"],
		"citation-count": data["coredata"]["citation-count"],
		"subject-areas": data["subject-areas"]["subject-area"],
		"affiliation-current": data["author-profile"]["affiliation-current"]["affiliation"],
		"affiliation-history": data["author-profile"]["affiliation-history"]
	}

	return author;
}

// 
async function pushAuthor(id, map) {
	let data = await getAuthorData(id);
	let articles = await publications.getAuthorArticles(id);
	let author = createAuthor(data);
	author["documents"] = articles;
	map.set(id, author);
}

// Populates a map with Author objects
async function pushAllAuthors(fileName) {

	let map = new Map();
	let promises = [];
	let authors = readFile(fileName);

	for(authorId of authors) {
		promises.push(pushAuthor(authorId, map))
	}

	await Promise.all(promises);

	return map;
}

(async ()=> { 
	console.log(publications.testModule())

	await populateAuthors("test.txt");
})()

