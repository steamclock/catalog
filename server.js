/* 
 * Catalog Curation Server
 */


// Express Setup
console.log("Setting up app...");
var express = require('express');
var app = express();

//Postgres Setup

var postgres = require('pg');
//Just some dumb u/p for now
var connectionString = "pg://postgres:apple@localhost:5432/emilycarr";
var client = new postgres.Client(connectionString);
client.connect(function(err) {

    // Just testing we can connect to the db for now
    client.query('SELECT NOW() AS "theTime"', function(err, result) {
      console.log(result.rows[0].theTime);
    })

    if (err) {
        console.log(err);
    }
});

app.get('/hello.txt', function(req, res){
  res.send('Hello World');
});

app.listen(3000);
console.log('Listening on port 3000');






