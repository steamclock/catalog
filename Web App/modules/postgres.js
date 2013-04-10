var postgres = require('pg')
    , fs = require('fs')
    , config = require('./../modules/config').config;

var connectionString = "pg://" + config.postgres.username +":" + config.postgres.password +  "@" + config.postgres.baseurl + "/"+ config.postgres.dbname,
    client = new postgres.Client(connectionString);

client.connect(function(err) {
    // Just testing we can connect to the db for now
    client.query('SELECT NOW() AS "theTime"', function(err, result) {
      console.log("Postgres test output after client init: " + result.rows[0].theTime);
    })

    if (err) {
        console.log(err);
    } else {
        console.log("Postgres connected.");
    }
});

exports.client = client;




