import Map from './components/Map';
import Comments from "./components/Comments";

window.onload = function() {
    new Map(document.querySelector(".wrap__map"), {
        isStatic: false,
        heatmapOnly: true
    });

    //new Comments(".wrap__comments", 5);
}