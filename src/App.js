import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [birds, setBirds] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [birdId, setBirdId] = useState("");
  const [selectedBird, setSelectedBird] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [uniqueStatuses, setUniqueStatuses] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");

  const apiKey = process.env.REACT_APP_API_KEY;

  useEffect(() => {
    const fetchBirdsMultiplePages = async () => {
      setLoading(true);

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
            'api-key': apiKey
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
  }, [currentPage, apiKey]);

  const handleInputChange = (e) => {
    setBirdId(e.target.value);
  };

  const fetchBirdById = () => {
    if (birdId.trim() === "") return;

    const proxyUrl = 'https://vicarious-prudence-dmio-2484aa58.koyeb.app/';
    const apiUrl = `https://nuthatch.lastelm.software/birds/${birdId}`;
    const url = `${proxyUrl}${apiUrl}`;

    fetch(url, {
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
      setSelectedBird(data);
    })
    .catch(error => {
      setErrorMessage("Bird not found or an error occurred.");
    });
  };

  const nextPage = () => {
    setCurrentPage(prevPage => prevPage + 1);
  };

  const prevPage = () => {
    setCurrentPage(prevPage => Math.max(prevPage - 1, 1));
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  const filteredBirds = birds.filter(bird => {
    return selectedStatus === "" || bird.status === selectedStatus;
  });

  return (
    <div className="App">
      <header className="App-header">
        <h1>Birds by Conservation Status</h1>
        <p>This resource is designed for bird lovers to gain knowledge about specific bird species based on their conservation status.</p>
        {errorMessage && <div className="error">{errorMessage}</div>}
        
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
