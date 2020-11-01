// SpaceX Historical Events Endpoint URL
const spacexHistoryEndpoint = "https://api.spacexdata.com/v4/histor";

function getMedia() {
  // Get NASA's media coverage of historical events
  console.log("`getMedia` ran");
}

function getHistoricalEvents() {
  // Get SpaceX's list of historical events
  console.log("`getHistoricalEvents` ran");
  return fetch(spacexHistoryEndpoint).then((response) => {
    if (response.ok) {
      return response.json();
    }
    return response.status;
  });
}

function appInit() {
  // Initialize appropriate functions
  getHistoricalEvents()
    .then((json) => {
      console.log(json);
    })
    .catch((status) => {
      console.log(status);
    });
}

$(appInit);
