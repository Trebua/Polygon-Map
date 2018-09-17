const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 8000
var cors = require('cors')

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    parameterLimit: 100000,
    limit: '50mb',
    extended: true
  }));

require('./app/routes')(app);
app.listen(port, () => {
    console.log('We are live on ' + port);
});