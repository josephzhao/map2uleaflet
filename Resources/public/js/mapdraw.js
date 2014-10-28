/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function initMapDraw(map) {
    var drawnItems = new L.FeatureGroup();
    $(drawnItems).attr({"id": 'user_draw_features'});

    map.addLayer(drawnItems);
    map.drawnItems = drawnItems;
    var drawControl = new L.Control.Draw({
        position: 'topleft',
        draw: {
            rectangle: {
                shapeOptions: {
                    color: '#0000FF',
                    weight: 3
                }
            },
            polyline: {
                shapeOptions: {
                    color: '#0000FF',
                    weight: 3
                }
            },
            polygon: {
                shapeOptions: {
                    color: '#0000FF',
                    weight: 3
                },
                allowIntersection: false
            },
            circle: {
                shapeOptions: {
                    color: '#0000FF',
                    weight: 3
                }
            }
        },
        edit: {
            featureGroup: drawnItems
        }
    });

    map.drawControl = drawControl;
    map.addControl(drawControl);

    map.on('draw:created', function (e) {
        var type = e.layerType,
                layer = e.layer;
        layer.id = 0;
        layer.type = type;
        var radius = 0;
        drawnItems.addLayer(layer);
        layer.index = drawnItems.getLayers().length - 1;

        if (type === 'circle')
        {
            radius = layer._mRadius.toFixed(0);
        }

        //   alert(JSON.stringify(layer.toGeoJSON()));
        layer.on('click', function (e) {
            alert(this.id);
            var feature = e.target;
            if (map.drawControl._toolbars.edit._activeMode === null) {
                var highlight = {
                    'color': '#333333',
                    'weight': 2,
                    'opacity': 1
                };
                if (feature.selected === false || feature.selected === undefined) {
                    if (feature.setStyle)
                        feature.setStyle(highlight);
                    feature.selected = true;
                    if (document.getElementById('geometries_selected')) {
                        var selectBoxOption = document.createElement("option");//create new option 
                        selectBoxOption.value = feature.id;//set option value 
                        selectBoxOption.text = feature.name;//set option display text 
                        document.getElementById('geometries_selected').add(selectBoxOption, null);
                    }
                }
                else
                {
                    if (feature.setStyle)
                        feature.setStyle({'color': "blue", 'weight': 5, 'opacity': 0.6});
                    feature.selected = false;
                    $("#geometries_selected option[value='" + feature.id + "']").each(function () {
                        $(this).remove();
                    });
                }













            }
            else if (map.drawControl._toolbars.edit._activeMode && map.drawControl._toolbars.edit._activeMode.handler.type === 'edit') {

                var radius = 0;
                if (e.target.type === 'circle')
                {
                    radius = e.target._mRadius;
                }
                $.ajax({
                    url: Routing.generate('draw_' + e.target.type),
                    method: 'GET',
                    data: {
                        id: e.target.id,
                        name: e.target.name,
                        radius: radius,
                        index: e.target.index
                    },
                    success: function (response) {
                        if ($('body.sonata-bc #ajax-dialog').length === 0) {
                            $('<div class="modal fade" id="ajax-dialog" role="dialog"></div>').appendTo('body');
                        } else {
                            $('body.sonata-bc #ajax-dialog').html('');
                        }

                        $(response).appendTo($('body.sonata-bc #ajax-dialog'));
                        $('#ajax-dialog').modal({show: true});
                        $('#ajax-dialog').draggable();
                        //  alert(JSON.stringify(html));
                    }
                });
            }
            ;
        });



        if ($('body.sonata-bc #ajax-dialog').length === 0) {
            $('<div class="modal fade" id="ajax-dialog" role="dialog"></div>').appendTo('body');
        } else {
            $('body.sonata-bc #ajax-dialog').html('');
        }


        $.ajax({
            url: Routing.generate('draw_' + layer.type),
            method: 'GET',
            data: {
                id: 0,
                name: layer.name,
                radius: radius,
                index: layer.index
            },
            success: function (response) {
                $(response).appendTo($('body.sonata-bc #ajax-dialog'));

                $('#ajax-dialog').modal({show: true});
                $('#ajax-dialog').draggable();
                //  alert(JSON.stringify(html));
            }
        });

        $('#ajax-dialog').on('hidden.bs.modal', function (e) {
            // do something...
            //   alert(drawnItems.getLayers()[drawnItems.getLayers().length - 1].id);

            if (drawnItems.getLayers()[drawnItems.getLayers().length - 1].id === 0)
            {
                drawnItems.removeLayer(drawnItems.getLayers()[drawnItems.getLayers().length - 1]);
            }
            $('#ajax-dialog').remove();
        });


        $('#ajax-dialog').on('hide.bs.modal', function (e) {

        });
        if (type === 'marker') {
            // Do marker specific actions
        }
//var item=drawnItems.getLayers();
//var itemgeojson=item[0].toGeoJSON();
//itemgeojson.properties.id=layer.id;
//itemgeojson.properties.name=layer.name;
//alert(layer._mRadius);
//
//alert(JSON.stringify(itemgeojson));
//alert(JSON.stringify(layer));
        // Do whatever else you need to. (save to db, add to map etc)
        // map.addLayer(layer);
    });


    map.on('draw:edited', function (e) {
        var layers = e.layers;

        layers.eachLayer(function (layer) {
            if (confirm("Modify my draw geometry id:" + layer.id + ",name:" + layer.name + "?"))
            {

                var itemgeojson = layer.toGeoJSON();
                var radius = 0;
                if (layer._mRadius !== undefined)
                    radius = layer._mRadius;
                $.ajax({
                    url: Routing.generate('draw_save'),
                    method: 'POST',
                    data: {
                        id: layer.id,
                        name: layer.name,
                        feature: itemgeojson,
                        type: layer.type,
                        radius: radius
                    },
                    success: function (response) {
                        var results = JSON.parse(response);
                        if (results.success === false)
                            alert(results.message);
                        else {
                            //    alert("Geometry has been successfully updated!");
                        }
                    }
                });
            }
        });
    });

    map.on('draw:deleted', function (e) {
        var layers = e.layers;
        layers.eachLayer(function (layer) {
            if (layer.name === 'Searched Icon' && layer.id === 0 && layer.source === 'searchbox_query') {
                drawnItems.removeLayer(layer);
            } else {
                if (confirm("Delete my draw item id:" + layer.id + ",name:" + layer.name + "?"))
                {

                    $.ajax({
                        url: Routing.generate('draw_delete'),
                        method: 'POST',
                        data: {
                            id: layer.id
                        },
                        success: function (response) {
                            var result = JSON.parse(response);
                            if (result.success === true) {

                                $("#geometries_select option[value='" + layer.id + "']").each(function () {
                                    $(this).remove();
                                });
                                $("#geometries_selected option[value='" + layer.id + "']").each(function () {
                                    $(this).remove();
                                });
                            }
                            else
                                alert(result.message);
                            //  alert(JSON.stringify(html));
                        }
                    });
                }
            }
        });

    });

}
