module.exports = {
	// ##########################
	// #### Define Variables ####
	// ##########################
	setVariables: function (i) {
		let self = i
		let variables = []

		for (let i = 0; i < self.outlets.length; i++) {
			variables.push({ name: 'outlet_' + (i+1) + '_name', label: 'Outlet ' + (i+1) + ' Name' });
			variables.push({ name: 'outlet_' + (i+1) + '_state', label: 'Outlet ' + (i+1) + ' State' });
		}

		return variables
	},

	// #########################
	// #### Check Variables ####
	// #########################
	checkVariables: function (i) {
		let self = i;
		try {
			for (let i = 0; i < self.outlets.length; i++) {	
				self.setVariable('outlet_' + (i+1) + '_name', self.outlets[i].outletName);
				self.setVariable('outlet_' + (i+1) + '_state', self.outlets[i].outletState);
			}
		}
		catch(error) {
			self.log('error', 'Error parsing Variables: ' + String(error))
		}
	}
}
