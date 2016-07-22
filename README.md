# demos-trackingsimulator

*Note*: content of this file is taken from https://docs.google.com/a/scriptr.io/presentation/d/1zJC52WTVITHf3Lzs0HtSqodIjMjfhPxLhOSGxerqEOY/edit?usp=sharing 

## Overview
This demo application simulates the collection of recycling bins by virtual trucks. It is composed of four main components:

- UI: displays the location and status of recycling bins and trucks on a map (some of which are moving to pick full bins up)
The UI sends HTTP request to start and stop the simulation
The UI subscribes to a channel using a WebSocket connection in order to receives updates on trucks and bins
- Simulator: contains the logic that runs the simulation (loads recycle bins data and simulate a variation of their capacity, creates “virtual trucks” and simulate their assignment to bins and moves them towards their target bin
- Public Recycling Bin API : provides data (location mainly) about recycling bins (https://data.cityofnewyork.us/resource/ggvk-gyea.json)
- Google Map Directions API: provides directions instructions, i.e. route from origin to deestination (https://maps.googleapis.com/maps/api/directions/json)


## Components
- *recyclingbin*: it is a simulation of a recycling bin. It uses real data obtained from the CityService to which it adds a capacity (percentage of remaining capacity in the bin). Every time the mainscheduler is executed, it invokes the “simulate” method of RecyclingBin instances, which randomly decreases the capacity. Zero is the minimum capacity. Every time the data of a RecyclingBin instances changes, the instance is persisted in the global storage.
- *recyclingbinmanager*: it is responsible for creating RecyclingBin instances when the simulation is started, using actual data obtained from the CityService. The RecyclingBinManager also can return the list of bins or the list of full bins.
- *vehicle*: this is a simulation of a real vehicle. When instantiated for the first time (no persisted data), will position the vehicle at a random location (in a given permeter). A vehicle can be moving or not. It only starts moving when its “move” method is invoked. The latter receives a destination then obtains the route (list of points) to that destination using the DirectionService. It also calculates its “speed” based on the estimated duration of the trip and the number of points to destination (speed = number or points per minute). Every time the Vehicle instance is “ran”, it moves to the next point according to its “speed”.
- *truck*: a Truck is a subclass of Vehicle. It overrides some of the its method by adding its own logic and also introduces the “pickup” method that is invoked to assign a truck to a bin (the truck will move to that bin to empty it)
- *vehiclemanager*: it is responsible for the creation of the virtual vehicles. It also can return the vehicle that is the closer to a given location, if the vehicle is not moving (we assume that if the vehicle is moving, then it is not available)
- *schedulerservice*: keeps track of entities that needs to be modified regularly (simulation). Mainly provides add/remove method to add an entity id, respectively remove it. For example, whenever a vehicle is instructed to move, it adds itself to the scheduler service. When the vehicle reaches its destination, it removes itself from it. Upon instantiation, the SchedulerService can be parameterized to deal with instances of Vehicle or RecyclingBin
- *mainscheduler*: this is a scheduled script that plays the role of the orchestrator of the simulation. It is executed every minute to:
  - Loop through the list of bins and invoke their simulate() method. 
  - Loop through the list of full bins (capacity == 0). For every bin, it tries to find an available truck to pick-it up
  - Loop through the list of trucks to move them to their next position (if in motion)
  - Publish the updated bins and trucks data to the city_channel (to which the UI is subscribed)
- *cityservice*: wraps the public NY Recycling bin API. Returns a list of n bins (depending on the $limit parameter)
- *directionservice*: wraps a direction service, currently Google Map Directions. Returns a route (points) from an origin to a destination
- *util*: provides utiliy functions (generate id, transform polyline into an array of points, etc.)

## Configuration
- Create channel as anonymous publish/subscribe with "city_channel" as name.
- Google Map directions API key
  - directionservice, in DirectionService constructor function, this.apiKey
- Bin usage
  - MAX_USAGE, in recyclingbin (determines how much to remove from the bin’s capacity on every simulation. New capacity = former capacity - (0 to MAX_USAGE)
- Initial vehicle position
  - INITIAL_LAT, in vehicle
  - INITIAL_LONG, in vehicle
  - RADIUS, in vehicle
Position is calculated using lat,long + random() * radius
- Scheduled script execution frequency
  - TRIGGER, in api/start
- Configuring the map
  - Update static/config.js  http baseUrl to point to your account subdomain & websocket url to have your own token.
- In map.html, replace YOUR_SUBDOMAIN in the URL with your own sub-domain

## How it works
- Load map.html in a browser (http://your_sub_domain.scriptrapps.io/trackingSimulator/html/map.html)
- Press start to start the simulation and wait a few seconds (if a simulation was running it is stopped)
- Press stop to stop it (all data are cleared) 

**Note: the current version does not allow your to run multiple parallel simuations**
