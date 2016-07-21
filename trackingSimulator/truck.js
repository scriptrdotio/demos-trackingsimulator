var vehicleModule = require("./vehicle.js");
var recyclingbinManagerModule = require("./recyclingbinmanager.js");
var log = require("log");
log.setLevel("debug");

/**
 * @class Truck
 * @constructor
 */
function Truck(dto) {  
  
  this.busy = false;
  this.target = "";
  vehicleModule.Vehicle.call(this, dto);
  this.binManager = new recyclingbinManagerModule.RecyclingBinManager();
}

Truck.prototype = new vehicleModule.Vehicle({inheritance:true});
Truck.prototype.constructor = Truck;

/**
 * @method pickup
 * @param {String} location: "lat,long"
 * @param {String} binId: the identifier of the recycling bin assigned to the truck
 */
Truck.prototype.pickup = function(location, binId) {
  
  if (!location || !binId) {
    
    throw {
      errorCode: "Missing_Parameter",
      errorDetail: "Truck.pickup: location and bind cannot be null or empty"
    };
  }
  
  this.target = binId;
  this.busy = true;
  vehicleModule.Vehicle.prototype.moveTo.call(this, location);
};

/**
 * @method isbusy
 */
Truck.prototype.isBusy = function() {
  return this.busy;
}

/**
 * @method stop
 */
Truck.prototype.stop = function(location) {
  
  vehicleModule.Vehicle.prototype.stop.call(this, location);
  var recyclingBin = this.binManager.getRecyclingBin(this.target);
  if (recyclingBin) {
    recyclingBin.empty();
  }
  
  log.debug(this.id + " picked-up its target " + recyclingBin.id);
  this.target = "";
  this.busy = false; 
};