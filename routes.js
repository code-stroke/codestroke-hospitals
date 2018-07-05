const express = require('express');
const router = express.Router();
const fs = require('fs');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator/check')
const { matchedData } = require('express-validator/filter')

router.get('/', function (req, res) {
	res.render('form', {
		data: {},
		errors: {},
		registrationComplete: false,
		apiKey: process.env.GOOGLE_API_KEY
	});
});

function isValidJSON(text) {
	try {
        JSON.parse(text);
        return true;
    } catch (e) {
        return false;
    }
}

router.post('/', [
	check('hospital_name')
		.isLength({ min: 1})
		.withMessage('Hospital name is required')
		.trim(),
	check('hospital_city')
		.isLength({ min: 1})
		.withMessage('City is required')
		.trim(),
	check('hospital_state')
		.isLength({ min: 1})
		.withMessage('State is required')
		.trim(),
	check('hospital_coords')
		.isLatLong()
		.withMessage('Coordinates are required (lat,long)')
		.trim(),
	check('hospital_url')
		.isURL()
		.withMessage('URL is required')
		.trim()
], (request, response) => {
	const errors = validationResult(request);
	const storage_path = process.env.OPENSHIFT_DATA_DIR ? process.env.OPENSHIFT_DATA_DIR + '/': '';

	if (errors.isEmpty()) {
		const location_input = matchedData(request);

		fs.readFile('hospital_list.json', function (err, data) {
			var hospital_list = isValidJSON(data) ? JSON.parse(data) : [];
			hospital_list.push(location_input);
			fs.writeFile(storage_path  + 'hospital_list.json', JSON.stringify(hospital_list, null, 2), function (err) {
				if (err) throw err;
		  		console.log('Updated!');
			});
		})	
		response.render('form', {
			data: request.body,
			errors: errors.mapped(),
			registrationComplete: true,
			apiKey: process.env.GOOGLE_API_KEY
		});
	} else {
		response.render('form', {
			data: request.body,
			errors: errors.mapped(),
			registrationComplete: false,
			apiKey: process.env.GOOGLE_API_KEY
		});
	}
});

module.exports = router;