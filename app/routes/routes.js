'use strict';

const fs = require('fs');

module.exports = function (app, db) {
    app.get('/featurecollection', (req, res) => {
        let rawdata = fs.readFileSync('storage.json');
        let featurecollection = JSON.parse(rawdata);
        res.send(featurecollection);
    });

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
