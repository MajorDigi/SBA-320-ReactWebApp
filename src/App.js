import React, { useState, useEffect } from 'react';
import './App.css';


function App() {
  const [birds, setBirds] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [birdId, setBirdId] = useState(""); // State for search input
  const [selectedBird, setSelectedBird] = useState(null); // State for the bird returned from search
  //API
  const apiKey = process.env.REACT_APP_API_KEY;
  // const apiUrl = process.env.REACT_APP_API_URL;


  useEffect(() => {
    fetch('https://nuthatch.lastelm.software/v2/birds?page=1&pageSize=25&region=North%20America&hasImg=true&operator=AND', {
      headers: {
        'api-key': '62bb08cb-87e4-443c-b306-68d4bcb783c1'
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not OK');
      }
      return response.json();
    })
    .then(data => {
      if (!data.entities || !Array.isArray(data.entities)) {
        throw new Error("Entities not found or not an array");
      }
      setBirds(data.entities.slice(0, 5)); // Store first 5 birds in state
    })
    .catch(error => {
      setErrorMessage("Failed to fetch bird data. Please try again later.");
    });
  }, []);

  // Function to handle search input change
  const handleInputChange = (e) => {
    setBirdId(e.target.value);
  };

  // Function to fetch bird details by ID
  const fetchBirdById = () => {
    fetch(`https://nuthatch.lastelm.software/birds/${birdId}`, {
      headers: {
        'api-key':  '62bb08cb-87e4-443c-b306-68d4bcb783c1'
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





