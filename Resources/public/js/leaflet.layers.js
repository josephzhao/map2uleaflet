


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
                .appendTo($ui)

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


                                var geojson_layer = new L.D3(response.data, {
                                    id: 'svg-leaflet-d3',
                                    layer_id: layer.layer_id,
                                    zIndex: (300 - layer.index_id),
                                    minZoom: layer.minZoom,
                                    maxZoom: layer.maxZoom,
                                    layerType: layer.layerType
                                });

                                //   geojson_layer.addTo(_this._map);
                                layer.layer = geojson_layer;
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

                                geoJsonLayer.bringToFront = function() {
                                    var pane = this._map._panes.overlayPane;

                                    if (this._container) {
                                        pane.appendChild(this._container);
                                        this._setAutoZIndex(pane, Math.max);
                                    }

                                    return this;
                                };

                                markerclusters.addLayer(geoJsonLayer, true);
                                //   _this._map.addLayer(markerclusters);
                                //   geoJsonLayer.addTo(_this._map);
                                markerclusters.addTo(_this._map);
                                layer.layer = markerclusters;
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
