var httpClient = require('urllib');

module.exports = {
	// ######################
	// #### Send Actions ####
	// ######################

	controlOutlet: function (i, outletNumber, state) {
		let self = i

		let protocol = 'http://';

		if (self.config.secure) {
			protocol = 'https://';
		}

		let url = `${protocol}${self.config.host}/restapi/relay/outlets/${(outletNumber-1)}/state/`;

		self.log('info', `Outlet ${outletNumber}: ${state}`);

		let stateValue = true;

		switch(state) {
			case 'On':
				stateValue = true;
				break;
			case 'Off':
				stateValue = false;
		}

		let username = self.config.username;
		let password = self.config.password;
		
		let options = {
			method: 'PUT',
			rejectUnauthorized: false,
			auth: `${username}:${password}`,
			content: `value=${stateValue}`,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'X-CSRF': 'x'
			}
		};
	
		httpClient.request(url, options, (err, data, res) => {
			if (err) {
				console.log(err);
			}
		});
	},

	cycleOutlet: function (i, outletNumber) {
		let self = i

		let protocol = 'http://';

		if (self.config.secure) {
			protocol = 'https://';
		}

		let url = `${protocol}${self.config.host}/restapi/relay/outlets/${(outletNumber-1)}/cycle/`;

		self.log('info', `Outlet ${outletNumber}: Cycle`);

		let username = self.config.username;
		let password = self.config.password;
		
		let options = {
			method: 'POST',
			rejectUnauthorized: false,
			auth: `${username}:${password}`,
			headers: {
				'X-CSRF': 'x'
			}
		};
	
		httpClient.request(url, options, (err, data, res) => {
			if (err) {
				console.log(err);
			}
		});
	},

	// ##########################
	// #### Instance Actions ####
	// ##########################
	setActions: function (i) {
		let self = i
		let actions = {}
		let cmd = ''

		actions.outletOn = {
			label: 'Turn Outlet On',
			options: [
				{
					type: 'dropdown',
					label: 'Outlet',
					id: 'outlet',
					default: self.CHOICES_OUTLETS[0].id,
					choices: self.CHOICES_OUTLETS
				}
			],
			callback: function (action, bank) {
				let outlet = parseInt(action.options.outlet);
				self.controlOutlet(outlet, 'On');
				self.updateOutletState(outlet, 'On');
			}
		}

		actions.outletOff = {
			label: 'Turn Outlet Off',
			options: [
				{
					type: 'dropdown',
					label: 'Outlet',
					id: 'outlet',
					default: self.CHOICES_OUTLETS[0].id,
					choices: self.CHOICES_OUTLETS
				}
			],
			callback: function (action, bank) {
				let outlet = parseInt(action.options.outlet);
				self.controlOutlet(outlet, 'Off');
				self.updateOutletState(outlet, 'Off');
			}
		}

		actions.outletCycle = {
			label: 'Cycle Outlet',
			options: [
				{
					type: 'dropdown',
					label: 'Outlet',
					id: 'outlet',
					default: self.CHOICES_OUTLETS[0].id,
					choices: self.CHOICES_OUTLETS
				}
			],
			callback: function (action, bank) {
				let outlet = parseInt(action.options.outlet);
				self.cycleOutlet(outlet);
			}
		}

		actions.outletOnAll = {
			label: 'Turn All Outlets On',
			callback: function (action, bank) {
				for (let i = 0; i < self.CHOICES_OUTLETS.length; i++) {
					let outlet = (i+1);
					self.controlOutlet(outlet, 'On');
					self.updateOutletState(outlet, 'On');
				}
			}
		}

		actions.outletOffAll = {
			label: 'Turn All Outlets Off',
			callback: function (action, bank) {
				for (let i = 0; i < self.CHOICES_OUTLETS.length; i++) {
					let outlet = (i+1);
					self.controlOutlet(outlet, 'Off');
					self.updateOutletState(outlet, 'Off');
				}
			}
		}

		return actions
	}
}
