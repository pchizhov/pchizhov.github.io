const chai = require('chai');
const chai_http = require('chai-http');
chai.use(chai_http);
const mocha = require("mocha");
const sinon = require('sinon');
require('sinon-mongo');
const afterEach = mocha.afterEach;
const beforeEach = mocha.beforeEach;
require('isomorphic-fetch');
const fetchMock = require('fetch-mock');
const describe = mocha.describe;
const it = mocha.it;
chai.should();

const server = require('../server');
const db = require('../db');

const weatherApiBase = 'https://api.openweathermap.org/data/2.5/weather';
const weatherApiEnd = 'units=metric&appid=f80f663722c0d3dd6beacd446c31524a';

const lisiyNosWeather = {
    name: 'Lisiy Nos',
    wind: {
        speed: 5.0,
        deg: 127
    },
    clouds: {
        all: 95
    },
    main: {
        temp: 0.1,
        pressure: 1013,
        humidity: 65
    },
    coord: {
        lat: 60.,
        lon: 30.
    }
};

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

describe('mongo db queries', () => {

    let mockCollection;

    beforeEach(() => {
        mockCollection = sinon.mongo.collection();
        global.collection = mockCollection;
    });

    it('should return favourite cities', (done) => {
        const docArray = [
            {_id: '1', name: 'Moscow'},
            {_id: '2', name: 'Paris'}
        ];
        const resultArray = ['Moscow', 'Paris'];
        mockCollection.find
            .withArgs({})
            .returns(sinon.mongo.documentArray(docArray));
        db.extractCities().then((response) => {
            response.should.be.an('array');
            response.should.be.eql(resultArray);
            sinon.assert.calledOnce(mockCollection.find);
            done();
        });
    });

    it('should insert city', (done) => {
        mockCollection.find
            .withArgs({name: 'Toronto'})
            .returns(sinon.mongo.documentArray([]));
        mockCollection.insertOne
            .withArgs({name: 'Toronto'})
            .resolves();
        db.insertCity('Toronto').then(() => {
            sinon.assert.calledOnce(mockCollection.find);
            sinon.assert.calledOnce(mockCollection.insertOne);
            sinon.verify();
            done();
        })
    });

    it('should not insert twice', (done) => {
        mockCollection.find
            .withArgs({name: 'Toronto'})
            .returns(sinon.mongo.documentArray([{_id: '123', name: 'Toronto'}]));
        mockCollection.insertOne
            .withArgs({name: 'Toronto'})
            .resolves();
        db.insertCity('Toronto').then(() => {
            sinon.assert.calledOnce(mockCollection.find);
            sinon.assert.notCalled(mockCollection.insertOne);
            sinon.verify();
            done();
        })
    });

    it('should delete city', (done) => {
        mockCollection.deleteOne
            .withArgs({name: 'Toronto'})
            .resolves();
        db.deleteCity('Toronto').then(() => {
            sinon.assert.calledOnce(mockCollection.deleteOne);
            sinon.verify();
            done();
        })
    });

});

describe('requestWeather function', () => {

    afterEach(() => {
        fetchMock.reset();
        fetchMock.restore();
    });

    it('should return response for correct city', (done) => {
        fetchMock.once(`${weatherApiBase}?q=Lisiy Nos&${weatherApiEnd}`, lisiyNosWeather);
        server.requestWeather({q: 'Lisiy Nos'}).then((res) => {
            res.should.be.an('object');
            res.should.be.eql(lisiyNosWeather);
            done();
        });
    });

    it('should be case insensitive', (done) => {
        fetchMock.once(`${weatherApiBase}?q=lisiy nos&${weatherApiEnd}`, lisiyNosWeather);
        server.requestWeather({q: 'lisiy nos'}).then((res) => {
            res.should.be.an('object');
            res.should.be.eql(lisiyNosWeather);
            done();
        });
    });

    it('should result in 404 for incorrect city', (done) => {
        fetchMock.once(`${weatherApiBase}?q=www&${weatherApiEnd}`, 404);
        server.requestWeather({q: 'www'}).then((res) => {
            res.should.be.an('object');
            res.should.be.eql({error: 404});
            done();
        });
    });

    it('should result in 503 for server error', (done) => {
        fetchMock.once(`${weatherApiBase}?q=www&${weatherApiEnd}`, {throws: new Error()});
        server.requestWeather({q: 'www'}).then((res) => {
            res.should.be.an('object');
            res.should.be.eql({error: 503});
            done();
        });
    });

});

describe('city name weather', () => {

    afterEach(() => {
        fetchMock.reset();
        fetchMock.restore();
    });

    it('should return response for correct city', (done) => {
        fetchMock.once(`${weatherApiBase}?q=Lisiy Nos&${weatherApiEnd}`, lisiyNosWeather);
        chai.request(server).get('/weather/city?q=Lisiy Nos').end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('object');
            res.body.should.eql(lisiyNosResponse);
            done();
        });
    });

    it('should return 404 for incorrect city', (done) => {
        fetchMock.once(`${weatherApiBase}?q=Moskow&${weatherApiEnd}`, 404);
        chai.request(server).get('/weather/city?q=Moskow').end((err, res) => {
            res.should.have.status(404);
            done();
        });
    });

});

describe('coordinates weather', () => {

    afterEach(() => {
        fetchMock.reset();
        fetchMock.restore();
    });

    it('should return response for correct coordinates', (done) => {
        fetchMock.once(`${weatherApiBase}?lat=60&lon=30&${weatherApiEnd}`, lisiyNosWeather);
        chai.request(server).get('/weather/coordinates?lat=60&lon=30').end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('object');
            res.body.should.eql(lisiyNosResponse);
            done();
        });
    });

    it('should return 404 for incorrect coordinates', (done) => {
        fetchMock.once(`${weatherApiBase}?lat=2000&lon=0&${weatherApiEnd}`, 404);
        chai.request(server).get('/weather/coordinates?lat=2000&lon=0').end((err, res) => {
            res.should.have.status(404);
            done();
        });
    });

});

describe('favorites', () => {

    let mockCollection;

    beforeEach(() => {
        mockCollection = sinon.mongo.collection();
        global.collection = mockCollection;
    });

    it('should return favourite cities', (done) => {
        const docArray = [
            {_id: '1', name: 'Moscow'},
            {_id: '2', name: 'Paris'}
        ];
        const resultArray = ['Moscow', 'Paris'];
        mockCollection.find
            .withArgs({})
            .returns(sinon.mongo.documentArray(docArray));
        chai.request(server).get('/favourites').end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('object');
            res.body.should.have.own.property('cities');
            res.body.cities.should.be.eql(resultArray);
            sinon.assert.calledOnce(mockCollection.find);
            done();
        });
    });

    it('should delete city', (done) => {
        mockCollection.deleteOne
            .withArgs({name: 'Tokyo'})
            .resolves();
        chai.request(server).delete('/favourites').send({name: 'Tokyo'}).end((err, res) => {
            res.should.have.status(200);
            sinon.assert.calledOnce(mockCollection.deleteOne);
            done();
        });
    });

    it('should add new city', (done) => {
        mockCollection.find
            .withArgs({name: 'Tokyo'})
            .returns(sinon.mongo.documentArray([]));
        mockCollection.insertOne
            .withArgs({name: 'Tokyo'})
            .resolves(true);
        chai.request(server).post('/favourites').send({name: 'Tokyo'}).end((err, res) => {
            res.should.have.status(200);
            sinon.assert.calledOnce(mockCollection.find);
            sinon.assert.calledOnce(mockCollection.insertOne);
            done();
        });
    });

    it('should not add new city twice', (done) => {
        mockCollection.find
            .withArgs({name: 'Tokyo'})
            .returns(sinon.mongo.documentArray([{_id: '123', name: 'Tokyo'}]));
        mockCollection.insertOne
            .withArgs({name: 'Tokyo'})
            .resolves();
        chai.request(server).post('/favourites').send({name: 'Tokyo'}).end((err, res) => {
            res.should.have.status(208);
            sinon.assert.calledOnce(mockCollection.find);
            sinon.assert.notCalled(mockCollection.insertOne);
            done();
        });
    });

});
