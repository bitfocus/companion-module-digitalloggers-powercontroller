module.exports = {
	setPresets: function (i) {
		let self = i
		let presets = []

		const foregroundColor = self.rgb(255, 255, 255) // White
		const backgroundColorRed = self.rgb(255, 0, 0) // Red
		const backgroundColorGreen = self.rgb(0, 255, 0) // Green
		const backgroundColorOrange = self.rgb(255, 102, 0) // Orange

		// ########################
		// #### System Presets ####
		// ########################

		for (let i = 0; i < self.CHOICES_OUTLETS.length; i++) {
			presets.push({
				category: 'Outlet Control',
				label: 'Turn On ' + self.CHOICES_OUTLETS[i].id,
				bank: {
					style: 'text',
					text: 'OUTLET ON\\n' + self.CHOICES_OUTLETS[i].label,
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0)
				},
				actions: [
					{
						action: 'outletOn',
						options: {
							outlet: self.CHOICES_OUTLETS[i].id
						},
					}
				],
				feedbacks: [
					{
						type: 'outletStatus',
						options: {
							outlet: self.CHOICES_OUTLETS[i].id,
							option: 'On'
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorRed,
						}
					}
				]
			});

			presets.push({
				category: 'Outlet Control',
				label: 'Turn Off ' + self.CHOICES_OUTLETS[i].id,
				bank: {
					style: 'text',
					text: 'OUTLET OFF\\n' + self.CHOICES_OUTLETS[i].label,
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0)
				},
				actions: [
					{
						action: 'outletOff',
						options: {
							outlet: self.CHOICES_OUTLETS[i].id
						},
					}
				],
				feedbacks: [
					{
						type: 'outletStatus',
						options: {
							outlet: self.CHOICES_OUTLETS[i].id,
							option: 'Off'
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorRed,
						}
					}
				]
			});

			presets.push({
				category: 'Outlet Control',
				label: 'Cycle ' + self.CHOICES_OUTLETS[i].id,
				bank: {
					style: 'text',
					text: 'OUTLET CYCLE\\n' + self.CHOICES_OUTLETS[i].label,
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0)
				},
				actions: [
					{
						action: 'outletCycle',
						options: {
							outlet: self.CHOICES_OUTLETS[i].id
						},
					}
				],
				feedbacks: [
					{
						type: 'outletStatus',
						options: {
							outlet: self.CHOICES_OUTLETS[i].id,
							option: 'On'
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorRed,
						}
					}
				]
			});
		}

		presets.push({
			category: 'Outlet Control',
			label: 'Turn All On',
			bank: {
				style: 'text',
				text: 'ALL OUTLETS\\nON',
				size: '14',
				color: '16777215',
				bgcolor: self.rgb(0, 0, 0)
			},
			actions: [
				{
					action: 'outletOnAll'
				}
			]
		});

		presets.push({
			category: 'Outlet Control',
			label: 'Turn All Off',
			bank: {
				style: 'text',
				text: 'ALL OUTLETS\\nOFF',
				size: '14',
				color: '16777215',
				bgcolor: self.rgb(0, 0, 0)
			},
			actions: [
				{
					action: 'outletOffAll'
				}
			]
		});

		return presets
	}
}
