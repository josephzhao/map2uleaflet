//very much based off of http://bost.ocks.org/mike/leaflet/
L.D3 = L.Class.extend({
    includes: L.Mixin.Events,
    options: {
        type: "json",
        topojson: false,
        showLabels: false,
        name: 'shapefile',
        layerType: 'uploadfilelayer',
        pathClass: "path",
        keyname: 'ogc_id',
        labelClass: "feature-label"
    },
    initialize: function(data, options) {
        var _this = this;
        L.setOptions(_this, options);
        _this._loaded = false;
        if (typeof data === "string") {
            d3[_this.options.type](data, function(err, json) {
                if (err) {
                    return;
                } else {
                    if (_this.options.topojson) {
                        _this.data = topojson.feature(json, json.objects[_this.options.topojson]);
                    } else if (L.Util.isArray(json)) {
                        _this.data = {type: "FeatureCollection", features: json};
                    } else {
                        _this.data = json;
                    }
                    _this._featureType = data.features[0].geometry.type;
                    _this._loaded = true;
                    _this.fire("dataLoaded");
                }
            });
        } else {
            if (_this.options.topojson) {
                _this.data = topojson.feature(data, data.objects[_this.options.topojson]);
            } else if (L.Util.isArray(data)) {
                _this.data = {type: "FeatureCollection", features: data};
            } else {
                _this.data = data;
            }
            _this._featureType = data.features[0].geometry.type;
            _this._loaded = true;
            _this.fire("dataLoaded");
        }

        this._clickHandler = function(data, idx) {
            _this.fire('click', {
                element: this,
                data: data,
                originalEvent: d3.event
            });
        };
        this._mouseOverHandler = function(data, idx) {
            _this.fire('mouseover', {
                element: this,
                data: data,
                originalEvent: d3.event
            });
        };
        this._mouseMoveHandler = function(data, idx) {
            _this.fire('mousemove', {
                element: this,
                data: data,
                originalEvent: d3.event
            });
        };
        this._mouseOutHandler = function(data, idx) {
            _this.fire('mouseout', {
                element: this,
                data: data,
                originalEvent: d3.event
            });
        };
    },
    onAdd: function(map) {
        this._map = map;
        this._project = function(x) {
            var point = map.latLngToLayerPoint(new L.LatLng(x[1], x[0]));
            return [point.x, point.y];
        };
        this._initContainer();

        this._el = d3.select(this._container).append("svg");

        this._g = this._el.append("g").attr("class", this.options.svgClass ? this.options.svgClass + " leaflet-zoom-hide" : "leaflet-zoom-hide");

        if (this._loaded) {
            this.onLoaded();
        } else {
            this.on("dataLoaded", this.onLoaded, this);
        }
        this._popup = L.popup();
        this.fire("added");
    },
    addTo: function(map) {
        map.addLayer(this);
        return this;
    },
    showFeatureLabels: function(keyname) {
        var _this = this;
        this._g.selectAll("text").remove();
        if (keyname === undefined && this.options.keyname === undefined) {
            keyname = 'ogc_id';
        } else if (keyname === undefined) {
            keyname = this.options.keyname;
        }
        this._feature_labels = this._g.selectAll("." + this.options.labelClass)
                .data(this.options.topojson ? this.data.geometries : this.data.features)
                .enter().append("text")
                .attr("class", this.options.labelClass)
                .attr("transform", function(d) {
                    var point = _this.path.centroid(d);

                    return "translate(" + (point[0] + 8) + "," + point[1] + ")";
                })
                .attr("dy", ".35em")
                .text(function(d) {
                    if (d.properties[keyname] !== undefined)
                        return d.properties[keyname];
                    else
                        return 'N/A';
                });
    },
    removeFeatureLabels: function() {
        this._g.selectAll("text").remove();
    },
    onLoaded: function() {

        var corners = this._map.getBounds();

        // Extracting boundary points
        var northEast = corners.getNorthEast();
        var southWest = corners.getSouthWest();
        this.bounds = d3.geo.bounds(this.data);
        this.bounds = [[Math.min(southWest.lng, this.bounds[0][0]), Math.min(southWest.lat, this.bounds[0][1])], [Math.max(northEast.lng, this.bounds[1][0]), Math.max(northEast.lat, this.bounds[1][1])]];

        this.path = d3.geo.path().projection(this._project).pointRadius(8);
        this._symbols = {
            star: "diamond",
            circle: "circle",
            square: "square",
            cross: "cross",
            triangle: "triangle-up",
            diamond: "diamond"
        };

        if (this.options.before) {
            this.options.before.call(this, this.data);
        }


        this._feature = this._g.selectAll("path")
                .data(this.options.topojson ? this.data.geometries : this.data.features)
                .enter()
                .append("path");


//        if (this.options.showLabels)
//        {
//            var data = this.options.topojson ? this.data.geometries : this.data.features;
//            var properties_key = Object.keys(data[0].properties).map(function(k) {
//                return  k;
//            });
//            this._feature_labels = this._g.selectAll("." + this.options.labelClass)
//                    .data(this.options.topojson ? this.data.geometries : this.data.features)
//                    .enter().append("text")
//                    .attr("class", this.options.labelClass)
//                    .attr("transform", function(d) {
//                        return "translate(" + _this.path.centroid(d) + ")";
//                    })
//                    .attr("dy", ".35em")
//                    .text(function(d) {
//                        if (d.properties[_this.options.label_field] !== undefined && _this.options.label_field !== 'ogc_id')
//                            return d.properties[_this.options.label_field];
//                        else if (properties_key.length > 1)
//                            return d.properties[properties_key[1]];
//                        else
//                            return d.properties[properties_key[0]];
//                    });
//        }
        this._feature.on('click', this._clickHandler)
                .on('mouseover', this._mouseOverHandler)
                .on('mousemove', this._mouseMoveHandler)
                .on('mouseout', this._mouseOutHandler);
        this._map.on('viewreset', this._reset, this);
        this._reset();
     
    },
    onRemove: function(map) {
        // remove layer's DOM elements and listeners
        this._el.remove();
        map.off('viewreset', this._reset, this);
    },
    _reset: function() {
        var _this = this;

        var corners = this._map.getBounds();

        // Extracting boundary points
        var northEast = corners.getNorthEast();
        var southWest = corners.getSouthWest();
        this.bounds = d3.geo.bounds(this.data);
        this.bounds = [[Math.min(southWest.lng, this.bounds[0][0]), Math.min(southWest.lat, this.bounds[0][1])], [Math.max(northEast.lng, this.bounds[1][0]), Math.max(northEast.lat, this.bounds[1][1])]];


        var bottomLeft = this._project(this.bounds[0]),
                topRight = this._project(this.bounds[1]);
        this._el.attr("width", topRight[0] - bottomLeft[0])
                .attr("height", bottomLeft[1] - topRight[1])
                .style("margin-left", bottomLeft[0] + "px")
                .style("margin-top", topRight[1] + "px");
        this._g.attr("transform", "translate(" + -bottomLeft[0] + "," + -topRight[1] + ")");

        if (_this._featureType === 'Point' && this._feature) {
            this.onLoadPointSLD();
        }
        else {
            if (this._feature) {
                this._feature.attr("d", this.path);
                if (this._feature && (this._featureType === 'LineString' || this._featureType === 'MultiLineString' || this._featureType === 'Polyline' || this._featureType === 'MultiPolyline')) {
                    this.onLoadPolylineSLD();
                }
                if (this._feature && (this._featureType === 'Polygon' || this._featureType === 'MultiPolygon')) {
                    this.onLoadPolygonSLD();
                }
            }
        }

        if (this.options.thematicmap === true && this.options.thematicmap_rule) {
            this.renderThematicMap(this.options.thematicmap_rule);
        }

        if (this.options.showLabels && this._feature_labels)
        {
            this._feature_labels.attr("transform", function(d) {
                var point = _this.path.centroid(d);
                return "translate(" + (point[0] + 8) + "," + point[1] + ")";
            });
        }


    },
    bindPopup: function(content) {
        this._popup = L.popup();
        this._popupContent = content;
        if (this._map) {
            this._bindPopup();
        }
        this.on("added", function() {
            this._bindPopup();
        }, this);
    },
    bringToFront: function() {
        var pane = this._map._panes.overlayPane;
        if (this._container) {
            // pane.appendChild(this._container);
            this._setAutoZIndex(pane, Math.max);
        }

        return this;
    },
    bringToBack: function() {
        var pane = this._map._panes.overlayPane;
        if (this._container) {
            // pane.insertBefore(this._container, pane.firstChild);
            this._setAutoZIndex(pane, Math.min);
        }

        return this;
    },
    _updateZIndex: function() {
        if (this._container && this.options.zIndex !== undefined) {
            this._container.style.zIndex = this.options.zIndex;
        }
    },
    _setAutoZIndex: function(pane, compare) {

        var layers = pane.children,
                edgeZIndex = -compare(Infinity, -Infinity), // -Infinity for max, Infinity for min
                zIndex, i, len;
        for (i = 0, len = layers.length; i < len; i++) {

            if (layers[i] !== this._container) {
                if (!isNaN($(layers[i]).attr('zIndex')) && $(layers[i]).attr('zIndex') !== '')
                    layers[i].style.zIndex = $(layers[i]).attr('zIndex');
                zIndex = parseInt(layers[i].style.zIndex, 10);
                if (!isNaN(zIndex)) {
                    edgeZIndex = compare(edgeZIndex, zIndex);
                }
            }
        }

        this._container.style.zIndex =
                (isFinite(edgeZIndex) ? edgeZIndex : 0) + compare(1, -1);
        if (isNaN(this.options.zIndex) || this.options.zIndex === '')
        {
            this.options.zIndex = this._container.style.zIndex;
        }
    },
    _updateOpacity: function() {
        L.DomUtil.setOpacity(this._container, this.options.opacity);
        // stupid webkit hack to force redrawing of tiles
        var i,
                tiles = this._tiles;
        if (L.Browser.webkit) {
            for (i in tiles) {
                if (tiles.hasOwnProperty(i)) {
                    tiles[i].style.webkitTransform += ' translate(0,0)';
                }
            }
        }
    },
    _initContainer: function() {
        var overlayPane = this._map._panes.overlayPane;
        if (!this._container || overlayPane.empty) {
            this._container = L.DomUtil.create('div', 'leaflet-layer');
            var container = d3.select(this._container);
            if (container) {
                container.attr('id', this.options.id ? this.options.id : 'svg-leaflet-d3');
                container.attr('filetype', this.options.filetype ? this.options.filetype : 'svg-leaflet-d3');
                container.attr('layerId', this.options.layerId ? this.options.layerId : 0);
                container.attr('filename', this.options.filename ? this.options.filename : 'svg-data-filename');
                container.attr('zIndex', this.options.zIndex ? this.options.zIndex : '');
                container.attr('minZoom', this.options.minZoom ? this.options.minZoom : '');
                container.attr('maxZoom', this.options.maxZoom ? this.options.maxZoom : '');
                container.attr('layerType', this.options.layerType ? this.options.layerType : 'useruploadfile');
            }
            this._updateZIndex();
            overlayPane.appendChild(this._container);
            if (this.options.opacity < 1) {
                this._updateOpacity();
            }
        }
    },
    renderThematicMap: function(rule) {
        var ps = this._feature[0];
        var pNameExist = false;
        var propertyName = '';
        if(typeof rule.categories !=='object')
            rule.categories =JSON.parse(rule.categories);
        
        if (ps.length > 0) {
            var p = d3.select(ps[0]);
            var properties = p[0][0].__data__.properties;
            for (var property in properties) {
                if (property.toLowerCase() === rule.fieldname.toLowerCase()) {
                    pNameExist = true;
                    propertyName = property;
                    break;
                }
            }
        }
        if (pNameExist === true) {
            for (var k = 0; k < ps.length; k++)
            {
                var p = d3.select(ps[k]);
                var properties = p[0][0].__data__.properties;
                for (var j = 0; j < rule.categories.length; j++) {
                    if (parseFloat(rule.categories[j].from) === parseFloat(rule.min))
                    {
                        if (parseFloat(properties[propertyName]) >= parseFloat(rule.categories[j].from) && parseFloat(properties[propertyName]) <= parseFloat(rule.categories[j].to)) {
                            p.style('fill', rule.categories[j].fill);
                            p.style('fill-opacity', rule.opacity);
                            p.style('stroke', rule.categories[j].boundary);
                            p.style('stroke-opacity', rule.opacity);
                            p.style('stroke-width', rule.width);
                        }

                    }
                    else {
                        if (parseFloat(properties[propertyName]) > parseFloat(rule.categories[j].from) && parseFloat(properties[propertyName]) <= parseFloat(rule.categories[j].to)) {
                            p.style('fill', rule.categories[j].fill);
                            p.style('fill-opacity', rule.opacity);
                            p.style('stroke', rule.categories[j].boundary);
                            p.style('stroke-opacity', rule.opacity);
                            p.style('stroke-width', rule.width);
                        }
                    }
                }
            }
        }
    },
    onLoadPointSLD: function() {

        var _this = this;
        if (_this.options.sld) {
            this._feature.attr("d", d3.svg.symbol().
                    type(function(d) {
                        var varFeatureTypeStyles = _this.options.sld.FeatureTypeStyle;
                        if (varFeatureTypeStyles === undefined || varFeatureTypeStyles === null)
                            return;
                        var keys = Object.keys(varFeatureTypeStyles);
                        for (var key in keys) {
                            var varFeatureTypeStyle = varFeatureTypeStyles[key];
                            if (typeof varFeatureTypeStyle === 'object' && varFeatureTypeStyle !== undefined && varFeatureTypeStyle.Rule !== undefined) {
                                var rule = varFeatureTypeStyle.Rule;
                                if (rule.Filter !== undefined) { // if there are conditions set
                                    if (rule.Filter.PropertyIsEqualTo) {
                                        if (d.properties[rule.Filter.PropertyIsEqualTo.PropertyName.toLowerCase()] !== undefined)
                                        {
                                            if (d.properties[rule.Filter.PropertyIsEqualTo.PropertyName.toLowerCase()] === rule.Filter.PropertyIsEqualTo.Literal)
                                            {

                                                var marktype = 'circle';
                                                if (_this._symbols[rule.PointSymbolizer.Graphic.Mark.WellKnownName] !== undefined)
                                                    marktype = _this._symbols[rule.PointSymbolizer.Graphic.Mark.WellKnownName];
                                                return marktype;
                                            }
                                        }
                                    }
                                }
                                else { // if no condition set
                                    if (rule.PointSymbolizer && rule.PointSymbolizer.Graphic && rule.PointSymbolizer.Graphic.Mark && rule.PointSymbolizer.Graphic.Mark.WellKnownName)
                                    {
                                        var marktype = 'circle';
                                        if (_this._symbols[rule.PointSymbolizer.Graphic.Mark.WellKnownName] !== undefined)
                                            marktype = _this._symbols[rule.PointSymbolizer.Graphic.Mark.WellKnownName];
                                        return marktype;
                                    }
                                }
                            }
                        }
                        return 'circle';
                    })
                    .size(function(d) {
                        var varFeatureTypeStyles = _this.options.sld.FeatureTypeStyle;
                        var keys = Object.keys(varFeatureTypeStyles);
                        for (var key in keys) {
                            var varFeatureTypeStyle = varFeatureTypeStyles[key];
                            if (typeof varFeatureTypeStyle === 'object' && varFeatureTypeStyle.Rule !== undefined && varFeatureTypeStyle !== undefined) {
                                var rule = varFeatureTypeStyle.Rule;
                                if (varFeatureTypeStyle.Rule.Filter !== undefined) { // if there are conditions set

                                    if (varFeatureTypeStyle.Rule.Filter.PropertyIsEqualTo) {
                                        if (d.properties[rule.Filter.PropertyIsEqualTo.PropertyName.toLowerCase()] !== undefined)
                                        {
                                            if (d.properties[rule.Filter.PropertyIsEqualTo.PropertyName.toLowerCase()] === rule.Filter.PropertyIsEqualTo.Literal)
                                            {
                                                var marksize = 6 * 6;

                                                if (rule.PointSymbolizer.Graphic.Size && typeof rule.PointSymbolizer.Graphic.Size !== 'object')
                                                    marksize = rule.PointSymbolizer.Graphic.Size * rule.PointSymbolizer.Graphic.Size;
                                                else {
                                                    if (rule.PointSymbolizer.Graphic.Size && rule.PointSymbolizer.Graphic.Size.Literal)
                                                        marksize = rule.PointSymbolizer.Graphic.Size.Literal * rule.PointSymbolizer.Graphic.Size.Literal;
                                                }
                                                return marksize;
                                            }
                                        }
                                    }
                                }
                                else { // if no condition set
                                    var marksize = 6 * 6;
                                    if (rule.PointSymbolizer.Graphic.Size && typeof rule.PointSymbolizer.Graphic.Size !== 'object')
                                        marksize = rule.PointSymbolizer.Graphic.Size * rule.PointSymbolizer.Graphic.Size;
                                    else {
                                        if (rule.PointSymbolizer.Graphic.Size && rule.PointSymbolizer.Graphic.Size.Literal)
                                            marksize = rule.PointSymbolizer.Graphic.Size.Literal * rule.PointSymbolizer.Graphic.Size.Literal;
                                    }
                                    return marksize;
                                }
                            }
                        }
                        return 8 * 8;
                    })
                    )
                    .style("fill", function(d) {
                        var varFeatureTypeStyles = _this.options.sld.FeatureTypeStyle;
                        var keys = Object.keys(varFeatureTypeStyles);
                        for (var key in keys) {
                            var varFeatureTypeStyle = varFeatureTypeStyles[key];
                            if (typeof varFeatureTypeStyle === 'object' && varFeatureTypeStyle.Rule !== undefined && varFeatureTypeStyle !== undefined) {
                                var rule = varFeatureTypeStyle.Rule;
                                if (varFeatureTypeStyle.Rule.Filter !== undefined) { // if there are conditions set

                                    if (varFeatureTypeStyle.Rule.Filter.PropertyIsEqualTo) {
                                        if (d.properties[rule.Filter.PropertyIsEqualTo.PropertyName.toLowerCase()] !== undefined)
                                        {
                                            if (d.properties[rule.Filter.PropertyIsEqualTo.PropertyName.toLowerCase()] === rule.Filter.PropertyIsEqualTo.Literal)
                                            {
                                                var fill_color = "#ccc";

                                                if (rule.PointSymbolizer.Graphic.Mark && rule.PointSymbolizer.Graphic.Mark.Fill && rule.PointSymbolizer.Graphic.Mark.Fill.fill)
                                                    fill_color = rule.PointSymbolizer.Graphic.Mark.Fill.fill.trim();
                                                return fill_color;
                                            }
                                        }
                                    }
                                }
                                else { // if no condition set
                                    var fill_color = "#ccc";

                                    if (rule.PointSymbolizer.Graphic.Mark && rule.PointSymbolizer.Graphic.Mark.Fill && rule.PointSymbolizer.Graphic.Mark.Fill.fill)
                                        fill_color = rule.PointSymbolizer.Graphic.Mark.Fill.fill.trim();
                                    return fill_color;
                                }
                            }
                        }
                        return "#ccc";
                    })
                    .style("fill-opacity", function(d) {
                        var varFeatureTypeStyles = _this.options.sld.FeatureTypeStyle;
                        var keys = Object.keys(varFeatureTypeStyles);
                        for (var key in keys) {
                            var varFeatureTypeStyle = varFeatureTypeStyles[key];
                            if (typeof varFeatureTypeStyle === 'object' && varFeatureTypeStyle.Rule !== undefined && varFeatureTypeStyle !== undefined) {
                                var rule = varFeatureTypeStyle.Rule;
                                if (varFeatureTypeStyle.Rule.Filter !== undefined) { // if there are conditions set

                                    if (varFeatureTypeStyle.Rule.Filter.PropertyIsEqualTo) {
                                        if (d.properties[rule.Filter.PropertyIsEqualTo.PropertyName.toLowerCase()] !== undefined)
                                        {
                                            if (d.properties[rule.Filter.PropertyIsEqualTo.PropertyName.toLowerCase()] === rule.Filter.PropertyIsEqualTo.Literal)
                                            {
                                                var fill_opacity = "0.8";

                                                if (rule.PointSymbolizer.Graphic.Mark && rule.PointSymbolizer.Graphic.Mark.Fill && rule.PointSymbolizer.Graphic.Mark.Fill['fill-opacity'])
                                                    fill_opacity = rule.PointSymbolizer.Graphic.Mark.Fill['fill-opacity'];
                                                else {
                                                    if (rule.PointSymbolizer.Graphic.Mark && rule.PointSymbolizer.Graphic.Opacity && rule.PointSymbolizer.Graphic.Opacity.Literal)
                                                        fill_opacity = rule.PointSymbolizer.Graphic.Opacity.Literal.trim();
                                                }
                                                return fill_opacity;
                                            }
                                        }
                                    }
                                }
                                else { // if no condition set
                                    var fill_opacity = "0.8";
                                    if (rule.PointSymbolizer.Graphic.Mark && rule.PointSymbolizer.Graphic.Mark.Fill && rule.PointSymbolizer.Graphic.Mark.Fill['fill-opacity'])
                                        fill_opacity = rule.PointSymbolizer.Graphic.Mark.Fill['fill-opacity'].trim();
                                    else {
                                        if (rule.PointSymbolizer.Graphic.Mark && rule.PointSymbolizer.Graphic.Opacity && rule.PointSymbolizer.Graphic.Opacity.Literal)
                                            fill_opacity = rule.PointSymbolizer.Graphic.Opacity.Literal.trim();
                                    }
                                    return fill_opacity;
                                }
                            }
                        }
                        return 0.8;
                    })
                    .style("stroke", function(d) {
                        var varFeatureTypeStyles = _this.options.sld.FeatureTypeStyle;
                        var keys = Object.keys(varFeatureTypeStyles);
                        for (var key in keys) {
                            var varFeatureTypeStyle = varFeatureTypeStyles[key];
                            if (typeof varFeatureTypeStyle === 'object' && varFeatureTypeStyle.Rule !== undefined && varFeatureTypeStyle !== undefined) {
                                var rule = varFeatureTypeStyle.Rule;
                                if (varFeatureTypeStyle.Rule.Filter !== undefined) { // if there are conditions set

                                    if (varFeatureTypeStyle.Rule.Filter.PropertyIsEqualTo) {
                                        if (d.properties[rule.Filter.PropertyIsEqualTo.PropertyName.toLowerCase()] !== undefined)
                                        {
                                            if (d.properties[rule.Filter.PropertyIsEqualTo.PropertyName.toLowerCase()] === rule.Filter.PropertyIsEqualTo.Literal)
                                            {
                                                var stroke = "#000";

                                                if (rule.PointSymbolizer.Graphic.Mark && rule.PointSymbolizer.Graphic.Mark.Stroke && rule.PointSymbolizer.Graphic.Mark.Stroke.stroke)
                                                    stroke = rule.PointSymbolizer.Graphic.Mark.Stroke.stroke.trim();
                                                return stroke;
                                            }
                                        }
                                    }
                                }
                                else { // if no condition set
                                    var stroke = "#000";

                                    if (rule.PointSymbolizer.Graphic.Mark && rule.PointSymbolizer.Graphic.Mark.Stroke && rule.PointSymbolizer.Graphic.Mark.Stroke.stroke)
                                        stroke = rule.PointSymbolizer.Graphic.Mark.Stroke.stroke.trim();
                                    return stroke;

                                }
                            }
                        }
                        return "#000";
                    })
                    .style("stroke-width", function(d) {
                        var varFeatureTypeStyles = _this.options.sld.FeatureTypeStyle;
                        var keys = Object.keys(varFeatureTypeStyles);
                        for (var key in keys) {
                            var varFeatureTypeStyle = varFeatureTypeStyles[key];
                            if (typeof varFeatureTypeStyle === 'object' && varFeatureTypeStyle.Rule !== undefined && varFeatureTypeStyle !== undefined) {
                                var rule = varFeatureTypeStyle.Rule;
                                if (varFeatureTypeStyle.Rule.Filter !== undefined) { // if there are conditions set

                                    if (varFeatureTypeStyle.Rule.Filter.PropertyIsEqualTo) {
                                        if (d.properties[rule.Filter.PropertyIsEqualTo.PropertyName.toLowerCase()] !== undefined)
                                        {
                                            if (d.properties[rule.Filter.PropertyIsEqualTo.PropertyName.toLowerCase()] === rule.Filter.PropertyIsEqualTo.Literal)
                                            {
                                                var stroke_width = 1.0;

                                                if (rule.PointSymbolizer.Graphic.Mark && rule.PointSymbolizer.Graphic.Mark.Stroke && rule.PointSymbolizer.Graphic.Mark.Stroke['stroke-width'])
                                                    stroke_width = rule.PointSymbolizer.Graphic.Mark.Stroke['stroke-width'].trim();

                                                return stroke_width;
                                            }
                                        }
                                    }
                                }
                                else { // if no condition set
                                    var stroke_width = 1.0;

                                    if (rule.PointSymbolizer.Graphic.Mark && rule.PointSymbolizer.Graphic.Mark.Stroke && rule.PointSymbolizer.Graphic.Mark.Stroke['stroke-width'])
                                        stroke_width = rule.PointSymbolizer.Graphic.Mark.Stroke['stroke-width'].trim();
                                    return stroke_width;

                                }
                            }
                        }
                        return 1.0;
                    })
                    .style("stroke-opacity", function(d) {
                        var varFeatureTypeStyles = _this.options.sld.FeatureTypeStyle;
                        var keys = Object.keys(varFeatureTypeStyles);
                        for (var key in keys) {
                            var varFeatureTypeStyle = varFeatureTypeStyles[key];
                            if (typeof varFeatureTypeStyle === 'object' && varFeatureTypeStyle.Rule !== undefined && varFeatureTypeStyle !== undefined) {
                                var rule = varFeatureTypeStyle.Rule;
                                if (varFeatureTypeStyle.Rule.Filter !== undefined) { // if there are conditions set

                                    if (varFeatureTypeStyle.Rule.Filter.PropertyIsEqualTo) {
                                        if (d.properties[rule.Filter.PropertyIsEqualTo.PropertyName.toLowerCase()] !== undefined)
                                        {
                                            if (d.properties[rule.Filter.PropertyIsEqualTo.PropertyName.toLowerCase()] === rule.Filter.PropertyIsEqualTo.Literal)
                                            {
                                                var stroke_opacity = 1.0;

                                                if (rule.PointSymbolizer.Graphic.Mark && rule.PointSymbolizer.Graphic.Mark.Stroke && rule.PointSymbolizer.Graphic.Mark.Stroke['stroke-opacity'])
                                                    stroke_opacity = rule.PointSymbolizer.Graphic.Mark.Stroke['stroke-opacity'];
                                                else {
                                                    if (rule.PointSymbolizer.Graphic.Mark && rule.PointSymbolizer.Graphic.Opacity && rule.PointSymbolizer.Graphic.Opacity.Literal)
                                                        stroke_opacity = rule.PointSymbolizer.Graphic.Opacity.Literal.trim();
                                                }
                                                return stroke_opacity;
                                            }
                                        }
                                    }
                                }
                                else { // if no condition set
                                    var stroke_opacity = 1.0;

                                    if (rule.PointSymbolizer.Graphic.Mark && rule.PointSymbolizer.Graphic.Mark.Stroke && rule.PointSymbolizer.Graphic.Mark.Stroke['stroke-opacity'])
                                        stroke_opacity = rule.PointSymbolizer.Graphic.Mark.Stroke['stroke-opacity'];
                                    else {
                                        if (rule.PointSymbolizer.Graphic.Mark && rule.PointSymbolizer.Graphic.Opacity && rule.PointSymbolizer.Graphic.Opacity.Literal)
                                            stroke_opacity = rule.PointSymbolizer.Graphic.Opacity.Literal.trim();
                                    }
                                    return stroke_opacity;

                                }
                            }
                        }
                        return 1.0;
                    })
                    .attr("transform", function(d) {
                        return "translate(" + _this.path.centroid(d) + ")";
                    });
        }
        else
        {
            this._feature.attr("d", d3.svg.symbol()
                    .type('circle')
                    .size('64'))
                    .style("fill-opacity", '0.0')
                    .style("stroke", '#000')
                    .style("stroke-width", '1.0')
                    .style("stroke-opacity", '1.0')
                    .attr("transform", function(d) {
                        return "translate(" + _this.path.centroid(d) + ")";
                    });

        }

    },
    onLoadPolygonSLD: function() {
        var _this = this;

        if (_this.options.sld) {
            var varFeatureTypeStyles = _this.options.sld.FeatureTypeStyle;

            var keys = Object.keys(varFeatureTypeStyles);
            for (var key in keys) {
                var varFeatureTypeStyle = varFeatureTypeStyles[key];
                if (varFeatureTypeStyle !== undefined && typeof varFeatureTypeStyle === 'object' && varFeatureTypeStyle.Rule !== undefined) {
                    if (varFeatureTypeStyle.Rule.Filter !== undefined) {
                        var rule = varFeatureTypeStyle.Rule;
                        var ps = this._feature[0];
                        var pNameExist = false;
                        var propertyName = '';


                        if (varFeatureTypeStyle.Rule.Filter.PropertyIsEqualTo) {

                            if (ps.length > 0) {
                                var p = d3.select(ps[0]);
                                var properties = p[0][0].__data__.properties;
                                var geometryType = p[0][0].__data__.geometry.type;

                                for (var property in properties) {
                                    if (property.toLowerCase() === rule.Filter.PropertyIsEqualTo.PropertyName.toLowerCase()) {
                                        pNameExist = true;
                                        propertyName = property;
                                        break;
                                    }
                                }

                            }
                            if (pNameExist === true) {
                                for (var k = 0; k < ps.length; k++)
                                {
                                    var p = d3.select(ps[k]);
                                    var properties = p[0][0].__data__.properties;

                                    if (properties[propertyName].toLowerCase() === rule.Filter.PropertyIsEqualTo.Literal.toLowerCase()) {
                                        p = this.setFeatureStyle(p, varFeatureTypeStyle.Rule);

//                                        if (geometryType === 'Polygon' || geometryType === 'MultiPolygon') {
//                                            if (varFeatureTypeStyle.Rule.PolygonSymbolizer && rule.PolygonSymbolizer.Fill && rule.PolygonSymbolizer.Fill.fill)
//                                                p.style('fill', rule.PolygonSymbolizer.Fill.fill);
//                                            else
//                                                p.style('fill', "#CCC");
//                                            if (rule.PolygonSymbolizer && rule.PolygonSymbolizer.Fill && rule.PolygonSymbolizer.Fill['fill-opacity'])
//                                                p.style('fill-opacity', rule.PolygonSymbolizer.Fill['fill-opacity']);
//                                            else
//                                                p.style('fill-opacity', "0.6");
//                                            if (rule.PolygonSymbolizer && rule.PolygonSymbolizer.Stroke && rule.PolygonSymbolizer.Stroke.stroke)
//                                                p.style('stroke', rule.PolygonSymbolizer.Stroke.stroke);
//                                            if (rule.PolygonSymbolizer && rule.PolygonSymbolizer.Stroke && rule.PolygonSymbolizer.Stroke['stroke-opacity'])
//                                                p.style('stroke-opacity', rule.PolygonSymbolizer.Stroke['stroke-opacity']);
//                                            if (rule.PolygonSymbolizer && rule.PolygonSymbolizer.Stroke && rule.PolygonSymbolizer.Stroke['stroke-width'])
//                                                p.style('stroke-width', rule.PolygonSymbolizer.Stroke['stroke-width']);
//                                            if (rule.PolygonSymbolizer && rule.PolygonSymbolizer.Stroke && rule.PolygonSymbolizer.Stroke['stroke-linecap'])
//                                            {
//                                                p.style('stroke-linecap', rule.PolygonSymbolizer.Stroke['stroke-linecap']);
//                                            }
//                                            if (rule.PolygonSymbolizer && rule.PolygonSymbolizer.Stroke && rule.PolygonSymbolizer.Stroke['stroke-linejoin'])
//                                            {
//                                                p.style('stroke-linejoin', rule.PolygonSymbolizer.Stroke['stroke-linejoin']);
//                                            }
//                                            if (rule.PolygonSymbolizer && rule.PolygonSymbolizer.Stroke && rule.PolygonSymbolizer.Stroke['stroke-dashoffset'])
//                                            {
//                                                p.style('stroke-dashoffset', rule.PolygonSymbolizer.Stroke['stroke-dashoffset']);
//                                            }
//                                        }
//                                        if (geometryType === 'Point') {
//                                            if (rule.PointSymbolizer && rule.PointSymbolizer.Graphic && rule.PointSymbolizer.Graphic.Mark && rule.PointSymbolizer.Graphic.Mark.Fill && rule.PointSymbolizer.Graphic.Mark.Fill.fill)
//                                            {
//                                                p.style('fill', rule.PointSymbolizer.Graphic.Mark.Fill.fill);
//                                            }
//                                            if (rule.PointSymbolizer && rule.PointSymbolizer.Graphic && rule.PointSymbolizer.Graphic.Mark && rule.PointSymbolizer.Graphic.Mark.Fill && rule.PointSymbolizer.Graphic.Mark.Fill['fill-opacity'])
//                                            {
//                                                p.style('fill-opacity', rule.PointSymbolizer.Graphic.Mark.Fill['fill-opacity']);
//                                            }
//
//                                        }
                                    }
                                }
//                                else {
//                                    this._feature.style('fill', "#CCC");
//                                    this._feature.style('fill-opacity', 0.6);
//                                }
                            }
                        }
                        else if (varFeatureTypeStyle.Rule.Filter.PropertyIsBetween) {
                            if (ps.length > 0) {
                                var p = d3.select(ps[0]);
                                var properties = p[0][0].__data__.properties;
                                var geometryType = p[0][0].__data__.geometry.type;

                                for (var property in properties) {
                                    if (property.toLowerCase() === rule.Filter.PropertyIsBetween.PropertyName.toLowerCase()) {
                                        pNameExist = true;
                                        propertyName = property;
                                        break;
                                    }
                                }

                            }
                            if (pNameExist === true) {
                                for (var k = 0; k < ps.length; k++)
                                {
                                    var p = d3.select(ps[k]);
                                    var properties = p[0][0].__data__.properties;


                                    if ((varFeatureTypeStyle.Rule.Filter.PropertyIsBetween.LowerBoundary === undefined) && (varFeatureTypeStyle.Rule.Filter.PropertyIsBetween.UpperBoundary !== undefined) && parseFloat(properties[propertyName]) <= parseFloat(varFeatureTypeStyle.Rule.Filter.PropertyIsBetween.UpperBoundary.Literal))
                                    {
                                        p = this.setFeatureStyle(p, varFeatureTypeStyle.Rule);

                                    }
                                    if ((varFeatureTypeStyle.Rule.Filter.PropertyIsBetween.LowerBoundary !== undefined) && (varFeatureTypeStyle.Rule.Filter.PropertyIsBetween.UpperBoundary !== undefined) && parseFloat(properties[propertyName]) > parseFloat(varFeatureTypeStyle.Rule.Filter.PropertyIsBetween.LowerBoundary.Literal) && parseFloat(properties[propertyName]) <= parseFloat(varFeatureTypeStyle.Rule.Filter.PropertyIsBetween.UpperBoundary.Literal)) {
                                        p = this.setFeatureStyle(p, varFeatureTypeStyle.Rule);

                                        //                                        
//                                        if (varFeatureTypeStyle.Rule.PolygonSymbolizer && varFeatureTypeStyle.Rule.PolygonSymbolizer.Fill && varFeatureTypeStyle.Rule.PolygonSymbolizer.Fill.fill)
//                                        {
//                                            this._feature.style('fill', varFeatureTypeStyle.Rule.PolygonSymbolizer.Fill.fill);
//                                        }
//                                        else
//                                            this._feature.style('fill', "#CCC");
//                                        if (varFeatureTypeStyle.Rule.PolygonSymbolizer && varFeatureTypeStyle.Rule.PolygonSymbolizer.Fill && varFeatureTypeStyle.Rule.PolygonSymbolizer.Fill['fill-opacity'])
//                                        {
//                                            this._feature.style('fill-opacity', varFeatureTypeStyle.Rule.PolygonSymbolizer.Fill['fill-opacity']);
//                                        }
//                                        else
//                                            this._feature.style('fill-opacity', 0.6);
//
//                                        if (varFeatureTypeStyle.Rule.PolygonSymbolizer && varFeatureTypeStyle.Rule.PolygonSymbolizer.Stroke && varFeatureTypeStyle.Rule.PolygonSymbolizer.Stroke['stroke-opacity'])
//                                        {
//                                            this._feature.style('stroke-opacity', varFeatureTypeStyle.Rule.PolygonSymbolizer.Stroke['stroke-opacity']);
//                                        }
//                                        if (varFeatureTypeStyle.Rule.PolygonSymbolizer && varFeatureTypeStyle.Rule.PolygonSymbolizer.Stroke && varFeatureTypeStyle.Rule.PolygonSymbolizer.Stroke['stroke-width'])
//                                        {
//                                            this._feature.style('stroke-width', varFeatureTypeStyle.Rule.PolygonSymbolizer.Stroke['stroke-width']);
//                                        }
//                                        else {
//
//                                        }
//                                        if (varFeatureTypeStyle.Rule.PolygonSymbolizer && varFeatureTypeStyle.Rule.PolygonSymbolizer.Stroke && varFeatureTypeStyle.Rule.PolygonSymbolizer.Stroke.stroke)
//                                        {
//                                            this._feature.style('stroke', varFeatureTypeStyle.Rule.PolygonSymbolizer.Stroke.stroke);
//                                        }
//                                        if (varFeatureTypeStyle.Rule.PolygonSymbolizer && varFeatureTypeStyle.Rule.PolygonSymbolizer.Stroke && varFeatureTypeStyle.Rule.PolygonSymbolizer.Stroke['stroke-linecap'])
//                                        {
//                                            this._feature.style('stroke-linecap', varFeatureTypeStyle.Rule.PolygonSymbolizer.Stroke['stroke-linecap']);
//                                        }
//                                        if (varFeatureTypeStyle.Rule.PolygonSymbolizer && varFeatureTypeStyle.Rule.PolygonSymbolizer.Stroke && varFeatureTypeStyle.Rule.PolygonSymbolizer.Stroke['stroke-linejoin'])
//                                        {
//                                            this._feature.style('stroke-linejoin', varFeatureTypeStyle.Rule.PolygonSymbolizer.Stroke['stroke-linejoin']);
//                                        }
//                                        if (varFeatureTypeStyle.Rule.PolygonSymbolizer && varFeatureTypeStyle.Rule.PolygonSymbolizer.Stroke && varFeatureTypeStyle.Rule.PolygonSymbolizer.Stroke['stroke-dashoffset'])
//                                        {
//                                            this._feature.style('stroke-dashoffset', varFeatureTypeStyle.Rule.PolygonSymbolizer.Stroke['stroke-dashoffset']);
//                                        }

                                    }
                                    if ((varFeatureTypeStyle.Rule.Filter.PropertyIsBetween.LowerBoundary !== undefined) && (varFeatureTypeStyle.Rule.Filter.PropertyIsBetween.UpperBoundary === undefined) && parseFloat(properties[propertyName]) > parseFloat(varFeatureTypeStyle.Rule.Filter.PropertyIsBetween.LowerBoundary.Literal))
                                    {
                                        p = this.setFeatureStyle(p, varFeatureTypeStyle.Rule);

                                    }

                                }
                            }

                        }
                        else {
                            this._feature = this.setFeatureStyle(this._feature, varFeatureTypeStyle.Rule);
                        }
                    }
                    else {
                        this._feature = this.setFeatureStyle(this._feature, varFeatureTypeStyle.Rule);

//
//                        if (varFeatureTypeStyle.Rule.PolygonSymbolizer && varFeatureTypeStyle.Rule.PolygonSymbolizer.Fill && varFeatureTypeStyle.Rule.PolygonSymbolizer.Fill.fill)
//                        {
//                            this._feature.style('fill', varFeatureTypeStyle.Rule.PolygonSymbolizer.Fill.fill);
//                        }
//                        else
//                            this._feature.style('fill', "#CCC");
//                        if (varFeatureTypeStyle.Rule.PolygonSymbolizer && varFeatureTypeStyle.Rule.PolygonSymbolizer.Fill && varFeatureTypeStyle.Rule.PolygonSymbolizer.Fill['fill-opacity'])
//                        {
//                            this._feature.style('fill-opacity', varFeatureTypeStyle.Rule.PolygonSymbolizer.Fill['fill-opacity']);
//                        }
//                        else
//                            this._feature.style('fill-opacity', 0.6);
//
//                        if (varFeatureTypeStyle.Rule.PolygonSymbolizer && varFeatureTypeStyle.Rule.PolygonSymbolizer.Stroke && varFeatureTypeStyle.Rule.PolygonSymbolizer.Stroke['stroke-opacity'])
//                        {
//                            this._feature.style('stroke-opacity', varFeatureTypeStyle.Rule.PolygonSymbolizer.Stroke['stroke-opacity']);
//                        }
//                        if (varFeatureTypeStyle.Rule.PolygonSymbolizer && varFeatureTypeStyle.Rule.PolygonSymbolizer.Stroke && varFeatureTypeStyle.Rule.PolygonSymbolizer.Stroke['stroke-width'])
//                        {
//                            this._feature.style('stroke-width', varFeatureTypeStyle.Rule.PolygonSymbolizer.Stroke['stroke-width']);
//                        }
//                        else {
//
//                        }
//                        if (varFeatureTypeStyle.Rule.PolygonSymbolizer && varFeatureTypeStyle.Rule.PolygonSymbolizer.Stroke && varFeatureTypeStyle.Rule.PolygonSymbolizer.Stroke.stroke)
//                        {
//                            this._feature.style('stroke', varFeatureTypeStyle.Rule.PolygonSymbolizer.Stroke.stroke);
//                        }
//                        if (varFeatureTypeStyle.Rule.PolygonSymbolizer && varFeatureTypeStyle.Rule.PolygonSymbolizer.Stroke && varFeatureTypeStyle.Rule.PolygonSymbolizer.Stroke['stroke-linecap'])
//                        {
//                            this._feature.style('stroke-linecap', varFeatureTypeStyle.Rule.PolygonSymbolizer.Stroke['stroke-linecap']);
//                        }
//                        if (varFeatureTypeStyle.Rule.PolygonSymbolizer && varFeatureTypeStyle.Rule.PolygonSymbolizer.Stroke && varFeatureTypeStyle.Rule.PolygonSymbolizer.Stroke['stroke-linejoin'])
//                        {
//                            this._feature.style('stroke-linejoin', varFeatureTypeStyle.Rule.PolygonSymbolizer.Stroke['stroke-linejoin']);
//                        }
//                        if (varFeatureTypeStyle.Rule.PolygonSymbolizer && varFeatureTypeStyle.Rule.PolygonSymbolizer.Stroke && varFeatureTypeStyle.Rule.PolygonSymbolizer.Stroke['stroke-dashoffset'])
//                        {
//                            this._feature.style('stroke-dashoffset', varFeatureTypeStyle.Rule.PolygonSymbolizer.Stroke['stroke-dashoffset']);
//                        }
                    }
                }
            }


//            this._feature.style('stroke-linecap', varFeatureTypeStyle.Rule.PolygonSymbolizer.Stroke['stroke-linecap']);
//            this._feature.style('stroke-linejoin', varFeatureTypeStyle.Rule.PolygonSymbolizer.Stroke['stroke-linejoin']);
//            this._feature.style('stroke-dashoffset', varFeatureTypeStyle.Rule.PolygonSymbolizer.Stroke['stroke-dashoffset']);



        }
        else {

            this._feature.style('fill', "#CCC");
            this._feature.style('fill-opacity', "0.6");
            this._feature.style('stroke-opacity', "1.0");
            this._feature.style('stroke-width', "2");
            this._feature.style('stroke', "#0ff");
        }
    },
    onLoadPolylineSLD: function() {

        this._feature.style("fill", 'none')
                .style("fill-opacity", 0.0)
                .style("stroke", "#000")
                .style("stroke-width", 1.0)
                .style("stroke-opacity", 0.8);
        var _this = this;
        if (_this.options.sld) {

        }
    },
    setFeatureStyle: function(feature, rule) {
        if (rule.PolygonSymbolizer && rule.PolygonSymbolizer.Fill && rule.PolygonSymbolizer.Fill.fill)
        {
            feature.style('fill', rule.PolygonSymbolizer.Fill.fill);
        }
        else
            feature.style('fill', "#CCC");
        if (rule.PolygonSymbolizer && rule.PolygonSymbolizer.Fill && rule.PolygonSymbolizer.Fill['fill-opacity'])
        {
            feature.style('fill-opacity', rule.PolygonSymbolizer.Fill['fill-opacity']);
        }
        else
            feature.style('fill-opacity', 0.6);

        if (rule.PolygonSymbolizer && rule.PolygonSymbolizer.Stroke && rule.PolygonSymbolizer.Stroke['stroke-opacity'])
        {
            feature.style('stroke-opacity', rule.PolygonSymbolizer.Stroke['stroke-opacity']);
        }
        if (rule.PolygonSymbolizer && rule.PolygonSymbolizer.Stroke && rule.PolygonSymbolizer.Stroke['stroke-width'])
        {
            feature.style('stroke-width', rule.PolygonSymbolizer.Stroke['stroke-width']);
        }
        else {

        }
        if (rule.PolygonSymbolizer && rule.PolygonSymbolizer.Stroke && rule.PolygonSymbolizer.Stroke.stroke)
        {
            feature.style('stroke', rule.PolygonSymbolizer.Stroke.stroke);
        }
        if (rule.PolygonSymbolizer && rule.PolygonSymbolizer.Stroke && rule.PolygonSymbolizer.Stroke['stroke-linecap'])
        {
            feature.style('stroke-linecap', rule.PolygonSymbolizer.Stroke['stroke-linecap']);
        }
        if (rule.PolygonSymbolizer && rule.PolygonSymbolizer.Stroke && rule.PolygonSymbolizer.Stroke['stroke-linejoin'])
        {
            feature.style('stroke-linejoin', rule.PolygonSymbolizer.Stroke['stroke-linejoin']);
        }
        if (rule.PolygonSymbolizer && rule.PolygonSymbolizer.Stroke && rule.PolygonSymbolizer.Stroke['stroke-dashoffset'])
        {
            feature.style('stroke-dashoffset', rule.PolygonSymbolizer.Stroke['stroke-dashoffset']);
        }
        return feature;
    },
    onLoadSLD: function(json_sld) {

        if (this._feature && this._featureType === 'Point') {

            this.onLoadPointSLD();
        }
        if (this._feature && (this._featureType === 'Polygon' || this._featureType === 'MultiPolygon')) {

            this.onLoadPolygonSLD();
        }
        if (this._feature && this._featureType === 'LineString' || this._featureType === 'MultiLineString' || this._featureType === 'Polyline' || this._featureType === 'MultiPolyline') {
            this.onLoadPolylineSLD();
        }

    },
    _bindPopup: function() {
        var _this = this;
        _this._g.on("click", function() {
            var props = d3.select(d3.event.target).datum().properties;
            if (typeof _this._popupContent === "string") {
                _this.fire("pathClicked", {cont: _this._popupContent});
            } else if (typeof _this._popupContent === "function") {
                _this.fire("pathClicked", {cont: _this._popupContent(props)});
            }

        }, true);
        _this.on("pathClicked", function(e) {
            _this._popup.setContent(e.cont);
            _this._openable = true;
            ;
        });
        _this._map.on("click", function(e) {
            if (_this._openable) {
                _this._openable = false;
                _this._popup.setLatLng(e.latlng).openOn(_this._map);
            }
        });
    }


});
L.d3 = function(data, options) {
    return new L.D3(data, options);
};
