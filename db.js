const MongoClient = require('mongodb').MongoClient;

const mongoClient = new MongoClient('mongodb://localhost:27017/', {useNewUrlParser: true, useUnifiedTopology: true});
mongoClient.connect();
global.collection = mongoClient.db('weather').collection('cities');

module.exports = {

    insertCity: (cityName) => {
        const collection = global.collection;
        return collection.find({name: cityName}).toArray().then((result) => {
            if (!result.length) {
                return collection.insertOne({name: cityName});
            } else {
                return false;
            }
        });
    },

    deleteCity: (cityName) => {
        const collection = global.collection;
        return collection.deleteOne({name: cityName});
    },

    extractCities: () => {
        const collection = global.collection;
        return collection.find({}).toArray().then(res => res.map((city) => city.name));
    }

};
