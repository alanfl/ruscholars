const axios = require("axios");
const fs = require("fs");
const count = 1;
const aid = 7004063542;
const API_KEY = "53dbebb3541a6f89921f6495a85d039e";
const authors = require("./authors.js");

var articles = new Map();
var articlesTemp = [];

// EXPORT FUNCTIONS
module.exports = {
	testModule: function () { console.log("Called from publications.js!"); }
}

async function readAuthorFile(fileName) {
	articlesTemp = fs.readFileSync('testArticles.txt').toString().split("\n");

	console.log(authorsTemp);
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
async function getArticleId (authorId, start) {

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

// Fetches article data based on the DOI
// TO-DO Search by Scopus ID instead of DOI, store DOI separately within the publication object
async function getArticleData(articleId) {

	var url = 'https://api.elsevier.com/content/abstract/doi/' + encodeURI( articleId ) + "?apiKey=" + API_KEY;

	console.log(url)
	let data = axios.get(url)
		.then(response => {
			return response.data["abstracts-retrieval-response"].coredata;
		})
		.catch(error => {
			console.log(error);
		})

	return data;
}

// Creates a Publication object based on data returned from the Scopus DB
async function createArticle(articleData) {

	var data = articleData;
	var authors = [];

	for(a in data.authors) {
		authors.push(a.auid);
	}

	var article = {
		"articleId": parseInt( (data["dc:identifier"]).split(":")[1] ),
		"doi": data["prism:doi"],
		"article-number": data["article-number"],
		"title": data["dc:title"],
		"publicationName": data["dc:publisher"],
		"citedby-count": data["citedby-count"]
		"abstract": data["dc:description"].abstract,
		"authors": authors,
		"keywords": data["idxterms"],
		"subject-areas": data["subject-areas"]
	}

	console.log(article)
}

// Populates a map with publication objects based on a document of articleIds
async function populatePublicationMap(fileName) {
	var articles = [];
	var max = await getMaxPubliciations(authorId);

	for(let start = 0; start <= max; start++) {
		var articleId = await getArticleId(authorId, start);


	}

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