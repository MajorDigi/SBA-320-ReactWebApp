import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [birds, setBirds] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [birdId, setBirdId] = useState(""); // State for search input
  const [selectedBird, setSelectedBird] = useState(null); // State for the bird returned from search
  const [loading, setLoading] = useState(false); // State for loading spinner
  
  //API
  const apiKey = process.env.REACT_APP_API_KEY;

  // const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchBirdsMultiplePages = async () => {
      setLoading(true); // Start loading
      const pageSize = 25;
      const region = 'North America';
      const hasImg = true;
      const operator = 'AND';
      const pageRequests = [];

      // Fetch birds from pages 1 to 3
      for (let page = 1; page <= 3; page++) {
        const url = `https://nuthatch.lastelm.software/v2/birds?page=${page}&pageSize=${pageSize}&region=${encodeURIComponent(region)}&hasImg=${hasImg}&operator=${operator}`;
        pageRequests.push(
          fetch(url, {
            headers: {
              'api-key': apiKey, // Use apiKey variable
            }
          })
            .then(response => {
              if (!response.ok) {
                throw new Error('Network response was not OK');
              }
              return response.json();
            })
            .catch(error => {
              throw new Error("Failed to fetch bird data");
            })
        );
      }

      try {
        // Await all promises and accumulate results
        const results = await Promise.all(pageRequests);
        const allBirds = results.flatMap(data => data.entities || []);
        
        // Ensure we have valid bird data
        if (!allBirds || !Array.isArray(allBirds)) {
          throw new Error("Invalid bird data structure");
        }

        setBirds(allBirds.slice(0, 5)); // Store first 5 birds
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchBirdsMultiplePages();
  }, [apiKey]); // Dependencies include apiKey

  // Function to handle search input change
  const handleInputChange = (e) => {
    setBirdId(e.target.value);
  };

  // Function to fetch bird details by ID
  const fetchBirdById = () => {
    setLoading(true); // Show loading when fetching specific bird
    fetch(`https://nuthatch.lastelm.software/birds/${birdId}`, {
      headers: {
        'api-key': apiKey
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch bird by ID');
        }
        return response.json();
      })
      .then(data => {
        setSelectedBird(data); // Store the selected bird's data
      })
      .catch(error => {
        setErrorMessage("Bird not found or an error occurred.");
      })
      .finally(() => {
        setLoading(false); // Stop loading after fetching
      });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Birds Information</h1>
        {errorMessage && <div className="error">{errorMessage}</div>}

        {/* Show loading spinner */}
        {loading && <div className="spinner">Loading...</div>}

        {/* Search bar */}
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Enter Bird ID" 
            value={birdId}
            onChange={handleInputChange}
          />
          <button onClick={fetchBirdById}>Search</button>
        </div>

        {/* Display selected bird details */}
        {selectedBird && (
          <div className="bird-details">
            <h2>{selectedBird.name} ({selectedBird.sciName})</h2>
            <ul>
              <li>Order: {selectedBird.order}</li>
              <li>Family: {selectedBird.family}</li>
              <li>Status: {selectedBird.status}</li>
              <li>Wingspan: {selectedBird.wingspanMin} - {selectedBird.wingspanMax} cm</li>
              <li>Length: {selectedBird.lengthMin} - {selectedBird.lengthMax} cm</li>
            </ul>
            <img 
              src={selectedBird.images.length ? selectedBird.images[0] : "noBird.png"} 
              alt={selectedBird.name} 
              width="500"
            />
          </div>
        )}

        {/* List of birds */}
        <div className="birdList">
          {birds.map(bird => (
            <div key={bird.name} className="row">
              <div className="third">
                <h2>{bird.name}</h2>
                <ul>
                  <li>{bird.sciName}</li>
                  <li>Conservation Status: {bird.status}</li>
                </ul>
              </div>
              <div className="third">
                <img 
                  src={bird.images.length ? bird.images[0] : "noBird.png"} 
                  alt={bird.name} 
                  width="500"
                />
              </div>
            </div>
          ))}
        </div>
      </header>
    </div>
  );
}

export default App;





