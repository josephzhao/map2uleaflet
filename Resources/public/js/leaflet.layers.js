


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
//                        control.loadGeoJSONLayer(layer);
                        control.loadTopoJSONLayer(layer);
                    }
                    else
                    {
                        if (layer.type === 'geojson' || layer.name === 'My draw geometries') {
                            //                           control.loadGeoJSONLayer(layer);
                            control.loadTopoJSONLayer(layer);
                        }
                        if (layer.layer)
                            map.addLayer(layer.layer);
                    }
                } else {
                    if (layer.type === 'shapefile_topojson') {


                    }
                    if (layer.type === 'geojson' || layer.name === 'My draw geometries') {

                    }
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

                var disabled = false;//map.getBounds().getSize() >= maxArea;
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
                            $(layers[i].layer).attr('style', 'z-index:301');
                    } else {
                        if (layers[i].layer)
                            $(layers.layer).attr('style', 'z-index:299');
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
    control.addUploadfile = function(getlayerdata_url, uploadfile_id) {
        var spinner_target = document.getElementById('leafmap');
        var spinner = new Spinner();
        var _this = this;
//        if (options.spinner !== undefined && options.spinner !== null && options.spinner_target !== undefined && options.spinner_target !== null) {
//            options.spinner.spin(options.spinner_target);
//        }
        //       spinner.spin(spinner_target);

        $.ajax({
            url: getlayerdata_url,
            type: 'GET',
            beforeSend: function() {
                if (window.console === undefined || window.console.debug === undefined)
                    spinner.spin(spinner_target);
            },
            complete: function() {
                spinner.stop();

//                if (options.spinner !== undefined && options.spinner !== null) {
//                    options.spinner.stop();
//                }
            },
            //Ajax events
            success: completeHandler = function(response) {

                var result, maplayer;
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
                        _this._map.dataLayers[_this._map.dataLayers.length] = {'defaultShowOnMap': true, 'layerType': 'uploadfile', 'layer': null, 'minZoom': null, 'maxZoom': null, 'index_id': _this._map.dataLayers.length + 1, 'layer_id': result.uploadfile.id, 'title': result.uploadfile.filename, 'filename': result.uploadfile.filename, 'name': result.uploadfile.filename, type: 'topojson'};
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
                                    control.loadTopoJSONLayer(maplayer);
                                }
                                else
                                {
                                    if (maplayer.type === 'geojson' || maplayer.name === 'My draw geometries') {
                                        //                           control.loadGeoJSONLayer(layer);
                                        control.loadTopoJSONLayer(maplayer);
                                    }
                                    if (maplayer.layer)
                                        _this._map.addLayer(maplayer.layer);
                                }
                            } else {
                                if (maplayer.type === 'shapefile_topojson') {


                                }
                                if (maplayer.type === 'geojson' || maplayer.name === 'My draw geometries') {

                                }
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
                return true;
            },
            error: errorHandler = function() {
                spinner.stop();

//                if (options.spinner !== undefined && options.spinner !== null) {
//                    options.spinner.stop();
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
    control.loadGeoJSONLayer = function(layer) {
        var _this = this;
        if (layer.type === 'shapefile_topojson' || layer.type === 'topojson' || layer.type === 'geojson') {
            $.ajax({
                url: Routing.generate('leaflet_maplayer'),
                type: 'GET',
                beforeSend: function() {
                    if (window.console === undefined || window.console.debug === undefined)
                        spinner.spin(spinner_target);
                },
                complete: function() {
                    spinner.stop();
                },
                error: errorHandler = function() {
                    spinner.stop();
                },
                data: {id: layer.layer_id, type: layer.type},
                //Ajax events
                success: completeHandler = function(response) {
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
                                    else if (_this._map.drawControl._toolbars.edit._activeMode && this._map.drawControl._toolbars.edit._activeMode.handler.type === 'edit') {

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

                    if (result.success === true && (result.type === 'topojson' || result.type === 'shapefile_topojson')) {

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
                            var json_data = JSON.parse(result.data[keys[k]].geom);//JSON.parse(result.data[keys[k]]);
                            //           var json_data = JSON.parse(result.data);
                            var key = Object.keys(json_data.objects).map(function(k) {
                                return  k;
                            });
                            var properties_key = Object.keys(json_data.objects[key].geometries[0].properties).map(function(k) {
                                return  k;
                            });
                            var collection = topojson.feature(json_data, json_data.objects[key]);

                            var geojson_shapefile = L.geoJson(collection);
                            geojson_shapefile.addTo(_this._map);
//                            
//                            var geojson_shapefile = new L.D3(collection, {
//                                id: 'svg-shapefile',
//                                layer_id: layer.layer_id,
//                                svgClass: 'svg-shapefile',
//                                zIndex: (300 - layer.index_id),
//                                minZoom: layer.minZoom,
//                                maxZoom: layer.maxZoom,
//                                sld: sld,
//                                name: result.filename.toLowerCase(),
//                                showLabels: (result.layers[keys[k]]['label_field'] !== '' && result.layers[keys[k]]['label_field'] !== null),
//                                type: result.type,
//                                tip_field: result.layers[keys[k]]['tip_field'],
//                                label_field: result.layers[keys[k]]['label_field'],
//                                featureAttributes: {
//                                    'layer_id': result.layers[keys[k]]['id']
//                                }
//                            });
//                            geojson_shapefile.addTo(map);
//                            geojson_shapefile.onLoadSLD(sld);
//                            layer.layer = geojson_shapefile;
//                            geojson_shapefile.on('click', function(e) {
//
//                                var mouse = d3.mouse(e.element);
//                                var shapefilename = $('.sonata-bc #shapefile_select_list option:selected').map(function() {
//                                    return  this.text;
//                                });
//                                if (shapefilename !== '' && shapefilename[0] !== undefined && geojson_shapefile.options.name === shapefilename[0].toLowerCase())
//                                {
//
//                                    if ($('#geometries_selected').length > 0)
//                                    {
//                                        var bExist = false;
//                                        $("#geometries_selected > option").each(function() {
//
//                                            if (parseInt(this.value) === parseInt(e.data.properties[properties_key[0]])) {
//                                                bExist = true;
//                                            }
//                                        });
//                                        if (bExist === false)
//                                        {
//                                            var fieldkey = $('.sonata-bc #shapefile_labelfield_list option:selected').map(function() {
//                                                return  this.text;
//                                            });
//                                            var p;
//                                            if (fieldkey === '' || fieldkey[0] === '' || fieldkey[0] === undefined)
//                                                p = e.data.properties[properties_key[1]];
//                                            else
//                                                p = e.data.properties[fieldkey[0]];
//                                            if (document.getElementById('geometries_selected')) {
//                                                var selectBoxOption = document.createElement("option"); //create new option 
//                                                selectBoxOption.value = e.data.properties[properties_key[0]]; //set option value 
//                                                selectBoxOption.text = p; //set option display text 
//                                                document.getElementById('geometries_selected').add(selectBoxOption, null);
//                                            }
//                                        }
//                                    }
//                                }
//                                ;
//                                //  }
//                                var html = '';
//                                for (var key in e.data.properties) {
//                                    if (e.data.properties.hasOwnProperty(key)) {
//                                        html = html + key + ":" + e.data.properties[key] + "<br>";
//
//                                    }
//                                }
//
//                                $('div.sidebar_feature_content').html('');
//                                $('div.sidebar_feature_content').html(html);


//
//                            });

//                            geojson_shapefile.on("mouseover", function(e) {
//                            });
//                            geojson_shapefile.on('mousemove', function(e) {
//
//                                var shapefilename = $('.sonata-bc #shapefile_select_list option:selected').map(function() {
//                                    return  this.text;
//                                });
//
//                                if (shapefilename === '' || shapefilename[0] === undefined || geojson_shapefile.options.name === shapefilename[0].toLowerCase())
//                                {
//                                    var p;
//
//                                    var fieldkey = '';
//                                    var mouse = L.DomEvent.getMousePosition(e.originalEvent, map._container);
//                                    fieldkey = $('.sonata-bc #shapefile_labelfield_list option:selected').map(function() {
//                                        return  this.text;
//                                    });
//
//                                    if (e.target.options.tip_field !== '') {
//                                        p = e.data.properties[e.target.options.tip_field ];
//                                    }
//                                    else {
//                                        if (fieldkey === '' || fieldkey[0] === '' || fieldkey[0] === undefined)
//                                            p = e.data.properties[properties_key[1]];
//                                        else
//                                            p = e.data.properties[fieldkey[0]];
//                                    }
//                                    leafletmap_tooltip.classed("hidden", false)
//                                            .attr("style", "left:" + (mouse.x + 30) + "px;top:" + (mouse.y - 35) + "px")
//                                            .html(p);
//                                }
//                            });
//                            geojson_shapefile.on('mouseout', function(e) {
//
//                                leafletmap_tooltip.classed("hidden", true);
//
//                            });

                        }
                    }
                }
            });
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
                        //   alert("http://" + layer.hostName);
                        //   alert(layer.name);
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
                    if (window.console === undefined || window.console.debug === undefined)
                        spinner.spin(spinner_target);
                },
                complete: function() {
                    spinner.stop();
                },
                error: errorHandler = function() {
                    spinner.stop();
                },
                data: {id: layer.layer_id, type: layer.type},
                //Ajax events
                success: completeHandler = function(response) {
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
                            var json_data = JSON.parse(result.data[keys[k]].geom);//JSON.parse(result.data[keys[k]]);
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
    control.createHeatMapLayer = function() {

//        
//        // heatmap configuration
//    var config = {
//        element: document.getElementById("heatmapArea"),
//        radius: 30,
//        opacity: 50,
//        legend: {
//            position: 'br',
//            title: 'Example Distribution'
//        }   
//    };
//    
//    //creates and initializes the heatmap
//    var heatmap = heatmapFactory.create(config);
// 
//    // let's get some data
//    var data = {
//        max: 20,
//        data: [
//            { x: 10, y: 20, count: 18 },
//            { x: 25, y: 25, count: 14 },
//            { x: 50, y: 30, count: 20 }
//            // ...
//        ]
//    };
// 
//    heatmap.store.setDataSet(data);
//    
//    
        var testData = {
            max: 31,
            //    data: [{x: 33.5363, y: -117.044, count: 1}, {x: 33.5608, y: -117.24, count: 1}, {x: 38, y: -97, count: 1}, {x: 38.9358, y: -77.1621, count: 1}, {x: 38, y: -97, count: 2}, {x: 54, y: -2, count: 1}, {x: 51.5167, y: -0.7, count: 2}, {x: 51.5167, y: -0.7, count: 6}, {x: 60.3911, y: 5.3247, count: 1}, {x: 50.8333, y: 12.9167, count: 9}, {x: 50.8333, y: 12.9167, count: 1}, {x: 52.0833, y: 4.3, count: 3}, {x: 52.0833, y: 4.3, count: 1}, {x: 51.8, y: 4.4667, count: 16}, {x: 51.8, y: 4.4667, count: 9}, {x: 51.8, y: 4.4667, count: 2}, {x: 51.1, y: 6.95, count: 1}, {x: 13.75, y: 100.517, count: 1}, {x: 18.975, y: 72.8258, count: 1}, {x: 2.5, y: 112.5, count: 2}, {x: 25.0389, y: 102.718, count: 1}, {x: -27.6167, y: 152.733, count: 1}, {x: -33.7667, y: 150.833, count: 1}, {x: -33.8833, y: 151.217, count: 2}, {x: 9.4333, y: 99.9667, count: 1}, {x: 33.7, y: 73.1667, count: 1}, {x: 33.7, y: 73.1667, count: 2}, {x: 22.3333, y: 114.2, count: 1}, {x: 37.4382, y: -84.051, count: 1}, {x: 34.6667, y: 135.5, count: 1}, {x: 37.9167, y: 139.05, count: 1}, {x: 36.3214, y: 127.42, count: 1}, {x: -33.8, y: 151.283, count: 2}, {x: -33.8667, y: 151.225, count: 1}, {x: -37.65, y: 144.933, count: 2}, {x: -37.7333, y: 145.267, count: 1}, {x: -34.95, y: 138.6, count: 1}, {x: -27.5, y: 153.017, count: 1}, {x: -27.5833, y: 152.867, count: 3}, {x: -35.2833, y: 138.55, count: 1}, {x: 13.4443, y: 144.786, count: 2}, {x: -37.8833, y: 145.167, count: 1}, {x: -37.86, y: 144.972, count: 1}, {x: -27.5, y: 153.05, count: 1}, {x: 35.685, y: 139.751, count: 2}, {x: -34.4333, y: 150.883, count: 2}, {x: 14.0167, y: 100.733, count: 2}, {x: 13.75, y: 100.517, count: 5}, {x: -31.9333, y: 115.833, count: 1}, {x: -33.8167, y: 151.167, count: 1}, {x: -37.9667, y: 145.117, count: 1}, {x: -37.8333, y: 145.033, count: 1}, {x: -37.6417, y: 176.186, count: 2}, {x: -37.6861, y: 176.167, count: 1}, {x: -41.2167, y: 174.917, count: 1}, {x: 39.0521, y: -77.015, count: 3}, {x: 24.8667, y: 67.05, count: 1}, {x: 24.9869, y: 121.306, count: 1}, {x: 53.2, y: -105.75, count: 4}, {x: 44.65, y: -63.6, count: 1}, {x: 53.9667, y: -1.0833, count: 1}, {x: 40.7, y: 14.9833, count: 1}, {x: 37.5331, y: -122.247, count: 1}, {x: 39.6597, y: -86.8663, count: 2}, {x: 33.0247, y: -83.2296, count: 1}, {x: 34.2038, y: -80.9955, count: 1}, {x: 28.0087, y: -82.7454, count: 1}, {x: 44.6741, y: -93.4103, count: 1}, {x: 31.4507, y: -97.1909, count: 1}, {x: 45.61, y: -73.84, count: 1}, {x: 49.25, y: -122.95, count: 1}, {x: 49.9, y: -119.483, count: 2}, {x: 32.7825, y: -96.8207, count: 6}, {x: 32.7825, y: -96.8207, count: 7}, {x: 32.7825, y: -96.8207, count: 4}, {x: 32.7825, y: -96.8207, count: 16}, {x: 32.7825, y: -96.8207, count: 11}, {x: 32.7825, y: -96.8207, count: 3}, {x: 32.7825, y: -96.8207, count: 10}, {x: 32.7825, y: -96.8207, count: 5}, {x: 32.7825, y: -96.8207, count: 14}, {x: 41.4201, y: -75.6485, count: 4}, {x: 31.1999, y: -92.3508, count: 1}, {x: 41.9874, y: -91.6838, count: 1}, {x: 30.1955, y: -85.6377, count: 1}, {x: 42.4266, y: -92.358, count: 1}, {x: 41.6559, y: -91.5228, count: 1}, {x: 33.9269, y: -117.861, count: 3}, {x: 41.8825, y: -87.6441, count: 6}, {x: 42.3998, y: -88.8271, count: 1}, {x: 33.1464, y: -97.0902, count: 1}, {x: 47.2432, y: -93.5119, count: 1}, {x: 41.6472, y: -93.46, count: 1}, {x: 36.1213, y: -76.6414, count: 1}, {x: 41.649, y: -93.6275, count: 1}, {x: 44.8547, y: -93.7854, count: 1}, {x: 43.6833, y: -79.7667, count: 1}, {x: 40.6955, y: -89.4293, count: 1}, {x: 37.6211, y: -77.6515, count: 1}, {x: 37.6273, y: -77.5437, count: 3}, {x: 33.9457, y: -118.039, count: 1}, {x: 33.8408, y: -118.079, count: 1}, {x: 40.3933, y: -74.7855, count: 1}, {x: 40.9233, y: -73.9984, count: 1}, {x: 39.0735, y: -76.5654, count: 1}, {x: 40.5966, y: -74.0775, count: 1}, {x: 40.2944, y: -73.9932, count: 2}, {x: 38.9827, y: -77.004, count: 1}, {x: 38.3633, y: -81.8089, count: 1}, {x: 36.0755, y: -79.0741, count: 1}, {x: 51.0833, y: -114.083, count: 2}, {x: 49.1364, y: -122.821, count: 1}, {x: 39.425, y: -84.4982, count: 3}, {x: 38.7915, y: -82.9217, count: 1}, {x: 39.0131, y: -84.2049, count: 1}, {x: 29.7523, y: -95.367, count: 7}, {x: 29.7523, y: -95.367, count: 4}, {x: 41.5171, y: -71.2789, count: 1}, {x: 29.7523, y: -95.367, count: 2}, {x: 32.8148, y: -96.8705, count: 1}, {x: 45.5, y: -73.5833, count: 1}, {x: 40.7529, y: -73.9761, count: 6}, {x: 33.6534, y: -112.246, count: 1}, {x: 40.7421, y: -74.0018, count: 1}, {x: 38.3928, y: -121.368, count: 1}, {x: 32.7825, y: -96.8207, count: 1}, {x: 39.7968, y: -76.993, count: 2}, {x: 40.5607, y: -111.724, count: 1}, {x: 41.2863, y: -75.8953, count: 1}, {x: 26.3484, y: -80.2187, count: 1}, {x: 32.711, y: -117.053, count: 2}, {x: 32.5814, y: -83.6286, count: 3}, {x: 35.0508, y: -80.8186, count: 3}, {x: 35.0508, y: -80.8186, count: 1}, {x: -22.2667, y: 166.45, count: 5}, {x: 50.1167, y: 8.6833, count: 1}, {x: 51.9167, y: 4.5, count: 2}, {x: 54, y: -2, count: 6}, {x: 52.25, y: 21, count: 1}, {x: 49.1, y: 10.75, count: 3}, {x: 51.65, y: 6.1833, count: 1}, {x: 1.3667, y: 103.8, count: 1}, {x: 29.4889, y: -98.3987, count: 11}, {x: 29.3884, y: -98.5311, count: 1}, {x: 41.8825, y: -87.6441, count: 2}, {x: 41.8825, y: -87.6441, count: 1}, {x: 33.9203, y: -84.618, count: 4}, {x: 40.1242, y: -82.3828, count: 1}, {x: 40.1241, y: -82.3828, count: 1}, {x: 43.0434, y: -87.8945, count: 1}, {x: 43.7371, y: -74.3419, count: 1}, {x: 42.3626, y: -71.0843, count: 1}, {x: 4.6, y: -74.0833, count: 1}, {x: 19.7, y: -101.117, count: 1}, {x: 25.6667, y: -100.317, count: 1}, {x: 53.8167, y: 10.3833, count: 1}, {x: 50.8667, y: 6.8667, count: 3}, {x: 55.7167, y: 12.45, count: 2}, {x: 44.4333, y: 26.1, count: 4}, {x: 50.1167, y: 8.6833, count: 2}, {x: 52.5, y: 5.75, count: 4}, {x: 48.8833, y: 8.7, count: 1}, {x: 17.05, y: -96.7167, count: 3}, {x: 23, y: -102, count: 1}, {x: 20.6167, y: -105.25, count: 1}, {x: 23, y: -102, count: 2}, {x: 20.6667, y: -103.333, count: 1}, {x: 21.1167, y: -101.667, count: 1}, {x: 17.9833, y: -92.9167, count: 1}, {x: 20.9667, y: -89.6167, count: 2}, {x: 21.1667, y: -86.8333, count: 1}, {x: 17.9833, y: -94.5167, count: 1}, {x: 18.6, y: -98.85, count: 1}, {x: 16.75, y: -93.1167, count: 1}, {x: 19.4342, y: -99.1386, count: 1}, {x: -10, y: -55, count: 1}, {x: -22.9, y: -43.2333, count: 1}, {x: 15.7833, y: -86.8, count: 1}, {x: 10.4667, y: -64.1667, count: 1}, {x: 7.1297, y: -73.1258, count: 1}, {x: 4, y: -72, count: 2}, {x: 4, y: -72, count: 1}, {x: 6.8, y: -58.1667, count: 1}, {x: 0, y: 0, count: 1}, {x: 48.15, y: 11.5833, count: 2}, {x: 45.8, y: 16, count: 15}, {x: 59.9167, y: 10.75, count: 1}, {x: 51.5002, y: -0.1262, count: 1}, {x: 55, y: 73.4, count: 1}, {x: 52.5, y: 5.75, count: 1}, {x: 52.2, y: 0.1167, count: 1}, {x: 48.8833, y: 8.3333, count: 1}, {x: -33.9167, y: 18.4167, count: 1}, {x: 40.9157, y: -81.133, count: 2}, {x: 43.8667, y: -79.4333, count: 1}, {x: 54, y: -2, count: 2}, {x: 39, y: 22, count: 1}, {x: 54, y: -2, count: 11}, {x: 54, y: -2, count: 4}, {x: 54, y: -2, count: 3}, {x: 9.0833, y: -79.3833, count: 2}, {x: 21.5, y: -104.9, count: 1}, {x: 19.5333, y: -96.9167, count: 1}, {x: 32.5333, y: -117.017, count: 1}, {x: 19.4342, y: -99.1386, count: 3}, {x: 18.15, y: -94.4167, count: 1}, {x: 20.7167, y: -103.4, count: 1}, {x: 23.2167, y: -106.417, count: 2}, {x: 10.9639, y: -74.7964, count: 1}, {x: 24.8667, y: 67.05, count: 2}, {x: 1.2931, y: 103.856, count: 1}, {x: -41, y: 174, count: 1}, {x: 13.75, y: 100.517, count: 2}, {x: 13.75, y: 100.517, count: 16}, {x: 13.75, y: 100.517, count: 9}, {x: 13.75, y: 100.517, count: 8}, {x: 13.75, y: 100.517, count: 7}, {x: 13.75, y: 100.517, count: 16}, {x: 13.75, y: 100.517, count: 4}, {x: 13.75, y: 100.517, count: 6}, {x: 55.75, y: -97.8667, count: 5}, {x: 34.0438, y: -118.251, count: 2}, {x: 44.2997, y: -70.3698, count: 1}, {x: 46.9402, y: -113.85, count: 14}, {x: 45.6167, y: -61.9667, count: 1}, {x: 45.3833, y: -66, count: 2}, {x: 54.9167, y: -98.6333, count: 1}, {x: 40.8393, y: -73.2797, count: 1}, {x: 41.6929, y: -111.815, count: 1}, {x: 49.8833, y: -97.1667, count: 1}, {x: 32.5576, y: -81.9395, count: 1}, {x: 49.9667, y: -98.3, count: 2}, {x: 40.0842, y: -82.9378, count: 2}, {x: 49.25, y: -123.133, count: 5}, {x: 35.2268, y: -78.9561, count: 1}, {x: 43.9817, y: -121.272, count: 1}, {x: 43.9647, y: -121.341, count: 1}, {x: 32.7825, y: -96.8207, count: 13}, {x: 33.4357, y: -111.917, count: 2}, {x: 36.0707, y: -97.9077, count: 1}, {x: 32.7791, y: -96.8028, count: 1}, {x: 34.053, y: -118.264, count: 1}, {x: 30.726, y: -95.55, count: 1}, {x: 45.4508, y: -93.5855, count: 1}, {x: 32.7825, y: -96.8207, count: 8}, {x: 36.8463, y: -76.0979, count: 3}, {x: 36.8463, y: -76.0979, count: 1}, {x: 34.0533, y: -118.255, count: 1}, {x: 35.7217, y: -81.3603, count: 1}, {x: 40.6888, y: -74.0203, count: 4}, {x: 47.5036, y: -94.685, count: 2}, {x: 32.3304, y: -81.6011, count: 1}, {x: 39.0165, y: -77.5062, count: 2}, {x: 38.6312, y: -90.1922, count: 1}, {x: 32.445, y: -81.7758, count: 1}, {x: -37.9667, y: 145.15, count: 1}, {x: -33.9833, y: 151.117, count: 1}, {x: 49.6769, y: 6.1239, count: 2}, {x: 53.8167, y: -1.2167, count: 1}, {x: 52.4667, y: -1.9167, count: 3}, {x: 52.5, y: 5.75, count: 2}, {x: 33.5717, y: -117.729, count: 4}, {x: 31.5551, y: -97.1604, count: 1}, {x: 42.2865, y: -71.7147, count: 1}, {x: 48.4, y: -89.2333, count: 1}, {x: 42.9864, y: -78.7279, count: 1}, {x: 41.8471, y: -87.6248, count: 1}, {x: 34.5139, y: -114.293, count: 1}, {x: 51.9167, y: 4.4, count: 1}, {x: 51.9167, y: 4.4, count: 4}, {x: 51.55, y: 5.1167, count: 30}, {x: 51.8, y: 4.4667, count: 8}, {x: 54.5, y: -3.6167, count: 1}, {x: -34.9333, y: 138.6, count: 1}, {x: -33.95, y: 151.133, count: 1}, {x: 15, y: 100, count: 4}, {x: 15, y: 100, count: 1}, {x: 15, y: 100, count: 3}, {x: 15, y: 100, count: 2}, {x: 41.5381, y: -87.6842, count: 1}, {x: 40.9588, y: -75.3006, count: 1}, {x: 46.7921, y: -96.8827, count: 1}, {x: 41.9474, y: -87.7037, count: 1}, {x: 41.6162, y: -87.0489, count: 1}, {x: 37.5023, y: -77.5693, count: 1}, {x: 38.4336, y: -77.3887, count: 1}, {x: 41.759, y: -88.2615, count: 1}, {x: 42.0158, y: -87.8423, count: 1}, {x: 46.5833, y: -81.2, count: 1}, {x: 45.3667, y: -63.3, count: 1}, {x: 18.0239, y: -66.6366, count: 2}, {x: 43.2667, y: -79.9333, count: 1}, {x: 45.0667, y: -64.5, count: 1}, {x: 39.6351, y: -78.7665, count: 1}, {x: 33.4483, y: -81.6921, count: 2}, {x: 41.5583, y: -87.6612, count: 1}, {x: 30.5315, y: -90.4628, count: 1}, {x: 34.7664, y: -82.2202, count: 2}, {x: 47.6779, y: -117.379, count: 2}, {x: 47.6201, y: -122.141, count: 1}, {x: 45.0901, y: -87.7101, count: 1}, {x: 38.3119, y: -90.1535, count: 3}, {x: 34.7681, y: -84.9569, count: 4}, {x: 47.4061, y: -121.995, count: 1}, {x: 40.6009, y: -73.9397, count: 1}, {x: 40.6278, y: -73.365, count: 1}, {x: 40.61, y: -73.9108, count: 1}, {x: 34.3776, y: -83.7605, count: 2}, {x: 38.7031, y: -94.4737, count: 1}, {x: 39.3031, y: -82.0828, count: 1}, {x: 42.5746, y: -88.3946, count: 1}, {x: 45.4804, y: -122.836, count: 1}, {x: 44.5577, y: -123.298, count: 1}, {x: 40.1574, y: -76.7978, count: 1}, {x: 34.8983, y: -120.382, count: 1}, {x: 40.018, y: -89.8623, count: 1}, {x: 37.3637, y: -79.9549, count: 1}, {x: 37.2141, y: -80.0625, count: 1}, {x: 37.2655, y: -79.923, count: 1}, {x: 39.0613, y: -95.7293, count: 1}, {x: 41.2314, y: -80.7567, count: 1}, {x: 40.3377, y: -79.8428, count: 1}, {x: 42.0796, y: -71.0382, count: 1}, {x: 43.25, y: -79.8333, count: 1}, {x: 40.7948, y: -72.8797, count: 2}, {x: 40.6766, y: -73.7038, count: 4}, {x: 37.979, y: -121.788, count: 1}, {x: 43.1669, y: -76.0558, count: 1}, {x: 37.5353, y: -121.979, count: 1}, {x: 43.2345, y: -71.5227, count: 1}, {x: 42.6179, y: -70.7154, count: 3}, {x: 42.0765, y: -71.472, count: 2}, {x: 35.2298, y: -81.2428, count: 1}, {x: 39.961, y: -104.817, count: 1}, {x: 44.6667, y: -63.5667, count: 1}, {x: 38.4473, y: -104.632, count: 3}, {x: 40.7148, y: -73.7939, count: 1}, {x: 40.6763, y: -73.7752, count: 1}, {x: 41.3846, y: -73.0943, count: 2}, {x: 43.1871, y: -70.91, count: 1}, {x: 33.3758, y: -84.4657, count: 1}, {x: 15, y: 100, count: 12}, {x: 36.8924, y: -80.076, count: 2}, {x: 25, y: 17, count: 1}, {x: 27, y: 30, count: 1}, {x: 49.1, y: 10.75, count: 2}, {x: 49.1, y: 10.75, count: 4}, {x: 47.6727, y: -122.187, count: 1}, {x: -27.6167, y: 152.767, count: 1}, {x: -33.8833, y: 151.217, count: 1}, {x: 31.5497, y: 74.3436, count: 4}, {x: 13.65, y: 100.267, count: 2}, {x: -37.8167, y: 144.967, count: 1}, {x: 47.85, y: 12.1333, count: 3}, {x: 47, y: 8, count: 3}, {x: 52.1667, y: 10.55, count: 1}, {x: 50.8667, y: 6.8667, count: 2}, {x: 40.8333, y: 14.25, count: 2}, {x: 47.5304, y: -122.008, count: 1}, {x: 47.5304, y: -122.008, count: 3}, {x: 34.0119, y: -118.468, count: 1}, {x: 38.9734, y: -119.908, count: 1}, {x: 52.1333, y: -106.667, count: 1}, {x: 41.4201, y: -75.6485, count: 3}, {x: 45.6393, y: -94.2237, count: 1}, {x: 33.7516, y: -84.3915, count: 1}, {x: 26.0098, y: -80.2592, count: 1}, {x: 34.5714, y: -78.7566, count: 1}, {x: 40.7235, y: -73.8612, count: 1}, {x: 39.1637, y: -94.5215, count: 5}, {x: 28.0573, y: -81.5687, count: 2}, {x: 26.8498, y: -80.14, count: 1}, {x: 47.6027, y: -122.156, count: 11}, {x: 47.6027, y: -122.156, count: 1}, {x: 25.7541, y: -80.271, count: 1}, {x: 32.7597, y: -97.147, count: 1}, {x: 40.9083, y: -73.8346, count: 2}, {x: 47.6573, y: -111.381, count: 1}, {x: 32.3729, y: -81.8443, count: 1}, {x: 32.7825, y: -96.8207, count: 2}, {x: 41.5074, y: -81.6053, count: 1}, {x: 32.4954, y: -86.5, count: 1}, {x: 30.3043, y: -81.7306, count: 1}, {x: 45.9667, y: -81.9333, count: 1}, {x: 42.2903, y: -72.6404, count: 5}, {x: 40.7553, y: -73.9924, count: 1}, {x: 55.1667, y: -118.8, count: 1}, {x: 37.8113, y: -122.301, count: 1}, {x: 40.2968, y: -111.676, count: 1}, {x: 42.0643, y: -87.9921, count: 1}, {x: 42.3908, y: -71.0925, count: 1}, {x: 44.2935, y: -94.7601, count: 1}, {x: 40.4619, y: -74.3561, count: 2}, {x: 32.738, y: -96.4463, count: 1}, {x: 35.7821, y: -78.8177, count: 1}, {x: 40.7449, y: -73.9782, count: 1}, {x: 40.7449, y: -73.9782, count: 2}, {x: 28.5445, y: -81.3706, count: 1}, {x: 41.4201, y: -75.6485, count: 1}, {x: 38.6075, y: -83.7928, count: 1}, {x: 42.2061, y: -83.206, count: 1}, {x: 42.3222, y: -88.4671, count: 1}, {x: 42.3222, y: -88.4671, count: 3}, {x: 37.7035, y: -122.148, count: 1}, {x: 37.5147, y: -122.042, count: 1}, {x: 40.6053, y: -111.988, count: 1}, {x: 38.5145, y: -81.7814, count: 1}, {x: 42.1287, y: -88.2654, count: 1}, {x: 36.9127, y: -120.196, count: 1}, {x: 36.3769, y: -119.184, count: 1}, {x: 36.84, y: -119.828, count: 1}, {x: 48.0585, y: -122.148, count: 1}, {x: 42.1197, y: -87.8445, count: 1}, {x: 40.7002, y: -111.943, count: 2}, {x: 37.5488, y: -122.312, count: 1}, {x: 41.3807, y: -73.3915, count: 1}, {x: 45.5, y: -73.5833, count: 3}, {x: 34.0115, y: -117.854, count: 3}, {x: 43.0738, y: -83.8608, count: 11}, {x: 33.9944, y: -118.464, count: 3}, {x: 42.7257, y: -84.636, count: 1}, {x: 32.7825, y: -96.8207, count: 22}, {x: 40.7805, y: -73.9512, count: 1}, {x: 42.1794, y: -75.9491, count: 1}, {x: 43.3453, y: -75.1285, count: 1}, {x: 42.195, y: -83.165, count: 1}, {x: 33.9289, y: -116.488, count: 5}, {x: 29.4717, y: -98.514, count: 1}, {x: 28.6653, y: -81.4188, count: 1}, {x: 40.8217, y: -74.1574, count: 1}, {x: 41.2094, y: -73.2116, count: 2}, {x: 41.0917, y: -73.4316, count: 1}, {x: 30.4564, y: -97.6938, count: 1}, {x: 36.1352, y: -95.9364, count: 1}, {x: 33.3202, y: -111.761, count: 1}, {x: 38.9841, y: -77.3827, count: 1}, {x: 29.1654, y: -82.0967, count: 1}, {x: 37.691, y: -97.3292, count: 1}, {x: 33.5222, y: -112.084, count: 1}, {x: 41.9701, y: -71.7217, count: 1}, {x: 35.6165, y: -97.4789, count: 3}, {x: 35.4715, y: -97.519, count: 1}, {x: 41.2307, y: -96.1178, count: 1}, {x: 53.55, y: -113.5, count: 2}, {x: 36.0844, y: -79.8209, count: 1}, {x: 40.5865, y: -74.1497, count: 1}, {x: 41.9389, y: -73.9901, count: 1}, {x: 40.8596, y: -73.9314, count: 1}, {x: 33.6119, y: -111.891, count: 2}, {x: 38.8021, y: -90.627, count: 1}, {x: 38.8289, y: -91.9744, count: 1}, {x: 42.8526, y: -86.1263, count: 2}, {x: 40.781, y: -73.2522, count: 1}, {x: 41.1181, y: -74.0833, count: 2}, {x: 40.8533, y: -74.6522, count: 2}, {x: 41.3246, y: -73.6976, count: 1}, {x: 40.9796, y: -73.7231, count: 1}, {x: 28.4517, y: -81.4653, count: 1}, {x: 36.0328, y: -115.025, count: 2}, {x: 32.5814, y: -83.6286, count: 1}, {x: 33.6117, y: -117.549, count: 1}, {x: 40.4619, y: -74.3561, count: 4}, {x: 40.4619, y: -74.3561, count: 1}, {x: 44.1747, y: -94.0492, count: 3}, {x: 43.0522, y: -87.965, count: 1}, {x: 40.0688, y: -74.5956, count: 2}, {x: 33.6053, y: -117.717, count: 1}, {x: 39.95, y: -74.9929, count: 1}, {x: 38.678, y: -77.3197, count: 2}, {x: 34.9184, y: -92.1362, count: 2}, {x: 35.9298, y: -86.4605, count: 1}, {x: 35.8896, y: -86.3166, count: 1}, {x: 39.1252, y: -76.5116, count: 1}, {x: 26.976, y: -82.1391, count: 1}, {x: 34.5022, y: -120.129, count: 1}, {x: 39.9571, y: -76.7055, count: 2}, {x: 34.7018, y: -86.6108, count: 1}, {x: 54.1297, y: -108.435, count: 1}, {x: 32.805, y: -116.902, count: 1}, {x: 45.6, y: -73.7333, count: 1}, {x: 32.8405, y: -116.88, count: 1}, {x: 33.2007, y: -117.226, count: 1}, {x: 40.1246, y: -75.5385, count: 1}, {x: 40.2605, y: -75.6155, count: 1}, {x: 40.7912, y: -77.8746, count: 1}, {x: 40.168, y: -76.6094, count: 1}, {x: 40.3039, y: -74.0703, count: 2}, {x: 39.3914, y: -74.5182, count: 1}, {x: 40.1442, y: -74.8483, count: 1}, {x: 28.312, y: -81.589, count: 1}, {x: 34.0416, y: -118.299, count: 1}, {x: 50.45, y: -104.617, count: 1}, {x: 41.2305, y: -73.1257, count: 3}, {x: 40.6538, y: -73.6082, count: 1}, {x: 40.9513, y: -73.8773, count: 2}, {x: 41.078, y: -74.1764, count: 1}, {x: 32.7492, y: -97.2205, count: 1}, {x: 39.5407, y: -84.2212, count: 1}, {x: 40.7136, y: -82.8012, count: 3}, {x: 36.2652, y: -82.834, count: 8}, {x: 40.2955, y: -75.3254, count: 2}, {x: 29.7755, y: -95.4152, count: 2}, {x: 32.7791, y: -96.8028, count: 3}, {x: 32.7791, y: -96.8028, count: 2}, {x: 36.4642, y: -87.3797, count: 2}, {x: 41.6005, y: -72.8764, count: 1}, {x: 35.708, y: -97.5749, count: 1}, {x: 40.8399, y: -73.9422, count: 1}, {x: 41.9223, y: -87.7555, count: 1}, {x: 42.9156, y: -85.8464, count: 1}, {x: 41.8824, y: -87.6376, count: 1}, {x: 30.6586, y: -88.3535, count: 1}, {x: 42.6619, y: -82.9211, count: 1}, {x: 35.0481, y: -85.2833, count: 1}, {x: 32.3938, y: -92.2329, count: 1}, {x: 39.402, y: -76.6329, count: 1}, {x: 39.9968, y: -75.1485, count: 1}, {x: 38.8518, y: -94.7786, count: 1}, {x: 33.4357, y: -111.917, count: 1}, {x: 35.8278, y: -78.6421, count: 2}, {x: 22.3167, y: 114.183, count: 12}, {x: 34.0438, y: -118.251, count: 1}, {x: 41.724, y: -88.1127, count: 1}, {x: 37.4429, y: -122.151, count: 1}, {x: 51.25, y: -80.6, count: 1}, {x: 39.209, y: -94.7305, count: 1}, {x: 40.7214, y: -74.0052, count: 1}, {x: 33.92, y: -117.208, count: 1}, {x: 29.926, y: -97.5644, count: 1}, {x: 30.4, y: -97.7528, count: 1}, {x: 26.937, y: -80.135, count: 1}, {x: 32.8345, y: -111.731, count: 1}, {x: 29.6694, y: -82.3572, count: 13}, {x: 36.2729, y: -115.133, count: 1}, {x: 33.2819, y: -111.88, count: 3}, {x: 32.5694, y: -117.016, count: 1}, {x: 38.8381, y: -77.2121, count: 1}, {x: 41.6856, y: -72.7312, count: 1}, {x: 33.2581, y: -116.982, count: 1}, {x: 38.6385, y: -90.3026, count: 1}, {x: 43.15, y: -79.5, count: 2}, {x: 43.85, y: -79.0167, count: 1}, {x: 44.8833, y: -76.2333, count: 1}, {x: 45.4833, y: -75.65, count: 1}, {x: 53.2, y: -105.75, count: 1}, {x: 51.0833, y: -114.083, count: 1}, {x: 29.7523, y: -95.367, count: 1}, {x: 38.692, y: -92.2929, count: 1}, {x: 34.1362, y: -117.298, count: 2}, {x: 28.2337, y: -82.179, count: 1}, {x: 40.9521, y: -73.7382, count: 1}, {x: 38.9186, y: -76.7862, count: 2}, {x: 42.2647, y: -71.8089, count: 1}, {x: 42.6706, y: -73.7791, count: 1}, {x: 39.5925, y: -78.5901, count: 1}, {x: 52.1333, y: -106.667, count: 2}, {x: 40.2964, y: -75.2053, count: 1}, {x: 34.1066, y: -117.815, count: 1}, {x: 40.8294, y: -73.5052, count: 1}, {x: 42.1298, y: -72.5687, count: 1}, {x: 25.6615, y: -80.412, count: 2}, {x: 37.8983, y: -122.049, count: 1}, {x: 37.0101, y: -122.032, count: 2}, {x: 40.2843, y: -76.8446, count: 1}, {x: 39.4036, y: -104.56, count: 1}, {x: 34.8397, y: -106.688, count: 1}, {x: 40.1879, y: -75.4254, count: 2}, {x: 35.0212, y: -85.2729, count: 2}, {x: 40.214, y: -75.073, count: 1}, {x: 39.9407, y: -75.2281, count: 1}, {x: 47.2098, y: -122.409, count: 1}, {x: 41.3433, y: -73.0654, count: 2}, {x: 41.7814, y: -72.7544, count: 1}, {x: 41.3094, y: -72.924, count: 1}, {x: 45.3218, y: -122.523, count: 1}, {x: 45.4104, y: -122.702, count: 3}, {x: 45.6741, y: -122.471, count: 2}, {x: 32.9342, y: -97.2515, count: 1}, {x: 40.8775, y: -74.1105, count: 1}, {x: 40.82, y: -96.6806, count: 1}, {x: 45.5184, y: -122.655, count: 1}, {x: 41.0544, y: -74.6171, count: 1}, {x: 35.3874, y: -78.8686, count: 1}, {x: 39.961, y: -85.9837, count: 1}, {x: 34.0918, y: -84.2209, count: 2}, {x: 39.1492, y: -78.278, count: 1}, {x: 38.7257, y: -77.7982, count: 1}, {x: 45.0059, y: -93.4305, count: 1}, {x: 35.0748, y: -80.6774, count: 1}, {x: 35.8059, y: -78.7997, count: 1}, {x: 35.8572, y: -84.0177, count: 1}, {x: 38.7665, y: -89.6533, count: 1}, {x: 43.7098, y: -87.7478, count: 2}, {x: 33.3961, y: -84.7821, count: 1}, {x: 32.7881, y: -96.9431, count: 1}, {x: 43.1946, y: -89.2025, count: 1}, {x: 43.0745, y: -87.9078, count: 1}, {x: 34.0817, y: -84.2553, count: 1}, {x: 37.9689, y: -103.749, count: 1}, {x: 31.7969, y: -106.387, count: 1}, {x: 31.7435, y: -106.297, count: 1}, {x: 29.6569, y: -98.5107, count: 1}, {x: 28.4837, y: -82.5496, count: 1}, {x: 29.1137, y: -81.0285, count: 1}, {x: 29.6195, y: -100.809, count: 1}, {x: 35.4568, y: -97.2652, count: 1}, {x: 33.8682, y: -117.929, count: 1}, {x: 32.7977, y: -117.132, count: 1}, {x: 33.3776, y: -112.387, count: 1}, {x: 43.1031, y: -79.0092, count: 1}, {x: 40.7731, y: -80.1137, count: 2}, {x: 40.7082, y: -74.0132, count: 1}, {x: 39.7187, y: -75.6216, count: 1}, {x: 29.8729, y: -98.014, count: 1}, {x: 42.5324, y: -70.9737, count: 1}, {x: 41.6623, y: -71.0107, count: 1}, {x: 41.1158, y: -78.9098, count: 1}, {x: 39.2694, y: -76.7447, count: 1}, {x: 39.9, y: -75.3075, count: 1}, {x: 41.2137, y: -85.0996, count: 1}, {x: 32.8148, y: -96.8705, count: 2}, {x: 39.8041, y: -75.4559, count: 4}, {x: 40.0684, y: -75.0065, count: 1}, {x: 44.8791, y: -68.733, count: 1}, {x: 40.1879, y: -75.4254, count: 1}, {x: 41.8195, y: -71.4107, count: 1}, {x: 38.9879, y: -76.5454, count: 3}, {x: 42.5908, y: -71.8055, count: 6}, {x: 40.7842, y: -73.8422, count: 2}, {x: 0, y: 0, count: 2}, {x: 33.336, y: -96.7491, count: 5}, {x: 33.336, y: -96.7491, count: 6}, {x: 37.4192, y: -122.057, count: 1}, {x: 33.7694, y: -83.3897, count: 1}, {x: 37.7609, y: -87.1513, count: 1}, {x: 33.8651, y: -84.8948, count: 1}, {x: 28.5153, y: -82.2856, count: 1}, {x: 35.1575, y: -89.7646, count: 1}, {x: 32.318, y: -95.2921, count: 1}, {x: 35.4479, y: -91.9977, count: 1}, {x: 36.6696, y: -93.2615, count: 1}, {x: 34.0946, y: -101.683, count: 1}, {x: 31.9776, y: -102.08, count: 1}, {x: 39.0335, y: -77.4838, count: 1}, {x: 40.0548, y: -75.4083, count: 8}, {x: 38.9604, y: -94.8049, count: 2}, {x: 33.8138, y: -117.799, count: 3}, {x: 33.8138, y: -117.799, count: 1}, {x: 33.8138, y: -117.799, count: 2}, {x: 38.2085, y: -85.6918, count: 3}, {x: 37.7904, y: -85.4848, count: 1}, {x: 42.4488, y: -94.2254, count: 1}, {x: 43.179, y: -77.555, count: 1}, {x: 29.7523, y: -95.367, count: 3}, {x: 40.665, y: -73.7502, count: 1}, {x: 40.6983, y: -73.888, count: 1}, {x: 43.1693, y: -77.6189, count: 1}, {x: 43.7516, y: -70.2793, count: 1}, {x: 37.3501, y: -121.985, count: 1}, {x: 32.7825, y: -96.8207, count: 19}, {x: 35.1145, y: -101.771, count: 1}, {x: 31.7038, y: -83.6753, count: 2}, {x: 34.6222, y: -83.7901, count: 1}, {x: 35.7102, y: -84.3743, count: 1}, {x: 42.0707, y: -72.044, count: 1}, {x: 34.7776, y: -82.3051, count: 2}, {x: 34.9965, y: -82.3287, count: 1}, {x: 32.5329, y: -85.5078, count: 1}, {x: 41.5468, y: -93.6209, count: 1}, {x: 41.2587, y: -80.8298, count: 1}, {x: 35.2062, y: -81.1384, count: 1}, {x: 39.9741, y: -86.1272, count: 1}, {x: 33.7976, y: -118.162, count: 1}, {x: 41.8675, y: -87.6744, count: 1}, {x: 42.8526, y: -86.1263, count: 1}, {x: 39.9968, y: -82.9882, count: 1}, {x: 35.1108, y: -89.9483, count: 1}, {x: 35.1359, y: -90.0027, count: 1}, {x: 32.3654, y: -90.1118, count: 1}, {x: 42.1663, y: -71.3611, count: 1}, {x: 39.5076, y: -104.677, count: 2}, {x: 39.378, y: -104.858, count: 1}, {x: 44.84, y: -93.0365, count: 1}, {x: 31.2002, y: -97.9921, count: 1}, {x: 26.1783, y: -81.7145, count: 2}, {x: 47.9469, y: -122.197, count: 1}, {x: 32.2366, y: -90.1688, count: 1}, {x: 25.7341, y: -80.3594, count: 13}, {x: 26.9467, y: -80.217, count: 2}, {x: 44.9487, y: -93.1002, count: 1}, {x: 38.6485, y: -77.3108, count: 1}, {x: 45.6676, y: -122.606, count: 1}, {x: 40.1435, y: -75.3567, count: 1}, {x: 43.0139, y: -71.4352, count: 1}, {x: 41.9395, y: -71.2943, count: 2}, {x: 37.6134, y: -77.2564, count: 1}, {x: 42.5626, y: -83.6099, count: 1}, {x: 41.55, y: -88.1248, count: 1}, {x: 34.0311, y: -118.49, count: 1}, {x: 33.7352, y: -118.315, count: 1}, {x: 34.0872, y: -117.882, count: 1}, {x: 33.8161, y: -117.979, count: 2}, {x: 47.6609, y: -116.834, count: 15}, {x: 40.2594, y: -81.9641, count: 2}, {x: 35.9925, y: -78.9017, count: 1}, {x: 32.8098, y: -96.7993, count: 5}, {x: 32.6988, y: -97.1237, count: 1}, {x: 32.9722, y: -96.7376, count: 3}, {x: 32.9513, y: -96.7154, count: 1}, {x: 32.9716, y: -96.7058, count: 2}, {x: 41.4796, y: -81.511, count: 2}, {x: 36.7695, y: -119.795, count: 1}, {x: 36.2082, y: -86.879, count: 2}, {x: 41.3846, y: -73.0943, count: 1}, {x: 37.795, y: -122.219, count: 1}, {x: 41.4231, y: -73.4771, count: 1}, {x: 38.0322, y: -78.4873, count: 1}, {x: 43.6667, y: -79.4167, count: 1}, {x: 42.3222, y: -88.4671, count: 7}, {x: 40.7336, y: -96.6394, count: 2}, {x: 33.7401, y: -117.82, count: 2}, {x: 33.7621, y: -84.3982, count: 1}, {x: 39.7796, y: -75.0505, count: 1}, {x: 39.4553, y: -74.9608, count: 1}, {x: 39.7351, y: -75.6684, count: 1}, {x: 51.3833, y: 0.5167, count: 1}, {x: 45.9833, y: 6.05, count: 1}, {x: 51.1833, y: 14.4333, count: 1}, {x: 41.9167, y: 8.7333, count: 1}, {x: 45.4, y: 5.45, count: 2}, {x: 51.9, y: 6.1167, count: 1}, {x: 50.4333, y: 30.5167, count: 1}, {x: 24.6408, y: 46.7728, count: 1}, {x: 54.9878, y: -1.4214, count: 5}, {x: 51.45, y: -2.5833, count: 2}, {x: 46, y: 2, count: 2}, {x: 51.5167, y: -0.7, count: 1}, {x: 35.94, y: 14.3533, count: 1}, {x: 53.55, y: 10, count: 1}, {x: 53.6, y: 7.2, count: 1}, {x: 53.8333, y: -1.7667, count: 1}, {x: 53.7833, y: -1.75, count: 2}, {x: 52.6333, y: -1.1333, count: 1}, {x: 53.5333, y: -1.1167, count: 2}, {x: 51.0167, y: -0.45, count: 2}, {x: 50.7833, y: -0.65, count: 1}, {x: 50.9, y: -1.4, count: 1}, {x: 50.9, y: -1.4, count: 5}, {x: 52.2, y: -2.2, count: 8}, {x: 50.1167, y: 8.6833, count: 3}, {x: 49.0047, y: 8.3858, count: 1}, {x: 49.1, y: 10.75, count: 7}, {x: 37.9833, y: 23.7333, count: 1}, {x: 41.9, y: 12.4833, count: 19}, {x: 51.8833, y: 10.5667, count: 3}, {x: 50.0333, y: 12.0167, count: 1}, {x: 49.8667, y: 10.8333, count: 14}, {x: 51, y: 9, count: 1}, {x: 53.3667, y: -1.5, count: 1}, {x: 52.9333, y: -1.5, count: 1}, {x: 52.9667, y: -1.1667, count: 1}, {x: 52.9667, y: -1.3, count: 1}, {x: 51.9, y: -2.0833, count: 2}, {x: 50.3, y: 3.9167, count: 1}, {x: 45.45, y: -73.75, count: 4}, {x: 53.7, y: -2.2833, count: 1}, {x: 53.9833, y: -1.5333, count: 1}, {x: 50.8167, y: 7.1667, count: 1}, {x: 56.5, y: -2.9667, count: 1}, {x: 51.4667, y: -0.35, count: 1}, {x: 43.3667, y: -5.8333, count: 1}, {x: 47, y: 8, count: 4}, {x: 47, y: 8, count: 1}, {x: 47, y: 8, count: 2}, {x: 50.7333, y: -1.7667, count: 2}, {x: 52.35, y: 4.9167, count: 1}, {x: 48.8833, y: 8.3333, count: 2}, {x: 53.5333, y: -0.05, count: 1}, {x: 55.95, y: -3.2, count: 2}, {x: 55.8333, y: -4.25, count: 4}, {x: 54.6861, y: -1.2125, count: 2}, {x: 52.5833, y: -0.25, count: 2}, {x: 53.55, y: -2.5167, count: 2}, {x: 52.7667, y: -1.2, count: 1}, {x: 52.6333, y: -1.8333, count: 2}, {x: 55.0047, y: -1.4728, count: 2}, {x: 50.9, y: -1.4, count: 2}, {x: 52.6333, y: 1.3, count: 5}, {x: 52.25, y: -1.1667, count: 1}, {x: 54.9167, y: -1.7333, count: 1}, {x: 53.5667, y: -2.9, count: 3}, {x: 55.8833, y: -3.5333, count: 1}, {x: 53.0667, y: 6.4667, count: 1}, {x: 48.3333, y: 16.35, count: 30}, {x: 58.35, y: 15.2833, count: 1}, {x: 50.6167, y: 3.0167, count: 1}, {x: 53.3833, y: -2.6, count: 1}, {x: 53.3833, y: -2.6, count: 2}, {x: 54.5333, y: -1.15, count: 5}, {x: 51.55, y: 0.05, count: 2}, {x: 51.55, y: 0.05, count: 1}, {x: 50.8, y: -0.3667, count: 2}, {x: 49.0533, y: 11.7822, count: 1}, {x: 52.2333, y: 4.8333, count: 1}, {x: 54.5833, y: -1.4167, count: 3}, {x: 54.5833, y: -5.9333, count: 1}, {x: 43.1167, y: 5.9333, count: 2}, {x: 51.8333, y: -2.25, count: 1}, {x: 50.3964, y: -4.1386, count: 2}, {x: 51.45, y: -2.5833, count: 4}, {x: 54.9881, y: -1.6194, count: 1}, {x: 55.9833, y: -4.6, count: 4}, {x: 53.4167, y: -3, count: 1}, {x: 51.5002, y: -0.1262, count: 2}, {x: 50.3964, y: -4.1386, count: 8}, {x: 51.3742, y: -2.1364, count: 1}, {x: 52.4833, y: -2.1167, count: 1}, {x: 54.5728, y: -1.1628, count: 1}, {x: 54.5333, y: -1.15, count: 1}, {x: 47.7833, y: 7.3, count: 1}, {x: 46.95, y: 4.8333, count: 1}, {x: 60.1756, y: 24.9342, count: 2}, {x: 58.2, y: 16, count: 2}, {x: 57.7167, y: 11.9667, count: 1}, {x: 60.0667, y: 15.9333, count: 2}, {x: 41.2333, y: 1.8167, count: 2}, {x: 40.4833, y: -3.3667, count: 1}, {x: 52.1333, y: 4.6667, count: 2}, {x: 51.4167, y: 5.4167, count: 1}, {x: 51.9667, y: 4.6167, count: 2}, {x: 51.8333, y: 4.6833, count: 1}, {x: 51.8333, y: 4.6833, count: 2}, {x: 48.2, y: 16.3667, count: 1}, {x: 54.6833, y: 25.3167, count: 2}, {x: 51.9333, y: 4.5833, count: 2}, {x: 50.9, y: 5.9833, count: 1}, {x: 51.4333, y: -1, count: 1}, {x: 49.4478, y: 11.0683, count: 1}, {x: 61.1333, y: 21.5, count: 1}, {x: 62.4667, y: 6.15, count: 1}, {x: 59.2167, y: 10.95, count: 1}, {x: 48.8667, y: 2.3333, count: 1}, {x: 52.35, y: 4.9167, count: 4}, {x: 52.35, y: 4.9167, count: 5}, {x: 52.35, y: 4.9167, count: 31}, {x: 54.0833, y: 12.1333, count: 1}, {x: 50.8, y: -0.5333, count: 1}, {x: 50.8333, y: -0.15, count: 1}, {x: 52.5167, y: 13.4, count: 2}, {x: 58.3167, y: 15.1333, count: 2}, {x: 59.3667, y: 16.5, count: 1}, {x: 55.8667, y: 12.8333, count: 2}, {x: 50.8667, y: 6.8667, count: 1}, {x: 52.5833, y: -0.25, count: 1}, {x: 53.5833, y: -0.65, count: 2}, {x: 44.4333, y: 26.1, count: 6}, {x: 44.4333, y: 26.1, count: 3}, {x: 51.7833, y: -3.0833, count: 1}, {x: 50.85, y: -1.7833, count: 1}, {x: 52.2333, y: -1.7333, count: 1}, {x: 53.1333, y: -1.2, count: 2}, {x: 51.4069, y: -2.5558, count: 1}, {x: 51.3833, y: -0.1, count: 1}, {x: 52.4667, y: -0.9167, count: 1}, {x: 55.1667, y: -1.6833, count: 1}, {x: 50.9667, y: -2.75, count: 5}, {x: 53.25, y: -1.9167, count: 4}, {x: 55.8333, y: -4.25, count: 5}, {x: 50.7167, y: -2.4333, count: 1}, {x: 51.2, y: -0.5667, count: 2}, {x: 51.0667, y: -1.7833, count: 2}, {x: 51.8167, y: -2.7167, count: 2}, {x: 53.3833, y: -0.7667, count: 1}, {x: 51.3667, y: 1.45, count: 6}, {x: 55.4333, y: -5.6333, count: 1}, {x: 52.4167, y: -1.55, count: 4}, {x: 51.5333, y: -0.3167, count: 2}, {x: 50.45, y: -3.5, count: 2}, {x: 53.0167, y: -1.6333, count: 1}, {x: 51.7833, y: 1.1667, count: 3}, {x: 53.8833, y: -1.2667, count: 1}, {x: 56.6667, y: -3, count: 2}, {x: 51.4, y: -1.3167, count: 5}, {x: 52.1333, y: -0.45, count: 1}, {x: 52.4667, y: -1.9167, count: 1}, {x: 52.05, y: -2.7167, count: 1}, {x: 54.7, y: -5.8667, count: 2}, {x: 52.4167, y: -1.55, count: 1}, {x: 43.6, y: 3.8833, count: 1}, {x: 49.1833, y: -0.35, count: 1}, {x: 52.6333, y: -1.1333, count: 2}, {x: 52.4733, y: -8.1558, count: 1}, {x: 53.3331, y: -6.2489, count: 3}, {x: 53.3331, y: -6.2489, count: 1}, {x: 52.3342, y: -6.4575, count: 1}, {x: 52.2583, y: -7.1119, count: 1}, {x: 54.25, y: -6.9667, count: 1}, {x: 52.9667, y: -1.1667, count: 2}, {x: 51.3742, y: -2.1364, count: 2}, {x: 52.5667, y: -1.55, count: 3}, {x: 49.9481, y: 11.5783, count: 1}, {x: 52.3833, y: 9.9667, count: 1}, {x: 47.8167, y: 9.5, count: 1}, {x: 50.0833, y: 19.9167, count: 1}, {x: 52.2167, y: 5.2833, count: 1}, {x: 42.4333, y: -8.6333, count: 1}, {x: 42.8333, y: 12.8333, count: 1}, {x: 55.7167, y: 12.45, count: 1}, {x: 50.7, y: 3.1667, count: 1}, {x: 51.5833, y: -0.2833, count: 1}, {x: 53.4333, y: -1.35, count: 1}, {x: 62.8, y: 30.15, count: 1}, {x: 51.3, y: 12.3333, count: 2}, {x: 53.6528, y: -6.6814, count: 1}, {x: 40.2333, y: -3.7667, count: 1}, {x: 42.3741, y: -71.1072, count: 1}, {x: 51.5002, y: -0.1262, count: 5}, {x: 52.4667, y: -1.9167, count: 2}, {x: 53.5, y: -2.2167, count: 3}, {x: 54.0667, y: -2.8333, count: 1}, {x: 52.5, y: -2, count: 1}, {x: 48.0833, y: -1.6833, count: 2}, {x: 43.6, y: 1.4333, count: 4}, {x: 52.6, y: -2, count: 1}, {x: 56, y: -3.7667, count: 1}, {x: 55.8333, y: -4.25, count: 3}, {x: 55.8333, y: -4.25, count: 1}, {x: 55.8333, y: -4.25, count: 2}, {x: 53.8, y: -1.5833, count: 1}, {x: 54.65, y: -2.7333, count: 1}, {x: 51.5, y: -3.2, count: 1}, {x: 54.35, y: -6.2833, count: 1}, {x: 51.2, y: -0.8, count: 1}, {x: 54.6861, y: -1.2125, count: 1}, {x: 51.75, y: -0.3333, count: 2}, {x: 52.3667, y: -1.25, count: 1}, {x: 53.8, y: -1.5833, count: 2}, {x: 52.6333, y: -2.5, count: 2}, {x: 52.5167, y: -1.4667, count: 1}, {x: 57.4833, y: 12.0667, count: 1}, {x: 59.3667, y: 18.0167, count: 1}, {x: 46, y: 2, count: 1}, {x: 51.0211, y: -3.1047, count: 1}, {x: 53.4167, y: -3, count: 4}, {x: 51.25, y: -0.7667, count: 1}, {x: 49, y: 2.3833, count: 1}, {x: 50.8333, y: 4, count: 1}, {x: 48.7833, y: 2.4667, count: 1}, {x: 52, y: 20, count: 2}, {x: 55.7522, y: 37.6156, count: 1}, {x: 51.55, y: 5.1167, count: 1}, {x: 52, y: 20, count: 1}, {x: 49.9667, y: 7.9, count: 1}, {x: 46.25, y: 20.1667, count: 1}, {x: 49.3, y: -1.2333, count: 1}, {x: 48.4333, y: 8.6833, count: 1}, {x: 51.65, y: -0.2667, count: 1}, {x: 53.7, y: -1.4833, count: 2}, {x: 51.5002, y: -0.1262, count: 3}, {x: 51.5, y: -0.5833, count: 1}, {x: 52.5833, y: -2.1333, count: 2}, {x: 49.2833, y: 1, count: 3}, {x: 43.65, y: 5.2667, count: 2}, {x: 54.9881, y: -1.6194, count: 2}, {x: 51.3458, y: -2.9678, count: 2}, {x: 51.0833, y: -4.05, count: 1}, {x: 50.8667, y: -2.9667, count: 1}, {x: 50.3964, y: -4.1386, count: 5}, {x: 53.5333, y: -1.1167, count: 1}, {x: 54.9878, y: -1.4214, count: 3}, {x: 51.4167, y: -0.2833, count: 1}, {x: 54.9881, y: -1.6194, count: 3}, {x: 52.4167, y: -1.55, count: 3}, {x: 51.5002, y: -0.1262, count: 4}, {x: 51.55, y: 0.1667, count: 1}, {x: 51.8333, y: -2.25, count: 3}, {x: 53.65, y: -1.7833, count: 2}, {x: 53.5833, y: -2.4333, count: 2}, {x: 51.45, y: -2.5833, count: 1}, {x: 59.9667, y: 17.7, count: 1}, {x: 54, y: -2, count: 8}, {x: 52.7167, y: -2.7333, count: 2}, {x: 51.0833, y: -0.7, count: 1}, {x: 51.8, y: 4.4667, count: 1}, {x: 48.9, y: 9.1167, count: 1}, {x: 48.3167, y: 2.5, count: 2}, {x: 51.6667, y: -0.4, count: 1}, {x: 51.75, y: -1.25, count: 1}, {x: 52.6333, y: -2.5, count: 1}, {x: 52.35, y: 4.9167, count: 3}, {x: 51.3458, y: -2.9678, count: 1}, {x: 53.7167, y: -1.85, count: 1}, {x: 53.4333, y: -1.35, count: 4}, {x: 42.2, y: 24.3333, count: 2}, {x: 51.5333, y: 0.7, count: 1}, {x: 50.3964, y: -4.1386, count: 1}, {x: 50.3964, y: -4.1386, count: 12}, {x: 50.3964, y: -4.1386, count: 20}, {x: 52.5833, y: -2.1333, count: 1}, {x: 55.7667, y: -4.1667, count: 7}, {x: 53.3167, y: -3.1, count: 1}, {x: 51.9, y: -2.0833, count: 1}, {x: 50.7167, y: -1.8833, count: 1}, {x: 51.6, y: 0.5167, count: 2}, {x: 53.5, y: -2.2167, count: 1}, {x: 53.1333, y: -1.2, count: 1}, {x: 52.0167, y: 4.3333, count: 4}, {x: 50.7, y: 3.1667, count: 2}, {x: 49.6769, y: 6.1239, count: 13}, {x: 53.1, y: -2.4333, count: 1}, {x: 51.3794, y: -2.3656, count: 1}, {x: 24.6408, y: 46.7728, count: 2}, {x: 24.6408, y: 46.7728, count: 3}, {x: 50.75, y: -1.55, count: 1}, {x: 52.6333, y: 1.75, count: 1}, {x: 48.15, y: 9.4667, count: 1}, {x: 52.35, y: 4.9167, count: 2}, {x: 60.8, y: 11.1, count: 1}, {x: 43.561, y: -116.214, count: 1}, {x: 47.5036, y: -94.685, count: 1}, {x: 42.1818, y: -71.1962, count: 1}, {x: 42.0477, y: -74.1227, count: 1}, {x: 40.0326, y: -75.719, count: 1}, {x: 40.7128, y: -73.2962, count: 2}, {x: 27.9003, y: -82.3024, count: 1}, {x: 38.2085, y: -85.6918, count: 1}, {x: 46.8159, y: -100.706, count: 1}, {x: 30.5449, y: -90.8083, count: 1}, {x: 44.735, y: -89.61, count: 1}, {x: 41.4201, y: -75.6485, count: 2}, {x: 39.4209, y: -74.4977, count: 1}, {x: 39.7437, y: -104.979, count: 1}, {x: 39.5593, y: -105.006, count: 1}, {x: 45.2673, y: -93.0196, count: 1}, {x: 41.1215, y: -89.4635, count: 1}, {x: 43.4314, y: -83.9784, count: 1}, {x: 43.7279, y: -86.284, count: 1}, {x: 40.7168, y: -73.9861, count: 1}, {x: 47.7294, y: -116.757, count: 1}, {x: 47.7294, y: -116.757, count: 2}, {x: 35.5498, y: -118.917, count: 1}, {x: 34.1568, y: -118.523, count: 1}, {x: 39.501, y: -87.3919, count: 3}, {x: 33.5586, y: -112.095, count: 1}, {x: 38.757, y: -77.1487, count: 1}, {x: 33.223, y: -117.107, count: 1}, {x: 30.2316, y: -85.502, count: 1}, {x: 39.1703, y: -75.5456, count: 8}, {x: 30.0041, y: -95.2984, count: 2}, {x: 29.7755, y: -95.4152, count: 1}, {x: 41.8014, y: -87.6005, count: 1}, {x: 37.8754, y: -121.687, count: 7}, {x: 38.4493, y: -122.709, count: 1}, {x: 40.5494, y: -89.6252, count: 1}, {x: 42.6105, y: -71.2306, count: 1}, {x: 40.0973, y: -85.671, count: 1}, {x: 40.3987, y: -86.8642, count: 1}, {x: 40.4224, y: -86.8031, count: 4}, {x: 47.2166, y: -122.451, count: 1}, {x: 32.2369, y: -110.956, count: 1}, {x: 41.3969, y: -87.3274, count: 2}, {x: 41.7364, y: -89.7043, count: 2}, {x: 42.3425, y: -71.0677, count: 1}, {x: 33.8042, y: -83.8893, count: 1}, {x: 36.6859, y: -121.629, count: 2}, {x: 41.0957, y: -80.5052, count: 1}, {x: 46.8841, y: -123.995, count: 1}, {x: 40.2851, y: -75.9523, count: 2}, {x: 42.4235, y: -85.3992, count: 1}, {x: 39.7437, y: -104.979, count: 2}, {x: 25.6586, y: -80.3568, count: 7}, {x: 33.0975, y: -80.1753, count: 1}, {x: 25.7615, y: -80.2939, count: 1}, {x: 26.3739, y: -80.1468, count: 1}, {x: 37.6454, y: -84.8171, count: 1}, {x: 34.2321, y: -77.8835, count: 1}, {x: 34.6774, y: -82.928, count: 1}, {x: 39.9744, y: -86.0779, count: 1}, {x: 35.6784, y: -97.4944, count: 2}, {x: 33.5547, y: -84.1872, count: 1}, {x: 27.2498, y: -80.3797, count: 1}, {x: 41.4789, y: -81.6473, count: 1}, {x: 41.813, y: -87.7134, count: 1}, {x: 41.8917, y: -87.9359, count: 1}, {x: 35.0911, y: -89.651, count: 1}, {x: 32.6102, y: -117.03, count: 1}, {x: 41.758, y: -72.7444, count: 1}, {x: 39.8062, y: -86.1407, count: 1}, {x: 41.872, y: -88.1662, count: 1}, {x: 34.1404, y: -81.3369, count: 1}, {x: 46.15, y: -60.1667, count: 1}, {x: 36.0679, y: -86.7194, count: 1}, {x: 43.45, y: -80.5, count: 1}, {x: 44.3833, y: -79.7, count: 1}, {x: 45.4167, y: -75.7, count: 2}, {x: 43.75, y: -79.2, count: 2}, {x: 45.2667, y: -66.0667, count: 3}, {x: 42.9833, y: -81.25, count: 2}, {x: 44.25, y: -79.4667, count: 3}, {x: 45.2667, y: -66.0667, count: 2}, {x: 34.3667, y: -118.478, count: 3}, {x: 42.734, y: -87.8211, count: 1}, {x: 39.9738, y: -86.1765, count: 1}, {x: 33.7438, y: -117.866, count: 1}, {x: 37.5741, y: -122.321, count: 1}, {x: 42.2843, y: -85.2293, count: 1}, {x: 34.6574, y: -92.5295, count: 1}, {x: 41.4881, y: -87.4424, count: 1}, {x: 25.72, y: -80.2707, count: 1}, {x: 34.5873, y: -118.245, count: 1}, {x: 35.8278, y: -78.6421, count: 1}]

            data: [{lat: 33.5363, lon: -117.044, value: 1}, {lat: 33.5608, lon: -117.24, value: 1}, {lat: 38, lon: -97, value: 1}, {lat: 38.9358, lon: -77.1621, value: 1}, {lat: 38, lon: -97, value: 2}, {lat: 54, lon: -2, value: 1}, {lat: 51.5167, lon: -0.7, value: 2}, {lat: 51.5167, lon: -0.7, value: 6}, {lat: 60.3911, lon: 5.3247, value: 1}, {lat: 50.8333, lon: 12.9167, value: 9}, {lat: 50.8333, lon: 12.9167, value: 1}, {lat: 52.0833, lon: 4.3, value: 3}, {lat: 52.0833, lon: 4.3, value: 1}, {lat: 51.8, lon: 4.4667, value: 16}, {lat: 51.8, lon: 4.4667, value: 9}, {lat: 51.8, lon: 4.4667, value: 2}, {lat: 51.1, lon: 6.95, value: 1}, {lat: 13.75, lon: 100.517, value: 1}, {lat: 18.975, lon: 72.8258, value: 1}, {lat: 2.5, lon: 112.5, value: 2}, {lat: 25.0389, lon: 102.718, value: 1}, {lat: -27.6167, lon: 152.733, value: 1}, {lat: -33.7667, lon: 150.833, value: 1}, {lat: -33.8833, lon: 151.217, value: 2}, {lat: 9.4333, lon: 99.9667, value: 1}, {lat: 33.7, lon: 73.1667, value: 1}, {lat: 33.7, lon: 73.1667, value: 2}, {lat: 22.3333, lon: 114.2, value: 1}, {lat: 37.4382, lon: -84.051, value: 1}, {lat: 34.6667, lon: 135.5, value: 1}, {lat: 37.9167, lon: 139.05, value: 1}, {lat: 36.3214, lon: 127.42, value: 1}, {lat: -33.8, lon: 151.283, value: 2}, {lat: -33.8667, lon: 151.225, value: 1}, {lat: -37.65, lon: 144.933, value: 2}, {lat: -37.7333, lon: 145.267, value: 1}, {lat: -34.95, lon: 138.6, value: 1}, {lat: -27.5, lon: 153.017, value: 1}, {lat: -27.5833, lon: 152.867, value: 3}, {lat: -35.2833, lon: 138.55, value: 1}, {lat: 13.4443, lon: 144.786, value: 2}, {lat: -37.8833, lon: 145.167, value: 1}, {lat: -37.86, lon: 144.972, value: 1}, {lat: -27.5, lon: 153.05, value: 1}, {lat: 35.685, lon: 139.751, value: 2}, {lat: -34.4333, lon: 150.883, value: 2}, {lat: 14.0167, lon: 100.733, value: 2}, {lat: 13.75, lon: 100.517, value: 5}, {lat: -31.9333, lon: 115.833, value: 1}, {lat: -33.8167, lon: 151.167, value: 1}, {lat: -37.9667, lon: 145.117, value: 1}, {lat: -37.8333, lon: 145.033, value: 1}, {lat: -37.6417, lon: 176.186, value: 2}, {lat: -37.6861, lon: 176.167, value: 1}, {lat: -41.2167, lon: 174.917, value: 1}, {lat: 39.0521, lon: -77.015, value: 3}, {lat: 24.8667, lon: 67.05, value: 1}, {lat: 24.9869, lon: 121.306, value: 1}, {lat: 53.2, lon: -105.75, value: 4}, {lat: 44.65, lon: -63.6, value: 1}, {lat: 53.9667, lon: -1.0833, value: 1}, {lat: 40.7, lon: 14.9833, value: 1}, {lat: 37.5331, lon: -122.247, value: 1}, {lat: 39.6597, lon: -86.8663, value: 2}, {lat: 33.0247, lon: -83.2296, value: 1}, {lat: 34.2038, lon: -80.9955, value: 1}, {lat: 28.0087, lon: -82.7454, value: 1}, {lat: 44.6741, lon: -93.4103, value: 1}, {lat: 31.4507, lon: -97.1909, value: 1}, {lat: 45.61, lon: -73.84, value: 1}, {lat: 49.25, lon: -122.95, value: 1}, {lat: 49.9, lon: -119.483, value: 2}, {lat: 32.7825, lon: -96.8207, value: 6}, {lat: 32.7825, lon: -96.8207, value: 7}, {lat: 32.7825, lon: -96.8207, value: 4}, {lat: 32.7825, lon: -96.8207, value: 16}, {lat: 32.7825, lon: -96.8207, value: 11}, {lat: 32.7825, lon: -96.8207, value: 3}, {lat: 32.7825, lon: -96.8207, value: 10}, {lat: 32.7825, lon: -96.8207, value: 5}, {lat: 32.7825, lon: -96.8207, value: 14}, {lat: 41.4201, lon: -75.6485, value: 4}, {lat: 31.1999, lon: -92.3508, value: 1}, {lat: 41.9874, lon: -91.6838, value: 1}, {lat: 30.1955, lon: -85.6377, value: 1}, {lat: 42.4266, lon: -92.358, value: 1}, {lat: 41.6559, lon: -91.5228, value: 1}, {lat: 33.9269, lon: -117.861, value: 3}, {lat: 41.8825, lon: -87.6441, value: 6}, {lat: 42.3998, lon: -88.8271, value: 1}, {lat: 33.1464, lon: -97.0902, value: 1}, {lat: 47.2432, lon: -93.5119, value: 1}, {lat: 41.6472, lon: -93.46, value: 1}, {lat: 36.1213, lon: -76.6414, value: 1}, {lat: 41.649, lon: -93.6275, value: 1}, {lat: 44.8547, lon: -93.7854, value: 1}, {lat: 43.6833, lon: -79.7667, value: 1}, {lat: 40.6955, lon: -89.4293, value: 1}, {lat: 37.6211, lon: -77.6515, value: 1}, {lat: 37.6273, lon: -77.5437, value: 3}, {lat: 33.9457, lon: -118.039, value: 1}, {lat: 33.8408, lon: -118.079, value: 1}, {lat: 40.3933, lon: -74.7855, value: 1}, {lat: 40.9233, lon: -73.9984, value: 1}, {lat: 39.0735, lon: -76.5654, value: 1}, {lat: 40.5966, lon: -74.0775, value: 1}, {lat: 40.2944, lon: -73.9932, value: 2}, {lat: 38.9827, lon: -77.004, value: 1}, {lat: 38.3633, lon: -81.8089, value: 1}, {lat: 36.0755, lon: -79.0741, value: 1}, {lat: 51.0833, lon: -114.083, value: 2}, {lat: 49.1364, lon: -122.821, value: 1}, {lat: 39.425, lon: -84.4982, value: 3}, {lat: 38.7915, lon: -82.9217, value: 1}, {lat: 39.0131, lon: -84.2049, value: 1}, {lat: 29.7523, lon: -95.367, value: 7}, {lat: 29.7523, lon: -95.367, value: 4}, {lat: 41.5171, lon: -71.2789, value: 1}, {lat: 29.7523, lon: -95.367, value: 2}, {lat: 32.8148, lon: -96.8705, value: 1}, {lat: 45.5, lon: -73.5833, value: 1}, {lat: 40.7529, lon: -73.9761, value: 6}, {lat: 33.6534, lon: -112.246, value: 1}, {lat: 40.7421, lon: -74.0018, value: 1}, {lat: 38.3928, lon: -121.368, value: 1}, {lat: 32.7825, lon: -96.8207, value: 1}, {lat: 39.7968, lon: -76.993, value: 2}, {lat: 40.5607, lon: -111.724, value: 1}, {lat: 41.2863, lon: -75.8953, value: 1}, {lat: 26.3484, lon: -80.2187, value: 1}, {lat: 32.711, lon: -117.053, value: 2}, {lat: 32.5814, lon: -83.6286, value: 3}, {lat: 35.0508, lon: -80.8186, value: 3}, {lat: 35.0508, lon: -80.8186, value: 1}, {lat: -22.2667, lon: 166.45, value: 5}, {lat: 50.1167, lon: 8.6833, value: 1}, {lat: 51.9167, lon: 4.5, value: 2}, {lat: 54, lon: -2, value: 6}, {lat: 52.25, lon: 21, value: 1}, {lat: 49.1, lon: 10.75, value: 3}, {lat: 51.65, lon: 6.1833, value: 1}, {lat: 1.3667, lon: 103.8, value: 1}, {lat: 29.4889, lon: -98.3987, value: 11}, {lat: 29.3884, lon: -98.5311, value: 1}, {lat: 41.8825, lon: -87.6441, value: 2}, {lat: 41.8825, lon: -87.6441, value: 1}, {lat: 33.9203, lon: -84.618, value: 4}, {lat: 40.1242, lon: -82.3828, value: 1}, {lat: 40.1241, lon: -82.3828, value: 1}, {lat: 43.0434, lon: -87.8945, value: 1}, {lat: 43.7371, lon: -74.3419, value: 1}, {lat: 42.3626, lon: -71.0843, value: 1}, {lat: 4.6, lon: -74.0833, value: 1}, {lat: 19.7, lon: -101.117, value: 1}, {lat: 25.6667, lon: -100.317, value: 1}, {lat: 53.8167, lon: 10.3833, value: 1}, {lat: 50.8667, lon: 6.8667, value: 3}, {lat: 55.7167, lon: 12.45, value: 2}, {lat: 44.4333, lon: 26.1, value: 4}, {lat: 50.1167, lon: 8.6833, value: 2}, {lat: 52.5, lon: 5.75, value: 4}, {lat: 48.8833, lon: 8.7, value: 1}, {lat: 17.05, lon: -96.7167, value: 3}, {lat: 23, lon: -102, value: 1}, {lat: 20.6167, lon: -105.25, value: 1}, {lat: 23, lon: -102, value: 2}, {lat: 20.6667, lon: -103.333, value: 1}, {lat: 21.1167, lon: -101.667, value: 1}, {lat: 17.9833, lon: -92.9167, value: 1}, {lat: 20.9667, lon: -89.6167, value: 2}, {lat: 21.1667, lon: -86.8333, value: 1}, {lat: 17.9833, lon: -94.5167, value: 1}, {lat: 18.6, lon: -98.85, value: 1}, {lat: 16.75, lon: -93.1167, value: 1}, {lat: 19.4342, lon: -99.1386, value: 1}, {lat: -10, lon: -55, value: 1}, {lat: -22.9, lon: -43.2333, value: 1}, {lat: 15.7833, lon: -86.8, value: 1}, {lat: 10.4667, lon: -64.1667, value: 1}, {lat: 7.1297, lon: -73.1258, value: 1}, {lat: 4, lon: -72, value: 2}, {lat: 4, lon: -72, value: 1}, {lat: 6.8, lon: -58.1667, value: 1}, {lat: 0, lon: 0, value: 1}, {lat: 48.15, lon: 11.5833, value: 2}, {lat: 45.8, lon: 16, value: 15}, {lat: 59.9167, lon: 10.75, value: 1}, {lat: 51.5002, lon: -0.1262, value: 1}, {lat: 55, lon: 73.4, value: 1}, {lat: 52.5, lon: 5.75, value: 1}, {lat: 52.2, lon: 0.1167, value: 1}, {lat: 48.8833, lon: 8.3333, value: 1}, {lat: -33.9167, lon: 18.4167, value: 1}, {lat: 40.9157, lon: -81.133, value: 2}, {lat: 43.8667, lon: -79.4333, value: 1}, {lat: 54, lon: -2, value: 2}, {lat: 39, lon: 22, value: 1}, {lat: 54, lon: -2, value: 11}, {lat: 54, lon: -2, value: 4}, {lat: 54, lon: -2, value: 3}, {lat: 9.0833, lon: -79.3833, value: 2}, {lat: 21.5, lon: -104.9, value: 1}, {lat: 19.5333, lon: -96.9167, value: 1}, {lat: 32.5333, lon: -117.017, value: 1}, {lat: 19.4342, lon: -99.1386, value: 3}, {lat: 18.15, lon: -94.4167, value: 1}, {lat: 20.7167, lon: -103.4, value: 1}, {lat: 23.2167, lon: -106.417, value: 2}, {lat: 10.9639, lon: -74.7964, value: 1}, {lat: 24.8667, lon: 67.05, value: 2}, {lat: 1.2931, lon: 103.856, value: 1}, {lat: -41, lon: 174, value: 1}, {lat: 13.75, lon: 100.517, value: 2}, {lat: 13.75, lon: 100.517, value: 16}, {lat: 13.75, lon: 100.517, value: 9}, {lat: 13.75, lon: 100.517, value: 8}, {lat: 13.75, lon: 100.517, value: 7}, {lat: 13.75, lon: 100.517, value: 16}, {lat: 13.75, lon: 100.517, value: 4}, {lat: 13.75, lon: 100.517, value: 6}, {lat: 55.75, lon: -97.8667, value: 5}, {lat: 34.0438, lon: -118.251, value: 2}, {lat: 44.2997, lon: -70.3698, value: 1}, {lat: 46.9402, lon: -113.85, value: 14}, {lat: 45.6167, lon: -61.9667, value: 1}, {lat: 45.3833, lon: -66, value: 2}, {lat: 54.9167, lon: -98.6333, value: 1}, {lat: 40.8393, lon: -73.2797, value: 1}, {lat: 41.6929, lon: -111.815, value: 1}, {lat: 49.8833, lon: -97.1667, value: 1}, {lat: 32.5576, lon: -81.9395, value: 1}, {lat: 49.9667, lon: -98.3, value: 2}, {lat: 40.0842, lon: -82.9378, value: 2}, {lat: 49.25, lon: -123.133, value: 5}, {lat: 35.2268, lon: -78.9561, value: 1}, {lat: 43.9817, lon: -121.272, value: 1}, {lat: 43.9647, lon: -121.341, value: 1}, {lat: 32.7825, lon: -96.8207, value: 13}, {lat: 33.4357, lon: -111.917, value: 2}, {lat: 36.0707, lon: -97.9077, value: 1}, {lat: 32.7791, lon: -96.8028, value: 1}, {lat: 34.053, lon: -118.264, value: 1}, {lat: 30.726, lon: -95.55, value: 1}, {lat: 45.4508, lon: -93.5855, value: 1}, {lat: 32.7825, lon: -96.8207, value: 8}, {lat: 36.8463, lon: -76.0979, value: 3}, {lat: 36.8463, lon: -76.0979, value: 1}, {lat: 34.0533, lon: -118.255, value: 1}, {lat: 35.7217, lon: -81.3603, value: 1}, {lat: 40.6888, lon: -74.0203, value: 4}, {lat: 47.5036, lon: -94.685, value: 2}, {lat: 32.3304, lon: -81.6011, value: 1}, {lat: 39.0165, lon: -77.5062, value: 2}, {lat: 38.6312, lon: -90.1922, value: 1}, {lat: 32.445, lon: -81.7758, value: 1}, {lat: -37.9667, lon: 145.15, value: 1}, {lat: -33.9833, lon: 151.117, value: 1}, {lat: 49.6769, lon: 6.1239, value: 2}, {lat: 53.8167, lon: -1.2167, value: 1}, {lat: 52.4667, lon: -1.9167, value: 3}, {lat: 52.5, lon: 5.75, value: 2}, {lat: 33.5717, lon: -117.729, value: 4}, {lat: 31.5551, lon: -97.1604, value: 1}, {lat: 42.2865, lon: -71.7147, value: 1}, {lat: 48.4, lon: -89.2333, value: 1}, {lat: 42.9864, lon: -78.7279, value: 1}, {lat: 41.8471, lon: -87.6248, value: 1}, {lat: 34.5139, lon: -114.293, value: 1}, {lat: 51.9167, lon: 4.4, value: 1}, {lat: 51.9167, lon: 4.4, value: 4}, {lat: 51.55, lon: 5.1167, value: 30}, {lat: 51.8, lon: 4.4667, value: 8}, {lat: 54.5, lon: -3.6167, value: 1}, {lat: -34.9333, lon: 138.6, value: 1}, {lat: -33.95, lon: 151.133, value: 1}, {lat: 15, lon: 100, value: 4}, {lat: 15, lon: 100, value: 1}, {lat: 15, lon: 100, value: 3}, {lat: 15, lon: 100, value: 2}, {lat: 41.5381, lon: -87.6842, value: 1}, {lat: 40.9588, lon: -75.3006, value: 1}, {lat: 46.7921, lon: -96.8827, value: 1}, {lat: 41.9474, lon: -87.7037, value: 1}, {lat: 41.6162, lon: -87.0489, value: 1}, {lat: 37.5023, lon: -77.5693, value: 1}, {lat: 38.4336, lon: -77.3887, value: 1}, {lat: 41.759, lon: -88.2615, value: 1}, {lat: 42.0158, lon: -87.8423, value: 1}, {lat: 46.5833, lon: -81.2, value: 1}, {lat: 45.3667, lon: -63.3, value: 1}, {lat: 18.0239, lon: -66.6366, value: 2}, {lat: 43.2667, lon: -79.9333, value: 1}, {lat: 45.0667, lon: -64.5, value: 1}, {lat: 39.6351, lon: -78.7665, value: 1}, {lat: 33.4483, lon: -81.6921, value: 2}, {lat: 41.5583, lon: -87.6612, value: 1}, {lat: 30.5315, lon: -90.4628, value: 1}, {lat: 34.7664, lon: -82.2202, value: 2}, {lat: 47.6779, lon: -117.379, value: 2}, {lat: 47.6201, lon: -122.141, value: 1}, {lat: 45.0901, lon: -87.7101, value: 1}, {lat: 38.3119, lon: -90.1535, value: 3}, {lat: 34.7681, lon: -84.9569, value: 4}, {lat: 47.4061, lon: -121.995, value: 1}, {lat: 40.6009, lon: -73.9397, value: 1}, {lat: 40.6278, lon: -73.365, value: 1}, {lat: 40.61, lon: -73.9108, value: 1}, {lat: 34.3776, lon: -83.7605, value: 2}, {lat: 38.7031, lon: -94.4737, value: 1}, {lat: 39.3031, lon: -82.0828, value: 1}, {lat: 42.5746, lon: -88.3946, value: 1}, {lat: 45.4804, lon: -122.836, value: 1}, {lat: 44.5577, lon: -123.298, value: 1}, {lat: 40.1574, lon: -76.7978, value: 1}, {lat: 34.8983, lon: -120.382, value: 1}, {lat: 40.018, lon: -89.8623, value: 1}, {lat: 37.3637, lon: -79.9549, value: 1}, {lat: 37.2141, lon: -80.0625, value: 1}, {lat: 37.2655, lon: -79.923, value: 1}, {lat: 39.0613, lon: -95.7293, value: 1}, {lat: 41.2314, lon: -80.7567, value: 1}, {lat: 40.3377, lon: -79.8428, value: 1}, {lat: 42.0796, lon: -71.0382, value: 1}, {lat: 43.25, lon: -79.8333, value: 1}, {lat: 40.7948, lon: -72.8797, value: 2}, {lat: 40.6766, lon: -73.7038, value: 4}, {lat: 37.979, lon: -121.788, value: 1}, {lat: 43.1669, lon: -76.0558, value: 1}, {lat: 37.5353, lon: -121.979, value: 1}, {lat: 43.2345, lon: -71.5227, value: 1}, {lat: 42.6179, lon: -70.7154, value: 3}, {lat: 42.0765, lon: -71.472, value: 2}, {lat: 35.2298, lon: -81.2428, value: 1}, {lat: 39.961, lon: -104.817, value: 1}, {lat: 44.6667, lon: -63.5667, value: 1}, {lat: 38.4473, lon: -104.632, value: 3}, {lat: 40.7148, lon: -73.7939, value: 1}, {lat: 40.6763, lon: -73.7752, value: 1}, {lat: 41.3846, lon: -73.0943, value: 2}, {lat: 43.1871, lon: -70.91, value: 1}, {lat: 33.3758, lon: -84.4657, value: 1}, {lat: 15, lon: 100, value: 12}, {lat: 36.8924, lon: -80.076, value: 2}, {lat: 25, lon: 17, value: 1}, {lat: 27, lon: 30, value: 1}, {lat: 49.1, lon: 10.75, value: 2}, {lat: 49.1, lon: 10.75, value: 4}, {lat: 47.6727, lon: -122.187, value: 1}, {lat: -27.6167, lon: 152.767, value: 1}, {lat: -33.8833, lon: 151.217, value: 1}, {lat: 31.5497, lon: 74.3436, value: 4}, {lat: 13.65, lon: 100.267, value: 2}, {lat: -37.8167, lon: 144.967, value: 1}, {lat: 47.85, lon: 12.1333, value: 3}, {lat: 47, lon: 8, value: 3}, {lat: 52.1667, lon: 10.55, value: 1}, {lat: 50.8667, lon: 6.8667, value: 2}, {lat: 40.8333, lon: 14.25, value: 2}, {lat: 47.5304, lon: -122.008, value: 1}, {lat: 47.5304, lon: -122.008, value: 3}, {lat: 34.0119, lon: -118.468, value: 1}, {lat: 38.9734, lon: -119.908, value: 1}, {lat: 52.1333, lon: -106.667, value: 1}, {lat: 41.4201, lon: -75.6485, value: 3}, {lat: 45.6393, lon: -94.2237, value: 1}, {lat: 33.7516, lon: -84.3915, value: 1}, {lat: 26.0098, lon: -80.2592, value: 1}, {lat: 34.5714, lon: -78.7566, value: 1}, {lat: 40.7235, lon: -73.8612, value: 1}, {lat: 39.1637, lon: -94.5215, value: 5}, {lat: 28.0573, lon: -81.5687, value: 2}, {lat: 26.8498, lon: -80.14, value: 1}, {lat: 47.6027, lon: -122.156, value: 11}, {lat: 47.6027, lon: -122.156, value: 1}, {lat: 25.7541, lon: -80.271, value: 1}, {lat: 32.7597, lon: -97.147, value: 1}, {lat: 40.9083, lon: -73.8346, value: 2}, {lat: 47.6573, lon: -111.381, value: 1}, {lat: 32.3729, lon: -81.8443, value: 1}, {lat: 32.7825, lon: -96.8207, value: 2}, {lat: 41.5074, lon: -81.6053, value: 1}, {lat: 32.4954, lon: -86.5, value: 1}, {lat: 30.3043, lon: -81.7306, value: 1}, {lat: 45.9667, lon: -81.9333, value: 1}, {lat: 42.2903, lon: -72.6404, value: 5}, {lat: 40.7553, lon: -73.9924, value: 1}, {lat: 55.1667, lon: -118.8, value: 1}, {lat: 37.8113, lon: -122.301, value: 1}, {lat: 40.2968, lon: -111.676, value: 1}, {lat: 42.0643, lon: -87.9921, value: 1}, {lat: 42.3908, lon: -71.0925, value: 1}, {lat: 44.2935, lon: -94.7601, value: 1}, {lat: 40.4619, lon: -74.3561, value: 2}, {lat: 32.738, lon: -96.4463, value: 1}, {lat: 35.7821, lon: -78.8177, value: 1}, {lat: 40.7449, lon: -73.9782, value: 1}, {lat: 40.7449, lon: -73.9782, value: 2}, {lat: 28.5445, lon: -81.3706, value: 1}, {lat: 41.4201, lon: -75.6485, value: 1}, {lat: 38.6075, lon: -83.7928, value: 1}, {lat: 42.2061, lon: -83.206, value: 1}, {lat: 42.3222, lon: -88.4671, value: 1}, {lat: 42.3222, lon: -88.4671, value: 3}, {lat: 37.7035, lon: -122.148, value: 1}, {lat: 37.5147, lon: -122.042, value: 1}, {lat: 40.6053, lon: -111.988, value: 1}, {lat: 38.5145, lon: -81.7814, value: 1}, {lat: 42.1287, lon: -88.2654, value: 1}, {lat: 36.9127, lon: -120.196, value: 1}, {lat: 36.3769, lon: -119.184, value: 1}, {lat: 36.84, lon: -119.828, value: 1}, {lat: 48.0585, lon: -122.148, value: 1}, {lat: 42.1197, lon: -87.8445, value: 1}, {lat: 40.7002, lon: -111.943, value: 2}, {lat: 37.5488, lon: -122.312, value: 1}, {lat: 41.3807, lon: -73.3915, value: 1}, {lat: 45.5, lon: -73.5833, value: 3}, {lat: 34.0115, lon: -117.854, value: 3}, {lat: 43.0738, lon: -83.8608, value: 11}, {lat: 33.9944, lon: -118.464, value: 3}, {lat: 42.7257, lon: -84.636, value: 1}, {lat: 32.7825, lon: -96.8207, value: 22}, {lat: 40.7805, lon: -73.9512, value: 1}, {lat: 42.1794, lon: -75.9491, value: 1}, {lat: 43.3453, lon: -75.1285, value: 1}, {lat: 42.195, lon: -83.165, value: 1}, {lat: 33.9289, lon: -116.488, value: 5}, {lat: 29.4717, lon: -98.514, value: 1}, {lat: 28.6653, lon: -81.4188, value: 1}, {lat: 40.8217, lon: -74.1574, value: 1}, {lat: 41.2094, lon: -73.2116, value: 2}, {lat: 41.0917, lon: -73.4316, value: 1}, {lat: 30.4564, lon: -97.6938, value: 1}, {lat: 36.1352, lon: -95.9364, value: 1}, {lat: 33.3202, lon: -111.761, value: 1}, {lat: 38.9841, lon: -77.3827, value: 1}, {lat: 29.1654, lon: -82.0967, value: 1}, {lat: 37.691, lon: -97.3292, value: 1}, {lat: 33.5222, lon: -112.084, value: 1}, {lat: 41.9701, lon: -71.7217, value: 1}, {lat: 35.6165, lon: -97.4789, value: 3}, {lat: 35.4715, lon: -97.519, value: 1}, {lat: 41.2307, lon: -96.1178, value: 1}, {lat: 53.55, lon: -113.5, value: 2}, {lat: 36.0844, lon: -79.8209, value: 1}, {lat: 40.5865, lon: -74.1497, value: 1}, {lat: 41.9389, lon: -73.9901, value: 1}, {lat: 40.8596, lon: -73.9314, value: 1}, {lat: 33.6119, lon: -111.891, value: 2}, {lat: 38.8021, lon: -90.627, value: 1}, {lat: 38.8289, lon: -91.9744, value: 1}, {lat: 42.8526, lon: -86.1263, value: 2}, {lat: 40.781, lon: -73.2522, value: 1}, {lat: 41.1181, lon: -74.0833, value: 2}, {lat: 40.8533, lon: -74.6522, value: 2}, {lat: 41.3246, lon: -73.6976, value: 1}, {lat: 40.9796, lon: -73.7231, value: 1}, {lat: 28.4517, lon: -81.4653, value: 1}, {lat: 36.0328, lon: -115.025, value: 2}, {lat: 32.5814, lon: -83.6286, value: 1}, {lat: 33.6117, lon: -117.549, value: 1}, {lat: 40.4619, lon: -74.3561, value: 4}, {lat: 40.4619, lon: -74.3561, value: 1}, {lat: 44.1747, lon: -94.0492, value: 3}, {lat: 43.0522, lon: -87.965, value: 1}, {lat: 40.0688, lon: -74.5956, value: 2}, {lat: 33.6053, lon: -117.717, value: 1}, {lat: 39.95, lon: -74.9929, value: 1}, {lat: 38.678, lon: -77.3197, value: 2}, {lat: 34.9184, lon: -92.1362, value: 2}, {lat: 35.9298, lon: -86.4605, value: 1}, {lat: 35.8896, lon: -86.3166, value: 1}, {lat: 39.1252, lon: -76.5116, value: 1}, {lat: 26.976, lon: -82.1391, value: 1}, {lat: 34.5022, lon: -120.129, value: 1}, {lat: 39.9571, lon: -76.7055, value: 2}, {lat: 34.7018, lon: -86.6108, value: 1}, {lat: 54.1297, lon: -108.435, value: 1}, {lat: 32.805, lon: -116.902, value: 1}, {lat: 45.6, lon: -73.7333, value: 1}, {lat: 32.8405, lon: -116.88, value: 1}, {lat: 33.2007, lon: -117.226, value: 1}, {lat: 40.1246, lon: -75.5385, value: 1}, {lat: 40.2605, lon: -75.6155, value: 1}, {lat: 40.7912, lon: -77.8746, value: 1}, {lat: 40.168, lon: -76.6094, value: 1}, {lat: 40.3039, lon: -74.0703, value: 2}, {lat: 39.3914, lon: -74.5182, value: 1}, {lat: 40.1442, lon: -74.8483, value: 1}, {lat: 28.312, lon: -81.589, value: 1}, {lat: 34.0416, lon: -118.299, value: 1}, {lat: 50.45, lon: -104.617, value: 1}, {lat: 41.2305, lon: -73.1257, value: 3}, {lat: 40.6538, lon: -73.6082, value: 1}, {lat: 40.9513, lon: -73.8773, value: 2}, {lat: 41.078, lon: -74.1764, value: 1}, {lat: 32.7492, lon: -97.2205, value: 1}, {lat: 39.5407, lon: -84.2212, value: 1}, {lat: 40.7136, lon: -82.8012, value: 3}, {lat: 36.2652, lon: -82.834, value: 8}, {lat: 40.2955, lon: -75.3254, value: 2}, {lat: 29.7755, lon: -95.4152, value: 2}, {lat: 32.7791, lon: -96.8028, value: 3}, {lat: 32.7791, lon: -96.8028, value: 2}, {lat: 36.4642, lon: -87.3797, value: 2}, {lat: 41.6005, lon: -72.8764, value: 1}, {lat: 35.708, lon: -97.5749, value: 1}, {lat: 40.8399, lon: -73.9422, value: 1}, {lat: 41.9223, lon: -87.7555, value: 1}, {lat: 42.9156, lon: -85.8464, value: 1}, {lat: 41.8824, lon: -87.6376, value: 1}, {lat: 30.6586, lon: -88.3535, value: 1}, {lat: 42.6619, lon: -82.9211, value: 1}, {lat: 35.0481, lon: -85.2833, value: 1}, {lat: 32.3938, lon: -92.2329, value: 1}, {lat: 39.402, lon: -76.6329, value: 1}, {lat: 39.9968, lon: -75.1485, value: 1}, {lat: 38.8518, lon: -94.7786, value: 1}, {lat: 33.4357, lon: -111.917, value: 1}, {lat: 35.8278, lon: -78.6421, value: 2}, {lat: 22.3167, lon: 114.183, value: 12}, {lat: 34.0438, lon: -118.251, value: 1}, {lat: 41.724, lon: -88.1127, value: 1}, {lat: 37.4429, lon: -122.151, value: 1}, {lat: 51.25, lon: -80.6, value: 1}, {lat: 39.209, lon: -94.7305, value: 1}, {lat: 40.7214, lon: -74.0052, value: 1}, {lat: 33.92, lon: -117.208, value: 1}, {lat: 29.926, lon: -97.5644, value: 1}, {lat: 30.4, lon: -97.7528, value: 1}, {lat: 26.937, lon: -80.135, value: 1}, {lat: 32.8345, lon: -111.731, value: 1}, {lat: 29.6694, lon: -82.3572, value: 13}, {lat: 36.2729, lon: -115.133, value: 1}, {lat: 33.2819, lon: -111.88, value: 3}, {lat: 32.5694, lon: -117.016, value: 1}, {lat: 38.8381, lon: -77.2121, value: 1}, {lat: 41.6856, lon: -72.7312, value: 1}, {lat: 33.2581, lon: -116.982, value: 1}, {lat: 38.6385, lon: -90.3026, value: 1}, {lat: 43.15, lon: -79.5, value: 2}, {lat: 43.85, lon: -79.0167, value: 1}, {lat: 44.8833, lon: -76.2333, value: 1}, {lat: 45.4833, lon: -75.65, value: 1}, {lat: 53.2, lon: -105.75, value: 1}, {lat: 51.0833, lon: -114.083, value: 1}, {lat: 29.7523, lon: -95.367, value: 1}, {lat: 38.692, lon: -92.2929, value: 1}, {lat: 34.1362, lon: -117.298, value: 2}, {lat: 28.2337, lon: -82.179, value: 1}, {lat: 40.9521, lon: -73.7382, value: 1}, {lat: 38.9186, lon: -76.7862, value: 2}, {lat: 42.2647, lon: -71.8089, value: 1}, {lat: 42.6706, lon: -73.7791, value: 1}, {lat: 39.5925, lon: -78.5901, value: 1}, {lat: 52.1333, lon: -106.667, value: 2}, {lat: 40.2964, lon: -75.2053, value: 1}, {lat: 34.1066, lon: -117.815, value: 1}, {lat: 40.8294, lon: -73.5052, value: 1}, {lat: 42.1298, lon: -72.5687, value: 1}, {lat: 25.6615, lon: -80.412, value: 2}, {lat: 37.8983, lon: -122.049, value: 1}, {lat: 37.0101, lon: -122.032, value: 2}, {lat: 40.2843, lon: -76.8446, value: 1}, {lat: 39.4036, lon: -104.56, value: 1}, {lat: 34.8397, lon: -106.688, value: 1}, {lat: 40.1879, lon: -75.4254, value: 2}, {lat: 35.0212, lon: -85.2729, value: 2}, {lat: 40.214, lon: -75.073, value: 1}, {lat: 39.9407, lon: -75.2281, value: 1}, {lat: 47.2098, lon: -122.409, value: 1}, {lat: 41.3433, lon: -73.0654, value: 2}, {lat: 41.7814, lon: -72.7544, value: 1}, {lat: 41.3094, lon: -72.924, value: 1}, {lat: 45.3218, lon: -122.523, value: 1}, {lat: 45.4104, lon: -122.702, value: 3}, {lat: 45.6741, lon: -122.471, value: 2}, {lat: 32.9342, lon: -97.2515, value: 1}, {lat: 40.8775, lon: -74.1105, value: 1}, {lat: 40.82, lon: -96.6806, value: 1}, {lat: 45.5184, lon: -122.655, value: 1}, {lat: 41.0544, lon: -74.6171, value: 1}, {lat: 35.3874, lon: -78.8686, value: 1}, {lat: 39.961, lon: -85.9837, value: 1}, {lat: 34.0918, lon: -84.2209, value: 2}, {lat: 39.1492, lon: -78.278, value: 1}, {lat: 38.7257, lon: -77.7982, value: 1}, {lat: 45.0059, lon: -93.4305, value: 1}, {lat: 35.0748, lon: -80.6774, value: 1}, {lat: 35.8059, lon: -78.7997, value: 1}, {lat: 35.8572, lon: -84.0177, value: 1}, {lat: 38.7665, lon: -89.6533, value: 1}, {lat: 43.7098, lon: -87.7478, value: 2}, {lat: 33.3961, lon: -84.7821, value: 1}, {lat: 32.7881, lon: -96.9431, value: 1}, {lat: 43.1946, lon: -89.2025, value: 1}, {lat: 43.0745, lon: -87.9078, value: 1}, {lat: 34.0817, lon: -84.2553, value: 1}, {lat: 37.9689, lon: -103.749, value: 1}, {lat: 31.7969, lon: -106.387, value: 1}, {lat: 31.7435, lon: -106.297, value: 1}, {lat: 29.6569, lon: -98.5107, value: 1}, {lat: 28.4837, lon: -82.5496, value: 1}, {lat: 29.1137, lon: -81.0285, value: 1}, {lat: 29.6195, lon: -100.809, value: 1}, {lat: 35.4568, lon: -97.2652, value: 1}, {lat: 33.8682, lon: -117.929, value: 1}, {lat: 32.7977, lon: -117.132, value: 1}, {lat: 33.3776, lon: -112.387, value: 1}, {lat: 43.1031, lon: -79.0092, value: 1}, {lat: 40.7731, lon: -80.1137, value: 2}, {lat: 40.7082, lon: -74.0132, value: 1}, {lat: 39.7187, lon: -75.6216, value: 1}, {lat: 29.8729, lon: -98.014, value: 1}, {lat: 42.5324, lon: -70.9737, value: 1}, {lat: 41.6623, lon: -71.0107, value: 1}, {lat: 41.1158, lon: -78.9098, value: 1}, {lat: 39.2694, lon: -76.7447, value: 1}, {lat: 39.9, lon: -75.3075, value: 1}, {lat: 41.2137, lon: -85.0996, value: 1}, {lat: 32.8148, lon: -96.8705, value: 2}, {lat: 39.8041, lon: -75.4559, value: 4}, {lat: 40.0684, lon: -75.0065, value: 1}, {lat: 44.8791, lon: -68.733, value: 1}, {lat: 40.1879, lon: -75.4254, value: 1}, {lat: 41.8195, lon: -71.4107, value: 1}, {lat: 38.9879, lon: -76.5454, value: 3}, {lat: 42.5908, lon: -71.8055, value: 6}, {lat: 40.7842, lon: -73.8422, value: 2}, {lat: 0, lon: 0, value: 2}, {lat: 33.336, lon: -96.7491, value: 5}, {lat: 33.336, lon: -96.7491, value: 6}, {lat: 37.4192, lon: -122.057, value: 1}, {lat: 33.7694, lon: -83.3897, value: 1}, {lat: 37.7609, lon: -87.1513, value: 1}, {lat: 33.8651, lon: -84.8948, value: 1}, {lat: 28.5153, lon: -82.2856, value: 1}, {lat: 35.1575, lon: -89.7646, value: 1}, {lat: 32.318, lon: -95.2921, value: 1}, {lat: 35.4479, lon: -91.9977, value: 1}, {lat: 36.6696, lon: -93.2615, value: 1}, {lat: 34.0946, lon: -101.683, value: 1}, {lat: 31.9776, lon: -102.08, value: 1}, {lat: 39.0335, lon: -77.4838, value: 1}, {lat: 40.0548, lon: -75.4083, value: 8}, {lat: 38.9604, lon: -94.8049, value: 2}, {lat: 33.8138, lon: -117.799, value: 3}, {lat: 33.8138, lon: -117.799, value: 1}, {lat: 33.8138, lon: -117.799, value: 2}, {lat: 38.2085, lon: -85.6918, value: 3}, {lat: 37.7904, lon: -85.4848, value: 1}, {lat: 42.4488, lon: -94.2254, value: 1}, {lat: 43.179, lon: -77.555, value: 1}, {lat: 29.7523, lon: -95.367, value: 3}, {lat: 40.665, lon: -73.7502, value: 1}, {lat: 40.6983, lon: -73.888, value: 1}, {lat: 43.1693, lon: -77.6189, value: 1}, {lat: 43.7516, lon: -70.2793, value: 1}, {lat: 37.3501, lon: -121.985, value: 1}, {lat: 32.7825, lon: -96.8207, value: 19}, {lat: 35.1145, lon: -101.771, value: 1}, {lat: 31.7038, lon: -83.6753, value: 2}, {lat: 34.6222, lon: -83.7901, value: 1}, {lat: 35.7102, lon: -84.3743, value: 1}, {lat: 42.0707, lon: -72.044, value: 1}, {lat: 34.7776, lon: -82.3051, value: 2}, {lat: 34.9965, lon: -82.3287, value: 1}, {lat: 32.5329, lon: -85.5078, value: 1}, {lat: 41.5468, lon: -93.6209, value: 1}, {lat: 41.2587, lon: -80.8298, value: 1}, {lat: 35.2062, lon: -81.1384, value: 1}, {lat: 39.9741, lon: -86.1272, value: 1}, {lat: 33.7976, lon: -118.162, value: 1}, {lat: 41.8675, lon: -87.6744, value: 1}, {lat: 42.8526, lon: -86.1263, value: 1}, {lat: 39.9968, lon: -82.9882, value: 1}, {lat: 35.1108, lon: -89.9483, value: 1}, {lat: 35.1359, lon: -90.0027, value: 1}, {lat: 32.3654, lon: -90.1118, value: 1}, {lat: 42.1663, lon: -71.3611, value: 1}, {lat: 39.5076, lon: -104.677, value: 2}, {lat: 39.378, lon: -104.858, value: 1}, {lat: 44.84, lon: -93.0365, value: 1}, {lat: 31.2002, lon: -97.9921, value: 1}, {lat: 26.1783, lon: -81.7145, value: 2}, {lat: 47.9469, lon: -122.197, value: 1}, {lat: 32.2366, lon: -90.1688, value: 1}, {lat: 25.7341, lon: -80.3594, value: 13}, {lat: 26.9467, lon: -80.217, value: 2}, {lat: 44.9487, lon: -93.1002, value: 1}, {lat: 38.6485, lon: -77.3108, value: 1}, {lat: 45.6676, lon: -122.606, value: 1}, {lat: 40.1435, lon: -75.3567, value: 1}, {lat: 43.0139, lon: -71.4352, value: 1}, {lat: 41.9395, lon: -71.2943, value: 2}, {lat: 37.6134, lon: -77.2564, value: 1}, {lat: 42.5626, lon: -83.6099, value: 1}, {lat: 41.55, lon: -88.1248, value: 1}, {lat: 34.0311, lon: -118.49, value: 1}, {lat: 33.7352, lon: -118.315, value: 1}, {lat: 34.0872, lon: -117.882, value: 1}, {lat: 33.8161, lon: -117.979, value: 2}, {lat: 47.6609, lon: -116.834, value: 15}, {lat: 40.2594, lon: -81.9641, value: 2}, {lat: 35.9925, lon: -78.9017, value: 1}, {lat: 32.8098, lon: -96.7993, value: 5}, {lat: 32.6988, lon: -97.1237, value: 1}, {lat: 32.9722, lon: -96.7376, value: 3}, {lat: 32.9513, lon: -96.7154, value: 1}, {lat: 32.9716, lon: -96.7058, value: 2}, {lat: 41.4796, lon: -81.511, value: 2}, {lat: 36.7695, lon: -119.795, value: 1}, {lat: 36.2082, lon: -86.879, value: 2}, {lat: 41.3846, lon: -73.0943, value: 1}, {lat: 37.795, lon: -122.219, value: 1}, {lat: 41.4231, lon: -73.4771, value: 1}, {lat: 38.0322, lon: -78.4873, value: 1}, {lat: 43.6667, lon: -79.4167, value: 1}, {lat: 42.3222, lon: -88.4671, value: 7}, {lat: 40.7336, lon: -96.6394, value: 2}, {lat: 33.7401, lon: -117.82, value: 2}, {lat: 33.7621, lon: -84.3982, value: 1}, {lat: 39.7796, lon: -75.0505, value: 1}, {lat: 39.4553, lon: -74.9608, value: 1}, {lat: 39.7351, lon: -75.6684, value: 1}, {lat: 51.3833, lon: 0.5167, value: 1}, {lat: 45.9833, lon: 6.05, value: 1}, {lat: 51.1833, lon: 14.4333, value: 1}, {lat: 41.9167, lon: 8.7333, value: 1}, {lat: 45.4, lon: 5.45, value: 2}, {lat: 51.9, lon: 6.1167, value: 1}, {lat: 50.4333, lon: 30.5167, value: 1}, {lat: 24.6408, lon: 46.7728, value: 1}, {lat: 54.9878, lon: -1.4214, value: 5}, {lat: 51.45, lon: -2.5833, value: 2}, {lat: 46, lon: 2, value: 2}, {lat: 51.5167, lon: -0.7, value: 1}, {lat: 35.94, lon: 14.3533, value: 1}, {lat: 53.55, lon: 10, value: 1}, {lat: 53.6, lon: 7.2, value: 1}, {lat: 53.8333, lon: -1.7667, value: 1}, {lat: 53.7833, lon: -1.75, value: 2}, {lat: 52.6333, lon: -1.1333, value: 1}, {lat: 53.5333, lon: -1.1167, value: 2}, {lat: 51.0167, lon: -0.45, value: 2}, {lat: 50.7833, lon: -0.65, value: 1}, {lat: 50.9, lon: -1.4, value: 1}, {lat: 50.9, lon: -1.4, value: 5}, {lat: 52.2, lon: -2.2, value: 8}, {lat: 50.1167, lon: 8.6833, value: 3}, {lat: 49.0047, lon: 8.3858, value: 1}, {lat: 49.1, lon: 10.75, value: 7}, {lat: 37.9833, lon: 23.7333, value: 1}, {lat: 41.9, lon: 12.4833, value: 19}, {lat: 51.8833, lon: 10.5667, value: 3}, {lat: 50.0333, lon: 12.0167, value: 1}, {lat: 49.8667, lon: 10.8333, value: 14}, {lat: 51, lon: 9, value: 1}, {lat: 53.3667, lon: -1.5, value: 1}, {lat: 52.9333, lon: -1.5, value: 1}, {lat: 52.9667, lon: -1.1667, value: 1}, {lat: 52.9667, lon: -1.3, value: 1}, {lat: 51.9, lon: -2.0833, value: 2}, {lat: 50.3, lon: 3.9167, value: 1}, {lat: 45.45, lon: -73.75, value: 4}, {lat: 53.7, lon: -2.2833, value: 1}, {lat: 53.9833, lon: -1.5333, value: 1}, {lat: 50.8167, lon: 7.1667, value: 1}, {lat: 56.5, lon: -2.9667, value: 1}, {lat: 51.4667, lon: -0.35, value: 1}, {lat: 43.3667, lon: -5.8333, value: 1}, {lat: 47, lon: 8, value: 4}, {lat: 47, lon: 8, value: 1}, {lat: 47, lon: 8, value: 2}, {lat: 50.7333, lon: -1.7667, value: 2}, {lat: 52.35, lon: 4.9167, value: 1}, {lat: 48.8833, lon: 8.3333, value: 2}, {lat: 53.5333, lon: -0.05, value: 1}, {lat: 55.95, lon: -3.2, value: 2}, {lat: 55.8333, lon: -4.25, value: 4}, {lat: 54.6861, lon: -1.2125, value: 2}, {lat: 52.5833, lon: -0.25, value: 2}, {lat: 53.55, lon: -2.5167, value: 2}, {lat: 52.7667, lon: -1.2, value: 1}, {lat: 52.6333, lon: -1.8333, value: 2}, {lat: 55.0047, lon: -1.4728, value: 2}, {lat: 50.9, lon: -1.4, value: 2}, {lat: 52.6333, lon: 1.3, value: 5}, {lat: 52.25, lon: -1.1667, value: 1}, {lat: 54.9167, lon: -1.7333, value: 1}, {lat: 53.5667, lon: -2.9, value: 3}, {lat: 55.8833, lon: -3.5333, value: 1}, {lat: 53.0667, lon: 6.4667, value: 1}, {lat: 48.3333, lon: 16.35, value: 30}, {lat: 58.35, lon: 15.2833, value: 1}, {lat: 50.6167, lon: 3.0167, value: 1}, {lat: 53.3833, lon: -2.6, value: 1}, {lat: 53.3833, lon: -2.6, value: 2}, {lat: 54.5333, lon: -1.15, value: 5}, {lat: 51.55, lon: 0.05, value: 2}, {lat: 51.55, lon: 0.05, value: 1}, {lat: 50.8, lon: -0.3667, value: 2}, {lat: 49.0533, lon: 11.7822, value: 1}, {lat: 52.2333, lon: 4.8333, value: 1}, {lat: 54.5833, lon: -1.4167, value: 3}, {lat: 54.5833, lon: -5.9333, value: 1}, {lat: 43.1167, lon: 5.9333, value: 2}, {lat: 51.8333, lon: -2.25, value: 1}, {lat: 50.3964, lon: -4.1386, value: 2}, {lat: 51.45, lon: -2.5833, value: 4}, {lat: 54.9881, lon: -1.6194, value: 1}, {lat: 55.9833, lon: -4.6, value: 4}, {lat: 53.4167, lon: -3, value: 1}, {lat: 51.5002, lon: -0.1262, value: 2}, {lat: 50.3964, lon: -4.1386, value: 8}, {lat: 51.3742, lon: -2.1364, value: 1}, {lat: 52.4833, lon: -2.1167, value: 1}, {lat: 54.5728, lon: -1.1628, value: 1}, {lat: 54.5333, lon: -1.15, value: 1}, {lat: 47.7833, lon: 7.3, value: 1}, {lat: 46.95, lon: 4.8333, value: 1}, {lat: 60.1756, lon: 24.9342, value: 2}, {lat: 58.2, lon: 16, value: 2}, {lat: 57.7167, lon: 11.9667, value: 1}, {lat: 60.0667, lon: 15.9333, value: 2}, {lat: 41.2333, lon: 1.8167, value: 2}, {lat: 40.4833, lon: -3.3667, value: 1}, {lat: 52.1333, lon: 4.6667, value: 2}, {lat: 51.4167, lon: 5.4167, value: 1}, {lat: 51.9667, lon: 4.6167, value: 2}, {lat: 51.8333, lon: 4.6833, value: 1}, {lat: 51.8333, lon: 4.6833, value: 2}, {lat: 48.2, lon: 16.3667, value: 1}, {lat: 54.6833, lon: 25.3167, value: 2}, {lat: 51.9333, lon: 4.5833, value: 2}, {lat: 50.9, lon: 5.9833, value: 1}, {lat: 51.4333, lon: -1, value: 1}, {lat: 49.4478, lon: 11.0683, value: 1}, {lat: 61.1333, lon: 21.5, value: 1}, {lat: 62.4667, lon: 6.15, value: 1}, {lat: 59.2167, lon: 10.95, value: 1}, {lat: 48.8667, lon: 2.3333, value: 1}, {lat: 52.35, lon: 4.9167, value: 4}, {lat: 52.35, lon: 4.9167, value: 5}, {lat: 52.35, lon: 4.9167, value: 31}, {lat: 54.0833, lon: 12.1333, value: 1}, {lat: 50.8, lon: -0.5333, value: 1}, {lat: 50.8333, lon: -0.15, value: 1}, {lat: 52.5167, lon: 13.4, value: 2}, {lat: 58.3167, lon: 15.1333, value: 2}, {lat: 59.3667, lon: 16.5, value: 1}, {lat: 55.8667, lon: 12.8333, value: 2}, {lat: 50.8667, lon: 6.8667, value: 1}, {lat: 52.5833, lon: -0.25, value: 1}, {lat: 53.5833, lon: -0.65, value: 2}, {lat: 44.4333, lon: 26.1, value: 6}, {lat: 44.4333, lon: 26.1, value: 3}, {lat: 51.7833, lon: -3.0833, value: 1}, {lat: 50.85, lon: -1.7833, value: 1}, {lat: 52.2333, lon: -1.7333, value: 1}, {lat: 53.1333, lon: -1.2, value: 2}, {lat: 51.4069, lon: -2.5558, value: 1}, {lat: 51.3833, lon: -0.1, value: 1}, {lat: 52.4667, lon: -0.9167, value: 1}, {lat: 55.1667, lon: -1.6833, value: 1}, {lat: 50.9667, lon: -2.75, value: 5}, {lat: 53.25, lon: -1.9167, value: 4}, {lat: 55.8333, lon: -4.25, value: 5}, {lat: 50.7167, lon: -2.4333, value: 1}, {lat: 51.2, lon: -0.5667, value: 2}, {lat: 51.0667, lon: -1.7833, value: 2}, {lat: 51.8167, lon: -2.7167, value: 2}, {lat: 53.3833, lon: -0.7667, value: 1}, {lat: 51.3667, lon: 1.45, value: 6}, {lat: 55.4333, lon: -5.6333, value: 1}, {lat: 52.4167, lon: -1.55, value: 4}, {lat: 51.5333, lon: -0.3167, value: 2}, {lat: 50.45, lon: -3.5, value: 2}, {lat: 53.0167, lon: -1.6333, value: 1}, {lat: 51.7833, lon: 1.1667, value: 3}, {lat: 53.8833, lon: -1.2667, value: 1}, {lat: 56.6667, lon: -3, value: 2}, {lat: 51.4, lon: -1.3167, value: 5}, {lat: 52.1333, lon: -0.45, value: 1}, {lat: 52.4667, lon: -1.9167, value: 1}, {lat: 52.05, lon: -2.7167, value: 1}, {lat: 54.7, lon: -5.8667, value: 2}, {lat: 52.4167, lon: -1.55, value: 1}, {lat: 43.6, lon: 3.8833, value: 1}, {lat: 49.1833, lon: -0.35, value: 1}, {lat: 52.6333, lon: -1.1333, value: 2}, {lat: 52.4733, lon: -8.1558, value: 1}, {lat: 53.3331, lon: -6.2489, value: 3}, {lat: 53.3331, lon: -6.2489, value: 1}, {lat: 52.3342, lon: -6.4575, value: 1}, {lat: 52.2583, lon: -7.1119, value: 1}, {lat: 54.25, lon: -6.9667, value: 1}, {lat: 52.9667, lon: -1.1667, value: 2}, {lat: 51.3742, lon: -2.1364, value: 2}, {lat: 52.5667, lon: -1.55, value: 3}, {lat: 49.9481, lon: 11.5783, value: 1}, {lat: 52.3833, lon: 9.9667, value: 1}, {lat: 47.8167, lon: 9.5, value: 1}, {lat: 50.0833, lon: 19.9167, value: 1}, {lat: 52.2167, lon: 5.2833, value: 1}, {lat: 42.4333, lon: -8.6333, value: 1}, {lat: 42.8333, lon: 12.8333, value: 1}, {lat: 55.7167, lon: 12.45, value: 1}, {lat: 50.7, lon: 3.1667, value: 1}, {lat: 51.5833, lon: -0.2833, value: 1}, {lat: 53.4333, lon: -1.35, value: 1}, {lat: 62.8, lon: 30.15, value: 1}, {lat: 51.3, lon: 12.3333, value: 2}, {lat: 53.6528, lon: -6.6814, value: 1}, {lat: 40.2333, lon: -3.7667, value: 1}, {lat: 42.3741, lon: -71.1072, value: 1}, {lat: 51.5002, lon: -0.1262, value: 5}, {lat: 52.4667, lon: -1.9167, value: 2}, {lat: 53.5, lon: -2.2167, value: 3}, {lat: 54.0667, lon: -2.8333, value: 1}, {lat: 52.5, lon: -2, value: 1}, {lat: 48.0833, lon: -1.6833, value: 2}, {lat: 43.6, lon: 1.4333, value: 4}, {lat: 52.6, lon: -2, value: 1}, {lat: 56, lon: -3.7667, value: 1}, {lat: 55.8333, lon: -4.25, value: 3}, {lat: 55.8333, lon: -4.25, value: 1}, {lat: 55.8333, lon: -4.25, value: 2}, {lat: 53.8, lon: -1.5833, value: 1}, {lat: 54.65, lon: -2.7333, value: 1}, {lat: 51.5, lon: -3.2, value: 1}, {lat: 54.35, lon: -6.2833, value: 1}, {lat: 51.2, lon: -0.8, value: 1}, {lat: 54.6861, lon: -1.2125, value: 1}, {lat: 51.75, lon: -0.3333, value: 2}, {lat: 52.3667, lon: -1.25, value: 1}, {lat: 53.8, lon: -1.5833, value: 2}, {lat: 52.6333, lon: -2.5, value: 2}, {lat: 52.5167, lon: -1.4667, value: 1}, {lat: 57.4833, lon: 12.0667, value: 1}, {lat: 59.3667, lon: 18.0167, value: 1}, {lat: 46, lon: 2, value: 1}, {lat: 51.0211, lon: -3.1047, value: 1}, {lat: 53.4167, lon: -3, value: 4}, {lat: 51.25, lon: -0.7667, value: 1}, {lat: 49, lon: 2.3833, value: 1}, {lat: 50.8333, lon: 4, value: 1}, {lat: 48.7833, lon: 2.4667, value: 1}, {lat: 52, lon: 20, value: 2}, {lat: 55.7522, lon: 37.6156, value: 1}, {lat: 51.55, lon: 5.1167, value: 1}, {lat: 52, lon: 20, value: 1}, {lat: 49.9667, lon: 7.9, value: 1}, {lat: 46.25, lon: 20.1667, value: 1}, {lat: 49.3, lon: -1.2333, value: 1}, {lat: 48.4333, lon: 8.6833, value: 1}, {lat: 51.65, lon: -0.2667, value: 1}, {lat: 53.7, lon: -1.4833, value: 2}, {lat: 51.5002, lon: -0.1262, value: 3}, {lat: 51.5, lon: -0.5833, value: 1}, {lat: 52.5833, lon: -2.1333, value: 2}, {lat: 49.2833, lon: 1, value: 3}, {lat: 43.65, lon: 5.2667, value: 2}, {lat: 54.9881, lon: -1.6194, value: 2}, {lat: 51.3458, lon: -2.9678, value: 2}, {lat: 51.0833, lon: -4.05, value: 1}, {lat: 50.8667, lon: -2.9667, value: 1}, {lat: 50.3964, lon: -4.1386, value: 5}, {lat: 53.5333, lon: -1.1167, value: 1}, {lat: 54.9878, lon: -1.4214, value: 3}, {lat: 51.4167, lon: -0.2833, value: 1}, {lat: 54.9881, lon: -1.6194, value: 3}, {lat: 52.4167, lon: -1.55, value: 3}, {lat: 51.5002, lon: -0.1262, value: 4}, {lat: 51.55, lon: 0.1667, value: 1}, {lat: 51.8333, lon: -2.25, value: 3}, {lat: 53.65, lon: -1.7833, value: 2}, {lat: 53.5833, lon: -2.4333, value: 2}, {lat: 51.45, lon: -2.5833, value: 1}, {lat: 59.9667, lon: 17.7, value: 1}, {lat: 54, lon: -2, value: 8}, {lat: 52.7167, lon: -2.7333, value: 2}, {lat: 51.0833, lon: -0.7, value: 1}, {lat: 51.8, lon: 4.4667, value: 1}, {lat: 48.9, lon: 9.1167, value: 1}, {lat: 48.3167, lon: 2.5, value: 2}, {lat: 51.6667, lon: -0.4, value: 1}, {lat: 51.75, lon: -1.25, value: 1}, {lat: 52.6333, lon: -2.5, value: 1}, {lat: 52.35, lon: 4.9167, value: 3}, {lat: 51.3458, lon: -2.9678, value: 1}, {lat: 53.7167, lon: -1.85, value: 1}, {lat: 53.4333, lon: -1.35, value: 4}, {lat: 42.2, lon: 24.3333, value: 2}, {lat: 51.5333, lon: 0.7, value: 1}, {lat: 50.3964, lon: -4.1386, value: 1}, {lat: 50.3964, lon: -4.1386, value: 12}, {lat: 50.3964, lon: -4.1386, value: 20}, {lat: 52.5833, lon: -2.1333, value: 1}, {lat: 55.7667, lon: -4.1667, value: 7}, {lat: 53.3167, lon: -3.1, value: 1}, {lat: 51.9, lon: -2.0833, value: 1}, {lat: 50.7167, lon: -1.8833, value: 1}, {lat: 51.6, lon: 0.5167, value: 2}, {lat: 53.5, lon: -2.2167, value: 1}, {lat: 53.1333, lon: -1.2, value: 1}, {lat: 52.0167, lon: 4.3333, value: 4}, {lat: 50.7, lon: 3.1667, value: 2}, {lat: 49.6769, lon: 6.1239, value: 13}, {lat: 53.1, lon: -2.4333, value: 1}, {lat: 51.3794, lon: -2.3656, value: 1}, {lat: 24.6408, lon: 46.7728, value: 2}, {lat: 24.6408, lon: 46.7728, value: 3}, {lat: 50.75, lon: -1.55, value: 1}, {lat: 52.6333, lon: 1.75, value: 1}, {lat: 48.15, lon: 9.4667, value: 1}, {lat: 52.35, lon: 4.9167, value: 2}, {lat: 60.8, lon: 11.1, value: 1}, {lat: 43.561, lon: -116.214, value: 1}, {lat: 47.5036, lon: -94.685, value: 1}, {lat: 42.1818, lon: -71.1962, value: 1}, {lat: 42.0477, lon: -74.1227, value: 1}, {lat: 40.0326, lon: -75.719, value: 1}, {lat: 40.7128, lon: -73.2962, value: 2}, {lat: 27.9003, lon: -82.3024, value: 1}, {lat: 38.2085, lon: -85.6918, value: 1}, {lat: 46.8159, lon: -100.706, value: 1}, {lat: 30.5449, lon: -90.8083, value: 1}, {lat: 44.735, lon: -89.61, value: 1}, {lat: 41.4201, lon: -75.6485, value: 2}, {lat: 39.4209, lon: -74.4977, value: 1}, {lat: 39.7437, lon: -104.979, value: 1}, {lat: 39.5593, lon: -105.006, value: 1}, {lat: 45.2673, lon: -93.0196, value: 1}, {lat: 41.1215, lon: -89.4635, value: 1}, {lat: 43.4314, lon: -83.9784, value: 1}, {lat: 43.7279, lon: -86.284, value: 1}, {lat: 40.7168, lon: -73.9861, value: 1}, {lat: 47.7294, lon: -116.757, value: 1}, {lat: 47.7294, lon: -116.757, value: 2}, {lat: 35.5498, lon: -118.917, value: 1}, {lat: 34.1568, lon: -118.523, value: 1}, {lat: 39.501, lon: -87.3919, value: 3}, {lat: 33.5586, lon: -112.095, value: 1}, {lat: 38.757, lon: -77.1487, value: 1}, {lat: 33.223, lon: -117.107, value: 1}, {lat: 30.2316, lon: -85.502, value: 1}, {lat: 39.1703, lon: -75.5456, value: 8}, {lat: 30.0041, lon: -95.2984, value: 2}, {lat: 29.7755, lon: -95.4152, value: 1}, {lat: 41.8014, lon: -87.6005, value: 1}, {lat: 37.8754, lon: -121.687, value: 7}, {lat: 38.4493, lon: -122.709, value: 1}, {lat: 40.5494, lon: -89.6252, value: 1}, {lat: 42.6105, lon: -71.2306, value: 1}, {lat: 40.0973, lon: -85.671, value: 1}, {lat: 40.3987, lon: -86.8642, value: 1}, {lat: 40.4224, lon: -86.8031, value: 4}, {lat: 47.2166, lon: -122.451, value: 1}, {lat: 32.2369, lon: -110.956, value: 1}, {lat: 41.3969, lon: -87.3274, value: 2}, {lat: 41.7364, lon: -89.7043, value: 2}, {lat: 42.3425, lon: -71.0677, value: 1}, {lat: 33.8042, lon: -83.8893, value: 1}, {lat: 36.6859, lon: -121.629, value: 2}, {lat: 41.0957, lon: -80.5052, value: 1}, {lat: 46.8841, lon: -123.995, value: 1}, {lat: 40.2851, lon: -75.9523, value: 2}, {lat: 42.4235, lon: -85.3992, value: 1}, {lat: 39.7437, lon: -104.979, value: 2}, {lat: 25.6586, lon: -80.3568, value: 7}, {lat: 33.0975, lon: -80.1753, value: 1}, {lat: 25.7615, lon: -80.2939, value: 1}, {lat: 26.3739, lon: -80.1468, value: 1}, {lat: 37.6454, lon: -84.8171, value: 1}, {lat: 34.2321, lon: -77.8835, value: 1}, {lat: 34.6774, lon: -82.928, value: 1}, {lat: 39.9744, lon: -86.0779, value: 1}, {lat: 35.6784, lon: -97.4944, value: 2}, {lat: 33.5547, lon: -84.1872, value: 1}, {lat: 27.2498, lon: -80.3797, value: 1}, {lat: 41.4789, lon: -81.6473, value: 1}, {lat: 41.813, lon: -87.7134, value: 1}, {lat: 41.8917, lon: -87.9359, value: 1}, {lat: 35.0911, lon: -89.651, value: 1}, {lat: 32.6102, lon: -117.03, value: 1}, {lat: 41.758, lon: -72.7444, value: 1}, {lat: 39.8062, lon: -86.1407, value: 1}, {lat: 41.872, lon: -88.1662, value: 1}, {lat: 34.1404, lon: -81.3369, value: 1}, {lat: 46.15, lon: -60.1667, value: 1}, {lat: 36.0679, lon: -86.7194, value: 1}, {lat: 43.45, lon: -80.5, value: 1}, {lat: 44.3833, lon: -79.7, value: 1}, {lat: 45.4167, lon: -75.7, value: 2}, {lat: 43.75, lon: -79.2, value: 2}, {lat: 45.2667, lon: -66.0667, value: 3}, {lat: 42.9833, lon: -81.25, value: 2}, {lat: 44.25, lon: -79.4667, value: 3}, {lat: 45.2667, lon: -66.0667, value: 2}, {lat: 34.3667, lon: -118.478, value: 3}, {lat: 42.734, lon: -87.8211, value: 1}, {lat: 39.9738, lon: -86.1765, value: 1}, {lat: 33.7438, lon: -117.866, value: 1}, {lat: 37.5741, lon: -122.321, value: 1}, {lat: 42.2843, lon: -85.2293, value: 1}, {lat: 34.6574, lon: -92.5295, value: 1}, {lat: 41.4881, lon: -87.4424, value: 1}, {lat: 25.72, lon: -80.2707, value: 1}, {lat: 34.5873, lon: -118.245, value: 1}, {lat: 35.8278, lon: -78.6421, value: 1}]
        };
        var heatmapLayer = L.TileLayer.heatMap({
            radius: {value: 15000, absolute: true},
            opacity: 0.8,
            visible: true,
            legend: {
                position: 'br',
                title: 'Example Distribution'
            },
            gradient: {
                0.45: "rgb(0,0,255)",
                0.55: "rgb(0,255,255)",
                0.65: "rgb(0,255,0)",
                0.95: "yellow",
                1.0: "rgb(255,0,0)"
            }
        });

        heatmapLayer.setData(testData.data);
        this._map.addLayer(heatmapLayer);
        this._map.setView([33.5363, -117.044], 6);

//        var config = {
//            "radius": 30,
//            "element": "leafmap",
//            "visible": true,
//            "opacity": 40,
//            legend: {
//                position: 'br',
//                title: 'Example Distribution'
//            },
//            "gradient": {0.45: "rgb(0,0,255)", 0.55: "rgb(0,255,255)", 0.65: "rgb(0,255,0)", 0.95: "yellow", 1.0: "rgb(255,0,0)"}
//        };
//
//        var heatmap = heatmapFactory.create(config);
//        heatmap.store.setDataSet(testData);

    };
    control.createD3SVGLayer = function(layer, collection, sld, opt) {
        var _this = this;
        var geojson_shapefile = new L.D3(collection, {
            id: 'svg-leaflet-d3',
            layer_id: opt.layer_id ? opt.layer_id : 0,
            zIndex: opt.zIndex ? opt.zIndex : -1,
            minZoom: opt.minZoom ? opt.minZoom : null,
            maxZoom: opt.maxZoom ? opt.maxZoom : null,
            sld: sld ? sld : null,
            filename: opt.filename ? opt.filename.toLowerCase() : null,
            filetype: opt.filetype ? opt.filetype.toLowerCase() : null,
            showLabels: opt.showLabels,
            type: opt.type ? opt.type : null,
            tip_field: opt.tip_field ? opt.tip_field : null,
            label_field: opt.label_field ? opt.label_field : null
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
            if (shapefilename !== '' && shapefilename[0] !== undefined && geojson_shapefile.options.name === shapefilename[0].toLowerCase())
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
                    alert(e.data.properties[key].substr(0, 5));
                    if (key === 'website' || (e.data.properties[key] !== null && e.data.properties[key] !== undefined && e.data.properties[key].length > 10 && e.data.properties[key].substr(0, 5) === 'http:'))
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

            if (shapefilename === '' || shapefilename[0] === undefined || geojson_shapefile.options.name === shapefilename[0].toLowerCase())
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
        geojson_shapefile.on('mouseout', function(e) {
            options.map_tooltip.classed("hidden", true);
            d3.select(e.element).style({'fill': e.element.fill});
            d3.select(e.element).style('cursor', 'default');
        });
    };
    control.loadClusterLayer = function(layer) {

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
                        return 10;//metadata.fields[categoryField].lookup[d.data.key] + ' (' + d.data.values.length + ' accident' + (d.data.values.length != 1 ? 's' : '') + ')';
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
                        if (layer.layerType === 'leafletcluster') {

                            control.loadClusterLayer(layer);
                        }
                        else {

//                        control.loadGeoJSONLayer(layer);
                            control.loadTopoJSONLayer(layer);
                        }
                    }
                    else
                    {
                        if (layer.type === 'geojson' || layer.name === 'My draw geometries') {
                            //                           control.loadGeoJSONLayer(layer);
                            control.loadTopoJSONLayer(layer);
                        }
                        if (layer.layer)
                            _this._map.addLayer(layer.layer);
                    }
                } else {
                    if (layer.type === 'shapefile_topojson') {


                    }
                    if (layer.type === 'geojson' || layer.name === 'My draw geometries') {

                    }
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
                if (layer.defaultShowOnMap === true)
                {
                    $(input).prop('checked', true)
                            .trigger('change');
                }
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



    }
    ;

    return control;
};
