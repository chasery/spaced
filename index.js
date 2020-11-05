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

function createLoaderElement() {
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

function createErrorElement(status, text) {
  // Returns a loading indicator
  return `
    <div class="error">
      <h3>${status}</h3>
      <p>${text}</p>
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
  const mediaItems = obj.items.map((image) => {
    const imageObj = {
      href: image.links[0].href,
      title: image.data[0].title,
      location: image.data[0].location,
      description: image.data[0].description,
      type: image.data[0].media_type,
    };
    return imageObj;
  });
  return mediaItems;
}

function createImageElements(images) {
  // Returns an array of image elements
  const imageList = images.map((image) => {
    return `<img src="${image.href}" alt="${image.title} - ${image.location} - ${image.description}"/>`;
  });
  return imageList;
}

/********** EVENT HANDLER FUNCTIONS **********/

function handleEventClick() {
  // Handles the click event on an event
  $("#jsEventsList").on("click", "#jsEventItem", function (event) {
    const target = $(event.currentTarget);
    if (!target.hasClass("active") && !target.find("div.images").length) {
      target.toggleClass("active").siblings().removeClass("active");
      target.find("#jsNasaContent").html(createLoaderElement());
      getMedia(target.data("date"))
        .then((json) => {
          const images = parseMedia(json.collection);
          let result;
          if (images.length) {
            const imageElements = createImageElements(images);
            result = `<div class="images">${imageElements.join("")}</div>`;
          } else {
            result = `<div class="images"><p class="noImages">No NASA imagery available around the time of the event.</p></div>`;
          }
          target.find("#jsNasaContent").html(result);
        })
        .catch((status) => {
          target
            .find("#jsNasaContent")
            .html(
              createErrorElement(
                status,
                "Something is wrong, please try again later!"
              )
            );
        });
    } else {
      target.toggleClass("active");
    }
  });
}

function appInit() {
  // Initialize appropriate functions
  const eventsContainer = $("#jsEventsList");
  getHistoricalEvents()
    .then((json) => {
      const sortedEvents = sortHistoricalEvents(json);
      eventsContainer
        .children("ul.eventsList__wrapper")
        .html(createHistoricalEvents(sortedEvents));
      eventsContainer.children("div.eventList__loader").toggleClass("hidden");
      eventsContainer.children("ul.eventsList__wrapper").toggleClass("hidden");
    })
    .catch((status) => {
      eventsContainer.html(
        createErrorElement(
          status,
          "Something is wrong, please try again later!"
        )
      );
    });
  handleEventClick();
}

$(appInit);
