


L.MAP2U.layers = function (options) {
    var control = L.control(options);
    control.onAdd = function (map) {
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
        layers.forEach(function (layer) {
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
            label.append(layer.layerName);
            item.on('click', function () {
                layers.forEach(function (other) {
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
            map.on('layeradd layerremove', function () {
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
        if (options.buttons === undefined) {
            overlaySection.find('.deemphasize')
                    .append('<div class="overlayers_btn disabled" id="move_overlayer_up"><i class="fa fa-chevron-up"></i></div>')
                    .append('<div class="overlayers_btn disabled" id="move_overlayer_down"><i class="fa fa-chevron-down"></i></div>')
                    .append('<div class="overlayers_btn" id="save_overlayers_index"><i class="fa fa-save"></i></div>')
                    .append('<div class="overlayers_btn disabled" id="overlayers_minus"><i class="fa fa-minus"></i></div>')
                    .append('<div class="overlayers_btn" id="overlayers_plus"><i class="fa fa-plus"></i></div>')
                    .append('<div class="overlayers_btn" id="overlayers_unselectall"><i class="fa fa-times"></i></div>')
                    .append('<div class="overlayers_btn" id="overlayers_selectall"><i class="fa fa-check"></i></div>')
                    .append('<div class="overlayers_btn disabled" id="overlayers_zoom_to_layer"><i class="fa fa-globe"></i></div>')
                    .css('border-bottom', '1px grey dotted');

        }
        else {
            if (options.buttons.up === true) {
                overlaySection.find('.deemphasize')
                        .append('<div class="overlayers_btn disabled" id="move_overlayer_up"><i class="fa fa-chevron-up"></i></div>');
            }
            if (options.buttons.down === true) {
                overlaySection.find('.deemphasize')
                        .append('<div class="overlayers_btn disabled" id="move_overlayer_down"><i class="fa fa-chevron-down"></i></div>');

            }
            if (options.buttons.save === true) {
                overlaySection.find('.deemphasize')
                        .append('<div class="overlayers_btn" id="save_overlayers_index"><i class="fa fa-save"></i></div>');
            }
            if (options.buttons.minus === true) {
                overlaySection.find('.deemphasize')
                        .append('<div class="overlayers_btn disabled" id="overlayers_minus"><i class="fa fa-minus"></i></div>');

            }
            if (options.buttons.plus === true) {
                overlaySection.find('.deemphasize')
                        .append('<div class="overlayers_btn" id="overlayers_plus"><i class="fa fa-plus"></i></div>');

            }
            if (options.buttons.unselectall === true) {
                overlaySection.find('.deemphasize')
                        .append('<div class="overlayers_btn" id="overlayers_unselectall"><i class="fa fa-times"></i></div>');

            }
            if (options.buttons.selectall === true) {
                overlaySection.find('.deemphasize')
                        .append('<div class="overlayers_btn" id="overlayers_selectall"><i class="fa fa-check"></i></div>');

            }
            if (options.buttons.zoom === true) {
                overlaySection.find('.deemphasize')
                        .append('<div class="overlayers_btn disabled" id="overlayers_zoom_to_layer"><i class="fa fa-globe"></i></div>');

            }
            overlaySection.find('.deemphasize')
                    .css('border-bottom', '1px grey dotted');
        }

        var list = $('<ul class="overlay_ul">')
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

            var label_name = I18n.t('javascripts.map.layers.' + layer.layerTitle);
            if (label_name.indexOf('missing ') === 1)
            {
                label.append(layer.layerTitle);
                activeLayerSelect.append("<option value='" + layer.layerId + "'>" + layer.layerTitle + "</option>");
            }
            else
            {
                label.append(label_name);
                activeLayerSelect.append("<option value='" + layer.layerId + "'>" + label_name + "</option>");
            }

            input.on('change', function () {
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
                showlabel_input.on('change', function () {
                    checked = showlabel_input.is(':checked');
                    if (layer.layer)
                    {
                        layer.layer.options.showLabels = checked;
                        if (checked) {
                            var kename = '';
                            var field_kename = [];
                            var shapefilename = $('.sonata-bc #shapefile_select_list option:selected').map(function () {
                                return  this.text;
                            });
                            // only current map is the same with shapefile list selected file name
                            if (shapefilename === '' || shapefilename[0] === undefined || layer.layer.options.name === shapefilename[0].toLowerCase())
                            {
                                field_kename = $('.sonata-bc #shapefile_labelfield_list option:selected').map(function () {
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

            map.on('zoomend', function () {
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
                        I18n.t('javascripts.site.map_' + layer.layerName + '_zoom_in_tooltip') : '');
            });
        }
        map.dataLayers.forEach(function (layer) {
            addOverlay(layer, activeLayerSelect, OSM.MAX_NOTE_REQUEST_AREA);
        });
//      addOverlay(map.noteLayer, 'notes', OSM.MAX_NOTE_REQUEST_AREA);
//      addOverlay(map.dataLayer, 'data', OSM.MAX_REQUEST_AREA);
        //    }

        options.sidebar.addPane($ui);
        jQuery(window).resize(function () {
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
    control.reorderLayers = function () {
        var layers = this._map.dataLayers;
        var showUserDraw = false;
        var activelayer = $("div.sidebar_content div.section.overlay-layers ul.overlay_ul > li.overlay_li.selected");
        $("div.sidebar_content div.section.overlay-layers ul.overlay_ul > li.overlay_li").map(function (i) {

            $(this).data('index', i);


            if (layers[$(this).data('index')].index_id !== undefined) {
                if (activelayer.data("index") !== undefined && parseInt(activelayer.data("index")) === parseInt($(this).data('index'))) {


                    if (layers[$(this).data('index')].layerType === 'group' && layers[$(this).data('index')].filename === 'userdrawlayer-group') {
                        $(this).find("li.overlay_group_li").map(function () {
                            var layerId = $(this).data("layerId");
                            var layerName = $(this).data("layerName");
                            var groupName = $(this).data("groupName");
                            window.map.eachLayer(function (layer) {
                                if (layerId !== undefined && layerName !== undefined && groupName !== undefined && layer.layerId === layerId && layer.layerName === layerName && layer.groupName === groupName) {
                                    layer.bringToFront();
                                }
                                ;
                            });
                        });
                        showUserDraw = true;
                        $(".leaflet-map-pane .leaflet-objects-pane .leaflet-overlay-pane svg.leaflet-zoom-animated").css('z-index', 901);
                    }
                    else {
                        if (parseInt(layers[$(this).data('index')].index_id) === -1)
                        {
                            if (layers[$(this).data('index')].layer) {
                                $(".leaflet-map-pane .leaflet-objects-pane .leaflet-overlay-pane svg.leaflet-zoom-animated").css('z-index', 901);
                            }
                        }
                        else {
                            if (layers[$(this).data('index')].layer !== null && layers[$(this).data('index')].layer !== undefined) {


                                if ((layers[$(this).data('index')].layer instanceof  L.MarkerClusterGroup) === true)
                                {
                                    //  alert(map.dataLayers[i].layer._el);
                                    var clusterlayers = layers[$(this).data('index')].layer._featureGroup._layers;
                                    var keys = Object.keys(clusterlayers).map(function (k) {
                                        return  k;
                                    });
                                    if (clusterlayers[keys[0]] && clusterlayers[keys[0]]._container)
                                        $(clusterlayers[keys[0]]._container).parent().css("z-index", 901);
                                }
                                else {
                                    if ((layers[$(this).data('index')].layer instanceof  L.MarkerClusterGroup) === true) {
                                        var clusterlayers = layers[$(this).data('index')].layer._featureGroup._layers;
                                        var keys = Object.keys(clusterlayers).map(function (k) {
                                            return  k;
                                        });
                                        if (clusterlayers[keys[0]] && clusterlayers[keys[0]]._container)
                                            $(clusterlayers[keys[0]]._container).parent().css("z-index", 901);
                                    }
                                    else {
                                        if (layers[$(this).data('index')].layer && layers[$(this).data('index')].layer._container) {
                                            $(layers[$(this).data('index')].layer._container).css("z-index", 901);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                else {
                    if (layers[$(this).data('index')].layerType === 'group' && layers[$(this).data('index')].filename === 'userdrawlayer-group') {
                        $(this).find("li.overlay_group_li").map(function () {
                            var layerId = $(this).data("layerId");
                            var layerName = $(this).data("layerName");
                            var groupName = $(this).data("groupName");
                            window.map.eachLayer(function (layer) {
                                if (layerId !== undefined && layerName !== undefined && groupName !== undefined && layer.layerId === layerId && layer.layerName === layerName && layer.groupName === groupName) {
                                    layer.bringToBack();
                                }
                                ;
                            });
                        });
                        if (showUserDraw === false)
                            $(".leaflet-map-pane .leaflet-objects-pane .leaflet-overlay-pane svg.leaflet-zoom-animated").css('z-index', 301 - i);
                    }
                    else {
                        // if the layer is user draw layer
                        if (parseInt(layers[$(this).data('index')].index_id) === -1) {
                            if (layers[$(this).data('index')].layer) {
                                $(".leaflet-map-pane .leaflet-objects-pane .leaflet-overlay-pane svg.leaflet-zoom-animated").css('z-index', 300 - i);
                            }
                        }
                        else {
                            if (layers[$(this).data('index')].layer !== null && layers[$(this).data('index')].layer !== undefined)
                            {
                                if ((layers[$(this).data('index')].layer instanceof  L.MarkerClusterGroup) === true)
                                {
                                    //  alert(map.dataLayers[i].layer._el);
                                    var clusterlayers = layers[$(this).data('index')].layer._featureGroup._layers;
                                    var keys = Object.keys(clusterlayers).map(function (k) {
                                        return  k;
                                    });
                                    if (clusterlayers[keys[0]] && clusterlayers[keys[0]]._container)
                                        $(clusterlayers[keys[0]]._container).parent().css("z-index", 300 - i);
                                }
                                else {
                                    if ((layers[$(this).data('index')].layer instanceof  L.MarkerClusterGroup) === true) {
                                        var clusterlayers = layers[$(this).data('index')].layer._featureGroup._layers;
                                        var keys = Object.keys(clusterlayers).map(function (k) {
                                            return  k;
                                        });
                                        if (clusterlayers[keys[0]] && clusterlayers[keys[0]]._container)
                                            $(clusterlayers[keys[0]]._container).parent().css("z-index", 300 - i);
                                    }
                                    else {
                                        if (layers[$(this).data('index')].layer && layers[$(this).data('index')].layer._container) {
                                            $(layers[$(this).data('index')].layer._container).css("z-index", 300 - i);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
    };

    control.renderThematicmap = function (opt) {
        var _this = this;
        var maploaded = false;
        var thematicmap_layer;
        _this._map.dataLayers.forEach(function (layer) {
            if (layer.layerType === 'thematicmap' && layer.datasource === opt.datasource && layer.layerId === opt.layerId) {
                maploaded = true;
                thematicmap_layer = layer;
            }
        });
        if (maploaded === false || (maploaded === true && thematicmap_layer && !thematicmap_layer.layer)) {

            this.addUploadfile(Routing.generate('default_uploadfile_info', {'_locale': window.locale}), opt.datasource, opt);

        }

        if (thematicmap_layer && thematicmap_layer.layer && thematicmap_layer.layer.renderThematicMap) {
            thematicmap_layer.layer.options.thematicmap = true;
            thematicmap_layer.layer.options.thematicmap_rule = opt;
            thematicmap_layer.layer.renderThematicMap(opt);
        }

    };
    control.renderThematicMapLayer = function (thematicmap_layer, opt) {
        if (thematicmap_layer && thematicmap_layer.layer && thematicmap_layer.layer.renderThematicMap) {
            thematicmap_layer.layer.options.thematicmap = true;
            thematicmap_layer.layer.options.thematicmap_rule = opt;
            thematicmap_layer.layer.renderThematicMap(opt);
        }
    };
    control.loadLayerInfoFromSource = function (id, type) {
        var result;
        var _this = this;

        $.ajax({
            url: Routing.generate('leaflet_maplayerinfo', {'_locale': window.locale}),
            type: 'GET',
            beforeSend: function () {

                _this._map.spin(true);
            },
            complete: function () {
                _this._map.spin(false);
            },
            error: function () {
                _this._map.spin(false);
            },
            //Ajax events
            success: completeHandler = function (response) {
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
                if (typeof result.layer === 'string')
                    result.layer = JSON.parse(result.layer);

                var layer = {'defaultShowOnMap': true, 'layerType': result.layer.layerType, 'layer': null, 'minZoom': null, 'maxZoom': null, 'index_id': _this._map.dataLayers.length + 1, 'srs': result.layer.srs, 'layerId': result.layer.id, 'layerTitle': result.layer.layerTitle, 'datasource': result.layer.datasource, 'filename': result.layer.fileName, 'layerName': result.layer.layerName, type: result.layer.datatype};
                if (result.layer.opt !== undefined && typeof result.layer.opt !== 'object')
                    result.layer.opt = JSON.parse(result.layer.opt);

                _this._map.dataLayers[_this._map.dataLayers.length] = layer;
                _this.addOverlayItem(layer, _this._map.dataLayers.length - 1, result.layer.opt);

//                ;
//                switch (result.datatype) {
//                    case 'topojson':
//                        control.RenderTopojsonLayer(result, layer, opt);
//                        break;
//                    case 'geojson':
//
//                        control.RenderGeojsonLayer(result, layer, opt);
//                        break;
//                }

            },
            // Form data
            data: {id: id, layerType: type},
            //Options to tell JQuery not to process data or worry about content-type
            cache: false,
            contentType: false
        });

    };
    // load layer data from server aand create layers based on layer type;
    control.loadLayer = function (layer, opt) {

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
        if (layer.layerType === 'group') {
            control.renderGroupLayer(layer);
            return;
        }


        $.ajax({
            url: Routing.generate('leaflet_maplayer', {'_locale': window.locale}),
            type: 'GET',
            beforeSend: function () {

                _this._map.spin(true);
            },
            complete: function () {
                _this._map.spin(false);
            },
            error: function () {
                _this._map.spin(false);
            },
            //Ajax events
            success: completeHandler = function (response) {

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
            data: {id: layer.layerId, layerType: layer.layerType, public: layer.public},
            //Options to tell JQuery not to process data or worry about content-type
            cache: false,
            contentType: false
        });

        return;
    };
    control.addUploadfile = function (getlayerdata_url, uploadfile_id, opt) {

        var _this = this;
//        if (options.spinner !== undefined && options.spinner !== null && options.spinner_target !== undefined && options.spinner_target !== null) {
//            options.spinner.spin(options.spinner_target);
//        }
        //       spinner.spin(spinner_target);
        var maplayer;

        $.ajax({
            url: getlayerdata_url,
            type: 'GET',
            beforeSend: function () {

                _this._map.spin(true);
            },
            complete: function () {
                _this._map.spin(false);
            },
            error: function () {
                _this._map.spin(false);
            },
            //Ajax events
            success: completeHandler = function (response) {

                var result;
                if (typeof response === 'object') {
                    result = response;
                } else {
                    result = JSON.parse(response);
                }

                if (result.success === true) {
                    var layers = options.layers;
                    layers.forEach(function (layer) {
                        // if this file already exist, delete it first
                        if (result.uploadfile && layer.filename === result.uploadfile.filename) {

                        }
                    });
                    var fileExist = false;
                    _this._map.dataLayers.forEach(function (layer) {
                        if (result.uploadfile && layer.layerId === result.uploadfile.id && layer.layerType === result.uploadfile.layerType && layer.filename === result.uploadfile.filename) {
                            fileExist = true;
                            maplayer = layer;
                        }
                    });
                    if (fileExist === false && result.uploadfile) {
                        if (result.uploadfile.layerType !== 'userdraw' && result.uploadfile.layerType !== 'userdrawlayer') {
                            _this._map.dataLayers[_this._map.dataLayers.length] = {'defaultShowOnMap': true, 'layerType': 'uploadfile', 'layer': null, 'minZoom': null, 'maxZoom': null, 'index_id': _this._map.dataLayers.length + 1, 'srs': result.uploadfile.srs, 'layerId': result.uploadfile.id, 'layerTitle': result.uploadfile.filename, 'datasource': result.uploadfile.datasource, 'filename': result.uploadfile.filename, 'layerName': result.uploadfile.filename, type: 'topojson'};
                            maplayer = _this._map.dataLayers[_this._map.dataLayers.length - 1];
                            _this.addOverlayItem(maplayer, _this._map.dataLayers.length - 1, opt);

//                        if (maplayer.type === 'shapefile_topojson')
//                        {
//                            var ul = $('<ul>');
//                            var li_showlabel = $('<li>');
//                            ul.append(li_showlabel);
//                            label.append("<br>");
//                            item.append(ul);
//                            var showlabel = $('<label>')
//                                    .appendTo(li_showlabel);
//                            var showlabel_input = $('<input>')
//                                    .attr('type', 'checkbox')
//                                    .prop('checked', checked)
//                                    .appendTo(showlabel);
//                            showlabel.append("Labels");
//                            showlabel_input.on('change', function () {
//                                checked = showlabel_input.is(':checked');
//                                if (maplayer.layer)
//                                {
//                                    maplayer.layer.options.showLabels = checked;
//                                    if (checked) {
//                                        var kename = '';
//                                        var field_kename = [];
//                                        var shapefilename = $('.sonata-bc #shapefile_select_list option:selected').map(function () {
//                                            return  this.text;
//                                        });
//                                        // only current map is the same with shapefile list selected file name
//                                        if (shapefilename === '' || shapefilename[0] === undefined || maplayer.layer.options.name === shapefilename[0].toLowerCase())
//                                        {
//                                            field_kename = $('.sonata-bc #shapefile_labelfield_list option:selected').map(function () {
//                                                return  this.text;
//                                            });
//                                        }
//                                        if (field_kename.length === 0 && maplayer.layer.options.label_field !== '' && maplayer.layer.options.label_field !== null) {
//                                            kename = maplayer.layer.options.label_field;
//                                        }
//                                        else
//                                        {
//                                            if (field_kename[0] === '' || field_kename[0] === null)
//                                                kename = undefined;
//                                            else
//                                                kename = field_kename[0];
//                                        }
//                                        maplayer.layer.showFeatureLabels(kename);
//                                    } else {
//                                        maplayer.layer.removeFeatureLabels();
//                                    }
//                                }
//                            });
//                        }



                            _this.overlayToolButtons();
                        }
                        else {

                        }
                    }
                    else {
                        if (!maplayer.layer)
                        {
                            control.loadLayer(maplayer, opt);
                        }
                        else
                        {
                            if (maplayer.layer && !_this._map.hasLayer(maplayer.layer)) {
                                _this._map.addLayer(maplayer.layer);

                            }
                        }
                    }
                }
            },
            // Form data
            data: {id: uploadfile_id},
            //Options to tell JQuery not to process data or worry about content-type
            cache: false,
            contentType: false
                    //   processData: false
        });
    };
    control.renderGroupLayer = function (layer) {

    };
    control.renderWMSLayer = function (layer) {
        if ((layer.layer === undefined || layer.layer === null) && layer.hostName !== undefined && layer.layerName !== undefined)
        {
            var option = {
                layers: layer.layerName,
                format: 'image/png',
                transparent: true,
                attribution: ""
            };
            if (layer.srs !== undefined && layer.srs !== null)
                option['srs'] = layer.srs;
            layer.layer = new L.TileLayer.WMS("http://" + layer.hostName, option);
            layer.map.addLayer(layer.layer);
        }
    };
    control.renderWFSLayer = function (layer) {
        var _this = this;
        if (layer.layer === undefined || layer.layer === null) {

            var geoJsonUrl = "http://" + layer.hostName + "&typeName=" + layer.layerName + "&maxFeatures=5000&srsName=EPSG:4326&outputFormat=json";
            $.ajax({
                url: Routing.generate('default_geoserver_wfs', {'_locale': window.locale}),
                type: 'POST',
                beforeSend: function () {

                    _this._map.spin(true);
                },
                complete: function () {
                    _this._map.spin(false);
                },
                error: function () {
                    _this._map.spin(false);
                },
                data: {
                    address: geoJsonUrl
                },
                success: function (response) {

                    if (typeof response !== 'object')
                        response = JSON.parse(response);
                    if (typeof response.data !== 'object')
                        response.data = JSON.parse(response.data);
                    if (layer.layerType !== 'clustermap') {
                        control.renderD3Layer(layer, response.data, layer.sld, {
                            id: 'svg-leaflet-d3',
                            layerId: layer.layerId,
                            datasource: layer.datasource,
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
    control.RenderGeojsonLayer = function (result, layer, opt) {
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
        if (result.geomdata && result.geomdata['geom'] === undefined)
            return;
        if (typeof result.geomdata === 'object' && typeof result.geomdata['geom'] !== 'object')
            json_data = JSON.parse(result.geomdata['geom']);
        else
            json_data = result.geomdata['geom'];
        var bounds = d3.geo.bounds(json_data);
        layer.bounds = bounds;
        if (layer.layerType === 'clustermap') {
            control.renderClusterLayer(layer, json_data);
            return;
        }
        else {
            if (layer.layerType === 'userdraw' || layer.layerType === 'userdrawlayer')
            {
                control.renderUserdrawLayer(json_data, layer, opt);
            }
            else {

                control.renderD3Layer(layer, json_data, sld, {
                    id: 'svg-leaflet-d3',
                    layerId: layer.layerId,
                    datasource: layer.datasource,
                    zIndex: (300 - layer.index_id),
                    minZoom: layer.minZoom,
                    maxZoom: layer.maxZoom,
                    layerType: layer.layerType,
                    sld: sld,
                    thematicmap: opt,
                    filename: result.layer['fileName'] ? result.layer['fileName'].toLowerCase() : '',
                    filetype: result.layer['fileType'] ? result.layer['fileType'].toLowerCase() : '',
                    showLabels: (result.layer['label_field'] !== '' && result.layer['label_field'] !== null),
                    type: result.datatype,
                    tip_field: result.layer['tip_field'],
                    tip_percentage: result.layer['tip_percentage'],
                    tip_times100: result.layer['tip_times100'],
                    tip_number: result.layer['tip_number'],
                    label_field: result.layer['label_field']
                });

            }
        }
    };
    control.renderUserdrawLayer = function (data, layer, opt) {
        var _this = this;
        if (data === null || data === undefined)
            return;
        if (layer.layerType === 'userdrawlayer')
        {

        } else {
            _this._map.drawnItems.clearLayers();
            layer.layer = undefined;
        }
        $.each(data, function (i) {
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
                if (data[i].geom_type === null) {
                    if (data[i].feature.type === 'Point') {
                        if (parseFloat(data[i].radius) <= 0.0) {
                            data[i].geom_type = "marker";
                        }
                        else {
                            data[i].geom_type = "circle";
                        }
                    }
                    if (data[i].feature.type === 'Polygon') {
                        data[i].geom_type = "polygon";
                    }
                    if (data[i].feature.type === 'LineString') {
                        data[i].geom_type = "polyline";
                    }
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
                feature.layerId = -1;

                feature.on('click', function (e) {

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

                        }

                        var shapefilename = $('.sonata-bc #shapefile_select_list option:selected').map(function () {
                            return  this.text;
                        });
                        if (shapefilename !== null && shapefilename !== '' && shapefilename !== undefined && shapefilename.length > 0)
                        {

                            if ($('#geometries_selected').length > 0 && 'user draw trade area' === shapefilename[0].toLowerCase())
                            {
                                var bExist = false;
                                $("#geometries_selected > option").each(function () {

                                    if (parseInt(this.value) === parseInt(selectedfeature.id)) {
                                        bExist = true;
                                    }
                                });
                                if (bExist === false)
                                {
                                    var p = selectedfeature.name;

                                    if (document.getElementById('geometries_selected')) {
                                        var selectBoxOption = document.createElement("option"); //create new option 
                                        selectBoxOption.value = selectedfeature.id; //set option value 
                                        selectBoxOption.text = p; //set option display text 
                                        document.getElementById('geometries_selected').add(selectBoxOption, null);
                                        //    alert(properties_key[0]+ ':'+ e.data.properties[properties_key[0]] + "\n" + properties_key[1] +':' + e.data.properties[properties_key[1]]);
                                    }
                                }
                                else
                                {
                                    $("#geometries_selected option[value='" + selectedfeature.id + "']").each(function () {
                                        $(this).remove();
                                    });
                                }
                            }
                        }
                        else {
                            $.ajax({
                                url: Routing.generate('draw_content', {'_locale': window.locale}),
                                method: 'GET',
                                beforeSend: function () {

                                    _this._map.spin(true);
                                },
                                complete: function () {
                                    _this._map.spin(false);
                                },
                                error: function () {
                                    _this._map.spin(false);
                                },
                                data: {
                                    id: e.target.id
                                },
                                success: function (response) {

                                    $('#sidebar-left #sidebar_content').html('');
                                    $('#sidebar-left #sidebar_content').html(response);

                                    //                            $('#usergeometriesCarousel').carousel({pause: "hover",wrap: true});

                                }
                            });
                        }

                        if (window.leftSidebar && window.leftSidebar.isVisible() === false) {

                            window.leftSidebar.show();
                        }
                        $(".sonata-bc .leftsidebar-close-control").hide();
                        $('#sidebar-left #sidebar_content').css('visibility', 'visible');
                    }
                    else if (_this._map.drawControl._toolbars.edit._activeMode && _this._map.drawControl._toolbars.edit._activeMode.handler.type === 'edit') {

                        var radius = 0;
                        if (e.target.type === 'circle')
                        {
                            radius = e.target._mRadius;
                        }
                        $.ajax({
                            url: Routing.generate('draw_' + e.target.type, {'_locale': window.locale}),
                            method: 'GET',
                            beforeSend: function () {

                                _this._map.spin(true);
                            },
                            complete: function () {
                                _this._map.spin(false);
                            },
                            error: function () {
                                _this._map.spin(false);
                            },
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
                    else if (_this._map.drawControl._toolbars.edit._activeMode && _this._map.drawControl._toolbars.edit._activeMode.handler.type === 'remove') {
                    }
                    ;
                });
                if (layer.layerType === 'userdrawlayer')
                {
                    if (layer.layer === undefined || layer.layer === null)
                    {
                        layer.layer = new L.FeatureGroup();
                        layer.layer.layerId = layer.layerId;
                        layer.layer.layerName = layer.layerName;
                        layer.layer.groupName = layer.groupName;
                    }
                    layer.layer.addLayer(feature);
                    if (!_this._map.hasLayer(layer.layer))
                    {
                        _this._map.addLayer(layer.layer);
                    }
                } else {
                    if (layer.layer === undefined || layer.layer === null)
                        layer.layer = _this._map.drawnItems;
                    _this._map.drawnItems.addLayer(feature);
                }
            }
        });
        return;

    };
    control.RenderTopojsonLayer = function (result, layer, opt) {
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
        var key = Object.keys(json_data.objects).map(function (k) {
            return  k;
        });
        var properties_key = Object.keys(json_data.objects[key].geometries[0].properties).map(function (k) {
            return  k;
        });
        var collection = topojson.feature(json_data, json_data.objects[key]);
        var bounds = d3.geo.bounds(collection);
        layer.bounds = bounds;
        if (layer.layerType === 'clustermap') {

            control.renderClusterLayer(layer, collection);
            return;
        }

        d3.selectAll("#svg-leaflet-d3").each(function () {
            var elt = d3.select(this);
            if (elt.attr("layerType") !== undefined && elt.attr("layerType") !== '' && elt.attr("layerId") !== undefined && parseInt(elt.attr("layerId")) === parseInt(result.layer['layerId']) && elt.attr("layertype").toString().toLowerCase() === layer.layerType)
                elt.remove();
        });

        control.renderD3Layer(layer, collection, sld, {
            id: 'svg-leaflet-d3',
            layerId: layer.layerId,
            zIndex: (300 - layer.index_id),
            minZoom: layer.minZoom,
            maxZoom: layer.maxZoom,
            datasource: layer.datasource,
            layerType: layer.layerType,
            sld: sld,
            thematicmap: opt,
            filename: result.layer['fileName'] ? result.layer['fileName'].toLowerCase() : '',
            filetype: result.layer['fileType'] ? result.layer['fileType'].toLowerCase() : '',
            showLabels: (result.layer['label_field'] !== '' && result.layer['label_field'] !== null),
            type: result.datatype,
            tip_field: result.layer['tip_field'],
            tip_percentage: result.layer['tip_percentage'],
            tip_times100: result.layer['tip_times100'],
            tip_number: result.layer['tip_number'],
            label_field: result.layer['label_field']
        });
        return;
        var geojson_shapefile = new L.D3(collection, {
            id: 'svg-leaflet-d3',
            layerId: layer.layerId,
            zIndex: (300 - layer.index_id),
            minZoom: layer.minZoom,
            maxZoom: layer.maxZoom,
            layerType: layer.layerType,
            sld: sld,
            filename: result.layer['fileName'] ? result.layer['fileName'].toLowerCase() : '',
            filetype: result.layer['fileType'] ? result.layer['fileType'].toLowerCase() : '',
            showLabels: (result.layer['label_field'] !== '' && result.layer['label_field'] !== null),
            type: result.datatype,
            tip_field: result.layer['tip_field'],
            label_field: result.layer['label_field'],
            featureAttributes: {
                'layerId': result.layer['id'],
                'class': function (feature) {
                    return 'default_fcls';
                }
            }
        });
        geojson_shapefile.addTo(_this._map);
        geojson_shapefile.onLoadSLD(sld);
        layer.layer = geojson_shapefile;
        geojson_shapefile.on('click', function (e) {
            //   if (parseInt(e.target.options.layer_id) === parseInt($("select#activelayer_id.layers-ui").val())) {

            var mouse = d3.mouse(e.element);
            var shapefilename = $('.sonata-bc #shapefile_select_list option:selected').map(function () {
                return  this.text;
            });
            if (shapefilename !== null && shapefilename !== '' && shapefilename[0] !== undefined && geojson_shapefile.options.filename === shapefilename[0].toLowerCase())
            {

                if ($('#geometries_selected').length > 0)
                {
                    var bExist = false;
                    $("#geometries_selected > option").each(function () {

                        if (parseInt(this.value) === parseInt(e.data.properties[properties_key[0]])) {
                            bExist = true;
                        }
                    });
                    if (bExist === false)
                    {
                        var fieldkey = $('.sonata-bc #shapefile_labelfield_list option:selected').map(function () {
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
        geojson_shapefile.on("mouseover", function (e) {
            e.element.fill = $(e.element).css('fill');
            e.element.fill_opacity = $(e.element).css('fill-opacity');
            if (e.element.fill !== 'none' || e.element.fill_opacity !== '0')
            {
                d3.select(e.element).style({'fill': 'red', 'fill-opacity': '0.8'});
            }

            d3.select(e.element).style('cursor', 'pointer');
        });
        geojson_shapefile.on('mousemove', function (e) {

            //    if (parseInt(e.target.options.layer_id) === parseInt($("select#activelayer_id.layers-ui").val())) {

            var shapefilename = $('.sonata-bc #shapefile_select_list option:selected').map(function () {
                return  this.text;
            });
            if (shapefilename === '' || shapefilename[0] === undefined || geojson_shapefile.options.filename === shapefilename[0].toLowerCase())
            {
                var p;
                var fieldkey = '';
                var mouse = L.DomEvent.getMousePosition(e.originalEvent, _this._map._container);
                fieldkey = $('.sonata-bc #shapefile_labelfield_list option:selected').map(function () {
                    return  this.text;
                });
                if (e.target.options.tip_field !== undefined && e.target.options.tip_field !== '' && e.target.options.tip_field !== null) {

                    p = e.data.properties[e.target.options.tip_field ];
                    if (e.target.options.tip_percentage === true && p !== '' && p !== undefined) {
                        if (e.target.options.tip_times100 === true) {
                            p = parseFloat(p) * 100;
                        }
                        if (e.target.options.tip_number !== undefined && e.target.options.tip_number !== '') {
                            p = parseFloat(p).toFixed(parseInt(e.target.options.tip_number));
                        }
                        p = p + "%";
                    }
                }
                else {
                    if (fieldkey === undefined || fieldkey === null || fieldkey === '' || (typeof fieldkey === 'object' && (fieldkey[0] === null || fieldkey[0] === '' || fieldkey[0] === undefined)))
                    {
                        p = e.data.properties[properties_key[1]];
                        if (e.target.options.tip_percentage === true && p !== '' && p !== undefined) {
                            if (e.target.options.tip_times100 === true) {
                                p = parseFloat(p) * 100;
                            }
                            if (e.target.options.tip_number !== undefined && e.target.options.tip_number !== '') {
                                p = parseFloat(p).toFixed(parseInt(e.target.options.tip_number));
                            }
                            p = p + "%";
                        }
                    }
                    else
                    {
                        p = e.data.properties[fieldkey[0]];
                        if (e.target.options.tip_percentage === true && p !== '' && p !== undefined) {
                            if (e.target.options.tip_times100 === true) {
                                p = parseFloat(p) * 100;
                            }
                            if (e.target.options.tip_number !== undefined && e.target.options.tip_number !== '') {
                                p = parseFloat(p).toFixed(parseInt(e.target.options.tip_number));
                            }
                            p = p + "%";
                        }
                    }
                }
                options.map_tooltip.classed("hidden", false)
                        .attr("style", "left:" + (mouse.x + 30) + "px;top:" + (mouse.y - 35) + "px")
                        .html(p);
            }
            // }
        });
        geojson_shapefile.on('mouseout', function (e) {
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
    control.loadTopoJSONLayer = function (layer) {
        var _this = this;
        if (layer.type === 'topojsonfile' || layer.type === 'shapefile_topojson' || layer.type === 'topojson' || layer.type === 'geojson') {
            var url;
            if (layer.layerType !== undefined && layer.layerType === 'uploadfile')
                url = Routing.generate('leaflet_uploadfile', {'_locale': window.locale});
            else
            {
                if (layer.layerType === 'uploadfilelayer')
                {

                    url = Routing.generate('leaflet_maplayer', {'_locale': window.locale});
                }
                else if (layer.layerType === 'leafletcluster')
                {
                    url = Routing.generate('leaflet_clusterlayer', {'_locale': window.locale});
                }
                else if (layer.layerType === 'wms') {

                    if (layer.layer === undefined || layer.layer === null)
                    {

                        layer.layer = new L.TileLayer.WMS("http://" + layer.hostName,
                                {
                                    layers: layer.layerName,
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

                        var geoJsonUrl = "http://" + layer.hostName + "&typeName=" + layer.layerName + "&maxFeatures=5000&srsName=EPSG:4326&outputFormat=json";
                        $.ajax({
                            url: Routing.generate('default_geoserver_wfs', {'_locale': window.locale}),
                            type: 'POST',
                            data: {
                                address: geoJsonUrl
                            },
                            success: function (response) {

                                if (typeof response !== 'object')
                                    response = JSON.parse(response);
                                if (typeof response.data !== 'object')
                                    response.data = JSON.parse(response.data);
                                if (layer.layerType !== 'clustermap') {
                                    var geojson_layer = new L.D3(response.data, {
                                        id: 'svg-leaflet-d3',
                                        layerId: layer.layerId,
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
                                    var properties_key = Object.keys(response.data.features[0].properties).map(function (k) {
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
                                        pointToLayer: function (feature, latlng) {
                                            return new L.CircleMarker(latlng, {
                                                radius: 5,
                                                fillColor: "#A3C990",
                                                color: "#000",
                                                weight: 1,
                                                opacity: 1,
                                                fillOpacity: 0.4
                                            });
                                        },
                                        onEachFeature: function (feature, layer) {
                                            (function (layer, properties) {
                                                layer.on('mouseover', function (e) {
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
                                                layer.on('mouseout', function (e) {


                                                    geoJsonLayer.resetStyle(e.target);
                                                    options.map_tooltip.classed("hidden", true);
                                                    //      $(this).css('fill', $(this).fill);
                                                    //      $(this).css('fill-opacity', $(this).fill_opacity);
                                                    $(this).css('cursor', 'default');
                                                });
                                                layer.on('mousemove', function (e) {                         //    if (parseInt(e.target.options.layer_id) === parseInt($("select#activelayer_id.layers-ui").val())) {

                                                    var shapefilename = $('.sonata-bc #shapefile_select_list option:selected').map(function () {
                                                        return  this.text;
                                                    });
                                                    if (shapefilename === '' || shapefilename[0] === undefined)
                                                    {
                                                        var p;
                                                        var fieldkey = '';
                                                        var mouse = L.DomEvent.getMousePosition(e.originalEvent, _this._map._container);
                                                        fieldkey = $('.sonata-bc #shapefile_labelfield_list option:selected').map(function () {
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
                                                layer.on('click', function (e) {
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
                                                    if (window.leftSidebar && window.leftSidebar.isVisible() === false) {

                                                        window.leftSidebar.show();
                                                    }
                                                    $(".sonata-bc .leftsidebar-close-control").hide();
                                                    $('#sidebar-left #sidebar_content').css('visibility', 'visible');
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
                beforeSend: function () {

                    _this._map.spin(true);
                },
                complete: function () {
                    _this._map.spin(false);
                },
                error: function () {
                    _this._map.spin(false);
                },
                data: {id: layer.layerId, type: layer.type},
                //Ajax events
                success: function (response) {
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
                        $.each(data, function (i) {
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
                                feature.layerId = -1;
                                feature.on('click', function (e) {



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



//                                    
//                                    if (_this._map.drawControl._toolbars.edit._activeMode === null) {
//
//
//                                        var highlight = {
//                                            'color': '#333333',
//                                            'weight': 2,
//                                            'opacity': 1
//                                        };
//                                        if (feature.selected === false || feature.selected === undefined) {
//                                            if (feature.type !== 'marker')
//                                                feature.setStyle(highlight);
//                                            feature.selected = true;
//                                            if (document.getElementById('geometries_selected')) {
//                                                var selectBoxOption = document.createElement("option"); //create new option 
//                                                selectBoxOption.value = feature.id; //set option value 
//                                                selectBoxOption.text = feature.name; //set option display text 
//                                                document.getElementById('geometries_selected').add(selectBoxOption, null);
//                                            }
//                                        }
//                                        else
//                                        {
//                                            if (feature.type !== 'marker')
//                                                feature.setStyle({
//                                                    'color': "blue",
//                                                    'weight': 5,
//                                                    'opacity': 0.6
//                                                });
//                                            feature.selected = false;
//                                            $("#geometries_selected option[value='" + feature.id + "']").each(function () {
//                                                $(this).remove();
//                                            });
//                                        }
//
//                                        $.ajax({
//                                            url: Routing.generate('draw_content'),
//                                            method: 'GET',
//                                            data: {
//                                                id: e.target.id
//                                            },
//                                            success: function (response) {
//
//                                                $('div.sidebar_feature_content').html('');
//                                                $('div.sidebar_feature_content').html(response);
//                                                if (window.leftSidebar) {
//                                                    alert(window.leftSidebar.isVisible());
//                                                }
//                                            }
//                                        });
//                                    }
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

                                        }

                                        var shapefilename = $('.sonata-bc #shapefile_select_list option:selected').map(function () {
                                            return  this.text;
                                        });
                                        if (shapefilename !== null && shapefilename !== '' && shapefilename !== undefined && shapefilename.length > 0)
                                        {

                                            if ($('#geometries_selected').length > 0 && 'user draw trade area' === shapefilename[0].toLowerCase())
                                            {
                                                var bExist = false;
                                                $("#geometries_selected > option").each(function () {

                                                    if (parseInt(this.value) === parseInt(selectedfeature.id)) {
                                                        bExist = true;
                                                    }
                                                });
                                                if (bExist === false)
                                                {
                                                    var p = selectedfeature.name;

                                                    if (document.getElementById('geometries_selected')) {
                                                        var selectBoxOption = document.createElement("option"); //create new option 
                                                        selectBoxOption.value = selectedfeature.id; //set option value 
                                                        selectBoxOption.text = p; //set option display text 
                                                        document.getElementById('geometries_selected').add(selectBoxOption, null);
                                                        //    alert(properties_key[0]+ ':'+ e.data.properties[properties_key[0]] + "\n" + properties_key[1] +':' + e.data.properties[properties_key[1]]);
                                                    }
                                                }
                                                else
                                                {
                                                    $("#geometries_selected option[value='" + selectedfeature.id + "']").each(function () {
                                                        $(this).remove();
                                                    });
                                                }
                                            }
                                        }
                                        else {
                                            $.ajax({
                                                url: Routing.generate('draw_content', {'_locale': window.locale}),
                                                method: 'GET',
                                                beforeSend: function () {

                                                    _this._map.spin(true);
                                                },
                                                complete: function () {
                                                    _this._map.spin(false);
                                                },
                                                error: function () {
                                                    _this._map.spin(false);
                                                },
                                                data: {
                                                    id: e.target.id
                                                },
                                                success: function (response) {

                                                    $('#sidebar-left #sidebar_content').html('');
                                                    $('#sidebar-left #sidebar_content').html(response);
                                                }
                                            });
                                        }
                                        if (window.leftSidebar && window.leftSidebar.isVisible() === false) {

                                            window.leftSidebar.show();
                                        }
                                        $(".sonata-bc .leftsidebar-close-control").hide();
                                        $('#sidebar-left #sidebar_content').css('visibility', 'visible');
                                    }

                                    else if (_this._map.drawControl._toolbars.edit._activeMode && _this._map.drawControl._toolbars.edit._activeMode.handler.type === 'edit') {

                                        var radius = 0;
                                        if (e.target.type === 'circle')
                                        {
                                            radius = e.target._mRadius;
                                        }
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
                                    else if (_this._map.drawControl._toolbars.edit._activeMode && _this._map.drawControl._toolbars.edit._activeMode.handler.type === 'remove') {
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



                        d3.selectAll("#svg-leaflet-d3").each(function () {
                            var elt = d3.select(this);
                            if (elt.attr("filename").toString().toLowerCase() === result.filename.toString().toLowerCase() && elt.attr("layerType").toString().toLowerCase() === layer.layerType)
                                elt.remove();
                        });
                        var keys = Object.keys(result.data, function (k) {
                            return k;
                        });
                        for (var k = 0; k < keys.length; k++) {
                            var json_data = JSON.parse(result.data[keys[k]].geom); //JSON.parse(result.data[keys[k]]);
                            //           var json_data = JSON.parse(result.data);
                            var key = Object.keys(json_data.objects).map(function (k) {
                                return  k;
                            });
                            var properties_key = Object.keys(json_data.objects[key].geometries[0].properties).map(function (k) {
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
                                layerId: layer.layerId,
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
                                tip_percentage: result.layers[keys[k]]['tip_percentage'],
                                tip_times100: result.layers[keys[k]]['tip_times100'],
                                tip_number: result.layers[keys[k]]['tip_number'],
                                label_field: result.layers[keys[k]]['label_field'],
                                featureAttributes: {
                                    'layerId': result.layers[keys[k]]['id'],
                                    'class': function (feature) {
                                        return 'default_fcls';
                                    }
                                }
                            });
                            geojson_shapefile.addTo(_this._map);
                            geojson_shapefile.onLoadSLD(sld);
                            layer.layer = geojson_shapefile;
                            geojson_shapefile.on('click', function (e) {
                                //   if (parseInt(e.target.options.layer_id) === parseInt($("select#activelayer_id.layers-ui").val())) {

                                var mouse = d3.mouse(e.element);
                                var shapefilename = $('.sonata-bc #shapefile_select_list option:selected').map(function () {
                                    return  this.text;
                                });
                                if (shapefilename !== null && shapefilename !== '' && shapefilename[0] !== undefined && geojson_shapefile.options.filename === shapefilename[0].toLowerCase())
                                {

                                    if ($('#geometries_selected').length > 0)
                                    {
                                        var bExist = false;
                                        $("#geometries_selected > option").each(function () {

                                            if (parseInt(this.value) === parseInt(e.data.properties[properties_key[0]])) {
                                                bExist = true;
                                            }
                                        });
                                        if (bExist === false)
                                        {
                                            var fieldkey = $('.sonata-bc #shapefile_labelfield_list option:selected').map(function () {
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
                                else {
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
                                }
                                if (window.leftSidebar && window.leftSidebar.isVisible() === false) {

                                    window.leftSidebar.show();
                                }
                                $(".sonata-bc .leftsidebar-close-control").hide();
                                $('#sidebar-left #sidebar_content').css('visibility', 'visible');

                            });
                            geojson_shapefile.on("mouseover", function (e) {
                                e.element.fill = $(e.element).css('fill');
                                d3.select(e.element).style({'fill': 'red', 'fill-opacity': '0.8'});
                                d3.select(e.element).style('cursor', 'pointer');
                            });
                            geojson_shapefile.on('mousemove', function (e) {

                                //    if (parseInt(e.target.options.layer_id) === parseInt($("select#activelayer_id.layers-ui").val())) {

                                var shapefilename = $('.sonata-bc #shapefile_select_list option:selected').map(function () {
                                    return  this.text;
                                });
                                if (shapefilename === '' || shapefilename[0] === undefined || geojson_shapefile.options.filename === shapefilename[0].toLowerCase())
                                {
                                    var p;
                                    var fieldkey = '';
                                    var mouse = L.DomEvent.getMousePosition(e.originalEvent, _this._map._container);
                                    fieldkey = $('.sonata-bc #shapefile_labelfield_list option:selected').map(function () {
                                        return  this.text;
                                    });
                                    if (e.target.options.tip_field !== undefined && e.target.options.tip_field !== '' && e.target.options.tip_field !== null) {
                                        p = e.data.properties[e.target.options.tip_field ];
                                        if (e.target.options.tip_percentage === true && p !== '' && p !== undefined) {
                                            if (e.target.options.tip_times100 === true) {
                                                p = parseFloat(p) * 100;
                                            }
                                            if (e.target.options.tip_number !== undefined && e.target.options.tip_number !== '') {
                                                p = parseFloat(p).toFixed(parseInt(e.target.options.tip_number));
                                            }
                                            p = p + "%";
                                        }


                                    }
                                    else {
                                        if (fieldkey === undefined || fieldkey === null || fieldkey === '' || (typeof fieldkey === 'object' && (fieldkey[0] === null || fieldkey[0] === '' || fieldkey[0] === undefined)))
                                        {
                                            p = e.data.properties[properties_key[1]];
                                            if (e.target.options.tip_percentage === true && p !== '' && p !== undefined) {
                                                if (e.target.options.tip_times100 === true) {
                                                    p = parseFloat(p) * 100;
                                                }
                                                if (e.target.options.tip_number !== undefined && e.target.options.tip_number !== '') {
                                                    p = parseFloat(p).toFixed(parseInt(e.target.options.tip_number));
                                                }
                                                p = p + "%";
                                            }
                                        }
                                        else
                                        {
                                            p = e.data.properties[fieldkey[0]];
                                            if (e.target.options.tip_percentage === true && p !== '' && p !== undefined) {
                                                if (e.target.options.tip_times100 === true) {
                                                    p = parseFloat(p) * 100;
                                                }
                                                if (e.target.options.tip_number !== undefined && e.target.options.tip_number !== '') {
                                                    p = parseFloat(p).toFixed(parseInt(e.target.options.tip_number));
                                                }
                                                p = p + "%";
                                            }
                                        }
                                    }
                                    options.map_tooltip.classed("hidden", false)
                                            .attr("style", "left:" + (mouse.x + 30) + "px;top:" + (mouse.y - 35) + "px")
                                            .html(p);
                                }
                                // }
                            });
                            geojson_shapefile.on('mouseout', function (e) {
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
    control.createHeatMapLayer = function (opt) {

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
            onExtremaChange: function (data) {
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
        this._map.on("resize", function () {
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
    control.renderD3Layer = function (layer, collection, sld, opt) {
        var _this = this;
        var d3_layer = new L.D3(collection, opt);
        var properties_key = Object.keys(collection.features[0].properties).map(function (k) {
            return  k;
        });
        d3_layer.addTo(_this._map);
        d3_layer.onLoadSLD(sld);
        layer.layer = d3_layer;
        d3_layer.on('click', function (e) {
            //   if (parseInt(e.target.options.layer_id) === parseInt($("select#activelayer_id.layers-ui").val())) {

            var mouse = d3.mouse(e.element);
            var shapefilename = $('.sonata-bc #shapefile_select_list option:selected').map(function () {
                return  this.text;
            });

            if (shapefilename.length > 0) {

                if (d3_layer.options.filename === shapefilename[0].toLowerCase())
                {

                    if ($('#geometries_selected').length > 0)
                    {
                        var bExist = false;
                        $("#geometries_selected > option").each(function () {

                            if (parseInt(this.value) === parseInt(e.data.properties[properties_key[0]])) {
                                bExist = true;
                            }
                        });
                        if (bExist === false)
                        {
                            var fieldkey = $('.sonata-bc #shapefile_labelfield_list option:selected').map(function () {
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
                return;
            }

            // if current show thematic map pane
            shapefilename = $('.thematicmap_div select#thematicmap_datasource option:selected').map(function () {
                return  this.text;
            });

            if (shapefilename.length > 0) {

                return;
            }
            // if current show heat map pane
            shapefilename = $('.heatmap_div select#heatmap_datasource option:selected').map(function () {
                return  this.text;
            });
            if (shapefilename.length > 0) {
                return;
            }
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


            if (window.leftSidebar && window.leftSidebar.isVisible() === false) {

                window.leftSidebar.show();
            }
            $(".sonata-bc .leftsidebar-close-control").hide();
            $('#sidebar-left #sidebar_content').css('visibility', 'visible');

        });
        d3_layer.on("mouseover", function (e) {
            e.element.fill = $(e.element).css('fill');

            e.element.fill_opacity = $(e.element).css('fill-opacity');

            if (e.element.fill !== 'none' || e.element.fill_opacity !== '0')
            {
                d3.select(e.element).style({'fill': 'red', 'fill-opacity': '0.8'});
            }
            d3.select(e.element).style('cursor', 'pointer');
        });
        d3_layer.on('mousemove', function (e) {

            //    if (parseInt(e.target.options.layer_id) === parseInt($("select#activelayer_id.layers-ui").val())) {

            var shapefilename = $('.sonata-bc #shapefile_select_list option:selected').map(function () {
                return  this.text;
            });
            if (shapefilename.length === 1 && d3_layer.options.filename === shapefilename[0].toLowerCase())
            {
                var p;
                var fieldkey = '';
                var mouse = L.DomEvent.getMousePosition(e.originalEvent, _this._map._container);
                fieldkey = $('.sonata-bc #shapefile_labelfield_list option:selected').map(function () {
                    return  this.text;
                });
                if (e.target.options.tip_field !== '' && e.target.options.tip_field !== null && e.target.options.tip_field !== undefined) {
                    {
                        p = e.data.properties[e.target.options.tip_field ];
                        if (e.target.options.tip_percentage === true && p !== '' && p !== undefined) {
                            if (e.target.options.tip_times100 === true) {
                                p = parseFloat(p) * 100;
                            }
                            if (e.target.options.tip_number !== undefined && e.target.options.tip_number !== null && e.target.options.tip_number !== '') {
                                p = parseFloat(p).toFixed(parseInt(e.target.options.tip_number));
                            }
                            p = p + "%";
                        }

                    }
                }
                else {
                    if (fieldkey === '' || fieldkey[0] === '' || fieldkey[0] === undefined)
                    {
                        p = e.data.properties[properties_key[1]];
                        if (e.target.options.tip_percentage === true && p !== '' && p !== undefined) {
                            if (e.target.options.tip_times100 === true) {
                                p = parseFloat(p) * 100;
                            }
                            if (e.target.options.tip_number !== undefined && e.target.options.tip_number !== null && e.target.options.tip_number !== '') {
                                p = parseFloat(p).toFixed(parseInt(e.target.options.tip_number));
                            }
                            p = p + "%";
                        }
                    }
                    else
                    {
                        p = e.data.properties[fieldkey[0]];
                        if (e.target.options.tip_percentage === true && p !== '' && p !== undefined) {
                            if (e.target.options.tip_times100 === true) {
                                p = parseFloat(p) * 100;
                            }
                            if (e.target.options.tip_number !== undefined && e.target.options.tip_number !== null && e.target.options.tip_number !== '') {
                                p = parseFloat(p).toFixed(parseInt(e.target.options.tip_number));
                            }
                            p = p + "%";
                        }
                    }
                }

                options.map_tooltip.classed("hidden", false)
                        .attr("style", "left:" + (mouse.x + 30) + "px;top:" + (mouse.y - 35) + "px")
                        .html(p);
            }
            // }
        });
        d3_layer.on('mouseout', function (e) {
            options.map_tooltip.classed("hidden", true);
            d3.select(e.element).style({'fill': e.element.fill, 'fill-opacity': e.element.fill_opacity});
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

    control.renderClusterLayer = function (layer, collection) {
        var _this = this;

        //    _this._map.spin(true);

//                 
        var properties_key = Object.keys(collection.features[0].properties).map(function (k) {
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
            pointToLayer: function (feature, latlng) {
                return new L.CircleMarker(latlng, {
                    radius: 5,
                    fillColor: "#A3C990",
                    color: "#000",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.4
                });
            },
            onEachFeature: function (feature, layer) {
                (function (layer, properties) {
                    layer.on('mouseover', function (e) {
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
                    layer.on('mouseout', function (e) {


                        geoJsonLayer.resetStyle(e.target);
                        options.map_tooltip.classed("hidden", true);
                        //      $(this).css('fill', $(this).fill);
                        //      $(this).css('fill-opacity', $(this).fill_opacity);
                        $(this).css('cursor', 'default');
                    });
                    layer.on('mousemove', function (e) {                         //    if (parseInt(e.target.options.layer_id) === parseInt($("select#activelayer_id.layers-ui").val())) {

                        var shapefilename = $('.sonata-bc #shapefile_select_list option:selected').map(function () {
                            return  this.text;
                        });
                        if (shapefilename === '' || shapefilename[0] === undefined)
                        {
                            var p;
                            var fieldkey = '';
                            var mouse = L.DomEvent.getMousePosition(e.originalEvent, _this._map._container);
                            fieldkey = $('.sonata-bc #shapefile_labelfield_list option:selected').map(function () {
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
                    layer.on('click', function (e) {
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
                        if (window.leftSidebar && window.leftSidebar.isVisible() === false) {

                            window.leftSidebar.show();
                        }
                        $(".sonata-bc .leftsidebar-close-control").hide();
                        $('#sidebar-left #sidebar_content').css('visibility', 'visible');
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

    control.defineClusterIcon = function (cluster) {
        var children = cluster.getAllChildMarkers(),
                n = children.length, //Get number of markers in cluster
                strokeWidth = 1, //Set clusterpie stroke width
                //  r = rmax - 2 * strokeWidth - (n < 10 ? 12 : n < 100 ? 8 : n < 1000 ? 4 : 0), //Calculate clusterpie radius...
                iconDim = (20 + strokeWidth) * 2, //r + strokeWidth) * 2, //...and divIcon dimensions (leaflet really want to know the size)
                data = d3.nest() //Build a dataset for the pie chart
                .key(function (d) {
                    return d.feature.properties[0];
                })
                .entries(children, d3.map),
                //bake some svg markup
                html = bakeThePie({data: data,
                    valueFunc: function (d) {
                        return d.values.length;
                    },
                    strokeWidth: 1,
                    outerRadius: 20, //r,
                    innerRadius: 10, //r - 10,
                    pieClass: 'cluster-pie',
                    pieLabel: n,
                    pieLabelClass: 'marker-cluster-pie-label',
                    pathClassFunc: function (d) {
                        return "category-" + d.data.key;
                    },
                    pathTitleFunc: function (d) {
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
    control.bakeThePie = function (options) {
        /*data and valueFunc are required*/
        if (!options.data || !options.valueFunc) {
            return '';
        }
        var data = options.data,
                valueFunc = options.valueFunc,
                r = options.outerRadius ? options.outerRadius : 28, //Default outer radius = 28px
                rInner = options.innerRadius ? options.innerRadius : r - 10, //Default inner radius = r-10
                strokeWidth = options.strokeWidth ? options.strokeWidth : 1, //Default stroke is 1
                pathClassFunc = options.pathClassFunc ? options.pathClassFunc : function () {
                    return '';
                }, //Class for each path
                pathTitleFunc = options.pathTitleFunc ? options.pathTitleFunc : function () {
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
    control.renderLegend = function () {
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
                .attr('class', function (d) {
                    return 'category-' + d.key;
                })
                .classed({'legenditem': true})
                .text(function (d) {
                    return d.value;
                });
    };
    /*Helper function*/
    control.serializeXmlNode = function (xmlNode) {
        if (typeof window.XMLSerializer !== "undefined") {
            return (new window.XMLSerializer()).serializeToString(xmlNode);
        } else if (typeof xmlNode.xml !== "undefined") {
            return xmlNode.xml;
        }
        return "";
    };
    control.overlayToolButtons = function () {
        var _this = this;
        $('div.sidebar_content div.section.overlay-layers div#move_overlayer_up').unbind('click');
        $('div.sidebar_content div.section.overlay-layers div#move_overlayer_up').on('click', function () {
            var selected = $('div.sidebar_content div.section.overlay-layers ul.overlay_ul > li.overlay_li.selected');
            if (selected.prev()) {
                selected.insertBefore(selected.prev());
                _this.reorderLayers();
            }

        });
        $('div.sidebar_content div.section.overlay-layers div#move_overlayer_down').unbind('click');
        $('div.sidebar_content div.section.overlay-layers div#move_overlayer_down').on('click', function () {
            var selected = $('div.sidebar_content div.section.overlay-layers ul.overlay_ul > li.overlay_li.selected');
            if (selected.next()) {
                selected.insertAfter(selected.next());
                _this.reorderLayers();
            }

        });
        // save current layers status to server
        $('div.sidebar_content div.section.overlay-layers div#overlayers_plus').unbind('click');
        $('div.sidebar_content div.section.overlay-layers div#overlayers_plus').on('click', function () {
            $.ajax({
                url: Routing.generate('default_mapoverlayselectionform', {'_locale': window.locale}),
                type: 'GET',
                beforeSend: function () {

                    //      _this._map.spin(true);
                },
                complete: function () {
                    //        _this._map.spin(false);
                },
                error: function () {
                    //       _this._map.spin(false);
                },
                //Ajax events
                success: completeHandler = function (response) {


                    $("#sidebar-left #sidebar_content").html(response);
                },
                // Form data
                data: {},
                //Options to tell JQuery not to process data or worry about content-type
                cache: false,
                contentType: false,
                processData: false
            });

        });
        $('div.sidebar_content div.section.overlay-layers div#overlayers_minus').unbind('click');
        $('div.sidebar_content div.section.overlay-layers div#overlayers_minus').on('click', function () {
            var selected = $('div.sidebar_content div.section.overlay-layers ul.overlay_ul > li.overlay_li.selected');
            if (selected.data("index") !== undefined && _this._map.dataLayers[selected.data("index")] && _this._map.dataLayers[selected.data("index")].index_id !== -1) {
                if (confirm('Do you want to remove it from overlayers?')) {
                    if (_this._map.dataLayers[selected.data("index")] && _this._map.dataLayers[selected.data("index")].layer) {
                        _this._map.removeLayer(_this._map.dataLayers[selected.data("index")].layer);
                    }
                    _this._map.dataLayers.splice(selected.data("index"), 1);
                    selected.remove();
                    _this.reorderLayers();
                    $('div.sidebar_content div.section.overlay-layers ul.overlay_ul').hide().fadeIn('fast');

                }
            }
        });
        $('div.sidebar_content div.section.overlay-layers div#overlayers_zoom_to_layer').unbind('click');
        $('div.sidebar_content div.section.overlay-layers div#overlayers_zoom_to_layer').on('click', function () {
            var selected = $('div.sidebar_content div.section.overlay-layers ul.overlay_ul > li.overlay_li.selected');
            if (selected.data("index") !== undefined && _this._map.dataLayers[selected.data("index")] && _this._map.dataLayers[selected.data("index")].bounds) {
                //  alert("zoom to level");
                var bound = _this._map.dataLayers[selected.data("index")].bounds;
                _this._map.fitBounds([[bound[0][1], bound[0][0]], [bound[1][1], bound[1][0]]]);

            }
            else {
                var bounds = _this._map.getBounds();
                alert(JSON.stringify(bounds));
                _this._map.fitBounds(_this._map.getBounds());
            }
        });
        // save current layers status to server
        $('div.sidebar_content div.section.overlay-layers div#overlayers_selectall').unbind('click');
        $('div.sidebar_content div.section.overlay-layers div#overlayers_selectall').on('click', function () {
            $('div.sidebar_content div.section.overlay-layers ul.overlay_ul > li.overlay_li').map(function () {
                $(this).find("input[type=checkbox]").prop('checked', true)
                        .trigger('change');
            });
        });
        $('div.sidebar_content div.section.overlay-layers div#overlayers_unselectall').unbind('click');
        $('div.sidebar_content div.section.overlay-layers div#overlayers_unselectall').on('click', function () {
            $('div.sidebar_content div.section.overlay-layers ul.overlay_ul > li.overlay_li').map(function () {
                $(this).find("input[type=checkbox]").prop('checked', false)
                        .trigger('change');
            });
        });
        $('div.sidebar_content div.section.overlay-layers ul.overlay_ul > li.overlay_li div.layer_legend_icon').unbind('click');
        $('div.sidebar_content div.section.overlay-layers ul.overlay_ul > li.overlay_li div.layer_legend_icon').click(function (e) {

            if ($(this).find("i").hasClass("fa-plus")) {
                $(this).find("i").removeClass("fa-plus");
                $(this).find("i").addClass("fa-minus");
                if ($(this).parent().find(".layer_legend").hasClass('hidden')) {
                    $(this).parent().find(".layer_legend").removeClass('hidden');
                }


            }
            else {
                $(this).find("i").removeClass("fa-minus");
                $(this).find("i").addClass("fa-plus");
                $(this).parent().find(".layer_legend").addClass('hidden');
            }

//            $('div.sidebar_content div.section.overlay-layers ul > li .layername_label').map(function () {
//                if (_that !== this) {
//                    $(this).parent().removeClass("selected");
//                }
//            });
        });
        $('div.sidebar_content div.section.overlay-layers ul.overlay_ul > li.overlay_li .layername_label').unbind('click');
        $('div.sidebar_content div.section.overlay-layers ul.overlay_ul > li.overlay_li .layername_label').click(function (e) {
            var _that = this;
            $('div.sidebar_content div.section.overlay-layers ul.overlay_ul > li.overlay_li .layername_label').map(function () {
                if (_that !== this) {
                    $(this).parent().removeClass("selected");
                }
            });
            $('div.sidebar_content div.section.overlay-layers ul.overlay_ul > li.overlay_li > ul.layer_legend > li.overlay_group_li .group_layername_label').map(function () {
                if (_that !== this) {
                    $(this).parent().removeClass("selected");
                }

            });
            if ($(this).parent().hasClass("selected"))
            {
                $(this).parent().removeClass("selected");

                $('div.sidebar_content div.section.overlay-layers div#overlayers_zoom_to_layer').addClass('disabled');
                $('div.sidebar_content div.section.overlay-layers div#overlayers_minus').addClass('disabled');
                $('div.sidebar_content div.section.overlay-layers div#move_overlayer_up').addClass('disabled');
                $('div.sidebar_content div.section.overlay-layers div#move_overlayer_down').addClass('disabled');

            }
            else
            {
                $(this).parent().addClass("selected");
                $('div.sidebar_content div.section.overlay-layers div#overlayers_zoom_to_layer').removeClass('disabled');
                $('div.sidebar_content div.section.overlay-layers div#overlayers_minus').removeClass('disabled');
                $('div.sidebar_content div.section.overlay-layers div#move_overlayer_up').removeClass('disabled');
                $('div.sidebar_content div.section.overlay-layers div#move_overlayer_down').removeClass('disabled');
            }

            _this.reorderLayers();
            e.stopPropagation();
        });




        $('div.sidebar_content div.section.overlay-layers ul.overlay_ul > li.overlay_li > ul.layer_legend > li.overlay_group_li .group_layername_label').unbind('click');
        $('div.sidebar_content div.section.overlay-layers ul.overlay_ul > li.overlay_li > ul.layer_legend > li.overlay_group_li .group_layername_label').click(function (e) {
            var _that = this;
            $('div.sidebar_content div.section.overlay-layers ul.overlay_ul > li.overlay_li .layername_label').map(function () {
                if (_that !== this) {
                    $(this).parent().removeClass("selected");
                }

            });
            $('div.sidebar_content div.section.overlay-layers ul.overlay_ul > li.overlay_li > ul.layer_legend > li.overlay_group_li .group_layername_label').map(function () {
                if (_that !== this) {
                    $(this).parent().removeClass("selected");
                }

            });
            if ($(this).parent().hasClass("selected"))
            {
                $(this).parent().removeClass("selected");
//                $('div.sidebar_content div.section.overlay-layers div#overlayers_zoom_to_layer').addClass('disabled');
//                $('div.sidebar_content div.section.overlay-layers div#overlayers_minus').addClass('disabled');
//                $('div.sidebar_content div.section.overlay-layers div#move_overlayer_up').addClass('disabled');
//                $('div.sidebar_content div.section.overlay-layers div#move_overlayer_down').addClass('disabled');
//
            }
            else
            {
                $(this).parent().addClass("selected");
//                $('div.sidebar_content div.section.overlay-layers div#overlayers_zoom_to_layer').removeClass('disabled');
//                $('div.sidebar_content div.section.overlay-layers div#overlayers_minus').removeClass('disabled');
                $('div.sidebar_content div.section.overlay-layers div#move_overlayer_up').addClass('disabled');
                $('div.sidebar_content div.section.overlay-layers div#move_overlayer_down').addClass('disabled');
            }

            _this.reorderLayers();
            e.stopPropagation();
        });


        // save current layers status to server
        $('div.sidebar_content div.section.overlay-layers div#save_overlayers_index').unbind('click');
        $('div.sidebar_content div.section.overlay-layers div#save_overlayers_index').on('click', function () {
            var formData = new FormData();
            var activelayer = null;
            var selected = $('div.sidebar_content div.section.overlay-layers ul > li.selected');
            if (selected.data("index") !== undefined && _this._map.dataLayers[selected.data("index")]) {
                activelayer = _this._map.dataLayers[selected.data("index")];
            }
            var mapcenter = _this._map.getCenter();
            var mapZoomLevel = _this._map.getZoom();
            var basemap = $('div.sidebar_content div.section input[type=radio]:checked').val();
            alert(basemap);
            if (activelayer === null)
                formData.append('activelayer', null);
            else
                formData.append('activelayer', JSON.stringify({'layerId': activelayer.layerId, 'layerType': activelayer.layerType, 'filename': activelayer.filename}));
            formData.append('mapcenter', JSON.stringify(mapcenter));
            formData.append('zoomlevel', mapZoomLevel);
            formData.append('basemap', basemap);
            var layerdata = [];




            $('div.sidebar_content div.section.overlay-layers ul > li').map(function (i) {
                if ($(this).data("index") !== undefined) {
                    var defaultShowOnMap = $(this).find("input[type=checkbox]").is(':checked');
                    alert(defaultShowOnMap + "   " + $(this).data("index"));
                    var layer = _this._map.dataLayers[$(this).data("index")];
                    layerdata.push(JSON.stringify({'id': layer.layerId
                        , 'type': layer.layerType
                        , 'filename': layer.filename
                        , 'index': i
                        , 'defaultShowOnMap': defaultShowOnMap
                    }));
                }
            });
            formData.append('data', layerdata);
            $.ajax({
                url: Routing.generate('leaflet_save_mapoverlayers', {'_locale': window.locale}),
                type: 'POST',
                beforeSend: function () {

                    //      _this._map.spin(true);
                },
                complete: function () {
                    //        _this._map.spin(false);
                },
                error: function () {
                    //       _this._map.spin(false);
                },
                //Ajax events
                success: completeHandler = function (response) {
                    var result = response;
                    if (response === '' || response === undefined || response === null)
                        return;
                    if (typeof result !== 'object')
                        result = JSON.parse(result);
                    if (result.success !== true) {
                        // if load data not suceess
                        alert(result.message);
                        return;
                    }
                },
                // Form data
                data: formData,
                //Options to tell JQuery not to process data or worry about content-type
                cache: false,
                contentType: false,
                processData: false
            });

        });

    };
    control.addOverlayChildItem = function (pitem, layer, i, opt, bRefeshButton) {
        var _this = this;
        if ($(pitem).find("ul").length === 0) {
            $(pitem).append("<ul class='layer_legend hidden'></ul>");
        }
        var ul = $(pitem).find("ul");

        var subitem = $('<li class="overlay_group_li" data-layerId="' + layer.layerId + '" data-layerName="' + layer.layerName + '" data-groupName="' + layer.groupName + '">')
                .tooltip({
                    placement: 'top'
                })
                .appendTo(ul);

        subitem.data('index', i);
        subitem.css('border-bottom', '1px grey dotted');

        var label_div = $("<div>").addClass('group_layername_label');
        var label = $('<label>')
                .appendTo(label_div);

        var checked = _this._map.hasLayer(layer.layer);
        var input = $('<input>')
                .attr('type', 'checkbox')
                .prop('checked', checked)
                .appendTo(subitem);

        //    var legend_icon = $("<div class='layer_legend_icon' style='display:inline-block'><i class='fa fa-plus blue'></i></div>").appendTo(subitem);
        var title = '';
        if (layer.layerTitle)
            title = layer.layerTitle;
        else
            title = layer.layerName;
        var legend_label = I18n.t('javascripts.map.layers.' + title);
        if (legend_label === undefined || legend_label === null || legend_label.indexOf('missing ') === 1)
        {

            label.append(title);
        }
        else
        {

            label.append(legend_label);
        }

        label_div.appendTo(subitem);
        label_div.css('display', 'inline-block');
        input.on('change', function () {
            checked = input.is(':checked');
            if (checked) {
                if (!layer.layer)
                {
                    control.loadLayer(layer, opt);
                }
                else
                {
                    if (layer.layer)
                        _this._map.addLayer(layer.layer);
                }
            } else {
                if (layer.layer)
                    _this._map.removeLayer(layer.layer);
            }
            if (layer.layer)
                _this._map.fire('overlaylayerchange', {layer: layer.layer});
        });

        if (layer.defaultShowOnMap === true)
        {
            $(input).prop('checked', true)
                    .trigger('change');
        }
        if (bRefeshButton === true)
            _this.overlayToolButtons();

    };
    control.addOverlayItem = function (layer, i, opt, bRefeshButton) {
        var overlay_layers_ul = $(".leaflet-control-container .section.overlay-layers > ul.overlay_ul");
        var _this = this;
        var item = $('<li class="overlay_li">')
                .tooltip({
                    placement: 'top'
                })
                .appendTo(overlay_layers_ul);
        item.data('index', i);
        item.css('border-bottom', '1px grey dotted');

        var label_div = $("<div>").addClass("layername_label");
        var label = $('<label>')
                .appendTo(label_div);

        var checked = _this._map.hasLayer(layer.layer);
        var input = $('<input>')
                .attr('type', 'checkbox')
                .prop('checked', checked)
                .appendTo(item);

        var legend_icon = $("<div class='layer_legend_icon'><i class='fa fa-plus blue'></i></div>").appendTo(item);
        var title = '';
        if (layer.layerTitle)
            title = layer.layerTitle;
        else
            title = layer.layerName;
        var legend_label = I18n.t('javascripts.map.layers.' + title);
        if (legend_label === undefined || legend_label === null || legend_label.indexOf('missing ') === 1)
        {
            //   if (title.length > 25)
            //       label.append(title.substr(0, 22) + "...");
            //   else
            label.append(title);
        }
        else
        {
            //  if (legend_label.length > 25)
            //      label.append(legend_label.substr(0, 22) + "...");
            //   else
            label.append(legend_label);
        }

        label_div.appendTo(item);
        label_div.css('display', 'inline-block');
        switch (layer.layerType) {
            case 'clustermap':
                var legend = _this.createClusterLegend();
                if (legend !== null)
                    legend.appendTo(item);
                break;
            case 'heatmap':
                var legend = _this.createHeatmapLegend(layer.sld);
                if (legend !== null)
                    legend.appendTo(item);
                break;
            case 'thematicmap':
                var legend = _this.createThematicmapLegend(layer.sld);
                if (legend !== null)
                    legend.appendTo(item);
                break;
            case 'wms':
                var legend = _this.createWMSLegend(layer);
                if (legend !== null)
                    legend.appendTo(item);

                break;
            case 'group':
                $(item).data("group", true);
                if (layer.layers) {
                    $.map(layer.layers, function (data, index) {
                        data.layerId = data.id;
                        _this.addOverlayChildItem(item, data, index, opt, bRefeshButton);
                    });
                }
                break;
            default:
                if (layer.sld) {
                    var legend = _this.createLegend(layer.sld);
                    if (legend !== null)
                        legend.appendTo(item);
                }
                break;
        }
        input.on('change', function () {


            checked = input.is(':checked');
            if ($(this).parent().data("group") === true)
            {

                $(this).parent().find("li.overlay_group_li input[type='checkbox']").map(function () {

                    $(this).prop("checked", checked).trigger('change');
                });
            }
            else {
                if (checked) {

                    if (!layer.layer)
                    {
                        control.loadLayer(layer, opt);
                    }
                    else
                    {
                        if (layer.layer)
                            _this._map.addLayer(layer.layer);
                    }

                } else {
                    if (layer.layer)
                        _this._map.removeLayer(layer.layer);
                }
                if (layer.layer)
                    _this._map.fire('overlaylayerchange', {layer: layer.layer});
            }
        });

        if (layer.defaultShowOnMap === true)
        {
            $(input).prop('checked', true)
                    .trigger('change');
        }
        if (bRefeshButton === true)
            _this.overlayToolButtons();
    };
    control.createWMSLegend = function (layer) {

        if (layer.hostName === undefined || layer.layerName === undefined)
            return null;
        var legend = $("<div class='layer_legend hidden'>");
        var ul = $("<ul>").appendTo(legend);
        ul.append('<li><img src="' + "http://" + layer.hostName + "?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&LAYER=" + layer.layerName + '"></li>');
        return legend;
    };
    control.createHeatmapLegend = function (sld) {
        var legend = $("<div class='layer_legend hidden'>");
        var ul = $("<ul>").appendTo(legend);
        if (typeof sld !== 'object')
            sld = JSON.parse(sld);
        if (sld.gradient === undefined)
            return null;
        if (typeof sld.gradient !== 'object')
            sld.gradient = JSON.parse(unescape(sld.gradient));
        var array = [];
        for (var key in sld.gradient) {
            array.push([key, sld.gradient[key]]);
        }
        array.sort();


        for (var i = 0; i < array.length; i++)
        {
            ul.append('<li><div tabindex="0" style="display:inline-block; margin: 2px 6px 2px 2px; width: 20px; height: 15px; background-color: ' + array[i][1] + '" ></div>' + array[i][0] + '</li>');
        }
        return legend;
    };
    control.createThematicmapLegend = function (sld) {
        var legend = $("<div class='layer_legend hidden'>");
        var ul = $("<ul>").appendTo(legend);

        if (typeof sld !== 'object')
            sld = JSON.parse(sld);
        if (sld.categories === undefined)
            return null;

        if (typeof sld.categories !== 'object')
            sld.categories = JSON.parse(sld.categories);
        if (typeof sld.category !== 'object')
            sld.category = JSON.parse(sld.category);

        var keys = Object.keys(sld.categories);
        for (var key in keys) {

            ul.append('<li><div tabindex="0" style="display:inline-block; margin: 2px 6px 2px 2px; width: 20px; height: 15px;background-color:' + sld.categories[key].fill + ';border: ' + Math.round(sld.category.width) + 'px solid ' + sld.categories[key].boundary + ';" ></div>' + sld.categories[key].from + " - " + sld.categories[key].to + '</li>');
        }
        return legend;
    };
    control.createClusterLegend = function () {
        var legend = $("<div class='layer_legend hidden'>");
        var ul = $("<ul>").appendTo(legend);
        ul.append('<li><div tabindex="0" style="display:inline-block; margin: 2px 6px 2px 2px; width: 40px; height: 40px; " class="marker-cluster marker-cluster-small"><div><span>5</span></div></div>< 10</li>');
        ul.append('<li><div tabindex="0" style="display:inline-block;margin: 2px 6px 2px 2px;  width: 40px; height: 40px;" class="marker-cluster marker-cluster-medium"><div><span>15</span></div></div>10 - 100 </li>');
        ul.append('<li><div tabindex="0" style="display:inline-block;margin: 2px 6px 2px 2px;  width: 40px; height: 40px;" class="marker-cluster marker-cluster-large"><div><span>150</span></div></div>> 100</li>');

        return legend;
    };
    control.createLegend = function (sld) {
        if (typeof sld !== 'object')
            sld = JSON.parse(sld);


        if (sld === undefined || sld.FeatureTypeStyle === undefined || sld.FeatureTypeStyle === null)
            return null;
        var legend = $("<div class='layer_legend hidden'>");
        var ul = $("<ul>").appendTo(legend);
        var keys = Object.keys(sld.FeatureTypeStyle);

        for (var key in keys) {

            var varFeatureTypeStyle = sld.FeatureTypeStyle[key];

            if (typeof varFeatureTypeStyle !== 'object' && varFeatureTypeStyle !== undefined)
                varFeatureTypeStyle = JSON.parse(varFeatureTypeStyle);

            if (typeof varFeatureTypeStyle === 'object' && varFeatureTypeStyle !== undefined && varFeatureTypeStyle.Rule !== undefined) {
                var rule = varFeatureTypeStyle.Rule;
                var legendCanvas = document.createElement('canvas');
                legendCanvas.width = 20;
                legendCanvas.height = 15;
                var centerX = legendCanvas.width / 2;
                var centerY = legendCanvas.height / 2;
                var legendCtx = legendCanvas.getContext('2d');
                var rule_name = '';
                var literal_name = false;
                if (rule.Filter !== undefined) {
                    rule_name = rule.Name;
                    if (rule.Filter.PropertyIsEqualTo) {
                        if ((rule_name === undefined || rule_name === null || rule_name.trim() === '') && (rule.Filter.PropertyIsEqualTo.Literal)) {
                            rule_name = rule.Filter.PropertyIsEqualTo.Literal;
                            literal_name = true;
                        }
                        if (rule.PointSymbolizer && rule.PointSymbolizer.Graphic && rule.PointSymbolizer.Graphic.Mark && rule.PointSymbolizer.Graphic.Mark.WellKnownName) {

                            switch (rule.PointSymbolizer.Graphic.Mark.WellKnownName) {
                                case 'square':
                                    legendCtx.beginPath();
                                    legendCtx.rect((legendCanvas.width - rule.PointSymbolizer.Graphic.Size) / 2, (legendCanvas.height - rule.PointSymbolizer.Graphic.Size) / 2, rule.PointSymbolizer.Graphic.Size, rule.PointSymbolizer.Graphic.Size);
                                    break;
                                case 'star':
                                    legendCtx.moveTo(centerX, centerY - rule.PointSymbolizer.Graphic.Size / 1.6);
                                    legendCtx.lineTo(centerX + rule.PointSymbolizer.Graphic.Size / 2.0, centerY);
                                    legendCtx.lineTo(centerX, centerY + rule.PointSymbolizer.Graphic.Size / 1.6);
                                    legendCtx.lineTo(centerX - rule.PointSymbolizer.Graphic.Size / 2.0, centerY);
                                    legendCtx.closePath();
                                    break;
                                case 'circle':
                                    var radius = rule.PointSymbolizer.Graphic.Size / 2.0;
                                    legendCtx.beginPath();
                                    legendCtx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
                                    break;
                                case 'triangle':
                                    legendCtx.beginPath();
                                    legendCtx.moveTo(centerX, centerY - rule.PointSymbolizer.Graphic.Size / 2.0);
                                    legendCtx.lineTo(centerX + rule.PointSymbolizer.Graphic.Size / 2.0, centerY + rule.PointSymbolizer.Graphic.Size / 2.0);
                                    legendCtx.lineTo(centerX - rule.PointSymbolizer.Graphic.Size / 2.0, centerY + rule.PointSymbolizer.Graphic.Size / 2.0);
                                    legendCtx.closePath();
                                    break;
                                default:
                                    var centerX = legendCanvas.width / 2;
                                    var centerY = legendCanvas.height / 2;
                                    var radius = rule.PointSymbolizer.Graphic.Size / 2.0;
                                    legendCtx.beginPath();
                                    legendCtx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
                                    break;
                            }
                            if (rule.PointSymbolizer.Graphic.Mark.Fill && rule.PointSymbolizer.Graphic.Mark.Fill.fill)
                                legendCtx.fillStyle = rule.PointSymbolizer.Graphic.Mark.Fill.fill.trim();
                            else
                                legendCtx.fillStyle = "#ccc";
                            legendCtx.fill();
                            if (rule.PointSymbolizer.Graphic.Mark && rule.PointSymbolizer.Graphic.Mark.Stroke && rule.PointSymbolizer.Graphic.Mark.Stroke['stroke-width'])
                                legendCtx.lineWidth = rule.PointSymbolizer.Graphic.Mark.Stroke['stroke-width'].trim();
                            else
                                legendCtx.lineWidth = 0.5;
                            legendCtx.strokeStyle = '#003300';
                            legendCtx.stroke();
                        }
                        if (rule.PolygonSymbolizer) {
                            legendCtx.beginPath();
                            legendCtx.rect(0, 0, 20, 15);
                            if (rule.PolygonSymbolizer.Fill && rule.PolygonSymbolizer.Fill.fill)
                                legendCtx.fillStyle = rule.PolygonSymbolizer.Fill.fill.trim();
                            else
                                legendCtx.fillStyle = '#ccc';
                            legendCtx.fill();
                            if (rule.PolygonSymbolizer.Stroke && rule.PolygonSymbolizer.Stroke['stroke-width'])
                                legendCtx.lineWidth = rule.PolygonSymbolizer.Stroke['stroke-width'].trim();
                            else
                                legendCtx.lineWidth = 0.5;
                            if (rule.PolygonSymbolizer.Stroke && rule.PolygonSymbolizer.Stroke.stroke)
                                legendCtx.strokeStyle = rule.PolygonSymbolizer.Stroke.stroke.trim();
                            else
                                legendCtx.strokeStyle = 'black';
                            legendCtx.stroke();
                        }
                    }
                    else if (varFeatureTypeStyle.Rule.Filter.PropertyIsBetween) {

                        if (varFeatureTypeStyle.Rule.Filter.PropertyIsBetween.LowerBoundary && varFeatureTypeStyle.Rule.Filter.PropertyIsBetween.LowerBoundary.Literal && literal_name === true)
                            rule_name = Math.round(varFeatureTypeStyle.Rule.Filter.PropertyIsBetween.LowerBoundary.Literal);

                        if (varFeatureTypeStyle.Rule.Filter.PropertyIsBetween.UpperBoundary && varFeatureTypeStyle.Rule.Filter.PropertyIsBetween.UpperBoundary.Literal && literal_name === true)
                            rule_name = rule_name + " - " + Math.round(varFeatureTypeStyle.Rule.Filter.PropertyIsBetween.UpperBoundary.Literal);
                        legendCtx.beginPath();
                        legendCtx.rect(0, 0, 20, 15);
                        if (rule.PolygonSymbolizer.Fill && rule.PolygonSymbolizer.Fill.fill)
                            legendCtx.fillStyle = rule.PolygonSymbolizer.Fill.fill.trim();
                        else
                            legendCtx.fillStyle = '#ccc';
                        legendCtx.fill();
                        if (rule.PolygonSymbolizer.Stroke && rule.PolygonSymbolizer.Stroke['stroke-width'])
                            legendCtx.lineWidth = rule.PolygonSymbolizer.Stroke['stroke-width'].trim();
                        else
                            legendCtx.lineWidth = 0.5;
                        if (rule.PolygonSymbolizer.Stroke && rule.PolygonSymbolizer.Stroke.stroke)
                            legendCtx.strokeStyle = rule.PolygonSymbolizer.Stroke.stroke.trim();
                        else
                            legendCtx.strokeStyle = 'black';
                        legendCtx.stroke();
                    }

                }
                else
                {
                    if (rule.PointSymbolizer) {

                        if (rule.PointSymbolizer && rule.PointSymbolizer.Graphic && rule.PointSymbolizer.Graphic.Mark && rule.PointSymbolizer.Graphic.Mark.WellKnownName) {

                            switch (rule.PointSymbolizer.Graphic.Mark.WellKnownName) {
                                case 'square':
                                    legendCtx.beginPath();
                                    legendCtx.rect((legendCanvas.width - rule.PointSymbolizer.Graphic.Size) / 2, (legendCanvas.height - rule.PointSymbolizer.Graphic.Size) / 2, rule.PointSymbolizer.Graphic.Size, rule.PointSymbolizer.Graphic.Size);
                                    break;
                                case 'star':
                                    legendCtx.moveTo(centerX, centerY - rule.PointSymbolizer.Graphic.Size / 1.6);
                                    legendCtx.lineTo(centerX + rule.PointSymbolizer.Graphic.Size / 2.0, centerY);
                                    legendCtx.lineTo(centerX, centerY + rule.PointSymbolizer.Graphic.Size / 1.6);
                                    legendCtx.lineTo(centerX - rule.PointSymbolizer.Graphic.Size / 2.0, centerY);
                                    legendCtx.closePath();
                                    break;
                                case 'circle':
                                    var radius = rule.PointSymbolizer.Graphic.Size / 2.0;
                                    legendCtx.beginPath();
                                    legendCtx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
                                    break;
                                case 'triangle':
                                    legendCtx.beginPath();
                                    legendCtx.moveTo(centerX, centerY - rule.PointSymbolizer.Graphic.Size / 2.0);
                                    legendCtx.lineTo(centerX + rule.PointSymbolizer.Graphic.Size / 2.0, centerY + rule.PointSymbolizer.Graphic.Size / 2.0);
                                    legendCtx.lineTo(centerX - rule.PointSymbolizer.Graphic.Size / 2.0, centerY + rule.PointSymbolizer.Graphic.Size / 2.0);
                                    legendCtx.closePath();
                                    break;
                                default:
                                    var centerX = legendCanvas.width / 2;
                                    var centerY = legendCanvas.height / 2;
                                    var radius = rule.PointSymbolizer.Graphic.Size / 2.0;
                                    legendCtx.beginPath();
                                    legendCtx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
                                    break;
                            }
                            if (rule.PointSymbolizer.Graphic.Mark.Fill && rule.PointSymbolizer.Graphic.Mark.Fill.fill)
                                legendCtx.fillStyle = rule.PointSymbolizer.Graphic.Mark.Fill.fill.trim();
                            else
                                legendCtx.fillStyle = "#ccc";
                            legendCtx.fill();
                            if (rule.PointSymbolizer.Graphic.Mark && rule.PointSymbolizer.Graphic.Mark.Stroke && rule.PointSymbolizer.Graphic.Mark.Stroke['stroke-width'])
                                legendCtx.lineWidth = rule.PointSymbolizer.Graphic.Mark.Stroke['stroke-width'].trim();
                            else
                                legendCtx.lineWidth = 0.5;
                            legendCtx.strokeStyle = '#003300';
                            legendCtx.stroke();
                        }

                    }
                    if (rule.LineSymbolizer) {
                        legendCtx.beginPath();
                        legendCtx.moveTo(centerX - legendCanvas.width / 3, centerY);
                        legendCtx.lineTo(centerX + legendCanvas.width / 3, centerY);
                        if (rule.LineSymbolizer.Fill && rule.LineSymbolizer.Fill.fill)
                            legendCtx.fillStyle = rule.LineSymbolizer.Fill.fill.trim();
                        else
                            legendCtx.fillStyle = '#ccc';
                        legendCtx.fill();
                        if (rule.LineSymbolizer.Stroke && rule.LineSymbolizer.Stroke['stroke-width'])
                            legendCtx.lineWidth = rule.LineSymbolizer.Stroke['stroke-width'].trim();
                        else
                            legendCtx.lineWidth = 0.5;
                        if (rule.LineSymbolizer.Stroke && rule.LineSymbolizer.Stroke.stroke)
                            legendCtx.strokeStyle = rule.LineSymbolizer.Stroke.stroke.trim();
                        else
                            legendCtx.strokeStyle = 'black';
                        legendCtx.stroke();
                    }
                    if (rule.PolygonSymbolizer) {
                        legendCtx.beginPath();
                        if (rule.PolygonSymbolizer.Stroke && rule.PolygonSymbolizer.Stroke['stroke-width'])
                        {
                            legendCtx.lineWidth = rule.PolygonSymbolizer.Stroke['stroke-width'].trim();
//                            legendCtx.lineWidth = legendCtx.lineWidth + 0.1;
//                            alert("legendCtx.lineWidth="+legendCtx.lineWidth);
                        }
                        else
                            legendCtx.lineWidth = 0.5;
                        legendCtx.rect(legendCtx.lineWidth / 2.0, legendCtx.lineWidth / 2.0, 20 - legendCtx.lineWidth, 15 - legendCtx.lineWidth);
                        if (rule.PolygonSymbolizer.Fill && rule.PolygonSymbolizer.Fill.fill)
                            legendCtx.fillStyle = rule.PolygonSymbolizer.Fill.fill.trim();
                        else
                            legendCtx.fillStyle = '#ccc';
                        legendCtx.fill();



                        if (rule.PolygonSymbolizer.Stroke && rule.PolygonSymbolizer.Stroke.stroke)
                            legendCtx.strokeStyle = rule.PolygonSymbolizer.Stroke.stroke.trim();
                        else
                            legendCtx.strokeStyle = 'black';


                        legendCtx.stroke();
                    }

                }
                var li = $("<li><img src='" + legendCanvas.toDataURL() + "'/>" + rule_name + "</li>");
                li.appendTo(ul);
            }
        }
        return legend;
    };
    control.refreshOverlays = function () {
        var _this = this;
        var overlay_layers_ul = $(".leaflet-control-container .section.overlay-layers > ul.overlay_ul");
        overlay_layers_ul.html('');
        $("select#activelayer_id.layers-ui").empty();
        _this._map.dataLayers.forEach(function (layer, i) {
            _this.addOverlayItem(layer, i, null, false);
        });
        _this.overlayToolButtons();
        $("select#activelayer_id.layers-ui").trigger('change');
    };

    return control;
};
