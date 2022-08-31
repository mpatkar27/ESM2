sap.ui.define([
	"sap/base/assert",
	"ESM2/util/CharHeaderChar",
	"ESM2/util/CharHeaderCharPhrase",
	"ESM2/util/CharHeaderCurr",
	"ESM2/util/CharHeaderDate",
	"ESM2/util/CharHeaderDocLink",
	"ESM2/util/CharHeaderException",
	"ESM2/util/CharHeaderNum",
	"ESM2/util/CharHeaderTime",
	"ESM2/util/CharHeaderUserDefinedText"
], function(assert, CharHeaderChar, CharHeaderCharPhrase, CharHeaderCurr, CharHeaderDate, CharHeaderDocLink, CharHeaderException, CharHeaderNum, CharHeaderTime, CharHeaderUserDefinedText) {
	"use strict";

	var CharHeaderFactory = function(oComponent) {
		// EXT_CLASS
		oComponent.initClassExtension(this, "ESM2.util.CharHeaderFactory", arguments);

		this._oComponent = oComponent;
	};

	CharHeaderFactory.prototype.create = function(oODataHeader) {
		// Create characteristic header, based on characteristic type.

		var oCharHeader = null;

		// EXT_HOOK: _extHookCreate
		// Executed during CharHeader object construction.

		if (this._extHookCreate)
			oCharHeader = this._extHookCreate(this._oComponent, oODataHeader);

		if (!oCharHeader) {
			var fCharHeaderConstructor = null;

			switch (oODataHeader.TYPE) { // Transformed ATFOR.
			case "":
			case "CHAR":
				fCharHeaderConstructor = CharHeaderChar;
				break;

			case "CURR":
				fCharHeaderConstructor = CharHeaderCurr;
				break;

			case "NUM":
				fCharHeaderConstructor = CharHeaderNum;
				break;

			case "DATE":
				fCharHeaderConstructor = CharHeaderDate;
				break;

			case "TIME":
				fCharHeaderConstructor = CharHeaderTime;
				break;

			case "CHAR_PHRASE":
				fCharHeaderConstructor = CharHeaderCharPhrase;
				break;

			case "FTEXT":
				fCharHeaderConstructor = CharHeaderUserDefinedText;
				break;
				
			case "DOCLINK":
				fCharHeaderConstructor = CharHeaderDocLink;
				break;
				
			default:
				throw new CharHeaderException("CharHeaderFactory.error.unknownCharType", [oODataHeader.TYPE, oODataHeader.ATNAM]);
			}

			assert(fCharHeaderConstructor, "fCharHeaderConstructor should be set");
			oCharHeader = new fCharHeaderConstructor(this._oComponent, oODataHeader);
		}

		return oCharHeader;
	};

	return CharHeaderFactory;
});
