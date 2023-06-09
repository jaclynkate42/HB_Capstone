
// 'use strict';

// This example adds a search box to a map, using the Google Place Autocomplete
// feature. People can enter geographical searches. The search box will return a
// pick list containing a mix of places and predicted search terms.
// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">

function goToStreetView(lat, lng) {
  const streetViewUrl = `https://www.google.com/maps?q=&layer=c&cbll=${lat},${lng}`;
  window.open(streetViewUrl, '_blank');
  // Use the latitude and longitude for the Freesound API search
  searchSoundsByLocation(lat, lng);
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

    if (places.length == 0) {
      return;
    }

    // Clear out the old markers.
    markers.forEach((marker) => {
      marker.setMap(null);
    });
    markers = [];

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

      const markerInfo = `
        <h1>${marker.title}</h1>
        <p>
          Click here to enter street view
        </p>
        <a href="#" onclick="goToStreetView('${marker.position.lat()}', '${marker.position.lng()}')">Go to street view</a>
      `;

      const infoWindow = new google.maps.InfoWindow({
        content: markerInfo,
        maxWidth: 200,
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
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

  // for (const marker of markers) {
  //   const markerInfo = `
  //     <h1>${marker.title}</h1>
  //     <p>
  //       Located at: <code>${marker.position.lat()}</code>,
  //       <code>${marker.position.lng()}</code>
  //     </p>
  //   `;

  //   const infoWindow = new google.maps.InfoWindow({
  //     content: "TEST",
  //     maxWidth: 200,
  //   });

  //   marker.addListener('click', () => {
  //     infoWindow.open(basicMap, marker);
  //   });
  // }
}


window.initAutocomplete = initAutocomplete;