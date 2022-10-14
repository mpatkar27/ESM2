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

	var Phrase = function(oComponent, oTreeNode, oCollection, bEditable, udtprop, compindref,
				mandatoryfieldcounter, udtinst, secndrn, objlay, proplist, oPropInfo, propindex) {//FIXMEVC:if bEditable is false, then make this propcontrol readonly.
		PropBase.call(this, oComponent, "ESM2.frag.Phrase");

		// Setup prop model.//FIXMEVC:dup
		// var objsec = this._byId("objsecphrase");
		// var msgstrp = this._byId("msgstrp");
		// var data = oCollection.getModel().getData();
		// var txt = data[0][0].Phrtext;
		// objsec.setTitle("Message("+txt.slice(0,20)+"...)");
		// msgstrp.setText(txt);
		
			var msgstrp = this._byId("msgstrp");
		var msgtxt = this._byId("msgtxt");
		var msgtxth = this._byId("msgtxth");

		var data = oCollection.getModel().getData()[0];
		var str = " ";
		if (data.length > 1) {
			for (var x = 0; x < data.length; x++) {
				str = str + data[x].Phrtext + " ";
			}
		} else {
			str = data[0].Phrtext;
		}

		if (oPropInfo.grpfilter == "T") {
			msgtxt.setHtmlText(str);
			msgtxt.setVisible(true);
			msgstrp.setVisible(false);
			msgtxth.setVisible(false);

		} else if (oPropInfo.grpfilter == "H") {
			msgtxth.setText(str);
			msgtxth.setVisible(true);
			msgtxt.setVisible(false);
			msgstrp.setVisible(false);
		} else {
			msgstrp.setText(str);
			msgstrp.setVisible(true);
			msgtxt.setVisible(false);
			msgtxth.setVisible(false);
		}
		
		};
	
	Phrase.prototype = Object.create(PropBase.prototype);
	Phrase.prototype.constructor = Phrase;
	
	return Phrase;
});
