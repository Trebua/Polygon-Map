var map = L.map('map').setView([51.5027589576403, -0.14007568359375], 13);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoic2luZHJlYXViIiwiYSI6ImNqbTBpZ3dwNzBjdzIzbG15djRiNGUwZGkifQ.MAMvApOlgo-J_Srj6p1nxQ', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'your.mapbox.access.token'
}).addTo(map);

document.getElementById("union").addEventListener("click", intersectOrUnion);
document.getElementById("snitt").addEventListener("click", intersectOrUnion);
document.getElementById("defaults").addEventListener("click", loadDefaults);
document.getElementById("clear").addEventListener("click", clearAll);
document.getElementById("currentstate").addEventListener("click", stateToGeoJSON);
let errorMsg = document.getElementById("error");

var polygons = [];
var polyid = "0";
var selected = [] //max 2

function loadDefaults(json) {
    //json = getDefaultPolygons();
    let features = json.features;
    for (let i = 0; i < features.length; i++) {
        let coords = features[i].geometry.coordinates[0];
        let poly = L.polygon([coords], { color: 'red', id: polyid++ }).addTo(map);
        polygons.push(poly);
    }
    polygons.forEach(function (pol) {
        pol.on('click', select)
        var j = pol.toGeoJSON();
        L.extend(j.properties, pol.properties)
    });
}

//Select når man klikker på en polygon
function select(event) {
    let poly = event.target;

    //unselect
    let index = polyIndex(poly, selected);
    if (index >= 0) {
        poly.setStyle({ fillColor: 'red', color: "red" });
        selected.splice(index, 1);
        return
    }

    //select og evt. fjern overflødig
    selected.push(poly);
    poly.setStyle({ fillColor: 'green', color: "green" });
    if (selected.length > 2) {
        let unselectedPoly = selected[0];
        selected = selected.slice(1);
        unselectedPoly.setStyle({ fillColor: 'red', color: "red" });
    }

}

//Finner index til polygon for gitt liste
function polyIndex(poly, l) {
    for (let i = 0; i < l.length; i++) {
        if (l[i].options.id == poly.options.id) {
            return i;
        }
    }
    return -1;
}

//Utfører union og snitt
function intersectOrUnion(event) {
    let op = event.target.id;
    //Feilmelding
    if (selected.length != 2) {
        errorMsg.innerHTML = "Du må markere 2 polygoner for å utføre " + op;
        return
    }
    errorMsg.innerText = "";

    //Hente selected polygoner
    let poly1 = selected[0];
    let poly2 = selected[1];

    //Konvertere til turf-polygoner
    let turfPoly1 = turf.polygon([
        getPolyCoords(poly1)
    ]);
    let turfPoly2 = turf.polygon([
        getPolyCoords(poly2)
    ]);

    //Lage union eller intersect-poly
    let resultingPoly;
    if (op == "snitt") {
        resultingPoly = turf.intersect(turfPoly1, turfPoly2);
    }
    else if (op == "union") {
        resultingPoly = turf.union(turfPoly1, turfPoly2);
    }

    if (resultingPoly == null) {
        errorMsg.innerText = "Snittet finnes ikke";
        return
    }

    //Sletter sammenslåtte polygoner og lager resultatpolygonen
    deletePolygon(poly1);
    deletePolygon(poly2);
    createResultingPolygon(resultingPoly);
    changeState();
}

//Tar inn en turf-polygon og gir ut et vanlig polygon/multipolygon
function createResultingPolygon(turfPoly) {
    let latlngs = [];

    if (turfPoly.geometry.type == "MultiPolygon") {
        let coords = turfPoly.geometry.coordinates;
        for (let i = 0; i < coords.length; i++) {
            latlngs.push(coords[i][0]);
        }
    }

    else if (turfPoly.geometry.type == "Polygon") {
        latlngs = [turfPoly.geometry.coordinates[0]];
    }

    let poly = L.polygon(latlngs, { color: 'red', id: polyid++ });
    poly.addTo(map);
    polygons.push(poly);
    poly.on('click', select);
}

//Finner koordinatene til et polygon eller multipolygon
function getPolyCoords(poly) {
    let polyCoords = poly._latlngs;
    let latlngs = [];
    for (let i = 0; i < polyCoords.length; i++) {
        for (let j = 0; j < polyCoords[i].length; j++) {
            latlngs.push([polyCoords[i][j].lat, polyCoords[i][j].lng]);
        }
        //Polygoner må slutte på samme koordinater som den starter med
        if (latlngs[latlngs.length - 1] != latlngs[0]) {
            latlngs.push(latlngs[0]);
        }
    }
    return latlngs;
}

//Sletter polygon fra lister og kart
function deletePolygon(poly) {
    let iSelected = polyIndex(poly, selected);
    let iPolygons = polyIndex(poly, polygons);
    if (iSelected >= 0) {
        selected.splice(iSelected, 1);
    }
    if (iPolygons >= 0) {
        polygons.splice(iPolygons, 1);
    }
    map.removeLayer(poly);
}

function clearAll() {
    while (polygons.length > 0) {
        deletePolygon(polygons[0]);
    }
}

function stateToGeoJSON() {
    let geoj =
    {
        "type": "FeatureCollection",
        "features": []
    }
    polygons.forEach(function (poly) {
        geoj.features.push(poly.toGeoJSON());
    });
    return geoj;
}

//Laster inn defaultpolygonene
//loadDefaults(getDefaultPolygons);
function getDefaultPolygons() {
    var geoj = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {},
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [
                                -0.14007568359375,
                                51.5027589576403
                            ],
                            [
                                -0.12325286865234374,
                                51.5027589576403
                            ],
                            [
                                -0.12325286865234374,
                                51.512588580360244
                            ],
                            [
                                -0.14007568359375,
                                51.512588580360244
                            ],
                            [
                                -0.14007568359375,
                                51.5027589576403
                            ]
                        ]
                    ]
                }
            },
            {
                "type": "Feature",
                "properties": {},
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [
                                -0.1352691650390625,
                                51.50810140697543
                            ],
                            [
                                -0.11398315429687499,
                                51.50810140697543
                            ],
                            [
                                -0.11398315429687499,
                                51.51963895991333
                            ],
                            [
                                -0.1352691650390625,
                                51.51963895991333
                            ],
                            [
                                -0.1352691650390625,
                                51.50810140697543
                            ]
                        ]
                    ]
                }
            },
            {
                "type": "Feature",
                "properties": {},
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [
                                -0.13595581054687497,
                                51.49698840879303
                            ],
                            [
                                -0.11226654052734375,
                                51.49698840879303
                            ],
                            [
                                -0.11226654052734375,
                                51.50510971251776
                            ],
                            [
                                -0.13595581054687497,
                                51.50510971251776
                            ],
                            [
                                -0.13595581054687497,
                                51.49698840879303
                            ]
                        ]
                    ]
                }
            }
        ]
    }
    //flip lat-long
    let fs = geoj.features;
    for (let i = 0; i < fs.length; i++) {
        let coords = fs[i].geometry.coordinates[0];
        for (let j = 0; j < coords.length; j++) {
            let latlng = coords[j];
            let temp = latlng[1];
            latlng[1] = latlng[0];
            latlng[0] = temp;
        }
    }
    return geoj;
}

function init() {
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "http://localhost:8000/featurecollection", false);
    xhttp.send();
    console.log(JSON.parse(xhttp.responseText));
    loadDefaults(JSON.parse(xhttp.responseText));
}

function changeState() {
    let json = stateToGeoJSON();
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "http://localhost:8000/change", false);
    xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    json = jQuery.param(JSON.stringify(json));
    xhttp.send(json);
}

init();
//loadDefaults(getDefaultPolygons());