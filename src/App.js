import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [birds, setBirds] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [birdId, setBirdId] = useState(""); // State for search input
  const [selectedBird, setSelectedBird] = useState(null); // State for the bird returned from search
  const [loading, setLoading] = useState(false); // State for loading spinner
  const [currentPage, setCurrentPage] = useState(1); // State for current page
  
  const [uniqueStatuses, setUniqueStatuses] = useState([]); // State to store unique statuses
  const [selectedStatus, setSelectedStatus] = useState(""); // State to store the selected status

  // API Key
  const apiKey = process.env.REACT_APP_API_KEY;

  useEffect(() => {
    const fetchBirdsMultiplePages = async () => {
      setLoading(true); // Start loading
      const pageSize = 25;
      const region = 'North America';
      const hasImg = true;
      const operator = 'AND';
      const pageRequests = [];

      //Added server proxy
      const url = `https://cors-anywhere.herokuapp.com/https://nuthatch.lastelm.software/v2/birds?page=${currentPage}&pageSize=${pageSize}&region=${encodeURIComponent(region)}&hasImg=${hasImg}&operator=${operator}`;
      pageRequests.push(
        fetch(url, {
          headers: {
            'api-key': apiKey
          }
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not OK');
          }
          return response.json();
        })
        .then(data => {
          console.log(data); // Log the API response to the console
          if (!data.entities || !Array.isArray(data.entities)) {
            throw new Error("Entities not found or not an array");
          }
          setBirds(data.entities); // Store all birds in state

          // Step 1: Extract unique statuses
          const statuses = data.entities.map(bird => bird.status);
          const uniqueStatusesArray = [...new Set(statuses)]; // Remove duplicates
          setUniqueStatuses(uniqueStatusesArray); // Store in state
        })
        .catch(error => {
          setErrorMessage("Failed to fetch bird data. Please try again later.");
        })
      );

      await Promise.all(pageRequests); // Wait for all page requests to complete
      setLoading(false); // Stop loading
    };

    fetchBirdsMultiplePages();
  }, [currentPage, apiKey]);

  // Function to handle search input change
  const handleInputChange = (e) => {
    setBirdId(e.target.value);
  };

  // Function to fetch bird details by ID
  const fetchBirdById = () => {
    if (birdId.trim() === "") return;

    fetch(`https://cors-anywhere.herokuapp.com/https:https://nuthatch.lastelm.software/birds/${birdId}`, {
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
    });
  };

  // Pagination functions
  const nextPage = () => {
    setCurrentPage(prevPage => prevPage + 1); // Increment current page
  };

  const prevPage = () => {
    setCurrentPage(prevPage => Math.max(prevPage - 1, 1)); // Decrement current page but not below 1
  };

  // Function to handle status change for filtering
  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  // Filter birds based on selected status
  const filteredBirds = birds.filter(bird => {
    return selectedStatus === "" || bird.status === selectedStatus;
  });

  return (
    <div className="App">
      <header className="App-header">
        <h1>Birds Information</h1>
        {errorMessage && <div className="error">{errorMessage}</div>}
        
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

        {/* Filter by status */}
        <div className="filter">
          <label htmlFor="status-select">Filter by Status:</label>
          <select id="status-select" value={selectedStatus} onChange={handleStatusChange}>
            <option value="">All</option>
            {uniqueStatuses.map(status => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
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
          {filteredBirds.map(bird => (
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

        {/* Pagination Controls */}
        <div className="pagination-controls">
          <button onClick={prevPage} disabled={currentPage === 1}>Previous</button>
          <span>Page {currentPage}</span>
          <button onClick={nextPage}>Next</button>
        </div>
      </header>
    </div>
  );
}

export default App;

