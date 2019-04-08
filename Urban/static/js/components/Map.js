
import interact from 'interact.js/dist/interact.min';
import jQuery from 'jquery';
import globals from '../globals';
import MarkerCounter from './markers/MarkerCounter';
import Heatmap from "./Heatmap";

window.$ = window.jQuery = jQuery;

export default class Map {
    constructor(selector, options) {
        let isStatic = options.isStatic || false;
        let heatmapOnly = options.heatmapOnly || false;

        this.selector = selector;
        this._markers = options.markers || null;
        this._googleMarkers = [];
        this._movedMarker = null;
        this._isLegendVisible = false;

        this._heatmap;

        this._infowindow = new google.maps.InfoWindow();

        this._map = new google.maps.Map(selector, {
            center: {lat: 59.924848, lng: 30.330752},
            zoom: 11,
            streetViewControl: false,
            mapTypeControl: false,
            mapTypeId: "toner",
            mapTypeControlOptions: {
                mapTypeIds: ["toner"]
            }
        });

        this._locationErrorInfoWindow = new google.maps.InfoWindow({map:this._map})
        this._locationErrorInfoWindow.close()

        this._map.mapTypes.set("toner", new google.maps.StamenMapType("toner"));

        this._geoloccontrol = new google.maps.Marker({
            map: this._map,
            animation: google.maps.Animation.DROP,
            position: {lat:31.4181, lng:73.0776}
        });
        this._addYourLocationButton(this._map, this._geoloccontrol);

        this._find_place_marker =  null;



        // Setting extra options
        this._map.setOptions({draggable: !isStatic, disableDefaultUI: isStatic});
        this.addSearchEventListener();

        if (!isStatic) {
            // Getting personal markers
            if (this._markers && !heatmapOnly) {
                $.ajax({
                    url: "/api/mark/all",
                    method: "GET",
                    data: {
                        self: true
                    }
                }).done((data) => {

                    let markers = data["markers"];
                    if (markers) {
                        //this._markerCounter = new MarkerCounter(document.querySelector(".wrap__sidebar-heatmap"), markers.length, { counterOnly: false });
                        for (let m in markers) {
                            let marker = markers[m],
                                img = "";

                            for (let i = 0; i < globals.MARKERS.length; i++)
                                if (i == marker["type"]) {
                                    img = globals.MARKERS[i].url;
                                    break;
                                }

                            let gm = new google.maps.Marker({
                                icon: {
                                    url: img,
                                    scaledSize: new google.maps.Size(30, 30),
                                    origin: new google.maps.Point(0, 0),
                                    anchor: new google.maps.Point(15, 15)
                                },
                                position: {lat: marker["lat"], lng: marker["lng"]},
                                markerId: marker["id"],
                                markerType: marker["type"],
                                map: this._map
                            });

                            this.addMarkerUpdateListener(gm);
                            this._googleMarkers.push(gm);

                        }
                    }
                });
            } else {
                // Create a default heatmap - type 0
                this._createHeatmapWithLegend(".wrap__legend-items", {all: true, legendStyle: "vertical-center"}, () => {
                    $(".wrap__legend").animate({
                        left: 0
                    }, "slow");
                });

                this._isLegendVisible = true;
            }
        }
    }




    _createHeatmapWithLegend(legendClassName, options, callback) {
        let all = options.all || false;
        let radius = options.radius || 20;

        this._heatmap = new Heatmap(this._map, { markerType: 0, radius: radius });

        if(this._markers){
            this._markers.setHeatMap(this._heatmap);
        }

        let $legend = $(legendClassName);
        if ($legend) {
            for (let i = 0; i < globals.MARKERS.length; i++) {
                if (options.legendStyle && options.legendStyle == "vertical-center") {
                    if (i == 0) $legend.append('<div class="wrap__legend-item" data-id="' + i + '"><img src="' + globals.MARKERS[i].url + '" class="wrap__legend-img--selected" alt=""><div class="wrap__legend-description--selected">' + globals.MARKERS[i].description + '<span class="wrap__legend-description-marker-amount"></span></div></div>')
                    else $legend.append('<div class="wrap__legend-item" data-id="' + i + '"><img src="' + globals.MARKERS[i].url + '" class="wrap__legend-img" alt=""><div class="wrap__legend-description">' + globals.MARKERS[i].description + '<span class="wrap__legend-description-marker-amount"></span></div></div>')
                } else {
                    if (i == 0) $legend.append('<div class="wrap__legend-item" data-id="' + i + '"><img src="' + globals.MARKERS[i].url + '" class="wrap__legend-img--selected" alt=""><div class="wrap__legend-description--selected">' + globals.MARKERS[i].description + '</div></div>')
                    else $legend.append('<div class="wrap__legend-item" data-id="' + i + '"><img src="' + globals.MARKERS[i].url + '" class="wrap__legend-img" alt=""><div class="wrap__legend-description">' + globals.MARKERS[i].description + '</div></div>')
                }
            }
            $legend.append('<div class="wrap__legend-item" data-id="all"><img src="/static/img/all_marks.png" class="wrap__legend-img" alt=""><div class="wrap__legend-description wrap__legend-description--full">Все метки</div></div>')

            $.ajax({
                url: "/api/mark/stats",
                method: "GET"
            }).done((data) => {
                if (data) {
                    let stats = data.stats;
                    for (let i = 0; i < stats.length; i++) {
                        $(".wrap__legend-item[data-id=" + stats[i].type + "]").find(".wrap__legend-description-marker-amount").html(" (" + stats[i].amount + ")");
                    }
                }
            });

            let that = this;
            var isLegendShown = false;

            $(".wrap__legend-item").click(function() {
                if ($(this).children(".wrap__legend-img--selected").length == 0 || $(this).children(".wrap__legend-description--selected").length == 0) {
                    $(".wrap__legend-item").each(function(el, val) {
                        if ($(this).children(".wrap__legend-img--selected").length > 0 || $(this).children(".wrap__legend-description--selected").length > 0) {
                            $(this).children(".wrap__legend-img--selected").addClass("wrap__legend-img").removeClass("wrap__legend-img--selected");
                            $(this).children(".wrap__legend-description--selected").addClass("wrap__legend-description").removeClass("wrap__legend-description--selected");
                        }
                    });

                    $(this).children(".wrap__legend-description").addClass("wrap__legend-description--selected").removeClass("wrap__legend-description");
                    $(this).children(".wrap__legend-img").addClass("wrap__legend-img--selected").removeClass("wrap__legend-img");

                    that._heatmap.changeType($(this).attr("data-id"));


                    that._heatmap.loadData({all: all, show: true, screenListener: true});

                    that.loadMarkers();

                }

                $(".current_legend_item").attr('src', $(this).children(".wrap__legend-img--selected").attr('src'));

            });

            if (options.legendStyle) {
                switch (options.legendStyle) {
                    case "vertical-center":
                        $(".wrap__legend").css("top", "50%").css("margin-top", (-Math.round($(".wrap__legend").height() / 2)) + "px");
                        break;
                }
            }
        }

        if (all) this._heatmap.loadData({all: all, show: true, screenListener: true});
        else this._heatmap.loadData({all: all, show: false, screenListener: true});

        this.loadMarkers();

        if (typeof callback === "function") callback();

        $(".wrap__legend-toggle").click(function(){

            $(".wrap__legend-toggle--arrow").toggleClass("wrap__legend-toggle--arrow_right");


            var w = $('.wrap__legend').width();
            var pos = $('.wrap__legend').offset().left;

            if(pos == 0){
                $(".wrap__legend").animate({"left": -w}, "slow");
            }
            else
            {
                $(".wrap__legend").animate({"left": "0"}, "slow");
            }


        });
    }

    loadMarkers() {

        var map = this._map;
        var marker_type = this._heatmap.getType();

        if (this.markerCluster) {
            this.markerCluster.clearMarkers();
            this.markerCluster = null;
        }

        this._googleMarkers.forEach(marker => {
            marker.setMap(null);
        });
        this._googleMarkers = [];

        $.ajax({
            url: "/api/mark/radius",
            method: "GET",
            data: {
                type: marker_type
            }
        }).done((data) => {
            let _markerType = 0;
            let markers = data["markers"];
            if (markers) {

                for (let m in markers) {
                    let marker = markers[m];
                    let img = "";

                    _markerType = marker["type"];

                    for (let i = 0; i < globals.MARKERS.length; i++) {
                        if (i == marker["type"]){
                            img = globals.MARKERS[i].url;
                            break;
                        }
                    }

                    let gm = new google.maps.Marker({
                        icon:{
                            url: img,
                            scaledSize: new google.maps.Size(30, 30),
                            origin: new google.maps.Point(0,0),
                            anchor: new google.maps.Point(15,15)
                        },

                        position: {lat: marker["lat"], lng: marker["lng"]},
                        markerId: marker["id"],
                        markerType: marker["type"],
                        map: map
                    });


                    this.addShowMarkCommentListener(gm);
                    this._googleMarkers.push(gm);
                }

                const _markerChars = ['h', 'a', 's', 'f', 'd'];
                const _markerChar = _markerChars[_markerType];
                const imagePath = `/static/markerclusterer/${_markerChar}_`;
                this.markerCluster = new MarkerClusterer(this._map, [], {
                    ignoreHidden: true,
                    zoomOnClick: true,
                    imagePath: imagePath
                });
                this.markerCluster.addMarkers(this._googleMarkers);

            }
        });
    }


    addMarkerUpdateListener(googleMarker) {
        googleMarker.addListener("click", (event) => {
            googleMarker.setDraggable(true);
            if (this._infowindow) this._infowindow.close();
            this._infowindow = new google.maps.InfoWindow();
            $.ajax({
                url: "/api/mark",
                method: "GET",
                data: {
                    id: googleMarker.markerId
                }
            }).done((data) => {
                let marker = data["marker"];

                let m_type = googleMarker.markerType;

                this._infowindow.setContent("<div class='wrap__map-text-box'><textarea class='wrap__map-text' placeholder='" + globals.MARKERS[m_type].infoWindowPlaceholder + "'>" + marker.text + "</textarea><div class='wrap__map-text-buttons'><input type='button' class='wrap__map-text-button--transparent wrap__map-text-delete-button' value='Удалить' /><input type='button' class='wrap__map-text-button wrap__map-text-save-button' value='Сохранить' /></div></div>");
                this._infowindow.open(this._map, googleMarker);

                // Removing default close option
                $(".gm-style-iw + div").remove();

                $(".wrap__map-text-save-button").click(() => {
                    googleMarker.setDraggable(false);
                    $(".wrap__map-text-save-button").prop("disabled", true);
                    $.ajax({
                        url: "/api/mark/update",
                        method: "POST",
                        data: {
                            id: googleMarker.markerId,
                            text: $(".wrap__map-text").val()
                        }
                    }).done((data) => {
                        this._infowindow.close();
                        $(".wrap__map-text-save-button").prop("disabled", false);
                    });
                    googleMarker.setDraggable(false);
                });

                $(".wrap__map-text-delete-button").click(() => {
                    googleMarker.setDraggable(false);
                    $.ajax({
                        url: "/api/mark/delete",
                        method: "POST",
                        data: {
                            id: googleMarker.markerId
                        }
                    }).done((data) => {
                        googleMarker.setMap(null);
                        if (this._markerCounter.dec()) {
                            if (this._heatmap) {
                                this._heatmap.hideHeatMap();
                                this._heatmap = null;

                                this._markerCounter.getTooltip().innerHTML = "Показать тепловую карту";
                                $(this._markerCounter.getButtonDom()).find(".wrap__sidebar-heatmap-img--selected").addClass("wrap__sidebar-heatmap-img").removeClass("wrap__sidebar-heatmap-img--selected");


                                $(".wrap__legend--horizontal").animate({
                                    bottom: -200
                                }, 500, () => {
                                    $(".wrap__legend-items--horizontal").html("");
                                });

                            }

                        } else {
                            if (this._heatmap.getType() == googleMarker.markerType) this._heatmap.removeMarker(googleMarker.markerId);
                        }
                    });
                });
            });

        });

        googleMarker.addListener("dragend", (event) => {
            $.ajax({
                url: "/api/mark/update",
                method: "POST",
                data: {
                    id: googleMarker.markerId,
                    lat: googleMarker.position.lat(),
                    lng: googleMarker.position.lng()
                }
            })
        });

    }

    /*
    addShowMarkInRadiusListener(){
        var map = this._map;

        map.addListener('click', (event) => {

            //delete current markers
            if (this._googleMarkers) {
                for (var m in this._googleMarkers) {
                    var marker = this._googleMarkers[m];
                    marker.setMap(null);
                }
                this._googleMarkers = [];
            }

            //map zoom index to search radius
            let radius = (0.02155-0.001073*map.zoom)/5;

            this._loadMarkersInRadius(event.latLng.lat(), event.latLng.lng(), radius);

        });
    }
    */

    addShowMarkCommentListener(googleMarker){

        googleMarker.addListener("click", (event) =>{
            if(this._infowindow) {
                this._infowindow.close();
            }

            this._infowindow = new google.maps.InfoWindow();

            $.ajax({
                url: "/api/mark",
                method: "GET",
                data: {
                    id: googleMarker.markerId
                }
            }).done((data) => {
                let marker = data["marker"];

                let m_type = googleMarker.markerType;

                this._infowindow.setContent("<div class='wrap__map-text-box'><textarea disabled class='wrap__map-text' >" + marker.text + "</textarea><div class='wrap__map-text-buttons'><input type='button' class='wrap__map-text-button wrap__map-text-close-button' value='Закрыть' /></div></div>");
                this._infowindow.open(this._map, googleMarker);

                $(".wrap__map-text-close-button").click(() => {
                    $(".wrap__map-text-save-button").prop("disabled", true);
                    this._infowindow.close()
                    $(".wrap__map-text-save-button").prop("disabled", false);
                })
            }).fail((data) => {
                if (data["status"] == 403){
                    this._infowindow.setContent("<div class='wrap__map-text-box'><p>Авторизуйтесь для отображения комментария</p><div class='comment-auth'><a class='wrap__marker-auth-item--vk' href='/social/login/vk-oauth2/'><img class='social_img--little' src='/static/img/vk_icon.png'></a><a class='wrap__marker-auth-item--google' href='/social/login/google-oauth2/'><img class='social_img--little' src='/static/img/google-plus_icon.png'></a><a class='wrap__marker-auth-item--facebook' href='/social/login/facebook/'><img class='social_img--little' src='/static/img/facebook_icon.png'></a></div><div class='wrap__map-text-buttons'><input type='button' class='wrap__map-text-button wrap__map-text-close-button' value='Закрыть' /></div></div>");
                    this._infowindow.open(this._map, googleMarker);

                    $(".wrap__map-text-close-button").click(() => {
                        $(".wrap__map-text-save-button").prop("disabled", true);
                        this._infowindow.close()
                        $(".wrap__map-text-save-button").prop("disabled", false);
                    })
                }

            })

        });

    };

    addSearchEventListener() {
        let search = $(".wrap__search-box");

        if (search) {
            $(".wrap__search-box").children(".wrap__search-button").click(() => {

                if (this._find_place_marker){
                    this._find_place_marker.setMap(null);
                }

                this._geocode();
            });

            $(".wrap__search-box").children(".wrap__search").keypress((event) => {
                if (event.which == 13) {

                    if (this._find_place_marker){
                        this._find_place_marker.setMap(null);
                    }

                    this._geocode();
                    return false;
                }
            });

        }
    }

    addRecountAmountMarksListener() {
        this._map.addListener('bounds_changed', () => {
            let bounds = this._map.getBounds().toJSON();

            $.ajax({
                url: "/api/mark/stats",
                method: "GET",
                data: {
                    bounds: [bounds["south"], bounds["north"], bounds["west"], bounds["east"]]
                }
            }).done((data) => {
                if (data) {
                    let stats = data.stats;
                    for (let i = 0; i < stats.length; i++) {
                        $(".wrap__legend-item[data-id=" + stats[i].type + "]").find(".wrap__legend-description-marker-amount").html(" (" + stats[i].amount + ")");
                    }
                }
            });

        });
    }

    addShowMarkerOnZoomChangedListener(){

        var map = this._map;

        map.addListener('zoom_changed', (event) => {
            //delete current markers

            let zoom = map.getZoom();

            if (zoom >= 13){

                var old_googlemarkers = this._googleMarkers.slice();

                if (this._googleMarkers) {
                    this._googleMarkers = [];
                }

                let center = map.getCenter();

                let radius = Math.sqrt((center.lat() - map.getBounds().getNorthEast().lat())**2 + (center.lng() - map.getBounds().getNorthEast().lng())**2)

                this._loadMarkersInRadius(center.lat(), center.lng(), radius);

                if (old_googlemarkers) {
                    for (var m in old_googlemarkers) {
                        var marker = old_googlemarkers[m];
                        marker.setMap(null);
                    }
                }

            }
            else {
                if (this._googleMarkers && this._googleMarkers.length != 0) {
                    for (var m in this._googleMarkers) {
                        var marker = this._googleMarkers[m];
                        marker.setMap(null);
                    }
                    this._googleMarkers = [];
                }
            }
        })
    }

    addShowMarkerOnDragEndListener(){
        var map = this._map;

        map.addListener('dragend', (event) => {
            //delete current markers

            let zoom = map.getZoom();

            if (zoom >= 13){

                var old_googlemarkers = this._googleMarkers.slice();

                if (this._googleMarkers) {
                    this._googleMarkers = [];
                }


                let center = map.getCenter();

                let radius = Math.sqrt((center.lat() - map.getBounds().getNorthEast().lat())**2 + (center.lng() - map.getBounds().getNorthEast().lng())**2)

                this._loadMarkersInRadius(center.lat(), center.lng(), radius);

                if (old_googlemarkers) {
                    for (var m in old_googlemarkers) {
                        var marker = old_googlemarkers[m];
                        marker.setMap(null);
                    }
                }

            }
            else {
                if (this._googleMarkers && this._googleMarkers.length != 0) {
                    for (var m in this._googleMarkers) {
                        var marker = this._googleMarkers[m];
                        marker.setMap(null);
                    }
                    this._googleMarkers = [];
                }
            }
        })
    }

    addHeatmapRebuildOnDragAndResize(options) {
        let all = options.all || false;

        this._map.addListener('dragend', (event) => {
            this._heatmap.loadData({all: all, show: true, screenListener: true});
        });

        this._map.addListener('zoom_changed', (event) => {
            this._heatmap.loadData({all: all, show: true, screenListener: true});
        });
    }

    _geocode() {
        let geocoder = new google.maps.Geocoder();
        let address = $(".wrap__search-box").children(".wrap__search").val();
        const PAN_ZOOM = 16;

        if (address) {
            geocoder.geocode({"address": address + ", Санкт-Петербург"}, (results, status) => {
                if (status === "OK") {

                    this._map.panTo(results[0].geometry.location);
                    this._map.setZoom(this._map.getZoom() < PAN_ZOOM ? PAN_ZOOM : this._map.getZoom());

                    var place_marker = new google.maps.Marker({
                        position: results[0].geometry.location,
                        map: this._map
                    });

                    this._find_place_marker = place_marker;
                }
            });
        }
    }

    makeDroppable() {

        interact(this.selector).dropzone({
            checker: (dragEvent, event, dropped, dropzone, dropElement, draggable, draggableElement) => {
                return dropped && dragEvent.pageX > document.querySelector(".wrap__sidebar").clientWidth;
            },

            ondragenter: (event) => {
                $(this.selector).click((event) => {
                    google.maps.event.trigger(this._map, 'click', {latLng: this._movedMarker.getLatLngFromXY(this._map, event.pageX, event.pageY)});
                });

                this._map.addListener("click", (event) => {
                    let coords = event.latLng;
                    let googleMarker = this._movedMarker.createGoogleMarker({lat: coords.lat(), lng: coords.lng()});

                    let markerType = this._movedMarker.type;
                    $.ajax({
                        url: "/api/mark",
                        method: "POST",
                        data: {
                            lat: coords.lat(),
                            lng: coords.lng(),
                            type: markerType,
                            text: "",

                        }
                    }).done((data) => {
                        googleMarker.markerId = data["marker"]["id"];
                        googleMarker.markerType = data["marker"]["type"];

                        this.addMarkerUpdateListener(googleMarker);
                        this._googleMarkers.push(googleMarker);
                        googleMarker.setMap(this._map);

                        new google.maps.event.trigger(googleMarker, 'click');
                    });

                    // Remove listeners
                    $(this.selector).off("click");
                    google.maps.event.clearListeners(this._map, "click");
                });
            },

            ondragleave: (event) => {
                // Clearing listener
                google.maps.event.clearListeners(this._map, "click");
            },

            ondrop: (event) => {
                this._movedMarker = this._markers.getMarkerByType(event.relatedTarget.getAttribute("data-type"));

                let mapElemX = event.dragEvent.pageX,
                    mapElemY= event.dragEvent.pageY,
                    target = event.relatedTarget;

                // Returning element to the previous position
                target.style.webkitTransform =
                    target.style.transform =
                        'translate(0px, 0px)';

                target.setAttribute('data-x', "0");
                target.setAttribute('data-y', "0");

                // Firing the click event for the map
                let click = new jQuery.Event("click");
                click.pageX = mapElemX;
                click.pageY = mapElemY;
                $(this.selector).trigger(click);
            }

        });
    }

    _addYourLocationButton (map, marker) {

        var that = this;

        var controlDiv = document.createElement('div');

        var firstChild = document.createElement('button');
        firstChild.style.backgroundColor = '#fff';
        firstChild.style.border = 'none';
        firstChild.style.outline = 'none';
        firstChild.style.width = '28px';
        firstChild.style.height = '28px';
        firstChild.style.borderRadius = '2px';
        firstChild.style.boxShadow = '0 1px 4px rgba(0,0,0,0.3)';
        firstChild.style.cursor = 'pointer';
        firstChild.style.marginRight = '10px';
        firstChild.style.padding = '0';
        firstChild.title = 'Your Location';
        controlDiv.appendChild(firstChild);

        var secondChild = document.createElement('div');
        secondChild.style.margin = '5px';
        secondChild.style.width = '18px';
        secondChild.style.height = '18px';
        secondChild.style.backgroundImage = 'url(https://maps.gstatic.com/tactile/mylocation/mylocation-sprite-2x.png)';
        secondChild.style.backgroundSize = '180px 18px';
        secondChild.style.backgroundPosition = '0 0';
        secondChild.style.backgroundRepeat = 'no-repeat';
        firstChild.appendChild(secondChild);

        google.maps.event.addListener(map, 'center_changed', function () {
            secondChild.style['background-position'] = '0 0';
        });

        firstChild.addEventListener('click', function () {
            /*
            var imgX = 0,
                animationInterval = setInterval(function () {
                    imgX = -imgX - 18 ;
                    secondChild.style['background-position'] = imgX+'px 0';
                }, 500);
            */

            //var infoWindow = new google.maps.InfoWindow({map: map});
            const PAN_ZOOM = 16;

            if(navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

                    var googleMarker = new google.maps.Marker({
                        position: latlng,
                        map: map,
                        icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                    });

                    map.panTo(latlng);
                    map.setZoom(map.getZoom() < PAN_ZOOM ? PAN_ZOOM : map.getZoom());

                    //map.setCenter(latlng);
                    //clearInterval(animationInterval);
                    secondChild.style['background-position'] = '-144px 0';
                },function() {
                    that.handleLocationError(true, that._locationErrorInfoWindow, map.getCenter());
                });

            } else {
                that.handleLocationError(false, that._locationErrorInfoWindow, map.getCenter());
            }
        });

        controlDiv.index = 1;
        map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(controlDiv);
    }

    handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.close()

        infoWindow.setPosition(pos);

        infoWindow.setContent("<div class='wrap__map-text-box'><p>Ошибка: Сервис геолокации недоступен</p><div class='wrap__map-text-buttons'><input type='button' class='wrap__map-text-button wrap__map-text-close-button' value='Закрыть' /></div></div>");

        infoWindow.open(this._map);

        $(".wrap__map-text-close-button").click(() => {
            //$(".wrap__map-text-save-button").prop("disabled", true);
            infoWindow.close()
            //$(".wrap__map-text-save-button").prop("disabled", false);
        })

    }


}