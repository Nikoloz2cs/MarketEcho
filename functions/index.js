const functions = require("firebase-functions");
const fetch = require("node-fetch");
const cors = require("cors")({ origin: true });

exports.getNews = functions.https.onRequest((req, res) => {
cors(req, res, async () => {
    console.log('Request received with params:', req.query);
    const { stock, date, range } = req.query;

    // Alpha Vantage API key
    const alphaVantageApiKey = "";
    // TheNewsAPI API key (for fallback)
    const theNewsApiKey = "";

    // Convert the date into a Date object
    const targetDate = new Date(date);

    // Calculate 'from' and 'to' dates based on the range
    const fromDate = new Date(targetDate);
    fromDate.setDate(fromDate.getDate() - range); // 'range' days before the target date

    const toDate = new Date(targetDate);
    toDate.setDate(toDate.getDate() + range); // 'range' days after the target date

    // Helper function to format dates to YYYYMMDDTHHMM
    const formatDate = (date, time) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}T${time}`;
    };

    // Format the dates to YYYYMMDDTHHMM format for Alpha Vantage
    const from = formatDate(fromDate, '0001'); // Start of the day
    const to = formatDate(toDate, '2359'); // End of the day

    // Construct the Alpha Vantage API URL with the date range and stock symbol
    const alphaVantageUrl = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${stock}&time_from=${from}&time_to=${to}&apikey=${alphaVantageApiKey}`;

    try {
    // First, try fetching from Alpha Vantage
    const alphaResponse = await fetch(alphaVantageUrl);
    const alphaData = await alphaResponse.json();
    console.log('Alpha Vantage data:', alphaData);

    if (alphaData.feed && alphaData.feed.length > 0) {
        // If Alpha Vantage returns articles, send them to the frontend
        res.json(alphaData.feed);
    } else {
        // If no articles found, fallback to TheNewsAPI
        console.log('No data from Alpha Vantage, falling back to TheNewsAPI...');
        
        // Fallback to TheNewsAPI
        const fromISO = fromDate.toISOString().split('T')[0];
        const toISO = toDate.toISOString().split('T')[0];
        const theNewsUrl = `https://api.thenewsapi.com/v1/news/all?api_token=${theNewsApiKey}&search=${stock}&published_after=${fromISO}&published_before=${toISO}&language=en`;

        const newsResponse = await fetch(theNewsUrl);
        const newsData = await newsResponse.json();
        console.log('Fetched TheNewsAPI data:', newsData);

        if (newsData.data && newsData.data.length > 0) {
        res.json(newsData.data);  // Send articles to frontend
        } else {
        res.status(404).send("No articles found for the given date range and stock on both services.");
        }
    }
    } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).send("Error fetching news");
    }
});
});





const axios = require('axios');
const apiKey = '';

// detect big changes in a given stock on a given date
async function fetchHistoricalData(stockSymbol, startDate, endDate) {           //outputsize=full for all info but compact is past 100.
const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${stockSymbol}&apikey=${apiKey}&outputsize=compact`;

try {
    const response = await axios.get(url);
    const data = response.data['Time Series (Daily)'];

    const filteredData = Object.keys(data)
    .filter(date => date >= startDate && date <= endDate)
    .map(date => ({
        date: date,
        close: parseFloat(data[date]['4. close'])
    }));

    return filteredData;
} catch (error) {
    console.error('Error fetching historical data:', error);
    return null;
}
}

function calculatePercentageChange(currentPrice, previousPrice) {
return ((currentPrice - previousPrice) / previousPrice) * 100;
}

function detectSpikesAndDips(data, threshold = 5) {
const significantChanges = [];

for (let i = 1; i < data.length; i++) {
    const change = calculatePercentageChange(data[i].close, data[i - 1].close);
    
    if (Math.abs(change) >= threshold) {
    significantChanges.push({
        date: data[i].date,
        change: change.toFixed(2),
        previousPrice: data[i - 1].close,
        currentPrice: data[i].close
    });
    }
}

return significantChanges;
}

exports.detectStockChanges = functions.https.onRequest(async (req, res) => {
const { stockSymbol, startDate, endDate } = req.query;

const data = await fetchHistoricalData(stockSymbol, startDate, endDate);

if (data) {
    const changes = detectSpikesAndDips(data);
    res.json(changes);
} else {
    res.status(500).send("Error fetching historical data");
}
});

// Using thenewsapi.com
// const functions = require("firebase-functions");
// const fetch = require("node-fetch");
// const cors = require("cors")({ origin: true });

// exports.getNews = functions.https.onRequest((req, res) => {
// cors(req, res, async () => {
//     console.log('Request received with params:', req.query);
//     const { stock, from, to } = req.query;

//     // Replace with your actual API key
//     const apiKey = "";

//     // Construct the API URL with the date range
//     const newsUrl = `https://api.thenewsapi.com/v1/news/all?api_token=${apiKey}&search=${stock}&published_after=${from}&published_before=${to}`;

//     try {
//     const response = await fetch(newsUrl);
//     const data = await response.json();
//     console.log('Fetched data:', data);

//     if (data.data) {
//         res.json(data.data);  // Send articles to frontend
//     } else {
//         res.status(404).send("No articles found for the given date range and stock.");
//     }
//     } catch (error) {
//     console.error('Error fetching news:', error);
//     res.status(500).send("Error fetching news");
//     }
// });
// });

// Using newsapi.org
// const functions = require("firebase-functions");
// const fetch = require("node-fetch");
// const cors = require("cors")({ origin: true });

// exports.getNews = functions.https.onRequest((req, res) => {
// cors(req, res, async () => {
//     console.log('Request received with params:', req.query);
//     const { stock, date } = req.query;

//     const apiKey = "";
//     const newsUrl = `https://newsapi.org/v2/everything?q=${stock}&from=${date}&sortBy=relevance&apiKey=${apiKey}`;

//     try {
//     const response = await fetch(newsUrl);
//     const data = await response.json();
//     console.log('Fetched data:', data);
//     res.json(data.articles);
//     } catch (error) {
//     console.error('Error fetching news:', error);
//     res.status(500).send("Error fetching news");
//     }
// });
// });
