var util = require("./util");
var http = require("http");
//var log = require("log"); 
//log.setLevel("info");

/**
 * Provides a method to calculate the route from an origin to a destination
 * Can be configured to use different APIs. Currently only using Google map
 * @class DirectionService
 * @constructor
 * @param {Object} config: optional configuration properties. Should contain API URL and API key
 */
function DirectionService(config) {
  
  if (config) {
    
    for (var prop in config){
      this[prop] = config[prop];
    }
  }else {
    
    this.api = "https://maps.googleapis.com/maps/api/directions/json";
    //this.key = "AIzaSyDhI2XkG5c4WTmWlGnZMAs6Y6_xp6YUfPU";
    this.key = "AIzaSyChv9P_EyKHsqAREvF-Lm1bOjAuEo2MI40"; // Elie's key
  }  
}

/**
 * @metod getRoute
 * @param {String} origin: lat,long
 * @param {String} destination: lat,long
 * @param {Objects} params: additional specific parameters (optional)
 * @eturn {Object} 
 *	{Numeric} duration: total route duration, 
 *	{Array} points: array of coordinates (lat, long) that are part of the route from origin to destination
 */
DirectionService.prototype.getRoute = function(origin, destination, params) {
  
  // this function allows you to use more than one API to determine the route to a given location (strategy pattern)
  
  if (this.api.indexOf("google") > -1) {
    return this._getRouteFromGoogle(origin, destination, params);
  }
  
  // ... other tests to branch to different routing APIs
  
  // No routing strategy found
  throw {
    
    errorCode: "Missing_Routing_Service",
    errorDetail: "Can't find appropriate routing service"
  };
};

/**
 * @method _getRouteFromGoogle
 * @param {String} origin: long,lat
 * @param {String} destination: long,lat
 * @param {Objects} params: additional specific parameters (optional)
 * @eturn {Object} 
 *	{Numeric} duration: total route duration, 
 *	{Array} points: array of coordinates (lat, long) that are part of the route from origin to destination
 */
DirectionService.prototype._getRouteFromGoogle = function(origin, destination, params) {
  
  var queryParams = {
    url: this.api,
    params: {
      origin: origin,
      destination: destination,
      key: this.key
    }
  };
  //log.info("Request " +  JSON.stringify(queryParams));
  var response = http.request(queryParams);
  //log.info("Response " +  JSON.stringify(response));
  if (response.status == "200") {
    
    var body = JSON.parse(response.body);
    if (body.error_message) {
      
      log.error(body.error_message);
      throw {
        
        errorCode: "DirectionService_Error",
        errorDetail: body.error_message
      };
    }
   
    // calculate estimated duration
    var duration  = 0;
    var legs = body.routes[0].legs;
    var points = [];
    for (var i = 0; legs && i < legs.length; i++) {
      
      var steps = legs[i].steps;
      for (var j = 0; steps && j < steps.length; j++) {
        
        duration += steps[j].duration.value; // sum duration between steps to obtain total diration
        points = points.concat(util.decodePolyline(steps[j].polyline.points)); // transformed the encoded polyline into array of coordinates
      }
    }
    
    return {
      
      duration: duration,
      points: points
    };
  }
  
  log.error(JSON.stringify(response));
  throw {
    
    errorCode: "Invocation_Error",
    errorDetail: "DirectionService._getRouteFromGoogle: error occurred when invoking directions service (origin: " + origin + ",destination:" + destination + "). Check logs"
  }
};