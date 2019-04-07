//layer groups
var interestPoints = L.featureGroup(),
	trailLayer = L.featureGroup(),
	busRoutes = L.featureGroup(),
	busStops = L.featureGroup(),
	breweries = L.featureGroup(),
	boundary = L.featureGroup(),
	userData = L.featureGroup();
	

//json points
// Global Variables
// Will go here
var poiData = null;
var trails = null;
var areas = null;
var routes = null;
var brewData=null;
var stops = null;
var cartoDBPoints = null;
var cartoDBUsername = 'mcmahoney3';

//queries
var sqlQuery = "SELECT * FROM jamesriver_poi",
	trailQuery = "SELECT * FROM rec_trail",
	areaQuery = "SELECT * FROM area_park",
	collectQuery = "SELECT * FROM data_collector",
	stopQuery = "SELECT * FROM grtcstops",
	busQuery = "SELECT * FROM grtc_bus_routes";

	//add OSM base tilelayer
var OSMLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    });
    
//add black and white base tilelayer
var blackAndWhite = L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });
    
//add stamen map
var topo = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> — Map data © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
    ext: 'png'
});
	
	    
//create basemap layer group for layer control
var baseMaps = {
    "OpenStreetMap": OSMLayer,
    "Black and White": blackAndWhite,
    "Stamen Tiles": topo
};

var overlays = {
	"Park Boundaries":boundary,
	"Point of Interest": interestPoints,
	"Trails": trailLayer,
	"User Trail Reviews": userData,
	"Breweries": breweries,
	"Bus Routes": busRoutes,
	"Bus Stops": busStops
	};

//create map
var mapOpt = {
    center: [37.531554, -77.476075],
    zoom: 6,
	zoomControl: false,
	minZoom: 13,
	maxZoom: 17,
	layers: [OSMLayer], 
};

//create map
var map = L.map('map', mapOpt);

//control layers
var stack = L.control.layers(baseMaps, overlays).addTo(map);
var stack_div = L.DomUtil.get('stack');

stack.addTo(map);
stack_div.appendChild(stack.getContainer()); // works

//move zoom controls
L.control.zoom({
     position:'topright'
}).addTo(map);


// Function to add all poi
function showPOI(){
    if(map.hasLayer(poiData)){
        map.removeLayer(poiData);
    };
		
    // Get CARTO selection as GeoJSON and Add to Map
    $.getJSON("https://mcmahoney3.carto.com/api/v2/sql?format=GeoJSON&q="+sqlQuery, function(data) {
        poiData = L.geoJson(data,{
			onEachFeature: function (feature, layer) {
                layer.bindPopup('<p><b>' + feature.properties.name + '</b><br /><em>' + feature.properties.structure + '</em></p>');
                layer.cartodb_id=feature.properties.cartodb_id;
            },
			'pointToLayer': function (feature, latlng) {
        return new L.Marker(latlng, {
            'icon':new L.Icon({
                'iconUrl': '/img/' + feature.properties.type + '.png',
				'iconSize': [16, 16],
				'shadowUrl': 'img/marker-shadow.png',
				'shadowSize': [24, 20],
			})    		    
		})
			}
        }).addTo(interestPoints); legendControl.addTo(map);
	})
};

// Function to add all stops
function showStops(){
    if(map.hasLayer(stops)){
        map.removeLayer(stops);
    };
    // Get CARTO selection as GeoJSON and Add to Map
    $.getJSON("https://mcmahoney3.carto.com/api/v2/sql?format=GeoJSON&q="+stopQuery, function(data) {
        stops = L.geoJson(data,{
			onEachFeature: function (feature, layer) {
                layer.bindPopup('<p><b>' + feature.properties.location + '</b><br />Direction:<em>' + feature.properties.direction + '</em><br />'+'<a href="http://ridegrtc.com/planning-your-trip/trip-planner/" target="_blank">Plan Your Ride</a>' + '</p>');
                layer.cartodb_id=feature.properties.cartodb_id;
            },
			'pointToLayer': function (feature, latlng) {
        return new L.Marker(latlng, {
            'icon': stopsIcon
			})    		    
			}
        }).addTo(busStops);
	})
};

// Function to add all breweries
function showBrew(){
    if(map.hasLayer(brewData)){
        map.removeLayer(brewData);
    };
    // Get CARTO selection as GeoJSON and Add to Map
    $.getJSON("https://opendata.arcgis.com/datasets/71afb69cb33645c5b975b425777e2087_1.geojson", function(data) {
       brewData = L.geoJson(data,{
			onEachFeature: function (feature, layer) {
                layer.bindPopup('<p><b>' + feature.properties.Trade_Name + '</b><br /><em>' + feature.properties.Address + '</em></p>');
                
            },
			'pointToLayer': function (feature, latlng) {
        return new L.Marker(latlng, {
            'icon':new L.Icon({
				'iconUrl': '/img/beer.png',
              	'iconSize': [16, 16],
				'shadowUrl': 'img/marker-shadow.png',
				'shadowSize': [24, 20],
			})    		    
		})
			}
        }).addTo(breweries); 
	})
};


//styling
var myStyle = {
    "color": "#8c2d04",
    "weight": 2.75,
    "opacity": 0.8
};

//styling
var areaStyle = {
    "color": "grey",
    "weight": 2.75,
    "opacity": 0.9
};


// Set stops icon
var stopsIcon = L.icon({
    iconUrl: '/img/stop.png',
	 iconSize:[05, 05]
   });

// Function to add all trails
function showTrails(){
    if(map.hasLayer(trails)){
        map.removeLayer(trails);
    };
    // Get CARTO selection as GeoJSON and Add to Map
    $.getJSON("https://mcmahoney3.carto.com/api/v2/sql?format=GeoJSON&q="+trailQuery, function(data) {
        trails = L.geoJson(data,{
			style: myStyle,
            onEachFeature: function (feature, layer) {
			    layer.bindPopup('<p><b>' + feature.properties.name + '</b><br /><em>' + feature.properties.use_ + '</em></p>');
                layer.cartodb_id=feature.properties.cartodb_id;
            }
        }).addTo(trailLayer); trailControl.addTo(map);
    });
};

// Function to add park area
function showAreas(){
    if(map.hasLayer(areas)){
        map.removeLayer(areas);
    };
    // Get CARTO selection as GeoJSON and Add to Map
    $.getJSON("https://mcmahoney3.carto.com/api/v2/sql?format=GeoJSON&q="+areaQuery, function(data) {
        trails = L.geoJson(data,{
			style: areaStyle,
            onEachFeature: function (feature, layer) {
			    layer.bindPopup('<p><b>' + feature.properties.parkname + '</b><br /><em>' + feature.properties.parktype + '</em></p>');
                layer.cartodb_id=feature.properties.cartodb_id;
            }
        }).addTo(boundary);
    });
};

// Function to add all poi
function showRoutes(){
    if(map.hasLayer(routes)){
        map.removeLayer(routes);
    };
    // Get CARTO selection as GeoJSON and Add to Map
    $.getJSON("https://mcmahoney3.carto.com/api/v2/sql?format=GeoJSON&q="+busQuery, function(data) {
        routes = L.geoJson(data,{
		
            onEachFeature: function (feature, layer) {
			    layer.bindPopup('<p><b>' + feature.properties.route_name + '</b><br /><em>' + feature.properties.route__ + '</em><br />'+'<a href="http://ridegrtc.com/planning-your-trip/trip-planner/" target="_blank">Plan Your Ride</a>' + '</p>');
                layer.cartodb_id=feature.properties.cartodb_id;
            }
        }).addTo(busRoutes);
    });
};

// Find five closest POIs

// Set Global Variable that will hold your location
var myLocation = null;

// Set Global Variable that will hold the marker that goes at our location when found
var locationMarker = null;

// Set 'Your Location' icon
var redIcon = L.icon({
    iconUrl: 'img/redIcon.png',
    shadowUrl: 'img/marker-shadow.png',
    iconAnchor: [13, 41]
});

// Function that will locate the user when called
function locateUser(){
  map.locate({setView: true, maxZoom: 15});
	// Map Event Listener listening for when the user location is found
map.on('locationfound', locationFound);
	
	// Map Event Listener listening for when the user location is not found
map.on('locationerror', locationNotFound);
};


// Function that will locate the user when called
function findUser(){
  map.locate({setView: true, maxZoom: 15});
	// Map Event Listener listening for when the user location is found
map.on('userlocationfound', locationFound);
	
	// Map Event Listener listening for when the user location is not found
map.on('locationerror', locationNotFound);
};

// Function will find and load the five nearest poi to a user location
function closestPOI(){
  // Set SQL Query that will return five closest coffee shops
  var sqlQueryClosest = "SELECT * FROM jamesriver_poi ORDER BY the_geom <-> ST_SetSRID(ST_MakePoint("+myLocation.lng+","+myLocation.lat+"), 4326) LIMIT 5";

  // remove poi if on map
  if(map.hasLayer(poiData)){
    map.removeLayer(poiData);
  };
	
	 // remove poi if on map
  if(map.hasLayer(busStops)){
    map.removeLayer(busStops);
  };
	

  // remove locationMarker if on map
  if(map.hasLayer(locationMarker)){
    map.removeLayer(locationMarker);
  };
	

  // Get GeoJSON of five closest points to the user
  $.getJSON("https://mcmahoney3.carto.com/api/v2/sql?format=GeoJSON&q="+sqlQueryClosest, function(data) {
    poiData = L.geoJson(data,{
      onEachFeature: function (feature, layer) {
        layer.bindPopup('' + feature.properties.name);
        layer.cartodb_id=feature.properties.cartodb_id;
      }
    }).addTo(map); map.fitBounds(poiData.getBounds());
  });
};

function locateStops(){
  map.locate({setView: true, maxZoom: 15});
	// Map Event Listener listening for when the user location is found
map.on('locationfound', stopslocationFound);

// Map Event Listener listening for when the user location is not found
map.on('locationerror', locationNotFound);
};



function closestStop(){
  // Set SQL Query that will return five closest coffee shops
  var sqlQueryClosestStop = "SELECT * FROM grtcstops ORDER BY the_geom <-> ST_SetSRID(ST_MakePoint("+myLocation.lng+","+myLocation.lat+"), 4326) LIMIT 5";

  // remove poi if on map
  if(map.hasLayer(busStops)){
    map.removeLayer(busStops);
  };
	
	// remove poi if on map
  if(map.hasLayer(poiData)){
    map.removeLayer(poiData);
  };

  // remove locationMarker if on map
  if(map.hasLayer(locationMarker)){
    map.removeLayer(locationMarker);
  };

  // Get GeoJSON of five closest points to the user
  $.getJSON("https://mcmahoney3.carto.com/api/v2/sql?format=GeoJSON&q="+sqlQueryClosestStop, function(data) {
    closeStops = L.geoJson(data,{
      onEachFeature: function (feature, layer) {
        layer.bindPopup('<p><b>' + feature.properties.location + '</b><br />Direction:<em>' + feature.properties.direction + '</em>'+'<a href="http://ridegrtc.com/planning-your-trip/trip-planner/" target="_blank">Plan Your Ride</a>' + '</p>');
        layer.cartodb_id=feature.properties.cartodb_id;
      }
    }).addTo(map); map.fitBounds(closeStops.getBounds());
  });
};

function resetSearch () {
	 // remove poi if on map
  if(map.hasLayer(poiData)){
    map.removeLayer(poiData);
  };
	
	 // remove poi if on map
  if(map.hasLayer(busStops)){
    map.removeLayer(busStops);
  };
	
	showPOI(); showStops();
	map.fitBounds(interestPoints.getBounds());	
};

// Get CARTO selection as GeoJSON and Add to Map
function getGeoJSON(){
  $.getJSON("https://mcmahoney3.cartodb.com/api/v2/sql?format=GeoJSON&q="+collectQuery, function(data) {
    cartoDBPoints = L.geoJson(data,{
		onEachFeature: function (feature, layer) {
                layer.bindPopup( '<b>' + 'Trail Name:' + '</b>' + feature.properties.trailname +'<br /><b>'+ 'Reported Hazard: ' + '</b>' + feature.properties.hazdescription + '<br /><b>' + 'Additional Description:' + '</b>' + feature.properties.description + '<br /><b>'+ 'Date: ' + '</b>' + feature.properties.date)
		},
		pointToLayer: function(feature,latlng){
		  return new L.Marker(latlng, {
            'icon':new L.Icon({
                'iconUrl': '/img/warning.png',
				'iconSize': [24, 20],
				'shadowUrl': 'img/marker-shadow.png',
				'shadowSize': [24, 20],
			}) 
		  })
	  }
    }).addTo(userData);
  });
};


// Use the jQuery UI dialog to create a dialog and set options
var dialog = $("#dialog").dialog({
  autoOpen: false,
  height: 350,
  width: 350,
  modal: true,
  position: {
    my: "center center",
    at: "center center",
    of: "#map"
  },
  buttons: {
    "Add to Database": setData,
    Cancel: function() {
      dialog.dialog("close");
      map.removeLayer(drawnItems);
    }
  },
  close: function() {
	  form[ 0 ].reset();
	  console.log("Dialog closed");
	 
  }
});

// Stops default form submission and ensures that setData or the cancel function run
var form = dialog.find("form").on("submit", function(event) {
  event.preventDefault();
});

// Function that will run when the location of the user is found
function locationFound(e){
    myLocation = e.latlng;
    closestPOI(); 
    locationMarker = L.marker(e.latlng, {icon: redIcon});
    map.addLayer(locationMarker);    
};

// Function that will run when the location of the user is found
function userlocationFound(e){
    myLocation = e.latlng;
    locationMarker = L.marker(e.latlng, {icon: redIcon});
    map.addLayer(locationMarker);    
};

// Function that will run if the location of the user is not found
function locationNotFound(e){
    alert(e.message);
};

// Function that will run when the location of the user is found
function stopslocationFound(e){
    myLocation = e.latlng;
    closestStop(); 
    locationMarker = L.marker(e.latlng, {icon: redIcon});
    map.addLayer(locationMarker);    
};




// Create Leaflet Draw Control for the draw tools and toolbox
var drawControl = new L.Control.Draw({
  draw : {
    polygon : false,
    polyline : false,
    rectangle : false,
    circle : false
  },
	position: 'topright',
  edit : false,
  remove: false
});

// Boolean global variable used to control visiblity
var controlOnMap = false;

// Create variable for Leaflet.draw features
var drawnItems = new L.FeatureGroup();

// Function to add the draw control to the map to start editing
function startEdits(){
  if(controlOnMap == true){
    map.removeControl(drawControl);
    controlOnMap = false;
  }
  map.addControl(drawControl);
  controlOnMap = true;
};

// Function to remove the draw control from the map
function stopEdits(){
  map.removeControl(drawControl);
  controlOnMap = false;
};

// Function to run when feature is drawn on map
map.on('draw:created', function (e) {
  var layer = e.layer;
  drawnItems.addLayer(layer);
  map.addLayer(drawnItems);
  dialog.dialog("open");
});

 // Submit data to the PHP using a jQuery Post method
    var submitToProxy = function(q){
		$.post("php/callProxy.php", { // <--- Enter the path to your callProxy.php file here
			qurl:q,
			cache: false,
			timeStamp: new Date().getTime()
		}, function(data) {
			console.log(data);
			window.alert("Submission received!");
			refreshLayer();
		});
	};

    // refresh the layers to show the updated dataset
    function refreshLayer() {
		if (map.hasLayer(cartoDBPoints)) {
			map.removeLayer(cartoDBPoints);
		};
		getGeoJSON();
	};

function setData() {
	var enteredUsername = username.value;
    var enteredDescription = description.value;
	var enteredHaz = hazdescription.value;
	var enteredDate = date.value;
	var enteredTrail = trailname.value;
	
    drawnItems.eachLayer(function (layer) {
        var sql = "INSERT INTO data_collector (the_geom, description, name, latitude, longitude, hazdescription, date, trailname)VALUES(ST_SetSRID(ST_GeomFromGeoJSON('";
        var a = layer.getLatLng();
        var sql2 ='{"type":"Point","coordinates":[' + a.lng + "," + a.lat + "]}'),4326),'" + enteredDescription + "','" + enteredUsername + "','" + a.lat + "','" + a.lng + "','" + enteredHaz + "','" + enteredDate + "','" + enteredTrail + "')";
		//var sql3 =")&api_key=d7ee8467dd5980a3d2a406a0423c0c6a276a8cc3'";
        var pURL = sql+sql2;

        submitToProxy(pURL);
        console.log("Feature has been submitted to the Proxy");
   });
    map.removeLayer(drawnItems);
    drawnItems = new L.FeatureGroup();
    console.log("drawnItems has been cleared");
    dialog.dialog("close");
};



//search control	
var poiLayers = L.layerGroup([trailLayer, interestPoints]) ;
var search = new L.Control.Search({layer: poiLayers, propertyName: 'name', position: 'topright'});
//searchLayer is a L.LayerGroup contains searched markers

search.addTo(map);

var mapbuttons_div = L.DomUtil.get('search');
mapbuttons_div.appendChild(search.getContainer()); // works


//start legend controls
//create corners
// Create additional Control placeholders
function addControlPlaceholders(map) {
    var corners = map._controlCorners,
        l = 'leaflet-',
        container = map._controlContainer;

    function createCorner(vSide, hSide) {
        var className = l + vSide + ' ' + l + hSide;

        corners[vSide + hSide] = L.DomUtil.create('div', className, container);
    }

    createCorner('verticalcenter', 'left');
    createCorner('verticalcenter', 'right');
}
addControlPlaceholders(map);


var legendControl = L.control({
		position: 'bottomright'
    });

var brewControl = L.control({
		position: 'bottomright'
    });

var reviewControl = L.control({
		position: 'bottomright'
    });

var stopControl = L.control({
		position: 'bottomright'
    });

var routesControl = L.control({
		position: 'bottomright'
    });

var boundControl = L.control({
		position: 'bottomright'
    });

var trailControl = L.control({
		position: 'bottomright'
    });


//create legends
legendControl.onAdd = function (map) {
// Create a new HTML <div> element and give it a class name of "legend"
        var div = L.DomUtil.create('div', 'legend');

        // First append an <h3> heading tag to the div holding the current attribute
        div.innerHTML = "<h7><b>Points of Interest</b></h7><br>";
	    div.innerHTML += '<img src="/img/church.png">'  + '  Place of Worship' + '<br>'
		div.innerHTML +=  '<img src="/img/historic.png">'  + '     Landmark' + '<br>' 
		div.innerHTML +=  '<img src="/img/school.png">'   +  '     School'+ '<br>'
		div.innerHTML +=  '<img src="/img/sign.png">'   +  '     Information Sign'+ '<br>'
		div.innerHTML +=  '<img src="/img/utility.png">'   +  '     Utility'+ '<br>'
		
       // Return the populated legend div to be added to the map   
        return div;

    }; // end onAdd method

brewControl.onAdd = function (map) {
// Create a new HTML <div> element and give it a class name of "legend"
        var div = L.DomUtil.create('div', 'legend');

        // First append an <h3> heading tag to the div holding the current attribute
        div.innerHTML = '<img src="/img/beer.png">'  + '  Brewery' + '<br>'
		
       // Return the populated legend div to be added to the map   
        return div;

    }; // end onAdd method

reviewControl.onAdd = function (map) {
// Create a new HTML <div> element and give it a class name of "legend"
        var div = L.DomUtil.create('div', 'legend');

        // First append an <h3> heading tag to the div holding the current attribute
        div.innerHTML = '<img src="/img/warning.png">'  + '  Trail Review' + '<br>'
		
       // Return the populated legend div to be added to the map   
        return div;

    }; // end onAdd method

stopControl.onAdd = function (map) {
// Create a new HTML <div> element and give it a class name of "legend"
        var div = L.DomUtil.create('div', 'legend');

        // First append an <h3> heading tag to the div holding the current attribute
        div.innerHTML = '<img src="/img/stop.png">'  + '  Bus Stop' + '<br>'
		
       // Return the populated legend div to be added to the map   
        return div;

    }; // end onAdd method

routesControl.onAdd = function (map) {
// Create a new HTML <div> element and give it a class name of "legend"
        var div = L.DomUtil.create('div', 'legend');

        // First append an <h3> heading tag to the div holding the current attribute
        div.innerHTML = '<img src="/img/routes.png">'  + '  Bus Route' + '<br>'
		
       // Return the populated legend div to be added to the map   
        return div;

    }; // end onAdd method

boundControl.onAdd = function (map) {
// Create a new HTML <div> element and give it a class name of "legend"
        var div = L.DomUtil.create('div', 'legend');

        // First append an <h3> heading tag to the div holding the current attribute
        div.innerHTML = '<img src="/img/boundary.png">'  + '  Park Boundary' + '<br>'
		
       // Return the populated legend div to be added to the map   
        return div;

    }; // end onAdd method

trailControl.onAdd = function (map) {
// Create a new HTML <div> element and give it a class name of "legend"
        var div = L.DomUtil.create('div', 'legend');

        // First append an <h3> heading tag to the div holding the current attribute
        div.innerHTML = '<img src="/img/trail.png">'  + '  Trail' + '<br>'
		
       // Return the populated legend div to be added to the map   
        return div;

    }; // end onAdd method


//add or remove legend layers based on visibility
map.on('overlayadd', function (eventLayer) {
    // Switch to the Population legend...
    if (eventLayer.name === "Point of Interest") {
        this.removeControl(legendControl);
		legendControl.addTo(this);
        
	} else if (eventLayer.name === "Breweries") { // Or switch to the Population Change legend...
		this.removeControl(brewControl);
		brewControl.addTo(this);
	
	} else if (eventLayer.name === "Trails") { // Or switch to the Population Change legend...
        this.removeControl(trailControl);
		trailControl.addTo(this);
	
	} else if (eventLayer.name === "User Trail Reviews") { // Or switch to the Population Change legend...
        this.removeControl(reviewControl);
		reviewControl.addTo(this);
        
    } else if (eventLayer.name === "Bus Stops") { // Or switch to the Population Change legend...
        this.removeControl(stopControl);
		stopControl.addTo(this);
        
    } else if (eventLayer.name === "Bus Routes") { // Or switch to the Population Change legend...
        this.removeControl(routesControl);
		routesControl.addTo(this);
        
    } else if (eventLayer.name === "Park Boundaries") { // Or switch to the Population Change legend...
        this.removeControl(boundControl);
		boundControl.addTo(this);
        
    }
});


map.on('overlayremove', function (eventLayer) {
    // Switch to the Population legend...
    if (eventLayer.name === "Point of Interest") {
        this.removeControl(legendControl);
        
    } else if (eventLayer.name === "Breweries") { // Or switch to the Population Change legend...
        this.removeControl(brewControl);
	
	} else if (eventLayer.name === "User Trail Reviews") { // Or switch to the Population Change legend...
        this.removeControl(reviewControl);
	
	} else if (eventLayer.name === "Trails") { // Or switch to the Population Change legend...
        this.removeControl(trailControl);	
        
    } else if (eventLayer.name === "Bus Stops") { // Or switch to the Population Change legend...
        this.removeControl(stopControl);
	
	} else if (eventLayer.name === "Bus Routes") { // Or switch to the Population Change legend...
        this.removeControl(routesControl);
			        
    } else if (eventLayer.name === "Park Boundaries") { // Or switch to the Population Change legend...
        this.removeControl(boundControl);
		
        
    }
});


function mouseCoordinates() {
	var mouseCoords = L.control.coordinates({
		position:"topright", //optional default "bottomright"
		decimals:2, //optional default 4
		decimalSeparator:".", //optional default "."
		labelTemplateLat:"Latitude: {y}", //optional default "Lat: {y}"
		labelTemplateLng:"Longitude: {x}", //optional default "Lng: {x}"
		enableUserInput:true, //optional default true
		useDMS:false, //optional default false
		useLatLngOrder: true, //ordering of labels, default false-> lng-lat
		markerType: L.marker, //optional default L.marker
		markerProps: {}, //optional default {},
		labelFormatterLng : function(lng){return lng+" lng"}, //optional default none,
		labelFormatterLat : function(lat){return lat+" lat"}, //optional default none
		customLabelFcn: function(latLonObj, opts) { return "Coordinates: " + latLonObj.lat.toFixed(5) + ", " + latLonObj.lng.toFixed(5)} //optional default none
	})
mouseCoords.addTo(map);
};
//add sidebar to map
var sidebar = L.control.sidebar('sidebar').addTo(map);




$( document ).ready(function() {
  showPOI(); showTrails(); showAreas(); showBrew(); getGeoJSON(); showRoutes(); showStops(); mouseCoordinates();
});


	








