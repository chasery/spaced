// SpaceX Historical Events Endpoint URL
const spacexHistoryEndpoint = "https://api.spacexdata.com/v4/history";

function getHistoricalEvents() {
  // Get SpaceX's list of historical events
  return fetch(spacexHistoryEndpoint).then((response) => {
    if (response.ok) {
      return response.json();
    }
    return response.status;
  });
}

function sortHistoricalEvents(events) {
  // Sorts SpaceX's historical events from newest to oldest
  const sortedEvents = events
    .slice()
    .sort((a, b) => new Date(b.event_date_utc) - new Date(a.event_date_utc));
  return sortedEvents;
}

// NASA API and Key
// const nasaApiKey = "zdMex2SGsIAoKYjFPgu01yU62Vuk1hgEP5DD31wA";
const nasaImagesApi = "https://images-api.nasa.gov/";

function formatQueryString(date) {
  // Returns a formatted query string for the NASA API
  const dateObj = new Date(date);
  const dateString =
    dateObj.getUTCFullYear() +
    "-" +
    ("0" + (dateObj.getUTCMonth() + 1)).slice(-2) +
    "-" +
    ("0" + dateObj.getUTCDate()).slice(-2);
  return `q=spacex+${dateString}`;
}

function getMedia(date) {
  // Get NASA's media coverage of historical events
  const queryString = formatQueryString(date);
  const url = nasaImagesApi + "search?" + queryString;

  return fetch(url).then((response) => {
    if (response.ok) {
      return response.json();
    }
    return response.status;
  });
}

/********** TEMPLATE GENERATION FUNCTIONS **********/

function createLoader() {
  // Returns a loading indicator
  return `
    <div class="loader">
      <div class="loader-circle">
        <div>
          <div class="loader moon-loader">
          </div>
        </div>
      </div>
      <div class="loader-sun"></div>
    </div>
  `;
}

function createHistoricalEvents(sortedEvents) {
  // Returns a string of HTML formatted events
  const eventsList = [];
  for (let i = 0; i < sortedEvents.length; i++) {
    const event = sortedEvents[i];
    const eventDate = createDisplayDate(event.event_date_utc);
    eventsList.push(`
      <li id="jsEventItem" class="event" data-id="${event.id}" data-date="${event.event_date_utc}">
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
  return eventsList.join("");
}

function createDisplayDate(date) {
  // Returns a human legible date string
  const dateObj = new Date(date);
  const year = dateObj.getUTCFullYear();
  const month = dateObj.getUTCMonth() + 1;
  const day = dateObj.getUTCDate();

  return `${month}/${day}/${year}`;
}

function parseMedia(obj) {
  // Returns an array with all of our event media objects
  const mediaItems = [];
  if (obj.items) {
    for (let i = 0; i < obj.items.length; i++) {
      for (let j = 0; j < obj.items[i].data.length; j++) {
        let mediaItem = {
          links: obj.items[i].links,
          title: obj.items[i].data[j].nasa_id,
          type: obj.items[i].data[j].media_type,
        };
        mediaItems.push(mediaItem);
      }
    }
  }
  return mediaItems;
}

function createMediaElements(media) {
  // Returns a string of elements based on the data type: image, video, audio
  const mediaList = [];
  if (media.length) {
    for (let i = 0; i < media.length; i++) {
      let current = media[i];
      console.log(current);
      if (current.type === "image") {
        mediaList.push(`<p>${current.title} - ${current.type}</p>`);
      } else if (current.type === "video") {
        mediaList.push(`<p>${current.title} - ${current.type}</p>`);
      } else if (current.type === "audio") {
        mediaList.push(`<p>${current.title} - ${current.type}</p>`);
      } else {
        mediaList.push(`<p class="error">Unknown media format.</p>`);
      }
    }
    return mediaList.join("");
  }
  return `<p>No media for the is event.</p>`;
}

/********** EVENT HANDLER FUNCTIONS **********/

function handleEventClick() {
  // Handles the click event on an event
  $("#jsEventsList").on("click", "#jsEventItem", function (event) {
    const target = $(event.currentTarget);
    target.addClass("active").siblings().removeClass("active");
    target.find("#jsNasaContent").html(createLoader());
    getMedia(target.data("date")).then((json) => {
      const media = parseMedia(json.collection);
      setTimeout(function () {
        target.find("#jsNasaContent").html(createMediaElements(media));
      }, 2000);
    });
  });
}

function handleToggleClass(element, cssClass) {
  // Event handler for toggling a class for the provided element
  element.toggleClass(cssClass);
}

function appInit() {
  // Initialize appropriate functions
  getHistoricalEvents()
    .then((json) => {
      const eventsContainer = $("#jsEventsList");
      const sortedEvents = sortHistoricalEvents(json);
      setTimeout(function () {
        eventsContainer
          .children("ul.eventsList__wrapper")
          .html(createHistoricalEvents(sortedEvents));
        handleToggleClass(
          eventsContainer.children("div.eventList__loader"),
          "hidden"
        );
        handleToggleClass(
          eventsContainer.children("ul.eventsList__wrapper"),
          "hidden"
        );
      }, 2000);
    })
    .catch((status) => {
      console.log(status);
    });
  handleEventClick();
}

$(appInit);
