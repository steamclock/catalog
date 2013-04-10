var fs = require('fs')
    , rawData = fs.readFileSync('./config/config.json');

try {
    config = JSON.parse(rawData);
} catch (err) {
    console.log('There has been an error parsing the config file.')
    console.log(err);
} 

exports.config = config;