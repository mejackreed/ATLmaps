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
	newOpacity = Math.min(maxOpacity, Math.max(minOpacity, newOpacity));
	OpenLayers.Util.getElement('opacity').value = newOpacity;
	shade.setOpacity(newOpacity);
}

function createWMSLayer(name, layer, opacity) {
	return (new L.tileLayer.wms("http://www.atlmaps.com:8080/geoserver/atlmaps/wms", {
		layers : layer,
		format : 'image/png',
		transparent : true,
		opacity : opacity
	}));
}
function handleSlider(layer, slider, trans, initial) {
	slider = $(slider)
	slider.slider({
		range : false,
		min : 0,
		max : 100,
		value : initial,
		step : 1,
		slide : function(event, ui) {
			$(trans).val = (ui.value);
			$(trans).html($(slider).slider("value") + "%");
			layer.setOpacity(ui.value / 100);
		}
	});
	$(trans).html($(slider).slider("value") + "%");
}

/*
* Google layer using Google Maps API
*/
//(function (google, L) {

L.Google = L.Class.extend({
	includes : L.Mixin.Events,

	options : {
		minZoom : 0,
		maxZoom : 18,
		tileSize : 256,
		subdomains : 'abc',
		errorTileUrl : '',
		attribution : '',
		opacity : 1,
		continuousWorld : false,
		noWrap : false
	},

	// Possible types: SATELLITE, ROADMAP, HYBRID, TERRAIN
	initialize : function(type, options) {
		L.Util.setOptions(this, options);

		this._ready = google.maps.Map != undefined;
		if (!this._ready)
			L.Google.asyncWait.push(this);

		this._type = type || 'SATELLITE';
	},

	onAdd : function(map, insertAtTheBottom) {
		this._map = map;
		this._insertAtTheBottom = insertAtTheBottom;

		// create a container div for tiles
		this._initContainer();
		this._initMapObject();

		// set up events
		map.on('viewreset', this._resetCallback, this);

		this._limitedUpdate = L.Util.limitExecByInterval(this._update, 150, this);
		map.on('move', this._update, this);
		//map.on('moveend', this._update, this);

		map._controlCorners['bottomright'].style.marginBottom = "1em";

		this._reset();
		this._update();
	},

	onRemove : function(map) {
		this._map._container.removeChild(this._container);
		//this._container = null;

		this._map.off('viewreset', this._resetCallback, this);

		this._map.off('move', this._update, this);
		map._controlCorners['bottomright'].style.marginBottom = "0em";
		//this._map.off('moveend', this._update, this);
	},

	getAttribution : function() {
		return this.options.attribution;
	},

	setOpacity : function(opacity) {
		this.options.opacity = opacity;
		if (opacity < 1) {
			L.DomUtil.setOpacity(this._container, opacity);
		}
	},

	setElementSize : function(e, size) {
		e.style.width = size.x + "px";
		e.style.height = size.y + "px";
	},

	_initContainer : function() {
		//$("#" + this._container.id).css("z-index", "auto");
		var tilePane = this._map._container, first = tilePane.firstChild;

		if (!this._container) {
			this._container = L.DomUtil.create('div', 'leaflet-google-layer leaflet-top leaflet-left');
			this._container.id = "_GMapContainer_" + L.Util.stamp(this);
			this._container.style.zIndex = "auto";
		}

		if (true) {
			tilePane.insertBefore(this._container, first);

			this.setOpacity(this.options.opacity);
			this.setElementSize(this._container, this._map.getSize());
		}
	},

	_initMapObject : function() {
		if (!this._ready)
			return;
		this._google_center = new google.maps.LatLng(0, 0);
		var map = new google.maps.Map(this._container, {
			center : this._google_center,
			zoom : 0,
			tilt : 0,
			mapTypeId : google.maps.MapTypeId[this._type],
			disableDefaultUI : true,
			keyboardShortcuts : false,
			draggable : false,
			disableDoubleClickZoom : true,
			scrollwheel : false,
			streetViewControl : false
		});

		var _this = this;
		this._reposition = google.maps.event.addListenerOnce(map, "center_changed", function() {
			_this.onReposition();
		});

		map.backgroundColor = '#ff0000';
		this._google = map;
	},

	_resetCallback : function(e) {
		this._reset(e.hard);
	},

	_reset : function(clearOldContainer) {
		this._initContainer();
	},

	_update : function() {
		if (!this._google)
			return;
		this._resize();

		var bounds = this._map.getBounds();
		var ne = bounds.getNorthEast();
		var sw = bounds.getSouthWest();
		var google_bounds = new google.maps.LatLngBounds(new google.maps.LatLng(sw.lat, sw.lng), new google.maps.LatLng(ne.lat, ne.lng));
		var center = this._map.getCenter();
		var _center = new google.maps.LatLng(center.lat, center.lng);

		this._google.setCenter(_center);
		this._google.setZoom(this._map.getZoom());
		//this._google.fitBounds(google_bounds);
	},

	_resize : function() {
		var size = this._map.getSize();
		if (this._container.style.width == size.x && this._container.style.height == size.y)
			return;
		this.setElementSize(this._container, size);
		this.onReposition();
	},

	onReposition : function() {
		if (!this._google)
			return;
		google.maps.event.trigger(this._google, "resize");
	}
});

L.Google.asyncWait = [];
L.Google.asyncInitialize = function() {
	var i;
	for ( i = 0; i < L.Google.asyncWait.length; i++) {
		var o = L.Google.asyncWait[i];
		o._ready = true;
		if (o._container) {
			o._initMapObject();
			o._update();
		}
	}
	L.Google.asyncWait = [];
}
//})(window.google, L)

