const axios = require('axios');

// Replace with your actual Alpha Vantage API key
const apiKey = '';

async function fetchHistoricalData(stockSymbol, startDate, endDate) {
const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${stockSymbol}&apikey=${apiKey}&outputsize=full`;

try {
    const response = await axios.get(url);
    const data = response.data['Time Series (Daily)'];

    // Filter data between the start and end dates
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

function detectSpikesAndDips(data, threshold = 5) { //threshold in % change.
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

// Example usage with fetched data
fetchHistoricalData('AAPL', '2023-01-01', '2023-09-01').then(data => {
const changes = detectSpikesAndDips(data);
console.log('Significant changes:', changes);
});

