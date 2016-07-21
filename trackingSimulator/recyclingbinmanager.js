var cityservice = require("./cityservice.js");
var binSchedulerserviceModule =  require("./schedulerservice.js");
var recyclingbinModule = require("./recyclingbin.js");
var log = require("log");
log.setLevel("info");

var MAX_BINS = 15; // modify to raise or lower the number of recycling bins to return 

/**
 * Manages the simulation of the behavior of multiple recycling bins
 * @class RecyclingBinManager
 * @constructor
 */
function RecyclingBinManager() {   
  
  if (!storage.global.city) {
    
    throw {

        errorCode: "Storage_Not_initialized",
        errorDetail: "RecyclingBinManager : 'storage.global.city' not initialized"
    };
  }
  
  if (!storage.global.city.bins) {
  	storage.global.city.bins = {};  
  }
  
  this.cityService = new cityservice.CityService();
  this.schedulerService = new binSchedulerserviceModule.SchedulerService("RecyclingBin");
}

/**
 * @method listRecyclingBins
 * @return {Array} array of RecyclingBin instances
 */
RecyclingBinManager.prototype.listRecyclingBins = function() {
  
  var bins = [];
  if (storage.global.city.bins) {
    
    var binData = storage.global.city.bins;
    for (var id in binData) {
   
      var bin = new recyclingbinModule.RecyclingBin({id:id});
      bins.push(bin);
    }
  }
  
  return bins;
};

/**
 * @method listRecyclingBinsForPublishing
 */
RecyclingBinManager.prototype.listRecyclingBinsForPublishing = function() {
 
  var bins = [];
  if (storage.global.city.bins) {
    
    var binData = storage.global.city.bins;
    for (var id in binData) {
   
      var bin = JSON.parse(JSON.stringify(binData[id]));
      bins.push(bin);
    }
  }
  
  return bins;
}

/**
 * @method listFullRecyclingBins
 * @return {Array} persisted instanced of ./recyclingbin.RecyclingBin or empty array if none
 */
RecyclingBinManager.prototype.listFullRecyclingBins = function() {
   
  var fullBins = [];
  if (storage.global.city.bins) {
    
    var binData = storage.global.city.bins;
    for (var id in binData) {
   
      var bin = new recyclingbinModule.RecyclingBin({id:id});
      if (bin.capacity == 0) {
        fullBins.push(bin);
      }
    }
  }
  
  return fullBins;
};

/**
 * @method getRecyclingBin
 * @param {String} id
 * @return {Object} instance of ./recyclingbin.RecyclingBin or empty array if none
 */
RecyclingBinManager.prototype.getRecyclingBin = function(id) {  
  return new recyclingbinModule.RecyclingBin({id:id}); 
};

/**
 * Retrive the list of recycling bins from cityservice and builds instances of ./recyclingbin.RecyclingBin from it.
 * Instances are persisted and add to the Binschedulerservice
 * Don't invoke this method if simulations and schedulers are already running
 * @method listRecyclingBins
 * @return {Array} instances of ./recyclingbin.RecyclingBin
 */
RecyclingBinManager.prototype.startMonitoringRecyclingBins = function() {
  
  var recycleBins = []; 
  var list = this.cityService.listRecyclingBins({"$limit":"" + MAX_BINS}); 
  for (var i = 0; i < list.length; i++) {    

    var bin = new recyclingbinModule.RecyclingBin(list[i]);
    this.schedulerService.add(bin.id);
    recycleBins.push(bin); 
  }
  
  return recycleBins;
};

/**
 * @method stopMonitoringRecyclingBins
 */
RecyclingBinManager.prototype.stopMonitoringRecyclingBins = function() {
  this.schedulerService.removeAll();
};

/**
 * Remove all bins from storage
 * @method removeAll
 */
RecyclingBinManager.prototype.removeAll = function() {
  storage.global.city.bins = {};
};