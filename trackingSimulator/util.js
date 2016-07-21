function generateId() {
  
  var base = "0123456789abcdefghijklmnopqrstuvwxyz";
  var max = 20;
  var id = "";
  for (var i = 0; i < max; i++) {
    
    var index = Math.round(Math.random() * (base.length - 1));
    id += base[index];
  }
  
  return id;
}

/**
 * Decodes to a [latitude, longitude] coordinates array.
 *
 * This is adapted from the implementation in Project-OSRM.
 *
 * @param {String} str
 * @param {Number} precision
 * @returns {Array}
 *
 * @see https://github.com/mapbox/polyline/blob/master/src/polyline.js
 */
function decodePolyline(str, precision) {
  
    var index = 0,
        lat = 0,
        lng = 0,
        coordinates = [],
        shift = 0,
        result = 0,
        byte = null,
        latitude_change,
        longitude_change,
        factor = Math.pow(10, precision || 5);

    // Coordinates have variable length when encoded, so just keep
    // track of whether we've hit the end of the string. In each
    // loop iteration, a single coordinate is decoded.
    while (index < str.length) {

        // Reset shift, result, and byte
        byte = null;
        shift = 0;
        result = 0;

        do {
            byte = str.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);

        latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

        shift = result = 0;

        do {
            byte = str.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);

        longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

        lat += latitude_change;
        lng += longitude_change;

        coordinates.push([lat / factor, lng / factor]);
    }

    return coordinates;
};

/**
 * Generates random lat and long within a given permieter, based on initial coordinates and radius
 * @param {Numeric} lat: initial lattitude
 * @param {Numeric} long: initial longitude
 * @param {Numeric} radius: max distance from initial point, in meters
 */
function randomLocation(lat, long, radius) {
  
  var r = radius/111300;
  var y0 = lat;
  var x0 = long
  var u = Math.random();
  var v = Math.random();
  var w = r * Math.sqrt(u);
  var t = 2 * Math.PI * v;
  var x = w * Math.cos(t);
  var y1 = w * Math.sin(t);
  var x1 = x / Math.cos(y0);
  var newY = y0 + y1
  var newX = x0 + x1
  return {
    lat:newY,
    long:newX
  };
}