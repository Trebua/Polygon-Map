'use strict';

const fs = require('fs');

module.exports = function (app, db) {
    app.get('/featurecollection', (req, res) => {
        let rawdata = fs.readFileSync('storage.json');
        let featurecollection = JSON.parse(rawdata);
        res.send(featurecollection);
    });

    app.post('/change', function (req, res) {
        console.log(req);
        let json = JSON.stringify(req.body);
        fs.writeFile('storage.json', json, 'ascii');
        res.send(req.body);
    })

};
