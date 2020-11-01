// SpaceX Historical Events Endpoint URL
const spacexHistoryEndpoint = "https://api.spacexdata.com/v4/history";

function getMedia() {
  // Get NASA's media coverage of historical events
  console.log("`getMedia` ran");
}

function renderHistoricalEvents(sortedEvents) {
  // Renders each of the  events in the sorted array
  const eventsContainer = $("#jsEventsList");
  eventsContainer.removeClass("hidden");
  for (let i = 0; i < sortedEvents.length; i++) {
    const event = sortedEvents[i];
    eventsContainer.children("ul").append(`
      <li class="event" data-id="${event.id}">
        <h2 class="event__title">${event.title}</h2>
        <h3 class="event__date">${event.event_date_utc}</h3>
      </li>
    `);
  }
}

function sortHistoricalEvents(events) {
  const sortedEvents = events
    .slice()
    .sort((a, b) => new Date(b.event_date_utc) - new Date(a.event_date_utc));
  return sortedEvents;
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
      renderHistoricalEvents(sortHistoricalEvents(json));
    })
    .catch((status) => {
      console.log(status);
    });
}

$(appInit);
