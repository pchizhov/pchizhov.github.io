const chai = require('chai');
const chai_http = require('chai-http');
chai.use(chai_http);
const expect = require('chai').expect;
const mocha = require('mocha');
const sinon = require('sinon');
const afterEach = mocha.afterEach;
const beforeEach = mocha.beforeEach;
require('sinon-mongo');
const fetch = require('isomorphic-fetch');
const fetchMock = require('fetch-mock');
const describe = mocha.describe;
const it = mocha.it;
chai.should();
const JSDOM = require('jsdom').JSDOM;
global.windDirection = require('../utils').windDirection;
global.getIcon = require('../utils').getIcon;
global.sanitize = require('../utils').sanitize;

const serverBase = 'http://localhost:8080';

const html = `<head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="style.css">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Weather</title>
</head>
<body>
    <header>
        <section class="header-wrapper">
            <img src="images/logo.svg" alt="weather logo" class="logo">
            <h1>The Weather App</h1>
        </section>
    </header>
    <main>
        <section class="current-city">
            <div class="current-city-header">
                <h2>Weather here:</h2>
                <form method="get" name="refresh">
                    <input type="submit" value="Refresh location" class="refresh-submit">
                    <button class="refresh-button">↺</button>
                </form>
            </div>
            <div class="current-city-main"></div>
        </section>
        <section class="favourites">
            <div class="favourites-header">
                <h2>Favourites</h2>
                <form method="get" name="add_city">
                    <label for="new_city">Add city</label>
                    <input type="text" id="new_city" name="new_city" required>
                    <input type="submit" value="Add">
                </form>
            </div>
            <ul class="favourites-main"></ul>
        </section>
    </main>
</body>`;

const lisiyNosResponse = {
    temp: 0,
    place: 'Lisiy Nos',
    windSpeed: 5.0,
    windDir: 127,
    clouds: 95,
    pressure: 1013,
    humidity: 65,
    lat: 60.,
    lon: 30.
};

const moscowResponse = {
    temp: 0,
    place: 'Moscow',
    windSpeed: 5.0,
    windDir: 127,
    clouds: 95,
    pressure: 1013,
    humidity: 65,
    lat: 60.,
    lon: 30.
};

const lisiyNosUl = `<li class="weather-data-line">
                <p class="weather-data-title">Wind</p>
                <p class="weather-data-value">5 m/s, Southeast</p>
            </li>
            <li class="weather-data-line">
                <p class="weather-data-title">Cloudiness</p>
                <p class="weather-data-value">95%</p>
            </li>
            <li class="weather-data-line">
                <p class="weather-data-title">Pressure</p>
                <p class="weather-data-value">1013 hpa</p>
            </li>
            <li class="weather-data-line">
                <p class="weather-data-title">Humidity</p>
                <p class="weather-data-value">65%</p>
            </li>
            <li class="weather-data-line">
                <p class="weather-data-title">Coordinates</p>
                <p class="weather-data-value">[60, 30]</p>
            </li>`;

const lisiyNosCity = `<div class="city-header">
                             <h3 class="city-name">Lisiy Nos</h3>
                             <p class="temperature">0˚C</p>
                             <img class="weather-picture" src="images/weather/cloudy.svg" alt="cloudy icon">
                             <button class="close" onclick="removeCity('Lisiy Nos');">×</button>
                         </div>
                         <ul class="city-main">
                             ${lisiyNosUl}
                         </ul>`;

const lisiyNosCurrent = `
            <div class="current-city-main-info">
                <h3 class="city-name">Lisiy Nos</h3>
                <p class="current-city-temperature">0˚C</p>
                <img class="current-city-weather-picture" src="images/weather/cloudy.svg">
            </div>
            <ul class="current-city-main-ul">
                ${lisiyNosUl}
            </ul>`;

const cityLoader = `<div class="lds-dual-ring"></div>`;

window = new JSDOM(html).window;
document = window.document;
let client = require('../client');
global.window = window;
window.alert = sinon.spy();
global.document = window.document;
global.navigator = {
    userAgent: 'node.js'
};
global.fetch = fetch;
global.alert = window.alert;
global.FormData = window.FormData;

const geolocate = require('mock-geolocation');
geolocate.use();
client.init();

describe('requestWeather function', () => {

    beforeEach(() => {
        fetchMock.get(`${serverBase}/favourites`, []);
    });

    afterEach(() => {
        fetchMock.reset();
        fetchMock.restore();
    });

    it('should get response for city name', (done) => {
        fetchMock.once(`${serverBase}/weather/city?q=Lisiy Nos`, lisiyNosResponse);
        client.requestWeather('city', ['q=Lisiy Nos']).then((result) => {
            expect(result).to.be.eql(lisiyNosResponse);
            done()
        });
    });

    it('should get response for city coordinates', (done) => {
        fetchMock.once(`${serverBase}/weather/coordinates?lat=60&lon=30`, lisiyNosResponse);
        client.requestWeather('coordinates', ['lat=60', 'lon=30']).then((result) => {
            expect(result).to.be.eql(lisiyNosResponse);
            done()
        });
    });

    it('should get alert for wrong city name', (done) => {
        alert = sinon.spy();
        fetchMock.once(`${serverBase}/weather/city?q=xxx`, 404);
        client.requestWeather('city', ['q=xxx']).then((res) => {
            expect(alert.calledOnce).to.be.true;
            done();
        });
    });

    it('should get alert for server error', (done) => {
        alert = sinon.spy();
        fetchMock.once(`${serverBase}/weather/city?q=Lisiy Nos`, 503);
        client.requestWeather('city', ['q=Lisiy Nos']).then((res) => {
            expect(alert.calledOnce).to.be.true;
            done();
        });
    });

});

describe('current city section', () => {

    afterEach(() => {
        fetchMock.done();
        fetchMock.restore();
    });

    it('should fill current city loader', (done) => {
        client.fillCurrentCityLoader();
        const loader = document.getElementsByClassName('current-city-main')[0];
        loader.innerHTML.should.be.eql(cityLoader);
        done()
    });

    it('should fill current city', (done) => {
        fetchMock.once(`${serverBase}/weather/coordinates?lat=60&lon=30`, lisiyNosResponse);
        client.fillCurrentCity('coordinates', ['lat=60', 'lon=30']).then((res) => {
            const currentCity = document.getElementsByClassName('current-city-main')[0];
            currentCity.innerHTML.should.be.eql(lisiyNosCurrent);
            done();
        });
    });

});

describe('favourites section', () => {

    afterEach(() => {
        fetchMock.reset();
        fetchMock.restore();
    });

    it('should append city loader', (done) => {
        client.appendCityLoader();
        const loader = document.getElementsByClassName('favourites-main')[0].lastChild;
        expect(loader.className).to.be.eql('city');
        expect(loader.innerHTML).to.be.eql(cityLoader);
        done();
    });

    it('should fill city ul', (done) => {
        const cityUl = client.fillCityUl(lisiyNosResponse);
        expect(cityUl).to.be.eql(lisiyNosUl);
        done();
    });

    it('should append favourite city', (done) => {
        const children = document.getElementsByClassName('city').length;
        let newCity = client.appendCityLoader();
        client.appendCity(lisiyNosResponse, newCity);
        const lastCity = document.getElementsByClassName('favourites-main')[0].lastChild;
        lastCity.innerHTML.should.be.eql(lisiyNosCity);
        document.getElementsByClassName('city').length.should.be.eql(children + 1);
        done();
    });

    it('should delete favourite city', (done) => {
        const children = document.getElementsByClassName('city').length;
        const lastCityID = document.getElementsByClassName('favourites-main')[0].lastChild.id;
        client.removeCity('Lisiy Nos');
        document.getElementsByClassName('city').length.should.be.eql(children - 1);
        expect(document.getElementById(lastCityID)).to.be.eql(null);
        done();
    });

    it('should add new city', (done) => {
        fetchMock.once(`${serverBase}/weather/city?q=Lisiy Nos`, lisiyNosResponse);
        fetchMock.post(`${serverBase}/favourites`, 200);
        let form = document.forms.namedItem('add_city');
        form.getElementsByTagName('input')[0].value = 'Lisiy Nos';
        client.addNewCity().then((res) => {
            document.getElementsByClassName('favourites-main')[0].lastChild.innerHTML.should.be.eql(lisiyNosCity);
            done();
        });
    });

    it('should not add city twice', (done) => {
        alert = sinon.spy();
        fetchMock.once(`${serverBase}/weather/city?q=Lisiy Nos`, lisiyNosResponse);
        fetchMock.post(`${serverBase}/favourites`, 208);
        let form = document.forms.namedItem('add_city');
        form.getElementsByTagName('input')[0].value = 'Lisiy Nos';
        client.addNewCity().then((res) => {
            expect(alert.calledOnce).to.be.true;
            done();
        });
    });

    it('should alert if error', (done) => {
        alert = sinon.spy();
        fetchMock.once(`${serverBase}/weather/city?q=Lisiy Nos`, lisiyNosResponse);
        fetchMock.post(`${serverBase}/favourites`, 503);
        let form = document.forms.namedItem('add_city');
        form.getElementsByTagName('input')[0].value = 'Lisiy Nos';
        client.addNewCity().then((res) => {
            expect(alert.calledOnce).to.be.true;
            done();
        });
    });

});
