function turnOnLayer(layer, slider, trans) {
    map.addLayer(layer);
    if ($(slider).slider("value") == 0) {
        $(slider).slider("option", "value", 60);
    }
    layer.setOpacity($(slider).slider("value") / 100);
    $(trans).html($(slider).slider("value") + "%");
}

function turnOffLayer(layer, slider, trans) {
    map.removeLayer(layer);
    $(slider).slider("option", "value", 0);
    layer.setOpacity(0 / 100);
    $(trans).html($(slider).slider("value") + "%");
}

function changeOpacity(byOpacity) {
    var newOpacity = (parseFloat(OpenLayers.Util.getElement('opacity').value) + byOpacity).toFixed(1);
    newOpacity = Math.min(maxOpacity,
        Math.max(minOpacity, newOpacity));
    OpenLayers.Util.getElement('opacity').value = newOpacity;
    shade.setOpacity(newOpacity);
}

createLayer = function(name, layer, opacity) {
    return (new OpenLayers.Layer.WMS(name, "http://www.atlmaps.com:8080/geoserver/atlmaps/wms", {
        LAYERS:layer,
        format:format,
        TRANSPARENT:true
    }, {
        buffer:0,
        displayOutsideMaxExtent:true,
        isBaseLayer:false,
        srs:'EPSG:900913',
        opacity:opacity,
        transitionEffect:'resize'
    }));
}

function handleSlider(layer, slider, trans, initial) {
    slider = $(slider)
    slider.slider({
        range:false,
        min:0,
        max:100,
        value:initial,
        step:1,
        slide:function (event, ui) {
            $(trans).val = (ui.value);
            $(trans).html($(slider).slider("value") + "%");
            layer.setOpacity(ui.value / 100);
        }
    });
    $(trans).html($(slider).slider("value") + "%");
}
