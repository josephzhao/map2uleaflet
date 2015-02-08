L.MAP2U.business = function (options) {
  var control = L.control(options);

  control.onAdd = function (map) {
    var $container = $('<div>')
      .attr('class', 'leaflet-control');

    var button = $('<a>')
      .attr('class', 'control-button')
      .attr('href', '#')
      .html('<span class="icon business"></span>')
      .on('click', toggle)
      .appendTo($container);

    var $ui = $('<div>')
      .attr('class', 'key-ui');

    $('<div>')
      .attr('class', 'sidebar_heading')
      .appendTo($ui)
      .append(
        $('<h4>')
          .text(I18n.t('javascripts.business.title')));
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
        barContent.height($('.leaflet-sidebar.right').height()-70);
    });

    
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
          'javascripts.business.tooltip_disabled' :
          'javascripts.business.tooltip'));
    }

    function update() {
      var layer = map.getMapBaseLayerId(),
        zoom = map.getZoom();

    }

    return $container[0];
  };

  return control;
};
