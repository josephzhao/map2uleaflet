L.D3geoJSON = L.Class.extend({
    includes: L.Mixin.Events,
    initialize: function(data, options) {


        var area = 1;
        this._simplify = d3.geo.transform({
            point: function(x, y, z) {
                if (z >= area)
                    this.stream.point(x, y);
            }
        });



        this._path = d3.geo.path()
                .projection(this._simplify)
                .context(this._context);





        this.data = data;
        this.options = options;
        var that = this;
        this._clickHandler = function(data, idx) {
            that.fire('click', {
                element: this,
                data: data,
                originalEvent: d3.event
            });
        };
        this._mouseOverHandler = function(data, idx) {
            that.fire('mouseover', {
                element: this,
                data: data,
                originalEvent: d3.event
            });
        };
        this._mouseMoveHandler = function(data, idx) {
            that.fire('mousemove', {
                element: this,
                data: data,
                originalEvent: d3.event
            });
        };
        this._mouseOutHandler = function(data, idx) {
            that.fire('mouseout', {
                element: this,
                data: data,
                originalEvent: d3.event
            });
        };
    },
    onAdd: function(map) {
        this._map = map;
        this._first = true;
        this._initZoomLvl = map._zoom;
        this._canvas = d3.select(this._map.getPanes().overlayPane).append("canvas");
        this._context = this._canvas.node().getContext("2d");

//    this._svg = d3.select(this._map.getPanes().overlayPane).append('svg');
//    this._svg.attr('pointer-events', 'none');
        this._group = this._svg.append('g');
        this._group.attr('class', 'leaflet-zoom-hide ' + (this.options.className || ''));
        if (this.options.id) {
            this._canvas.attr('id', this.options.id);
        }

        function latLngToPoint(latlng) {
            return map.project(latlng)._subtract(map.getPixelOrigin());
        }
        ;

        var t = d3.geo.transform({
            point: function(x, y) {
                var point = latLngToPoint(new L.LatLng(y, x));
                return this.stream.point(point.x, point.y);
            }
        });

        this.path = d3.geo.path().projection(t);

        this._feature = this._group.selectAll('path')
                .data(this.data.features)
                .enter()
                .append('path')
                .on('click', this._clickHandler)
                .on('mouseover', this._mouseOverHandler)
                .on('mousemove', this._mouseMoveHandler)
                .on('mouseout', this._mouseOutHandler);

        this._map.on('viewreset', this.reset, this);
        this._feature.attr('pointer-events', this.options.pointerEvents || 'visible');

        if (this.options.featureAttributes) {
            for (var i in this.options.featureAttributes) {
                this._feature.attr(i, this.options.featureAttributes[i]);
            }
        }

        this.reset();

    },
    onRemove: function(map) {
        this._svg.remove();
        this._map.off('viewreset', this.reset, this);
    },
    reset: function(e) {
        if (!this._bounds) {
            this._bounds = d3.geo.path().projection(null).bounds(this.data);
        }
        var topLeft = this._map.latLngToLayerPoint([this._bounds[0][1], this._bounds[0][0]]),
                bottomRight = this._map.latLngToLayerPoint([this._bounds[1][1], this._bounds[1][0]]);

        this._svg
                .attr('width', bottomRight.x - topLeft.x)
                .attr('height', topLeft.y - bottomRight.y)
                .style('left', topLeft.x + 'px')
                .style('top', bottomRight.y + 'px');

        if (this._first) {

            this._group.attr('transform', 'translate(' + -topLeft.x + ',' + -bottomRight.y + ')');
            this._feature.attr('d', this.path);
            this._initTopLeft = topLeft;
            this._initBottomRight = bottomRight;
            this._first = false;

        } else {

            var trans = d3.transform(this._group.attr('transform')),
                    oldScale = trans.scale;
            trans.scale = [oldScale[0] * ((bottomRight.x - topLeft.x) / (this._oldBottomRight.x - this._oldTopLeft.x)),
                oldScale[1] * ((topLeft.y - bottomRight.y) / (this._oldTopLeft.y - this._oldBottomRight.y))
            ];
            trans.translate = [-this._initTopLeft.x, -this._initBottomRight.y];
            this._group.attr('transform', 'scale(' + trans.scale[0] + ',' + trans.scale[1] + ')translate(' + trans.translate[0] + ',' + trans.translate[1] + ')');

        }

        this._oldTopLeft = topLeft;
        this._oldBottomRight = bottomRight;
        this._svg.attr('class', 'zoom-' + this._map.getZoom());

    },
    addTo: function(map) {
        map.addLayer(this);
        return this;
    },
    resimplify: function() {
        var t = d3.select(this);
        (function repeat() {
            t = t.transition()
                    .tween("area", areaTween(20))
                    .transition()
                    .tween("area", areaTween(.5))
                    .each("end", repeat);
        })();
    },
    areaTween: function(area1) {
        return function(d) {
            var i = d3.interpolate(area, area1);
            return function(t) {
                area = i(t);
                render();
            };
        };
    }
});


//
//var width = 960,
//    height = 500;
//
//var area = 1, simplify = d3.geo.transform({
//  point: function(x, y, z) {
//    if (z >= area) this.stream.point(x, y);
//  }
//});
//
//var canvas = d3.select("body").append("canvas")
//    .attr("width", width)
//    .attr("height", height);
//
//var context = canvas.node().getContext("2d");
//
//var path = d3.geo.path()
//    .projection(simplify)
//    .context(context);
//
//d3.json("us.json", function(error, topo) {
//  canvas
//      .datum(topojson.mesh(topojson.presimplify(topo)))
//    .transition()
//      .duration(2500)
//      .each(resimplify);
//});
//
//function render() {
//  context.clearRect(0, 0, width, height);
//  context.beginPath();
//  canvas.each(path);
//  context.stroke();
//}
//
//function resimplify() {
//  var t = d3.select(this);
//  (function repeat() {
//    t = t.transition()
//        .tween("area", areaTween(20))
//      .transition()
//        .tween("area", areaTween(.5))
//        .each("end", repeat);
//  })();
//}
//
//function areaTween(area1) {
//  return function(d) {
//    var i = d3.interpolate(area, area1);
//    return function(t) {
//      area = i(t);
//      render();
//    };
//  };
//}
