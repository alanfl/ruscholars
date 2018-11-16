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

// Returns coredata associated with an author's Scopus ID
async function getAuthorData(authorId) {

	// Assemble URL
	var url = "https://api.elsevier.com/content/author/author_id/"+authorId+"?apiKey=" + API_KEY;

	// console.log("url = " + url)

	// Handle response
	let authorPromise = axios.get(url)
		.then(response => {

			// DEBUG
			// console.log(response.data["author-retrieval-response"])

			return response.data["author-retrieval-response"][0];

		})
		.catch(error => {
			console.log("FAILED TO FETCH AUTHOR_DATA FROM: " + url)
			console.log(error);
		})

	return authorPromise;
}

// Creates an author object given coredata
// NOTE: Document IDs associated with an author must be added separately
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

// Creates an author object based on Scopus data
async function pushAuthor(id, map) {
	let data = await getAuthorData(id);
	let author = createAuthor(data);
	map.set(id, author);
}

async function setDocuments(id, map) {
	let data = await publications.getAuthorArticles(id);
	map.get(id)["documents"] = data;
}

// Populates a map with Author objects
async function pushAllAuthors(fileName) {

	let map = new Map();
	let promises = [];
	let authors = readFile(fileName);

	for(let authorId of authors) {
		promises.push(pushAuthor(authorId, map));
	}

	await Promise.all(promises);

	for(let authorId of authors) {
		await setDocuments(authorId, map);
	}

	return map;
}

(async ()=> { 
	console.log(publications.testModule())

	console.log(await pushAllAuthors("test.txt"));
})()

