var http = require("http");
//var log = require("log"); log.setLevel("debug");

/**
 * Wraps NY APIs (currently only recycling bins locations: https://data.cityofnewyork.us/resource/ggvk-gyea.json) 
 * @class CityService
 * @constructor
 */
function CityService(){
  
  // initialize storage if needed
  if (!storage.global.city) {
    storage.global.city = {};
  }
}

/**
 * @method listRecyclingBins
 * @return {Array} return the list of all recycling bin in NY
 */
CityService.prototype.listRecyclingBins = function(dto) {
  
  var queryParams = {
     url:"https://data.cityofnewyork.us/resource/ggvk-gyea.json"
  }

  if (dto){
    queryParams.params = dto;
  }
  
  var resp = http.request(queryParams);  
  if (resp.status == "200") { 
    return JSON.parse(resp.body);
  }else {
    
    throw {
      
      errorCode: "Invocation_Error",
      errorDetail: "CityService.prototype.listRecyclingBins: (" + resp.status + ") " + (resp.message ? resp.message :"")
    };
  }  
};