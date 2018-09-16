const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 8000

var cors = require('cors')

app.use(cors());



app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

require('./app/routes')(app);
app.listen(port, () => {
    console.log('We are live on ' + port);
});