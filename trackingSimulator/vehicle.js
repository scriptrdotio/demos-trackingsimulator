var destinations = require("./directionservice.js");
var scheduling = require("./schedulerservice.js");
var log = require("log"); log.setLevel("debug");

var util = require("./util.js");
var INITIAL_LAT = 40.8789008;
var INITIAL_LONG = -73.8841953 ;
var RADIUS = 2500;

/**
 * Simulates the behavior of a vehicle
 * @class Vehicle
 * @constructor
 */
function Vehicle(dto) {
 
  if (dto && dto.inheritance) {return;} // inheritance call, skip 
  
  if (!storage.global.city.vehicles){
  
     throw {

        errorCode: "Storage_Not_initialized",
        errorDetail: "Vehicle: 'storage.global.city.vehicles' not initialized"
    };
  }
  
  if (dto && dto.id) { 
    
    this.id = dto.id;
    this._load(); 
  }else{
    this._generateData(dto); 
  }
  
  this.destinationService = new destinations.DirectionService();
  this.schedulerService = new scheduling.SchedulerService("Vehicle");
}

/**
 * Set final destination. Calculate route usign destinations service
 * @method moveTo
 * @param {String} destination: lat,long
 */
Vehicle.prototype.moveTo = function(destination) {
  
  if (!destination) {
  	
    throw {
      errorCode: "Invalid_Parameter",
      errorDetail: "Vehicle.moveTo: destination cannot be null or empty. Should be 'lat,long'"
    };
  }
  
  this.moving = true; 
  var routeData = this.destinationService.getRoute(this.currentLocation.lat + "," + this.currentLocation.long, destination);
  this.pointsToDestination = routeData.points;
  this.tripDuration = Math.round(routeData.duration / 60); // in minutes
  // the scheduler "runs" a vehicle every minute, we thus need to know what point the vehicle has reached in one minute
  // therefore we approximatively calculate this based on the estimated duration on trip / number of points to destination
  this.pointsPerMinute = Math.round(this.pointsToDestination.length / this.tripDuration);
  this.pointsPerMinute = this.pointsPerMinute < 1 ? 1 : this.pointsPerMinute;
  this.currentPointIndex = -1;
  
  // Add this vehicle's id to the list of vehicles ids that are handled by the scheduler (scheduled script)
  this.schedulerService.add(this.id);
  
  this.run();
};

/**
 * Handle moving from origin to destination
 * @method run
 */
Vehicle.prototype.run = function() {
  
  log.debug(this.id + " is running");
  if (this.moving) {
  
    log.debug("Initital location " + JSON.stringify(this.currentLocation));
    var leap = this.currentPointIndex + this.pointsPerMinute;
    log.debug("Leap " + JSON.stringify(leap));
    if (leap > this.pointsToDestination.length - 1) {

      leap = this.pointsToDestination.length - 1;
      this.currentLocation = {lat: this.pointsToDestination[leap][0], long: this.pointsToDestination[leap][1]};
      this.stop();
    }else {
      this.currentLocation = {lat: this.pointsToDestination[leap][0], long: this.pointsToDestination[leap][1]};
    }
	log.debug("New location " + JSON.stringify(this.currentLocation));
    this.currentPointIndex = leap;
    this._persist();
  }
  
  return this.currentLocation;
};

/**
 * Stop moving from origin to destination. Clear destination and route.
 * @method run
 */
Vehicle.prototype.stop = function() {
  
  console.log(this.id + " stopping ");
  this.pointsToDestination = [];
  this.currentPointIndex = -1;
  this.schedulerService.remove(this.id);
  this.moving = false;
  this._persist();
};

/**
 * Load the data of the current vehicle from the storage (re-hydrate)
 * @mthod _load
 */
Vehicle.prototype._load = function() {
  
  var data = null;  
  if (storage.global.city.vehicles){
  	data = storage.global.city.vehicles[this.id];  
  }
  
  if (!data) {
    
    throw {
      
      errorCode: "Entity_Not_Found",
      errorDetail: "No vehicle found with id " + this.id 
    };
  }
  
  data = JSON.parse(data);
  for (var prop in data){
    this[prop] = data[prop];
  }
};

/**
 * Persist the data of the current vehicle into the storage (dehydrate)
 * @mthod _persist
 */
Vehicle.prototype._persist = function() {
  storage.global.city.vehicles[this.id] = JSON.stringify(this);
};
  
Vehicle.prototype._generateData = function(dto) {
  
  this.id = util.generateId();
  this.moving = false;
  this.tripDuration = 0;
  this.currentLocation = util.randomLocation(INITIAL_LAT, INITIAL_LONG, RADIUS);
  this.pointsToDestination = [];
  this._persist();
};