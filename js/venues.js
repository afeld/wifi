angular.module('wifiApp').controller('VenuesCtrl', function($scope, geolocator, venuesApi, venueDetails) {
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
