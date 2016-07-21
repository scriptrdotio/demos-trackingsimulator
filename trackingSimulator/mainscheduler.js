var recyclingbinManagerModule = require("./recyclingbinmanager.js");
var recyclingbinSchedulerServiceModule = require("./schedulerservice.js");
var recyclingbinModule = require("./recyclingbin.js");

var vehicleManagerModule = require("./vehiclemanager.js");
var vehicleSchedulerServiceModule = require("./schedulerservice.js");

var CITY_CHANNEL = "city_channel";

var log = require("log");
log.setLevel("info");

try {

  var binManager = new recyclingbinManagerModule.RecyclingBinManager();
  var binSchedulerService = new recyclingbinSchedulerServiceModule.SchedulerService("RecyclingBin");
  var vehicleManager = new vehicleManagerModule.VehicleManager("./truck.js", "Truck");
  var vehicleSchedulerService = new vehicleSchedulerServiceModule.SchedulerService("Vehicle");
  
  /*
   * update the bins' content
   */
  var binList = binSchedulerService.listEntities(); 
  for (var i = 0; i < binList.length; i++) {
   
    var bin = binManager.getRecyclingBin(binList[i]);
    var remainingCapacity = bin.simulate();
    log.info("Bin id: " + bin.id + " remaining capacity is : " + bin.capacity);
    
    /*
     * Assign a truck to bins that are full and not already handled by any truck
     */
    if (remainingCapacity == 0 && !bin.isAssigned()) {
        
      log.info("Searching for a truck to pick-up bin " +  bin.id)
      var truck = vehicleManager.findCloserToLocation(bin.latitude, bin.longitude);

      // if found instruct the truck to pick it up
      if (truck) {
      
        truck.pickup(bin.latitude + "," + bin.longitude, bin.id);
        bin.assign(truck.id);
      	log.info("Truck " + truck.id +  " instructed to pick-up " + bin.id);
      }else {
        log.info("No available trucks to pick-up " + bin.id);
      }
    }
  }
    
  /*
   * update the trucks' positions if needed
   */
  var vehicleList = vehicleSchedulerService.listEntities();
  for (var i = 0; i < vehicleList.length; i++) {    
    
    var vehicle = vehicleManager.getVehicle(vehicleList[i]);
    var location = vehicle.run();
    log.info("id: " + vehicle.id + " is now at: " + JSON.stringify(location));
  }
  
  /*
   * Publish trucks and bins data to city channel
   */
  var vehicles = vehicleManager.listVehiclesForPublishing();
  var bins = binManager.listRecyclingBinsForPublishing();
  var message = {
    
    vehicles: vehicles,
    bins: bins
  };
  
  publish(CITY_CHANNEL, message);
}catch(exception) {
 
  log.error(JSON.stringify(exception));
  return exception;
}

