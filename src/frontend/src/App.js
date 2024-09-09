import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import Papa from 'papaparse';

function App() {
  const [stockOptions, setStockOptions] = useState([]); // State for the dropdown options
  const [filteredOptions, setFilteredOptions] = useState([]); // State for filtered options
  const [selectedStock, setSelectedStock] = useState(null); // State for the selected stock
  const [date, setDate] = useState(''); // State for the single date input
  const [range, setRange] = useState(3); // State for the range of days
  const [newsArticles, setNewsArticles] = useState([]); // State for storing fetched news articles
  const [loading, setLoading] = useState(false); // State for managing loading status
  const [error, setError] = useState(null); // State for error messages
  const [darkMode, setDarkMode] = useState(false);
  const [inputValue, setInputValue] = useState(''); // State for the input value

  // Fetch and parse the CSV file from Alpha Vantage API
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const response = await fetch(`https://www.alphavantage.co/query?function=LISTING_STATUS&apikey=`);
        const csvText = await response.text();
        
        // Parse the CSV data
        Papa.parse(csvText, {
          header: true,
          complete: (result) => {
            const stocks = result.data;
            setStockOptions(
              stocks.map(stock => ({
                symbol: stock.symbol,
                name: stock.name
              }))
            );
          },
        });
      } catch (error) {
        console.error('Error fetching and parsing stocks:', error);
      }
    };

    fetchStocks();
  }, []);

  const handleInputChange = (newValue) => {
    setInputValue(newValue); // Update input value
  
    // Filter stock options based on user input, matching either symbol or name
    const filtered = stockOptions
      .filter(option => 
        option.symbol && option.name && // Check if both symbol and name exist
        (
          option.symbol.toLowerCase().includes(newValue.toLowerCase()) ||
          option.name.toLowerCase().includes(newValue.toLowerCase())
        )
      )
      .map(option => ({
        value: option.symbol,  // Set the value to be the stock symbol only
        label: `${option.symbol} - ${option.name}` // Show the symbol and name in the dropdown
      }));
  
    setFilteredOptions(filtered);
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure a valid date is provided
    if (!date) {
      setError("Please select a date.");
      return;
    }

    if (!selectedStock) {
      setError("Please select a stock.");
      return;
    }

    // Calculate the fromDate and toDate based on the range
    const selectedDate = new Date(date);
    const fromDate = new Date(selectedDate);
    const toDate = new Date(selectedDate);

    fromDate.setDate(fromDate.getDate() - range);
    toDate.setDate(toDate.getDate() + range);

    const fromFormatted = fromDate.toISOString().split('T')[0];
    const toFormatted = toDate.toISOString().split('T')[0];

    setLoading(true);
    setError(null); // Reset error state before making a new request

    console.log("Selected stock:", selectedStock.value); // This should print the selected stock symbol
    console.log("from:", fromFormatted);
    console.log("to:", toFormatted);
    try {
      const response = await fetch(
        `https://us-central1-marketecho-cbced.cloudfunctions.net/getNews?stock=${selectedStock.value}&date=${date}&range=${range}`
      );
      if (!response.ok) {
        console.log("stock value?" + stockOptions.value);
        throw new Error('Failed to fetch');
      }
      const data = await response.json();
      setNewsArticles(data);  // Update state with fetched articles
    } catch (error) {
      setError("Failed to fetch news. Please try again later.");
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false); // Ensure loading is turned off after the request
    }
  };

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: darkMode ? '#333' : '#fff', // Background color for the input
      color: darkMode ? '#fff' : '#000', // Text color for the input
      borderColor: darkMode ? '#555' : '#ccc', // Border color for the input
      boxShadow: state.isFocused ? (darkMode ? '0 0 0 1px #aaa' : '0 0 0 1px #2684FF') : 'none',
      '&:hover': {
        borderColor: darkMode ? '#666' : '#2684FF', // Border color on hover
      },
    }),
    input: (provided, state) => ({
      ...provided,
      color: darkMode ? '#fff' : '#000', // Text color for the user's input
    }),
    menu: (provided, state) => ({
      ...provided,
      backgroundColor: darkMode ? '#333' : '#fff', // Background color for the dropdown menu
      color: darkMode ? '#fff' : '#000', // Text color for the dropdown menu
    }),
    singleValue: (provided, state) => ({
      ...provided,
      color: darkMode ? '#fff' : '#000', // Text color for the selected value
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? (darkMode ? '#444' : '#ddd') : 'transparent', // Background color on hover in dropdown
      color: darkMode ? '#fff' : '#000', // Text color for options
    }),
  };
  

  return (
    <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
      <h1>Stock News Finder</h1>
      <button onClick={() => setDarkMode(!darkMode)}>
        Toggle Dark Mode
      </button>
      <form onSubmit={handleSubmit}>
        <label>
          Stock Name:
          <Select
            inputValue={inputValue} // Controlled input value
            onInputChange={handleInputChange} // Update filtered options and input value
            options={filteredOptions}
            onChange={setSelectedStock}
            placeholder="Search and select a stock..."
            isClearable
            styles={customStyles} // Apply custom styles(mainly for dark mode)
          />
        </label>
        <br />
        <label>
          Date:
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Range (in days):
          <input
            type="number"
            value={range}
            onChange={(e) => setRange(e.target.value)}
            required
            min="1"
          />
        </label>
        <br />
        <button type="submit" disabled={loading}>Find News</button>
      </form>

      {loading && <p>Loading...</p>} {/* Show loading message */}

      {error && <p className="error">{error}</p>} {/* Show error message if any */}

      <div>
        {newsArticles.map((article, index) => (
          <div key={index}>
            <h3>{article.title}</h3>
            <p>{article.description}</p>
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              Read more
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
