L.MAP2U.uploadfile = function(options) {
    var control = L.control(options);

    control.onAdd = function(map) {
        var $container = $('<div>')
                .attr('class', 'leaflet-control control-uploadfile');

        var link = $('<a>')
                .attr('class', 'control-button')
                .attr('href', '#')
                .html('<span class="icon uploadfile"></span>')
                .on('click', toggle)
                .appendTo($container);

        var $ui = $('<div>')
                .attr('class', 'uploadfile-ui');

        $('<div>')
                .attr('class', 'sidebar_heading')
                .appendTo($ui)
                .append(
                        $('<h4>')
                        .text(I18n.t('javascripts.uploadfile.title')));

        var uploadfile_link = $('<div>')
                .attr('class', 'uploadfile_link');
        uploadfile_link.append('<a class="uploadfile" rel="tooltip"   href="#" title="Upload Shapefile" id="shapefileform">Shapefile</a>');
        uploadfile_link.append('<a class="help"  rel="tooltip"  title="Upload Shapefile Help" href="'+Routing.generate('help_uploadshapefile')+'" target="_blank"><i class="fa fa-question-circle"></i></a>');
        uploadfile_link.append('<a class="uploadfile" rel="tooltip"   href="#" title="Upload Mapinfo File" id="mapinfofileform">Mapinfo</a>');
        uploadfile_link.append('<a class="help"  rel="tooltip"  title="Upload Mapinfo File Help" href="'+Routing.generate('help_uploadmapinfofile')+'" target="_blank"><i class="fa fa-question-circle"></i></a>');
        uploadfile_link.append('<a class="uploadfile" rel="tooltip"   href="#" title="Upload KML File" id="kmlfileform">KML</a>');
        uploadfile_link.append('<a class="help"  rel="tooltip"  title="Upload KML File Help" href="'+Routing.generate('help_uploadkmlfile')+'" target="_blank"><i class="fa fa-question-circle"></i></a>');
        uploadfile_link.append('<a class="uploadfile" rel="tooltip"   href="#" title="Upload Text File" id="textfileform">Text</a>');
        uploadfile_link.append('<a class="help"  rel="tooltip"  title="Upload Text File Help" href="'+Routing.generate('help_uploadtextfile')+'" target="_blank"><i class="fa fa-question-circle"></i></a>');
        uploadfile_link.appendTo($ui);

        var barContent = $('<div>')
                .attr('class', 'sidebar_content')
                .appendTo($ui);

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
                if (response.success === undefined)
                {
                    control.disabled = false;
                    $(response).appendTo(barContent);
                }
                else {
                    control.disabled = true;
                }

                update();
                uploadfile_link_click();
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
                            'javascripts.site.uploadfile_disabled_tooltip' :
                            'javascripts.site.uploadfile_tooltip'));


        }
        function uploadfile_link_click() {
            $("div.uploadfile_link > a.uploadfile").click(function() {
                var _this = this;
                if ($(this).attr("id") !== null && $(this).attr("id") !== '' && $(this).attr("id") !== undefined)
                {
                    var spinner = new Spinner();

                    var spinner_target = document.getElementById('leafmap');

                    var url = "default_upload" + $(this).attr("id");
                    $.ajax({
                        url: Routing.generate(url),
                        type: 'GET',
                        beforeSend: function() {
                            //       spinner.spin(spinner_target);
                        },
                        complete: function() {
                            //      spinner.stop();
                        },
                        //Ajax events
                        success: completeHandler = function(response) {
                            //  alert(response);
                            $(".uploadfile-ui .sidebar_heading h4").html($(_this).attr("title"));
                            var result = $('<div/>').html(response).contents();
                            //   alert(result.find('div.uploadfile_link').parent().html());
                            $('div.uploadfile_block').html(result.find('div.uploadfile_block').html());

                        },
                        error: errorHandler = function() {
                            //     spinner.stop();
                        }//,
                        // Form data
                        // data: {id: shapefile_id}
                    });
                }
            });
        }

        return $container[0];
    };

    return control;
};
