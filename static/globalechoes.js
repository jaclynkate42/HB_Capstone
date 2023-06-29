// JS for Earth Echoes homepage 
// 'use strict';

function goToStreetView(lat, lng) {
  const streetViewUrl = `https://www.google.com/maps?q=&layer=c&cbll=${lat},${lng}`;
  window.open(streetViewUrl, '_blank');
  // Use the latitude and longitude for the Freesound API search
  searchSoundsByLocation(lat, lng);
}

function searchSoundsByLocation(latitude, longitude) {
}

function handleSoundResults(response, latitude, longitude) {
  // Generate the HTML content for the info window
  let content = `<h1>Explore soundscapes here:</h1>`;
  // Add the sound results to the info window content
  for (const sound of response) {
    content += `<p>${sound.name}</p>`;
    content += `<audio controls> <source src="${sound.playable_link}"></audio>`
    // content += `<p><a href="${sound.playable_link}" target="_blank">${sound.name}</a></p>`;
  }

  return content
}

function initAutocomplete() {
  // const myStyles = [
  //   {
  //     featureType: "poi",
  //     elementType: "labels",
  //     stylers: [
  //       { visibility: "off" }
  //     ]
  //   }
  // ];

  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 0, lng: 0 },
    zoom: 2.5,
    // styles: myStyles,
    mapTypeId: "satellite",
    mapTypeControl: false,
  });
  // Create the search box and link it to the UI element.
  const input = document.getElementById("pac-input");
  const searchBox = new google.maps.places.SearchBox(input);

  // map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
  // Bias the SearchBox results towards current map's viewport.
  map.addListener("bounds_changed", () => {
    searchBox.setBounds(map.getBounds());
  });

  let markers = [];

  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener("places_changed", () => {
    const places = searchBox.getPlaces();

    // For each place, get the icon, name and location.
    const bounds = new google.maps.LatLngBounds();

    places.forEach((place) => {
      console.log(place)
      if (!place.geometry || !place.geometry.location) {
        console.log("Returned place contains no geometry");
        return;
      }

      const icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25),
      };

      // Create a marker for each place.
      const marker = new google.maps.Marker({
        map,
        icon,
        title: place.name,
        position: place.geometry.location,
      })

      markers.push(marker);

      marker.addListener('click', () => {
        if (places.length > 0) {
          const place = places[0];

          // Retrieve the latitude and longitude from the selected place
          const latitude = place.geometry.location.lat();
          const longitude = place.geometry.location.lng();
          const location_name = place.name;

          // Wikipedia API Request
          const wikiUrl = `https://en.wikipedia.org/w/api.php?origin=*&action=query&format=json&titles=${encodeURIComponent(location_name)}&prop=extracts&exintro&explaintext`;

          fetch(wikiUrl)
            .then(response => response.json())
            .then(wikiData => {
              const page = wikiData.query.pages;
              const pageId = Object.keys(page)[0];
              const wikiExtract = page[pageId].extract;

              // Use the latitude and longitude for the Freesound API search
              searchSoundsByLocation(latitude, longitude, location_name);
              const url = '/search-sounds';
              const data = new URLSearchParams();
              data.append('latitude', latitude);
              data.append('longitude', longitude);
              data.append('location_name', location_name);

              fetch(url, {
                method: 'POST',
                body: data,
              })
                .then(response => response.json())
                .then(response => {
                  // Process the server response and handle the retrieved sounds
                  console.log(response)
                  const location_sound = handleSoundResults(response, latitude, longitude);

                  fetch('/handle_saved_locations')
                    .then(response => response.json())
                    .then(data => {
                      let locationIds = data;
                      let saveLocationButton = '';
                      if (locationIds.includes(place.place_id)) {
                        saveLocationButton = '<button type="button" disabled>Location Saved</button>';
                      } else {
                        saveLocationButton = `
                              <form action="/save_location" method="post">
                                <input type="hidden" name="location_id" value="${place.place_id}">
                                <input type="hidden" name="location_name" value="${place.name}">
                                <input type="hidden" name="location_lat" value="${place.geometry.location.lat()}">
                                <input type="hidden" name="location_lng" value="${place.geometry.location.lng()}">
                                <button type="submit">Save Location2</button>
                              </form>`;
                      }

                      const markerInfo = `
                    <h1>${marker.title}</h1>
                    <details>
                      <summary>Learn More</summary>
                      <p>${wikiExtract}</p>
                    </details>
                    <p>
                    ${saveLocationButton}
                    <button type="button" onclick="goToStreetView(${place.geometry.location.lat()}, ${place.geometry.location.lng()})">Explore Street View</button>

                    ${location_sound}
                  `;

                      const infoWindow = new google.maps.InfoWindow({
                        content: markerInfo,
                        maxWidth: 300,
                      });
                      infoWindow.open(map, marker);
                    })
                    .catch(error => {
                      console.log('Error:', error);
                    });
                })
                .catch(error => {
                  console.log('Error:', error);
                });

              })}
    });


      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);

  });

  // Clear out the old markers.
  markers.forEach((marker) => {
    marker.setMap(null);
  });
  markers = [];

};

window.initAutocomplete = initAutocomplete;