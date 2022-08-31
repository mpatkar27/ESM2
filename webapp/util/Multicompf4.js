// This tab is implementing the attachment maintenance.

sap.ui.define([
	"ESM2/util/SpecDataTabBase",
	"sap/m/library",
	"sap/m/Link",
	"ESM2/util/ModelManagerAdmin",
	"ESM2/util/ModelManagerAutoGrowOp",
	"ESM2/util/ModelManagerIntStatus",
	"sap/ui/model/json/JSONModel",
	"ESM2/util/PropMultiComposition",
	"sap/base/assert",
	"ESM2/util/ValueHelperDialog"
], function (SpecDataTabBase, sap_m_lib, Link, ModelManagerAdmin, ModelManagerAutoGrowOp,
	ModelManagerIntStatus, JSONModel, PropMultiComposition, assert, ValueHelperDialog) {
	"use strict";

	var Multicompf4 = function (oComponent, srcfield, fldval) {
		SpecDataTabBase.call(this, oComponent, "ESM2.frag.Multicompf4");

		this._oComponent = oComponent;
		this.patharr = [];
		this._oDialogadd = oComponent.getNavigator().createFragment("ESM2.frag.Multicompf4", this); //FIXME:parentcontrol
		this._fldval = fldval;
		this._Odiagrestab = new JSONModel();
		this._srcfield = srcfield;

		this._oDialogadd.control.setModel(this._Odiagrestab);
		this._oDialogadd.control.open();

		var oRequest = this._oComponent.getODataManager().requestForFetchGenValHelp(fldval);
		this._oComponent.getODataManager().executeRequest(oRequest,
			jQuery.proxy(this._FetchhelpSuccess, this));

	};
	Multicompf4.prototype = Object.create(SpecDataTabBase.prototype);
	Multicompf4.prototype.constructor = Multicompf4;

	Multicompf4.prototype._onCloseusag = function () {

		this._oDialogadd.control.close();

	};
	Multicompf4.prototype._onok = function (oEvent) {

		var selkey = oEvent.getSource().getSelectedKey();
		this._srcfield.setValue(selkey);
		this._oDialogadd.control.close();
	};
	Multicompf4.prototype._FetchhelpSuccess = function (aCharEntries) {

		this._usagecollection = aCharEntries.entries;
		this._Odiagrestab.setProperty("/", aCharEntries.entries);
		this._modtab = this._Odiagrestab;
	};
	return Multicompf4;
});