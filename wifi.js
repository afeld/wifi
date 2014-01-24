(function(){
  // https://foursquare.com/developers/app/IBFUDPTFRDXZDBZJB4FZQ4QWDPPCTDRWWMCB0XXWNLW524ZD
  var CLIENT_ID = 'IBFUDPTFRDXZDBZJB4FZQ4QWDPPCTDRWWMCB0XXWNLW524ZD';
  var CLIENT_SECRET = 'V1NS4BZV014GW5HK0JH2N1K3ZANXMOBEI0EIUG02SWRU3BO4';

  var wifiApp = angular.module('wifiApp', ['geolocation']);


  wifiApp.factory('venuesApi', function($http){
    return {
      get: function(coords) {
        var venuesPromise = $http.get('https://api.foursquare.com/v2/venues/search', {
          cache: true,
          params: {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            v: 20140122,

            q: 'wi-fi',
            ll: coords.latitude + ',' + coords.longitude
          }
        });

        venuesPromise = venuesPromise.then(function(data){
          return data.data.response.venues;
        });

        return venuesPromise;
      }
    };
  });


  wifiApp.controller('VenuesCtrl', function($scope, geolocation, venuesApi) {
    $scope.venues = [];

    geolocation.getLocation().then(function(data){
      $scope.coords = data.coords;
    });

    $scope.$watch('coords', function(coords){
      if (coords) {
        var venuesPromise = venuesApi.get(coords);
        venuesPromise.then(function(venues){
          $scope.venues = venues;
        });
      }
    });
  });
})();
