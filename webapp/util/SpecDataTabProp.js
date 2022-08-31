// This tab is implementing the property tree (instance, composition, etc.) maintenance functions.

sap.ui.define([
	"sap/base/assert",
	"sap/ui/model/json/JSONModel",
	"ESM2/util/CompType",
	"ESM2/util/PropInstance",
	"ESM2/util/PropMode",
	"ESM2/util/PropMultiComposition",
	"ESM2/util/PropQual",
	"ESM2/util/PropQuant",
	"ESM2/util/Phrase",
	"ESM2/util/SpecDataTabBase"
], function (assert, JSONModel, CompType, PropInstance, PropMode, PropMultiComposition, PropQual, PropQuant, Phrase, SpecDataTabBase) {
	"use strict";

	var SpecDataTabProp = function (oComponent, bEditable) {
		SpecDataTabBase.call(this, oComponent, "ESM2.frag.SpecDataTabProp");

		this._bEditable = bEditable;

		// Setup tab model.

		this._oTabModel = new JSONModel();

		var oTab = this.getControl();
		oTab.setModel(this._oTabModel, "tabModel");

		// var sTitle = this._getOwnerComponent().getI18nBundle().getText(this._bEditable ? "SpecDataTabProp.title.editable" :
		// 	"SpecDataTabProp.title.nonEditable");

		//test
		// if (sTitle == this._getOwnerComponent().getI18nBundle().getText("SpecDataTabProp.title.nonEditable")) {
		// this._oTabModel.setProperty("/title", sTitle);
		// oTab.setProperty("text", sTitle);
		// oTab.setProperty("key", "prereq");
		// oTab.setProperty("icon", "sap-icon://form");
		// this.byId("tlb2").setVisible(false);
		// } else {
		// 	this._oTabModel.setProperty("/title", sTitle);
		// 	oTab.setProperty("text", sTitle);
		// 	oTab.setProperty("icon", "sap-icon://request");
		// 	oTab.setProperty("key", "maintain");
		// 	oTab.addContent();
		// }
		//test

		// Initialize property controls.

		this._aPropControls = [];
	};

	SpecDataTabProp.prototype = Object.create(SpecDataTabBase.prototype);
	SpecDataTabProp.prototype.constructor = SpecDataTabProp;

	SpecDataTabProp.prototype.onBeforeShow = function () {
		// Remove all controls.

		for (var i = 0; i < this._aPropControls.length; i++) {
			var oPropControl = this._aPropControls[i];
			oPropControl.destroy();
		}
		var oTab = this.getControl();
		oTab.removeAllSubSections();
		this._aPropControls = [];
	};

	SpecDataTabProp.prototype.addProp = function (sPropMode, oTreeNode, oInstanceInfo, oCollection, udtprop, secndrn, speckey, estcat,
		compindref, mandatoryfieldcounter, udtinst, layout, objlay, proplist, oPropInfo, propindex) {
		var fConstructor = null;

		switch (sPropMode) {
		case PropMode.Instance:
			fConstructor = PropInstance;
			break;

		case PropMode.Composition:
			switch (oInstanceInfo.COMP_TYPE) {
			case CompType.Qual:
				fConstructor = PropQual;
				break;

			case CompType.MultiComp:
				fConstructor = PropMultiComposition;
				break;

			case CompType.Quant:
				fConstructor = PropQuant;
				break;

			case CompType.Phrase:
				fConstructor = Phrase;
				break;

			default:
				assert(false, "COMP_TYPE is unknown");
			}
			break;

		default:
			assert(false, "sPropMode is unknown");
		}

		assert(fConstructor, "fConstructor should be set");
	if (fConstructor == PropMultiComposition) {
			var oPropControl = new fConstructor(this._getOwnerComponent(), oTreeNode, oCollection, this._bEditable, udtprop, speckey, estcat,
				compindref, mandatoryfieldcounter, secndrn, objlay, proplist, oPropInfo, propindex);
		} else if (fConstructor == PropInstance) {
			var oPropControl = new fConstructor(this._getOwnerComponent(), oTreeNode, oCollection, this._bEditable, udtprop, compindref,
				mandatoryfieldcounter, udtinst, layout, secndrn, objlay, proplist, oPropInfo, propindex);
		} else {
			var oPropControl = new fConstructor(this._getOwnerComponent(), oTreeNode, oCollection, this._bEditable, udtprop, compindref,
				mandatoryfieldcounter, udtinst, secndrn, objlay, proplist, oPropInfo, propindex);
		}
		if (!secndrn) {
			this._aPropControls.push(oPropControl);

			var oTab = this.getControl();
			oTab.addSubSection(oPropControl.getControl());
		} else {

			for (var i = 0; i < this._aPropControls.length; i++) {
				if (this._aPropControls[i].estcat == estcat) {
					this._aPropControls.splice(i, 1);
					i--;
				}
			}
			this._aPropControls.push(oPropControl);
			var oTab = this.getControl();
			var otabcont = oTab.getSubSections();
			for (var j = 0; j < otabcont.length; j++) {
				try {
					var htext = otabcont[j].getTitle();
					var htextprop = oPropControl.getControl().getTitle();
				} catch (e) {
					var htext = 0;
				};
				if (htext != 0) {
					if (otabcont[j].getTitle() == oPropControl.getControl().getTitle()) {
						oTab.removeSubSection(j);
						otabcont.splice(j, 1);
						j--;
					}
				}

			}
			oTab.addContent(oPropControl.getControl());

		}

	};

	return SpecDataTabProp;
});