const axios = require("axios");
const fs = require("fs");
const count = 1;
const aid = 7004063542;
const API_KEY = "53dbebb3541a6f89921f6495a85d039e";
const authors = require("./authors.js");

// EXPORT FUNCTIONS
module.exports = {
	testModule: function () { console.log("Called from publications.js!"); },

	getAuthorArticles: async function (id) {
		let articles = [];
		let promises = [];
		let max = await getMaxPubliciations(id);

		for(m of max) {
			promises.push( articles.push(getArticleId(id, m)) );
		}

		await Promises.all(promises);

		return articles;
	}

}

function readAuthorFile(fileName) {
	var articles = [];

	articles = fs.readFileSync('testArticles.txt').toString().split("\n");

	return articles;
}


// Returns the total number of publications associated with the author ID
async function getMaxPubliciations (authorId) {

	let maxPromise = axios.get("https://api.elsevier.com/content/search/scopus?query=AU-ID("+authorId+")&apiKey=" + API_KEY)
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
function createArticle(articleData) {

	var data = articleData;
	var authors = [];

	for(a in data.authors) {
		console.log(a["@auid"])
		authors.push(a["@auid"]);
	}

	var article = {
		"articleId": parseInt( (data["dc:identifier"]).split(":")[1] ),
		"doi": data["prism:doi"],
		"article-number": data["article-number"],
		"title": data["dc:title"],
		"publicationName": data["dc:publisher"],
		"citedby-count": data["citedby-count"]
		"abstrac"t: data["dc:description"].abstract,
		"authors": authors,
		"keywords": data["idxterms"],
		"subject-areas": data["subject-areas"]
	}

	return article;
}

// Retrieves data, formats into an article object, and then pushes into a map async.
async function pushArticle(articleId, map) {
	let data = await getArticleData(articleId);
	let article = createArticle(data);
	map.set(articleId, article);
}

// Populates a map with publication objects based on a document of articleIds
async function pushAllArticles(fileName) {

	let articles = readAuthorFile(fileName);
	let map = new Map();
	let promises = [];

	for (articleId of articles) {
		promises.push(pushArticle(articleId, map)); // Calls each individual article to push in
	}

	await Promise.all(promises); // Waits for all Promises to fulfill before returning

	return map;
}



// DEBUG

(async ()=> {
	console.log( await pushAllArticles("testArticles.txt") )
})

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