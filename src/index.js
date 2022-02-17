var instance_skel = require('../../../instance_skel')
var actions = require('./actions.js')
var presets = require('./presets.js')
var feedbacks = require('./feedbacks.js')
var variables = require('./variables.js')

var httpClient = require('urllib');

var debug;

instance.prototype.CHOICES_OUTLETS = [
	{id: '1', label: 'Outlet 1'},
	{id: '2', label: 'Outlet 2'},
	{id: '3', label: 'Outlet 3'},
	{id: '4', label: 'Outlet 4'},
	{id: '5', label: 'Outlet 5'},
	{id: '6', label: 'Outlet 6'},
	{id: '7', label: 'Outlet 7'},
	{id: '8', label: 'Outlet 8'}
];

instance.prototype.outlets = [];

instance.prototype.INTERVAL = null;

// ########################
// #### Instance setup ####
// ########################
function instance(system, id, config) {
	let self = this

	// super-constructor
	instance_skel.apply(this, arguments)

	return self
}

instance.GetUpgradeScripts = function () {
}

// When module gets deleted
instance.prototype.destroy = function () {
	let self = this;

	if (self.INTERVAL) {
		clearInterval(self.INTERVAL);
		self.INTERVAL = null;
	}

	debug('destroy', self.id)
}

// Initalize module
instance.prototype.init = function () {
	let self = this

	debug = self.debug
	log = self.log

	self.status(self.STATUS_WARNING, 'connecting')

	self.init_outlets(8);
	self.init_outletdata(8);
	self.getOutletData();
	self.setupInterval();

	self.actions() // export actions
	self.init_presets()
	self.init_variables()
	self.checkVariables()
	self.init_feedbacks()
	self.checkFeedbacks()
};

// Update module after a config change
instance.prototype.updateConfig = function (config) {
	let self = this
	self.config = config
	self.status(self.STATUS_WARNING, 'connecting')

	self.init_outlets(8);
	self.init_outletdata(8);
	self.getOutletData();
	self.setupInterval();

	self.actions() // export actions
	self.init_presets()
	self.init_variables()
	self.checkVariables()
	self.init_feedbacks()
	self.checkFeedbacks()
};

instance.prototype.init_outlets = function(count) {
	let self = this;

	let outletCount = count;

	if ((outletCount <= 0) || (outletCount === 'NaN')) {
		outletCount = 8;
	}

	self.CHOICES_OUTLETS = [];

	for (let i = 0; i < outletCount; i++) {
		let outletObj = {};
		outletObj.id = i+1;
		outletObj.label = 'Outlet ' + (i+1);
		self.CHOICES_OUTLETS.push(outletObj);
	}
};

instance.prototype.init_outletdata = function(count) {
	let self = this;

	let outletCount = count;

	if ((outletCount <= 0) || (outletCount === 'NaN')) {
		outletCount = 8;
	}

	self.outlets = [];

	for (let i = 0; i < outletCount; i++) {
		let outletObject = {};
		outletObject.outletState = '';
		outletObject.outletName = 'Outlet ' + (i+1);
		self.outlets.push(outletObject);
	}
}

instance.prototype.getOutletData = function () {
	let self = this;

	if (self.config.host) {
		self.getOutletStates();
	}
};

instance.prototype.getOutletStates = function() {
	let self = this;

	let protocol = 'http://';

	if (self.config.secure) {
		protocol = 'https://';
	}

	let url = `${protocol}${self.config.host}/restapi/relay/outlets/all;/physical_state/`;

	let username = self.config.username;
	let password = self.config.password;
	
	let options = {
		method: 'GET',
		rejectUnauthorized: false,
		auth: `${username}:${password}`,
		headers: {
			'Accept': 'application/json'
		}
	};

	httpClient.request(url, options, (err, data, res) => {
		if (err) {
			self.status(self.STATUS_ERROR);
			let showSpecific = false;
			Object.keys(err).forEach(function(key) {
				if (key === 'code') {
					if (err[key] === 'ECONNREFUSED') {
						self.log('error', 'Unable to get Outlet States. Connection refused. Is this the right IP address?');
						showSpecific = true;
					}
				}
			});

			if (!showSpecific) {
				self.log('error', err.toString());
			}

			self.stopInterval();

			return;
		}

		self.status(self.STATUS_OK);

		self.processOutletStates(data);

		self.getOutletNames();

		self.actions() // export actions
		self.init_presets();
		self.init_variables();
		self.init_feedbacks();
		self.checkVariables();
		self.checkFeedbacks();
	});
};

instance.prototype.processOutletStates = function (data) {
	//save the states into the local data array

	let self = this;
	
	try {
		let jsonData = JSON.parse(data);

		self.outlets = [];

		for (let i = 0; i < jsonData.length; i++) {
			let outletObj = {};
			outletObj.outletState = jsonData[i] === true ? 'On' : 'Off';
			self.outlets.push(outletObj);
		}

		self.init_outlets(self.outlets.length);
	}
	catch(error) {
		self.log('error', `Error parsing data returned for Outlet States: ${error}`);
	}
};

instance.prototype.updateOutletState = function (outlet, state) {
	//used to update the variables/feedbacks instantly, since sometimes the outlets take a few moments to actually update
	let self = this;

	if (self.outlets.length > 0) {
		self.outlets[(outlet-1)].outletState = state;
	}

	self.checkVariables();
	self.checkFeedbacks();
};

instance.prototype.getOutletNames = function() {
	//save the names into the local data array
	let self = this;

	let protocol = 'http://';

	if (self.config.secure) {
		protocol = 'https://';
	}

	let url = `${protocol}${self.config.host}/restapi/relay/outlets/all;/name/`;

	let username = self.config.username;
	let password = self.config.password;
	
	let options = {
		method: 'GET',
		rejectUnauthorized: false,
		auth: `${username}:${password}`,
		headers: {
			'Accept': 'application/json'
		}
	};

	httpClient.request(url, options, (err, data, res) => {
		if (err) {
			self.status(self.STATUS_ERROR);
			let showSpecific = false;
			Object.keys(err).forEach(function(key) {
				if (key === 'code') {
					if (err[key] === 'ECONNREFUSED') {
						self.log('error', 'Unable to get Outlet Names. Connection refused. Is this the right IP address?');
						showSpecific = true;
					}
				}
			});

			if (!showSpecific) {
				self.log('error', err.toString());
			}

			self.stopInterval();

			return;
		}
		self.status(self.STATUS_OK);

		self.processOutletNames(data);

		self.actions() // export actions
		self.init_presets();
		self.init_variables();
		self.init_feedbacks();
		self.checkVariables();
		self.checkFeedbacks();
	});
};

instance.prototype.processOutletNames = function (data) {
	let self = this;
	
	try {
		let jsonData = JSON.parse(data);

		for (let i = 0; i < jsonData.length; i++) {
			self.outlets[i].outletName = jsonData[i];
		}
	}
	catch(error) {
		self.log('error', `Error parsing data returned for Outlet Names: ${error}`);
	}
};

// Return config fields for web config
instance.prototype.config_fields = function () {
	let self = this

	return [
		{
			type: 'text',
			id: 'info',
			width: 12,
			label: 'Information',
			value: 'This module controls Digital Loggers Power Controllers.',
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'Host/IP of device',
			width: 4,
			regex: self.REGEX_IP
		},
		{
			type: 'textinput',
			id: 'username',
			label: 'Username',
			width: 4,
			default: 'admin'
		},
		{
			type: 'textinput',
			id: 'password',
			label: 'Password',
			width: 4,
			default: '1234'
		},
		{
			type: 'checkbox',
			id: 'secure',
			label: 'Use Secure Connection (HTTPS)',
			default: true
		},
		{
			type: 'text',
			id: 'intervalInfo',
			width: 12,
			label: 'Update Interval',
			value: 'Please enter the amount of time in milliseconds to request new information from the device. Set to 0 to disable.',
		},
		{
			type: 'textinput',
			id: 'interval',
			label: 'Update Interval',
			width: 3,
			default: 5000
		}
	]
}

instance.prototype.setupInterval = function() {
	let self = this;

	self.stopInterval();

	if (self.config.interval > 0) {
		self.INTERVAL = setInterval(self.getOutletData.bind(self), self.config.interval);
		self.log('info', 'Starting Update Interval: Every ' + self.config.interval + 'ms');
	}
};

instance.prototype.stopInterval = function() {
	let self = this;

	if (self.INTERVAL !== null) {
		self.log('info', 'Stopping Update Interval.');
		clearInterval(self.INTERVAL);
		self.INTERVAL = null;
	}
};

// ##########################
// #### Instance Presets ####
// ##########################
instance.prototype.init_presets = function () {
	this.setPresetDefinitions(presets.setPresets(this));
}

// ############################
// #### Instance Variables ####
// ############################
instance.prototype.init_variables = function () {
	this.setVariableDefinitions(variables.setVariables(this));
}

// Setup Initial Values
instance.prototype.checkVariables = function () {
	variables.checkVariables(this);
}

// ############################
// #### Instance Feedbacks ####
// ############################
instance.prototype.init_feedbacks = function (system) {
	this.setFeedbackDefinitions(feedbacks.setFeedbacks(this));
}

// ##########################
// #### Instance Actions ####
// ##########################
instance.prototype.controlOutlet = function (outletNumber, state) {
	actions.controlOutlet(this, outletNumber, state);
}

instance.prototype.cycleOutlet = function (outletNumber) {
	actions.cycleOutlet(this, outletNumber);
}

instance.prototype.actions = function (system) {
	this.setActions(actions.setActions(this));
}

instance_skel.extendedBy(instance);
exports = module.exports = instance;