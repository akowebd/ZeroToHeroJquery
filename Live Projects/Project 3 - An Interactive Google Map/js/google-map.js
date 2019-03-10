$(function () {

        var api = google.maps,
            mapCenter = { lat: 28.7041, lng: 77.1025 },
            mapOptions = {
                zoom: 13,
                center: mapCenter,
                mapTypeId: 'roadmap',
                disableDefaultUI: true
            },
            map = new api.Map(document.getElementById("map"), mapOptions),
            ui = $("#ui"),
            clicks = 0,
            positions = [];

        //Showing the company HQ with a custom overlay
        var homeMarker = new api.Marker({
            position: mapCenter,
            map: map,
            icon: "img/hq.png"
        });

        var infoWindow = new api.InfoWindow({
            content: document.getElementById("hqinfo")
        });

        api.event.addListener(homeMarker, "click", function () {
            infoWindow.open(map, homeMarker);
        });
        var addMarker = function (e) {
            if (clicks <= 1) {
                positions.push(e.latLng);
                var marker = new api.Marker({
                    map: map,
                    position: e.latLng,
                    flat: (clicks === 0) ? true : false,
                    animation: api.Animation.DROP,
                    title: (clicks === 0) ? "Start" : "End",
                    icon: (clicks === 0) ? "img/start.png" : "",
                    draggable: true,
                    id: (clicks === 0) ? "Start" : "End"
                });
                api.event.trigger(map, "locationAdd", e);
            } else {
                api.event.removeListener(mapClick);
                return false;
            }
        }

        var mapClick = api.event.addListener(map, "click", addMarker);

        api.event.addListener(map, "locationAdd", function (e) {
            var journeyEl = $("#journey"),
                outer = (journeyEl.length) ? journeyEl : $("<div>", {
                    id: "journey"
                });
            new api.Geocoder().geocode({
                "latLng": e.latLng
            },
                function (results) {
                    $("<h3 />", {
                        text: (clicks === 0) ? "Start:" : "End:"
                    }).appendTo(outer);
                    $("<p />", {
                        text: results[0].formatted_address,
                        id: (clicks === 0) ? "StartPoint" : "EndPoint",
                        "data-latLng": e.latLng
                    }).appendTo(outer);
                    if (!journeyEl.length) {
                        outer.appendTo(ui);
                    } else {
                        $("<button />", {
                            id: "getQuote",
                            text: "Get quote"
                        }).prop("disabled", true).appendTo(journeyEl);
                    }
                    clicks++;
                });
        });

});
    
    