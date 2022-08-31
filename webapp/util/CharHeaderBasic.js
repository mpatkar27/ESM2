/*
 * Generic handler for string-like characteristic
 */

sap.ui.define([
	"sap/m/Input",
	"ESM2/util/CharHeaderBase",
	"ESM2/util/CharHeaderException",
	"sap/ui/model/json/JSONModel"
], function (Input, CharHeaderBase, CharHeaderException, JSONModel) {
	"use strict";

	var CharHeaderBasic = function (oComponent, oODataHeader) {
		CharHeaderBase.call(this, oComponent, oODataHeader);
		this._odataheader = oODataHeader;

		this._compindref = null;
		this._mandfldtotcnt = null;
	};

	CharHeaderBasic.prototype = Object.create(CharHeaderBase.prototype);
	CharHeaderBasic.prototype.constructor = CharHeaderBasic;

	CharHeaderBasic.prototype._parseCharValue = function (sRawValue) {
		if (sRawValue == "")
			throw new CharHeaderException("CharHeaderBasic.error.emptyChar", [this._sFieldName]);

		return sRawValue;
	};

	CharHeaderBasic.prototype._convertCharValue = function (vCharValue) {
		return vCharValue;
	};

	CharHeaderBasic.prototype._emptyCharValue = function () {
		return "";
	};

	CharHeaderBasic.prototype._isEmptyCharValue = function (vCharValue) {
		var bEmpty = (vCharValue == "");
		return bEmpty;
	};

	CharHeaderBasic.prototype._isCharValueEqual = function (vCharValue1, vCharValue2) {
		var bEqual = (vCharValue1 == vCharValue2);
		return bEqual;
	};

	CharHeaderBasic.prototype._getCharValueInputImpl = function (sEditableBindingPath, sCharValueBindingPath, compindref,
		mandatoryfieldcounter) {

		this._compindref = compindref;
		this._mandfldtotcnt = mandatoryfieldcounter;

		if (this._isCheckBox == false) {
			var oControl = new Input({
				value: {
					path: sCharValueBindingPath
				},
				width: this._calculateCharValueInputWidth(),
				enabled: this._calculateEnabledBinding(sEditableBindingPath),
				change: jQuery.proxy(this._onChange)
			});
			var jmod = new JSONModel();
			jmod.setProperty("/progindref", compindref);
			jmod.setProperty("/mandttot", mandatoryfieldcounter);
			jmod.setProperty("/valbindpath", sCharValueBindingPath);
			oControl.setModel(jmod, "prog");
		} else {
			var oControl = new sap.m.Switch({
				state: {
					path: sCharValueBindingPath
				},
				// state: true,
				// width: this._calculateCharValueInputWidth(),
				enabled: this._calculateEnabledBinding(sEditableBindingPath)
			});
		}

		return oControl;
	};

	CharHeaderBasic.prototype._onChange = function (oEvent) {

		var inpval = oEvent.getSource().getValue();
		var aPathComps = oEvent.getSource().getBindingContext().getPath().split("/");

		var iIndex = parseInt(aPathComps[1]);

		var sBindingPath = oEvent.getSource().getModel("prog").getData().valbindpath;
		var bindpathmf = "/" + iIndex + "/Mandatoryfields";
		var mandfarr = oEvent.getSource().getModel().getProperty(bindpathmf);

		var bindpath = sBindingPath.split("/");

		var finbindpath = "/" + iIndex + "/_ModelManagerADMIN/origEntry/" + sBindingPath;

		var finbindpathroot = "/" + iIndex + "/" + sBindingPath;

		var orgval = oEvent.getSource().getModel().getProperty(finbindpath);
		var prgindref = oEvent.getSource().getModel("prog").getData().progindref;
		var mandtot = oEvent.getSource().getModel("prog").getData().mandttot;

		// In instance table: copy user entered value to phrase, since the control is bound to value.
		// In edit dialog: copy user entered value to value, since the control is bound to phrase.
		var mandtcont = prgindref.getModel().getProperty("/mandtchngdfieldsno");

		var oldval = oEvent.getSource().getModel().getProperty(finbindpath);

		for (var k = 0; k < mandfarr.length; k++) {

			if (mandfarr[k].Label == bindpath[0]) {
				if (mandfarr[k].changecounter == 0) {

						if (inpval == "") {
							oEvent.getSource().setValueState("Error");
							mandtcont--;
						} else if (orgval == "" && inpval != "") {
							oEvent.getSource().setValueState("None");
							mandtcont++;
						}
					} else {
						if (mandfarr[k].changevalues[mandfarr[k].changevalues.length - 1] == "") {
							mandtcont++;
							oEvent.getSource().setValueState("None");
						} else {
							if (inpval == "") {
								oEvent.getSource().setValueState("Error");
								mandtcont--;
							}
							else{
								oEvent.getSource().setValueState("None");
							}
						}
					}
				mandfarr[k].changevalues.push(inpval);
				mandfarr[k].changecounter++;
				prgindref.getModel().setProperty("/mandtchngdfieldsno", mandtcont);

				var mandtper = mandtcont / mandtot * 100;
				prgindref.setDisplayValue(mandtper + '%');
				prgindref.setPercentValue(mandtper);
			}

		}

	};

	CharHeaderBasic.prototype._formatterForCharValue = function (bInstanceTable, vCharValue) {
		// if(this._isCheckBox == false)
		// {
		// 	return vCharValue;
		// }
		// else
		// {
		// 	if (vCharValue)
		// 	{
		// 		return true;
		// 	}
		// 	else{
		// 		return false;
		// 	}
		// }
		return vCharValue;
	};

	CharHeaderBasic.prototype._parseCharValueOfCharEntry = function (sRawValue, sDescription) {
		// Allow empty values for currency type in value helper. It is the reason why
		// we don't call _parseCharValue here (like in case of other
		// characteristic).

		return sRawValue;
	};

	CharHeaderBasic.prototype._createCharEntryFromCharValue = function (vCharValue) {
		var oCharEntry = this._makeCharEntryFromCharValue(vCharValue, "");
		return oCharEntry;
	};

	CharHeaderBasic.prototype._getCharEntryFilterPath = function () {
		return "";
	};

	CharHeaderBasic.prototype._createCharValueFromValueHelperValue = function (vValueHelperValue, oValueHelperHeader) {
		var vCharValue = null;

		if (oValueHelperHeader.DATATYPE == "CHAR") // FIXME
			vCharValue = vValueHelperValue;

		return vCharValue;
	};

	return CharHeaderBasic;
});