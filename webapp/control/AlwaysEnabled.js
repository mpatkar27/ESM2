sap.ui.define([
	"sap/ui/core/Control"
], function(Control) {
	"use strict";

	var AlwaysEnabled = Control.extend("ESM2.control.AlwaysEnabled", {
		metadata: {
			aggregations: {
				control: {type: "sap.ui.core.Control", multiple: false}
			}
		},

		getEnabled: function() {
			// Inhibit EnabledPropagator.
			
			return true;
		}
	});
	
	return AlwaysEnabled;
});
