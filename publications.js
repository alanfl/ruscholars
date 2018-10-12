const axios = require("axios");
const fs = require("fs");
const count = 1;
const aid = 7004063542;
const API_KEY = 53dbebb3541a6f89921f6495a85d039e;
const authors = require("./authors.js");

// EXPORT FUNCTIONS
module.exports = {
	testModule: function () { console.log("Called from publications.js!"); }
}



// Returns the total number of publications associated with the author ID
async function getMaxPubliciations (authorId) {

	let maxPromise = axios.get("https://api.elsevier.com/content/search/scopus?query=AU-ID("+authorId+")&apiKey=" + API_KEY);
		.then(response => {
			return response.data["search-results"]["opensearch:totalResults"];
		})
		.catch(error => {
			console.log(error);
		})

	return maxPromise;
}

// Returns a Promise that fetches the DOIs of articles associated with the author ID at the specified index
async function getArticleIds (authorId, start) {

	// Compute URL
	var url = "https://api.elsevier.com/content/search/scopus?query=AU-ID("+authorId+")&apiKey=" + API_KEY +"&start="+start+"&count=1&field=prism:doi";

	// Fetch from URL
	let articleIds = axios.get(url)
		.then(response => {
			return response.data["search-results"]["entry"][0]["prism:doi"];
		})
		.catch(error => {
			console.log(error);
		}) 

	return articleIds;
}

// Fetches the complete view of the article given its ID
function getArticleInformation (articleId) {

	// Compute url
	var url = "https://api.elsevier.com/content/search/scopus?query=DOI(" + encodeURIComponent( articleId ) + ")&apiKey=" + API_KEY;

	console.log(url)
	let articleInfo = axios.get(url)
		.then(response => {
			// console.log(response.data["search-results"]);
			return response.data["search-results"];
		})
		.catch(error => {
			console.log(error);
		})

	return articleInfo;
}

async function getArticleAbstract (articleId) {

	var url = 'https://api.elsevier.com/content/abstract/doi/' + encodeURI( articleId ) + "?apiKey=" + API_KEY;

	console.log(url)
	let abstract = axios.get(url)
		.then(response => {
			return response.data["abstracts-retrieval-response"].coredata["dc:description"];
		})
		.catch(error => {
			console.log(error);
		})

	return abstract;
}

function testModule() {
	console.log("Called from publications.js!");
}

// DEBUG
// (async ()=> {
// 	var max = await getMaxPubliciations(aid);
// 	console.log("***FOUND " + max + " PUBLICATIONS FOR " + aid + "***")

// 	for(let start = 0; start <= max; start++) {
// 		var id = (await getArticleIds(aid, start)) 
// 		console.log(id)


// 		// Detailed information
// 		console.log("=========ARTICLE INFORMATION=========")
// 		console.log( await getArticleInformation(id) );
// 		console.log("=========ARTICLE ABSTRACT=========")
// 		console.log( await getArticleAbstract(id));
// 		console.log("==================");
// 	}
// })()
// DEBUG END