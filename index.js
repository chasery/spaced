// SpaceX Historical Events Endpoint URL
const spacexHistoryEndpoint = "https://api.spacexdata.com/v4/history";

function getMedia() {
  // Get NASA's media coverage of historical events
  console.log("`getMedia` ran");
  return fetch(spacexHistoryEndpoint).then((response) => {
    if (response.ok) {
      return "hi";
    }
    return response.status;
  });
}

function createLoader() {
  return `
    <div class="loader">
      <div class="loader-circle">
        <div>
          <div class="loader moon-loader"></div>
        </div>
      </div>
      <div class="loader-sun"></div>
    </div>
  `;
}

function handleEventClick() {
  // Handles the click event on an event
  $("#jsEventsList").on("click", "#jsEventItem", function (event) {
    const target = $(event.currentTarget);
    target.toggleClass("active").siblings().removeClass("active");
    target.find("#jsNasaContent").html(createLoader());
    getMedia().then((json) => {
      setTimeout(function () {
        target.find("#jsNasaContent").html(json);
      }, 2000);
    });
  });
}

function formatDisplayDate(date) {
  // Returns a human legible date string
  const dateObj = new Date(date);
  const year = dateObj.getUTCFullYear();
  const month = dateObj.getUTCMonth() + 1;
  const day = dateObj.getUTCDate();

  return `${month}/${day}/${year}`;
}

function renderHistoricalEvents(sortedEvents) {
  // Renders each of the  events in the sorted array
  const eventsContainer = $("#jsEventsList ul");
  for (let i = 0; i < sortedEvents.length; i++) {
    const event = sortedEvents[i];
    const eventDate = formatDisplayDate(event.event_date_utc);
    eventsContainer.append(`
      <li id="jsEventItem" class="event" data-id="${event.id}">
        <div class="event__header">
          <div class="event__headerContent">
            <h2 class="event__title">${event.title}</h2>
            <h3 class="event__date">${eventDate}</h3>
          </div>
          <img class="event__headerArrow" src="./svg/arrow.svg" />
        </div>
        <div class="event__body">
          <p>${event.details}</p>
          <div id="jsNasaContent" class="event__nasaContent"></div>
        </div>
      </li>
    `);
  }
}

function sortHistoricalEvents(events) {
  // Sorts SpaceX's historical events from newest to oldest
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

function toggleHidden(element) {
  // Toggles the hidden class for the provided element
  element.toggleClass("hidden");
}

function appInit() {
  // Initialize appropriate functions
  getHistoricalEvents()
    .then((json) => {
      const eventsContainer = $("#jsEventsList");
      const sortedEvents = sortHistoricalEvents(json);
      setTimeout(function () {
        toggleHidden(eventsContainer.children("div.eventList__loader"));
        renderHistoricalEvents(sortedEvents);
        toggleHidden(eventsContainer.children("ul.eventsList__wrapper"));
      }, 2000);
    })
    .catch((status) => {
      console.log(status);
    });
  handleEventClick();
}

$(appInit);
