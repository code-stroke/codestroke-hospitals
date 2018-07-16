const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator/check')
const { matchedData } = require('express-validator/filter')

const storage_path = process.env.OPENSHIFT_DATA_DIR ? process.env.OPENSHIFT_DATA_DIR + '/': __dirname;

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

function createHospitalList() {
	var hospital_list = [{ highest_assigned_id: 0 }];

	fs.writeFile(path.join(storage_path, 'hospital_list.json'), JSON.stringify(hospital_list, null, 2), function (err) {
		if (err) throw err;
  		console.log('New hospital list created.');
	});
}

function appendHospitalList(data, location_input) {
	var hospital_list = JSON.parse(data);
	location_input.hospital_id = hospital_list[0].highest_assigned_id + 1;
	hospital_list[0].highest_assigned_id++;
	hospital_list.push(location_input);

	fs.writeFile(path.join(storage_path, 'hospital_list.json'), JSON.stringify(hospital_list, null, 2), function (err) {
		if (err) throw err;
  		console.log('Hospital added to list.');
	});
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

	if (errors.isEmpty()) {
		const location_input = matchedData(request);

		fs.readFile(path.join(storage_path, 'hospital_list.json'), function (err, data) {
			if (isValidJSON(data)) {
				appendHospitalList(data, location_input);
			} else {
				createHospitalList();

				fs.readFile(path.join(storage_path, 'hospital_list.json'), function (err, data) {
					appendHospitalList(data, location_input);
				});
			}
		});

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

router.get('/hospital_list.json', function (req, res) {
	res.sendFile(path.join(storage_path,  'hospital_list.json'))
});

module.exports = router;
