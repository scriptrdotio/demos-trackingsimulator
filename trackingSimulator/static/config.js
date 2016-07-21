//Configuration file used by client side
var config = {
  http: {
    baseUrl: "https://itodemos.scriptrapps.io", //Scriptr api url
    startSimulator: "simulator/api/start",
    stopSimulator: "simulator/api/stop"
  },
  websocket: {
    url: "wss://api.scriptrapps.io/UzIyQTgwRjc2Ng==",
    receive_channel: "city_channel" //The Channel name to which the live GPS data will be pushed, and to which the client websocket will subscribe
  },
  map: {
  	key: "AIzaSyBcPYghFh_BXz4dDz-TXTHbU2iV3Wbf57I", //GOOGLE API KEY (Browser key)
    output: 'embed',
	type: "google.maps.MapTypeId.ROADMAP", //MapTypeId.ROADMAP, MapTypeId.SATELLITE, MapTypeId.HYBRID, MapTypeId.TERRAIN 
    mode: ["marker","polyline"], //["marker", "polyline"],
    strokeColor: '#FF0000',
    strokeOpacity: 1.0,
    strokeWeight: 1.5,
    zoom: 12, 
    defaultCenter:  {'lat':40.8607822, 'lng':-73.9141051}, //{'lat': 39.833333, 'lng':-98.583333},
    zoomOnSelected: 14, //Zoom of the map when a truck is selected to show its route
  	greenImage: '//icons.iconarchive.com/icons/fatcow/farm-fresh/32/lorry-add-icon.png',
 	blueImage: '//icons.iconarchive.com/icons/fatcow/farm-fresh/32/lorry-delete-icon.png',//'icons.iconarchive.com/icons/icons-land/vista-map-markers/48/Map-Marker-Ball-Azure-icon.png',
    emptyBin: '//icons.iconarchive.com/icons/shek0101/blue/48/blue-recycle-bin-empty-icon.png',
    fullBin: '//icons.iconarchive.com/icons/shek0101/blue/48/blue-recycle-bin-icon.png'
  },
  dataHandler: {
    transformFnc: "transformToMapData", //Define the transformation function you will use
  },
  useStub: false // set to true to use the scripts/stubsData script to generata random truck info and locations
}

