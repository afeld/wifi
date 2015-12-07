angular.module('wifiApp', [
  'angular-cache',
  'geolocation'
]).config(function(CacheFactoryProvider){
  // http://jmdobry.github.io/angular-cache/#configuration-options

  angular.extend(CacheFactoryProvider.defaults, {
    // Items will be actively deleted when they expire
    deleteOnExpire: 'aggressive',
    // This cache will clear itself every hour
    cacheFlushInterval: 3600000,
    // This cache will sync itself with localStorage
    storageMode: 'localStorage'
  });
}).run(function(CacheFactory, $http) {
  CacheFactory('geoCache', {
    // Items added to this cache expire after 3 minutes
    maxAge: 180000
  });

  CacheFactory('httpCache', {
    // Items added to this cache expire after one day
    maxAge: 86400000
  });

  $http.defaults.cache = CacheFactory.get('httpCache');
});
