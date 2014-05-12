angular.module('wifiApp', [
  'jmdobry.angular-cache',
  'geolocation'
]).config(function($angularCacheFactoryProvider){
  // http://jmdobry.github.io/angular-cache/configuration.html

  $angularCacheFactoryProvider.setCacheDefaults({
    // Items will be actively deleted when they expire
    deleteOnExpire: 'aggressive',
    // This cache will clear itself every hour
    cacheFlushInterval: 3600000,
    // This cache will sync itself with localStorage
    storageMode: 'localStorage'
  });
}).run(function($angularCacheFactory, $http) {
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
