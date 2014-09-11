


L.MAP2U.layers = function(options) {
    var control = L.control(options);
    control.onAdd = function(map) {
        var layers = options.layers;
        this._map = map;
        var $container = $('<div>')
                .attr('class', 'control-layers');
        var button = $('<a>')
                .attr('class', 'control-button')
                .attr('href', '#')
                .attr('title', I18n.t('javascripts.map.layers.title'))
                .html('<span class="icon layers"></span>')
                .on('click', toggle)
                .appendTo($container);
        var $ui = $('<div>')
                .attr('class', 'layers-ui');
        $('<div>')
                .attr('class', 'sidebar_heading')
                .appendTo($ui)
                .append(
                        $('<h4>')
                        .text(I18n.t('javascripts.map.layers.header')));
        var ActiveLayerLabel = $('<label>')
                .appendTo($ui);
        ActiveLayerLabel.append("Active Layer");
        var activeLayerSelect = $('<select id="activelayer_id" class="layers-ui" style="margin-left:4px;width:155px;"></select>').appendTo($ui);
        activeLayerSelect.on('change', function() {
            control.setActiveLayer(map.dataLayers, this.value);
        });
        var barContent = $('<div>')
                .attr('class', 'sidebar_content')
                .appendTo($ui);
        var baseSection = $('<div>')
                .attr('class', 'section')
                .appendTo(barContent);
        $('<p>')
                .text(I18n.t('javascripts.map.layers.baselayers'))
                .attr("class", "deemphasize")
                .appendTo(baseSection);
        list = $('<ul>')
                .appendTo(baseSection);
        layers.forEach(function(layer) {
            var item = $('<li>')
                    .appendTo(list);
            if (map.hasLayer(layer.layer)) {
                item.addClass('active');
            }

//      var div = $('<div>')
//        .appendTo(item);

//      map.whenReady(function() {
//        var miniMap = L.map(div[0], {attributionControl: false, zoomControl: false})
//          .addLayer(new layer.constructor());
//
//        miniMap.dragging.disable();
//        miniMap.touchZoom.disable();
//        miniMap.doubleClickZoom.disable();
//        miniMap.scrollWheelZoom.disable();
//
//        $ui
//          .on('show', shown)
//          .on('hide', hide);
//
//        function shown() {
//          miniMap.invalidateSize();
//          setView({animate: false});
//          map.on('moveend', moved);
//        }
//
//        function hide() {
//          map.off('moveend', moved);
//        }
//
//        function moved() {
//          setView();
//        }
//
//        function setView(options) {
//          miniMap.setView(map.getCenter(), Math.max(map.getZoom() - 2, 0), options);
//        }
//      });

            var label = $('<label>')
                    .appendTo(item);
            var input = $('<input>')
                    .attr('type', 'radio')
                    .prop('checked', map.hasLayer(layer.layer))
                    .appendTo(label);
            label.append(layer.name);
            item.on('click', function() {
                layers.forEach(function(other) {
                    if (other.layer === layer.layer) {
                        map.addLayer(other.layer);
                        // google map does not support this function
                        if (other.layer.bringToBack !== undefined)
                            other.layer.bringToBack();
                    } else {
                        map.removeLayer(other.layer);
                    }
                });
                map.fire('baselayerchange', {layer: layer.layer});
            });
            map.on('layeradd layerremove', function() {
                item.toggleClass('active', map.hasLayer(layer.layer));
                input.prop('checked', map.hasLayer(layer.layer));
            });
        });
        //     if (OSM.STATUS != 'api_offline' && OSM.STATUS != 'database_offline') {
        var overlaySection = $('<div>')
                .attr('class', 'section overlay-layers')
                .appendTo(barContent);
        $('<p>')
                .text(I18n.t('javascripts.map.layers.overlays'))
                .attr("class", "deemphasize")
                .appendTo(overlaySection);
        var list = $('<ul>')
                .appendTo(overlaySection);
        function addOverlay(layer, activeLayerSelect, maxArea) {
            var item = $('<li>')
                    .tooltip({
                        placement: 'top'
                    })
                    .appendTo(list);
            var label = $('<label>')
                    .appendTo(item);
            var checked = map.hasLayer(layer.layer);
            var input = $('<input>')
                    .attr('type', 'checkbox')
                    .prop('checked', checked)
                    .appendTo(label);
//       var input_radio = $('<input>')
//          .attr('type', 'radio')
//          .attr('name','activeLayer[]')
//          .prop('checked', false)
//          .appendTo(label);


            //       label.append(I18n.t('javascripts.map.layers.' + name));

            var label_name = I18n.t('javascripts.map.layers.' + layer.name);
            if (label_name.indexOf('missing ') === 1)
            {
                label.append(layer.name);
                activeLayerSelect.append("<option value='" + layer.layer_id + "'>" + layer.name + "</option>");
            }
            else
            {
                label.append(label_name);
                activeLayerSelect.append("<option value='" + layer.layer_id + "'>" + label_name + "</option>");
            }

            input.on('change', function() {
                checked = input.is(':checked');
                if (checked) {
                    if (!layer.layer)
                    {
                        control.loadLayer(layer);
//                        control.loadGeoJSONLayer(layer);
                        //    control.loadTopoJSONLayer(layer);
                    }
                    else
                    {
//                        if (layer.type === 'geojson' || layer.name === 'My draw geometries') {
//                            //                           control.loadGeoJSONLayer(layer);
//                            control.loadTopoJSONLayer(layer);
//                        }
                        if (layer.layer)
                            map.addLayer(layer.layer);
                    }
                } else {
//                    if (layer.type === 'shapefile_topojson') {
//
//
//                    }
//                    if (layer.type === 'geojson' || layer.name === 'My draw geometries') {
//
//                    }
                    if (layer.layer)
                        map.removeLayer(layer.layer);
                }
                if (layer.layer)
                    map.fire('overlaylayerchange', {layer: layer.layer});
            });
            if (layer.type === 'shapefile_topojson')
            {
                var ul = $('<ul>');
                var li_showlabel = $('<li>');
                ul.append(li_showlabel);
                label.append("<br>");
                item.append(ul);
                var showlabel = $('<label>')
                        .appendTo(li_showlabel);
                var showlabel_input = $('<input>')
                        .attr('type', 'checkbox')
                        .prop('checked', checked)
                        .appendTo(showlabel);
                showlabel.append("Labels");
                showlabel_input.on('change', function() {
                    checked = showlabel_input.is(':checked');
                    if (layer.layer)
                    {
                        layer.layer.options.showLabels = checked;
                        if (checked) {
                            var kename = '';
                            var field_kename = [];
                            var shapefilename = $('.sonata-bc #shapefile_select_list option:selected').map(function() {
                                return  this.text;
                            });
                            // only current map is the same with shapefile list selected file name
                            if (shapefilename === '' || shapefilename[0] === undefined || layer.layer.options.name === shapefilename[0].toLowerCase())
                            {
                                field_kename = $('.sonata-bc #shapefile_labelfield_list option:selected').map(function() {
                                    return  this.text;
                                });
                            }
                            if (field_kename.length === 0 && layer.layer.options.label_field !== '' && layer.layer.options.label_field !== null) {
                                kename = layer.layer.options.label_field;
                            }
                            else
                            {
                                if (field_kename[0] === '' || field_kename[0] === null)
                                    kename = undefined;
                                else
                                    kename = field_kename[0];
                            }
                            layer.layer.showFeatureLabels(kename);
                        } else {
                            layer.layer.removeFeatureLabels();
                        }
                    }
                });
            }


            if (layer.defaultShowOnMap === true)
            {
                $(input).prop('checked', true)
                        .trigger('change');
            }


//                input.on('change', function() {
//                    checked = input.is(':checked');
//                    if (checked) {
//                        map.addLayer(layer.layer);
//                    } else {
//                        map.removeLayer(layer.layer);
//                    }
//                    map.fire('overlaylayerchange', {layer: layer.layer});
//                });
//                

//        input_radio.on('click', function() {
//            input_radio.prop('checked',true);
//        });
//        map.on('layeradd layerremove', function() {
//          input.prop('checked', map.hasLayer(layer));
//        });

            map.on('zoomend', function() {
                // alert(map.getBounds().toBBoxString());
                // alert(maxArea);

                var disabled = false; //map.getBounds().getSize() >= maxArea;
                $(input).prop('disabled', disabled);
                if (disabled && $(input).is(':checked')) {
                    $(input).prop('checked', false)
                            .trigger('change');
                    checked = true;
                } else if (!disabled && !$(input).is(':checked') && checked) {
                    $(input).prop('checked', true)
                            .trigger('change');
                }

                $(item).attr('class', disabled ? 'disabled' : '');
                item.attr('data-original-title', disabled ?
                        I18n.t('javascripts.site.map_' + layer.name + '_zoom_in_tooltip') : '');
            });
        }
        map.dataLayers.forEach(function(layer) {
            addOverlay(layer, activeLayerSelect, OSM.MAX_NOTE_REQUEST_AREA);
        });
//      addOverlay(map.noteLayer, 'notes', OSM.MAX_NOTE_REQUEST_AREA);
//      addOverlay(map.dataLayer, 'data', OSM.MAX_REQUEST_AREA);
        //    }


        options.sidebar.addPane($ui);
        jQuery(window).resize(function() {
            barContent.height($('.leaflet-sidebar.right').height() - 70);
        });
        function toggle(e) {
            e.stopPropagation();
            e.preventDefault();
            options.sidebar.togglePane($ui, button);
            $('.leaflet-control .control-button').tooltip('hide');
        }
        return $container[0];
    };
    control.setActiveLayer = function(layers, id) {
        layers.forEach(function(layer, i) {
            if (layers[i].index_id !== undefined) {
                // if the layer is user draw layer
                if (parseInt(layers[i].index_id) === -1) {
                    if (parseInt(id) === -1) {
                        if (layers[i].layer)
                            // $(layers[i].layer).attr('style', 'z-index:301');
                            $(".leaflet-map-pane .leaflet-objects-pane .leaflet-overlay-pane svg.leaflet-zoom-animated").css('z-index', 301);
                    } else {
                        if (layers[i].layer)
                            $(".leaflet-map-pane .leaflet-objects-pane .leaflet-overlay-pane svg.leaflet-zoom-animated").css('z-index', 299);
                    }
                }
                else {

                    // if select layer id not empty
                    if (layer.layer !== null && layer.layer !== undefined) {
                        if (parseInt(layers[i].index_id) === parseInt(id)) {

                            if ((layers[i].layer instanceof  L.MarkerClusterGroup) === true)
                            {
                                //  alert(map.dataLayers[i].layer._el);
                                var clusterlayers = layers[i].layer._featureGroup._layers;
                                var keys = Object.keys(clusterlayers).map(function(k) {
                                    return  k;
                                });
                                if (clusterlayers[keys[0]] && clusterlayers[keys[0]]._container)
                                    $(clusterlayers[keys[0]]._container).parent().css("z-index", "301");
                            }
                            else {
                                if (layers[i].layer._container) {
                                    $(layers[i].layer._container).css("z-index", "301");
                                }
                            }
                        }
                        else {
                            if ((layers[i].layer instanceof  L.MarkerClusterGroup) === true) {
                                var clusterlayers = layers[i].layer._featureGroup._layers;
                                var keys = Object.keys(clusterlayers).map(function(k) {
                                    return  k;
                                });
                                if (clusterlayers[keys[0]] && clusterlayers[keys[0]]._container)
                                    $(clusterlayers[keys[0]]._container).parent().css("z-index", layers[i].index_id);
                            }
                            else {
                                if (layers[i].layer._container) {
                                    $(layers[i].layer._container).css("z-index", 300 - layers[i].index_id);
                                }
                            }

                        }
                    }
                }
            }
        });
    };
    control.renderThematicmap = function(opt) {
        var _this = this;
        var maploaded = false;
        var thematicmap_layer;
        _this._map.dataLayers.forEach(function(layer) {
            if ((layer.layerType === 'uploadfilelayer' || layer.layerType === 'uploadfile') && layer.datasource === opt.datasource && layer.filename === opt.filename) {
                maploaded = true;
                thematicmap_layer = layer;
            }
        });
        if (maploaded === false || (maploaded === true && thematicmap_layer && !thematicmap_layer.layer)) {

            this.addUploadfile(Routing.generate('default_uploadfile_info'), opt.datasource, opt);

        }

        if (thematicmap_layer && thematicmap_layer.layer) {
            thematicmap_layer.layer.options.thematicmap = true;
            thematicmap_layer.layer.options.thematicmap_rule = opt;
            thematicmap_layer.layer.renderThematicMap(opt);
        }

    };
    control.renderThematicMapLayer = function(thematicmap_layer, opt) {
        if (thematicmap_layer && thematicmap_layer.layer) {
            thematicmap_layer.layer.options.thematicmap = true;
            thematicmap_layer.layer.options.thematicmap_rule = opt;
            thematicmap_layer.layer.renderThematicMap(opt);
        }
    };
    // load layer data from server aand create layers based on layer type;
    control.loadLayer = function(layer, opt) {

        var result;
        var _this = this;
        if (layer.layerType === 'wms') {
            control.renderWMSLayer(layer);
            return;
        }
        if (layer.layerType === 'wfs') {
            control.renderWFSLayer(layer);
            return;
        }


        $.ajax({
            url: Routing.generate('leaflet_maplayer'),
            type: 'GET',
            beforeSend: function() {

                _this._map.spin(true);
            },
            complete: function() {
                _this._map.spin(false);
            },
            error: function() {
                _this._map.spin(false);
            },
            //Ajax events
            success: completeHandler = function(response) {
                result = response;
                if (response === '' || response === undefined || response === null)
                    return;
                if (typeof result !== 'object')
                    result = JSON.parse(result);
                if (result.success !== true) {
                    // if load data not suceess
                    alert(result.message);
                    return;
                }
                ;
                switch (result.datatype) {
                    case 'topojson':
                        control.RenderTopojsonLayer(result, layer, opt);
                        break;
                    case 'geojson':

                        control.RenderGeojsonLayer(result, layer, opt);
                        break;
                }

            },
            // Form data
            data: {id: layer.layer_id, layerType: layer.layerType},
            //Options to tell JQuery not to process data or worry about content-type
            cache: false,
            contentType: false
        });

        return;
    };
    control.addUploadfile = function(getlayerdata_url, uploadfile_id, opt) {

        var _this = this;
//        if (options.spinner !== undefined && options.spinner !== null && options.spinner_target !== undefined && options.spinner_target !== null) {
//            options.spinner.spin(options.spinner_target);
//        }
        //       spinner.spin(spinner_target);
        var maplayer;

        $.ajax({
            url: getlayerdata_url,
            type: 'GET',
            beforeSend: function() {

                _this._map.spin(true);
            },
            complete: function() {
                _this._map.spin(false);
            },
            error: function() {
                _this._map.spin(false);
            },
            //Ajax events
            success: completeHandler = function(response) {

                var result;
                if (typeof response === 'object') {
                    result = response;
                } else {
                    result = JSON.parse(response);
                }

                if (result.success === true) {
                    var layers = options.layers;
                    layers.forEach(function(layer) {
                        // if this file already exist, delete it first
                        if (layer.filename === result.uploadfile.filename) {

                        }
                    });
                    var fileExist = false;
                    _this._map.dataLayers.forEach(function(layer) {
                        if (layer.filename === result.uploadfile.filename) {
                            fileExist = true;
                            maplayer = layer;
                        }
                    });
                    if (fileExist === false) {
                        _this._map.dataLayers[_this._map.dataLayers.length] = {'defaultShowOnMap': true, 'layerType': 'uploadfile', 'layer': null, 'minZoom': null, 'maxZoom': null, 'index_id': _this._map.dataLayers.length + 1, 'layer_id': result.uploadfile.id, 'title': result.uploadfile.filename, 'datasource': result.uploadfile.datasource, 'filename': result.uploadfile.filename, 'name': result.uploadfile.filename, type: 'topojson'};
                        maplayer = _this._map.dataLayers[_this._map.dataLayers.length - 1];
                        var overlay_layers_ul = $(".leaflet-control-container .section.overlay-layers > ul");
                        var item = $('<li>')
                                .tooltip({
                                    placement: 'top'
                                })
                                .appendTo(overlay_layers_ul);
                        var label = $('<label>')
                                .appendTo(item);
                        var checked = false;
                        var input = $('<input>')
                                .attr('type', 'checkbox')
                                .prop('checked', checked)
                                .appendTo(label);
                        var legend_label = I18n.t('javascripts.map.layers.' + maplayer.name);
                        if (legend_label.indexOf('missing ') === 1)
                        {
                            label.append(maplayer.name);
                            $("select#activelayer_id.layers-ui").append("<option value='" + maplayer.layer_id + "'>" + maplayer.name + "</option>");
                        }
                        else
                        {
                            label.append(legend_label);
                            $("select#activelayer_id.layers-ui").append("<option value='" + maplayer.layer_id + "'>" + legend_label + "</option>");
                        }

                        input.on('change', function() {
                            checked = input.is(':checked');
                            if (checked) {
                                if (!maplayer.layer)
                                {
                                    control.loadLayer(maplayer, opt);
                                    //   control.loadTopoJSONLayer(maplayer);
                                }
                                else
                                {
//                                    if (maplayer.type === 'geojson' || maplayer.name === 'My draw geometries') {
//                                        //                           control.loadGeoJSONLayer(layer);
//                                        control.loadTopoJSONLayer(maplayer);
//                                    }
                                    if (maplayer.layer)
                                        _this._map.addLayer(maplayer.layer);
                                }
                            } else {
//                                if (maplayer.type === 'shapefile_topojson') {
//
//
//                                }
//                                if (maplayer.type === 'geojson' || maplayer.name === 'My draw geometries') {
//
//                                }
                                if (maplayer.layer)
                                    _this._map.removeLayer(maplayer.layer);
                            }
                            if (maplayer.layer)
                                _this._map.fire('overlaylayerchange', {layer: maplayer.layer});
                        });
                        if (maplayer.type === 'shapefile_topojson')
                        {
                            var ul = $('<ul>');
                            var li_showlabel = $('<li>');
                            ul.append(li_showlabel);
                            label.append("<br>");
                            item.append(ul);
                            var showlabel = $('<label>')
                                    .appendTo(li_showlabel);
                            var showlabel_input = $('<input>')
                                    .attr('type', 'checkbox')
                                    .prop('checked', checked)
                                    .appendTo(showlabel);
                            showlabel.append("Labels");
                            showlabel_input.on('change', function() {
                                checked = showlabel_input.is(':checked');
                                if (maplayer.layer)
                                {
                                    maplayer.layer.options.showLabels = checked;
                                    if (checked) {
                                        var kename = '';
                                        var field_kename = [];
                                        var shapefilename = $('.sonata-bc #shapefile_select_list option:selected').map(function() {
                                            return  this.text;
                                        });
                                        // only current map is the same with shapefile list selected file name
                                        if (shapefilename === '' || shapefilename[0] === undefined || maplayer.layer.options.name === shapefilename[0].toLowerCase())
                                        {
                                            field_kename = $('.sonata-bc #shapefile_labelfield_list option:selected').map(function() {
                                                return  this.text;
                                            });
                                        }
                                        if (field_kename.length === 0 && maplayer.layer.options.label_field !== '' && maplayer.layer.options.label_field !== null) {
                                            kename = maplayer.layer.options.label_field;
                                        }
                                        else
                                        {
                                            if (field_kename[0] === '' || field_kename[0] === null)
                                                kename = undefined;
                                            else
                                                kename = field_kename[0];
                                        }
                                        maplayer.layer.showFeatureLabels(kename);
                                    } else {
                                        maplayer.layer.removeFeatureLabels();
                                    }
                                }
                            });
                        }


                        if (maplayer.defaultShowOnMap === true)
                        {
                            $(input).prop('checked', true)
                                    .trigger('change');
                        }
                    }
                }

//                if (callback && maplayer) {
//                    setTimeout(function() {
//                        callback(maplayer, opt);
//                    }, 500);
//
//                }

            },
            // Form data
            data: {id: uploadfile_id},
            //Options to tell JQuery not to process data or worry about content-type
            cache: false,
            contentType: false
                    //   processData: false
        });
    };
    control.renderWMSLayer = function(layer) {
        if ((layer.layer === undefined || layer.layer === null) && layer.hostName !== undefined && layer.name !== undefined)
        {
            layer.layer = new L.TileLayer.WMS("http://" + layer.hostName,
                    {
                        layers: layer.name,
                        format: 'image/png',
                        transparent: true,
                        attribution: ""
                    });
            layer.map.addLayer(layer.layer);
        }
    };
    control.renderWFSLayer = function(layer) {
        var _this = this;
        if (layer.layer === undefined || layer.layer === null) {

            var geoJsonUrl = "http://" + layer.hostName + "&typeName=" + layer.name + "&maxFeatures=5000&srsName=EPSG:4326&outputFormat=json";
            $.ajax({
                url: Routing.generate('default_geoserver_wfs'),
                type: 'POST',
                beforeSend: function() {

                    _this._map.spin(true);
                },
                complete: function() {
                    _this._map.spin(false);
                },
                error: function() {
                    _this._map.spin(false);
                },
                data: {
                    address: geoJsonUrl
                },
                success: function(response) {

                    if (typeof response !== 'object')
                        response = JSON.parse(response);
                    if (typeof response.data !== 'object')
                        response.data = JSON.parse(response.data);
                    if (!layer.clusterLayer) {
                        control.renderD3Layer(response.data, {
                            id: 'svg-leaflet-d3',
                            layer_id: layer.layer_id,
                            zIndex: (300 - layer.index_id),
                            minZoom: layer.minZoom,
                            maxZoom: layer.maxZoom,
                            layerType: layer.layerType
                        });

                    }
                    else {

                        control.renderClusterLayer(layer, response.data);
                    }
                }
            });
        }

        return;
    };
    control.RenderGeojsonLayer = function(result, layer, opt) {
        var _this = this;
        var sld;
        if (typeof result.sld === 'object') {
            sld = result.sld;
        }
        else
        {
            if (result.sld !== undefined && result.sld.trim().length > 100)
                sld = JSON.parse(result.sld);
        }

        var json_data;
        if (typeof result.geomdata === 'object' && typeof result.geomdata['geom'] !== 'object')
            json_data = JSON.parse(result.geomdata['geom']);
        else
            json_data = result.geomdata['geom'];

        if (layer.clusterLayer) {

            control.renderClusterLayer(layer, json_data);
            return;

        }
        else {
            if (layer.layerType === 'userdraw')
                control.renderUserdrawLayer(json_data, layer, opt);
            else {

                control.renderD3Layer(layer, json_data, sld, {
                    id: 'svg-leaflet-d3',
                    layer_id: layer.layer_id,
                    zIndex: (300 - layer.index_id),
                    minZoom: layer.minZoom,
                    maxZoom: layer.maxZoom,
                    layerType: layer.layerType,
                    sld: sld,
                    thematicmap: opt,
                    filename: result.layer['fileName'].toLowerCase(),
                    filetype: result.layer['fileType'].toLowerCase(),
                    showLabels: (result.layer['label_field'] !== '' && result.layer['label_field'] !== null),
                    type: result.datatype,
                    tip_field: result.layer['tip_field'],
                    label_field: result.layer['label_field']
                });

            }
        }
    };
    control.renderUserdrawLayer = function(data, layer) {
        var _this = this;
        if (data === null || data === undefined)
            return;

        _this._map.drawnItems.clearLayers();
        layer.layer = undefined;
        $.each(data, function(i) {
            var feature;
            if (data[i] !== null && data[i].feature !== null) {
                var coordinates;
                if (typeof data[i].feature === 'object')
                    coordinates = data[i].feature.coordinates;
                else
                    coordinates = JSON.parse(data[i].feature).coordinates;
                if ($.isArray(coordinates[0])) {
                    for (var j = 0; j < coordinates[0].length; j++) {
                        var temp = coordinates[0][j][0];
                        coordinates[0][j][0] = coordinates[0][j][1];
                        coordinates[0][j][1] = temp;
                    }
                }
                else
                {
                    var temp = coordinates[0];
                    coordinates[0] = coordinates[1];
                    coordinates[1] = temp;
                }
                if (data[i].geom_type === 'polygon')
                {
                    feature = new L.Polygon(coordinates);
                }

                if (data[i].geom_type === 'polyline')
                {
                    feature = new L.Polyline(coordinates);
                }
                if (data[i].geom_type === 'rectangle')
                {
                    feature = new L.rectangle([coordinates[0][0], coordinates[0][2]]);
                }
                if (data[i].geom_type === 'circle')
                {
                    feature = new L.circle(coordinates, data[i].radius);
                }
                if (data[i].geom_type === 'marker')
                {
                    feature = L.marker(coordinates);
                }

                //  feature.editing.enable();
                if (feature.bindLabel)
                    feature.bindLabel(data[i].keyname);
                feature.id = data[i].ogc_fid;
                feature.name = data[i].keyname;
                feature.index = _this._map.drawnItems.getLayers().length;
                feature.type = data[i].geom_type;
                feature.layer_id = -1;
                feature.on('click', function(e) {

                    var selectedfeature = e.target;
                    if (_this._map.drawControl._toolbars.edit._activeMode === null) {


                        var highlight = {
                            'color': '#333333',
                            'weight': 2,
                            'opacity': 1
                        };
                        if (selectedfeature.selected === false || selectedfeature.selected === undefined) {
                            if (selectedfeature.type !== 'marker')
                                selectedfeature.setStyle(highlight);
                            selectedfeature.selected = true;
                            if (document.getElementById('geometries_selected')) {


                                var selectBoxOption = document.createElement("option"); //create new option 
                                selectBoxOption.value = selectedfeature.id; //set option value 
                                selectBoxOption.text = selectedfeature.name; //set option display text 
                                document.getElementById('geometries_selected').add(selectBoxOption, null);
                            }
                        }
                        else
                        {
                            if (selectedfeature.type !== 'marker')
                                selectedfeature.setStyle({
                                    'color': "blue",
                                    'weight': 5,
                                    'opacity': 0.6
                                });
                            selectedfeature.selected = false;
                            $("#geometries_selected option[value='" + selectedfeature.id + "']").each(function() {
                                $(this).remove();
                            });
                        }

                        $.ajax({
                            url: Routing.generate('draw_content'),
                            method: 'GET',
                            beforeSend: function() {

                                _this._map.spin(true);
                            },
                            complete: function() {
                                _this._map.spin(false);
                            },
                            error: function() {
                                _this._map.spin(false);
                            },
                            data: {
                                id: e.target.id
                            },
                            success: function(response) {

                                $('#sidebar-left #sidebar_content').html('');
                                $('#sidebar-left #sidebar_content').html(response);

                                //                            $('#usergeometriesCarousel').carousel({pause: "hover",wrap: true});

                            }
                        });
                    }
                    else if (_this._map.drawControl._toolbars.edit._activeMode && _this._map.drawControl._toolbars.edit._activeMode.handler.type === 'edit') {

                        var radius = 0;
                        if (e.target.type === 'circle')
                        {
                            radius = e.target._mRadius;
                        }
                        $.ajax({
                            url: Routing.generate('draw_' + e.target.type),
                            method: 'GET',
                            beforeSend: function() {

                                _this._map.spin(true);
                            },
                            complete: function() {
                                _this._map.spin(false);
                            },
                            error: function() {
                                _this._map.spin(false);
                            },
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
                    }
                    ;
                });
                if (layer.layer === undefined)
                    layer.layer = _this._map.drawnItems;
                _this._map.drawnItems.addLayer(feature);
            }
        });
        return;

    };
    control.RenderTopojsonLayer = function(result, layer, opt) {
        var _this = this;
        var sld;
        if (typeof result.sld === 'object') {
            sld = result.sld;
        }
        else
        {
            if (result.sld !== undefined && result.sld.trim().length > 100)
                sld = JSON.parse(result.sld);
        }
        var json_data = JSON.parse(result.geomdata['geom']); //JSON.parse(result.data[keys[k]]);
        //           var json_data = JSON.parse(result.data);
        var key = Object.keys(json_data.objects).map(function(k) {
            return  k;
        });
        var properties_key = Object.keys(json_data.objects[key].geometries[0].properties).map(function(k) {
            return  k;
        });
        var collection = topojson.feature(json_data, json_data.objects[key]);
        if (layer.clusterLayer) {

            control.renderClusterLayer(layer, collection);
            return;
        }

        d3.selectAll("#svg-leaflet-d3").each(function() {
            var elt = d3.select(this);
            if (elt.attr("filename").toString().toLowerCase() === result.layer['fileName'].toString().toLowerCase() && elt.attr("layertype").toString().toLowerCase() === layer.layerType)
                elt.remove();
        });

        control.renderD3Layer(layer, collection, sld, {
            id: 'svg-leaflet-d3',
            layer_id: layer.layer_id,
            zIndex: (300 - layer.index_id),
            minZoom: layer.minZoom,
            maxZoom: layer.maxZoom,
            layerType: layer.layerType,
            sld: sld,
            thematicmap: opt,
            filename: result.layer['fileName'].toLowerCase(),
            filetype: result.layer['fileType'].toLowerCase(),
            showLabels: (result.layer['label_field'] !== '' && result.layer['label_field'] !== null),
            type: result.datatype,
            tip_field: result.layer['tip_field'],
            label_field: result.layer['label_field']
        });
        return;
        var geojson_shapefile = new L.D3(collection, {
            id: 'svg-leaflet-d3',
            layer_id: layer.layer_id,
            zIndex: (300 - layer.index_id),
            minZoom: layer.minZoom,
            maxZoom: layer.maxZoom,
            layerType: layer.layerType,
            sld: sld,
            filename: result.layer['fileName'].toLowerCase(),
            filetype: result.layer['fileType'].toLowerCase(),
            showLabels: (result.layer['label_field'] !== '' && result.layer['label_field'] !== null),
            type: result.datatype,
            tip_field: result.layer['tip_field'],
            label_field: result.layer['label_field'],
            featureAttributes: {
                'layer_id': result.layer['id'],
                'class': function(feature) {
                    return 'default_fcls';
                }
            }
        });
        geojson_shapefile.addTo(_this._map);
        geojson_shapefile.onLoadSLD(sld);
        layer.layer = geojson_shapefile;
        geojson_shapefile.on('click', function(e) {
            //   if (parseInt(e.target.options.layer_id) === parseInt($("select#activelayer_id.layers-ui").val())) {

            var mouse = d3.mouse(e.element);
            var shapefilename = $('.sonata-bc #shapefile_select_list option:selected').map(function() {
                return  this.text;
            });
            if (shapefilename !== null && shapefilename !== '' && shapefilename[0] !== undefined && geojson_shapefile.options.filename === shapefilename[0].toLowerCase())
            {

                if ($('#geometries_selected').length > 0)
                {
                    var bExist = false;
                    $("#geometries_selected > option").each(function() {

                        if (parseInt(this.value) === parseInt(e.data.properties[properties_key[0]])) {
                            bExist = true;
                        }
                    });
                    if (bExist === false)
                    {
                        var fieldkey = $('.sonata-bc #shapefile_labelfield_list option:selected').map(function() {
                            return  this.text;
                        });
                        var p;
                        if (fieldkey === '' || fieldkey[0] === '' || fieldkey[0] === undefined)
                            p = e.data.properties[properties_key[1]];
                        else
                            p = e.data.properties[fieldkey[0]];
                        if (document.getElementById('geometries_selected')) {
                            var selectBoxOption = document.createElement("option"); //create new option 
                            selectBoxOption.value = e.data.properties[properties_key[0]]; //set option value 
                            selectBoxOption.text = p; //set option display text 
                            document.getElementById('geometries_selected').add(selectBoxOption, null);
                            //    alert(properties_key[0]+ ':'+ e.data.properties[properties_key[0]] + "\n" + properties_key[1] +':' + e.data.properties[properties_key[1]]);
                        }
                    }
                }
            }
            ;
            //  }
            var html = '';
            for (var key in e.data.properties) {
                if (e.data.properties.hasOwnProperty(key)) {
                    //alert(e.data.properties[key].substring(0, 5));
                    if (e.data.properties[key] !== 'null' && e.data.properties[key] !== null && e.data.properties[key] !== undefined && e.data.properties[key].length > 10 && (key === 'website' || e.data.properties[key].substring(0, 5) === 'http:'))
                        html = html + key + ":<a href='" + e.data.properties[key] + "' target='_blank'>" + e.data.properties[key] + "</a><br>";
                    else
                        html = html + key + ":" + e.data.properties[key] + "<br>";
                }
            }
            $('#sidebar-left #sidebar_content').html('');
            $('#sidebar-left #sidebar_content').html(html);
        });
        geojson_shapefile.on("mouseover", function(e) {
            e.element.fill = $(e.element).css('fill');
            d3.select(e.element).style({'fill': 'red', 'fill-opacity': '0.8'});
            d3.select(e.element).style('cursor', 'pointer');
        });
        geojson_shapefile.on('mousemove', function(e) {

            //    if (parseInt(e.target.options.layer_id) === parseInt($("select#activelayer_id.layers-ui").val())) {

            var shapefilename = $('.sonata-bc #shapefile_select_list option:selected').map(function() {
                return  this.text;
            });
            if (shapefilename === '' || shapefilename[0] === undefined || geojson_shapefile.options.filename === shapefilename[0].toLowerCase())
            {
                var p;
                var fieldkey = '';
                var mouse = L.DomEvent.getMousePosition(e.originalEvent, _this._map._container);
                fieldkey = $('.sonata-bc #shapefile_labelfield_list option:selected').map(function() {
                    return  this.text;
                });
                if (e.target.options.tip_field !== undefined && e.target.options.tip_field !== '' && e.target.options.tip_field !== null) {
                    p = e.data.properties[e.target.options.tip_field ];
                }
                else {
                    if (fieldkey === undefined || fieldkey === null || fieldkey === '' || (typeof fieldkey === 'object' && (fieldkey[0] === null || fieldkey[0] === '' || fieldkey[0] === undefined)))
                        p = e.data.properties[properties_key[1]];
                    else
                        p = e.data.properties[fieldkey[0]];
                }
                options.map_tooltip.classed("hidden", false)
                        .attr("style", "left:" + (mouse.x + 30) + "px;top:" + (mouse.y - 35) + "px")
                        .html(p);
            }
            // }
        });
        geojson_shapefile.on('mouseout', function(e) {
            options.map_tooltip.classed("hidden", true);
            d3.select(e.element).style({'fill': e.element.fill});
            d3.select(e.element).style('cursor', 'default');
        });
        //            var bound = d3.geo.bounds(collection);
        if (opt.thematicmap === true) {
            if (geojson_shapefile.options) {
                geojson_shapefile.options.thematicmap = true;
                geojson_shapefile.options.thematicmap_rule = opt;
                if (geojson_shapefile.renderThematicMap)
                    geojson_shapefile.renderThematicMap(geojson_shapefile.options.thematicmap_rule);
            }
        }
    };
    control.loadTopoJSONLayer = function(layer) {
        var _this = this;
        if (layer.type === 'topojsonfile' || layer.type === 'shapefile_topojson' || layer.type === 'topojson' || layer.type === 'geojson') {
            var url;
            if (layer.layerType !== undefined && layer.layerType === 'uploadfile')
                url = Routing.generate('leaflet_uploadfile');
            else
            {
                if (layer.layerType === 'uploadfilelayer')
                {
                    url = Routing.generate('leaflet_maplayer');
                }
                else if (layer.layerType === 'leafletcluster')
                {
                    url = Routing.generate('leaflet_clusterlayer');
                }
                else if (layer.layerType === 'wms') {

                    if (layer.layer === undefined || layer.layer === null)
                    {

                        layer.layer = new L.TileLayer.WMS("http://" + layer.hostName,
                                {
                                    layers: layer.name,
                                    format: 'image/png',
                                    transparent: true,
                                    attribution: ""
                                });
                        layer.map.addLayer(layer.layer);
                    }

                    return;
                }
                else if (layer.layerType === 'wfs') {

                    if (layer.layer === undefined || layer.layer === null) {

                        var geoJsonUrl = "http://" + layer.hostName + "&typeName=" + layer.name + "&maxFeatures=5000&srsName=EPSG:4326&outputFormat=json";
                        $.ajax({
                            url: Routing.generate('default_geoserver_wfs'),
                            type: 'POST',
                            data: {
                                address: geoJsonUrl
                            },
                            success: function(response) {

                                if (typeof response !== 'object')
                                    response = JSON.parse(response);
                                if (typeof response.data !== 'object')
                                    response.data = JSON.parse(response.data);
                                if (!layer.clusterLayer) {
                                    var geojson_layer = new L.D3(response.data, {
                                        id: 'svg-leaflet-d3',
                                        layer_id: layer.layer_id,
                                        zIndex: (300 - layer.index_id),
                                        minZoom: layer.minZoom,
                                        maxZoom: layer.maxZoom,
                                        layerType: layer.layerType
                                    });
                                    geojson_layer.addTo(_this._map);
                                    layer.layer = geojson_layer;
                                    //                                geojson_layer.on('click', function(e) {
//                                    //   if (parseInt(e.target.options.layer_id) === parseInt($("select#activelayer_id.layers-ui").val())) {
//
//                                    var mouse = d3.mouse(e.element);
//                                    var shapefilename = $('.sonata-bc #shapefile_select_list option:selected').map(function() {
//                                        return  this.text;
//                                    });
//                                    if (shapefilename !== null && shapefilename !== '' && shapefilename[0] !== undefined && geojson_shapefile.options.filename === shapefilename[0].toLowerCase())
//                                    {
//
//                                        if ($('#geometries_selected').length > 0)
//                                        {
//                                            var bExist = false;
//                                            $("#geometries_selected > option").each(function() {
//
//                                                if (parseInt(this.value) === parseInt(e.data.properties[properties_key[0]])) {
//                                                    bExist = true;
//                                                }
//                                            });
//                                            if (bExist === false)
//                                            {
//                                                var fieldkey = $('.sonata-bc #shapefile_labelfield_list option:selected').map(function() {
//                                                    return  this.text;
//                                                });
//                                                var p;
//                                                if (fieldkey === '' || fieldkey[0] === '' || fieldkey[0] === undefined)
//                                                    p = e.data.properties[properties_key[1]];
//                                                else
//                                                    p = e.data.properties[fieldkey[0]];
//                                                if (document.getElementById('geometries_selected')) {
//                                                    var selectBoxOption = document.createElement("option"); //create new option 
//                                                    selectBoxOption.value = e.data.properties[properties_key[0]]; //set option value 
//                                                    selectBoxOption.text = p; //set option display text 
//                                                    document.getElementById('geometries_selected').add(selectBoxOption, null);
//                                                    //    alert(properties_key[0]+ ':'+ e.data.properties[properties_key[0]] + "\n" + properties_key[1] +':' + e.data.properties[properties_key[1]]);
//                                                }
//                                            }
//                                        }
//                                    }
//                                    ;
//                                    //  }
//                                    var html = '';
//                                    for (var key in e.data.properties) {
//                                        if (e.data.properties.hasOwnProperty(key)) {
//                                            //alert(e.data.properties[key].substring(0, 5));
//                                            if (e.data.properties[key] !== 'null' && e.data.properties[key] !== null && e.data.properties[key] !== undefined && e.data.properties[key].length > 10 && (key === 'website' || e.data.properties[key].substring(0, 5) === 'http:'))
//                                                html = html + key + ":<a href='" + e.data.properties[key] + "' target='_blank'>" + e.data.properties[key] + "</a><br>";
//                                            else
//                                                html = html + key + ":" + e.data.properties[key] + "<br>";
//
//                                        }
//                                    }
//                                    $('div.sidebar_feature_content').html('');
//                                    $('div.sidebar_feature_content').html(html);
//                                });
//
//                                geojson_layer.on("mouseover", function(e) {
//                                    e.element.fill = $(e.element).css('fill');
//                                    e.element.fill_opacity = $(e.element).css('fill-opacity');
//                                    d3.select(e.element).style({'fill': 'red', 'fill-opacity': '0.8'});
//                                    d3.select(e.element).style('cursor', 'pointer');
//
//                                });
//                                geojson_layer.on('mousemove', function(e) {
//
//                                    //    if (parseInt(e.target.options.layer_id) === parseInt($("select#activelayer_id.layers-ui").val())) {
//
//                                    var shapefilename = $('.sonata-bc #shapefile_select_list option:selected').map(function() {
//                                        return  this.text;
//                                    });
//
//                                    if (shapefilename === '' || shapefilename[0] === undefined || geojson_shapefile.options.filename === shapefilename[0].toLowerCase())
//                                    {
//                                        var p;
//
//                                        var fieldkey = '';
//                                        var mouse = L.DomEvent.getMousePosition(e.originalEvent, _this._map._container);
//                                        fieldkey = $('.sonata-bc #shapefile_labelfield_list option:selected').map(function() {
//                                            return  this.text;
//                                        });
//
//                                        if (e.target.options.tip_field !== undefined && e.target.options.tip_field !== '' && e.target.options.tip_field !== null) {
//                                            p = e.data.properties[e.target.options.tip_field ];
//                                        }
//                                        else {
//
//                                            if (fieldkey === undefined || fieldkey === null || fieldkey === '' || (typeof fieldkey === 'object' && (fieldkey[0] === null || fieldkey[0] === '' || fieldkey[0] === undefined)))
//                                                p = e.data.properties[properties_key[1]];
//                                            else
//                                                p = e.data.properties[fieldkey[0]];
//                                        }
//                                        options.map_tooltip.classed("hidden", false)
//                                                .attr("style", "left:" + (mouse.x + 30) + "px;top:" + (mouse.y - 35) + "px")
//                                                .html(p);
//                                    }
//                                    // }
//                                });
//                                geojson_layer.on('mouseout', function(e) {
//                                    options.map_tooltip.classed("hidden", true);
//                                    d3.select(e.element).style({'fill': e.element.fill});
//                                    d3.select(e.element).style({'fill-opacity': e.element.fill_opacity});
//                                    d3.select(e.element).style('cursor', 'default');
//                                });
                                }
                                else {
                                    var properties_key = Object.keys(response.data.features[0].properties).map(function(k) {
                                        return  k;
                                    });
                                    var rmax = 30;
                                    var highlightStyle = {
                                        color: '#2262CC',
                                        weight: 3,
                                        opacity: 0.6,
                                        fillOpacity: 0.65,
                                        fillColor: '#2262CC'
                                    };
                                    var geoJsonLayer = L.geoJson(response.data, {
                                        id: "9",
                                        style: {
                                            fillColor: "#A3C990",
                                            color: "#000",
                                            weight: 1,
                                            opacity: 1,
                                            fillOpacity: 0.4
                                        },
                                        pointToLayer: function(feature, latlng) {
                                            return new L.CircleMarker(latlng, {
                                                radius: 5,
                                                fillColor: "#A3C990",
                                                color: "#000",
                                                weight: 1,
                                                opacity: 1,
                                                fillOpacity: 0.4
                                            });
                                        },
                                        onEachFeature: function(feature, layer) {
                                            (function(layer, properties) {
                                                layer.on('mouseover', function(e) {
                                                    var layer = e.target;
                                                    layer.setStyle({
                                                        weight: 2,
                                                        color: 'red',
                                                        dashArray: '',
                                                        cursor: 'pointer',
                                                        fillOpacity: 0.7
                                                    });
                                                    //    $(this).fill = $(this).css('fill');
                                                    //    $(this).fill_opacity = $(this).css('fill-opacity');
                                                    // d3.select(e.target).style({'fill': 'red'});
//                                                $(e.target).css('fill', 'red');
//                                                $(e.target).css('fill-opacity', '0.8');
                                                    $(this).css('cursor', 'pointer');
                                                });
                                                layer.on('mouseout', function(e) {


                                                    geoJsonLayer.resetStyle(e.target);
                                                    options.map_tooltip.classed("hidden", true);
                                                    //      $(this).css('fill', $(this).fill);
                                                    //      $(this).css('fill-opacity', $(this).fill_opacity);
                                                    $(this).css('cursor', 'default');
                                                });
                                                layer.on('mousemove', function(e) {                         //    if (parseInt(e.target.options.layer_id) === parseInt($("select#activelayer_id.layers-ui").val())) {

                                                    var shapefilename = $('.sonata-bc #shapefile_select_list option:selected').map(function() {
                                                        return  this.text;
                                                    });
                                                    if (shapefilename === '' || shapefilename[0] === undefined)
                                                    {
                                                        var p;
                                                        var fieldkey = '';
                                                        var mouse = L.DomEvent.getMousePosition(e.originalEvent, _this._map._container);
                                                        fieldkey = $('.sonata-bc #shapefile_labelfield_list option:selected').map(function() {
                                                            return  this.text;
                                                        });
                                                        if (e.target.options.tip_field !== undefined && e.target.options.tip_field !== '' && e.target.options.tip_field !== null) {
                                                            p = properties[e.target.options.tip_field ];
                                                        }
                                                        else {

                                                            if (fieldkey === undefined || fieldkey === null || fieldkey === '' || (typeof fieldkey === 'object' && (fieldkey[0] === null || fieldkey[0] === '' || fieldkey[0] === undefined)))
                                                                p = properties[properties_key[1]];
                                                            else
                                                                p = properties[fieldkey[0]];
                                                        }
                                                        options.map_tooltip.classed("hidden", false)
                                                                .attr("style", "left:" + (mouse.x + 30) + "px;top:" + (mouse.y - 35) + "px")
                                                                .html(p);
                                                    }

                                                });
                                                layer.on('click', function(e) {
                                                    var html = '';
                                                    for (var key in properties) {
                                                        if (properties.hasOwnProperty(key)) {
                                                            //alert(e.data.properties[key].substring(0, 5));
                                                            if (properties[key] !== 'null' && properties[key] !== null && properties[key] !== undefined && properties[key].length > 10 && (key === 'website' || properties[key].substring(0, 5) === 'http:'))
                                                                html = html + key + ":<a href='" + properties[key] + "' target='_blank'>" + properties[key] + "</a><br>";
                                                            else
                                                                html = html + key + ":" + properties[key] + "<br>";
                                                        }
                                                    }
                                                    $('div.sidebar_feature_content').html('');
                                                    $('div.sidebar_feature_content').html(html);
                                                });
                                            })(layer, feature.properties);
                                            //layer.bindPopup(feature.properties.Name);
                                        }
                                    });
                                    var markerclusters = new L.MarkerClusterGroup({
                                        maxClusterRadius: 80,
//                                    iconCreateFunction: function(cluster) {
//                                        var markers = cluster.getAllChildMarkers();
//                                        var n = 0;
//                                        for (var i = 0; i < markers.length; i++) {
//                                            n += markers[i].number;
//                                        }
//                                        return L.divIcon({html: n, className: 'mycluster', iconSize: L.point(40, 40)});
//                                    },
                                        //Disable all of the defaults:
                                        spiderfyOnMaxZoom: true, showCoverageOnHover: true, zoomToBoundsOnClick: true
                                    });
                                    markerclusters.addLayer(geoJsonLayer, true);
                                    //   _this._map.addLayer(markerclusters);
                                    //   geoJsonLayer.addTo(_this._map);
                                    markerclusters.addTo(_this._map);
                                    layer.layer = markerclusters;
                                }
                            }
                        });
                    }
                    return;
                }
                else
                    return;
            }
            $.ajax({
                url: url,
                type: 'GET',
                beforeSend: function() {

                    _this._map.spin(true);
                },
                complete: function() {
                    _this._map.spin(false);
                },
                error: function() {
                    _this._map.spin(false);
                },
                data: {id: layer.layer_id, type: layer.type},
                //Ajax events
                success: function(response) {
                    var result;
                    if (typeof response === 'object') {
                        result = response;
                    } else {
                        result = JSON.parse(response);
                    }

                    if (result.success === true && result.type === 'geojson' && result.filename === 'draw' && result.data !== null) {

                        var data;
                        if (typeof result.data === 'object') {
                            data = result.data;
                        } else {
                            data = JSON.parse(result.data);
                        }
                        _this._map.drawnItems.clearLayers();
                        $.each(data, function(i) {
                            var feature;
                            if (data[i] !== null && data[i].feature !== null) {
                                var coordinates;
                                if (typeof data[i].feature === 'object')
                                    coordinates = data[i].feature.coordinates;
                                else
                                    coordinates = JSON.parse(data[i].feature).coordinates;
                                if ($.isArray(coordinates[0])) {
                                    for (var j = 0; j < coordinates[0].length; j++) {
                                        var temp = coordinates[0][j][0];
                                        coordinates[0][j][0] = coordinates[0][j][1];
                                        coordinates[0][j][1] = temp;
                                    }
                                }
                                else
                                {
                                    var temp = coordinates[0];
                                    coordinates[0] = coordinates[1];
                                    coordinates[1] = temp;
                                }
                                if (data[i].geom_type === 'polygon')
                                {
                                    feature = new L.Polygon(coordinates);
                                }

                                if (data[i].geom_type === 'polyline')
                                {
                                    feature = new L.Polyline(coordinates);
                                }
                                if (data[i].geom_type === 'rectangle')
                                {
                                    feature = new L.rectangle([coordinates[0][0], coordinates[0][2]]);
                                }
                                if (data[i].geom_type === 'circle')
                                {
                                    feature = new L.circle(coordinates, data[i].radius);
                                }
                                if (data[i].geom_type === 'marker')
                                {
                                    feature = L.marker(coordinates);
                                }

                                //  feature.editing.enable();
                                if (feature.bindLabel)
                                    feature.bindLabel(data[i].keyname);
                                feature.id = data[i].ogc_fid;
                                feature.name = data[i].keyname;
                                feature.index = _this._map.drawnItems.getLayers().length;
                                feature.type = data[i].geom_type;
                                feature.layer_id = -1;
                                feature.on('click', function(e) {



//                                    if (e.originalEvent.button === 2)
//                                    {
//                                        var radius = 0;
//                                        if (e.target.type === 'circle')
//                                        {
//                                            radius = e.target._mRadius;
//                                        }
//                                        $.ajax({
//                                            url: Routing.generate('draw_' + e.target.type),
//                                            method: 'GET',
//                                            data: {
//                                                id: e.target.id,
//                                                name: e.target.name,
//                                                radius: radius,
//                                                index: e.target.index
//                                            },
//                                            success: function(response) {
//                                                if ($('body.sonata-bc #ajax-dialog').length === 0) {
//                                                    $('<div class="modal fade" id="ajax-dialog" role="dialog"></div>').appendTo('body');
//                                                } else {
//                                                    $('body.sonata-bc #ajax-dialog').html('');
//                                                }
//
//                                                $(response).appendTo($('body.sonata-bc #ajax-dialog'));
//                                                $('#ajax-dialog').modal({show: true});
//                                                $('#ajax-dialog').draggable();
//                                                //  alert(JSON.stringify(html));
//                                            }
//                                        });
//                                    } else {
//                                        if (e.originalEvent.button === 0) {
//                                            var highlight = {
//                                                'color': '#333333',
//                                                'weight': 2,
//                                                'opacity': 1
//                                            };
//
//                                            if (feature.selected === false || feature.selected === undefined) {
//                                                feature.setStyle(highlight);
//                                                feature.selected = true;
//                                                if (document.getElementById('geometries_selected')) {
//                                                    var selectBoxOption = document.createElement("option");//create new option 
//                                                    selectBoxOption.value = feature.id;//set option value 
//                                                    selectBoxOption.text = feature.name;//set option display text 
//                                                    document.getElementById('geometries_selected').add(selectBoxOption, null);
//                                                }
//                                            }
//                                            else
//                                            {
//
//                                                feature.setStyle({
//                                                    'color': "blue",
//                                                    'weight': 5,
//                                                    'opacity': 0.6
//                                                });
//                                                feature.selected = false;
//                                                $("#geometries_selected option[value='" + feature.id + "']").each(function() {
//                                                    $(this).remove();
//                                                });
//                                            }
//                                        }
//
//                                    }
                                    var feature = e.target;
                                    if (_this._map.drawControl._toolbars.edit._activeMode === null) {


                                        var highlight = {
                                            'color': '#333333',
                                            'weight': 2,
                                            'opacity': 1
                                        };
                                        if (feature.selected === false || feature.selected === undefined) {
                                            if (feature.type !== 'marker')
                                                feature.setStyle(highlight);
                                            feature.selected = true;
                                            if (document.getElementById('geometries_selected')) {


                                                var selectBoxOption = document.createElement("option"); //create new option 
                                                selectBoxOption.value = feature.id; //set option value 
                                                selectBoxOption.text = feature.name; //set option display text 
                                                document.getElementById('geometries_selected').add(selectBoxOption, null);
                                            }
                                        }
                                        else
                                        {
                                            if (feature.type !== 'marker')
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

                                        $.ajax({
                                            url: Routing.generate('draw_content'),
                                            method: 'GET',
                                            data: {
                                                id: e.target.id
                                            },
                                            success: function(response) {

                                                $('div.sidebar_feature_content').html('');
                                                $('div.sidebar_feature_content').html(response);
                                            }
                                        });
                                    }
                                    else if (_this._map.drawControl._toolbars.edit._activeMode && _this._map.drawControl._toolbars.edit._activeMode.handler.type === 'edit') {

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
                                    }
                                    ;
                                });
                                layer.layer = _this._map.drawnItems;
                                _this._map.drawnItems.addLayer(feature);
                            }
                        });
                        return;
                    }

                    if (result.success === true && (result.type === 'topojsonfile' || result.type === 'topojson' || result.type === 'shapefile_topojson')) {

                        var sld;
                        if (typeof result.sld === 'object') {
                            sld = result.sld;
                        }
                        else
                        {
                            if (result.sld !== undefined && result.sld.trim().length > 100)
                                sld = JSON.parse(result.sld);
                        }



                        d3.selectAll("#svg-leaflet-d3").each(function() {
                            var elt = d3.select(this);
                            if (elt.attr("filename").toString().toLowerCase() === result.filename.toString().toLowerCase() && elt.attr("layerType").toString().toLowerCase() === layer.layerType)
                                elt.remove();
                        });
                        var keys = Object.keys(result.data, function(k) {
                            return k;
                        });
                        for (var k = 0; k < keys.length; k++) {
                            var json_data = JSON.parse(result.data[keys[k]].geom); //JSON.parse(result.data[keys[k]]);
                            //           var json_data = JSON.parse(result.data);
                            var key = Object.keys(json_data.objects).map(function(k) {
                                return  k;
                            });
                            var properties_key = Object.keys(json_data.objects[key].geometries[0].properties).map(function(k) {
                                return  k;
                            });
                            var collection = topojson.feature(json_data, json_data.objects[key]);
//                            control.createD3SVGLayer(layer, collection, sld, {
//                                layer_id: layer.layer_id,
//                                zIndex: (300 - layer.index_id),
//                                minZoom: layer.minZoom,
//                                maxZoom: layer.maxZoom,
//                                filename: result.filename.toLowerCase(),
//                                filetype: result.filetype.toLowerCase(),
//                                showLabels: (result.layers[keys[k]]['label_field'] !== '' && result.layers[keys[k]]['label_field'] !== null),
//                                type: result.type,
//                                tip_field: result.layers[keys[k]]['tip_field'],
//                                label_field: result.layers[keys[k]]['label_field']
//                            });
                            var geojson_shapefile = new L.D3(collection, {
                                id: 'svg-leaflet-d3',
                                layer_id: layer.layer_id,
                                zIndex: (300 - layer.index_id),
                                minZoom: layer.minZoom,
                                maxZoom: layer.maxZoom,
                                layerType: layer.layerType,
                                sld: sld,
                                filename: result.filename.toLowerCase(),
                                filetype: result.filetype.toLowerCase(),
                                showLabels: (result.layers[keys[k]]['label_field'] !== '' && result.layers[keys[k]]['label_field'] !== null),
                                type: result.type,
                                tip_field: result.layers[keys[k]]['tip_field'],
                                label_field: result.layers[keys[k]]['label_field'],
                                featureAttributes: {
                                    'layer_id': result.layers[keys[k]]['id'],
                                    'class': function(feature) {
                                        return 'default_fcls';
                                    }
                                }
                            });
                            geojson_shapefile.addTo(_this._map);
                            geojson_shapefile.onLoadSLD(sld);
                            layer.layer = geojson_shapefile;
                            geojson_shapefile.on('click', function(e) {
                                //   if (parseInt(e.target.options.layer_id) === parseInt($("select#activelayer_id.layers-ui").val())) {

                                var mouse = d3.mouse(e.element);
                                var shapefilename = $('.sonata-bc #shapefile_select_list option:selected').map(function() {
                                    return  this.text;
                                });
                                if (shapefilename !== null && shapefilename !== '' && shapefilename[0] !== undefined && geojson_shapefile.options.filename === shapefilename[0].toLowerCase())
                                {

                                    if ($('#geometries_selected').length > 0)
                                    {
                                        var bExist = false;
                                        $("#geometries_selected > option").each(function() {

                                            if (parseInt(this.value) === parseInt(e.data.properties[properties_key[0]])) {
                                                bExist = true;
                                            }
                                        });
                                        if (bExist === false)
                                        {
                                            var fieldkey = $('.sonata-bc #shapefile_labelfield_list option:selected').map(function() {
                                                return  this.text;
                                            });
                                            var p;
                                            if (fieldkey === '' || fieldkey[0] === '' || fieldkey[0] === undefined)
                                                p = e.data.properties[properties_key[1]];
                                            else
                                                p = e.data.properties[fieldkey[0]];
                                            if (document.getElementById('geometries_selected')) {
                                                var selectBoxOption = document.createElement("option"); //create new option 
                                                selectBoxOption.value = e.data.properties[properties_key[0]]; //set option value 
                                                selectBoxOption.text = p; //set option display text 
                                                document.getElementById('geometries_selected').add(selectBoxOption, null);
                                                //    alert(properties_key[0]+ ':'+ e.data.properties[properties_key[0]] + "\n" + properties_key[1] +':' + e.data.properties[properties_key[1]]);
                                            }
                                        }
                                    }
                                }
                                ;
                                //  }
                                var html = '';
                                for (var key in e.data.properties) {
                                    if (e.data.properties.hasOwnProperty(key)) {
                                        //alert(e.data.properties[key].substring(0, 5));
                                        if (e.data.properties[key] !== 'null' && e.data.properties[key] !== null && e.data.properties[key] !== undefined && e.data.properties[key].length > 10 && (key === 'website' || e.data.properties[key].substring(0, 5) === 'http:'))
                                            html = html + key + ":<a href='" + e.data.properties[key] + "' target='_blank'>" + e.data.properties[key] + "</a><br>";
                                        else
                                            html = html + key + ":" + e.data.properties[key] + "<br>";
                                    }
                                }
                                $('div.sidebar_feature_content').html('');
                                $('div.sidebar_feature_content').html(html);
                            });
                            geojson_shapefile.on("mouseover", function(e) {
                                e.element.fill = $(e.element).css('fill');
                                d3.select(e.element).style({'fill': 'red', 'fill-opacity': '0.8'});
                                d3.select(e.element).style('cursor', 'pointer');
                            });
                            geojson_shapefile.on('mousemove', function(e) {

                                //    if (parseInt(e.target.options.layer_id) === parseInt($("select#activelayer_id.layers-ui").val())) {

                                var shapefilename = $('.sonata-bc #shapefile_select_list option:selected').map(function() {
                                    return  this.text;
                                });
                                if (shapefilename === '' || shapefilename[0] === undefined || geojson_shapefile.options.filename === shapefilename[0].toLowerCase())
                                {
                                    var p;
                                    var fieldkey = '';
                                    var mouse = L.DomEvent.getMousePosition(e.originalEvent, _this._map._container);
                                    fieldkey = $('.sonata-bc #shapefile_labelfield_list option:selected').map(function() {
                                        return  this.text;
                                    });
                                    if (e.target.options.tip_field !== undefined && e.target.options.tip_field !== '' && e.target.options.tip_field !== null) {
                                        p = e.data.properties[e.target.options.tip_field ];
                                    }
                                    else {
                                        if (fieldkey === undefined || fieldkey === null || fieldkey === '' || (typeof fieldkey === 'object' && (fieldkey[0] === null || fieldkey[0] === '' || fieldkey[0] === undefined)))
                                            p = e.data.properties[properties_key[1]];
                                        else
                                            p = e.data.properties[fieldkey[0]];
                                    }
                                    options.map_tooltip.classed("hidden", false)
                                            .attr("style", "left:" + (mouse.x + 30) + "px;top:" + (mouse.y - 35) + "px")
                                            .html(p);
                                }
                                // }
                            });
                            geojson_shapefile.on('mouseout', function(e) {
                                options.map_tooltip.classed("hidden", true);
                                d3.select(e.element).style({'fill': e.element.fill});
                                d3.select(e.element).style('cursor', 'default');
                            });
                        }

                        //            var bound = d3.geo.bounds(collection);

                        //          map.fitBounds([[bound[0][1], bound[0][0]], [bound[1][1], bound[1][0]]]);

                    }
                }
            });
        }
    };
    control.createHeatMapLayer = function(opt) {

        var testData;
        if (opt && opt.data)
            testData = opt.data;
        else
            testData = {
                min: 0,
                max: 11,
                data: [{lat: 24.6408, lng: 46.7728, count: 3}, {lat: 50.75, lng: -1.55, count: 1}, {lat: 52.6333, lng: 1.75, count: 1}, {lat: 48.15, lng: 9.4667, count: 1}, {lat: 52.35, lng: 4.9167, count: 2}, {lat: 60.8, lng: 11.1, count: 1}, {lat: 43.561, lng: -116.214, count: 1}, {lat: 47.5036, lng: -94.685, count: 1}, {lat: 42.1818, lng: -71.1962, count: 1}, {lat: 42.0477, lng: -74.1227, count: 1}, {lat: 40.0326, lng: -75.719, count: 1}, {lat: 40.7128, lng: -73.2962, count: 2}, {lat: 27.9003, lng: -82.3024, count: 1}, {lat: 38.2085, lng: -85.6918, count: 1}, {lat: 46.8159, lng: -100.706, count: 1}, {lat: 30.5449, lng: -90.8083, count: 1}, {lat: 44.735, lng: -89.61, count: 1}, {lat: 41.4201, lng: -75.6485, count: 2}, {lat: 39.4209, lng: -74.4977, count: 11}, {lat: 39.7437, lng: -104.979, count: 1}, {lat: 39.5593, lng: -105.006, count: 1}, {lat: 45.2673, lng: -93.0196, count: 1}, {lat: 41.1215, lng: -89.4635, count: 1}, {lat: 43.4314, lng: -83.9784, count: 1}, {lat: 43.7279, lng: -86.284, count: 1}, {lat: 40.7168, lng: -73.9861, count: 1}, {lat: 47.7294, lng: -116.757, count: 1}, {lat: 47.7294, lng: -116.757, count: 2}, {lat: 35.5498, lng: -118.917, count: 1}, {lat: 34.1568, lng: -118.523, count: 1}, {lat: 39.501, lng: -87.3919, count: 3}, {lat: 33.5586, lng: -112.095, count: 1}, {lat: 38.757, lng: -77.1487, count: 1}, {lat: 33.223, lng: -117.107, count: 1}, {lat: 30.2316, lng: -85.502, count: 1}, {lat: 39.1703, lng: -75.5456, count: 8}, {lat: 30.0041, lng: -95.2984, count: 2}, {lat: 29.7755, lng: -95.4152, count: 1}, {lat: 41.8014, lng: -87.6005, count: 1}, {lat: 37.8754, lng: -121.687, count: 7}, {lat: 38.4493, lng: -122.709, count: 1}, {lat: 40.5494, lng: -89.6252, count: 1}, {lat: 42.6105, lng: -71.2306, count: 1}, {lat: 40.0973, lng: -85.671, count: 1}, {lat: 40.3987, lng: -86.8642, count: 1}, {lat: 40.4224, lng: -86.8031, count: 4}, {lat: 47.2166, lng: -122.451, count: 1}, {lat: 32.2369, lng: -110.956, count: 1}, {lat: 41.3969, lng: -87.3274, count: 2}, {lat: 41.7364, lng: -89.7043, count: 2}, {lat: 42.3425, lng: -71.0677, count: 1}, {lat: 33.8042, lng: -83.8893, count: 1}, {lat: 36.6859, lng: -121.629, count: 2}, {lat: 41.0957, lng: -80.5052, count: 1}, {lat: 46.8841, lng: -123.995, count: 1}, {lat: 40.2851, lng: -75.9523, count: 2}, {lat: 42.4235, lng: -85.3992, count: 1}, {lat: 39.7437, lng: -104.979, count: 2}, {lat: 25.6586, lng: -80.3568, count: 7}, {lat: 33.0975, lng: -80.1753, count: 1}, {lat: 25.7615, lng: -80.2939, count: 1}, {lat: 26.3739, lng: -80.1468, count: 1}, {lat: 37.6454, lng: -84.8171, count: 1}, {lat: 34.2321, lng: -77.8835, count: 1}, {lat: 34.6774, lng: -82.928, count: 1}, {lat: 39.9744, lng: -86.0779, count: 1}, {lat: 35.6784, lng: -97.4944, count: 2}, {lat: 33.5547, lng: -84.1872, count: 1}, {lat: 27.2498, lng: -80.3797, count: 1}, {lat: 41.4789, lng: -81.6473, count: 1}, {lat: 41.813, lng: -87.7134, count: 1}, {lat: 41.8917, lng: -87.9359, count: 1}, {lat: 35.0911, lng: -89.651, count: 1}, {lat: 32.6102, lng: -117.03, count: 1}, {lat: 41.758, lng: -72.7444, count: 1}, {lat: 39.8062, lng: -86.1407, count: 1}, {lat: 41.872, lng: -88.1662, count: 1}, {lat: 34.1404, lng: -81.3369, count: 1}, {lat: 46.15, lng: -60.1667, count: 1}, {lat: 36.0679, lng: -86.7194, count: 1}, {lat: 43.45, lng: -80.5, count: 1}, {lat: 44.3833, lng: -79.7, count: 1}, {lat: 45.4167, lng: -75.7, count: 2}, {lat: 43.75, lng: -79.2, count: 2}, {lat: 45.2667, lng: -66.0667, count: 3}, {lat: 42.9833, lng: -81.25, count: 2}, {lat: 44.25, lng: -79.4667, count: 3}, {lat: 45.2667, lng: -66.0667, count: 2}, {lat: 34.3667, lng: -118.478, count: 3}, {lat: 42.734, lng: -87.8211, count: 1}, {lat: 39.9738, lng: -86.1765, count: 1}, {lat: 33.7438, lng: -117.866, count: 1}, {lat: 37.5741, lng: -122.321, count: 1}, {lat: 42.2843, lng: -85.2293, count: 1}, {lat: 34.6574, lng: -92.5295, count: 1}, {lat: 41.4881, lng: -87.4424, count: 1}, {lat: 25.72, lng: -80.2707, count: 1}, {lat: 34.5873, lng: -118.245, count: 1}, {lat: 35.8278, lng: -78.6421, count: 1}]
            };

        var legendCanvas = document.createElement('canvas');
        if (opt && opt.legend && opt.legend.legendCanvas && opt.legend.legendCanvas.width)
            legendCanvas.width = opt.legendCanvas.width;
        else
            legendCanvas.width = 100;
        legendCanvas.height = 10;
        var legend;
        if (opt && opt.legend && opt.legend.element)
            legend = $(opt.legend.element);
        else
            legend = $("#sidebar-left #sidebar_content");
        legend.empty();
        var legend_title;
        if (opt && opt.legend && opt.legend.title)
            legend_title = opt.legend.title;
        else
            legend_title = "Descriptive Legend Title";
        var opacity;
        if (opt && opt.maxOpacity)
            opacity = opt.maxOpacity;
        else
            opacity = 0.8;
        var radius;
        if (opt && opt.radius)
            radius = opt.radius;
        else
            radius = 2;
        var scaleRadius;
        if (opt && opt.scaleRadius)
            scaleRadius = opt.scaleRadius;
        else
            scaleRadius = true;
        var useLocalExtrema;
        if (opt && opt.useLocalExtrema)
            useLocalExtrema = opt.useLocalExtrema;
        else
            useLocalExtrema = false;

        $('<div id="heatmapLegend"><h4>' + legend_title + '</h4><span id="min" style="float:left;"></span><span id="max" style="float:right;"></span><img id="gradient" src="" style="width:100%" /></div>').appendTo(legend);

        var legendCtx = legendCanvas.getContext('2d');
        var gradientCfg = {};

        var cfg = {
            // radius should be small ONLY if scaleRadius is true (or small radius is intended)
            "radius": radius,
            "maxOpacity": opacity,
            // scales the radius based on map zoom
            "scaleRadius": scaleRadius,
            //  "gradient": {0.45: "rgb(0,0,255)", 0.55: "rgb(0,255,255)", 0.65: "rgb(0,255,0)", 0.95: "yellow", 1.0: "rgb(255,0,0)"},

            // if set to false the heatmap uses the global maximum for colorization
            // if activated: uses the data maximum within the current map boundaries 
            //   (there will always be a red spot with useLocalExtremas true)
            "useLocalExtrema": useLocalExtrema,
            // update the legend whenever there's an extrema change
            onExtremaChange: function(data) {
                // control.updateLegend(data);

                // the onExtremaChange callback gives us min, max, and the gradientConfig
                // so we can update the legend
                $('#heatmapLegend #min').html(data.min);
                $('#heatmapLegend #max').html(data.max);
                // regenerate gradient image
                if (data.gradient !== gradientCfg) {
                    gradientCfg = data.gradient;
                    var gradient = legendCtx.createLinearGradient(0, 0, legendCanvas.width, 1);
                    for (var key in gradientCfg) {
                        gradient.addColorStop(key, gradientCfg[key]);
                    }

                    legendCtx.fillStyle = gradient;
                    legendCtx.fillRect(0, 0, 100, 10);
                    $('#heatmapLegend #gradient').attr('src', legendCanvas.toDataURL());


                }
            },
            // which field name in your data represents the latitude - default "lat"
            latField: 'lat',
            // which field name in your data represents the longitude - default "lng"
            lngField: 'lng',
            // which field name in your data represents the data value - default "value"
            valueField: 'count'
        };

        var heatmapLayer = new HeatmapOverlay(cfg);
        heatmapLayer.onAdd(this._map);
        heatmapLayer.setData(testData);
        control.heatmap_layer = heatmapLayer;
        var _this = this;
        this._map.on("resize", function() {
            var size = _this._map.getSize();
            heatmapLayer._width = size.x;
            heatmapLayer._height = size.y;
            heatmapLayer._el.style.width = size.x + 'px';
            heatmapLayer._el.style.height = size.y + 'px';
            heatmapLayer._heatmap._width = size.x;
            heatmapLayer._heatmap._height = size.y;
            heatmapLayer._heatmap._renderer.setDimensions(size.x, size.y);
            heatmapLayer._heatmap._renderer.renderAll(heatmapLayer._heatmap._store._getInternalData());
            heatmapLayer._draw();
        });
    };
    control.renderD3Layer = function(layer, collection, sld, opt) {
        var _this = this;
        var d3_layer = new L.D3(collection, opt);
        var properties_key = Object.keys(collection.features[0].properties).map(function(k) {
            return  k;
        });
        d3_layer.addTo(_this._map);
        d3_layer.onLoadSLD(sld);
        layer.layer = d3_layer;
        d3_layer.on('click', function(e) {
            //   if (parseInt(e.target.options.layer_id) === parseInt($("select#activelayer_id.layers-ui").val())) {

            var mouse = d3.mouse(e.element);
            var shapefilename = $('.sonata-bc #shapefile_select_list option:selected').map(function() {
                return  this.text;
            });
            if (shapefilename !== '' && shapefilename[0] !== undefined && d3_layer.options.name === shapefilename[0].toLowerCase())
            {

                if ($('#geometries_selected').length > 0)
                {
                    var bExist = false;
                    $("#geometries_selected > option").each(function() {

                        if (parseInt(this.value) === parseInt(e.data.properties[properties_key[0]])) {
                            bExist = true;
                        }
                    });
                    if (bExist === false)
                    {
                        var fieldkey = $('.sonata-bc #shapefile_labelfield_list option:selected').map(function() {
                            return  this.text;
                        });
                        var p;
                        if (fieldkey === '' || fieldkey[0] === '' || fieldkey[0] === undefined)
                            p = e.data.properties[properties_key[1]];
                        else
                            p = e.data.properties[fieldkey[0]];
                        if (document.getElementById('geometries_selected')) {
                            var selectBoxOption = document.createElement("option"); //create new option 
                            selectBoxOption.value = e.data.properties[properties_key[0]]; //set option value 
                            selectBoxOption.text = p; //set option display text 
                            document.getElementById('geometries_selected').add(selectBoxOption, null);
                            //    alert(properties_key[0]+ ':'+ e.data.properties[properties_key[0]] + "\n" + properties_key[1] +':' + e.data.properties[properties_key[1]]);
                        }
                    }
                }
            }
            ;
            //  }
            var html = '';
            for (var key in e.data.properties) {
                if (e.data.properties.hasOwnProperty(key)) {
                    //   alert(e.data.properties[key]);
                    if (key === 'website' || (e.data.properties[key] !== null && e.data.properties[key] !== undefined && e.data.properties[key].length > 10 && e.data.properties[key].substr(0, 5) === 'http:'))
                        html = html + key + ":<a href='" + e.data.properties[key] + "' target='_blank'>" + e.data.properties[key] + "</a><br>";
                    else
                        html = html + key + ":" + e.data.properties[key] + "<br>";
                }
            }
            $('#sidebar-left #sidebar_content').html('');
            $('#sidebar-left #sidebar_content').html(html);
        });
        d3_layer.on("mouseover", function(e) {
            e.element.fill = $(e.element).css('fill');
            d3.select(e.element).style({'fill': 'red', 'fill-opacity': '0.8'});
            d3.select(e.element).style('cursor', 'pointer');
        });
        d3_layer.on('mousemove', function(e) {

            //    if (parseInt(e.target.options.layer_id) === parseInt($("select#activelayer_id.layers-ui").val())) {

            var shapefilename = $('.sonata-bc #shapefile_select_list option:selected').map(function() {
                return  this.text;
            });
            if (shapefilename === '' || shapefilename[0] === undefined || d3_layer.options.name === shapefilename[0].toLowerCase())
            {
                var p;
                var fieldkey = '';
                var mouse = L.DomEvent.getMousePosition(e.originalEvent, _this._map._container);
                fieldkey = $('.sonata-bc #shapefile_labelfield_list option:selected').map(function() {
                    return  this.text;
                });
                if (e.target.options.tip_field !== '') {
                    p = e.data.properties[e.target.options.tip_field ];
                }
                else {
                    if (fieldkey === '' || fieldkey[0] === '' || fieldkey[0] === undefined)
                        p = e.data.properties[properties_key[1]];
                    else
                        p = e.data.properties[fieldkey[0]];
                }
                options.map_tooltip.classed("hidden", false)
                        .attr("style", "left:" + (mouse.x + 30) + "px;top:" + (mouse.y - 35) + "px")
                        .html(p);
            }
            // }
        });
        d3_layer.on('mouseout', function(e) {
            options.map_tooltip.classed("hidden", true);
            d3.select(e.element).style({'fill': e.element.fill});
            d3.select(e.element).style('cursor', 'default');
        });
        if (opt.thematicmap && opt.thematicmap.thematicmap === true) {
            if (d3_layer.options) {
                d3_layer.options.thematicmap = true;
                d3_layer.options.thematicmap_rule = opt.thematicmap;
                if (d3_layer.renderThematicMap)
                    d3_layer.renderThematicMap(d3_layer.options.thematicmap_rule);
            }
        }
    };
    control.renderClusterLayer = function(layer, collection) {
        var _this = this;

        //    _this._map.spin(true);

//                 
        var properties_key = Object.keys(collection.features[0].properties).map(function(k) {
            return  k;
        });

//                var rmax = 30;
//                var highlightStyle = {
//                    color: '#2262CC',
//                    weight: 3,
//                    opacity: 0.6,
//                    fillOpacity: 0.65,
//                    fillColor: '#2262CC'
//                };
        var geoJsonLayer = L.geoJson(collection, {
            id: "9",
            style: {
                fillColor: "#A3C990",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.4
            },
            pointToLayer: function(feature, latlng) {
                return new L.CircleMarker(latlng, {
                    radius: 5,
                    fillColor: "#A3C990",
                    color: "#000",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.4
                });
            },
            onEachFeature: function(feature, layer) {
                (function(layer, properties) {
                    layer.on('mouseover', function(e) {
                        var layer = e.target;
                        layer.setStyle({
                            weight: 2,
                            color: 'red',
                            dashArray: '',
                            cursor: 'pointer',
                            fillOpacity: 0.7
                        });
                        //    $(this).fill = $(this).css('fill');
                        //    $(this).fill_opacity = $(this).css('fill-opacity');
                        // d3.select(e.target).style({'fill': 'red'});
//                                                $(e.target).css('fill', 'red');
//                                                $(e.target).css('fill-opacity', '0.8');
                        $(this).css('cursor', 'pointer');
                    });
                    layer.on('mouseout', function(e) {


                        geoJsonLayer.resetStyle(e.target);
                        options.map_tooltip.classed("hidden", true);
                        //      $(this).css('fill', $(this).fill);
                        //      $(this).css('fill-opacity', $(this).fill_opacity);
                        $(this).css('cursor', 'default');
                    });
                    layer.on('mousemove', function(e) {                         //    if (parseInt(e.target.options.layer_id) === parseInt($("select#activelayer_id.layers-ui").val())) {

                        var shapefilename = $('.sonata-bc #shapefile_select_list option:selected').map(function() {
                            return  this.text;
                        });
                        if (shapefilename === '' || shapefilename[0] === undefined)
                        {
                            var p;
                            var fieldkey = '';
                            var mouse = L.DomEvent.getMousePosition(e.originalEvent, _this._map._container);
                            fieldkey = $('.sonata-bc #shapefile_labelfield_list option:selected').map(function() {
                                return  this.text;
                            });
                            if (e.target.options.tip_field !== undefined && e.target.options.tip_field !== '' && e.target.options.tip_field !== null) {
                                p = properties[e.target.options.tip_field ];
                            }
                            else {

                                if (fieldkey === undefined || fieldkey === null || fieldkey === '' || (typeof fieldkey === 'object' && (fieldkey[0] === null || fieldkey[0] === '' || fieldkey[0] === undefined)))
                                    p = properties[properties_key[1]];
                                else
                                    p = properties[fieldkey[0]];
                            }
                            options.map_tooltip.classed("hidden", false)
                                    .attr("style", "left:" + (mouse.x + 30) + "px;top:" + (mouse.y - 35) + "px")
                                    .html(p);
                        }

                    });
                    layer.on('click', function(e) {
                        var html = '';
                        for (var key in properties) {
                            if (properties.hasOwnProperty(key)) {
                                //alert(e.data.properties[key].substring(0, 5));
                                if (properties[key] !== 'null' && properties[key] !== null && properties[key] !== undefined && properties[key].length > 10 && (key === 'website' || properties[key].substring(0, 5) === 'http:'))
                                    html = html + key + ":<a href='" + properties[key] + "' target='_blank'>" + properties[key] + "</a><br>";
                                else
                                    html = html + key + ":" + properties[key] + "<br>";
                            }
                        }
                        $('#sidebar-left #sidebar_content').html('');
                        $('#sidebar-left #sidebar_content').html(html);
                    });
                })(layer, feature.properties);
                //layer.bindPopup(feature.properties.Name);
            }
        });
        var markerclusters = new L.MarkerClusterGroup({
            maxClusterRadius: 80,
//                                    iconCreateFunction: function(cluster) {
//                                        var markers = cluster.getAllChildMarkers();
//                                        var n = 0;
//                                        for (var i = 0; i < markers.length; i++) {
//                                            n += markers[i].number;
//                                        }
//                                        return L.divIcon({html: n, className: 'mycluster', iconSize: L.point(40, 40)});
//                                    },
            //Disable all of the defaults:
            spiderfyOnMaxZoom: true, showCoverageOnHover: true, zoomToBoundsOnClick: true
        });
        markerclusters.addLayer(geoJsonLayer, true);
        //   _this._map.addLayer(markerclusters);
        //   geoJsonLayer.addTo(_this._map);
        markerclusters.addTo(_this._map);
        layer.layer = markerclusters;

        //  _this._map.spin(false);

//var markers = new L.MarkerClusterGroup();
//
//			for (var i = 0; i < addressPoints.length; i++) {
//				var a = addressPoints[i];
//				var title = a[2];
//				var marker = new L.Marker(new L.LatLng(a[0], a[1]), { title: title });
//				marker.bindPopup(title);
//				markers.addLayer(marker);
//			}
//			for (var i = 0; i < addressPoints2.length; i++) {
//				var a = addressPoints[i];
//				var title = a[2];
//				var marker = new L.Marker(new L.LatLng(a[0], a[1]), { title: title });
//				marker.bindPopup(title);
//				markers.addLayer(marker);
//			}
//
//			map.addLayer(markers);


    };
    control.defineClusterIcon = function(cluster) {
        var children = cluster.getAllChildMarkers(),
                n = children.length, //Get number of markers in cluster
                strokeWidth = 1, //Set clusterpie stroke width
                //  r = rmax - 2 * strokeWidth - (n < 10 ? 12 : n < 100 ? 8 : n < 1000 ? 4 : 0), //Calculate clusterpie radius...
                iconDim = (20 + strokeWidth) * 2, //r + strokeWidth) * 2, //...and divIcon dimensions (leaflet really want to know the size)
                data = d3.nest() //Build a dataset for the pie chart
                .key(function(d) {
                    return d.feature.properties[0];
                })
                .entries(children, d3.map),
                //bake some svg markup
                html = bakeThePie({data: data,
                    valueFunc: function(d) {
                        return d.values.length;
                    },
                    strokeWidth: 1,
                    outerRadius: 20, //r,
                    innerRadius: 10, //r - 10,
                    pieClass: 'cluster-pie',
                    pieLabel: n,
                    pieLabelClass: 'marker-cluster-pie-label',
                    pathClassFunc: function(d) {
                        return "category-" + d.data.key;
                    },
                    pathTitleFunc: function(d) {
                        return 10; //metadata.fields[categoryField].lookup[d.data.key] + ' (' + d.data.values.length + ' accident' + (d.data.values.length != 1 ? 's' : '') + ')';
                    }
                }),
                //Create a new divIcon and assign the svg markup to the html property
                myIcon = new L.DivIcon({
                    html: html,
                    className: 'marker-cluster',
                    iconSize: new L.Point(iconDim, iconDim)
                });
        return myIcon;
    };
    /*function that generates a svg markup for the pie chart*/
    control.bakeThePie = function(options) {
        /*data and valueFunc are required*/
        if (!options.data || !options.valueFunc) {
            return '';
        }
        var data = options.data,
                valueFunc = options.valueFunc,
                r = options.outerRadius ? options.outerRadius : 28, //Default outer radius = 28px
                rInner = options.innerRadius ? options.innerRadius : r - 10, //Default inner radius = r-10
                strokeWidth = options.strokeWidth ? options.strokeWidth : 1, //Default stroke is 1
                pathClassFunc = options.pathClassFunc ? options.pathClassFunc : function() {
                    return '';
                }, //Class for each path
                pathTitleFunc = options.pathTitleFunc ? options.pathTitleFunc : function() {
                    return '';
                }, //Title for each path
                pieClass = options.pieClass ? options.pieClass : 'marker-cluster-pie', //Class for the whole pie
                pieLabel = options.pieLabel ? options.pieLabel : d3.sum(data, valueFunc), //Label for the whole pie
                pieLabelClass = options.pieLabelClass ? options.pieLabelClass : 'marker-cluster-pie-label', //Class for the pie label

                origo = (r + strokeWidth), //Center coordinate
                w = origo * 2, //width and height of the svg element
                h = w,
                donut = d3.layout.pie(),
                arc = d3.svg.arc().innerRadius(rInner).outerRadius(r);
        //Create an svg element
        var svg = document.createElementNS(d3.ns.prefix.svg, 'svg');
        //Create the pie chart
        var vis = d3.select(svg)
                .data([data])
                .attr('class', pieClass)
                .attr('width', w)
                .attr('height', h);
        var arcs = vis.selectAll('g.arc')
                .data(donut.value(valueFunc))
                .enter().append('svg:g')
                .attr('class', 'arc')
                .attr('transform', 'translate(' + origo + ',' + origo + ')');
        arcs.append('svg:path')
                .attr('class', pathClassFunc)
                .attr('stroke-width', strokeWidth)
                .attr('d', arc)
                .append('svg:title')
                .text(pathTitleFunc);
        vis.append('text')
                .attr('x', origo)
                .attr('y', origo)
                .attr('class', pieLabelClass)
                .attr('text-anchor', 'middle')
                //.attr('dominant-baseline', 'central')
                /*IE doesn't seem to support dominant-baseline, but setting dy to .3em does the trick*/
                .attr('dy', '.3em')
                .text(pieLabel);
        //Return the svg-markup rather than the actual element
        return serializeXmlNode(svg);
    };
    /*Function for generating a legend with the same categories as in the clusterPie*/
    control.renderLegend = function() {
        var data = d3.entries(metadata.fields[categoryField].lookup),
                legenddiv = d3.select('body').append('div')
                .attr('id', 'legend');
        var heading = legenddiv.append('div')
                .classed('legendheading', true)
                .text(metadata.fields[categoryField].name);
        var legenditems = legenddiv.selectAll('.legenditem')
                .data(data);
        legenditems
                .enter()
                .append('div')
                .attr('class', function(d) {
                    return 'category-' + d.key;
                })
                .classed({'legenditem': true})
                .text(function(d) {
                    return d.value;
                });
    };
    /*Helper function*/
    control.serializeXmlNode = function(xmlNode) {
        if (typeof window.XMLSerializer !== "undefined") {
            return (new window.XMLSerializer()).serializeToString(xmlNode);
        } else if (typeof xmlNode.xml !== "undefined") {
            return xmlNode.xml;
        }
        return "";
    };
    control.refreshOverlays = function() {


        var _this = this;
        var overlay_layers_ul = $(".leaflet-control-container .section.overlay-layers > ul");
        overlay_layers_ul.html('');
        $("select#activelayer_id.layers-ui").empty();
        _this._map.dataLayers.forEach(function(layer) {



            //          addOverlay(layer, activeLayerSelect,OSM.MAX_NOTE_REQUEST_AREA);

            var item = $('<li>')
                    .tooltip({
                        placement: 'top'
                    })
                    .appendTo(overlay_layers_ul);
            var label = $('<label>')
                    .appendTo(item);
            var checked = _this._map.hasLayer(layer.layer);
            var input = $('<input>')
                    .attr('type', 'checkbox')
                    .prop('checked', checked)
                    .appendTo(label);
            var legend_label = I18n.t('javascripts.map.layers.' + layer.name);
            if (legend_label.indexOf('missing ') === 1)
            {
                label.append(layer.name);
                $("select#activelayer_id.layers-ui").append("<option value='" + layer.index_id + "'>" + layer.name + "</option>");
            }
            else
            {
                label.append(legend_label);
                $("select#activelayer_id.layers-ui").append("<option value='" + layer.index_id + "'>" + legend_label + "</option>");
            }

            input.on('change', function() {
                checked = input.is(':checked');
                if (checked) {
                    if (!layer.layer)
                    {
                        control.loadLayer(layer);
//                        if (layer.layerType === 'leafletcluster') {
//
//                            control.loadClusterLayer(layer);
//                        }
//                        else {
//
////                        control.loadGeoJSONLayer(layer);
//                            control.loadTopoJSONLayer(layer);
//                        }
                    }
                    else
                    {
//                        if (layer.type === 'geojson' || layer.name === 'My draw geometries') {
//                            //                           control.loadGeoJSONLayer(layer);
//                            control.loadTopoJSONLayer(layer);
//                        }
                        if (layer.layer)
                            _this._map.addLayer(layer.layer);
                    }
                } else {
//                    if (layer.type === 'shapefile_topojson') {
//
//
//                    }
//                    if (layer.type === 'geojson' || layer.name === 'My draw geometries') {
//
//                    }
                    if (layer.layer)
                        _this._map.removeLayer(layer.layer);
                }
                if (layer.layer)
                    _this._map.fire('overlaylayerchange', {layer: layer.layer});
            });
            if (layer.type === 'shapefile_topojson')
            {
                var ul = $('<ul>');
                var li_showlabel = $('<li>');
                ul.append(li_showlabel);
                label.append("<br>");
                item.append(ul);
                var showlabel = $('<label>')
                        .appendTo(li_showlabel);
                var showlabel_input = $('<input>')
                        .attr('type', 'checkbox')
                        .prop('checked', checked)
                        .appendTo(showlabel);
                showlabel.append("Labels");
                showlabel_input.on('change', function() {
                    checked = showlabel_input.is(':checked');
                    if (layer.layer)
                    {
                        layer.layer.options.showLabels = checked;
                        if (checked) {
                            var kename = '';
                            var field_kename = [];
                            var shapefilename = $('.sonata-bc #shapefile_select_list option:selected').map(function() {
                                return  this.text;
                            });
                            // only current map is the same with shapefile list selected file name
                            if (shapefilename === '' || shapefilename[0] === undefined || layer.layer.options.name === shapefilename[0].toLowerCase())
                            {
                                field_kename = $('.sonata-bc #shapefile_labelfield_list option:selected').map(function() {
                                    return  this.text;
                                });
                            }
                            if (field_kename.length === 0 && layer.layer.options.label_field !== '' && layer.layer.options.label_field !== null) {
                                kename = layer.layer.options.label_field;
                            }
                            else
                            {
                                if (field_kename[0] === '' || field_kename[0] === null)
                                    kename = undefined;
                                else
                                    kename = field_kename[0];
                            }
                            layer.layer.showFeatureLabels(kename);
                        } else {
                            layer.layer.removeFeatureLabels();
                        }
                    }
                });
            }
            if (layer.defaultShowOnMap === true)
            {
                $(input).prop('checked', true)
                        .trigger('change');
            }
            _this._map.on('zoomend', function() {
                // alert(map.getBounds().toBBoxString());
                // alert(maxArea);
                return;
                var zoom = this.getZoom();
                var mindisplayed = false;
                var maxdisplayed = false;
                var displayed = false;
                if (isNaN(layer.minZoom) || layer.minZoom === undefined || layer.minZoom === null || layer.minZoom === '')
                {
                    mindisplayed = true;
                } else {
                    if (zoom > layer.minZoom)
                        mindisplayed = true;
                }
                if (isNaN(layer.maxZoom) || layer.maxZoom === undefined || layer.maxZoom === null || layer.maxZoom === '')
                {
                    maxdisplayed = true;
                } else {
                    if (zoom < layer.maxZoom)
                        maxdisplayed = true;
                }
                if (maxdisplayed && mindisplayed)
                    displayed = true;
                if ($(input).is(':checked') && displayed === true)
                    displayed = true;
                else
                    displayed = false;
                if (layer.layer) {
                    if (displayed === false) {
                        if (_this._map.hasLayer(layer.layer))
                            _this._map.removeLayer(layer.layer);
                    } else {
                        if (!_this._map.hasLayer(layer.layer))
                            _this._map.addLayer(layer.layer);
                    }

                    //       $(input).prop('checked', checked);

                    if (displayed && !$(input).is(':checked') && layer.layer) {
                        $(input).prop('checked', displayed)
                                .trigger('change');
                    } else if (!displayed && $(input).is(':checked')) {
                        $(input).prop('checked', displayed)
                                .trigger('change');
                    }
                }
                else
                {
                    $(input).prop('checked', false);
                }
//                $(item).attr('class', disabled ? 'disabled' : '');
//                item.attr('data-original-title', disabled ?
//                        I18n.t('javascripts.site.map_' + layer.name + '_zoom_in_tooltip') : '');
            });
        });
        $("select#activelayer_id.layers-ui").trigger('change');
    };

    return control;
};
