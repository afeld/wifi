(function(){
  // https://foursquare.com/developers/app/IBFUDPTFRDXZDBZJB4FZQ4QWDPPCTDRWWMCB0XXWNLW524ZD
  var CLIENT_ID = 'IBFUDPTFRDXZDBZJB4FZQ4QWDPPCTDRWWMCB0XXWNLW524ZD';
  var CLIENT_SECRET = 'V1NS4BZV014GW5HK0JH2N1K3ZANXMOBEI0EIUG02SWRU3BO4';

  // round for better caching
  // http://en.wikipedia.org/wiki/Decimal_degrees
  var GEO_DECIMALS = 3;

  var wifiApp = angular.module('wifiApp', ['geolocation', 'jmdobry.angular-cache']);


  wifiApp.run(function($http, $angularCacheFactory) {
    // http://jmdobry.github.io/angular-cache/configuration.html
    $angularCacheFactory('httpCache', {
      // Items added to this cache expire after 15 minutes
      maxAge: 900000,
      // Items will be actively deleted when they expire
      deleteOnExpire: 'aggressive',
      // This cache will clear itself every hour
      cacheFlushInterval: 3600000,
      // This cache will sync itself with localStorage
      storageMode: 'localStorage'
    });

    $http.defaults.cache = $angularCacheFactory.get('httpCache');
  });


  wifiApp.factory('venuesApi', function($http) {
    return {
      get: function(coords) {
        var venuesPromise = $http.get('https://api.foursquare.com/v2/venues/search', {
          cache: true,
          params: {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            v: 20140122,

            q: 'wi-fi',
            intent: 'checkin',
            ll: coords.latitude.toFixed(GEO_DECIMALS) + ',' + coords.longitude.toFixed(GEO_DECIMALS),
            categoryId: [
              // Food
              '4d4b7105d754a06374d81259',
              // Nightlife Spot
              '4d4b7105d754a06376d81259'
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


  wifiApp.factory('venueDetails', function($http) {
    return {
      get: function(venueId) {
        var venuePromise = $http.get('https://api.foursquare.com/v2/venues/' + venueId, {
          cache: true,
          params: {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            v: 20140122
          }
        });

        venuePromise = venuePromise.then(function(data){
          var venue = data.data.response.venue;

          angular.forEach(venue.attributes.groups, function(group){
            if (group.type === 'wifi') {
              venue.hasWifi = group.items[0].displayValue === 'Yes';
            }
          });

          return venue;
        });

        return venuePromise;
      }
    };
  });


  wifiApp.controller('VenuesCtrl', function($scope, geolocation, venuesApi, venueDetails) {
    $scope.venues = [];

    geolocation.getLocation().then(function(data){
      $scope.coords = data.coords;
    });

    $scope.$watch('coords', function(coords){
      if (coords) {
        var venuesPromise = venuesApi.get(coords);
        venuesPromise.then(function(venues){
          angular.forEach(venues, function(venue){
            venue.state = 'partial';

            venueDetails.get(venue.id).then(function(fullVenue){
              angular.copy(fullVenue, venue);
              venue.state = 'full';
            })
          });

          $scope.venues = venues;
        });
      }
    });
  });
})();
