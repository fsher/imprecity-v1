import interact from 'interact.js/dist/interact.min';

export default class Marker {
    constructor(image, type_val, desc) {
        this.type = type_val;
        this.img = image;
        this.description = desc;

        this._element = document.createElement("img");
        this._element.src = this.img;
        this._element.className = "wrap__sidebar-content-img";
        this._element.alt = desc;
        this._element.setAttribute("data-type", type_val);
    }

    render() {

        let tooltip = document.createElement("div");
        tooltip.className = "wrap__sidebar-content-tooltip";
        tooltip.innerHTML = this.description;

        let container = document.createElement("div");
        container.className = "wrap__sidebar-content-container";

        container.appendChild(this._element);
        container.appendChild(tooltip);

        return container;
    }

    createGoogleMarker(latLng) {
        let googleMarker = new google.maps.Marker({
            icon: {
                url: this.img,
                scaledSize: new google.maps.Size(30, 30),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(15, 15)
            },
            position: latLng,
            draggable:true

        });

        return googleMarker;
    }

    // method taken from https://stackoverflow.com/questions/25219346/how-to-convert-from-x-y-screen-coordinates-to-latlng-google-maps
    getLatLngFromXY(map, x, y) {
        // retrieve the lat lng for the far extremities of the (visible) map
        let latLngBounds = map.getBounds();
        let neBound = latLngBounds.getNorthEast();
        let swBound = latLngBounds.getSouthWest();

        // convert the bounds in pixels
        let neBoundInPx = map.getProjection().fromLatLngToPoint(neBound);
        let swBoundInPx = map.getProjection().fromLatLngToPoint(swBound);

        // compute the percent of x and y coordinates related to the div containing the map; in my case the screen
        let procX = x/window.innerWidth;
        let procY = y/window.innerHeight;

        // compute new coordinates in pixels for lat and lng;
        // for lng : subtract from the right edge of the container the left edge,
        // multiply it by the percentage where the x coordinate was on the screen
        // related to the container in which the map is placed and add back the left boundary
        // you should now have the Lng coordinate in pixels
        // do the same for lat
        let newLngInPx = (neBoundInPx.x - swBoundInPx.x) * procX + swBoundInPx.x;
        let newLatInPx = (swBoundInPx.y - neBoundInPx.y) * procY + neBoundInPx.y;

        // convert from google point in lat lng and have fun :)
        let newLatLng = map.getProjection().fromPointToLatLng(new google.maps.Point(newLngInPx, newLatInPx));

        return newLatLng;
    }

    makeDraggable() {
        interact(this._element).draggable({
            onmove: function(event) {
                let target = event.target,
                    // keep the dragged position in the data-x/data-y attributes
                    x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
                    y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

                // translate the element
                target.style.webkitTransform =
                    target.style.transform =
                        'translate(' + x + 'px, ' + y + 'px)';

                // update the position attributes
                target.setAttribute('data-x', x);
                target.setAttribute('data-y', y);
            },
            onend: function(event) {
                let target = event.target;
                if (event.pageX < document.querySelector(".wrap__sidebar").clientWidth) {
                    target.style.webkitTransform =
                        target.style.transform =
                            'translate(0px, 0px)';

                    target.setAttribute('data-x', 0);
                    target.setAttribute('data-y', 0);
                }
            }
        })
    }

    addHeatmapSwitcher(heatmap) {
        var that = this;
        interact(this._element).on('tap', function(event){

            if (heatmap.isVisible()){
                
                if (!event.target.classList.contains('wrap__sidebar-content-img--selected')){
                    
                    var element = document.querySelector(".wrap__sidebar-content-img--selected");
                    if(element){
                        element.classList.remove("wrap__sidebar-content-img--selected");
                        element.classList.add("wrap__sidebar-content-img--nonselect");
                    }

                    event.target.classList.remove("wrap__sidebar-content-img--nonselect");
                    event.target.classList.add("wrap__sidebar-content-img--selected");
                }
                

                heatmap.changeType(event.target.getAttribute('data-type'));
                heatmap.loadData({all: false, show: true});
            }
        })
    }
}