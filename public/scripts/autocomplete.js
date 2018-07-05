var autocomplete;

function initAutocomplete() {
  // Create the autocomplete object, restricting the search to establishment
  // location types.
  autocomplete = new google.maps.places.Autocomplete(
      /** @type {!HTMLInputElement} */(document.getElementById('autocomplete')),
      {types: ['establishment']});

  // When the user selects an address from the dropdown, populate the address
  // fields in the form.
  autocomplete.addListener('place_changed', displayAddress);
}

function displayCity(lat, lng) {
  var geocoder = new google.maps.Geocoder();
  var latlng = new google.maps.LatLng(lat, lng);
  var city = "";

  geocoder.geocode({'latLng': latlng}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      if (results[1]) {
        for (var i = 0; i < results.length; i++) {
          // Australian cities return the types array ["colloquial_area", "locality", "political"] from the Google geocoding API
          if (results[i].types[0] == "colloquial_area" && results[i].types[1] == "locality" && results[i].types[2] == "political") {
            city = results[i].address_components[0].short_name;
            document.getElementById("hospital_city").value = city;
          }
        }
      }
    }
  });
}

function displayAddress() {
  // Get the place details from the autocomplete object.
  var place = autocomplete.getPlace();

  var name = place.name;
  var lat = place.geometry.location.lat();
  var lng = place.geometry.location.lng();

  var state = "";
  for (var i = 0; i < place.address_components.length; i++) {
    if (place.address_components[i].types[0] == "administrative_area_level_1" && place.address_components[i].types[1] == "political") {
      state = place.address_components[i].long_name;
      break;
    }
  }

  document.getElementById("hospital_name").value = name;
  document.getElementById("hospital_state").value = state;
  document.getElementById("hospital_coords").value = lat + ', ' + lng;

  // Corresponding city is found separately using Google's reverse geocoding API and then displayed
  displayCity(lat, lng);
  
}

// Bias the autocomplete object to the user's geographical location,
// as supplied by the browser's 'navigator.geolocation' object.
function geolocate() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var geolocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      var circle = new google.maps.Circle({
        center: geolocation,
        radius: position.coords.accuracy
      });
      autocomplete.setBounds(circle.getBounds());
    });
  }
}