L.MAP2U.graphchart = function (options) {
    var control = L.control(options);

    control.onAdd = function (map) {
        var $container = $('<div>')
                .attr('class', 'control-key');

        var button = $('<a>')
                .attr('class', 'control-button')
                .attr('href', '#')
                .html('<span class="icon graphchart"></span>')
                .on('click', toggle)
                .appendTo($container);
        this.button=button;
        var $ui = $('<div>')
                .attr('class', 'graphchart-ui');

        $('<div>')
                .attr('class', 'sidebar_heading')
                .appendTo($ui)
                .append(
                        $('<h4>')
                        .text(I18n.t('javascripts.graphchart.title')));
        var barContent = $('<div>')
                .attr('class', 'sidebar_content')
                .appendTo($ui);

        var $section = $('<div>')
                .attr('class', 'section')
                .appendTo(barContent);

        list = $('<ul>')
                .appendTo($section);

        map.dataLayers.forEach(function (layer) {
//        var item = $('<li>')
//        .appendTo(list);
//

        });
        options.sidebar.addPane($ui);
        jQuery(window).resize(function () {
            barContent.height($('.leaflet-sidebar.right').height() - 70);
        });
        update();
        function toggle(e) {
            e.stopPropagation();
            e.preventDefault();
            if (!button.hasClass('disabled')) {
                options.sidebar.togglePane($ui, button);
            }
            $('.leaflet-control .control-button').tooltip('hide');
        }

        function updateButton() {
            var disabled = false;//map.getMapBaseLayerId() !== 'mapnik'
            button
                    .toggleClass('disabled', disabled)
                    .attr('data-original-title', I18n.t(disabled ?
                            'javascripts.graphchart.tooltip_disabled' :
                            'javascripts.graphchart.tooltip'));
        }

        function update() {
            $(".graphchart-ui .sidebar_content div.section").empty();       
            if(control.category===undefined || control.category===null||control.category==='')
                control.disabled = true;
            else
            {
                $("<h5>"+control.category+"</h5>").appendTo($(".graphchart-ui .sidebar_content div.section"));
                
                control.disabled = false;
            }
            button.toggleClass('disabled', control.disabled)
                    .attr('data-original-title', I18n.t(control.disabled ?
                            'javascripts.graphchart.tooltip_disabled' :
                            'javascripts.graphchart.tooltip'));
                    
        }
        control.update=update;
//      $('.mapkey-table-entry').each(function () {
//        var data = $(this).data();
//        if (layer == data.layer && zoom >= data.zoomMin && zoom <= data.zoomMax) {
//          $(this).show();
//        } else {
//          $(this).hide();
//        }
//      });

        control.activate=function() {
            var $ui = $('.graphchart-ui');
            options.sidebar.togglePane($ui, this.button);
            alert(options.sidebar.isVisible());
            options.sidebar.show();
        };
        return $container[0];
    };

    return control;
};
