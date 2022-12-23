const connectToMongo = require('./database');
const express = require('express');
var cors = require('cors');

connectToMongo();
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Available routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));
// app.use('');

app.listen(port, () => {
	console.log(`App listening at http://localhost:${port}`);
});
