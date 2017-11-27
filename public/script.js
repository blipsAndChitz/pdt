
//MAP INITIALIZATION
var mymap = L.map('map').setView([48.1510612,17.1117569], 12);
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: '',
    maxZoom: 20,
    id: 'mapbox.dark',
    accessToken: 'pk.eyJ1IjoibnVsbGRldiIsImEiOiJjajhlbmJzYnEwemZyMndudjU1dzBiaTAwIn0.4qdFHLrfQxp32r4NKDtBhg'
}).addTo(mymap);

var markers = new L.FeatureGroup();
var greenAreas = L.geoJSON();
var airPolution = L.geoJSON();
var noisePolution = L.geoJSON();
var noisePolutionRadius = L.geoJSON();
var routes = L.geoJSON();
var vendingMachines = L.geoJSON();
var busStops = L.geoJSON();


var inputs = {};
var layersList = {
    "markers": false,
    "greenAreas": false,
    "airPolution": false,
    "noisePolution": false,
    "routes": false,
    "vendingMachines": false,
    "busStops": false,
    "noisePolutionRadius":false
}

//GOOGLE GEOCODING API

var geoLocation;
var address;

function getLocation(locationString) {

    URL = "https://maps.googleapis.com/maps/api/geocode/json?address=" 
            + locationString.replace(/\s+/g, '+') + "&key=AIzaSyB5YM8Ro4MRj7ZR6eKJ1s3WxgvvjBZX0m8";

    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (request.readyState === 4) {
            if (request.status === 200) {
                
                console.log("Google API:");
                //console.log(JSON.parse(request.responseText));
                console.log(JSON.parse(request.responseText).status);
                if(JSON.parse(request.responseText).status == "OK"){
                    geoLocation = JSON.parse(request.responseText).results[0].geometry.location;
                    address = JSON.parse(request.responseText).results[0].formatted_address;
                }
                else {
                    document.getElementById('messageLocation').style.visibility = "visible";
                    return false; 
                }
                
            } else {
                console.log("Error, Google geocoding");
            }
        }
    };
     request.open("GET", URL , false);
    request.send(null);

    if(geoLocation == null) return false;

    mymap.setView([geoLocation.lat, geoLocation.lng], 15, { animation: true });
    
    var LocationIcon = L.Icon.extend({
        options: {
            iconUrl: 'public/images/location.png',
            popupAnchor:  [1, -30],
            iconAnchor:   [15, 30],
        }
    });
    
    //var locationMarker = new LocationIcon(),    
    marker = L.marker([geoLocation.lat, geoLocation.lng],{icon: new LocationIcon()}); //.addTo(mymap)
    marker.bindPopup("<b>"+address+"</b><br>Current Location.").openPopup();

    markers.addLayer(marker);
    mymap.addLayer(markers);
    return geoLocation;  
}

//VALIDATION

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

function validateInputs(){

    var radius = document.getElementById('radius').value;
    var locationString = document.getElementById('location').value;

    if(locationString == "" || locationString == null){
        document.getElementById('messageLocation').style.visibility = "visible";
        return false;
    }
    else {       
        document.getElementById('messageLocation').style.visibility = "hidden";                
    }

    if(radius == "" || radius == null){
        document.getElementById('messageRadius').style.visibility = "visible";
        return false;
    }
    else {
        if(isNumeric(radius) && parseInt(radius) > 0){
            document.getElementById('messageRadius').style.visibility = "hidden";
        }
        else {
            document.getElementById('messageRadius').style.visibility = "visible";
            return false;
        } 
    }

    if(inputs == null){
        return false;
    }
    else if(inputs.locationString == locationString && inputs.radius == radius){
        return true;
    }
    else{
        inputs.locationString = locationString;
        inputs.radius = radius;
        eraseData(); 
        return true; 
    }
}

function makeRequest(URL){
    var request = new XMLHttpRequest();
    var response = {};
    request.onreadystatechange = function() {
        if (request.readyState === 4) {
            if (request.status === 200) {
                response = request.responseText
            } else {
                console.log("Error in:" + URL);
            }
        }
    };
    request.open("GET", URL , false);
    request.send(null);
    return response;
}

function eraseData(){    
    markers.clearLayers();
    greenAreas.clearLayers();
    airPolution.clearLayers();
    noisePolution.clearLayers();
    routes.clearLayers();
    vendingMachines.clearLayers();
    busStops.clearLayers();
    noisePolutionRadius.clearLayers();
    layersList.greenAreas = false;    
    layersList.markers = false; 
    layersList.airPolution = false; 
    layersList.noisePolution = false; 
    layersList.routes = false; 
    layersList.vendingMachines = false; 
    layersList.busStops = false; 
    layersList.noisePolutionRadius =false;
}

//REST SERVER API

function getAirPolution() {    
    
    if(validateInputs() && !layersList.airPolution)
    {   
        var l = getLocation(inputs.locationString);             
        if(l == false) return false;
        var url = document.URL+"getAirPolution"+"?lat="+l.lng+"&lng="+l.lat+"&radius="+inputs.radius;
        var res = JSON.parse(makeRequest(url));   

        airPolution = L.geoJSON(res, {
            "style": {
                weight: 3,
                color: "#c13e30",
                opacity: 1,
                fillColor: "#E74C3C",
                fillOpacity: 0.6
            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<b>'+(typeof(feature.properties.name) != "string" ? 'Air Polluter' : feature.properties.name)
                +'</b><br><p>Type: '+feature.properties.landuse+'</p>');
            }
        });

        mymap.addLayer(airPolution);
        layersList.airPolution = true;     
    }
}

function getNoisePolution() { 
    
    getNoisePolutionRadius();
    
    if(validateInputs() && !layersList.noisePolution)
    {   
        var l = getLocation(inputs.locationString);
        if(l == false) return false;
        var url = document.URL+"getNoisePolution"+"?lat="+l.lng+"&lng="+l.lat+"&radius="+inputs.radius;
        var res = JSON.parse(makeRequest(url));   

        noisePolution = L.geoJSON(res, {
            "style": {
                weight: 3,
                color: "#bc780d",
                opacity: 1,
                fillColor: "#F39C12",
                fillOpacity: 0.6
            },        
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<b>'+(typeof(feature.properties.name) != "string" ? 'Noise Polluter' : feature.properties.name)
                    +'</b><br><p>Type: '+feature.properties.landuse+'</p>');
            }
        });

        mymap.addLayer(noisePolution);
        layersList.noisePolution = true;     
    }
}

function getNoisePolutionRadius() {    
    
    if(validateInputs() && !layersList.noisePolutionRadius)
    {   
        var l = getLocation(inputs.locationString);
        if(l == false) return false;
        var url = document.URL+"getNoisePolutionRadius"+"?lat="+l.lng+"&lng="+l.lat+"&radius="+inputs.radius;
        var res = JSON.parse(makeRequest(url));   

        noisePolutionRadius = L.geoJSON(res, {
            "style": {
                weight: 3,
                color: "#bc780d",
                opacity: 0.2,
                fillColor: "#F39C12",
                fillOpacity: 0.2
            },        
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<b>Noise Pollution Radius</b>');
            }
        });

        mymap.addLayer(noisePolutionRadius);
        layersList.noisePolutionRadius = true;     
    }
}

function getGreenAreas() {    

    if(validateInputs() && !layersList.greenAreas)
    {   
        var l = getLocation(inputs.locationString);
        if(l == false) return false;
        var url = document.URL+"getGreenAreas"+"?lat="+l.lng+"&lng="+l.lat+"&radius="+inputs.radius;
        var res = JSON.parse(makeRequest(url));   

        greenAreas = L.geoJSON(res, {
            "style": {
                weight: 3,
                color: "#00a077",
                opacity: 1,
                fillColor: "#00bc8c",
                fillOpacity: 0.6
            },        
            onEachFeature: function (feature, layer) {

                console.log(typeof(feature.properties.name));

                layer.bindPopup('<b>'+(typeof(feature.properties.name) != "string" ? 'Park' : feature.properties.name) 
                    +'</b><br><p>Size: '+parseInt(feature.properties.size,10)
                    +'m2<br>Distance: '+parseInt(feature.properties.distance,10)+'m</p>');
            }
        });

        mymap.addLayer(greenAreas);
        layersList.greenAreas = true;     
    }
}

function getTransportation(){

    if(validateInputs()){
        if(document.getElementById('routes').checked && !layersList.routes){   

            var l = getLocation(inputs.locationString);
            if(l == false) return false;
            var url = document.URL+"getBusRoutes"+"?lat="+l.lng+"&lng="+l.lat+"&radius="+inputs.radius;
            var res = JSON.parse(makeRequest(url));   
    
            routes = L.geoJSON(res, {
                onEachFeature: function (feature, layer) {
                    layer.bindPopup('<b>'+feature.properties.name+'</b><br><p>Line: '+feature.properties.bus+'<br>Type:'+ feature.properties.type +'<br>Length: '+parseInt(feature.properties.length, 10)+'m<br>Operator: '+feature.properties.operator +'</p>');
                }
            });
    
            mymap.addLayer(routes);
            layersList.routes = true;     
        }
        if(document.getElementById('stops').checked && !layersList.busStops){

            var l = getLocation(inputs.locationString);
            if(l == false) return false;
            var url = document.URL+"getBusStops"+"?lat="+l.lng+"&lng="+l.lat+"&radius="+inputs.radius;
            var res = JSON.parse(makeRequest(url));   
    
            var BusIcon = L.Icon.extend({
                options: {
                    iconUrl: 'public/images/bus.png',
                    popupAnchor:  [1, -30],
                    iconAnchor:   [15, 30],
                }
            });

            busStops = L.geoJSON(res, {
                pointToLayer: function(feature, latlng) {
                    return L.marker(latlng,{icon: new BusIcon()})
                },
                onEachFeature: function (feature, layer) {
                    layer.bindPopup('<b>'+feature.properties.name+'</b><br><p>Distance: '+parseInt(feature.properties.distance, 10)+'m<br>Operator: '+feature.properties.operator +'</p>');
                }
            });
    
            mymap.addLayer(busStops);
            layersList.busStops = true;
        }
        if(document.getElementById('vendingMachines').checked && !layersList.vendingMachines){

            var l = getLocation(inputs.locationString);
            if(l == false) return false;
            var url = document.URL+"getVendingMachines"+"?lat="+l.lng+"&lng="+l.lat+"&radius="+inputs.radius;
            var res = JSON.parse(makeRequest(url));   
    
            var VendingIcon = L.Icon.extend({
                options: {
                    iconUrl: 'public/images/vending.png',
                    popupAnchor:  [1, -30],
                    iconAnchor:   [15, 30],
                }
            });

            vendingMachines = L.geoJSON(res, {
                pointToLayer: function(feature, latlng) {
                    return L.marker(latlng,{icon: new VendingIcon()})
                },
                onEachFeature: function (feature, layer) {
                  layer.bindPopup('<b>'+feature.properties.name+'</b><br><p>Distance: '+parseInt(feature.properties.distance, 10)+'m<br>Operator: '+feature.properties.operator +'</p>');
                }
            });
    
            mymap.addLayer(vendingMachines);
            layersList.vendingMachines = true;
        }
    } 

}
