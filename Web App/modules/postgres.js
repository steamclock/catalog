var postgres = require('pg')
    , fs = require('fs')
    , config = require('./../modules/config').config;

var client = new postgres.Client(config.postgres);

client.connect(function(err) {
    // Just testing we can connect to the db for now
    client.query('SELECT NOW() AS "theTime"', function(err, result) {
      console.log("Postgres test output after client init: " + result.rows[0].theTime);
    })

    if (err) {
        console.log('Error connecting to postgres');
        console.log(err);
    } else {
        console.log("Postgres connected.");
    }
});

exports.client = client;




