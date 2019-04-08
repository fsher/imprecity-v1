import jQuery from 'jquery';
import globals from "../globals";

window.$ = window.jQuery = jQuery;

export default class Heatmap {
    constructor(map, options) {
        this._map = map;

        this._markerType = options.markerType;
        this._data = options.data || new google.maps.MVCArray();
        this._radius = options.radius || 20;

        this._layer =
            new google.maps.visualization.HeatmapLayer({
                radius: this._radius
            });
    }

    loadData(options) {
        this.hideHeatMap();

        let $loader = $(".wrap__loader");

        if ($loader) $loader.fadeTo("fast", 1);

        // Load all marker or only user's
        let loadAll = options.all || false;

        // Show the heatmap right away or not
        let show = options.show || false;

        // Load only the markers in the screen borders
        let screenListener = options.screenListener || false;

        let bounds = this._map.getBounds() !== undefined ? this._map.getBounds().toJSON() : false;

        let ajaxOptions = screenListener && bounds ?
            {
                url: "/api/mark/all",
                method: "GET",
                data: {
                    self: !loadAll,
                    type: this._markerType,
                    bounds: [bounds["south"], bounds["north"], bounds["west"], bounds["east"]]
                }
            } : {
                url: "/api/mark/all",
                method: "GET",
                data: {
                    self: !loadAll,
                    type: this._markerType
                }
            };

        $.ajax(ajaxOptions).done((data) => {
            let markers = data["markers"];

            if (this._markerType !== "all") {
                this._data = new google.maps.MVCArray();
                this._layer =
                    new google.maps.visualization.HeatmapLayer({
                        radius: this._radius
                    });

                for (let m in markers) {
                    let marker = markers[m];

                    this._data.push({
                            location: new google.maps.LatLng(marker['lat'], marker['lng']),
                        });
                }

                this._layer.setData(this._data);

                this._layer.set("gradient", globals.MARKERS[this._markerType].heatmapGradient);
                this._layer.set("maxIntensity", 1);
            } else {
                this._data = [];
                this._layer = [];

                for (let m in markers) {
                    let marker = markers[m];

                    this._layer.push(new google.maps.Circle({
                        map: this._map,
                        center: new google.maps.LatLng(marker['lat'], marker['lng']),
                        fillColor: globals.MARKERS[marker["type"]].colorForAll,
                        fillOpacity: 0.8,
                        strokeOpacity: 0,
                        radius: this._radius * 5
                    }))
                }

            }




            if ($loader) {
                $loader.fadeTo("fast", 0, () => {
                    $loader.css("display", 'none');

                    if (show) this.showHeatMap();
                });
            }

        });

    }

    showHeatMap() {
        if (Array.isArray(this._layer)) {
          for (let i = 0; i < this._layer.length; i++) this._layer[i].setMap(this._map);
        } else this._layer.setMap(this._map);
    }

    hideHeatMap() {
        if (Array.isArray(this._layer)) {
            for (let i = 0; i < this._layer.length; i++) this._layer[i].setMap(null);
        } else this._layer.setMap(null);
    }

    isVisible() {
        // This method is not working with layers array yet.
        return !!this._layer.getMap();
    }

    changeType(type) {
        this._markerType = type;
    }

    getType() {
        return this._markerType;
    }

    pushMarker(data) {
        if (Array.isArray(this._data)) {
            this.pushMarker(data, 0);
        } else this._data.push(data);
    }

    pushMarker(data, type) {
        this._data[type].push(data);
    }

    removeMarker(id) {
        if (Array.isArray(this._data)) {
            this.removeMarker(id, 0);
        } else {
            this._data.forEach((el, i) => {
                if (el && el.id == id) {
                    this._data.removeAt(i);
                }
            });
        }

    }

    removeMarker(id, type) {
        this._data[type].forEach((el, i) => {
            if (el && el.id == id) {
                this._data[type].removeAt(i);
            }
        });
    }
}