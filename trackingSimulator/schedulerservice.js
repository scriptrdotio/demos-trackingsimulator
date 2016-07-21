
/**
 * @class SchedulerService
 * @param {String} type: the type of data handled by this scheduler. To be specified by sub-classes
 */
function SchedulerService(type) {
  
  if (!storage.global.scheduler) {
    
    throw {
      
      errorCode: "Storage_Not_Initialized",
      errorDetail: "SchedulerService: storage.global.scheduler not initialized"
    };
  }
  
  this.entityList = [];
  if (type) {
 
  	this.type = type;
    this._load();
  }
}

/**
 * Add a entity to the list of entities to run
 * @method add
 * @param {String} id
 */
SchedulerService.prototype.add = function(id) {
  
  if (!id) {
    
    throw {
      
      errorCode: "Invalid_Parameter",
      errorDetail: "SchedulerService.add: id cannot be null or empty"
    };
  }
  
  if (this.entityList.indexOf(id) == -1) {
    
    this.entityList.push(id);
    this._persist();  
  }
};

/**
 * Remove an entity from the list of entities to run
 * @method remove
 * @param {String} id
 */
SchedulerService.prototype.remove = function(id) {
  
  if (!id) {
    
    throw {
      
      errorCode: "Invalid_Parameter",
      errorDetail: "SchedulerService.add: id cannot be null or empty"
    };
  }
  
  var index = this.entityList.indexOf(id);
  if (index > -1) {
    this.entityList.splice(index, 1);
  }
  
  this._persist();
};

/**
 * Remove all entities from the list of entities to run
 * @method remove
 * @param {String} id
 */
SchedulerService.prototype.removeAll = function() {
  
  this.entityList = [];
  this._persist();
};

/**
 * @method listEntities
 * @return {Array}  the list of running entities
 */
SchedulerService.prototype.listEntities = function() {  
  return this.entityList;
};

SchedulerService.prototype._load = function() {
 
  this.handle = storage.global.scheduler.handle ? storage.global.scheduler.handle : "";
  this.entityList = storage.global.scheduler[this.type] ? storage.global.scheduler[this.type].split(",") : [];
};  

SchedulerService.prototype._persist = function() {
  storage.global.scheduler[this.type] = this.entityList.toString();
};
