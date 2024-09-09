//THIS IS NOT WHERE THE CLOUD FINCTION DEPLOYS

// Using thenewsapi.com
const functions = require("firebase-functions");
const fetch = require("node-fetch");

const apiKey = "TpzmPUfhuAbRlkTD3qAI2QWlfsNmV5eiAFLEPcUL";  

exports.getNews = functions.https.onRequest(async (req, res) => {
const { stock, date } = req.query;

const formattedDate = new Date(date).toISOString().split('T')[0];

// TheNewsAPI endpoint and query parameters
const newsUrl = `https://api.thenewsapi.com/v1/news/all?api_token=${apiKey}&search=${stock}&published_on=${formattedDate}`;

try {
    const response = await fetch(newsUrl);
    const data = await response.json();
    
    if (data.data) {
    res.json(data.data);  // Send articles to frontend
    } else {
    res.status(404).send("No articles found for the given date and stock");
    }
} catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).send("Error fetching news");
}
});






// Using newsapi.org
// const functions = require("firebase-functions");
// const fetch = require("node-fetch");

// exports.getNews = functions.https.onRequest(async (req, res) => {
// const { stock, date } = req.query;

// // Call a news API (NewsAPI)
// const apiKey = "db3039c68c79406a996cac2383cade9a";
// const newsUrl = `https://newsapi.org/v2/everything?q=${stock}&from=${date}&sortBy=relevance&apiKey=${apiKey}`;

// try {
//     const response = await fetch(newsUrl);
//     const data = await response.json();
//     res.json(data.articles);  // Send articles to frontend
// } catch (error) {
//     res.status(500).send("Error fetching news");
// }
// });