const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const server = require('http').Server(app);
const port = 8080;
const helmet = require('helmet');
const fetch = require('node-fetch');

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');
    next();
});

app.options('*', function(req, res) {
    res.send(200);
});

app.get('/', (req, res) => {
    res.send('');
});

app.get('/weather/city', (req, res) => {
    const query = req.query;
    requestWeather(query).then(r => res.send(r));
});

app.get('/weather/coordinates', (req, res) => {
    const query = req.query;
    requestWeather(query).then(r => res.send(r));
});

app.post('/favourites', (req, res) => {

});

app.delete('/favourites', (req, res) => {

});

server.listen(port, (err) => {
    if (err) {
        throw err;
    }
    /* eslint-disable no-console */
    console.log('Node Endpoints working :)');
});

module.exports = server;

function requestWeather(queryParams) {
    const base = 'https://api.openweathermap.org/data/2.5/weather';
    let params = Object.keys(queryParams).map(key => `${key}=${queryParams[key]}`);
    params.push('units=metric');
    params.push('appid=f80f663722c0d3dd6beacd446c31524a');
    const url = base + '?' + params.join('&');
    return fetch(url).then((response) => {
        console.log(response);
        if (response.ok) {
            return response.json();
        } else {
            console.log('Something went wrong: cannot find this place');
        }
    }).catch(() => {
        console.log('Your connection was lost, sorry');
    });
}
