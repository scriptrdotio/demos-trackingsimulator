var util = require("./util.js");
var log = require("log"); 
log.setLevel("debug");

var MAX_USAGE = 45; // change this to accelerate the pace at which recycling bins are filled

/**
 * Simple simulation of a recycling bin. Initalized the first time using data stemming from CityService
 * @class RecyclingBin
 * @constructor
 * @param {Object} [dto] bin's properties as sent by cityservice. 
 * If dto contains an id, the instance tries to load its data from the storage using the given id
 */
function RecyclingBin(dto){

   if (!storage.global.city.bins) {
      
     throw {

        errorCode: "Storage_Not_initialized",
        errorDetail: "RecyclingBin: 'storage.global.city.bins' not initialized"
    };
  }  
  
  if (dto.id && Object.keys(dto).length == 1) {
    
    this.id = dto.id;
    this._load();
  }else {
    
    for (var prop in dto){      
      this[prop] = dto[prop];
    }
    
    this.id = util.generateId();
    this.empty();
    this._persist();
  }
}

/**
 * Assign the current bin to a truck. Nothing happens if already assigned
 * @method assign
 * @param {String} id: the identifier of the truck
 */
RecyclingBin.prototype.assign = function(id) {
  
  if (!this.isAssigned()) {
   
    this.assignedTo = id;
    this._persist();
  }
};

/**
 * @method isAssigned
 * @return true if bin was assigned to a truck, false otherwise
 */
RecyclingBin.prototype.isAssigned = function() {
  return this.assignedTo ? true : false;
};

/**
 * Simulates usage of the recycling bin by randomly reducing its capacity
 * @method simulate
 * @return {Numeric} current remaining capacity %
 */
RecyclingBin.prototype.simulate = function() {
  
  if (this.capacity > 0) {
 
    var usage = Math.round(Math.random() * MAX_USAGE);
    this.capacity = usage < this.capacity ? this.capacity - usage : 0;
    this._persist();
    
    // the below is part of a postponed design option 
    /*if (this.capacity == 0) {
      publish(BIN_CHANNEL, this.id);
    }*/
  }
  
  return this.capacity;
};

/**
 * Reset the bin's capacity to 100% an un-assign it
 * @method empty
 */
RecyclingBin.prototype.empty = function() {
  
  this.capacity = 100;
  this.assignedTo = null;
  this._persist();
};

/**
 * Persist the state of the current instance in the store
 * @method persist
 */
RecyclingBin.prototype._persist = function() {
  
  if (!storage.global.city.bins) {
    
     throw {

        errorCode: "Storage_Not_initialized",
        errorDetail: "RecyclingBin.load : 'storage.global.city.bins' not initialized from code"
    };
  }
  
  storage.global.city.bins[this.id] = JSON.stringify(this);
};

/**
 * Reload the data of the current bin from the store, using its id
 * If not found, throw an exception
 * @method load
 */
RecyclingBin.prototype._load = function() {
    
  if (storage.global.city.bins[this.id]) {

    var obj = JSON.parse(storage.global.city.bins[this.id]);
    for (var prop in obj){
      this[prop] = obj[prop];
    }
  }else {

    throw {

      errorCode: "Storage_Not_initialized",
      errorDetail: "RecyclingBin.load : can find bin wih id: " + this.id 
    };
  }
};
