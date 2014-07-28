/*
 * heatmap.js 0.2 Leaflet overlay
 *
 * Copyright (c) 2012, Dominik Moritz
 * Dual-licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and the Beerware (http://en.wikipedia.org/wiki/Beerware) license.
 *
 * Attribution
 *  - Some snippets for canvas layer: https://gist.github.com/2566567
 *  - QuadTree: https://github.com/jsmarkus/ExamplesByMesh/tree/master/JavaScript/QuadTree
 */

L.TileLayer.HeatMap = L.TileLayer.Canvas.extend({
    options: {
        debug: false,
        opacity: 0.9, // opactity is between 0 and 1, not in percent
        radius: {
            value: 20,
            absolute: false  // true: radius in meters, false: radius in pixels
        }
    },
    initialize: function(options, data) {
        var self = this;
        L.Util.setOptions(this, options);

        this.drawTile = function(tile, tilePoint, zoom) {
            var ctx = {
                canvas: tile,
                tilePoint: tilePoint,
                zoom: zoom
            };

            if (self.options.debug) {
                self._drawDebugInfo(ctx);
            }
            this._draw(ctx);
        };
        var legend = function legend(config) {
            this.config = config;

            var _ = {
                element: null,
                labelsEl: null,
                gradientCfg: null,
                ctx: null
            };
            this.get = function(key) {
                return _[key];
            };
            this.set = function(key, value) {
                _[key] = value;
            };
            this.init();
        };
        legend.prototype = {
            init: function() {
                var me = this,
                        config = me.config,
                        title = config.title || "Legend",
                        position = config.position,
                        offset = config.offset || 10,
                        gconfig = config.gradient,
                        width = config.width || 320,
                        labelsEl = document.createElement("ul"),
                        labelsHtml = "",
                        grad, element, gradient, positionCss = "";
                me.set("gradient_width", width - 22);
                me.processGradientObject();

                // Positioning

                // top or bottom
                if (position.indexOf('t') > -1) {
                    positionCss += 'top:' + offset + 'px;';
                } else {
                    positionCss += 'bottom:' + offset + 'px;';
                }

                // left or right
                if (position.indexOf('l') > -1) {
                    positionCss += 'left:' + offset + 'px;';
                } else {
                    positionCss += 'right:' + offset + 'px;';
                }

                element = document.createElement("div");
                element.style.cssText = "border-radius:5px;position:absolute;" + positionCss + "font-family:Helvetica; width:" + width + "px;z-index:10000000000; background:rgba(255,255,255,1);padding:10px;border:1px solid black;margin:0;";
                element.innerHTML = "<h3 style='padding:0;margin:0;text-align:center;font-size:16px;'>" + title + "</h3>";
                // create gradient in canvas
                labelsEl.style.cssText = "position:relative;font-size:12px;display:block;list-style:none;list-style-type:none;margin:0;height:15px;";


                // create gradient element
                gradient = document.createElement("div");
                gradient.style.cssText = ["position:relative;display:block;width:" + (width - 22) + "px;height:15px;border-bottom:1px solid black; background-image:url(", me.createGradientImage(), ");"].join("");

                element.appendChild(labelsEl);
                element.appendChild(gradient);

                me.set("element", element);
                me.set("labelsEl", labelsEl);

                me.update(1);
            },
            processGradientObject: function() {
                // create array and sort it
                var me = this,
                        gradientConfig = this.config.gradient,
                        gradientArr = [];

                for (var key in gradientConfig) {
                    if (gradientConfig.hasOwnProperty(key)) {
                        gradientArr.push({stop: key, value: gradientConfig[key]});
                    }
                }
                gradientArr.sort(function(a, b) {
                    return (a.stop - b.stop);
                });
                gradientArr.unshift({stop: 0, value: 'rgba(0,0,0,0)'});

                me.set("gradientArr", gradientArr);
            },
            createGradientImage: function() {
                var me = this,
                        gradArr = me.get("gradientArr"),
                        length = gradArr.length,
                        canvas = document.createElement("canvas"),
                        ctx = canvas.getContext("2d"),
                        grad;
                // the gradient in the legend including the ticks will be 256x15px
                canvas.width = me.get("gradient_width") || "256";
                canvas.height = "15";

                grad = ctx.createLinearGradient(0, 5, canvas.width, 10);

                for (var i = 0; i < length; i++) {
                    grad.addColorStop(1 / (length - 1) * i, gradArr[i].value);
                }

                ctx.fillStyle = grad;
                ctx.fillRect(0, 5, canvas.width, 10);
                ctx.strokeStyle = "black";
                ctx.beginPath();

                for (var i = 0; i < length; i++) {
                    ctx.moveTo(((1 / (length - 1) * i * canvas.width) >> 0) + .5, 0);
                    ctx.lineTo(((1 / (length - 1) * i * canvas.width) >> 0) + .5, (i == 0) ? 15 : 5);
                }
                ctx.moveTo(canvas.width - 0.5, 0);
                ctx.lineTo(canvas.width - 0.5, 15);
                ctx.moveTo(canvas.width - 0.5, 4.5);
                ctx.lineTo(0, 4.5);

                ctx.stroke();

                // we re-use the context for measuring the legends label widths
                me.set("ctx", ctx);

                return canvas.toDataURL();
            },
            getElement: function() {
                return this.get("element");
            },
            update: function(max) {
                var me = this,
                        gradient = me.get("gradientArr"),
                        ctx = me.get("ctx"),
                        labels = me.get("labelsEl"),
                        labelText, labelsHtml = "", offset;
                var width = me.get("gradient_width") || "256";
                for (var i = 0; i < gradient.length; i++) {

                    labelText = max * gradient[i].stop;

                    offset = (ctx.measureText(labelText).width / 2);

                    if (i === 0) {
                        offset = 0;
                    }
                    if (i === gradient.length - 1) {
                        offset *= 2;
                    }
                    labelsHtml += '<li style="position:absolute;left:' + (((((1 / (gradient.length - 1) * i * width) || 0)) >> 0) - offset + .5) + 'px">' + labelText + '</li>';
                }
                labels.innerHTML = labelsHtml;
            }
        };

        if (options.legend) {
            var legendCfg = options.legend;
            legendCfg.gradient = options.gradient || {0.45: "rgb(0,0,255)", 0.55: "rgb(0,255,255)", 0.65: "rgb(0,255,0)", 0.95: "yellow", 1.0: "rgb(255,0,0)"};
            var element;
            if (legendCfg.element)
                element = document.getElementById(legendCfg.element);
            else
                element = document.getElementById('leafmap');
            var legend = new legend(legendCfg);
            element.appendChild(legend.getElement());

        }
    },
    _drawDebugInfo: function(ctx) {
        var canvas = L.DomUtil.create('canvas', 'leaflet-tile-debug');
        var tileSize = this.options.tileSize;
        canvas.width = tileSize;
        canvas.height = tileSize;
        ctx.canvas.appendChild(canvas);
        ctx.dbgcanvas = canvas;

        var max = tileSize;
        var g = canvas.getContext('2d');
        g.strokeStyle = '#000000';
        g.fillStyle = '#FFFF00';
        g.strokeRect(0, 0, max, max);
        g.font = "12px Arial";
        g.fillRect(0, 0, 5, 5);
        g.fillRect(0, max - 5, 5, 5);
        g.fillRect(max - 5, 0, 5, 5);
        g.fillRect(max - 5, max - 5, 5, 5);
        g.fillRect(max / 2 - 5, max / 2 - 5, 10, 10);
        g.strokeText(ctx.tilePoint.x + ' ' + ctx.tilePoint.y + ' ' + ctx.zoom, max / 2 - 30, max / 2 - 10);

        this._drawPoint(ctx, [0, 0]);
    },
    /*
     * Used for debug
     */
    _drawPoint: function(ctx, geom) {
        var p = this._tilePoint(ctx, geom);
        var c = ctx.dbgcanvas;
        var g = c.getContext('2d');
        g.beginPath();
        g.fillStyle = '#FF0000';
        g.arc(p.x, p.y, 4, 0, Math.PI * 2);
        g.closePath();
        g.fill();
        g.restore();
    },
    _createTile: function() {
        var tile = L.DomUtil.create('div', 'leaflet-tile');
        tile.style.width = tile.style.height = this._getTileSize() + 'px';
        tile.galleryimg = 'no';

        tile.onselectstart = tile.onmousemove = L.Util.falseFn;

        if (L.Browser.ielt9 && this.options.opacity !== undefined) {
            L.DomUtil.setOpacity(tile, this.options.opacity);
        }
        // without this hack, tiles disappear after zoom on Chrome for Android
        // https://github.com/Leaflet/Leaflet/issues/2078
        if (L.Browser.mobileWebkit3d) {
            tile.style.WebkitBackfaceVisibility = 'hidden';
        }
        return tile;
    },
    /**
     * Inserts data into quadtree and redraws heatmap canvas
     */
    setData: function(dataset) {
        var self = this;
        var latLngs = [];
        this._maxValue = 0;
        dataset.forEach(function(d) {
            latLngs.push(new L.LatLng(d.lat, d.lon));
            self._maxValue = Math.max(self._maxValue, d.value);
        });
        this._bounds = new L.LatLngBounds(latLngs);

        this._quad = new QuadTree(this._boundsToQuery(this._bounds), false, 6, 6);

        dataset.forEach(function(d) {
            self._quad.insert({
                x: d.lon,
                y: d.lat,
                value: d.value
            });
        });
        this.redraw();
    },
    /**
     * Transforms coordinates to tile space
     */
    _tilePoint: function(ctx, coords) {
        // start coords to tile 'space'
        var s = ctx.tilePoint.multiplyBy(this.options.tileSize);

        // actual coords to tile 'space'
        var p = this._map.project(new L.LatLng(coords[1], coords[0]));

        // point to draw
        var x = Math.round(p.x - s.x);
        var y = Math.round(p.y - s.y);
        return [x, y];
    },
    /**
     * Creates a query for the quadtree from bounds
     */
    _boundsToQuery: function(bounds) {
        return {
            x: bounds.getSouthWest().lng,
            y: bounds.getSouthWest().lat,
            width: bounds.getNorthEast().lng - bounds.getSouthWest().lng,
            height: bounds.getNorthEast().lat - bounds.getSouthWest().lat
        };
    },
    _getLatRadius: function() {
        return (this.options.radius.value / 40075017) * 360;
    },
    _getLngRadius: function(point) {
        return this._getLatRadius() / Math.cos(L.LatLng.DEG_TO_RAD * point.lat);
    },
    /*
     * The idea is to create two points and then get
     * the distance between the two in order to know what
     * the absolute radius in this tile could be.
     */
    projectLatlngs: function(point) {
        var lngRadius = this._getLngRadius(point),
                latlng2 = new L.LatLng(point.lat, point.lng - lngRadius, true),
                p = this._map.latLngToLayerPoint(latlng2),
                q = this._map.latLngToLayerPoint(point);
        return Math.max(Math.round(q.x - p.x), 1);
    },
    _draw: function(ctx) {
        if (!this._quad || !this._map) {
            return;
        }

        var self = this,
                options = this.options,
                tile = ctx.canvas,
                tileSize = options.tileSize,
                radiusValue = this.options.radius.value;

        var localXY, value, pointsInTile = [];

        var nwPoint = ctx.tilePoint.multiplyBy(tileSize),
                sePoint = nwPoint.add(new L.Point(tileSize, tileSize));

        // Set the radius for the tile, if necessary.
        // The radius of a circle can be either absolute in pixels or in meters
        // The radius in pixels is not the same on the whole map.
        if (options.radius.absolute) {
            var centerPoint = nwPoint.add(new L.Point(tileSize / 2, tileSize / 2));
            var p = this._map.unproject(centerPoint);
            radiusValue = this.projectLatlngs(p);
        }

        var heatmap = h337.create({
            "radius": radiusValue,
            "element": tile,
            "visible": true,
            "opacity": 100, // we use leaflet's opacity for tiles
            "gradient": options.gradient,
            "debug": options.debug
        });

        // padding
        var pad = new L.Point(radiusValue, radiusValue);
        nwPoint = nwPoint.subtract(pad);
        sePoint = sePoint.add(pad);

        var bounds = new L.LatLngBounds(this._map.unproject(sePoint), this._map.unproject(nwPoint));
        this._quad.retrieveInBounds(this._boundsToQuery(bounds)).forEach(function(obj) {
            localXY = self._tilePoint(ctx, [obj.x, obj.y]);
            value = obj.value;
            pointsInTile.push({
                x: localXY[0],
                y: localXY[1],
                count: value
            });
        });

        heatmap.store.setDataSet({max: this._maxValue, data: pointsInTile});

        return this;
    }
});

L.TileLayer.heatMap = function(options) {
    return new L.TileLayer.HeatMap(options);
};