angular.module('wifiApp').factory('venuesApi', function($http, credentials) {
  // round for better caching
  // http://en.wikipedia.org/wiki/Decimal_degrees
  var GEO_DECIMALS = 3;

  return {
    get: function(coords) {
      var venuesPromise = $http.get('https://api.foursquare.com/v2/venues/explore', {
        cache: true,
        params: {
          client_id: credentials.clientId,
          client_secret: credentials.clientSecret,
          v: 20140122,

          query: 'wifi',
          ll: coords.latitude.toFixed(GEO_DECIMALS) + ',' + coords.longitude.toFixed(GEO_DECIMALS),
          radius: 1600, // meters
          openNow: true,
          limit: 10
        }
      });

      venuesPromise = venuesPromise.then(function(data){
        var results = [];
        angular.forEach(data.data.response.groups, function(group) {
          angular.forEach(group.items, function(item) {
            results.push(item.venue);
          });
        });
        return results;
      });

      return venuesPromise;
    }
  };
});
