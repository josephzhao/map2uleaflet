L.MAP2U.legend = function (options) {
  var control = L.control(options);

  control.onAdd = function (map) {
    var $container = $('<div>')
      .attr('class', 'control-key');

    var button = $('<a>')
      .attr('class', 'control-button')
      .attr('href', '#')
      .html('<span class="icon key"></span>')
      .on('click', toggle)
      .appendTo($container);

    var $ui = $('<div>')
      .attr('class', 'key-ui');

    $('<div>')
      .attr('class', 'sidebar_heading')
      .appendTo($ui)
      .append(
        $('<h4>')
          .text(I18n.t('javascripts.key.title')));
    var barContent = $('<div>')
         .attr('class', 'sidebar_content')
         .appendTo($ui)
 
    var $section = $('<div>')
      .attr('class', 'section')
      .appendTo(barContent);

    list = $('<ul>')
      .appendTo($section);
      
    map.dataLayers.forEach(function(layer) {
//        var item = $('<li>')
//        .appendTo(list);
//

            if (layer.layer.options !== undefined)
            {
                list.append('<li>' + layer.name);
                list.append('<div>');
                list.append("<img src='http://cobas.juturna.ca:8080/geoserver/wms?TRANSPARENT=true&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetLegendGraphic&EXCEPTIONS=application%2Fvnd.ogc.se_xml&FORMAT=image%2Fpng&LAYER=" + layer.layer.options.layers + "'>");
                list.append('</div>');
                list.append('</li>');
            }


//        item.append(layer.name);
//        item.append("<a>"+layer.layer.options.layers+"</a>");
       
    });
    options.sidebar.addPane($ui);
    jQuery(window).resize(function() { 
        barContent.height($('.leaflet-sidebar.right').height()-70);
    });
//    $ui
//      .on('show', shown)
//      .on('hide', hidden);

//    map.on('overlayschange', updateButton);
//
//    updateButton();
//
//    function shown() {
//      map.on('zoomend baselayerchange', update);
//      $section.load('/key', update);
//    }
//
//    function hidden() {
//      map.off('zoomend baselayerchange', update);
//    }
    
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
          'javascripts.key.tooltip_disabled' :
          'javascripts.key.tooltip'))
    }

    function update() {
      var layer = map.getMapBaseLayerId(),
        zoom = map.getZoom();

//      $('.mapkey-table-entry').each(function () {
//        var data = $(this).data();
//        if (layer == data.layer && zoom >= data.zoomMin && zoom <= data.zoomMax) {
//          $(this).show();
//        } else {
//          $(this).hide();
//        }
//      });
    }

    return $container[0];
  };

  return control;
};
