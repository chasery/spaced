function getMedia() {
  // Get NASA's media coverage of historical events
  console.log("`getMedia` ran");
}

function getHistoricalEvents() {
  // Get SpaceX's list of historical events
  console.log("`getHistoricalEvents` ran");
}

function appInit() {
  // Initialize appropriate functions
  getHistoricalEvents();
}

$(appInit);
