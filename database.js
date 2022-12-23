const mongoose = require('mongoose');

const mongoUri = 'mongodb://localhost:27017/spidernotes';

const connectToMongo = () => {
	mongoose.connect(mongoUri, () => {
		console.log('Connected to Mongose Database Successfully');
	});
};

module.exports = connectToMongo;
