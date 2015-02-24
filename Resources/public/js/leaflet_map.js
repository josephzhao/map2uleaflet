/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



OSM.SERVER_URL="localhost:8001/app.php"

window.onload = function () {
    var map;
    var leafletmap_tooltip;
    var layersControl;
    var leftSidebar;
    var historyControl;
    var printProvider,
            printControl;
alert(window.location.hash);
//    var mapapp;
//    var canvas;
//    var context;
//    var path;

    $(".navbar.navbar-fixed-top").resize(function () {
        // alert("qqq=" + $(".navbar.navbar-fixed-top").height());
        $("body.sonata-bc").css('top', $(".navbar.navbar-fixed-top").height());
    });

    $('#leafmap').height($(window).height() - 126);





    $(window).resize(function () { /* do something */

        $('#leafmap').height($(window).height() - 126);
//        $('#leafmap').css('height',$('#leafmap').height());
//        $('#leafmap').css('width',$('#leafmap').width());
        $('#map-ui').height($(window).height() - 126);
        // $('.leaflet-sidebar #sidebar-left').height($(window).height() - 146);
    });
    map = new L.MAP2U.Map('leafmap', {
        'zoomControl': false
    }).setView([43.73737, -79.95987], 10);

    this.map = map;


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
    //  var bing = new L.BingLayer("AqTGBsziZHIJYYxgivLBf0hVdrAk9mWO5cQcb8Yux8sW5M8c8opEC2lZqKR1ZZXf", {type: 'Road'});

    //   map.addLayer(bing);

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

    map.addLayer(mapnik);

    var subwatersheds = new L.TileLayer.WMS(
            "http://cobas.juturna.ca:8080/geoserver/juturna/wms",
            {
                layers: 'juturna:cvcsubwatersheds',
                format: 'image/png',
                transparent: true,
                srs: 'EPSG:4326',
                attribution: ""
            });

    //   map.addLayer(subwatersheds);

    map.baseLayers = [
        {'layer': mapnik, 'layerName': 'Open Street Map'},
        {'layer': Thunderforest_Transport, 'layerName': 'Thunderforest_Transport'},
        //       {'layer': bing, 'name': 'Bing'},
        {'layer': googleLayer_roadmap, 'layerName': 'Google Road Map'},
        {'layer': new L.Google('SATELLITE'), 'layerName': 'Google Satellite'},
        {'layer': new L.Google('HYBRID'), 'layerName': 'Google Hybrid'},
        {'layer': new L.Google('TERRAIN'), 'layerName': 'Google Terrain'}

    ];
    map.noteLayer = new L.FeatureGroup();
    map.noteLayer.options = {code: 'N'};
    //   map.dataLayers = //{'layer':creditriverparks, name:'Credit River Parks'}, {'layer':conservationareas, name:'Conservation'}, {'layer': subwatersheds, 'name': 'Subwatersheds'},
    //          [{'layer': subwatersheds, 'name': 'Subwatersheds'}];




    map.dataLayers = [];

    var index;
    var layers = [];
//
//
//var testlayer = new L.TileLayer.WMS(
//            "http://www.sig.mep.go.cr:8080/geoserver/mep/wms",
//            {
//                layers: 'CINDEA',
//                format: 'image/png',
//                transparent: true,
//                attribution: ""
//            });
//       testlayer.addTo(map);
//
//var testlayer2 = new L.TileLayer.WMS(
//            "http://www.sig.mep.go.cr:8080/geoserver/mep/wms",
//            {
//                layers: 'Escuelas_Nocturnas',
//                format: 'image/png',
//                transparent: true,
//                attribution: ""
//            });
//       testlayer2.addTo(map);

//       
//    

    // Create the print provider, subscribing to print events
    printProvider = L.print.provider({
        //    capabilities: printConfig,
        method: 'POST',
        dpi: 254,
        outputFormat: 'pdf',
        customParams: {
            mapTitle: 'Print Test',
            comment: 'Testing Leaflet printing'
        }
    });

    // Create a print control with the configured provider and add to the map
    printControl = L.control.print({
        provider: printProvider
    });

    map.addControl(printControl);


    var leftsidebarControl = L.Control.extend({
        options: {
            position: 'topleft'

        },
        onAdd: function (map) {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'leftsidebar-control');
            L.DomEvent
                    .addListener(container, 'click', L.DomEvent.stopPropagation)
                    .addListener(container, 'click', L.DomEvent.preventDefault)
                    .addListener(container, 'click', function () {
                        ShowLeftSideBar(leftSidebar);
                    });
            var controlUI = L.DomUtil.create('div', 'leftsidebar-close-control hidden noprint', container);
            controlUI.title = 'Show Left Side Bar';
            return container;
        }
    });

    map.addControl(new leftsidebarControl());
//var history = new L.HistoryControl().addTo(map);
    historyControl = new L.HistoryControl({position: 'topleft', useExternalControls: true});
    map.addControl(historyControl);

    this.historyControl = historyControl;
    historyControl.addTo(map);
    $(".leaflet-control-minimap").addClass("noprint");


//    var MapToolbarControl = L.Control.extend({
//        options: {
//            position: 'topright'
//
//        },
//        onAdd: function(map) {
//            // create the control container with a particular class name
//            var container = L.DomUtil.create('div', 'maptoolbar-control');
////            L.DomEvent
////                    .addListener(container, 'click', L.DomEvent.stopPropagation)
////                    .addListener(container, 'click', L.DomEvent.preventDefault)
////                    .addListener(container, 'click', function() {
////                        MapExtentReset(map);
////                    });
//            var controlUI = L.DomUtil.create('div', 'maptoolbar-control-reset', container);
//            L.DomEvent
//                    .addListener(controlUI, 'click', L.DomEvent.stopPropagation)
//                    .addListener(controlUI, 'click', L.DomEvent.preventDefault)
//                    .addListener(controlUI, 'click', function() {
//                        MapExtentReset(map);
//                    });
//            controlUI.title = I18n.t('Reset Map Extent');
//            var Prev_Extent = L.DomUtil.create('div', 'maptoolbar-control-prev', container);
//            
//           
//            L.DomEvent
//                    .addListener(Prev_Extent, 'click', L.DomEvent.stopPropagation)
//                    .addListener(Prev_Extent, 'click', L.DomEvent.preventDefault)
//                    .addListener(Prev_Extent, 'click', function() {
//                       // PrevMapExtent(map);
//                              historyControl.goBack();
//                    });
//            Prev_Extent.title = I18n.t('Prev Map Extent');
//            var Next_Extent = L.DomUtil.create('div', 'maptoolbar-control-next', container);
//            L.DomEvent
//                    .addListener(Next_Extent, 'click', L.DomEvent.stopPropagation)
//                    .addListener(Next_Extent, 'click', L.DomEvent.preventDefault)
//                    .addListener(Next_Extent, 'click', function() {
//                     //   NextMapExtent(map);
//                              historyControl.goForward();
//                    });
//            Next_Extent.title = I18n.t('Next Map Extent');
//            return container;
//        }
//    });
//
//    map.addControl(new MapToolbarControl());


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
    //  L.MAP2U.zoom({position: position}).addTo(map);

    var lc = L.control.locate({
        position: position,
        strings: {
            title: I18n.t('javascripts.map.locate.title'),
            popup: I18n.t('javascripts.map.locate.popup')
        }
    }).addTo(map);

    L.control.scale().addTo(map);
    this.lc = lc;

    mouseposition = L.control.mousePosition({'emptyString': '', 'position': 'bottomleft'}).addTo(map);

    leafletmap_tooltip = d3.select("#leafmap").append("div").attr("class", "leafmap_title_tooltip hidden");
    //  var map_tooltip = d3.select("#leafmap").append("div").attr("class", "leafmap_title_tooltip hidden");

    leftSidebar = L.control.sidebar('sidebar-left', {
        position: 'left'
    });
    map.addControl(leftSidebar);
    this.leftSidebar = leftSidebar;
    var rightSidebar = L.control.sidebar('sidebar-right', {
        position: 'right'
    });
    map.addControl(rightSidebar);

    this.rightSidebar = rightSidebar;

    layersControl = L.MAP2U.layers({
        position: position,
        map: map,
        map_tooltip: leafletmap_tooltip,
        layers: map.baseLayers,
        sidebar: rightSidebar
    });
    layersControl.addTo(map);
    this.layersControl = layersControl;

//    var mapToolbarControl = L.MAP2U.maptoolbar({
//        position: position,
//        map: map
//    });
//    mapToolbarControl.addTo(map);
//    this.mapToolbarControl = mapToolbarControl;


    L.MAP2U.uploadfile({position: position,
        sidebar: rightSidebar,
        'short': true
    }).addTo(map);

    L.MAP2U.uploadfile_list({position: position,
        sidebar: rightSidebar,
        'short': true
    }).addTo(map);
  L.MAP2U.business({position: position,
        sidebar: rightSidebar,
        'short': true
    }).addTo(map);
    L.MAP2U.graphchart({
        position: position,
        sidebar: rightSidebar,
        'short': true
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


    setTimeout(function () {
        leftSidebar.toggle();
    }, 500);

// if close left sidebar, then show sidebar controller icon
    $(".sonata-bc div.leaflet-sidebar.left a.close").click(function () {
        if ($(".leaflet-sidebar.left").css('left') === 0 || $(".leaflet-sidebar.left").css('left') === '0px') {
            $(".sonata-bc .leftsidebar-close-control").removeClass("hidden");
            $(".sonata-bc .leftsidebar-close-control").show();
        } else {

            $(".sonata-bc .leftsidebar-close-control").hide();
        }
    });



    $.ajax({
        url: Routing.generate('leaflet_userlayers', {'_locale': window.locale}),
        method: 'GET',
        beforeSend: function () {
            map.spin(true);
        },
        complete: function () {
            map.spin(false);
        },
        error: function () {
            map.spin(false);
        },
        success: function (response) {
            var result;
            if (typeof response !== 'object')
                result = JSON.parse(response);
            else
                result = response;

            //  alert(result.success===true);
            if (result.success === true && result.layers) {

                //    alert(JSON.stringify(result.layers));
                // alert(result.layers.length);

                var keys = Object.keys(result.layers).map(function (k) {

                    return k;
                });

                // alert(keys.length + "," + keys[0]);

                for (var k = 0; k < keys.length; k++)
                {
                    var layer = result.layers[keys[k]];
                    map.dataLayers[map.dataLayers.length] = {'map': map, 'layerType': layer.layerType, 'clusterLayer': layer.clusterLayer, 'defaultShowOnMap': layer.defaultShowOnMap, 'layer': null, 'minZoom': layer.minZoom, 'maxZoom': layer.maxZoom, 'index_id': k, 'srs': layer.srs, 'layerId': layer.id, layerTitle: layer.layerTitle, 'datasource': layer.datasource, 'sld': layer.sld, 'filename': layer.filename, 'layerName': layer.layerName, 'hostName': layer.hostName};
                }
                map.dataLayers[map.dataLayers.length] = {'map': map, 'layerType': 'userdraw', 'layer': null, 'index_id': -1, 'layerId': -1, layerTitle: "My draw geometries", 'filename': 'userdraw', 'layerName': 'My draw geometries', 'filename':'userdraw', type: 'geojson'};
            }
            else
                map.dataLayers[map.dataLayers.length] = {'map': map, 'layerType': 'userdraw', 'layer': null, 'index_id': -1, 'layerId': -1, layerTitle: "My draw geometries", 'filename': 'userdraw', 'layerName': 'My draw geometries', 'filename':'userdraw', type: 'geojson'};
            layersControl.refreshOverlays();
        }
    });



    $(window).resize();
    $(".navbar.navbar-fixed-top").resize();


    initMapDraw(map);
    maptoolbar_init(this);
    // control map_draw_select_pane defined in base.html.twig
    $(".sonata-bc div.close_map_draw_select_pane_button").click(function () {
        $(".sonata-bc div#map_draw_select_pane").hide();
    });
    $('.sonata-bc div#map_draw_select_pane').draggable({handle: '.header'});


    $(".sonata-bc div#map_draw_select_pane").on("drag", function (event, ui) {
        if (ui.position.left < 1)
            ui.position.left = 1;
        if (ui.position.top < 1)
            ui.position.top = 1;
        if ($(window).width() < ($(this).width() + ui.position.left + 5))
            ui.position.left = $(window).width() - $(this).width() - 5;
        if ((ui.position.top + $(this).height()) > ($(window).height() - 5))
            ui.position.top = $(window).height() - 5 - $(this).height();

        //  $("#mapping_system_status_id").html(ui.position.top + " , " + ui.position.left + "  ,  " + $(window).height() + "  ,  " + $(window).width() + "margin-bottom:" + $(this).css("margin-bottom"));
    });


//    $.ajax({
//        url: Routing.generate("default_heatmap_gradientform"),
//        method: 'GET',
//        success: function(html) {
//            $(".sidebar_feature_content").html(html);
//            heatmap_gradient_minicolors();
//            heatmap_gradient_submit()
//        }
//    });
    //   layersControl.createHeatMapLayer();
    $(".search_form").on("submit", function (e) {
        e.preventDefault();
//    $("header").addClass("closed");
        var query = $(this).find("input[name=query]").val();
        if (query !== undefined && query.trim() !== '') {
            var coordinate = query.split(",");

            if (coordinate.length === 2 && $.isNumeric(coordinate[0]) && $.isNumeric(coordinate[1]))
            {
                createSearchIcon(map, {lat: coordinate[0], lng: coordinate[1]});
                return;
            }
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({'address': query}, function (results, status) {


                if (status === google.maps.GeocoderStatus.OK)
                {
                    var pt = results[0].geometry.location;
                    var layers = map.drawnItems.getLayers();
                    for (var i = layers.length - 1; i >= 0; i--) {
                        if (layers[i].source !== undefined && layers[i].source === 'searchbox_query') {
                            map.drawnItems.removeLayer(layers[i]);
                        }
                    }

                    var feature = L.marker([pt.lat(), pt.lng()]);
                    feature.bindLabel(results[0].formatted_address);
                    feature.id = 0;
                    feature.name = results[0].formatted_address;
                    feature.index = map.drawnItems.getLayers().length;
                    feature.type = 'marker';
                    feature.source = 'searchbox_query';
                    feature.on('click', function (e) {

                        if (map.drawControl._toolbars.edit._activeMode === null) {



                        }
                        else if (map.drawControl._toolbars.edit._activeMode && map.drawControl._toolbars.edit._activeMode.handler.type === 'edit') {

                            var radius = 0;

                            $.ajax({
                                url: Routing.generate('draw_' + e.target.type, {'_locale': window.locale}),
                                method: 'GET',
                                data: {
                                    id: e.target.id,
                                    name: e.target.name,
                                    radius: radius,
                                    index: e.target.index
                                },
                                success: function (response) {
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
                        }
                        ;


                    });

                    map.drawnItems.addLayer(feature);
                    if (pt !== undefined && pt.lat !== undefined && pt.lng !== undefined)
                        //      map.panTo(new L.LatLng(pt.lat(), pt.lng()));
                        map.setView(new L.LatLng(pt.lat(), pt.lng()), 14);

                }
                ;

            });
        } else {
            alert("search can not be empty!");
//      OSM.router.route("/" + OSM.formatHash(map));
        }
    });
    $(".sonata-bc .describe_location").on("click", function (e) {

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
            success: function (html) {
                alert(html[0].display_name)
                //  alert(JSON.stringify(html));
            }
        });




    });
    $('.leaflet-control .control-button').tooltip({placement: 'left', container: 'body'});
//    L.MarkerClusterGroup.prototype.bringToFront = function() {
//        var pane = this._map._panes.overlayPane;
//
//        if (this._container) {
//            pane.appendChild(this._container);
//            this._setAutoZIndex(pane, Math.max);
//        }
//
//        return this;
//    };

};

function createSearchIcon(map, opt) {

    var layers = map.drawnItems.getLayers();
    for (var i = layers.length - 1; i >= 0; i--) {
        if (layers[i].source !== undefined && layers[i].source === 'searchbox_query') {
            map.drawnItems.removeLayer(layers[i]);
        }
    }

    var feature = L.marker([opt.lat, opt.lng]);
    feature.bindLabel(opt.lat + "," + opt.lng);
    feature.id = 0;
    feature.name = "Searched Icon";
    feature.index = map.drawnItems.getLayers().length;
    feature.type = 'marker';
    feature.source = 'searchbox_query';
    feature.on('click', function (e) {
        if (map.drawControl._toolbars.edit._activeMode === null) {



        }
        else if (map.drawControl._toolbars.edit._activeMode && map.drawControl._toolbars.edit._activeMode.handler.type === 'edit') {

            var radius = 0;

            $.ajax({
                url: Routing.generate('draw_' + e.target.type, {'_locale': window.locale}),
                method: 'GET',
                data: {
                    id: e.target.id,
                    name: e.target.name,
                    radius: radius,
                    index: e.target.index
                },
                success: function (response) {
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
        }
        ;
    });

    map.drawnItems.addLayer(feature);

}

function saveuserdraw() {
    for (var i = 0; i < map.drawlayer._originalPoints.length; i++) {
        //  layer._originalPoints.each(function(point) {
        alert(map.drawlayer._originalPoints[i]);
        var position = map.containerPointToLatLng(layer._originalPoints[i]);
        alert("Lat, Lon : " + position.lng.toFixed(3) + "," + position.lat.toFixed(3));
    }
}


function ShowLeftSideBar(leftSidebar) {
    if ($(".leaflet-sidebar.left").css('left') === 0 || $(".leaflet-sidebar.left").css('left') === '0px') {

        $(".sonata-bc .leftsidebar-close-control").show();
        setTimeout(function () {
            leftSidebar.hide();
        }, 500);
    } else {

        $(".sonata-bc .leftsidebar-close-control").hide();
        setTimeout(function () {
            $('#sidebar-left #sidebar_content').css('visibility', 'visible');
            leftSidebar.show();
        }, 500);
    }
}
