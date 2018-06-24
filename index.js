const express = require('express');
const app = express();
const routes = require('./routes')

const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator/check')
const { matchedData } = require('express-validator/filter')

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.json());

app.use('/', routes);

app.use((req, res, next) => {
  res.status(404).send("Sorry, can't find that!")
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

app.listen(8000, function () {
	console.log('Hospital location input listening on port 8000');
});