/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var mapapp;


var map;
var leafletmap_tooltip;

var spinner;
var spinner_target;

var canvas;

var context;

var path;
var layersControl;
var leftSidebar;




(function() {
    var loaderTimeout;
    var mouseposition;
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

    $(".navbar.navbar-fixed-top").resize(function() {
        // alert("qqq=" + $(".navbar.navbar-fixed-top").height());
        $("body.sonata-bc").css('top', $(".navbar.navbar-fixed-top").height());
    });

    $('#leafmap').height($(window).height() - 126);




    spinner_target = document.getElementById('leafmap');
    spinner = new Spinner();

    $(window).resize(function() { /* do something */

        $('#leafmap').height($(window).height() - 126);
        $('#map-ui').height($(window).height() - 126);
        $('.leaflet-sidebar #sidebar-left').height($(window).height() - 186);
    });
    map = new L.MAP2U.Map('leafmap', {
        'zoomControl': false
    }).setView([43.73737, -79.95987], 10);


//canvas = d3.select(map.getPanes().overlayPane).append("canvas")
//    .attr("width", $('#leafmap').width())
//    .attr("height", $('#leafmap').height());
//
// context = canvas.node().getContext("2d");
//
// path = d3.geo.path()
//    .projection(simplify)
//    .context(context);

    //add a tile layer to add to our map, in this case it's the 'standard' OpenStreetMap.org tile server
    var mapnik = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
        maxZoom: 18
    });

    var googleLayer_satellite = new L.Google('SATELLITE', {attribution: ""});
    var googleLayer_roadmap = new L.Google('ROADMAP', {attribution: ""});
    var googleLayer_hybrid = new L.Google('HYBRID', {attribution: ""});
    var googleLayer_terrain = new L.Google('TERRAIN', {attribution: ""});
    var bingkey = 'Ahxau5mtl944aCyAb8tfmrLebWENWZDXEmMIQWRaRQjTho2U0NkHqAUpcT1nTW1v';
    var BingAttribution = '';
    var bing = new L.BingLayer("AqTGBsziZHIJYYxgivLBf0hVdrAk9mWO5cQcb8Yux8sW5M8c8opEC2lZqKR1ZZXf", {type: 'Road'});

    map.addLayer(bing);

    var Thunderforest_Transport = L.tileLayer('http://{s}.tile2.opencyclemap.org/transport/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.opencyclemap.org">OpenCycleMap</a>, &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
    });

//    var tiles = new L.TileLayer.Canvas();
//
//    map.addLayer(tiles);

//
//var BingRoad = new L.TileLayer.Bing(bingkey, "Road",
//                    {
//                        maxZoom: 21,
//                        attribution: BingAttribution
//                    });
//
//            var BingAerial = new L.TileLayer.Bing(bingkey, "Aerial",
//                    {
//                        maxZoom: 21,
//                        attribution: BingAttribution
//                    });
//
//            var BingAerialWithLabels = new L.TileLayer.Bing(bingkey, "AerialWithLabels",
//                    {
//                        maxZoom: 21,
//                        attribution: BingAttribution
//                    });
//
//    var baseMaps = {
//                "BingRoads": BingRoad,
//                "BingAerial": BingAerial,
//                "BingAerialWithLabels": BingAerialWithLabels
//            };

//    var bing = new L.BingLayer('');
//    map.addLayer(bing);
//    
    var mapnik_minimap = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
        maxZoom: 18
    });
    var miniMap = new L.Control.MiniMap(mapnik_minimap, {position: 'bottomright', width: 150, height: 150, zoomLevelOffset: -4, zoomAnimation: false, toggleDisplay: true, autoToggleDisplay: false}).addTo(map);

    // map.addLayer(mapnik);

    var subwatersheds = new L.TileLayer.WMS(
            "http://cobas.juturna.ca:8080/geoserver/juturna/wms",
            {
                layers: 'juturna:cvcsubwatersheds',
                format: 'image/png',
                transparent: true,
                srs: 'EPSG:4326',
                attribution: ""
            });

    map.addLayer(subwatersheds);

    map.baseLayers = [
        {'layer': mapnik, 'name': 'Open Street Map'},
        {'layer': Thunderforest_Transport, 'name': 'Thunderforest_Transport'},
        {'layer': bing, 'name': 'Bing'},
        {'layer': googleLayer_roadmap, 'name': 'Google Road Map'},
        {'layer': new L.Google('SATELLITE'), 'name': 'Google Satellite'},
        {'layer': new L.Google('HYBRID'), 'name': 'Google Hybrid'},
        {'layer': new L.Google('TERRAIN'), 'name': 'Google Terrain'}

    ];
    map.noteLayer = new L.FeatureGroup();
    map.noteLayer.options = {code: 'N'};
    map.dataLayers = //{'layer':creditriverparks, name:'Credit River Parks'}, {'layer':conservationareas, name:'Conservation'}, {'layer': subwatersheds, 'name': 'Subwatersheds'},
            [{'layer': subwatersheds, 'name': 'Subwatersheds'}];



    var index;
    var layers = [];



//       
//    
    var leftsidebarControl = L.Control.extend({
        options: {
            position: 'topleft'

        },
        onAdd: function(map) {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'leftsidebar-control');
            L.DomEvent
                    .addListener(container, 'click', L.DomEvent.stopPropagation)
                    .addListener(container, 'click', L.DomEvent.preventDefault)
                    .addListener(container, 'click', function() {
                        ShowLeftSideBar();
                    });
            var controlUI = L.DomUtil.create('div', 'leftsidebar-close-control hidden', container);
            controlUI.title = 'Show Left Side Bar';
            return container;
        }
    });

    map.addControl(new leftsidebarControl());


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
    mouseposition = L.control.mousePosition({'emptyString': '', 'position': 'bottomleft'}).addTo(map);

    leftSidebar = L.control.sidebar('sidebar-left', {
        position: 'left'
    });
    map.addControl(leftSidebar);

    var rightSidebar = L.control.sidebar('sidebar-right', {
        position: 'right'
    });
    map.addControl(rightSidebar);



    layersControl = L.MAP2U.layers({
        position: position,
        layers: map.baseLayers,
        sidebar: rightSidebar
    });
    layersControl.addTo(map);

    L.MAP2U.shapefile_upload({position: position,
        sidebar: rightSidebar,
        'short': true
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
    map.drawnItems = drawnItems;
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
                },
                allowIntersection: false
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

    map.drawControl = drawControl;
    map.addControl(drawControl);

    map.on('draw:created', function(e) {
        var type = e.layerType,
                layer = e.layer;
        layer.id = 0;
        layer.type = type;

        var radius = 0;
        drawnItems.addLayer(layer);
        layer.index = drawnItems.getLayers().length - 1;

        if (type === 'circle')
        {
            radius = layer._mRadius.toFixed(0);
        }

        //   alert(JSON.stringify(layer.toGeoJSON()));
        layer.on('mousedown', function(e) {
            if (e.originalEvent.button === 2)
            {
                var radius = 0;
                if (e.target.type === 'circle')
                {
                    radius = e.target._mRadius;
                }
                $.ajax({
                    url: Routing.generate('draw_' + e.target.type),
                    method: 'GET',
                    data: {
                        id: e.target.id,
                        name: e.target.name,
                        radius: radius,
                        index: e.target.index
                    },
                    success: function(response) {
                        if ($('body.sonata-bc #ajax-dialog').length === 0) {
                            $('<div class="modal fade" id="ajax-dialog" role="dialog"></div>').appendTo('body');
                        } else {
                            $('body.sonata-bc #ajax-dialog').html('');
                        }

                        $(response).appendTo($('body.sonata-bc #ajax-dialog'));
                        $('#ajax-dialog').modal({show: true});
                        $('#ajax-dialog').draggable();
                        //  alert(JSON.stringify(html));
                    }
                });
            } else {
                if (e.originalEvent.button === 0) {
                    var highlight = {
                        'color': '#333333',
                        'weight': 2,
                        'opacity': 1
                    };

                    if (feature.selected === false || feature.selected === undefined) {
                        feature.setStyle(highlight);
                        feature.selected = true;
                        var selectBoxOption = document.createElement("option");//create new option 
                        selectBoxOption.value = feature.id;//set option value 
                        selectBoxOption.text = feature.name;//set option display text 
                        document.getElementById('geometries_selected').add(selectBoxOption, null);
                    }
                    else
                    {

                        feature.setStyle({
                            'color': "blue",
                            'weight': 5,
                            'opacity': 0.6
                        });
                        feature.selected = false;
                        $("#geometries_selected option[value='" + feature.id + "']").each(function() {
                            $(this).remove();
                        });
                    }
                }
            }
        });



        if ($('body.sonata-bc #ajax-dialog').length === 0) {
            $('<div class="modal fade" id="ajax-dialog" role="dialog"></div>').appendTo('body');
        } else {
            $('body.sonata-bc #ajax-dialog').html('');
        }


        $.ajax({
            url: Routing.generate('draw_' + layer.type),
            method: 'GET',
            data: {
                id: 0,
                name: layer.name,
                radius: radius,
                index: layer.index
            },
            success: function(response) {
                $(response).appendTo($('body.sonata-bc #ajax-dialog'));

                $('#ajax-dialog').modal({show: true});
                $('#ajax-dialog').draggable();
                //  alert(JSON.stringify(html));
            }
        });

        $('#ajax-dialog').on('hidden.bs.modal', function(e) {
            // do something...
            //   alert(drawnItems.getLayers()[drawnItems.getLayers().length - 1].id);

            if (drawnItems.getLayers()[drawnItems.getLayers().length - 1].id === 0)
            {
                drawnItems.removeLayer(drawnItems.getLayers()[drawnItems.getLayers().length - 1]);
            }
            $('#ajax-dialog').remove();
        });


        $('#ajax-dialog').on('hide.bs.modal', function(e) {

        });
        if (type === 'marker') {
            // Do marker specific actions
        }
//var item=drawnItems.getLayers();
//var itemgeojson=item[0].toGeoJSON();
//itemgeojson.properties.id=layer.id;
//itemgeojson.properties.name=layer.name;
//alert(layer._mRadius);
//
//alert(JSON.stringify(itemgeojson));
//alert(JSON.stringify(layer));
        // Do whatever else you need to. (save to db, add to map etc)
        // map.addLayer(layer);
    });


    map.on('draw:edited', function(e) {
        var layers = e.layers;

        layers.eachLayer(function(layer) {
            if (layer.label)
                layer.label.setLatLng(layer.getBounds().getCenter());
            if (layer instanceof L.Marker) {
                //Do marker specific actions here
            }
        });
    });

    map.on('draw:deleted', function(e) {
        var layers = e.layers;

        layers.eachLayer(function(layer) {

        });
    });

    setTimeout(function() {
        leftSidebar.toggle();
    }, 500);

// if close left sidebar, then show sidebar controller icon
    $(".sonata-bc div.leaflet-sidebar.left a.close").click(function() {
        if ($(".leaflet-sidebar.left").css('left') === 0 || $(".leaflet-sidebar.left").css('left') === '0px') {
            $(".sonata-bc .leftsidebar-close-control").removeClass("hidden");
            $(".sonata-bc .leftsidebar-close-control").show();
        } else {

            $(".sonata-bc .leftsidebar-close-control").hide();
        }
    });

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
//
//    map.on('draw:created', function(e) {
//        var type = e.layerType,
//                layer = e.layer;
//        if (type === 'marker') {
//            layer.bindPopup('A popup!');
//        }
//
//        drawnItems.addLayer(layer);
//    });

    var overlays = {};
    var geojson_tj;
//         L.TopoJSON = L.GeoJSON.extend({
//  addData: function(jsonData) {    
//    if (jsonData.type === "Topology") {
//      for (key in jsonData.objects) {
//        geojson = topojson.feature(jsonData, jsonData.objects[key]);
//        L.GeoJSON.prototype.addData.call(this, geojson);
//      }
//    }    
//    else {
//      L.GeoJSON.prototype.addData.call(this, jsonData);
//    }
//  }  
//});
//         
//         
//    var projection = d3.geo.mercator()
//            .center([-22, 64])
//            .scale(99999);
//
//    var path = d3.geo.path()
//            .projection(projection);
//
////    var color = d3.scale.linear()
////        .domain([0,900,1100])
////        .range(["green","yellow","white"]);
//    var color = d3.scale.ordinal()
//            .domain(d3.range(23).reverse())
//            .range(["#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#253494", "#081d58", "#fff0d9", "#edf0b1", "#c7e0b4", "#7fcd0b", "#41b0c4", "#1d90c0", "#2250a8", "#253404", "#081058", "#41b004", "#1090c0", "#2050a8", "#203404", "#080058"]);
////
//var offsetL = document.getElementById('leafmap').offsetLeft+30;
//var offsetT =document.getElementById('leafmap').offsetTop-30;



    function getColor(d) {

        return d > 23 ? "#FFEDA0" :
                d > 22 ? "#A3C9A9" :
                d > 21 ? "#BFD0EB" :
                d > 20 ? "#DADEB2" :
                d > 19 ? "#B1B6DE" :
                d > 18 ? "#C9DFDF" :
                d > 17 ? "#B3D3D0" :
                d > 16 ? "#C4E7C3" :
                d > 15 ? "#B1C2D0" :
                d > 14 ? "#BCD1BF" :
                d > 13 ? "#C7D3B3" :
                d > 12 ? "#D2D9B2" :
                d > 11 ? "#DEEDC6" :
                d > 10 ? "#B3B3D3" :
                d > 9 ? "#D2E9D5" :
                d > 8 ? "#CAECE4" :
                d > 7 ? "#C1DEC6" :
                d > 6 ? '#D6D6BA' :
                d > 5 ? '#A7B4CF' :
                d > 4 ? '#B5C4CE' :
                d > 3 ? '#A3C9A9' :
                d > 2 ? '#C4C2DC' :
                d > 1 ? '#C6DFB6' :
                '#DFE9CF';
    }
//    var svgContainer = d3.select(map.getPanes().overlayPane).append("svg"),
//            group = svgContainer.append("g").attr("class", "leaflet-zoom-hide");
    leafletmap_tooltip = d3.select("#leafmap").append("div").attr("class", "leafmap_title_tooltip hidden");
//
//leaflet-popup-pane
//
//    function style(feature) {
//        return {
//            fillColor: getColor(feature.properties.id),
//            weight: 1,
//            opacity: 1,
//            color: 'blue',
//            //  dashArray: '3',
//            fillOpacity: 0.8
//        };
//    }
//
//    function highlightFeature(e) {
//        var layer = e.target;
//
//
//
//        layer.setStyle({
//            weight: 5,
//            color: '#666',
//            dashArray: '',
//            fillOpacity: 0.7
//        });
//
//        if (!L.Browser.ie && !L.Browser.opera) {
//            layer.bringToFront();
//        }
//
//
//        //   var cp = d3.mouse(this);
////     var mouse = d3.mouse(svgContainer.node()).map( function(d) { return parseInt(d); } );
//
//
//
//        // Create a popup with a unique ID linked to this record
//        var popup = $("<div></div>", {
//            id: "popup-" + layer.feature.properties.id,
//            css: {
//                position: "absolute",
//                top: "5px",
//                left: "360px",
//                zIndex: 1002,
//                backgroundColor: "white",
//                padding: "5px",
//                border: "1px solid #ccc"
//            }
//        });
//        // Insert a headline into that popup
//        var hed = $("<div></div>", {
//            text: "Subwatershed: " + layer.feature.properties.id + "  " + layer.feature.properties.subws_name,
//            css: {fontSize: "12px", marginBottom: "0px"}
//        }).appendTo(popup);
//        // Add the popup to the map
//        popup.appendTo("#leafmap");
//
//
//
//    }
//
//    function resetHighlight(e) {
//        geojson_tj.resetStyle(e.target);
//        var layer = e.target;
//        $("#popup-" + layer.feature.properties.id).remove();
//
//        tooltip.classed("hidden", true);
//    }
//
//    function zoomToFeature(e) {
//        map.fitBounds(e.target.getBounds());
//    }
//    function featuretip(e)
//    {
//        var layer = e.target;
//        var viewbox = $('svg.leaflet-zoom-animated').offset();
//        //  alert(viewbox);
//        var mouse = layer.latLngToPoint(e.latlng);
//        //  var mouse=map.latLngToPoint(e.latlng);
//        //   alert(mouse.x);
//        //   alert(L.DomUtil.getViewportOffset(layer));
//
//        tooltip.classed("hidden", false)
//                .attr("style", "left:" + (mouse.x + 30) + "px;top:" + (mouse.y - 30) + "px")
//                .html(mouse.x + "  " + mouse.y + "  " + viewbox.left + "  " + viewbox.top);
//
////    .html(layer.feature.properties.subws_name + "  " + viewbox.left + "  " + viewbox.top);
//    }
//    function onEachFeature(feature, layer) {
//
//        layer.on({
//            mouseover: highlightFeature,
//            mouseout: resetHighlight,
//            mousemove: featuretip,
//            click: zoomToFeature
//        });
//    }
//
//
//    var zoom = d3.behavior.zoom()
//            .on("zoom", function() {
//                group.attr("transform", "translate(" + d3.event.translate.join(",") + ")scale(" + d3.event.scale + ")");
//            });
//
//    svgContainer.call(zoom);

//var loading = group.append("text").attr({x:500,y:250}).text("Loading");

    //  d3.json("subwatersheds.json", function(error, geoShape) {
//  d3.json("lhrp_100.json", function(error, geoShape) {
//
//        //console.log(topology)
//        //   var collection2 = topojson.feature(geoShape, geoShape.objects.lhrp_100);//lhrp000b06a_EPSG3857);
//        var collection2 = topojson.feature(geoShape, geoShape.objects.lhrp_100);//lhrp000b06a_EPSG3857);
//        var roadsTopoJSON = [collection2];
//
//        console.log(roadsTopoJSON);
//        // alert("addlay1=" + JSON.stringify(collection2));
//
//        var geojson_tj = new L.D3geoJSON(collection2, {
//            id: 'svg-subwatersheds',
//            featureAttributes: {
//                'class': function(feature) {
//                    return 'default_fcls subws_' + feature.properties.id;
//
////						return JSON.stringify(style(feature)).replace('"',"");
////                    return 'fillColor:' + getColor(feature.properties.id)
////                        + ';weight: 1'
////                        + ';opacity: 1'
////                        + ';color: blue'
////                        //  dashArray: '3',
////                        +';fillOpacity: 0.8';
//
//                }//,
////                'style': function(feature) {
////                    return "fill:'"+ getColor(feature.properties.id) + "'";
////                }
//            }
//        }).addTo(map);
//
//        geojson_tj.on('click', function(e) {
//            // alert($('.leaflet-sidebar.left').offset().left);
//
//            var mouse = d3.mouse(e.element);
//            //   alert($('.leaflet-sidebar #sidebar-left #sidebar_content'));
//            //   alert($('.leaflet-sidebar #sidebar-left #sidebar_content').length);
//            if ($('.leaflet-sidebar.left').offset().left === -350)
//            {
//                setTimeout(function() {
//                    leftSidebar.toggle();
//                }, 500);
//            }
//            if ($('#subwatershed_showsidebarinfo_id').length) {
//                // do something
//                //   alert('subwatershed_showsidebarinfo_id exist');
//                $('#subwatershed_showsidebarinfo_id').html("<div id='subwatershed_showsidebarinfo_id'><h4>" + e.data.properties.subws_name + ':</h4><p>More info about this subwatersshed will come here</p></div>');
//            }
//            else
//            {
//                $('.leaflet-sidebar #sidebar-left #sidebar_content').prepend("<div id='subwatershed_showsidebarinfo_id'><h4>" + e.data.properties.subws_name + ':</h4><p>More info about this subwatersshed will come here</p></div>');
//                //   $("#mydiv div:first-child").after(newDiv);
//                //   alert(e.data.properties.id + ":" + e.data.properties.subws_name);
//            }
//            console.log(e);
//        });
//
//        geojson_tj.on("mouseover", function(e) {
//          
//
//            // Create a popup with a unique ID linked to this record
//            var popup = $("<div></div>", {
//                id: "popup-" + e.data.properties.id,
//                css: {
//                    position: "absolute",
//                    top: "5px",
//                    left: "360px",
//                    zIndex: 1002,
//                    backgroundColor: "white",
//                    padding: "5px",
//                    border: "1px solid #ccc"
//                }
//            });
//            // Insert a headline into that popup
//            var hed = $("<div></div>", {
//                text: "Subwatershed: "  + e.data.properties.subws_name,
//                css: {fontSize: "12px", marginBottom: "0px"}
//            }).appendTo(popup);
//            // Add the popup to the map
//            popup.appendTo("#leafmap");
//
//            d3.select(e.element).style("fill", "gray");
//        });
//        geojson_tj.on('mousemove', function(e) {
//           
//            var mouse=L.DomEvent.getMousePosition(e.originalEvent, map._container);
//
//            tooltip.classed("hidden", false)
//                    .attr("style", "left:" + (mouse.x + 30) + "px;top:" + (mouse.y - 30) + "px")
//                    .html( e.data.properties.subws_name);
//
//        });
//        geojson_tj.on('mouseout', function(e) {
//            $("#popup-" + e.data.properties.id).remove();
//            //     geojson_tj.resetStyle(e.element);
//            d3.select(e.element).style("fill", getColor(e.data.properties.id));
//            tooltip.classed("hidden", true);
//            console.log(e);
//        });
//

//     geojson_tj = L.geoJson(collection2,{style: style,onEachFeature: onEachFeature});
//  //  alert("addlayer");
//    map.addLayer(geojson_tj);
//    

//        var feature;
    //  alert("reset00");
    //  setFeature();
    //****
    //    alert("reset0");
    //       var bounds = d3.geo.bounds(collection2);

    //    reset();
//alert("reset1");
    //     map.on("viewreset", reset);
    //  alert("reset2");
    //     map.on("drag", reset);
    //alert("reset3");
//      feature.on("mousedown",function(d){
//        var coordinates = d3.mouse(this);
//
//        //console.log(d,coordinates,map.layerPointToLatLng(coordinates))
//
//        L.popup()
//        .setLatLng(map.layerPointToLatLng(coordinates))
//        .setContent("<b>" +  "</b> is " +  "km long.")
//        .openOn(map);
//      });

//      var transition_destination = -1;
//      feature.on("mousemove",function(d){
//        d3.select(this).transition().duration(2500).ease('bounce')
//            .style("stroke","#0f0")
//            .style("fill","#f00")
//     //   .style("fill", function(d) { return color(Math.min(23, d.properties.id)); })
//          .attr("transform", "translate(0,"+transition_destination*50+")");
//        transition_destination=transition_destination*(-1);
//      }) ;

//      function reset(){
//          
//        bounds = [[map.getBounds()._southWest.lng, map.getBounds()._southWest.lat],[map.getBounds()._northEast.lng, map.getBounds()._northEast.lat]];
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
//      };

////      //******Additional: hide/show overlay ******
////      var content = "hide overlay", color='#070';
////      svgContainer.append("text").text(content)
////          .attr("x", 50).attr("y", 50)
////          .style("font-size","30px").style("stroke",color)
////          .on("mouseover",function(d){
////              if(content=='hide overlay'){
////                content='show overlay';color='#f70'; 
////                group.selectAll('path').remove();
////              }
////              else {
////               content='hide overlay';color='#070';
////               setFeature();
////               reset();
////              }
////              d3.select(this).text(content).style("stroke",color)
////      });

    //this is just a function from the existing code...as I need it to restore the removed paths
//      function setFeature(){
//        feature = group.selectAll("path")
//          .data(collection2.features)
//          .enter()
//          .append("path")
//          .attr("class", function(d) { return "subws_" + d.properties.id; })
//         
//          .attr("d", path)
//          .attr("id","overlay");
//  //alert("setfeature");
//      }
    //***************************

    //   Use Leaflet to implement a D3 geographic projection.
//  function project(x) {
//      
//    var point = map.latLngToLayerPoint(new L.LatLng(x[1], x[0]));
//    return [point.x, point.y];
//  }  
//        







    //  });


    $(window).resize();
    $(".navbar.navbar-fixed-top").resize();
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
        var safe = SAMPLE_POST + "&q=" + map.getCenter().lat + "," + map.getCenter().lng;//westminster+abbey";
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


function saveuserdraw() {
    for (var i = 0; i < map.drawlayer._originalPoints.length; i++) {
        //  layer._originalPoints.each(function(point) {
        alert(map.drawlayer._originalPoints[i]);
        var position = map.containerPointToLatLng(layer._originalPoints[i]);
        alert("Lat, Lon : " + position.lng.toFixed(3) + "," + position.lat.toFixed(3));
    }
}


function ShowLeftSideBar() {
    if ($(".leaflet-sidebar.left").css('left') === 0 || $(".leaflet-sidebar.left").css('left') === '0px') {

        $(".sonata-bc .leftsidebar-close-control").show();
    } else {

        $(".sonata-bc .leftsidebar-close-control").hide();
    }

    setTimeout(function() {
        leftSidebar.toggle();
    }, 500);

}