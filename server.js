const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const server = require('http').Server(app);
const port = 8080;
const helmet = require('helmet');
require('isomorphic-fetch');
const cors = require('cors');
const db = require('./db');

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');
    next();
});

const corsOptions = {
    origin: 'http://localhost:63342',
    optionsSuccessStatus: 200
};

app.use(cors());

app.get('/', (req, res) => {
    res.sendStatus(200);
});

function reply(query, res) {
    requestWeather(query).then((result) => {
        if (result.hasOwnProperty('error')) {
            res.sendStatus(result.error);
        } else {
            res.send(processResponse(result));
        }
    });
}

app.get('/weather/city', (req, res) => {
    reply(req.query, res);
});

app.get('/weather/coordinates', (req, res) => {
    reply(req.query, res);
});

app.get('/favourites', (req, res) => {
    db.extractCities().then((result) => {
        res.send({cities: result});
    }).catch((err) => {
        res.sendStatus(503);
    })
});

app.post('/favourites', (req, res) => {
    db.insertCity(req.body.name).then((result) => {
        if (result) {
            res.sendStatus(200);
        } else {
            res.sendStatus(208);
        }
    });
});

app.delete('/favourites', (req, res) => {
    db.deleteCity(req.body.name).then((result) => {
        res.sendStatus(200);
    });
});

server.listen(port, (err) => {
    if (err) {
        throw err;
    }
    /* eslint-disable no-console */
    console.log('Node Endpoints working :)');
});

module.exports = server;

function processResponse(jsonResponse) {
    return {
        temp: Math.floor(jsonResponse.main.temp),
        place: jsonResponse.name,
        windSpeed: jsonResponse.wind.speed,
        windDir: jsonResponse.wind.deg,
        clouds: jsonResponse.clouds.all,
        pressure: jsonResponse.main.pressure,
        humidity: jsonResponse.main.humidity,
        lat: jsonResponse.coord.lat,
        lon: jsonResponse.coord.lon
    }
}


function requestWeather(queryParams) {
    const base = 'https://api.openweathermap.org/data/2.5/weather';
    let params = Object.keys(queryParams).map(key => `${key}=${queryParams[key]}`);
    params.push('units=metric');
    params.push('appid=f80f663722c0d3dd6beacd446c31524a');
    const url = base + '?' + params.join('&');
    return fetch(url).then((response) => {
        if (response.ok) {
            return response.json();
        } else {
            return {error: 404};
        }
    }).catch(() => {
        return {error: 503};
    });
}

module.exports.requestWeather = requestWeather;
