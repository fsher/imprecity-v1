import Map from './components/Map';

if(window.screen && window.screen.width <= 780){
	$(".wrap__background-video").remove();
}else{
	$(".wrap__background-video").attr("poster", "/static/other/bg.png");
}

window.onload = function() {
    // new Map(document.querySelector(".wrap__map"), {
    //     isStatic: true
    // });
    //$(".wrap__background-video").remove();
}