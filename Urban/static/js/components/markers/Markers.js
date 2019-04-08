import Marker from './Marker';


export default class Markers {
    constructor(selector, data) {
        this._selector = selector;

        this._markers = [];

        for (let i = 0; i < data.length; i++) {
            const marker = new Marker(data[i].url, i, data[i].description);
            marker.makeDraggable();

            this._markers.push(marker);
        }
    }

    getMarkerByType(type) {
        for (let i = 0; i < this._markers.length; i++) {
            if (this._markers[i].type == type) return this._markers[i];
        }
        return null;
    }

    setHeatMap(heatmap) {
        for(let i = 0; i < this._markers.length; i++){
            this._markers[i].addHeatmapSwitcher(heatmap);
        }
    }

    render() {
        for (let i = 0; i < this._markers.length; i++) {
            this._selector.appendChild(this._markers[i].render());
        }

        document.querySelector(".wrap__sidebar-content-img").addEventListener('pointerdown mousedown touchstart', (e) => {
            e.stopImmediatePropagation();
        });
    }
}