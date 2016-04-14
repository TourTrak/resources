/**
 * Wraps a Leaflet Map in an Ext.Component.
 *
 * ## Example
 *
 *     Ext.Viewport.add({
 *         xtype: 'leaflet',
 *         useCurrentLocation: true
 *     });
 *
 */

Ext.define('Ext.Leaflet', {
    extend: 'Ext.Component',
    xtype : 'leaflet',
    id: 'mapview',
    requires: ['Ext.util.GeoLocation'],

    isMap: true,

    config: {
        /**
         * @event maprender
         * @param {Ext.Map} this
         * @param {L.Map} map The rendered map instance
         */

        /**
         * @event centerchange
         * @param {Ext.Map} this
         * @param {L.Map} map The rendered map instance
         * @param {L.LatLng} center The current LatLng center of the map
         */

        /**
         * @event zoomchange
         * @param {Ext.Map} this
         * @param {L.Map} map The rendered Leaflet map instance
         * @param {Number} zoomLevel The current zoom level of the map
         */

        /**
         * @cfg {String} baseCls
         * The base CSS class to apply to the Maps's element
         * @accessor
         */
        baseCls: Ext.baseCSSPrefix + 'lmap',

        /**
         * @cfg {Boolean/Ext.util.GeoLocation} useCurrentLocation
         * Pass in true to center the map based on the geolocation coordinates or pass a
         * {@link Ext.util.GeoLocation GeoLocation} config to have more control over your GeoLocation options
         * @accessor
         */
        useCurrentLocation: false,

        /**
         * @cfg {map} map
         * The wrapped map.
         * @accessor
         */
        map: null,

        /**
         * @cfg {Ext.util.GeoLocation} geo
         * @accessor
         */
        geo: null,

        /**
         * @cfg {Object} mapOptions
         * @accessor
         */
        mapOptions: {}
    },

    constructor: function() {
        this.callParent(arguments);
        this.options= {};
        this.element.setVisibilityMode(Ext.Element.OFFSETS);
    },

    initialize: function() {
        this.callParent();
        this.geo = this.geo || new Ext.util.GeoLocation({
            autoLoad : false
        });
        this.on({
            painted: 'renderMap',
            scope: this
        });
        this.element.on('touchstart', 'onTouchStart', this);
    },

    onTouchStart: function(e) {
        e.makeUnpreventable();
    },

    applyMapOptions: function(options) {
        return Ext.merge({}, this.options, options);
    },

    updateMapOptions: function(newOptions) {
        var map = this.getMap();

        if (map) {
            map.setOptions(newOptions);
        }
    },

    getMapOptions: function() {
        return Ext.merge({}, this.options);
    },

    updateUseCurrentLocation: function(useCurrentLocation) {
        this.setGeo(useCurrentLocation);
    },

    applyGeo: function(config) {
        return Ext.factory(config, Ext.util.GeoLocation, this.getGeo());
    },

    updateGeo: function(newGeo, oldGeo) {
        var events = {
            locationupdate : 'onGeoUpdate',
            locationerror : 'onGeoError',
            scope : this
        };

        if (oldGeo) {
            oldGeo.un(events);
        }

        if (newGeo) {
            newGeo.on(events);
            newGeo.updateLocation();
        }
    },

    doResize: function() {
        var map = this.getMap();
        if (map) {
            map.invalidateSize();
        }
    },

    // @private
    renderMap: function() {
        var me = this,
            element = me.element,
            mapOptions = me.getMapOptions(),
            event;

        var mapInfo = Ext.getStore("MapInfo").getAt(0).data;

        // Get map center info
        var centerInfo = mapInfo.center.split(",");
        var centerLat = centerInfo[1];
        var centerLong = centerInfo[0];

        // get map bounds
        var boundInfo = mapInfo.bounds.split(",");
        var southWest = L.latLng(boundInfo[1], boundInfo[0]);
        var northEast = L.latLng(boundInfo[3], boundInfo[2]);

        this.tileLayer = new L.TileLayer('resources/map_tiles/{z}/{x}/{y}.png', {
            attribution: mapInfo.attribution,
            maxZoom: mapInfo.maxzoom,
            minZoom: mapInfo.minzoom,
            errorTileUrl: 'resources/images/error_tile.png',
            updateWhenIdle: true
        });

        mapOptions = Ext.merge({
            layers : [this.tileLayer],
            zoom : this.zoomLevel || mapInfo.maxzoom,
            maxZoom : mapInfo.maxzoom,
            minZoom : mapInfo.minzoom,
            zoomControl : true,
            attributionControl : true,
            center : this.center || new L.LatLng(centerLat, centerLong),
            maxBounds : L.latLngBounds(southWest, northEast)
        }, mapOptions);


        if (this.map === undefined){
          this.map = new L.Map(element.id, mapOptions);

          // Remove the prepending leaflet link, as clicking will hijack the app!
          this.map.attributionControl.setPrefix("");
          this.map.addLayer(this.tileLayer);

          // load the data layer from the KML file downloaded from Mapbox.
          var data = new L.KML("resources/data.kml");

          self = this; // reference to self in handler

          // Wait until data layer has been loaded, then add it to the map
          var handler = setInterval(function(){
             loaded = data.isLoaded();
             if (loaded){

                  // cancel interval
                  clearInterval(handler);
                  handler = 0;

                  // add data layer to the map
                  self.map.addLayer(data);
                  me.fireEvent('maprender', me, self.map);

                    // Creates a red marker with the coffee icon
                  var userMarker = L.AwesomeMarkers.icon({
                    icon: 'location-arrow',
                    color: 'red',
                    prefix: 'fa'
                  });

                  // Creates a red marker with the coffee icon
                  var coffeeMarker = L.AwesomeMarkers.icon({
                    icon: 'coffee',
                    color: 'blue',
                    prefix: 'fa'
                  });

                  var raceMarker = L.AwesomeMarkers.icon({
                    icon: 'flag-checkered',
                    color: 'green',
                    prefix: 'fa'
                  });

                  var musicMarker = L.AwesomeMarkers.icon({
                    icon: 'music',
                    color: 'purple',
                    prefix: 'fa'
                  });

                  var foodMarker = L.AwesomeMarkers.icon({
                    icon: 'cutlery',
                    color: 'orange',
                    prefix: 'fa'
                  });

                var drinkMarker = L.AwesomeMarkers.icon({
                  icon: 'beer',
                  color: 'orange',
                  prefix: 'fa'
                });

                  L.marker([40.7746431,-73.97019], {icon: coffeeMarker}).bindPopup("TEST").addTo(self.map);
                  L.marker([40.7846431,-73.97019], {icon: userMarker}).bindPopup("TEST").addTo(self.map);
                  L.marker([40.7846431,-73.96019], {icon: raceMarker}).bindPopup("TEST").addTo(self.map);
                  L.marker([40.7646431,-73.96019], {icon: musicMarker}).bindPopup("TEST").addTo(self.map);
                  L.marker([40.7646431,-73.97019], {icon: foodMarker}).bindPopup("TEST").addTo(self.map);
                  L.marker([40.7846431,-73.98019], {icon: drinkMarker}).bindPopup("TEST").addTo(self.map);
             }
          }, 100);
        } else {
          me.fireEvent('maprender', me, self.map);
        }

    },

    // @private
    onGeoUpdate: function(geo) {
        if (geo) {
            this.setMapCenter(new L.LatLng(geo.getLatitude(), geo.getLongitude()));
        }
    },

    // @private
    onGeoError: Ext.emptyFn,

    /**
     * Moves the map center to the designated coordinates hash of the form:
     *
     *     { latitude: 39.290555, longitude: -76.609604 }
     *
     * or a L.LatLng object representing to the target location.
     *
     * @param {Object/L.LatLng} coordinates Object representing the desired Latitude and
     * longitude upon which to center the map.
     */
    setMapCenter: function(coordinates) {
        var me = this,
            map = me.getMap();

        if (map && coordinates) {
            if (!me.isPainted()) {
                me.un('painted', 'setMapCenter', this);
                me.on('painted', 'setMapCenter', this, { single: true, args: [coordinates] });
                return;
            }

            if (coordinates && !(coordinates instanceof L.LatLng) && 'longitude' in coordinates) {
                coordinates = new L.LatLng(coordinates.latitude, coordinates.longitude);
            }

            if (!map) {
                me.renderMap();
                map = me.getMap();
            }

            if (map && coordinates instanceof L.LatLng) {
                map.setView(ctr, this.zoomLevel);
            }
            else {
                this.options = Ext.apply(this.getMapOptions(), {
                    center: coordinates
                });
            }
        }
    },

    // @private
    onZoomChange : function() {
        var mapOptions = this.getMapOptions(),
            map = this.getMap(),
            zoom;

        zoom = (map && map.getZoom) ? map.getZoom() : mapOptions.zoom || 10;

        this.options = Ext.apply(mapOptions, {
            zoom: zoom
        });

        this.fireEvent('zoomchange', this, map, zoom);
    },

    // @private
    onCenterChange: function() {
        var mapOptions = this.getMapOptions(),
            map = this.getMap(),
            center;

        center = (map && map.getCenter) ? map.getCenter() : mapOptions.center;

        this.options = Ext.apply(mapOptions, {
            center: center
        });

        this.fireEvent('centerchange', this, map, center);

    },

    // @private
    destroy: function() {
        Ext.destroy(this.getGeo());
        this.callParent();
    }
});
