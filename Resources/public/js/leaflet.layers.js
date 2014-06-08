L.MAP2U.layers = function(options) {
    var control = L.control(options);

    control.onAdd = function(map) {
        var layers = options.layers;

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

        if (OSM.STATUS != 'api_offline' && OSM.STATUS != 'database_offline') {
            var overlaySection = $('<div>')
                    .attr('class', 'section overlay-layers')
                    .appendTo(barContent);

            $('<p>')
                    .text(I18n.t('javascripts.map.layers.overlays'))
                    .attr("class", "deemphasize")
                    .appendTo(overlaySection);

            var list = $('<ul>')
                    .appendTo(overlaySection);


            function addOverlay(layer, name, maxArea) {
                var item = $('<li>')
                        .tooltip({
                            placement: 'top'
                        })
                        .appendTo(list);

                var label = $('<label>')
                        .appendTo(item);

                var checked = map.hasLayer(layer);

                var input = $('<input>')
                        .attr('type', 'checkbox')
                        .prop('checked', checked)
                        .appendTo(label);

//       var input_radio = $('<input>')
//          .attr('type', 'radio')
//          .attr('name','activeLayer[]')
//          .prop('checked', false)
//          .appendTo(label);


                label.append(I18n.t('javascripts.map.layers.' + name));

                input.on('change', function() {
                    checked = input.is(':checked');
                    if (checked) {
                        map.addLayer(layer);
                    } else {
                        map.removeLayer(layer);
                    }
                    map.fire('overlaylayerchange', {layer: layer});
                });
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
                            I18n.t('javascripts.site.map_' + name + '_zoom_in_tooltip') : '');
                });
            }
            map.dataLayers.forEach(function(layer) {
                addOverlay(layer.layer, layer.name, OSM.MAX_NOTE_REQUEST_AREA);
            });
//      addOverlay(map.noteLayer, 'notes', OSM.MAX_NOTE_REQUEST_AREA);
//      addOverlay(map.dataLayer, 'data', OSM.MAX_REQUEST_AREA);
        }


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
    control.loadTopoJSONLayer = function(layer) {
        if (layer.type === 'shapefile_topojson' || layer.type === 'topojson' || layer.type === 'geojson') {
            $.ajax({
                url: Routing.generate('leaflet_maplayer'),
                type: 'GET',
                beforeSend: function() {
                    spinner.spin(spinner_target);
                },
                complete: function() {
                    spinner.stop();
                },
                //Ajax events
                success: completeHandler = function(response) {
                    var result = JSON.parse(response);
                    if (result.success === true && result.type === 'geojson' && result.filename === 'draw' && result.data !== null) {
                        //  json_data = JSON.parse(result.data);
                        map.drawnItems.clearLayers();
                        $.each(result.data, function(i) {
                            var feature;
                            if (result.data[i] !== null && result.data[i].feature !== null) {
                                var coordinates = JSON.parse(result.data[i].feature).coordinates;
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
                                if (result.data[i].geom_type === 'polygon')
                                {
                                    feature = new L.Polygon(coordinates);
                                }

                                if (result.data[i].geom_type === 'polyline')
                                {
                                    feature = new L.Polyline(coordinates);
                                }
                                if (result.data[i].geom_type === 'rectangle')
                                {
                                    feature = new L.rectangle([coordinates[0][0], coordinates[0][2]]);
                                }
                                if (result.data[i].geom_type === 'circle')
                                {
                                    feature = new L.circle(coordinates, result.data[i].radius);
                                }
                                if (result.data[i].geom_type === 'marker')
                                {
                                    feature = L.marker(coordinates);
                                }

                                //  feature.editing.enable();
                                if (feature.bindLabel)
                                    feature.bindLabel(result.data[i].keyname);
                                feature.id = result.data[i].ogc_fid;
                                feature.name = result.data[i].keyname;
                                feature.index = map.drawnItems.getLayers().length;
                                feature.type = result.data[i].geom_type;
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
                                    if (map.drawControl._toolbars.edit._activeMode === null) {
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

                                    }
                                    else if (map.drawControl._toolbars.edit._activeMode && map.drawControl._toolbars.edit._activeMode.handler.type === 'edit') {

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
                                layer.layer = map.drawnItems;
                                map.drawnItems.addLayer(feature);
                            }
                        });
                        return;
                    }

                    if (result.success === true && (result.type === 'topojson' || result.type === 'shapefile_topojson')) {

                        //  alert(result.sld);

                        d3.selectAll("#svg-shapefile").each(function() {
                            var elt = d3.select(this);

                            if (elt.attr("name").toString().toLowerCase() === result.filename.toString().toLowerCase())
                                elt.remove();

                        });
//
//                        $.each(map.dataLayers, function(i) {
//                            if (map.dataLayers[i].type === 'shapefile_topojson') {
//                                map.dataLayers.splice(i, 1);
//                                return false;
//                            }
//                        });

                        //    $("#leafmap").attr("shapefilename", result.filename);
                        // alert(result.data.length);
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
                            var geojson_shapefile = new L.D3(collection, {
                                id: 'svg-shapefile',
                                layer_id: layer.layer_id,
                                svgClass: 'svg-shapefile',
                                name: result.filename.toLowerCase(),
                                showLabels: true,
                                type: result.type,
                                featureAttributes: {
                                    'layer_id': result.layers[keys[k]]['id']
//                        'class': function(feature) {
//                            return 'default_fcls';
//                        }
                                }
                            });
                            geojson_shapefile.addTo(map);
                            layer.layer = geojson_shapefile;
                            geojson_shapefile.on('click', function(e) {
                                if (parseInt(e.target.options.layer_id) === parseInt($("select#activelayer_id.layers-ui").val())) {

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
                                }
                            });

                            geojson_shapefile.on("mouseover", function(e) {
                            });
                            geojson_shapefile.on('mousemove', function(e) {

                                if (parseInt(e.target.options.layer_id) === parseInt($("select#activelayer_id.layers-ui").val())) {

                                    var shapefilename = $('.sonata-bc #shapefile_select_list option:selected').map(function() {
                                        return  this.text;
                                    });

                                    if (shapefilename === '' || shapefilename[0] === undefined || geojson_shapefile.options.name === shapefilename[0].toLowerCase())
                                    {
                                        var p;

                                        var fieldkey = '';
                                        var mouse = L.DomEvent.getMousePosition(e.originalEvent, map._container);
                                        fieldkey = $('.sonata-bc #shapefile_labelfield_list option:selected').map(function() {
                                            return  this.text;
                                        });

                                        if (result.label_field !== '') {
                                            p = e.data.properties[result.label_field];
                                        }
                                        else {
                                            if (fieldkey === '' || fieldkey[0] === '' || fieldkey[0] === undefined)
                                                p = e.data.properties[properties_key[1]];
                                            else
                                                p = e.data.properties[fieldkey[0]];
                                        }
                                        leafletmap_tooltip.classed("hidden", false)
                                                .attr("style", "left:" + (mouse.x + 30) + "px;top:" + (mouse.y - 35) + "px")
                                                .html(p);
                                    }
                                }
                            });
                            geojson_shapefile.on('mouseout', function(e) {

                                leafletmap_tooltip.classed("hidden", true);

                            });

                        }

                        //            var bound = d3.geo.bounds(collection);

                        //          map.fitBounds([[bound[0][1], bound[0][0]], [bound[1][1], bound[1][0]]]);

                    }
                },
                error: errorHandler = function() {
                    spinner.stop();
                },
                data: {id: layer.layer_id, type: layer.type}
            });
        }
    };
    control.refreshOverlays = function() {
        var _this = this;
        var overlay_layers_ul = $(".leaflet-control-container .section.overlay-layers > ul");

        overlay_layers_ul.html('');
        $("select#activelayer_id.layers-ui").empty();

        map.dataLayers.forEach(function(layer) {
            var item = $('<li>')
                    .tooltip({
                        placement: 'top'
                    })
                    .appendTo(overlay_layers_ul);

            var label = $('<label>')
                    .appendTo(item);

            var checked = map.hasLayer(layer.layer);

            var input = $('<input>')
                    .attr('type', 'checkbox')
                    .prop('checked', checked)
                    .appendTo(label);


            var legend_label = I18n.t('javascripts.map.layers.' + layer.name);
            if (legend_label.indexOf('missing ') === 1)
            {
                label.append(layer.name);
                $("select#activelayer_id.layers-ui").append("<option value='" + layer.layer_id + "'>" + layer.name + "</option>");
            }
            else
            {
                label.append(legend_label);
                $("select#activelayer_id.layers-ui").append("<option value='" + layer.layer_id + "'>" + legend_label + "</option>");
            }

            input.on('change', function() {
                checked = input.is(':checked');

                if (checked) {
                    if (!layer.layer)
                    {
                        control.loadTopoJSONLayer(layer);

                    }
                    else
                        map.addLayer(layer.layer);
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
                            if (field_kename[0] === '' || field_kename[0] === null)
                                kename = undefined;
                            else
                                kename = field_kename[0];
                            layer.layer.showFeatureLabels(kename);
                        } else {
                            layer.layer.removeFeatureLabels();
                        }
                    }
                });

            }


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
        });

        $("select#activelayer_id.layers-ui").trigger('change');



    }
    ;

    return control;
};
