/*
 * Numeric characteristic handling
 */

sap.ui.define([
	"ESM2/util/CharHeaderBasic"
], function(CharHeaderBasic) {
	"use strict";

	var CharHeaderNum = function(oComponent, oODataHeader) {
		CharHeaderBasic.call(this, oComponent, oODataHeader);

		// EXT_CLASS
		oComponent.initClassExtension(this, "ESM2.util.CharHeaderNum", arguments);
	};

	CharHeaderNum.prototype = Object.create(CharHeaderBasic.prototype);
	CharHeaderNum.prototype.constructor = CharHeaderNum;

	return CharHeaderNum;
});
