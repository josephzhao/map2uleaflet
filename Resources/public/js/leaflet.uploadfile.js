L.MAP2U.shapefile_upload = function(options) {
    var control = L.control(options);

    control.onAdd = function(map) {
        var $container = $('<div>')
                .attr('class', 'control-shapefile-upload');

        var link = $('<a>')
                .attr('class', 'control-button')
                .attr('href', '#')
                .html('<span class="icon shapefile-upload"></span>')
                .on('click', toggle)
                .appendTo($container);

        var $ui = $('<div>')
                .attr('class', 'shapefile-upload-ui');

        $('<div>')
                .attr('class', 'sidebar_heading')
                .appendTo($ui)
                .append(
                        $('<h4>')
                        .text(I18n.t('javascripts.shapefile-upload.title')));
        var barContent = $('<div>')
                .attr('class', 'sidebar_content')
                .appendTo($ui)

        var $section = $('<div>')
                .attr('class', 'section')
                .appendTo(barContent);

        list = $('<ul>')
                .appendTo($section);

        options.sidebar.addPane($ui);
        jQuery(window).resize(function() {
            barContent.height($('.leaflet-sidebar.right').height() - 70);
        });
        
        $.ajax({
            url: Routing.generate('default_uploadshapefileform'),
            method: 'GET',
           
            success: function(response) {
                
             var response = (response[0] === '{' || response[0] === '[') ? JSON.parse(response) : response;
                if(response.success===undefined)
                {
                    control.disabled=false;
                    $(response).appendTo(barContent);
                }
                else {
                     control.disabled=true;
                }
                
                update();
            }
        });
        //       map.on('zoomend', update);

      //  update();

        function toggle(e) {
            e.stopPropagation();
            e.preventDefault();
            if (!link.hasClass('disabled')) {
                options.sidebar.togglePane($ui, link);
            }
            $('.leaflet-control .control-button').tooltip('hide');
        }

        function update() {
            var disabled = false;//map.getZoom() < 12;
            link
                    .toggleClass('disabled', control.disabled)
                    .attr('data-original-title', I18n.t(control.disabled ?
                            'javascripts.site.shapefile_upload_disabled_tooltip' :
                            'javascripts.site.shapefile_upload_tooltip'));
        }

        return $container[0];
    };

    return control;
};
