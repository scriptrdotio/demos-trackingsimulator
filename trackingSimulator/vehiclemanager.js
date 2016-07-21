var vehicleSchedulerServiceModule = require("./schedulerservice.js");
var vehicleModule = require("./vehicle.js");
var destinations = require("./directionservice.js");
var log = require("log");
log.setLevel("info");

var MAX_VEHICLES = 7;

/**
 * Handles the simulation of multiple vehicles.
 * @class VehicleManager
 * @constructor
 * @param {String} useModule: optional, if specified, instructs the VehicleManager to create instances of the vehicle 
 * type defined in that module, e.g. "./truck". Can only be used with useType
 * @param {String} useMType: optional, if specified, instructs the VehicleManager to create instances of this vehicle 
 * type, e.g. "Truck". Can only be used with useModule
 */
function VehicleManager(useModule, useType) {
 
  if (!storage.global.city) {
    
    throw {

        errorCode: "Storage_Not_initialized",
        errorDetail: "VehicleManager: 'storage.global.city' not initialized"
    };
  }
  
  if (!storage.global.city.vehicles) {
    storage.global.city.vehicles = {};
  }
  
  this.vehicleSchedulerService = new vehicleSchedulerServiceModule.SchedulerService("Vehicle");
  this.destinationService = new destinations.DirectionService();
  
  if (useModule && useType) {
    
    this.module = require(useModule);
    this.typeName = useType;
  } 
}

/**
 * Don't invoke this method if simulations and schedulers are already running
 * @method startMonitoringVehicles
 */
VehicleManager.prototype.startMonitoringVehicles = function(num) {
  
  var list = this.generate(num ? num : MAX_VEHICLES);
  /*for (var i = 0; i < list.length; i++) {    
    this.vehicleSchedulerService.add(list[i].id);
  }*/
  
  return list;
};

/**
 * @method stopMonitoringVehicles
 */
VehicleManager.prototype.stopMonitoringVehicles = function(num) {
  this.vehicleSchedulerService.removeAll();
};

/**
 * @method findCloserToLocation
 * @param {Numeric} lat: latitude
 * @param {Numeric} long: longitude,
 * @param {Object} filter: optional, vehicle property names + expected value. Used to add conditions in addition to distance to location
 * e.g. if condition = {"busy":false} the only vehicles where vehicle.busy == false are considered
 */
VehicleManager.prototype.findCloserToLocation = function(lat, long, filter) {

  var allVehicles = storage.global.city.vehicles; 
  var vehicle = null;
  var timeToDestination = 100000000000000000;
  for (var id in allVehicles) {
   
    var v = this.typeName  ? new this.module[this.typeName]({id:id}) : new vehicleModule.Vehicle({id:id}); 
    if (!v.moving) {
     
      var route = this.destinationService.getRoute((v.currentLocation.lat + "," + v.currentLocation.long), ("" +  lat + "," + long));
      if (route.duration < timeToDestination) {

        if (filter) {

          var verified = true;
          for (var key in filter) {   
            verified = (v[key] == filter[key]); 
          }

          if (verified) {

            timeToDestination = route.duration;
            vehicle = v;  
          }
        }else {

          timeToDestination = route.duration;
          vehicle = v;
        }     
      }    
    }
  }
  
  if (vehicle) {
    log.info("Shortest time to destination " + timeToDestination + " with vehicle " + vehicle.id);
  } 
  return vehicle;
};   
  
/**
 * Generate a new set of vehicles (discard preceding one, even if simulation was running)
 * Don't invoke this method if simulations and schedulers are already running
 * @mehod generate
 * @param {Numeric} num: how many vehicles to create
 * @return {Array} array of ./vehicle.Vehicle instances (or instances of subclasses of Vehicle)
 */
VehicleManager.prototype.generate = function(num) {
 
  var vehicleList = [];
  for (var i = 0; i < num; i++) {
    
    var vehicle = this.typeName  ? new this.module[this.typeName]() : new vehicleModule.Vehicle();
    vehicleList.push(vehicle);
  }
  
  return vehicleList;
};

/**
 * @method getVehicle
 */
VehicleManager.prototype.getVehicle = function(id) { 
  log.info(JSON.stringify(id));
  var vehicleData = storage.global.city.vehicles[id];
  var vehicle = this.typeName  ? new this.module[this.typeName]({id:id}) : new vehicleModule.Vehicle({id:id});
  return vehicle;
};

/**
 * @method listVehicles
 * @return {Object} a map of vehicles, where key = vehicle id and value = vehicle
 */
VehicleManager.prototype.listVehicles = function(publish) {  
    
  var vehicles = [];
  if (storage.global.city.vehicles) {
    
    var vehicleData = storage.global.city.vehicles;
    for (var id in vehicleData) {
      vehicles.push(new vehicleModule.Vehicle({id:id}));
    }
  }
  
  return vehicles;
};

/**
 * @method listVehicleForPublishing
 * @return {Array} array of vehicle data (light copy), meant to be published to a channel
 */
VehicleManager.prototype.listVehiclesForPublishing = function(publish) {  
    
  var vehicles = [];
  if (storage.global.city.vehicles) {
    
    var vehicleData = storage.global.city.vehicles;
    for (var id in vehicleData) {
      
      var data = JSON.parse(JSON.stringify(vehicleData[id]));
      delete data.pointsToDestination;
      delete data.destinationService;
      delete data.binManager;
      delete data.schedulerService;
      delete data.pointsPerMinute;
      delete data.currentPointIndex;
      vehicles.push(data);
    }
  }
  
  return vehicles;
};

/**
 * Remove all vehicles from storage
 * @method removeAll
 */
VehicleManager.prototype.removeAll = function() {
  storage.global.city.vehicles = {};
};