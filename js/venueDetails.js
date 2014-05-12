angular.module('wifiApp').factory('venueDetails', function($http, credentials) {
  return {
    get: function(venueId) {
      var venuePromise = $http.get('https://api.foursquare.com/v2/venues/' + venueId, {
        cache: true,
        params: {
          client_id: credentials.clientId,
          client_secret: credentials.clientSecret,
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

        if (venue.hours && venue.hours.isOpen !== undefined) {
          venue.isOpen = venue.hours.isOpen;
        } else if (venue.popular && venue.popular.isOpen !== undefined) {
          // "likely open"
          venue.isOpen = venue.popular.isOpen;
        }

        return venue;
      });

      return venuePromise;
    }
  };
});
