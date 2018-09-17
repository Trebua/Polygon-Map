'use strict';

const fs = require('fs');

module.exports = function (app, db) {

    //GET /featurecollection gir all data som er lagret
    app.get('/featurecollection', (req, res) => {
        let rawdata = fs.readFileSync('storage.json');
        let featurecollection = JSON.parse(rawdata);
        res.send(featurecollection);
    });

    //GET /default gir all data som er lagret
    app.get('/default', (req, res) => {
        let rawdata = fs.readFileSync('flipped.json');
        let featurecollection = JSON.parse(rawdata);
        res.send(featurecollection);
    });

    //POST til /change med en featurecollection erstatter tidligere data
    app.post('/change', function (req, res) {
        let json = deserialize(req.body);
        validateInput(json);
        fs.writeFile('storage.json', json, 'ascii');
        res.send("success");
    })

};

function deserialize(json) {
    let res = "";
    for (var key in json){
        res += json[key];
    }
    return res;
}

function validateInput(jsonString) {
    if (!IsJsonString(jsonString)) {
        throw "Wrong format";
    }
    try {
        let json = JSON.parse(jsonString);
        let features = json.features;
        for (let i = 0; i < features.length; i++) {
            let coords = features[i].geometry.coordinates;
            for (let j = 0; j < coords.length; j++) {
                let singlepoly = coords[j];
                if (singlepoly == undefined) {
                    throw "Wrong format";
                }
                if (singlepoly.length < 3) {
                    throw "Polygon must have 3 or more coordinates";
                }
            }
        }
    } catch(err) {

    }
}

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
