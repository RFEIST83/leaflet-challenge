// All Earthquakes over the past 7 days
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

d3.json(queryUrl).then(function (data) {
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><p><b>Magnitude:</b> ${feature.properties.mag}; <b>Depth:</b> ${feature.geometry.coordinates[2]} Km</p>`);
    }

    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: function (feature, latlng) {
            color = markerColour(feature.geometry.coordinates[2]);

            var geojsonMarkerOptions = {
                radius: markerSize(feature.properties.mag),
                fillColor: color,
                color: "black",
                weight: 1,
                opacity: 1,
                fillOpacity: 1
            };
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }
    });

    createMap(earthquakes);
}

function markerSize(magnitude) {
    return magnitude * 2;
}

function markerColour(depth) {
    if (depth <= 10) {
        colour = "#ff8A65";
    } else if (depth <= 30) {
        colour = "#ff0000";
    } else if (depth <= 50) {
        colour = "#ff6b6b";
    } else if (depth <= 70) {
        colour = "#ffb3b3";
    } else if (depth <= 90) {
        colour = "#ffd6d6";
    } else {
        colour = "#3e2723";
    }
    return colour;
}

function createMap(earthquakes) {
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    let earthquake = L.layerGroup(earthquakes);

    let baseMaps = {
        "Street Map": street,
    };

    let overlayMaps = {
        Earthquakes: earthquakes
    };

    let myMap = L.map("map", {
        center: [28, 2],
        zoom: 2.4,
        layers: [street, earthquakes]
    });

    let legend = L.control({ position: "bottomright" });
    legend.onAdd = function () {
        let div = L.DomUtil.create("div", "info legend")
        let depth = [-10, 10, 30, 50, 70, 90];
        let labels = [];

        div.innerHTML += "<h3 style='text-align: center'>Depth</h3>"

        for (var i = 0; i < depth.length; i++) {
            div.innerHTML +=
                '<i style="background-color:' + markerColour(depth[i] + 1) + '">&nbsp&nbsp&nbsp&nbsp</i> ' +
                depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
        }

        return div;
    };

    legend.addTo(myMap);

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);
}