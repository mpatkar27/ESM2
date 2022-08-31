// This tab is implementing the chat functionality.

sap.ui.define([
	"ESM2/util/SpecDataTabBase",
	"ESM2/util/ModelManagerAdmin",
	"ESM2/util/ModelManagerAutoGrowOp",
	"ESM2/util/ModelManagerIntStatus",
	"sap/ui/core/format/DateFormat",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (SpecDataTabBase, ModelManagerAdmin, ModelManagerAutoGrowOp,
	ModelManagerIntStatus, DateFormat, Filter, FilterOperator) {
	"use strict";

	var RecipeTab = function (oComponent, specid, objpgly,secndrun) {
		SpecDataTabBase.call(this, oComponent, "ESM2.frag.RecipeTab");

		this._oComponent = oComponent;
		this._anchorbar = objpgly;
		this.secondrun = secndrun;
		this._specid = specid;
		this._rcp = this._byId("recipetable");

		var oRequest = this._oComponent.getODataManager().requestForFetchRecipe(this._specid);
		this._oComponent.getODataManager().executeRequest(oRequest,
			jQuery.proxy(this._fetchdata, this));
	};

	RecipeTab.prototype = Object.create(SpecDataTabBase.prototype);
	RecipeTab.prototype.constructor = RecipeTab;

	RecipeTab.prototype._fetchdata = function (response) {

		var resp = response;
		var oModeldoc = new sap.ui.model.json.JSONModel(resp.entries);
		this._rcp.setModel(oModeldoc);
		// if (!this.secondrun)
		// {
		// 	var test1 = this._anchorbar.getAggregation("_anchorBar");
		// var anchbarctnt = test1.getAggregation("content");
		// var anchbarmenuitm = anchbarctnt[0].getAggregation("menu");
		// // var anchbarmenuitm1 = anchbarctnt[2].getAggregation("menu");
		// var menustr = null;
		// for (var n = 0; n < anchbarmenuitm.getItems().length; n++) {
		// 	menustr = anchbarmenuitm.getItems()[n].getProperty("text");
		// 	if (menustr == "") {

		// 		anchbarmenuitm.removeItem(n);
		// 		n--;
		// 	}
		// }
		// // for (var n = 0; n < anchbarmenuitm1.getItems().length; n++) {
		// // 	menustr = anchbarmenuitm1.getItems()[n].getProperty("text");
		// // 	if (menustr == "") {

		// // 		anchbarmenuitm1.removeItem(n);
		// // 		n--;
		// // 	}
		// // }
		// }
		
		// this._anchorbar.fireNavigate();
	};

	return RecipeTab;
});