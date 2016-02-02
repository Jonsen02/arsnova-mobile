/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2015 The ARSnova Team
 *
 * ARSnova Mobile is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * ARSnova Mobile is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with ARSnova Mobile.  If not, see <http://www.gnu.org/licenses/>.
 */
Ext.define('ARSnova.view.LoginPanel', {
	extend: 'Ext.Container',

	requires: ['Ext.MessageBox', 'ARSnova.view.MatrixButton'],

	config: {
		fullscreen: true,
		scrollable: {
			direction: 'vertical',
			directionLock: true
		},
		layout: {
			type: 'vbox',
			pack: 'center'
		},

		layoutOnOrientationChange: false,
		monitorOrientation: false,

		title: 'LoginPanel'
	},

	initialize: function () {
		this.callParent(arguments);
		var me = this;

		this.arsLogo = {
			xtype: 'panel',
			style: 'marginTop: 15px'
		};

		me.add([{
			xtype: 'toolbar',
			docked: 'top',
			ui: 'light',
			title: 'Login',
			cls: null,
			items: [{
				text: Messages.CHANGE_ROLE,
				ui: 'back',
				handler: function () {
					ARSnova.app.userRole = "";
					ARSnova.app.setWindowTitle();

					ARSnova.app.mainTabPanel.tabPanel.animateActiveItem(ARSnova.app.mainTabPanel.tabPanel.rolePanel, {
						type: 'slide',
						direction: 'right',
						duration: 500
					});
				}
			}]},
			me.arsLogo
		]);

		var config = ARSnova.app.globalConfig;
		ARSnova.app.getController('Auth').services.then(function (services) {
			var i, buttonPanels = [], button, items = [], service, imagePath = "", imageSrc, imageCls;
			if (config.customizationPath) {
				imagePath = config.customizationPath + "/images/";
			}
			services.sort(function (a, b) {
				if (a.order > 0 && (a.order < b.order || b.order <= 0)) {
					return -1;
				}
				if (b.order > 0 && (a.order > b.order || a.order <= 0)) {
					return 1;
				}

				return 0;
			});
			var buttonHandler = function (b) {
				var service = b.config.value;
				if ("guest" === service.id && ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER) {
					Ext.Msg.confirm(Messages.GUEST_LOGIN, Messages.CONFIRM_GUEST_SPEAKER, function (answer) {
						if ('yes' === answer) {
							ARSnova.app.getController('Auth').login({
								service: service
							});
						}
					});
				} else {
					ARSnova.app.getController('Auth').login({
						service: service
					});
				}
			};
			for (i = 0; i < services.length; i++) {
				service = services[i];
				imageSrc = service.image ? imagePath + service.image : "btn_" + service.id;
				imageCls = "login-icon-" + service.id;
				button = {
					xtype: 'matrixbutton',
					id: 'login-select-' + service.id,
					text: "guest" === service.id ? Messages.GUEST : service.name,
					value: service,
					image: imageSrc,
					imageCls: imageCls,
					handler: buttonHandler
				};
				if (i % 2 === 1) {
					button.style = "margin-left: 20px";
				}
				items.push(button);
				if (i % 2 === 1 || i === services.length - 1) {
					buttonPanels.push(
						Ext.create('Ext.Panel', {
							xtype: 'container',
							layout: {
								type: 'hbox',
								pack: 'center'
							},
							items: items
						})
					);
					items = [];
				}
			}

			buttonPanels[buttonPanels.length - 1].setStyle('margin-bottom: 15px;');
			buttonPanels.forEach(function (buttonPanel) {
				me.add(buttonPanel);
			});
		});
	}
});
