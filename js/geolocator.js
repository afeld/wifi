// cached wrapper of geolocation
angular.module('wifiApp').factory('geolocator', function($q, CacheFactory, geolocation) {
  var geoCache = CacheFactory.get('geoCache');
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
