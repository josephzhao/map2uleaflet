/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function loadGeoserverLayers(map) {
        $.ajax({
        url: Routing.generate('default_geoserver_layers'),
        method: 'GET',
        success: function(response) {
            var result;
            if (typeof response !== 'object')
                result = JSON.parse(response);
            else
                result = response;

            //  alert(result.success===true);
            if (result.success === true && result.layers) {

                //    alert(JSON.stringify(result.layers));
                // alert(result.layers.length);

                var keys = Object.keys(result.layers).map(function(k) {

                    return k;
                });

                // alert(keys.length + "," + keys[0]);

                for (var k = 0; k < keys.length; k++)
                {
                    var layer = result.layers[keys[k]];
                    map.dataLayers[map.dataLayers.length] = {'layerType':layer.layerType ,'defaultShowOnMap': layer.defaultShowOnMap, 'layer': null, 'minZoom': layer.minZoom, 'maxZoom': layer.maxZoom, 'index_id': k, 'layerId': layer.id, title: layer.layerTitle, 'name': layer.layerName, 'hostname': layer.hostName, type: 'shapefile_topojson'};
                }
                map.layersControl.refreshOverlays();
            }
        }
    });

}
