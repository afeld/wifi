angular.module('wifiApp').factory('venuesApi', function($http, credentials) {
  // round for better caching
  // http://en.wikipedia.org/wiki/Decimal_degrees
  var GEO_DECIMALS = 3;

  return {
    get: function(coords) {
      var venuesPromise = $http.get('https://api.foursquare.com/v2/venues/search', {
        cache: true,
        params: {
          client_id: credentials.clientId,
          client_secret: credentials.clientSecret,
          v: 20140122,

          q: 'wi-fi',
          intent: 'checkin',
          ll: coords.latitude.toFixed(GEO_DECIMALS) + ',' + coords.longitude.toFixed(GEO_DECIMALS),
          radius: 1600, // meters
          categoryId: [
            // Food
            '4d4b7105d754a06374d81259',
            // Nightlife Spot
            '4d4b7105d754a06376d81259',
            // Travel & Transport
            '4d4b7105d754a06379d81259'
          ].join(',')
        }
      });

      venuesPromise = venuesPromise.then(function(data){
        return data.data.response.venues;
      });

      return venuesPromise;
    }
  };
});
