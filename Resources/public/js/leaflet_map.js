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
                    "trail3_clip": "Trail Clip",
                    "trail": "Trail",
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
//            });          
        var layernames = ['trail', 'credit_river',
                'credit_river_head_waters',
                'credit_valley_conservation',
                'creditriverheadwaters',
                'creditvalleyprovincialpark',
                'creditvalleytrails',
                'peel_community_centres',
                'peel_golf_courses',
                'peel_parks',
                'peel_playground_pools',
                'peel_region_trails',
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
//                  alert("1="+$('.leaflet-top leaflet-right'));
//                  alert("2="+$('.leaflet-top .leaflet-right'));
//                  alert("3="+$('.leaflet-control-container .leaflet-top .leaflet-right'));
//                  
//                  $('#map-ui').appendTo($('.leaflet-top .leaflet-right')).append();
//               
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