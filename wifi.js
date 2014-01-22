(function(){
  // https://foursquare.com/developers/app/IBFUDPTFRDXZDBZJB4FZQ4QWDPPCTDRWWMCB0XXWNLW524ZD
  var CLIENT_ID = 'IBFUDPTFRDXZDBZJB4FZQ4QWDPPCTDRWWMCB0XXWNLW524ZD';
  var CLIENT_SECRET = 'V1NS4BZV014GW5HK0JH2N1K3ZANXMOBEI0EIUG02SWRU3BO4';

  var wifiApp = angular.module('wifiApp', ['geolocation']);

  wifiApp.controller('VenuesCtrl', function($scope, geolocation, $http) {
    $scope.venues = [];

    geolocation.getLocation().then(function(data){
      $scope.coords = {
        lat: data.coords.latitude,
        long: data.coords.longitude
      };
    });

    $scope.$watch('coords', function(coords){
      if (coords) {
        var venuesPromise = $http.get('https://api.foursquare.com/v2/venues/search', {
          params: {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            v: 20140122,

            q: 'wi-fi',
            ll: coords.lat + ',' + coords.long
          }
        });

        venuesPromise.then(function(data){
          $scope.venues = data.data.response.venues;
        });
      }
    });
  });
})();
