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

    return control;
};
