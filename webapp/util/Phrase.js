// This is the controller which is implementing instance maintenance.

sap.ui.define([
	"sap/base/assert",
	"sap/m/Label",
	"sap/ui/model/json/JSONModel",
	"ESM2/control/Column",
	"ESM2/control/ColumnListItem",
	"ESM2/util/TableManager",
	"ESM2/util/PropBase"
], function(assert, Label, JSONModel, Column, ColumnListItem, TableManager, PropBase) {
	"use strict";

	var Phrase = function(oComponent, oTreeNode, oCollection, bEditable, udtprop) {//FIXMEVC:if bEditable is false, then make this propcontrol readonly.
		PropBase.call(this, oComponent, "ESM2.frag.Phrase");

		// Setup prop model.//FIXMEVC:dup
		var objsec = this._byId("objsecphrase");
		var msgstrp = this._byId("msgstrp");
		var data = oCollection.getModel().getData();
		var txt = data[0][0].Phrtext;
		objsec.setTitle("Message("+txt.slice(0,20)+"...)");
		msgstrp.setText(txt);
		
		};
	
	Phrase.prototype = Object.create(PropBase.prototype);
	Phrase.prototype.constructor = Phrase;
	
	return Phrase;
});
