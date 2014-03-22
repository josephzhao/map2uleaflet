L.MAP2U = {};

L.MAP2U.Map = L.Map.extend({
    initialize: function(id, options) {
        L.Map.prototype.initialize.call(this, id, options);

        var copyright = I18n.t('javascripts.map.copyright', {copyright_url: '/copyright'});
        var donate = I18n.t('javascripts.map.donate_link_text', {donate_url: 'http://donate.openstreetmap.org'});

//        this.baseLayers = [
//            new L.Google('ROADMAP',{'name':'Google Road Map'}),
//            new L.Google('SATELLITE',{'name':'Google Satellite'}),
//            new L.Google('HYBRID',{'name':'Google Hybrid'}),
//            new L.Google('TERRAIN',{'name':'Google Terrain'})
//
//        ];
//
//        this.noteLayer = new L.FeatureGroup();
//        this.noteLayer.options = {code: 'N'};
//        
//        this.dataLayers = [{'layer':new L.TileLayer.WMS(
//                            "http://cobas.juturna.ca:8080/geoserver/juturna/wms",
//                    {
//                    layers: 'juturna:cvcsubwatersheds',
//                    format: 'image/png',
//                    transparent: true,
//                    srs: 'EPSG:4326',
//                    name: 'Subwatersheds',
//                    attribution: ""
//                   }),'name':'Subwatersheds'},{'layer': new L.TileLayer.WMS(
//                            "http://cobas.juturna.ca:8080/geoserver/juturna/wms",
//                    {
//                    layers: 'juturna:cvcwatersheds',
//                       format: 'image/png',
//                        srs: 'EPSG:4326',
//                       transparent: true,
//                        name: 'Watersheds',
//                       attribution: ""
//                   }),'name':'Watersheds'}];
      //  this.dataLayers = new L.MAP2U.DataLayer(null);
     //   this.dataLayer.options.code = 'D';
    },
    updateLayers: function(layerParam) {
        layerParam = layerParam || "M";
        var layersAdded = "";

        for (var i = this.baseLayers.length - 1; i >= 0; i--) {
            if (layerParam.indexOf(this.baseLayers[i].options.code) >= 0) {
                this.addLayer(this.baseLayers[i]);
                layersAdded = layersAdded + this.baseLayers[i].options.code;
            } else if (i == 0 && layersAdded == "") {
                this.addLayer(this.baseLayers[i]);
            } else {
                this.removeLayer(this.baseLayers[i]);
            }
        }
    },
    getLayersCode: function() {
        var layerConfig = '';
        for (var i in this._layers) { // TODO: map.eachLayer
            var layer = this._layers[i];
            if (layer.options && layer.options.code) {
                layerConfig += layer.options.code;
            }
        }
        return layerConfig;
    },
    getMapBaseLayerId: function() {
        for (var i in this._layers) { // TODO: map.eachLayer
            var layer = this._layers[i];
            if (layer.options && layer.options.keyid)
                return layer.options.keyid;
        }
    },
//    getUrl: function(marker) {
//
//    },
//    getShortUrl: function(marker) {
//
//    },

    getUrl: function(marker) {
      var precision = OSM.zoomPrecision(this.getZoom()),
          params = {};

      if (marker && this.hasLayer(marker)) {
        var latLng = marker.getLatLng().wrap();
        params.mlat = latLng.lat.toFixed(precision);
        params.mlon = latLng.lng.toFixed(precision);
      }

      var url = 'http://' + OSM.SERVER_URL + '/',
        query = querystring.stringify(params),
        hash = OSM.formatHash(this);

      if (query) url += '?' + query;
      if (hash) url += hash;

      return url;
    },

  getShortUrl: function(marker) {
    var zoom = this.getZoom(),
      latLng = marker && this.hasLayer(marker) ? marker.getLatLng().wrap() : this.getCenter().wrap(),
      str = window.location.hostname.match(/^www\.openstreetmap\.org/i) ?
        'http://osm.org/go/' : 'http://' + window.location.hostname + '/go/',
      char_array = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_~",
      x = Math.round((latLng.lng + 180.0) * ((1 << 30) / 90.0)),
      y = Math.round((latLng.lat + 90.0) * ((1 << 30) / 45.0)),
      // JavaScript only has to keep 32 bits of bitwise operators, so this has to be
      // done in two parts. each of the parts c1/c2 has 30 bits of the total in it
      // and drops the last 4 bits of the full 64 bit Morton code.
      c1 = interlace(x >>> 17, y >>> 17), c2 = interlace((x >>> 2) & 0x7fff, (y >>> 2) & 0x7fff),
      digit;

    for (var i = 0; i < Math.ceil((zoom + 8) / 3.0) && i < 5; ++i) {
      digit = (c1 >> (24 - 6 * i)) & 0x3f;
      str += char_array.charAt(digit);
    }
    for (i = 5; i < Math.ceil((zoom + 8) / 3.0); ++i) {
      digit = (c2 >> (24 - 6 * (i - 5))) & 0x3f;
      str += char_array.charAt(digit);
    }
    for (i = 0; i < ((zoom + 8) % 3); ++i) str += "-";

    // Called to interlace the bits in x and y, making a Morton code.
    function interlace(x, y) {
      x = (x | (x << 8)) & 0x00ff00ff;
      x = (x | (x << 4)) & 0x0f0f0f0f;
      x = (x | (x << 2)) & 0x33333333;
      x = (x | (x << 1)) & 0x55555555;
      y = (y | (y << 8)) & 0x00ff00ff;
      y = (y | (y << 4)) & 0x0f0f0f0f;
      y = (y | (y << 2)) & 0x33333333;
      y = (y | (y << 1)) & 0x55555555;
      return (x << 1) | y;
    }

    var params = {};
    var layers = this.getLayersCode().replace('M', '');

    if (layers) {
      params.layers = layers;
    }

    if (marker && this.hasLayer(marker)) {
      params.m = '';
    }

    if (this._object) {
      params[this._object.type] = this._object.id;
    }

    var query = querystring.stringify(params);
    if (query) {
      str += '?' + query;
    }

    return str;
  },

    addObject: function(object, callback) {
        var objectStyle = {
            color: "#FF6200",
            weight: 4,
            opacity: 1,
            fillOpacity: 0.5
        };

        var changesetStyle = {
            weight: 4,
            color: '#FF9500',
            opacity: 1,
            fillOpacity: 0,
            clickable: false
        };

        this._object = object;

        if (this._objectLoader)
            this._objectLoader.abort();
        if (this._objectLayer)
            this.removeLayer(this._objectLayer);

        var map = this;
        this._objectLoader = $.ajax({
            url: OSM.apiUrl(object),
            dataType: "xml",
            success: function(xml) {
                map._objectLayer = new L.OSM.DataLayer(null, {
                    styles: {
                        node: objectStyle,
                        way: objectStyle,
                        area: objectStyle,
                        changeset: changesetStyle
                    }
                });

                map._objectLayer.interestingNode = function(node, ways, relations) {
                    if (object.type === "node") {
                        return true;
                    } else if (object.type === "relation") {
                        for (var i = 0; i < relations.length; i++)
                            if (relations[i].members.indexOf(node) != -1)
                                return true;
                    } else {
                        return false;
                    }
                };

                map._objectLayer.addData(xml);
                map._objectLayer.addTo(map);

                if (callback)
                    callback(map._objectLayer.getBounds());
            }
        });
    },
    removeObject: function() {
        this._object = null;
        if (this._objectLoader)
            this._objectLoader.abort();
        if (this._objectLayer)
            this.removeLayer(this._objectLayer);
    },
    getState: function() {
        return {
            center: this.getCenter().wrap(),
            zoom: this.getZoom(),
            layers: this.getLayersCode()
        }
    },
    setState: function(state, options) {
        if (state.center)
            this.setView(state.center, state.zoom, options);
        this.updateLayers(state.layers);
    }
});

L.Icon.Default.imagePath = "/images";


L.Icon.Default.imageUrls = {
  "/images/marker-icon.png": "/bundles/map2uleaflet/images/marker-icon.png",
  "/images/marker-icon-2x.png": "/bundles/map2uleaflet/images/marker-icon-2x.png",
  "/images/marker-shadow.png": "/bundles/map2uleaflet/images/marker-shadow.png",
  "/images/marker-shadow-2x.png": "/bundles/map2uleaflet/images/marker-shadow-2x.png"
};

L.extend(L.Icon.Default.prototype, {
    _oldGetIconUrl: L.Icon.Default.prototype._getIconUrl,
    _getIconUrl: function(name) {
        var url = this._oldGetIconUrl(name);
        return L.Icon.Default.imageUrls[url];
    }
});

function getUserIcon(url) {
    return L.icon({
//    iconUrl: url || <%= asset_path('marker-red.png').to_json %>,
//    iconSize: [25, 41],
//    iconAnchor: [12, 41],
//    popupAnchor: [1, -34],
//    shadowUrl: <%= asset_path('images/marker-shadow.png').to_json %>,
//    shadowSize: [41, 41]
    });
}


L.MAP2U.TileLayer = L.TileLayer.extend({
    options: {
        url: document.location.protocol === 'https:' ?
                'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' :
                'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '© <a target="_parent" href="http://www.openstreetmap.org">OpenStreetMap</a> and contributors, under an <a target="_parent" href="http://www.openstreetmap.org/copyright">open license</a>'
    },
    initialize: function(options) {
        options = L.Util.setOptions(this, options);
        L.TileLayer.prototype.initialize.call(this, options.url);
    }
});

L.MAP2U.GoogleMap = L.MAP2U.TileLayer.extend({
    options: {
        url: document.location.protocol === 'https:' ?
                'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' :
                'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        maxZoom: 19
    }
});

L.MAP2U.Mapnik = L.MAP2U.TileLayer.extend({
    options: {
        url: document.location.protocol === 'https:' ?
                'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' :
                'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        maxZoom: 19
    }
});

L.MAP2U.CycleMap = L.MAP2U.TileLayer.extend({
    options: {
        url: 'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png',
        attribution: "Tiles courtesy of <a href='http://www.opencyclemap.org/' target='_blank'>Andy Allan</a>"
    }
});

L.MAP2U.TransportMap = L.MAP2U.TileLayer.extend({
    options: {
        url: 'http://{s}.tile2.opencyclemap.org/transport/{z}/{x}/{y}.png',
        attribution: "Tiles courtesy of <a href='http://www.opencyclemap.org/' target='_blank'>Andy Allan</a>"
    }
});

L.MAP2U.MapQuestOpen = L.MAP2U.TileLayer.extend({
    options: {
        url: document.location.protocol === 'https:' ?
                'https://otile{s}-s.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png' :
                'http://otile{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png',
        subdomains: '1234',
        attribution: document.location.protocol === 'https:' ?
                "Tiles courtesy of <a href='http://www.mapquest.com/' target='_blank'>MapQuest</a> <img src='https://developer.mapquest.com/content/osm/mq_logo.png'>" :
                "Tiles courtesy of <a href='http://www.mapquest.com/' target='_blank'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png'>"
    }
});

L.MAP2U.HOT = L.MAP2U.TileLayer.extend({
    options: {
        url: 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
        maxZoom: 20,
        subdomains: 'abc',
        attribution: "Tiles courtesy of <a href='http://hot.openstreetmap.org/' target='_blank'>Humanitarian OpenStreetMap Team</a>"
    }
});

L.MAP2U.DataLayer = L.FeatureGroup.extend({
    options: {
        areaTags: ['area', 'building', 'leisure', 'tourism', 'ruins', 'historic', 'landuse', 'military', 'natural', 'sport'],
        uninterestingTags: ['source', 'source_ref', 'source:ref', 'history', 'attribution', 'created_by', 'tiger:county', 'tiger:tlid', 'tiger:upload_uuid'],
        styles: {}
    },
    initialize: function(xml, options) {
        L.Util.setOptions(this, options);

        L.FeatureGroup.prototype.initialize.call(this);

        if (xml) {
            this.addData(xml);
        }
    },
    addData: function(features) {
        if (!(features instanceof Array)) {
            features = this.buildFeatures(features);
        }

        for (var i = 0; i < features.length; i++) {
            var feature = features[i], layer;

            if (feature.type === "changeset") {
                layer = L.rectangle(feature.latLngBounds, this.options.styles.changeset);
            } else if (feature.type === "node") {
                layer = L.circleMarker(feature.latLng, this.options.styles.node);
            } else {
                var latLngs = new Array(feature.nodes.length);

                for (var j = 0; j < feature.nodes.length; j++) {
                    latLngs[j] = feature.nodes[j].latLng;
                }

                if (this.isWayArea(feature)) {
                    latLngs.pop(); // Remove last == first.
                    layer = L.polygon(latLngs, this.options.styles.area);
                } else {
                    layer = L.polyline(latLngs, this.options.styles.way);
                }
            }

            layer.addTo(this);
            layer.feature = feature;
        }
    },
    buildFeatures: function(xml) {
        var features = L.MAP2U.getChangesets(xml),
                nodes = L.MAP2U.getNodes(xml),
                ways = L.MAP2U.getWays(xml, nodes),
                relations = L.MAP2U.getRelations(xml, nodes, ways);

        for (var node_id in nodes) {
            var node = nodes[node_id];
            if (this.interestingNode(node, ways, relations)) {
                features.push(node);
            }
        }

        for (var i = 0; i < ways.length; i++) {
            var way = ways[i];
            features.push(way);
        }

        return features;
    },
    isWayArea: function(way) {
        if (way.nodes[0] != way.nodes[way.nodes.length - 1]) {
            return false;
        }

        for (var key in way.tags) {
            if (~this.options.areaTags.indexOf(key)) {
                return true;
            }
        }

        return false;
    },
    interestingNode: function(node, ways, relations) {
        var used = false;

        for (var i = 0; i < ways.length; i++) {
            if (ways[i].nodes.indexOf(node) >= 0) {
                used = true;
                break;
            }
        }

        if (!used) {
            return true;
        }

        for (var i = 0; i < relations.length; i++) {
            if (relations[i].members.indexOf(node) >= 0)
                return true;
        }

        for (var key in node.tags) {
            if (this.options.uninterestingTags.indexOf(key) < 0) {
                return true;
            }
        }

        return false;
    }
});

L.Util.extend(L.MAP2U, {
    getChangesets: function(xml) {
        var result = [];

        var nodes = xml.getElementsByTagName("changeset");
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i], id = node.getAttribute("id");
            result.push({
                id: id,
                type: "changeset",
                latLngBounds: L.latLngBounds(
                        [node.getAttribute("min_lat"), node.getAttribute("min_lon")],
                        [node.getAttribute("max_lat"), node.getAttribute("max_lon")]),
                tags: this.getTags(node)
            });
        }

        return result;
    },
    getNodes: function(xml) {
        var result = {};

        var nodes = xml.getElementsByTagName("node");
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i], id = node.getAttribute("id");
            result[id] = {
                id: id,
                type: "node",
                latLng: L.latLng(node.getAttribute("lat"),
                        node.getAttribute("lon"),
                        true),
                tags: this.getTags(node)
            };
        }

        return result;
    },
    getWays: function(xml, nodes) {
        var result = [];

        var ways = xml.getElementsByTagName("way");
        for (var i = 0; i < ways.length; i++) {
            var way = ways[i], nds = way.getElementsByTagName("nd");

            var way_object = {
                id: way.getAttribute("id"),
                type: "way",
                nodes: new Array(nds.length),
                tags: this.getTags(way)
            };

            for (var j = 0; j < nds.length; j++) {
                way_object.nodes[j] = nodes[nds[j].getAttribute("ref")];
            }

            result.push(way_object);
        }

        return result;
    },
    getRelations: function(xml, nodes, ways) {
        var result = [];

        var rels = xml.getElementsByTagName("relation");
        for (var i = 0; i < rels.length; i++) {
            var rel = rels[i], members = rel.getElementsByTagName("member");

            var rel_object = {
                id: rel.getAttribute("id"),
                type: "relation",
                members: new Array(members.length),
                tags: this.getTags(rel)
            };

            for (var j = 0; j < members.length; j++) {
                if (members[j].getAttribute("type") === "node")
                    rel_object.members[j] = nodes[members[j].getAttribute("ref")];
                else // relation-way and relation-relation membership not implemented
                    rel_object.members[j] = null;
            }

            result.push(rel_object);
        }

        return result;
    },
    getTags: function(xml) {
        var result = {};

        var tags = xml.getElementsByTagName("tag");
        for (var j = 0; j < tags.length; j++) {
            result[tags[j].getAttribute("k")] = tags[j].getAttribute("v");
        }

        return result;
    }
});
