/*
 * Currency characteristic handling
 */

sap.ui.define([
	"ESM2/util/CharHeaderBasic"
], function(CharHeaderBasic) {
	"use strict";

	var CharHeaderCurr = function(oComponent, oODataHeader) {
		CharHeaderBasic.call(this, oComponent, oODataHeader);

		// EXT_CLASS
		oComponent.initClassExtension(this, "ESM2.util.CharHeaderCurr", arguments);
	};

	CharHeaderCurr.prototype = Object.create(CharHeaderBasic.prototype);
	CharHeaderCurr.prototype.constructor = CharHeaderCurr;

	return CharHeaderCurr;
});
