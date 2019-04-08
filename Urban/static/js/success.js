import Map from './components/Map';
import Markers from './components/markers/Markers';
import globals from './globals';


window.onload = function() {
    let markers = new Markers(document.querySelector(".wrap__sidebar-content"), globals.MARKERS);
    markers.render();

    new Map(document.querySelector(".wrap__map"), {
        isStatic: false,
        markers: markers,
    }).makeDroppable();

    
}