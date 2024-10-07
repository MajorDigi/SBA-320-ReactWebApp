import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // State variables for handling bird data, errors, and user selections
  const [birds, setBirds] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [birdId, setBirdId] = useState("");
  const [selectedBird, setSelectedBird] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [uniqueStatuses, setUniqueStatuses] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");

  // API key stored in environment variables for security
  const apiKey = process.env.REACT_APP_API_KEY;

  // Fetch bird data when the component mounts or the page changes
  useEffect(() => {
    const fetchBirdsMultiplePages = async () => {
      setLoading(true);

      // Enhancement: Use multiple filters like pageSize, region, hasImg, and operator in the API request
      const pageSize = 25;
      const region = 'North America';
      const hasImg = true;
      const operator = 'AND';
      const proxyUrl = 'https://vicarious-prudence-dmio-2484aa58.koyeb.app/';
      const apiUrl = `https://nuthatch.lastelm.software/v2/birds?page=${currentPage}&pageSize=${pageSize}&region=${encodeURIComponent(region)}&hasImg=${hasImg}&operator=${operator}`;
      const url = `${proxyUrl}${apiUrl}`;

      try {
        const response = await fetch(url, {
          headers: {
            'api-key': apiKey,
            'X-Requested-With': 'XMLHttpRequest'
          }
        });

        if (!response.ok) {
          throw new Error('Network response was not OK');
        }

        const data = await response.json();
        if (!data.entities || !Array.isArray(data.entities)) {
          throw new Error("Entities not found or not an array");
        }
        setBirds(data.entities);

        // Enhancement: Extract unique statuses from the bird data for filtering
        const statuses = data.entities.map(bird => bird.status);
        const uniqueStatusesArray = [...new Set(statuses)];
        setUniqueStatuses(uniqueStatusesArray);
      } catch (error) {
        setErrorMessage("Failed to fetch bird data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBirdsMultiplePages();
  }, [currentPage, apiKey]); // Runs again when currentPage or apiKey changes

  // Handle input change for bird ID search
  const handleInputChange = (e) => {
    setBirdId(e.target.value);
  };

  // Fetch bird by ID based on user input
  const fetchBirdById = () => {
    if (birdId.trim() === "") return;
    setCurrentPage(1); // Enhancement: Reset to page 1 after search

    const proxyUrl = 'https://vicarious-prudence-dmio-2484aa58.koyeb.app/';
    const apiUrl = `https://nuthatch.lastelm.software/birds/${birdId}`;
    const url = `${proxyUrl}${apiUrl}`;

    fetch(url, {
      headers: {
        'api-key': apiKey,
        'X-Requested-With': 'XMLHttpRequest'
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch bird by ID');
        }
        return response.json();
      })
      .then(data => {
        setSelectedBird(data); // Set the bird details when found
      })
      .catch(error => {
        setErrorMessage("Bird not found or an error occurred.");
      });
  };
   // New function to handle returning to page one and clearing the search
   const returnToHomeAndClearSearch = () => {
    setCurrentPage(1);        // Reset to page 1
    setSelectedBird(null);    // Clear selected bird data
    setBirdId('');            // Clear search input field
  };
  // Pagination: Move to the next page
  const nextPage = () => {
    setCurrentPage(prevPage => prevPage + 1);
  };

  // Pagination: Move to the previous page
  const prevPage = () => {
    setCurrentPage(prevPage => Math.max(prevPage - 1, 1));
  };

  // Handle change in the conservation status dropdown filter
  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
    setSelectedBird(null);  // Enhancement: Clear selected bird if the status is changed
  };

  // Filter birds by selected status
  const filteredBirds = birds.filter(bird => {
    return selectedStatus === "" || bird.status === selectedStatus;
  });

  // Enhancement: Function to reset the page to the first page (Home)
  const goToHomePage = () => {
    setCurrentPage(1);
  };
  return (
    <div className="App">
      <header className="App-header">
        <h1> Birds by Conservation Status</h1>
        <h2>Birds Information</h2>
        <p style={{ marginBottom: "20px" }}>
          This resource is designed for bird lovers to gain knowledge about specific bird species
          based on their conservation status.
        </p>
        <p style={{ marginBottom: "10px" }}>
          Filter by Status or Search by individual ID to learn more specific detail.
        </p>
  
        {/* Error message display */}
        {errorMessage && <div className="error">{errorMessage}</div>}
  
        {/* Filter dropdown for conservation status */}
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
  
        {/* Search bar for bird ID */}
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Enter Bird ID" 
            value={birdId}
            onChange={handleInputChange}
          />
          <button onClick={fetchBirdById}>Search</button>
          <button onClick={() => setBirdId('')}>Clear Search</button> {/* Enhancement: Clear search input */}
        </div>
  
        {/* New "Return to Home" button to reset page and clear search */}
        <div>
          <button onClick={returnToHomeAndClearSearch}>
            Return to Home and Clear Search
          </button>
        </div>
  
        {/* Selected bird details display */}
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
  
        {/* Bird list displaying filtered birds */}
        <div className="birdList">
          {filteredBirds.map(bird => (
            <div key={bird.name} className="row">
              <div className="third">
                <h2>{bird.name}</h2>
                <ul>
                  <li>{bird.sciName}</li>
                  <li>Conservation Status: {bird.status}</li>
                  <li>Bird ID: {bird.id}</li>
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
  
        {/* Pagination controls with enhancements */}
        <div className="pagination-controls">
          <button onClick={prevPage} disabled={currentPage === 1}>Previous</button>
          <span>Page {currentPage}</span>
          <button onClick={nextPage}>Next</button>
          {/* Enhancement: Home button to reset pagination to the first page */}
          <button onClick={goToHomePage} style={{ marginLeft: '10px' }}>Home</button>
        </div>
      </header>
    </div>
  );
  }
  
  export default App;
  
