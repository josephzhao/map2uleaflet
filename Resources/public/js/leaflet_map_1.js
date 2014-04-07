/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var mapapp;






var I18n = I18n || {};
I18n.translations = {'en': {
        'javascripts': {
            'map': {
                'zoom': {
                    'in': 'Zoom in',
                    'out': 'Zoom out'
                },
                'layers': {
                    'header': 'Map Layers',
                    'title': 'Layers',
                    'overlays': 'OverLays',
                    'baselayers': 'BaseLayers',
                    'notes': 'Notes',
                    'Subwatersheds': 'Subwatersheds',
                    'Watersheds': 'Watersheds',
                    'data': 'Data',
                    "Credit River Parks": "Credit River Parks",
                    "Conservation": "Conservation",
                    "credit_river": "Credit River",
                    "credit_river_head_waters": "Credit River Head Waters",
                    "credit_valley_conservation": "Credit Valley Conservation",
                    "creditriverheadwaters": "Credit River Head Waters",
                    "creditvalleyprovincialpark": "Credit Valley Provincial Park",
                    "creditvalleytrails": "Credit Valley Trails",
                    "peel_community_centres": "Peel Community Centres",
                    "peel_golf_courses": "Peel Golf Courses",
                    "peel_parks": "Peel Parks",
                    "peel_playground_pools": "Peel Playground Pools",
                    "peel_region_trails": "Peel Region Trails",
                    "trail3_clip": "Trail Head",
                    "trails": "Trails",
                    "water_ways": "Water Ways"
                },
                'locate': {
                    'title': 'Show my location'
                }
                ,
                'share': {
                    'title': 'Share Map Information'
                },
                'key': {
                    'title': 'Show Map Legend'
                }
                ,
                'legend': {
                    'title': 'Show Map Legend'
                }
                ,
                'note': {
                    'title': 'Create Note'
                }
            },
            'key': {
                'title': 'Legend',
                'tooltip_disabled': 'Map Legend Disabled',
                'tooltip': 'Show Map Legend'
            }
            ,
            'share': {
                'title': 'Share',
                'link': 'Link or HTML',
                'include_marker': 'include marker',
                'long_link': 'Link',
                'short_link': 'Short Link',
                'embed': 'HTML',
                'image': 'Image',
                'format': 'Format',
                'scale': 'Scale',
                'image_size': 'Image Size',
                'paste_html': 'Paste HTML',
                'custom_dimensions': 'Custom Dimensions',
                'download': 'Download'

            },
            'site': {
                'createnote_disabled_tooltip': 'Create Note Disabled',
                'createnote_tooltip': 'Create Note'
            }
        }
    }
};




(function() {
    var loaderTimeout;

    OSM.loadSidebarContent = function(path, callback) {
        clearTimeout(loaderTimeout);

        loaderTimeout = setTimeout(function() {
            $('#sidebar_loader').show();
        }, 200);

        // IE<10 doesn't respect Vary: X-Requested-With header, so
        // prevent caching the XHR response as a full-page URL.
        if (path.indexOf('?') >= 0) {
            path += '&xhr=1';
        } else {
            path += '?xhr=1';
        }

        $('#sidebar_content')
                .empty();



        $.ajax({
            url: path,
            dataType: "html",
            complete: function(xhr) {
                clearTimeout(loaderTimeout);
                $('#flash').empty();
                $('#sidebar_loader').hide();


                var content = $(xhr.responseText);

                if (xhr.getResponseHeader('X-Page-Title')) {
                    var title = xhr.getResponseHeader('X-Page-Title');
                    document.title = decodeURIComponent(escape(title));
                }

                $('head')
                        .find('link[type="application/atom+xml"]')
                        .remove();

                $('head')
                        .append(content.filter('link[type="application/atom+xml"]'));



                $('#sidebar_content').html(content.not('link[type="application/atom+xml"]'));
                alert(callback);
                $('#sidebar_content').show();
                if (callback) {
                    callback();
                }
            }
        });
    };
})();


window.onload = function() {


$('#leafmap').height($(window).height() - 126);
        $(window).resize(function() { /* do something */
$('#leafmap').height($(window).height() - 126);
        $('#map-ui').height($(window).height() - 126);
});
        var map = new L.MAP2U.Map('leafmap', {
        'zoomControl': false,
        }).setView([43.73737, - 79.95987], 10);
        //add a tile layer to add to our map, in this case it's the 'standard' OpenStreetMap.org tile server
        var mapnik = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
                maxZoom: 18
        }).addTo(map);
        var googleLayer_satellite = new L.Google('SATELLITE', {attribution: ""});
        var googleLayer_roadmap = new L.Google('ROADMAP', {attribution: ""});
        var googleLayer_hybrid = new L.Google('HYBRID', {attribution: ""});
        var googleLayer_terrain = new L.Google('TERRAIN', {attribution: ""});
        var mapnik_minimap = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
                maxZoom: 18
        });
        var miniMap = new L.Control.MiniMap(mapnik_minimap, {position: 'bottomright', width: 150, height: 150, zoomLevelOffset: - 4, zoomAnimation: false, toggleDisplay: true, autoToggleDisplay: false}).addTo(map);
        var subwatersheds = new L.TileLayer.WMS(
                "http://cobas.juturna.ca:8080/geoserver/juturna/wms",
        {
        layers: 'juturna:cvcsubwatersheds',
                format: 'image/png',
                transparent: true,
                srs: 'EPSG:4326',
                attribution: ""
        });
        var watersheds = new L.TileLayer.WMS(
                "http://cobas.juturna.ca:8080/geoserver/juturna/wms",
        {
        layers: 'juturna:cvcwatersheds',
                format: 'image/png',
                srs: 'EPSG:4326',
                transparent: true,
                attribution: ""
        });
        var conservationareas = new L.TileLayer.WMS(
                "http://cobas.juturna.ca:8080/geoserver/juturna/wms",
        {
        layers: 'juturna:conservationareas',
                format: 'image/png',
                srs: 'EPSG:26917',
                transparent: true,
                attribution: ""
        });
        var creditriverparks = new L.TileLayer.WMS(
                "http://cobas.juturna.ca:8080/geoserver/juturna/wms",
        {
        layers: 'juturna:creditriverparks',
                format: 'image/png',
                srs: 'EPSG:26917',
                transparent: true,
                attribution: ""
        });
//   var trail = new L.TileLayer.WMS(
//            "http://cobas.juturna.ca:8080/geoserver/juturna/wms",
//            {
//                layers: 'juturna:trail',
//                format: 'image/png',
//                srs: 'EPSG:26917',
//                transparent: true,
//                attribution: ""
////            });          
//var topo=L.d3("/lh-s.json",{
//	topojson:"1_lhrp000b06a_EPSG3857"
////	svgClass : "Spectral"//,
////	pathClass:function(d) {
////		return "town q" + (10-topo.quintile(d.properties.pop/topo.path.area(d)))+"-11";
////	},
////	before: function(data){
////		var _this = this;
////		this.quintile=d3.scale.quantile().domain(data.geometries.map(function(d){return d.properties.pop/_this.path.area(d);})).range(d3.range(11));
////	}
//}).addTo(map);
//

        var layernames = ['trails', 'credit_river',
                'credit_river_head_waters',
                'credit_valley_conservation',
                'creditriverheadwaters',
                'creditvalleyprovincialpark',
              
                'peel_community_centres',
                'peel_golf_courses',
                'peel_parks',
                'peel_playground_pools',
                
                'trail3_clip',
                'water_ways'];
        map.addLayer(mapnik);
        map.addLayer(subwatersheds);
        map.baseLayers = [{'layer':
                mapnik, 'name': 'Open Street Map'},
        {'layer':
                googleLayer_roadmap, 'name': 'Google Road Map'},
        {'layer': new L.Google('SATELLITE'), 'name': 'Google Satellite'},
        {'layer': new L.Google('HYBRID'), 'name': 'Google Hybrid'},
        {'layer': new L.Google('TERRAIN'), 'name': 'Google Terrain'}

        ];
        map.noteLayer = new L.FeatureGroup();
        map.noteLayer.options = {code: 'N'};
        map.dataLayers = [{'layer':creditriverparks, name:'Credit River Parks'}, {'layer':conservationareas, name:'Conservation'}, {'layer': subwatersheds, 'name': 'Subwatersheds'},
        {'layer': watersheds, 'name': 'Watersheds'}];
        var index;
        var layers = [];
        for (index = 0; index < layernames.length; ++index) {
layers[index] = new L.TileLayer.WMS(
        "http://cobas.juturna.ca:8080/geoserver/juturna/wms",
        {
        layers: 'juturna:' + layernames[index],
                format: 'image/png',
                srs: 'EPSG:26917',
                transparent: true,
                attribution: ""
                });
        map.dataLayers.push({'layer':layers[index], name:layernames[index]});
        }

var baseMaps = {
"Google Road Map": googleLayer_roadmap,
        "Google Satellite": googleLayer_satellite,
        "Google Hybrid": googleLayer_hybrid,
        "Google Terrain": googleLayer_terrain
        };
        var overlayMaps = {
        'Credit River Parks':creditriverparks,
                'Conservation':conservationareas,
                "Subwatersheds": subwatersheds,
                "Watersheds": watersheds
        };
//    
//var MyControl = L.Control.extend({
//    options: {
//        position: 'topleft'
//    },
//
//    onAdd: function (map) {
//        // create the control container with a particular class name
//        var container = L.DomUtil.create('div', 'my-custom-control');
//
//        // ... initialize other DOM elements, add listeners, etc.
//
//        return container;
//    }
//});
//
//map.addControl(new MyControl());

//    var popup = L.popup();
//
//    function onMapClick(e) {
//        popup
//                .setLatLng(e.latlng)
//                .setContent("You clicked the map at " + e.latlng.toString())
//                .openOn(map);
//    }
//
//    map.on('click', onMapClick);

        var position = $('html').attr('dir') === 'rtl' ? 'topleft' : 'topright';
        L.MAP2U.zoom({position: position}).addTo(map);
        L.control.locate({
        position: position,
                strings: {
                title: I18n.t('javascripts.map.locate.title'),
                        popup: I18n.t('javascripts.map.locate.popup')
                }
        }).addTo(map);
        L.control.scale().addTo(map);
        L.control.mousePosition({'emptyString': '', 'position': 'bottomleft'}).addTo(map);
//    var sidebar = L.MAP2U.sidebar('#map-ui').addTo(map);
        // alert(map.layers.length);
        var leftSidebar = L.control.sidebar('sidebar-left', {
        position: 'left'
        });
        map.addControl(leftSidebar);
        var rightSidebar = L.control.sidebar('sidebar-right', {
        position: 'right'
        });
        map.addControl(rightSidebar);
        L.MAP2U.layers({
        position: position,
                layers: map.baseLayers,
                sidebar: rightSidebar
        }).addTo(map);
        L.MAP2U.legend({
        position: position,
                sidebar: rightSidebar
        }).addTo(map);
        L.MAP2U.share({
        position: position,
                sidebar: rightSidebar,
                'short': true
        }).addTo(map);
        L.MAP2U.note({
        position: position,
                sidebar: rightSidebar
        }).addTo(map);
        var drawnItems = new L.FeatureGroup();
        map.addLayer(drawnItems);
        var drawControl = new L.Control.Draw({
        position: 'topleft',
                draw: {
                rectangle: {
                shapeOptions: {
                color: '#0000FF',
                        weight: 3
                }
                },
                        polyline: {
                        shapeOptions: {
                        color: '#0000FF',
                                weight: 3
                        }
                        },
                        polygon: {
                        shapeOptions: {
                        color: '#0000FF',
                                weight: 3
                        }
                        },
                        circle: {
                        shapeOptions: {
                        color: '#0000FF',
                                weight: 3
                        }
                        }
                },
                edit: {
                featureGroup: drawnItems
                }
        });
        map.addControl(drawControl);
        setTimeout(function () {
        leftSidebar.toggle();
        }, 500);
//        setTimeout(function () {
//            rightSidebar.toggle();
//        }, 2500);

//        setInterval(function () {
//            leftSidebar.toggle();
//        }, 5000);
//
//        setInterval(function () {
//            rightSidebar.toggle();
//        }, 7000);     

        map.on('draw:created', function(e) {
        var type = e.layerType,
                layer = e.layer;
                if (type === 'marker') {
        layer.bindPopup('A popup!');
        }

        drawnItems.addLayer(layer);
        });
        
         var overlays = {};
         
         
  // Add an SVG element to Leaflet’s overlay pane
  var svg = d3.select(map.getPanes().overlayPane).append("svg"),
   g = svg.append("g").attr("class", "leaflet-zoom-hide");
   
  d3.json("park.json", function(error, geoShape) {
  
  //  create a d3.geo.path to convert GeoJSON to SVG
  var transform = d3.geo.transform({point: projectPoint}),
            path = d3.geo.path().projection(transform);
 
  // create path elements for each of the features
  d3_features = g.selectAll("path")
   .data(topojson.object(geoShape, geoShape.objects.CreditRiverParks).geometries)
   .enter().append("path");
alert(d3_features.length);
  map.on("viewreset", reset);

  reset();

  // fit the SVG element to leaflet's map layer
  function reset() {
        
   bounds = path.bounds(geoShape);

   var topLeft = bounds[0],
    bottomRight = bounds[1];

   svg .attr("width", bottomRight[0] - topLeft[0])
    .attr("height", bottomRight[1] - topLeft[1])
    .style("left", topLeft[0] + "px")
    .style("top", topLeft[1] + "px");

   g .attr("transform", "translate(" + -topLeft[0] + "," 
                                     + -topLeft[1] + ")");

   // initialize the path data 
   d3_features.attr("d", path)
    .style("fill-opacity", 0.7)
    .attr('fill','blue');
  } 

  // Use Leaflet to implement a D3 geometric transformation.
  function projectPoint(x, y) {
   var point = map.latLngToLayerPoint(new L.LatLng(y, x));
   this.stream.point(point.x, point.y);
  }

 })       
         
//   var svg = d3.select(map.getPanes().overlayPane).append("svg"),
//           g = svg.append("g").attr("class", "leaflet-zoom-hide");
//      
//         
//	var zoom = d3.behavior.zoom()
//  .on("zoom",function() {
//    g.attr("transform","translate("+d3.event.translate.join(",")+")scale("+d3.event.scale+")")
//  });
//
//svg.call(zoom)
//
//  //OPEN TOPOJSON-FILE
//  d3.json("park.json", function(error, topology) {
// 
//  var collection2 = topojson.object(topology, topology.objects.CreditRiverParks).geometries;//lhrp000b06a_EPSG3857);
//      var roadsTopoJSON = [collection2];
//      
//      console.log(roadsTopoJSON)
//      
//      var geojson_tj = L.geoJson(roadsTopoJSON);
//    
//    map.addLayer(geojson_tj);
//    
//    
	//console.log(topology)
	//READ ALL EXISTING ARCS
//	topology.arcs.map(function(arc,i){
//		//GET THE MEMBERS OF CURRENT ARC
//		var members = getMembers(i);
//		var popupContent = 'Hey, hey ... I belong to: <br>';
//		//ADD ALL MEMBERS TO THE 'POPUPCONTENT'
//		members.forEach(function(member){popupContent = popupContent + "<b>" + member.name + "<br>"})
//		//GET THE Feature OF THE ARC
//   		var arcFeature = topojson.feature(topology, {type: 'LineString', arcs:[i], members:members});
//		//console.log(i)
//		//D'OH...CHANGE THE COORDINATES TO FIT FOR LEAFLET-POLYLINE
//		arcFeature.geometry.coordinates = arcFeature.geometry.coordinates.map(function(d){return [d[1],d[0]]})
//		//MAKE A POLYLINE USING THE ARCFEATURE
//		for (var j=0;j<members.length;j++){
//			console.log(j)
//			//DEFINE THE COLOR...NEEDS A MORE COMPLICATED SOLUTION FOR COMPLETELY AUTOMATIC ATTRIBUTION
//			switch (j){
//				case 0: color='#f00'; weight=5;
//					break;
//				case 1: color='#00f'; weight=3.5;
//					break;
//				case 2: color='#0f0'; weight=2;
//					break;
//			}
//			var polyline = L.polyline(arcFeature.geometry.coordinates, {color: color, weight: weight, opacity:1})
//				.bindPopup(popupContent)
//				.addTo(map);
//				//console.log(polyline)
//			overlays["Polyline"+i+"_"+j] = polyline;	
//		
//		}
//		
//	})
//	function getMembers(arc_id){
//		var members = [];
//		//CHECK FOR EXISTENCE OF ARC WITHIN EACH LINESTRING ... !!!VERYHARD CODED!!!
//		topology.objects.linestrings.geometries.forEach(function(feature){
//			//console.log(feature.arcs)
//			//console.log('indexof: '+feature.arcs.indexOf(arc_id))
//			if(feature.arcs.indexOf(arc_id)!=-1)members.push(feature.properties)
//		})
//		//console.log('members',members)
//		return members;
//	}
// 
//	//ADD THE LINESTRINGS TO THE LAYER-CONTROL
//	L.control.layers(baseLayers,overlays).addTo(map);
 //  })
        
        
//     var width = 960,
//    height = 475;
//
//var projection = d3.geo.mercator()
//    .center([-22, 64 ])
//    .scale(99999);
//
//var path = d3.geo.path()
//    .projection(projection);
//
//var color = d3.scale.linear()
//    .domain([0,900,1100])
//    .range(["green","yellow","white"]);
////
////var svg = d3.select("body").append("svg")
////    .attr("width", width)
////    .attr("height", height);
////
////var g = svg.append("g");
//
//		var svg = d3.select(map.getPanes().overlayPane).append("svg"),
//			g = svg.append("g").attr("class", "leaflet-zoom-hide");
//
//var loading = g.append("text").attr({x:500,y:250}).text("Loading")
//
//var zoom = d3.behavior.zoom()
//  .on("zoom",function() {
//    g.attr("transform","translate("+d3.event.translate.join(",")+")scale("+d3.event.scale+")")
//  });
//
//svg.call(zoom)
//
//d3.json("flakar.json", function(error, topology) {
//  loading.remove();
//  g.selectAll("path")
//    .data(topojson.object(topology, topology.objects.flakar).geometries)
//  .enter()
//    .append("path")
//    .attr("d", path)
//    .style("fill",function(d) { return color(d.properties.Z)})
//});
//        
//                  alert("1="+$('.leaflet-top leaflet-right'));
//                  alert("2="+$('.leaflet-top .leaflet-right'));
//                  alert("3="+$('.leaflet-control-container .leaflet-top .leaflet-right'));
//                  
//                  $('#map-ui').appendTo($('.leaflet-top .leaflet-right')).append();
//         
//
// var svgContainer= d3.select(map.getPanes().overlayPane).append("svg");
//  var group= svgContainer.append("g").attr("class", "leaflet-zoom-hide");
//  var path = d3.geo.path().projection(project);  
//
//	// Add an SVG element to Leaflet’s overlay pane
//		var svg = d3.select(map.getPanes().overlayPane).append("svg"),
//			g = svg.append("g").attr("class", "leaflet-zoom-hide");
//                
//  function onEachFeature(feature, layer){
//    if (feature.properties) {
//        layer.bindPopup("<b>" + feature.properties.id + "</b> is " + feature.properties.name + "km long.");
//    }
//  }              
//  
//d3.json("park.json", function(topology) {
//    
//    //console.log(topology)
//      var collection2 = topojson.feature(topology, topology.objects.CreditRiverParks);//lhrp000b06a_EPSG3857);
//      var roadsTopoJSON = [collection2];
//      
//      console.log(roadsTopoJSON)
//      
//      var geojson_tj = L.geoJson(roadsTopoJSON, {
//          onEachFeature: onEachFeature
//      });
//    
//    map.addLayer(geojson_tj);
//    
//    
//    var feature;
//      setFeature();
//      //****
//      
//      var bounds = d3.geo.bounds(collection2);        
//        
//      reset();
//
//      map.on("viewreset", reset);
//      map.on("drag", reset);
//  
//      feature.on("mousedown",function(d){
//        var coordinates = d3.mouse(this);
//
//        //console.log(d,coordinates,map.layerPointToLatLng(coordinates))
//
//        L.popup()
//        .setLatLng(map.layerPointToLatLng(coordinates))
//        .setContent("<b>" + d.properties.id + "</b> is " + d.properties.name + "km long.")
//        .openOn(map);
//      });
//
//      var transition_destination = -1;
//      feature.on("mousemove",function(d){
//        d3.select(this).transition().duration(2500).ease('bounce')
//          .style("stroke","#0f0")
//          .attr("transform", "translate(0,"+transition_destination*50+")");
//        transition_destination=transition_destination*(-1);
//      }) 
//
//      function reset() {
//        bounds = [[map.getBounds()._southWest.lng, map.getBounds()._southWest.lat],[map.getBounds()._northEast.lng, map.getBounds()._northEast.lat]]
//        var bottomLeft = project(bounds[0]),
//            topRight = project(bounds[1]);
//
//        svgContainer.attr("width", topRight[0] - bottomLeft[0])
//            .attr("height", bottomLeft[1] - topRight[1])
//            .style("margin-left", bottomLeft[0] + "px")
//            .style("margin-top", topRight[1] + "px");
//
//        group.attr("transform", "translate(" + -bottomLeft[0] + "," + -topRight[1] + ")"); 
//
//        feature.attr("d", path);
//
//      }

//      //******Additional: hide/show overlay ******
//      var content = "hide overlay", color='#070';
//      svgContainer.append("text").text(content)
//          .attr("x", 50).attr("y", 50)
//          .style("font-size","30px").style("stroke",color)
//          .on("mouseover",function(d){
//              if(content=='hide overlay'){
//                content='show overlay';color='#f70'; 
//                group.selectAll('path').remove();
//              }
//              else {
//               content='hide overlay';color='#070';
//               setFeature();
//               reset();
//              }
//              d3.select(this).text(content).style("stroke",color)
//      });

//      //this is just a function from the existing code...as I need it to restore the removed paths
//      function setFeature(){
//        feature = group.selectAll("path")
//          .data(collection2.features)
//          .enter()
//          .append("path")
//          .attr("id","overlay");
//      }
//      //***************************
//      

//    
//    
//  var transform = d3.geo.transform({point: projectPoint}),
//      path = d3.geo.path().projection(transform);
//        svg.append('path')
//        .datum(topojson.feature(collection, collection.objects.lhrp000b06a_EPSG3857).features)
//        .attr('class', 'states') // defined in CSS
//        .attr('d', path);
//});


//
//function project(point) {
//    var latlng = new L.LatLng(point[1], point[0]);
//    var layerPoint = map.latLngToLayerPoint(latlng);
//    return [layerPoint.x, layerPoint.y];
//  }  
  
//    var svg = d3.select("body").append("svg")
//    .attr("width", width)
//    .attr("height", height);

//    queue()
//    .defer(d3.json, "lh-s.json")
//    .await(ready);
//
//    function ready(error, us) {
//      svg.append("g")
//      .attr("class", "canada")
//      .selectAll("path")
//      .data(topojson.feature(us, us.objects.lhrp000b06a_EPSG3857).features)
//      .enter().append("path")
//      .attr("class", "ontario")
//      .attr("data-id", function(d) {return d.properties.id; })
//      .attr("data-name", function(d) {return d.properties.name; })
//      .attr("d", path);
//    }
                
//			
//		d3.json("lh-s.json", function(geoShape) {
//		
//		//  create a d3.geo.path to convert GeoJSON to SVG
//		var transform = d3.geo.transform({point: projectPoint});
//                 alert(transform);
//            	var path = d3.geo.path().projection(transform);
// alert(path);
//		// create path elements for each of the features
//		d3_features = g.selectAll("path")
//			.data(geoShape.features)
//			.enter().append("path");
//alert(d3_features.length);
//		map.on("viewreset", reset);
//
//		reset();
//
//		// fit the SVG element to leaflet's map layer
//		function reset() {
//        
//			bounds = path.bounds(geoShape);
//
//			var topLeft = bounds[0],
//				bottomRight = bounds[1];
//
//			svg .attr("width", bottomRight[0] - topLeft[0])
//				.attr("height", bottomRight[1] - topLeft[1])
//				.style("left", topLeft[0] + "px")
//				.style("top", topLeft[1] + "px");
//
//			g .attr("transform", "translate(" + -topLeft[0] + "," 
//			                                  + -topLeft[1] + ")");
//
//			// initialize the path data	
//			d3_features.attr("d", path)
//				.style("fill-opacity", 0.7)
//				.attr('fill','blue');
//		} 
//
//		// Use Leaflet to implement a D3 geometric transformation.
//		function projectPoint(x, y) {
//			var point = map.latLngToLayerPoint(new L.LatLng(y, x));
//			this.stream.point(point.x, point.y);
//		}
//
//	});

        $(window).resize();
//   OSM.Index = function(map) {
//    var page = {};
//
//    page.pushstate = function() {
//      $("#content").addClass("overlay-sidebar");
//      map.invalidateSize({pan: false})
//        .panBy([-350, 0], {animate: false});
//      document.title = I18n.t('layouts.project_name.title');
//    };
//
//    page.load = function() {
//      if (!("autofocus" in document.createElement("input"))) {
//        $("#sidebar .search_form input[name=query]").focus();
//      }
//      return map.getState();
//    };
//
//    page.popstate = function() {
//      $("#content").addClass("overlay-sidebar");
//      map.invalidateSize({pan: false});
//      document.title = I18n.t('layouts.project_name.title');
//    };
//
//    page.unload = function() {
//      map.panBy([350, 0], {animate: false});
//      $("#content").removeClass("overlay-sidebar");
//      map.invalidateSize({pan: false});
//    };
//
//    return page;
//  };
//
//  OSM.Browse = function(map, type) {
//    var page = {};
//
//    page.pushstate = page.popstate = function(path, id) {
//      OSM.loadSidebarContent(path, function() {
//        addObject(type, id);
//      });
//    };
//
//    page.load = function(path, id) {
//      addObject(type, id, true);
//    };
//
//    function addObject(type, id, center) {
//      var bounds = map.addObject({type: type, id: parseInt(id)}, function(bounds) {
//        if (!window.location.hash && bounds.isValid()) {
//          OSM.router.moveListenerOff();
//          map.once('moveend', OSM.router.moveListenerOn);
//          if (center || !map.getBounds().contains(bounds)) map.fitBounds(bounds);
//        }
//      });
//    }
//
//    page.unload = function() {
//      map.removeObject();
//    };
//
//    return page;
//  };
//
//  var history = OSM.History(map);
//   
//   OSM.router = OSM.Router(map, {
//    "/":                           OSM.Index(map),
//    "/search":                     OSM.Search(map),
//    "/export":                     OSM.Export(map),
// //   "/note/new":                   OSM.NewNote(map),
//    "/history/friends":            history,
//    "/history/nearby":             history,
//    "/history":                    history,
//    "/user/:display_name/history": history,
////    "/note/:id":                   OSM.Note(map),
////    "/node/:id(/history)":         OSM.Browse(map, 'node'),
////    "/way/:id(/history)":          OSM.Browse(map, 'way'),
////    "/relation/:id(/history)":     OSM.Browse(map, 'relation'),
////    "/changeset/:id":              OSM.Browse(map, 'changeset')
//  });
//
////  if (OSM.preferred_editor == "remote" && document.location.pathname == "/edit") {
////    remoteEditHandler(map.getBounds(), params.object);
////    OSM.router.setCurrentPath("/");
////  }
//
//        OSM.router.load();

        $(".search_form").on("submit", function(e) {
            e.preventDefault();
//    $("header").addClass("closed");
            var query = $(this).find("input[name=query]").val();
            if (query) {

            alert("search?query=" + encodeURIComponent(query));
            
            var HOST_URL = 'http://open.mapquestapi.com';

            var SAMPLE_POST = HOST_URL + '/nominatim/v1/search.php?format=json';
            var searchType = '';
            var safe = SAMPLE_POST + "&q=43.779184567693,-79.298807618514";//westminster+abbey";
            alert(safe);
            $.ajax({
                url: safe,
                method: 'GET',
//                data: {
//                  zoom: map.getZoom(),
//                  minlon: map.getBounds().getWest(),
//                  minlat: map.getBounds().getSouth(),
//                  maxlon: map.getBounds().getEast(),
//                  maxlat: map.getBounds().getNorth()
//                },
                success: function(html) {
                    alert(html[0].display_name)
                //  alert(JSON.stringify(html));
                }
              });
//
//function showBasicSearchURL() {
//    var safe = SAMPLE_POST + "&q=westminster+abbey";
//    document.getElementById('divBasicSearchUrl').innerHTML = safe.replace(/</g, '&lt;').replace(/>/g, '&gt;');
//};
//
//function doBasicSearchClick() {
//	searchType = "helloworld";
//    var newURL = SAMPLE_POST + "&q=westminster+abbey";
//	var script = document.createElement('script');
//    script.type = 'text/javascript';
//    script.src = newURL;
//    document.body.appendChild(script);
//};
//
//function renderBasicSearchNarrative(response) {
//     var html = '';
//    var i = 0;
//    var j = 0;
//	
//	if(response){
//		html += '<table><tr><th colspan="5">Search Results</th></tr>'
//		html += '<tr><td><b>#</b></td><td><b>Type</b></td><td style="min-width:150px;"><b>Name</b></td><td><b>Lat/Long</b></td><td><b>Fields</b></td></tr>';
//		html += '<tbody>'
//		
//		for(var i =0; i < response.length; i++){
//			var result = response[i];
//			var resultNum = i+1;			
//			
//			html += "<tr valign=\"top\">";
//			html += "<td>" + resultNum + "</td>";
//			html += "<td>" + result.type + "</td>";
//			
//			html += "<td>";
//			if(result.display_name){
//				var new_display_name = result.display_name.replace(/,/g, ",<br />")
//				html += new_display_name;				
//			}
//			html += "</td>";
//			
//			html += "<td>" + result.lat + ", " + result.lon + "</td>";
//			
//			html += "<td>"
//			if(result){
//				for (var obj in result){
//					var f = result[obj];
//					html += "<b>" + obj + ":</b> " + f + "<br/>";					
//				}
//			}
//			html += "</td></tr>";
//		}		
//		html += '</tbody></table>';
//	}
//	
//    
//    switch (searchType) {
//		case "helloworld":
//			document.getElementById('divBasicSearchResults').style.display = "";
//			document.getElementById('divBasicSearchResults').innerHTML = html;
//			break;
//	}
//}
//
//function collapseResults(type) {
//	switch(type) {
//		case "helloworld":
//			document.getElementById('divBasicSearchResults').style.display = "none";
//			break;
//	}
//}
//      OSM.router.route("/search?query=" + encodeURIComponent(query) + OSM.formatHash(map));
        } else {
//      OSM.router.route("/" + OSM.formatHash(map));
}
});
        $(".sonata-bc .describe_location").on("click", function(e) {

            e.preventDefault();
//            alert(" map center=" + map.getCenter().lat + "  " + map.getCenter().lng);
        
            var HOST_URL = 'http://open.mapquestapi.com';
            var SAMPLE_POST = HOST_URL + '/nominatim/v1/search.php?format=json';
            var searchType = '';
            var safe = SAMPLE_POST + "&q="+map.getCenter().lat+","+map.getCenter().lng;//westminster+abbey";
//            alert(safe);
            $.ajax({
                url: safe,
                method: 'GET',
//                data: {
//                  zoom: map.getZoom(),
//                  minlon: map.getBounds().getWest(),
//                  minlat: map.getBounds().getSouth(),
//                  maxlon: map.getBounds().getEast(),
//                  maxlat: map.getBounds().getNorth()
//                },
                success: function(html) {
                    alert(html[0].display_name)
                //  alert(JSON.stringify(html));
                }
              });
        
        //       var precision = OSM.zoomPrecision(map.getZoom());

//        alert("/search?query=" + encodeURIComponent(
//          map.getCenter().lat.toFixed(precision) + "," +
//          map.getCenter().lng.toFixed(precision)));

//        OSM.router.route("/search?query=" + encodeURIComponent(
//          map.getCenter().lat.toFixed(precision) + "," +
//          map.getCenter().lng.toFixed(precision)));
//      });

       
    });
    $('.leaflet-control .control-button').tooltip({placement: 'left', container: 'body'});
};