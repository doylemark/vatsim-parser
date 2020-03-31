const apiReference = require('./data/apiReference.json');
const {callsign, cid, ...rest} = apiReference;
const fs = require('fs');

require.extensions['.txt'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

const txtData = require('./vatsim-data.txt');


const parseData = (fetchedData) => {
  const clientsHeader = '!CLIENTS:'
  fetchedData = fetchedData.slice(fetchedData.indexOf(clientsHeader) + clientsHeader.length);
  fetchedData = fetchedData.slice(0, fetchedData.indexOf(';\r\n'));
  const splitRawData = fetchedData.split('\r\n');

  const parsedData = [];
  const timestamp = Date.now();

  for (const string of splitRawData) {
    let splitData = string.split(':');
    if(splitData[3] === 'PILOT') {
      const aircraft = {
        type: 'pilot',
        callsign: splitData[callsign],
        cid: Number(splitData[cid]),
        name: splitData[rest.name],
        aircraftType: splitData[rest.aircraftType],
        latitude: Number(splitData[rest.latitude]),
        longitude: Number(splitData[rest.longitude]),
        heading: Number(splitData[rest.heading]),
        altitude: Number(splitData[rest.altitude]),
        groundSpeed: Number(splitData[rest.groundSpeed]),
        logon: Number(splitData[rest.logon]),
        flightplan: {
          departure: splitData[rest.departure],
          arrival: splitData[rest.arrival],
          altitude: Number(splitData[rest.altitude]),
        },
        timestamp
      }
      parsedData.push(aircraft);
    } else if(splitData[3]  === 'ATC') {
      const controller = {
        type: 'controller',
        callsign: splitData[callsign],
        cid: splitData[cid],
        name: splitData[rest.name],
        frequency: splitData[rest.frequency],
        timestamp
      }
      parsedData.push(controller);
    }
  }

  fs.writeFile('parseddata.json', JSON.stringify(parsedData), function (err) {
    if (err) return console.log(err);
  });

  return parsedData;
}

parseData(txtData);