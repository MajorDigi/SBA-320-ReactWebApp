import React, { useState, useEffect } from 'react';
import './App.css';


function App() {
  const [birds, setBirds] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetch('https://nuthatch.lastelm.software/v2/birds?page=1&pageSize=25&region=North%20America&hasImg=true&operator=AND', {
      headers: {
        'api-key': '62bb08cb-87e4-443c-b306-68d4bcb783c1'
      }
    })
    .then(response => {
      console.log('Response:', response)
      if (!response.ok) {
        throw new Error('Network response was not OK');
      }
      return response.json(); // Use json() instead of text()
    })
    .then(data => {
      console.log(data); // Log the data to see its structure
      // Check if 'entities' exists and is an array
      if (!data.entities || !Array.isArray(data.entities)) {
        throw new Error("Entities not found or not an array");
      }
      setBirds(data.entities.slice(0, 5)); // Store first 5 birds in state
    })
    .catch(error => {
      console.error('There has been a problem with your fetch operation:', error);
      setErrorMessage("Failed to fetch bird data. Please try again later.");
    });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Birds Information</h1>
        {errorMessage && <div className="error">{errorMessage}</div>}
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




