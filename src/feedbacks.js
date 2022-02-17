module.exports = {
	// ##########################
	// #### Define Feedbacks ####
	// ##########################
	setFeedbacks: function (i) {
		let self = i
		let feedbacks = {}
		
		const foregroundColor = self.rgb(255, 255, 255) // White
		const backgroundColorRed = self.rgb(255, 0, 0) // Red
		const backgroundColorGreen = self.rgb(0, 255, 0) // Green
		const backgroundColorOrange = self.rgb(255, 102, 0) // Orange

		feedbacks.outletStatus = {
			type: 'boolean',
			label: 'Outlet Status',
			description: 'Indicate if Outlet is in Selected Status',
			style: {
				color: foregroundColor,
				bgcolor: backgroundColorRed,
			},
			options: [
				{
					type: 'dropdown',
					label: 'Outlet',
					id: 'outlet',
					default: self.CHOICES_OUTLETS[0].id,
					choices: self.CHOICES_OUTLETS
				},
				{
					type: 'dropdown',
					label: 'Indicate in X State',
					id: 'option',
					default: 'On',
					choices: [
						{ id: 'On', label: 'On' },
						{ id: 'Off', label: 'Off' }
					]
				}
			],
			callback: function (feedback, bank) {
				let opt = feedback.options;
				if (self.outlets[(parseInt(opt.outlet) - 1)].outletState === opt.option) {
					return true;
				}

				return false;
			}
		}
		

		return feedbacks
	}
}
