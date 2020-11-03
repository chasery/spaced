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
  const year = dateObj.getUTCFullYear();
  const dateString = year + "-" + ("0" + (dateObj.getUTCMonth() + 1)).slice(-2);
  return `q=${dateString}%20spacex&year_start=${year}&year_end=${year}&media_type=image`;
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
        let imageItem = {
          href: obj.items[i].links[0].href,
          title: obj.items[i].data[j].title,
          location: obj.items[i].data[j].location,
          description: obj.items[i].data[j].description,
          type: obj.items[i].data[j].media_type,
        };
        mediaItems.push(imageItem);
      }
    }
  }
  return mediaItems;
}

function createImageElements(images) {
  // Returns a string of elements based on the data type: image, video, audio
  const imageList = [];
  if (images.length) {
    for (let i = 0; i < images.length; i++) {
      let current = images[i];
      imageList.push(`
        <img src="${current.href}" width="100%" alt="${current.title} - ${current.location} - ${current.description}"/>
      `);
    }
    return imageList.join("");
  }
  return `<p><strong>No NASA imagery available around the time of the event.</strong></p>`;
}

/********** EVENT HANDLER FUNCTIONS **********/

function handleEventClick() {
  // Handles the click event on an event
  $("#jsEventsList").on("click", "#jsEventItem", function (event) {
    const target = $(event.currentTarget);
    target.addClass("active").siblings().removeClass("active");
    target.find("#jsNasaContent").html(createLoader());
    getMedia(target.data("date")).then((json) => {
      const images = parseMedia(json.collection);
      setTimeout(function () {
        target.find("#jsNasaContent").html(createImageElements(images));
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
