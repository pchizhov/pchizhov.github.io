const chai = require('chai');
const chai_http = require('chai-http');
chai.use(chai_http);
const mocha = require("mocha");
const describe = mocha.describe;
const it = mocha.it;
chai.should();

const server = require('../server');

describe('city name weather', () => {
    it('should return response for correct city', (done) => {
        chai.request(server).get('/weather/city?q=Moscow').end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('object');
            res.body.should.have.own.property('temp');
            res.body.should.have.own.property('place').eql('Moscow');
            res.body.should.have.own.property('windSpeed');
            res.body.should.have.own.property('windDir');
            res.body.should.have.own.property('clouds');
            res.body.should.have.own.property('pressure');
            res.body.should.have.own.property('humidity');
            res.body.should.have.own.property('lat');
            res.body.should.have.own.property('lon');
            done();
        });
    });
    it('should be case-insensitive', (done) => {
        chai.request(server).get('/weather/city?q=moscow').end((err, res) => {
            res.should.have.status(200);
            res.body.should.have.own.property('place').eql('Moscow');
            done();
        });
    });
    it('should return 404 for incorrect city', (done) => {
        chai.request(server).get('/weather/city?q=Moskow').end((err, res) => {
            res.should.have.status(404);
            done();
        });
    });
});

describe('coordinates weather', () => {
    it('should return response for correct coordinates', (done) => {
        chai.request(server).get('/weather/coordinates?lat=60&lon=30').end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('object');
            res.body.should.have.own.property('temp');
            res.body.should.have.own.property('place').eql('Lisiy Nos');
            res.body.should.have.own.property('windSpeed');
            res.body.should.have.own.property('windDir');
            res.body.should.have.own.property('clouds');
            res.body.should.have.own.property('pressure');
            res.body.should.have.own.property('humidity');
            res.body.should.have.own.property('lat');
            res.body.should.have.own.property('lon');
            done();
        });
    });
    it('should return 404 for incorrect coordinates', (done) => {
        chai.request(server).get('/weather/coordinates?lat=2000&lon=0').end((err, res) => {
            res.should.have.status(404);
            done();
        });
    });
});

describe('favorites', () => {
    it('should return favourite cities', (done) => {
        chai.request(server).get('/favourites').end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('object');
            res.body.should.have.own.property('cities');
            done();
        });
    });
    it('should delete city', (done) => {
        chai.request(server).delete('/favourites').send({city: 'Tokyo'}).end((err, res) => {
            res.should.have.status(200);
            done();
        });
    });
    it('should add new city', (done) => {
        chai.request(server).post('/favourites').send({city: 'Tokyo'}).end((err, res) => {
            res.should.have.status(200);
            done();
        });
    });
    it('should not add new city twice', (done) => {
        chai.request(server).post('/favourites').send({city: 'Tokyo'}).end((err, res) => {
            res.should.have.status(208);
            done();
        });
    })
});
