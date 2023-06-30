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
  let content = `<details>
  <summary class="info-window-summary">Discover Soundscapes</summary>`;
  // Add the sound results to the info window content
  for (const sound of response) {
    content += `<p>${sound.name}</p>`;
    content += `<audio controls> <source src="${sound.playable_link}"></audio>`
  }
  content += `</details>`;
  return content;
}

function initAutocomplete() {

  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 0, lng: 0 },
    zoom: 2.5,
    mapTypeId: "roadmap",
    styles: [
      {
        "featureType": "all",
        "elementType": "all",
        "stylers": [
          { "saturation": -100 }  // keeps the map grayscale
        ]
      },
      {
        "featureType": "all",
        "elementType": "labels.text.fill",
        "stylers": [
          { "color": "#E42256" }  // sets text color
        ]
      }
    ],
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
        map: map,
        icon: {
          path: "M4 4a4 4 0 1 1 4.5 3.969V13.5a.5.5 0 0 1-1 0V7.97A4 4 0 0 1 4 3.999zm2.493 8.574a.5.5 0 0 1-.411.575c-.712.118-1.28.295-1.655.493a1.319 1.319 0 0 0-.37.265.301.301 0 0 0-.057.09V14l.002.008a.147.147 0 0 0 .016.033.617.617 0 0 0 .145.15c.165.13.435.27.813.395.751.25 1.82.414 3.024.414s2.273-.163 3.024-.414c.378-.126.648-.265.813-.395a.619.619 0 0 0 .146-.15.148.148 0 0 0 .015-.033L12 14v-.004a.301.301 0 0 0-.057-.09 1.318 1.318 0 0 0-.37-.264c-.376-.198-.943-.375-1.655-.493a.5.5 0 1 1 .164-.986c.77.127 1.452.328 1.957.594C12.5 13 13 13.4 13 14c0 .426-.26.752-.544.977-.29.228-.68.413-1.116.558-.878.293-2.059.465-3.34.465-1.281 0-2.462-.172-3.34-.465-.436-.145-.826-.33-1.116-.558C3.26 14.752 3 14.426 3 14c0-.599.5-1 .961-1.243.505-.266 1.187-.467 1.957-.594a.5.5 0 0 1 .575.411z",  // You can set this to other predefined shapes or to a custom SVG path.
          scale: 2.5,  // This determines the size of the shape.
          fillColor: '#FEC84D',  // This sets the interior color of the shape.
          fillOpacity: 1,  // This sets the transparency of the interior of the shape.
          strokeColor: '#000',  // This sets the color of the border of the shape.
          strokeOpacity: 1,  // This sets the transparency of the border of the shape.
          strokeWeight: 2,  // This sets the width of the border of the shape.
        },
        title: place.name,
        position: place.geometry.location,
      });

      markers.push(marker);

      marker.addListener('click', () => {
        console.log('Marker clicked!');
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
                        saveLocationButton =
                          `
                          <a href="#" class="save-location-link" disabled>
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" class="bi bi-heart-fill" viewBox="0 0 16 16">
                              <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z" /></svg>
                            Location Saved
                          </a>`;
                      } else {
                        saveLocationButton = `
                            <form action = "/save_location" method = "post" >
                              <input type="hidden" name="location_id" value="${place.place_id}">
                                <input type="hidden" name="location_name" value="${place.name}">
                                  <input type="hidden" name="location_lat" value="${place.geometry.location.lat()}">
                                    <input type="hidden" name="location_lng" value="${place.geometry.location.lng()}">
                                      <a class="save-location-link" href="/save_location" onclick="event.preventDefault(); this.closest('form').submit();">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" class="bi bi-heart" viewBox="0 0 16 16">
                                          <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z" /></svg>
                                        Save Location
                                      </a>
                                    </form>`;
                      }
                  
                      const google_key = document.body.dataset.googleKey;
                      const streetViewImgUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${latitude},${longitude}&key=${google_key}`;

                      let wikiContent = '';
                      if (wikiExtract) {
                        wikiContent = wikiExtract;
                      } else {
                        wikiContent = '<em>Looks like our sources had no further information. Sorry about that!</em>';
                      }
                      
                      const markerInfo = `
                        <div class="info-window">
                          <h3 class="info-window-title">${marker.title}</h3>
                          ${saveLocationButton}
                          <p>
                          <img class="info-window-img" src="${streetViewImgUrl}" alt="Street view of ${marker.title}" />
                          <span class="info-icon">(i) How do I begin my virtual stroll?
                          <span class="tooltip-text">Use the soundscapes feature below to select a background ambient sound of your choice, then drag the yellow pegman to a place on the map you want to take your virtual walk!</span>
                          </span>                          
                          <p>${location_sound}
                          <details class="info-window-details">
                            <summary class="info-window-summary">Learn More About This Location</summary>
                            <p>${wikiContent}</p>
                          </details>
                        </div>
                      `;


                      const infoWindow = new google.maps.InfoWindow({
                        content: markerInfo,
                        maxWidth: 800,
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