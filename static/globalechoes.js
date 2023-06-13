
// 'use strict';

function goToStreetView(lat, lng) {
  const streetViewUrl = `https://www.google.com/maps?q=&layer=c&cbll=${lat},${lng}`;
  window.open(streetViewUrl, '_blank');
}

function searchSoundsByLocation(latitude, longitude) {
}

function handleSoundResults(response, latitude, longitude) {
  // Generate the HTML content for the info window
  let content = `<h1>Explore soundscapes here:</h1>`;
  // Add the sound results to the info window content
  for (const sound of response) {
    content += `<p>${sound.name}</p>`;
  }

  return content
}

function initAutocomplete() {
  const myStyles = [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [
        { visibility: "off" }
      ]
    }
  ];

  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 0, lng: 0 },
    zoom: 2.5,
    styles: myStyles,
    mapTypeId: "satellite",
  });
  // Create the search box and link it to the UI element.
  const input = document.getElementById("pac-input");
  const searchBox = new google.maps.places.SearchBox(input);

  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
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

          // Use the latitude and longitude for the Freesound API search
          searchSoundsByLocation(latitude, longitude);
          const url = '/search-sounds';
          const data = new URLSearchParams();
          data.append('latitude', latitude);
          data.append('longitude', longitude);

          fetch(url, {
            method: 'POST',
            body: data,
          })
            .then(response => response.text())
            .then(response => {
              // Process the server response and handle the retrieved sounds
              const location_sound = handleSoundResults(response, latitude, longitude);
              const markerInfo = `
            <h1>${marker.title}</h1>
            <p>
              ${location_sound}
            </p>
            <a href="#" onclick="goToStreetView('${marker.position.lat()}', '${marker.position.lng()}')">Go to street view</a>
          `;

              const infoWindow = new google.maps.InfoWindow({
                content: markerInfo,
                maxWidth: 200,
              });
              infoWindow.open(map, marker);
            })
            .catch(error => {
              console.log('Error:', error);
            });

        }
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