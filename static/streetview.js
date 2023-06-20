// JS for Earth Echoes streetview page 
// 'use strict';

function goToStreetView(latitude, longitude, location_name) {
    // const streetViewUrl = `https://www.google.com/maps?q=&layer=c&cbll=${lat},${lng}`;
    // window.open(streetViewUrl, '_blank');
    console.log("latitude:", latitude)
    const streetview_location = { lat: Number(latitude), lng: Number(longitude) };
    const map = new google.maps.Map(document.getElementById("map"), {
      center: streetview_location,
      zoom: 14,
    });
    const panorama = new google.maps.StreetViewPanorama(
      document.getElementById("pano"),
      {
        position: streetview_location,
        pov: {
          heading: 34,
          pitch: 10,
        },
      }
    );
    
      map.setStreetView(panorama);
      console.log("Location Name:", location_name);
    
    }