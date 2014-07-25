
L.MAP2U.MapToolbar = L.Control.extend({
    options: {
        position: 'topleft'
    },
    onAdd: function(map) {
        var zoomName = 'toolbar',
                container = L.DomUtil.create('div', zoomName);

        this._map = map;

        this._zoomFullButton = this._createButton(
                '', I18n.t('javascripts.map.zoom.full'), zoomName + 'full', container, this._zoomFull, this);
//
//        this._zoomInButton = this._createButton(
//                '', I18n.t('javascripts.map.zoom.in'), zoomName + 'in', container, this._zoomIn, this);
//        this._zoomOutButton = this._createButton(
//                '', I18n.t('javascripts.map.zoom.out'), zoomName + 'out', container, this._zoomOut, this);
//
//        this._mapMoveButton = this._createButton(
//                '', I18n.t('javascripts.map.move'), zoomName + 'mapmove', container, this._mapMove, this);
//        this._zoomPrevButton = this._createButton(
//                '', I18n.t('javascripts.map.zoom.prev'), zoomName + 'prev', container, this._zoomPrev, this);
//        this._zoomNextButton = this._createButton(
//                '', I18n.t('javascripts.map.zoom.next'), zoomName + 'next', container, this._zoomNext, this);
//
//        this._measureDistanceButton = this._createButton(
//                '', I18n.t('javascripts.map.measure.distance'), zoomName + 'measuredistance', container, this._measureDistance, this);
//        this._measureAreaButton = this._createButton(
//                '', I18n.t('javascripts.map.measure.area'), zoomName + 'measurearea', container, this._measureArea, this);
//
//
//        this._drawPolylineButton = this._createButton(
//                '', I18n.t('javascripts.map.draw.polyline'), zoomName + 'drawpolyline', container, this._drawPolyline, this);
//        this._drawPolygonButton = this._createButton(
//                '', I18n.t('javascripts.map.draw.polygon'), zoomName + 'drawpolygon', container, this._drawPolygon, this);
//        this._drawRectangleButton = this._createButton(
//                '', I18n.t('javascripts.map.draw.rectangle'), zoomName + 'drawrectangle', container, this._drawRectangle, this);
//
//


        map.on('zoomend zoomlevelschange', this._updateDisabled, this);

        return container;
    },
    onRemove: function(map) {
        map.off('zoomend zoomlevelschange', this._updateDisabled, this);
    },
    _zoomIn: function(e) {
        this._map.zoomIn(e.shiftKey ? 3 : 1);
    },
    _zoomOut: function(e) {
        this._map.zoomOut(e.shiftKey ? 3 : 1);
    },
    _zoomPrev: function(e) {
        this._map.zoomIn(e.shiftKey ? 3 : 1);
    },
    _zoomNext: function(e) {
        this._map.zoomOut(e.shiftKey ? 3 : 1);
    },
    _zoomFull: function(e) {
        this._map.zoomOut(e.shiftKey ? 3 : 1);
    },
    _mapMove: function(e) {
        this._map.zoomOut(e.shiftKey ? 3 : 1);
    },
    _drawPolyline: function(e) {
        this._map.zoomOut(e.shiftKey ? 3 : 1);
    },
    _drawPolygon: function(e) {
        this._map.zoomOut(e.shiftKey ? 3 : 1);
    },
    _drawRectangle: function(e) {
        this._map.zoomOut(e.shiftKey ? 3 : 1);
    },
    _createButton: function(html, title, className, container, fn, context) {

        var link = L.DomUtil.create('a', 'control-button ' + className, container);
        link.innerHTML = html;
        link.href = '#';
        link.title = title;

        var sprite = L.DomUtil.create('span', 'icon ' + className, link);

        var stop = L.DomEvent.stopPropagation;

        L.DomEvent
                .on(link, 'click', stop)
                .on(link, 'mousedown', stop)
                .on(link, 'dblclick', stop)
                .on(link, 'click', L.DomEvent.preventDefault)
                .on(link, 'click', fn, context);

        return link;
    },
    _updateDisabled: function() {
        var map = this._map,
                className = 'leaflet-disabled';

        L.DomUtil.removeClass(this._zoomInButton, className);
        L.DomUtil.removeClass(this._zoomOutButton, className);

        if (map._zoom === map.getMinZoom()) {
            L.DomUtil.addClass(this._zoomOutButton, className);
        }
        if (map._zoom === map.getMaxZoom()) {
            L.DomUtil.addClass(this._zoomInButton, className);
        }
    }
});

L.MAP2U.maptoolbar = function(options) {
    return new L.MAP2U.MapToolbar(options);
};
