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
        let rawdata = fs.readFileSync('default.json');
        let featurecollection = JSON.parse(rawdata);
        res.send(featurecollection);
    });

    //POST til /change med en featurecollection erstatter tidligere data
    app.post('/change', function (req, res) {
        let json = deserialize(req.body);
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
