(function(){
  // https://foursquare.com/developers/app/IBFUDPTFRDXZDBZJB4FZQ4QWDPPCTDRWWMCB0XXWNLW524ZD
  var CLIENT_ID = 'IBFUDPTFRDXZDBZJB4FZQ4QWDPPCTDRWWMCB0XXWNLW524ZD';
  var CLIENT_SECRET = 'V1NS4BZV014GW5HK0JH2N1K3ZANXMOBEI0EIUG02SWRU3BO4';

  var getGeolocation = function() {
    var deferred = $.Deferred();

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

      deferred.resolve(crd);
    };

    var onError = function(err) {
      console.warn('ERROR(' + err.code + '): ' + err.message);
      deferred.reject(err)
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, options);

    return deferred.promise();
  };

  var getVenues = function(coords) {
    var url = 'https://api.foursquare.com/v2/venues/search';
    var query = {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      v: 20140122,

      q: 'wi-fi',
      ll: coords.latitude + ',' + coords.longitude
    };

    return $.getJSON(url, query);
  };

  var displayVenues = function(data) {
    var template = $('#venues').text();
    var markup = _.template(template, {
      venues: data.response.venues
    });
    $('body').html(markup);
  };


  if ("geolocation" in navigator) {
    getGeolocation().
      then(getVenues).
      then(displayVenues);
  } else {
    alert("Your browser doesn't support geolocation. Sorry!");
  }
})();
