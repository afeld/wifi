(function(){
  var getGeolocation = function() {
    var options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    var onSuccess = function(pos) {
      var crd = pos.coords;

      console.log('Your current position is:');
      console.log('Latitude : ' + crd.latitude);
      console.log('Longitude: ' + crd.longitude);
      console.log('More or less ' + crd.accuracy + ' meters.');
    };

    var onError = function(err) {
      console.warn('ERROR(' + err.code + '): ' + err.message);
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
  };

  if ("geolocation" in navigator) {
    getGeolocation();
  } else {
    alert("Your browser doesn't support geolocation. Sorry!");
  }
})();
