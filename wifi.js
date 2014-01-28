(function(){
  // https://foursquare.com/developers/app/IBFUDPTFRDXZDBZJB4FZQ4QWDPPCTDRWWMCB0XXWNLW524ZD
  var CLIENT_ID = 'IBFUDPTFRDXZDBZJB4FZQ4QWDPPCTDRWWMCB0XXWNLW524ZD';
  var CLIENT_SECRET = 'V1NS4BZV014GW5HK0JH2N1K3ZANXMOBEI0EIUG02SWRU3BO4';

  // round for better caching
  // http://en.wikipedia.org/wiki/Decimal_degrees
  var GEO_DECIMALS = 3;

  var wifiApp = angular.module('wifiApp', ['jmdobry.angular-cache', 'geolocation']);


  wifiApp.config(function($angularCacheFactoryProvider){
    // http://jmdobry.github.io/angular-cache/configuration.html

    $angularCacheFactoryProvider.setCacheDefaults({
      // Items will be actively deleted when they expire
      deleteOnExpire: 'aggressive',
      // This cache will clear itself every hour
      cacheFlushInterval: 3600000,
      // This cache will sync itself with localStorage
      storageMode: 'localStorage'
    });
  });


  wifiApp.run(function($angularCacheFactory, $http) {
    $angularCacheFactory('geoCache', {
      // Items added to this cache expire after 3 minutes
      maxAge: 180000
    });

    $angularCacheFactory('httpCache', {
      // Items added to this cache expire after one day
      maxAge: 86400000
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
            radius: 4000, // meters
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
              venue.hasWifi = /\b(yes|free)\b/i.test(group.items[0].displayValue);
            }
          });

          if (venue.hasWifi === undefined) {
            angular.forEach(venue.tips.groups, function(group){
              angular.forEach(group.items, function(tip){
                var text = tip.text;
                if (/\b(no|(don'?t|didn'?t) have|had)\s+wi-?fi\b/i.test(text)) {
                  console.log('FOUND NO: ' + venue.name);
                  console.log(text);
                  venue.hasWifi = false;
                } else if (/\b((have|great|the)\s+wi-?fi|wi-?fi\s+(pass(word)?|ps?wd))\b/i.test(text)) {
                  console.log('FOUND YES: ' + venue.name);
                  console.log(text);
                  venue.hasWifi = true;
                } else if (/\b(wi-?fi|internet|network)\b/i.test(text)) {
                  console.log('FOUND MAYBE: ' + venue.name);
                  console.log(text);
                }
              });
            });
          }

          return venue;
        });

        return venuePromise;
      }
    };
  });


  // cached wrapper of geolocation
  wifiApp.factory('geolocator', function($q, $angularCacheFactory, geolocation) {
    var geoCache = $angularCacheFactory.get('geoCache');
    return {
      getLocation: function() {
        var geoData = geoCache.get('whereami');
        var geoPromise;

        if (geoData) {
          var geoDeferred = $q.defer();
          geoDeferred.resolve(geoData);
          geoPromise = geoDeferred.promise;
        } else {
          geoPromise = geolocation.getLocation();
          geoPromise.then(function(data) {
            geoCache.put('whereami', data);
          });
        }

        return geoPromise;
      }
    }
  });


  wifiApp.controller('VenuesCtrl', function($scope, geolocator, venuesApi, venueDetails) {
    // sort by open-ness, then wifi, then rating
    $scope.venueSort = function(venue) {
      var sum = 0;

      if (venue.hours && venue.hours.isOpen !== undefined) {
        sum += venue.hours.isOpen ? -1000 : 1000;
      }
      if (venue.hasWifi !== undefined) {
        sum += venue.hasWifi ? -100 : 100;
      }
      if (venue.rating !== undefined) {
        sum += -1 * venue.rating;
      }

      return sum;
    };

    geolocator.getLocation().then(function(data){
      var coords = data.coords;
      $scope.coords = coords;
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
