var express = require('express');
var router = express.Router();
var conn = require('pg');

// GET home page 
router.get('/', function(req, res) {
    res.render('index');
});

//GET greenAreas
router.get('/getGreenAreas', function(req, res, next) {
    
    if(req.query.lat == null || req.query.lng ==null || req.query.radius == null){
        return console.error('Error, Bad request: ', err);
    }
    var client = new conn.Client("postgresql://postgres:admin@localhost:5432/gis");

    client.connect(function(err) {       
        if(err) {
            return console.error('Error, Cannot connect to dbs: ', err);
        }

        var dbsQuery = "SELECT park.name, st_distance(ST_GeogFromText('SRID=4326;POINT("+
            req.query.lat+" "+req.query.lng+")'), st_transform(park.way,4326)::geography), st_area(st_transform(park.way,4326)::geography)," +
            " ST_AsGeoJSON(st_transform(park.way,4326)::geography) FROM planet_osm_polygon park WHERE park.leisure='park' "+ 
            "AND ST_Dwithin( ST_GeogFromText('SRID=4326;POINT("+req.query.lat+" "+req.query.lng+")'), st_transform(park.way,4326)::geography,"+
            req.query.radius +")";
        
        console.log(dbsQuery);
        
        client.query(dbsQuery, function(err, result) {            

            if(err) {
                return console.error('error running query', err);
            }
            client.end();

            var geoJson = {
                "type": "FeatureCollection",
                "features": []
            }

            result.rows.forEach(function(row) {
                geoJson.features.push({
                    "type": "Feature", 
                    "geometry": JSON.parse(row.st_asgeojson), 
                    "properties": { 
                        "name": row.name, 
                        "distance": row.st_distance, 
                        "size": row.st_area
                    }});
            });
           return res.json(geoJson);
        });
    });
});

//GET busStops
router.get('/getBusStops', function(req, res, next) {
    
    if(req.query.lat == null || req.query.lng ==null || req.query.radius == null){
        return console.error('Error, Bad request: ', err);
    }
    var client = new conn.Client("postgresql://postgres:admin@localhost:5432/gis");

    client.connect(function(err) {       
        if(err) {
            return console.error('Error, Cannot connect to dbs: ', err);
        }

        var dbsQuery = "SELECT stops.name, stops.operator, ST_AsGeoJSON(st_transform(stops.way,4326)::geography), st_distance( ST_GeogFromText('SRID=4326;POINT("+req.query.lat+" "+
            req.query.lng+")'), st_transform(stops.way,4326)::geography) FROM planet_osm_point stops WHERE (stops.operator='DPB' OR stops.operator='Slovak Lines') "+
            "AND stops.amenity IS NULL AND ST_Dwithin( ST_GeogFromText('SRID=4326;POINT("+req.query.lat+" "+req.query.lng+
            ")'), st_transform(stops.way,4326)::geography,"+ req.query.radius +");";
        
        console.log(dbsQuery);
        
        client.query(dbsQuery, function(err, result) {            

            if(err) {
                return console.error('error running query', err);
            }
            client.end();

            var geoJson = {
                "type": "FeatureCollection",
                "features": []
            }

            result.rows.forEach(function(row) {
                geoJson.features.push({
                    "type": "Feature", 
                    "geometry": JSON.parse(row.st_asgeojson), 
                    "properties": { 
                        "name": row.name, 
                        "distance": row.st_distance, 
                        "operator": row.operator
                    }});
            });

           return res.json(geoJson);
        });
    });    
});

//GET vendingMachines
router.get('/getVendingMachines', function(req, res, next) {
    
    if(req.query.lat == null || req.query.lng ==null || req.query.radius == null){
        return console.error('Error, Bad request: ', err);
    }
    var client = new conn.Client("postgresql://postgres:admin@localhost:5432/gis");

    client.connect(function(err) {       
        if(err) {
            return console.error('Error, Cannot connect to dbs: ', err);
        }

        var dbsQuery = "SELECT stops.amenity, stops.operator, ST_AsGeoJSON(st_transform(stops.way,4326)::geography), st_distance( ST_GeogFromText('SRID=4326;POINT("+
            req.query.lat+" "+req.query.lng+")'), st_transform(stops.way,4326)::geography) FROM planet_osm_point stops WHERE "+
            "(stops.operator='DPB' OR stops.operator='Slovak Lines') AND stops.amenity IS NOT NULL AND ST_Dwithin( ST_GeogFromText('SRID=4326;POINT("+
            req.query.lat+" "+req.query.lng+")'), st_transform(stops.way,4326)::geography,"+ req.query.radius +");";
        
        console.log(dbsQuery);
        
        client.query(dbsQuery, function(err, result) {            

            if(err) {
                return console.error('error running query', err);
            }
            client.end();

            var geoJson = {
                "type": "FeatureCollection",
                "features": []
            }

            result.rows.forEach(function(row) {
                geoJson.features.push({
                    "type": "Feature", 
                    "geometry": JSON.parse(row.st_asgeojson), 
                    "properties": { 
                        "name": "Vending Machine", 
                        "distance": row.st_distance, 
                        "operator": row.operator
                    }});
            });

           return res.json(geoJson);
        });
    });    
});

//GET busRoutes
router.get('/getBusRoutes', function(req, res, next) {
    
    if(req.query.lat == null || req.query.lng ==null || req.query.radius == null){
        return console.error('Error, Bad request: ', err);
    }
    var client = new conn.Client("postgresql://postgres:admin@localhost:5432/gis");

    client.connect(function(err) {       
        if(err) {
            return console.error('Error, Cannot connect to dbs: ', err);
        }

        var dbsQuery = "SELECT DISTINCT ST_AsGeoJSON(st_transform(line.way,4326)::geography), line.name, line.operator, line.ref, line.route, st_Length(st_transform(line.way,4326)::geography) FROM planet_osm_line line "+
            "WHERE (line.operator='DPB' OR line.operator='Slovak Lines') AND line.ref IS NOT NULL AND ST_Dwithin( ST_GeogFromText('SRID=4326;POINT("+
            req.query.lat+" "+req.query.lng+")'), st_transform(line.way,4326)::geography,"+ req.query.radius +");";
        
        console.log(dbsQuery);
        
        client.query(dbsQuery, function(err, result) {            

            if(err) {
                return console.error('error running query', err);
            }
            client.end();

            var geoJson = {
                "type": "FeatureCollection",
                "features": []
            }

            result.rows.forEach(function(row) {
                geoJson.features.push({
                    "type": "Feature", 
                    "geometry": JSON.parse(row.st_asgeojson), 
                    "properties": { 
                        "name": row.name, 
                        "bus": row.ref, 
                        "operator": row.operator,
                        "type": row.route,
                        "length":row.st_length
                    }});
            });

           return res.json(geoJson);
        });
    });    
});

//GET airPolution
router.get('/getAirPolution', function(req, res, next) {
    
    if(req.query.lat == null || req.query.lng ==null || req.query.radius == null){
        return console.error('Error, Bad request: ', err);
    }
    var client = new conn.Client("postgresql://postgres:admin@localhost:5432/gis");

    client.connect(function(err) {       
        if(err) {
            return console.error('Error, Cannot connect to dbs: ', err);
        }

        var dbsQuery = "SELECT pol.name,ST_AsGeoJSON(st_transform(pol.way,4326)::geography),pol.landuse FROM planet_osm_polygon pol WHERE (landuse='industrial' OR landuse='landfill')"+
            " AND ST_Dwithin( ST_GeogFromText('SRID=4326;POINT("+ req.query.lat+" "+req.query.lng+
            ")'), st_transform(pol.way,4326)::geography,"+ req.query.radius +")";
        
        console.log(dbsQuery);
        
        client.query(dbsQuery, function(err, result) {            

            if(err) {
                return console.error('error running query', err);
            }
            client.end();

            var geoJson = {
                "type": "FeatureCollection",
                "features": []
            }

            result.rows.forEach(function(row) {
                geoJson.features.push({
                    "type": "Feature", 
                    "geometry": JSON.parse(row.st_asgeojson), 
                    "properties": { 
                        "name": row.name, 
                        "landuse": row.landuse
                    }});
            });

           return res.json(geoJson);
        });
    });    
});

//GET noisePolution
router.get('/getNoisePolutionRadius', function(req, res, next) {
    
    if(req.query.lat == null || req.query.lng ==null || req.query.radius == null){
        return console.error('Error, Bad request: ', err);
    }
    var client = new conn.Client("postgresql://postgres:admin@localhost:5432/gis");

    client.connect(function(err) {       
        if(err) {
            return console.error('Error, Cannot connect to dbs: ', err);
        }

        /*var dbsQuery = "SELECT pol.name, ST_AsGeoJSON(st_transform(pol.way,4326)::geography), pol.landuse FROM planet_osm_polygon pol "+
            "WHERE landuse='construction' AND ST_Dwithin( ST_GeogFromText('SRID=4326;POINT("+req.query.lat+" "+req.query.lng+")'), st_transform(pol.way,4326)::geography,"+
             req.query.radius +") UNION SELECT rail.name, ST_AsGeoJSON(st_transform(rail.way,4326)::geography), rail.railway as landuse FROM planet_osm_line rail "+
             "WHERE rail.railway='rail' AND rail.operator='ŽSR' AND ST_Intersects( ST_Buffer(ST_GeogFromText('SRID=4326;POINT("+req.query.lat+" "+req.query.lng+
             ")'),"+ req.query.radius +")::geometry, st_transform(rail.way,4326)::geometry);";
        */

        var dbsQuery = "SELECT pol.name, ST_AsGeoJSON(st_transform(ST_Buffer(pol.way,200)::geometry,4326)::geography) as radius, pol.landuse FROM planet_osm_polygon pol WHERE landuse='construction' AND ST_Dwithin( ST_GeogFromText('SRID=4326;POINT("+req.query.lat+" "+req.query.lng+")'), st_transform(pol.way,4326)::geography, "+ req.query.radius +" ) UNION SELECT name as NULL, ST_AsGeoJSON(st_transform((ST_Union(gruped.radius::geometry)),4326)::geography), gruped.landuse FROM ( SELECT rail.name, ST_Buffer(rail.way,200) as radius, rail.railway as landuse FROM planet_osm_line rail WHERE rail.railway='rail' AND rail.operator='ŽSR' AND ST_Contains( ST_Buffer(ST_GeogFromText('SRID=4326;POINT("+req.query.lat+" "+req.query.lng+")'), "+ req.query.radius +")::geometry, st_transform(rail.way,4326)::geometry) )as gruped Group by gruped.landuse, name";
      
        console.log(dbsQuery);
        
        client.query(dbsQuery, function(err, result) {            

            if(err) {
                return console.error('error running query', err);
            }
            client.end();

            var geoJson = {
                "type": "FeatureCollection",
                "features": []
            }
            
            result.rows.forEach(function(row) {
                geoJson.features.push({
                    "type": "Feature", 
                    //"geometry": JSON.parse(row.st_asgeojson),
                    "geometry": JSON.parse(row.radius),  
                    "properties": { 
                        "name": row.radius, 
                    }});
            });

           return res.json(geoJson);
        });
    });    
});

//GET noisePolution
router.get('/getNoisePolution', function(req, res, next) {
    
    if(req.query.lat == null || req.query.lng ==null || req.query.radius == null){
        return console.error('Error, Bad request: ', err);
    }
    var client = new conn.Client("postgresql://postgres:admin@localhost:5432/gis");

    client.connect(function(err) {       
        if(err) {
            return console.error('Error, Cannot connect to dbs: ', err);
        }

        var dbsQuery = "SELECT pol.name, ST_AsGeoJSON(st_transform(pol.way,4326)::geography), pol.landuse FROM planet_osm_polygon pol "+
            "WHERE landuse='construction' AND ST_Dwithin( ST_GeogFromText('SRID=4326;POINT("+req.query.lat+" "+req.query.lng+")'), st_transform(pol.way,4326)::geography,"+
             req.query.radius +") UNION SELECT rail.name, ST_AsGeoJSON(st_transform(rail.way,4326)::geography), rail.railway as landuse FROM planet_osm_line rail "+
             "WHERE rail.railway='rail' AND rail.operator='ŽSR' AND ST_Intersects( ST_Buffer(ST_GeogFromText('SRID=4326;POINT("+req.query.lat+" "+req.query.lng+
             ")'),"+ req.query.radius +")::geometry, st_transform(rail.way,4326)::geometry);";
       
        console.log(dbsQuery);
        
        client.query(dbsQuery, function(err, result) {            

            if(err) {
                return console.error('error running query', err);
            }
            client.end();

            var geoJson = {
                "type": "FeatureCollection",
                "features": []
            }
            
            result.rows.forEach(function(row) {
                geoJson.features.push({
                    "type": "Feature", 
                    "geometry": JSON.parse(row.st_asgeojson),
                    "properties": { 
                        "name": row.name, 
                        "landuse": row.landuse
                    }});
            });

           return res.json(geoJson);
        });
    });    
});


module.exports = router;
