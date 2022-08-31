sap.ui.define([
	"sap/ui/core/Control"
], function(Control) {
	"use strict";

	var CharValueControl = Control.extend("ESM2.control.CharValueControl", {
		metadata: {
			properties: {
				showSeparator: {type: "boolean", defaultValue: false}
			},

			aggregations: {
				innerControl: {type: "sap.ui.core.Control", multiple: false},
				editButton: {type: "sap.m.Button", multiple: false}
			}
		}
	});

	return CharValueControl;
});
