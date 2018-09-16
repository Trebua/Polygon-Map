
function connectToDB() {
  const sqlite3 = require('sqlite3').verbose();
  let db = new sqlite3.Database('data.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Connected to the in-memory SQlite database.');
  });
  return db;
}

function closeDB(db) {
  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Close the database connection.');
  });
}

function createTables() {
  let db = connectToDB();
  console.log("Connected!");

  var sql = "CREATE TABLE Polygons (ID INT NOT NULL PRIMARY KEY)";
  db.run(sql, function (err, result) {
    if (err) throw err;
    console.log(result);
  });

  var sql = "CREATE TABLE Coordinates (Lat FLOAT, Lng FLOAT, PolygonID INT, FOREIGN KEY (PolygonID) REFERENCES Polygon(ID))";
  db.run(sql, function (err, result) {
    if (err) throw err;
    console.log(result);
  });
}

function insertCoordinates(lat, lng, polyid) {
  let db = connectToDB();
  let sql = "INSERT INTO Coordinates VALUES (?,?,?)";
  let values = [
    [lat,lng,polyid],
  ];
  db.run(sql, [values], function(err) {
    if (err) { return console.log(err.message); }
    console.log(values + " was inserted");
  });
}

function insertPolygon(id) {
  let db = connectToDB();
  db.run("INSERT INTO Polygons VALUES(?)", [id], function(err) {
    if (err) { return console.log(err.message); }
    console.log(id + " was inserted");
  });
}

function getEverything(table, promise) {
  let db = connectToDB();
  let sql = "SELECT * FROM " + table;
  db.all(sql, [], (err, rows) => {
    if (err) { throw err; }
    promise(rows);
  });
}

function resolver(data) {
  new Promise(function(resolve, reject) {
      return data;
      resolve(data);
  });
}

//c();
//createTables();

//insertPolygon(1);
//insertPolygon(2);

//insertCoordinates(50.232,0.00023214, 1);
let json = getEverything("Coordinates", resolver);
console.log(json);