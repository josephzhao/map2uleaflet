//very much based off of http://bost.ocks.org/mike/leaflet/
L.D3 = L.Class.extend({
    includes: L.Mixin.Events,
    options: {
        type: "json",
        topojson: false,
        showLabels: false,
        name: 'shapefile',
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
//        this._overlayPane = d3.select(this._map.getPanes().overlayPane);
//        
//        this._overlayPane.selectAll("#" + this.options.id ? this.options.id : 'svg-shapefile').remove();

  //      this._el = this._overlayPane.append("svg");
  
         this._el = d3.select(this._container).append("svg");
        this._g = this._el.append("g").attr("class", this.options.svgClass ? this.options.svgClass + " leaflet-zoom-hide" : "leaflet-zoom-hide");
        this._el.attr('id', this.options.id ? this.options.id : 'svg-shapefile');
        this._el.attr('name', this.options.name ? this.options.name : 'shapefile');

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
                    return "translate(" + _this.path.centroid(d) + ")";
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
        this.bounds = d3.geo.bounds(this.data);
        this.path = d3.geo.path().projection(this._project);
        var _this = this;
        if (this.options.before) {
            this.options.before.call(this, this.data);
        }
        this._feature = this._g.selectAll("path").data(this.options.topojson ? this.data.geometries : this.data.features).enter().append("path").attr("class", this.options.pathClass);


        if (this.options.showLabels)
        {
            var data = this.options.topojson ? this.data.geometries : this.data.features;
            var properties_key = Object.keys(data[0].properties).map(function(k) {
                return  k;
            });
            this._feature_labels = this._g.selectAll("." + this.options.labelClass)
                    .data(this.options.topojson ? this.data.geometries : this.data.features)
                    .enter().append("text")
                    .attr("class", this.options.labelClass)
                    .attr("transform", function(d) {
                        return "translate(" + _this.path.centroid(d) + ")";
                    })
                    .attr("dy", ".35em")
                    .text(function(d) {
                        if (d.properties[_this.options.label_field] !== undefined && _this.options.label_field !== 'ogc_id')
                            return d.properties[_this.options.label_field];
                        else if (properties_key.length > 1)
                            return d.properties[properties_key[1]];
                        else
                            return d.properties[properties_key[0]];
                    });
        }
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
        var bottomLeft = this._project(this.bounds[0]),
                topRight = this._project(this.bounds[1]);

        this._el.attr("width", topRight[0] - bottomLeft[0])
                .attr("height", bottomLeft[1] - topRight[1])
                .style("margin-left", bottomLeft[0] + "px")
                .style("margin-top", topRight[1] + "px");

        this._g.attr("transform", "translate(" + -bottomLeft[0] + "," + -topRight[1] + ")");

        this._feature.attr("d", this.path);
        if (this.options.showLabels && this._feature_labels)
        {
            this._feature_labels.attr("transform", function(d) {
                return "translate(" + _this.path.centroid(d) + ")";
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
            this._bindPopup()
        }, this);

    },
    bringToFront: function() {
        var pane = this._map._panes.overlayPane;

        if (this._container) {
            pane.appendChild(this._container);
            this._setAutoZIndex(pane, Math.max);
        }

        return this;
    },
    bringToBack: function() {
        var pane = this._map._panes.overlayPane;

        if (this._container) {
            pane.insertBefore(this._container, pane.firstChild);
            this._setAutoZIndex(pane, Math.min);
        }

        return this;
    },
    _updateZIndex: function () {
		if (this._container && this.options.zIndex !== undefined) {
			this._container.style.zIndex = this.options.zIndex;
		}
	},

	_setAutoZIndex: function (pane, compare) {

		var layers = pane.children,
		    edgeZIndex = -compare(Infinity, -Infinity), // -Infinity for max, Infinity for min
		    zIndex, i, len;

		for (i = 0, len = layers.length; i < len; i++) {

			if (layers[i] !== this._container) {
				zIndex = parseInt(layers[i].style.zIndex, 10);

				if (!isNaN(zIndex)) {
					edgeZIndex = compare(edgeZIndex, zIndex);
				}
			}
		}

		this.options.zIndex = this._container.style.zIndex =
		        (isFinite(edgeZIndex) ? edgeZIndex : 0) + compare(1, -1);
	},

	_updateOpacity: function () {
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

	_initContainer: function () {
		var overlayPane = this._map._panes.overlayPane;

		if (!this._container || overlayPane.empty) {
			this._container = L.DomUtil.create('div', 'leaflet-layer');

			this._updateZIndex();

			overlayPane.appendChild(this._container);

			if (this.options.opacity < 1) {
				this._updateOpacity();
			}
		}
	},


    onRefreshSLD: function(sld) {
        this._popup = L.popup();
        this._popupContent = content;
        if (this._map) {
            this._bindPopup();
        }
        this.on("added", function() {
            this._bindPopup()
        }, this);

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
