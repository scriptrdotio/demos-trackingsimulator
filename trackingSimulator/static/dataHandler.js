(function ($) { //an IIFE so safely alias jQuery to $
	$.DataHandler = function (args) { 
          this.args = args;
    };
  
    $.DataHandler.prototype = {
      transformToMapData: function(entries) {
         var config = this.args.config;
         var markersData = {};
         var pathsData = {};
         if(!this.allPolylines) this.allPolylines = {};
         if(!this.allMarkers) this.allMarkers = {};
        
         if(entries.vehicles) {
           //{'busy':false,'target':'','id':'bfmvg4wms8s9p4yugl6n','moving':false,'tripDuration':0,'currentLocation':{'lat':40.886170214520746,'long':-73.88596031488537},'pointsToDestination':[]}"
           var vehicles = entries.vehicles;
           for (var i = 0; i < vehicles.length; i++) {
          	var entry = JSON.parse(vehicles[i]);
            var position = {"lat": entry.currentLocation.lat, "lng": entry.currentLocation.long};
             markersData[entry.id] = {
              position: position, 
              icon:  (entry.moving) ? config.greenImage : config.blueImage, 
              title: "Truck: "+ entry.id + ((!entry.moving) ? " Available." : (" Picking up "+ entry.target)) +".",
              zIndex: 4
            };
            
            if(config.mode.indexOf("polyline") != -1) {
              	pathsData[entry.id] = position}
            }
         }
        if(entries.bins) {
          // "{\"id\":\"w9b1xcwoh42rdkz62a0m\",\"address\":\"Allerton Ave & Moshulu Pkway\",\"borough\":\"Bronx\",\"latitude\":\"40.8488907878\",\"longitude\":\"-73.8771283938\",\"park_site_name\":\"Allerton Ballfields\",\"site_type\":\"Subproperty\",\"capacity\":79,\"assignedTo\":null}"
           var bins = entries.bins;
           for (var i = 0; i < bins.length; i++) {
          	var entry = JSON.parse(bins[i]);
            var position = {"lat": parseFloat(entry.latitude), "lng": parseFloat(entry.longitude)};
             markersData[entry.id] = {
              position: position, 
              icon:  (entry.capacity == 0) ? config.fullBin : config.emptyBin, 
              title: "Bin: "+ entry.id + ", remaining capacity: "+ entry.capacity+ ", address: "+ entry.address + ", park site: "+entry.park_site_name +".",
              zIndex: 4
            };
         }
         }
        
        var self = this;
         $.each(markersData, function(key,markerData){
            var marker = new google.maps.Marker(markerData);
            if(self.allMarkers[key]) {
                var deviceMarker = self.allMarkers[key]; //Get existing device markers
                deviceMarker.setMap(null);
            }
            self.allMarkers[key] = marker
        }); 
           
        $.each(pathsData, function(key,value){
          (self.allPolylines[key])? self.allPolylines[key].push(value) : (self.allPolylines[key]  = [value]);
        });
      }
  };
}(jQuery));