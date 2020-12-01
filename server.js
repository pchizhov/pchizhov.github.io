const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const server = require('http').Server(app);
const port = 8080;
const helmet = require('helmet');
const fetch = require('node-fetch');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;

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

app.get('/', cors(corsOptions), (req, res) => {
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

app.get('/weather/city', cors(corsOptions), (req, res) => {
    reply(req.query, res);
});

app.get('/weather/coordinates', cors(corsOptions), (req, res) => {
    reply(req.query, res);
});

app.get('/favourites', cors(corsOptions), (req, res) => {
    extractCities().then((result) => {
        res.send({cities: result.map(elem => elem.name)});
    }).catch((err) => {
        res.sendStatus(503);
    })
});

app.post('/favourites', cors(corsOptions), (req, res) => {

});

app.delete('/favourites', cors(corsOptions), (req, res) => {

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

const mongoClient = new MongoClient('mongodb://localhost:27017/', {useNewUrlParser: true, useUnifiedTopology: true});
mongoClient.connect();
const collection = mongoClient.db('weather').collection('cities');

function insertCity(cityName) {
    return collection.find({name: cityName}).toArray().then((result) => {
        if (!result.length) {
            return collection.insertOne({name: cityName})
        }
    });
}

function deleteCity(cityName) {
    return collection.deleteOne({name: cityName});
}

function extractCities() {
    return collection.find({}).toArray()
}