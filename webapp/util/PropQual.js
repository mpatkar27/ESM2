// This is the controller which is implementing qual (e.g. allergen) maintenance.

sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/base/assert",
	"ESM2/control/Column",
	"ESM2/control/ColumnListItem",
	"ESM2/util/TableManager",
	"ESM2/util/PropBase",
	"ESM2/util/ModelManagerAdmin",
	"ESM2/util/ModelManagerAutoGrowOp",
	"ESM2/util/ModelManagerIntStatus",
	"sap/ui/richtexteditor/RichTextEditor"
], function (JSONModel, assert, Column, ColumnListItem, TableManager, PropBase, ModelManagerAdmin, ModelManagerAutoGrowOp,
	ModelManagerIntStatus, RichTextEditor) {
	"use strict";

	var PropQual = function (oComponent, oTreeNode, oCollection, bEditable, udtprop, compindref, mandatoryfieldcounter, udtinst, secndrn,
		objlay, proplist, oPropInfo, propindex) {
		PropBase.call(this, oComponent, "ESM2.frag.PropQual");

		// var msgstr1 = this._byId("msgstrp1");

		this._subsec = this._byId("qualsubsec");

		proplist[propindex].propid = this._subsec;
		this._subsec.setVisible(oPropInfo.Visible);
		this._compindref = compindref;
		this._bEditable = bEditable;
		var mandtcont = compindref.getModel().getProperty("/mandtchngdfieldsno");
		if (!secndrn) {
			if (mandatoryfieldcounter != 0) {
				var mandtper = mandtcont / mandatoryfieldcounter * 100;

				this._compindref.setDisplayValue(mandtper + '%');
				this._compindref.setPercentValue(mandtper);
			} else {
				mandtper = 100;
				this._compindref.setDisplayValue(mandtper + '%');
				this._compindref.setPercentValue(mandtper);
			}
		}
		this._estcat = oTreeNode.ESTCAT;
		// Setup prop model.//FIXMEVC:dup
		this._oComponent = oComponent;
		var oPropModel = new JSONModel();

		var oPropControl = this.getControl();
		oPropControl.setModel(oPropModel, "propModel");

		oPropModel.setProperty("/title", oTreeNode.TEXT);
		// msgstr1.setText(oTreeNode.TEXT);
		// Build table.
		// FIXMEVC: which allergen group to display?

		//2217
		var aCharHeaders = oCollection.getAdditional().parent.CompHeader;
		var cellinfo = oCollection.getAdditional();
		var comphead = this._byId("comphead");
		// build table column header
		for (var i = 0; i < aCharHeaders.length; i++) {
			var oCharHeader = aCharHeaders[i];

			// Build table header (Column objects).

			var sHeaderColumnText = oCharHeader.ColDescr;
			var oHeaderColumnHeader = null;
			if (sHeaderColumnText != oComponent.getI18nBundle().getText("PropInstance.sortOrder")) {
				oHeaderColumnHeader = new sap.m.Label({
					// Text:sHeaderColumnText
				});
				oHeaderColumnHeader.setText(sHeaderColumnText);
				oHeaderColumnHeader.setRequired(oCharHeader.Mandatory);
				assert(oHeaderColumnHeader, oComponent.getI18nBundle().getText("errorhead"));

				var oHeaderColumn = new sap.m.Column({
					header: oHeaderColumnHeader
				});
				comphead.addColumn(oHeaderColumn);
			}
		}
		var columnListItem = new sap.m.ColumnListItem();

		var _onChange = function (oEvent) {
			// This function is called when a field has been changed
			// by user.
			var aPathComps = oEvent.getSource().getBindingContext().getPath().split("/");
			assert(aPathComps.length == 2 &&
				aPathComps[0] == "", "Control should have absolute binding context path");

			var iIndex = parseInt(aPathComps[1]);

			var omod = oEvent.getSource().getModel();

			var iLength = omod.getData().length;

			var sBindingPath = "/" + iIndex + "/" + ModelManagerAdmin.FullPropName.IntStatus;
			var sIntStatus = omod.getProperty(sBindingPath);

			// Entry state transition on field value change:
			// - EMPTY     -> NEW
			// - UNCHANGED -> MODIFIED
			// - MODIFIED  -> MODIFIED (no change)
			// - NEW       -> NEW      (no change)

			var sNewIntStatus = null;

			switch (sIntStatus) {
			case ModelManagerIntStatus.Empty:
				sNewIntStatus = ModelManagerIntStatus.New;
				break;

			case ModelManagerIntStatus.Unchanged:
				sNewIntStatus = ModelManagerIntStatus.Modified;
				break;
			}

			if (sNewIntStatus != null)
				omod.setProperty(sBindingPath, sNewIntStatus);
			if (oEvent.getSource().getModel("prog")) {
				var rdbtn = oEvent.getSource().getModel("prog").getData().radbtn;
				if (rdbtn)
					var inpval = oEvent.getSource().getSelected();
				else
					var inpval = oEvent.getSource().getValue();

				var sBindingPath = oEvent.getSource().getModel("prog").getData().valbindpath;
				var bindpathmf = "/" + iIndex + "/Mandatoryfields";
				var mandfarr = oEvent.getSource().getModel().getProperty(bindpathmf);

				var bindpath = sBindingPath.split("/");

				var finbindpath = "/" + iIndex + "/_ModelManagerADMIN/origEntry/" + sBindingPath;

				var finbindpathroot = "/" + iIndex + "/" + sBindingPath;

				var orgval = oEvent.getSource().getModel().getProperty(finbindpath);
				var prgindref = oEvent.getSource().getModel("prog").getData().progindref;
				var mandtot = oEvent.getSource().getModel("prog").getData().mandttot;

				// // In instance table: copy user entered value to phrase, since the control is bound to value.
				// // In edit dialog: copy user entered value to value, since the control is bound to phrase.
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
							} else {
								if (inpval == "") {
									oEvent.getSource().setValueState("Error");
									mandtcont--;
								} else {
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
			}
		};

		for (i = 0; i < aCharHeaders.length; i++) { // datacell data creation // table items

			oCharHeader = aCharHeaders[i];
			var rdbtn = oCharHeader.AsRadiobutton;
			if (rdbtn == true && i != 5) {
				var grpid = "{" + aCharHeaders[0].ColId + "}";
				var oControl = new sap.m.RadioButton({
					selected: "{" + oCharHeader.ColId + "}",
					groupName: grpid,
					select: _onChange,
					editable: bEditable
				});
				columnListItem.addCell(oControl);
			} else {
				var isedit = oCharHeader.IsEditable;
				if (isedit == true) {
					var oControl = new sap.m.Input({

						value: "{" + oCharHeader.ColId + "}",
						change: _onChange
					});
					columnListItem.addCell(oControl);
				} else {
					var oControl = new sap.m.Text({

						text: "{" + oCharHeader.ColId + "}"
					});
					columnListItem.addCell(oControl);
				}

			}

			var jmod = new JSONModel();
			jmod.setProperty("/progindref", compindref);
			jmod.setProperty("/mandttot", mandatoryfieldcounter);
			jmod.setProperty("/valbindpath", oCharHeader.ColId);
			jmod.setProperty("/radbtn", rdbtn);
			oControl.setModel(jmod, "prog");
		}

		var omod = oCollection.getModel().getData();
		var omoddat = null;
		var delcreate = "_ModelManager:CREATE";
		var deladm = "_ModelManagerADMIN:";
		for (var i = 0; i < omod.length; i++) {
			omoddat = omod[i];
			delete omoddat[delcreate];
			omoddat._ModelManagerADMIN.IntStatus = ModelManagerIntStatus.Unchanged;
			var orgentrystat = omoddat._ModelManagerADMIN.origEntry;
			delete orgentrystat[delcreate];
		}

		var oModel = new sap.ui.model.json.JSONModel(omod);
		comphead.setModel(oModel);
		comphead.bindItems("/", columnListItem, null, null);
		// 2217
		var udtab = this._byId("udt");
		var rctcomp = this._byId("udt");
		var columnListItemrct = new sap.m.ColumnListItem();

		if (udtprop != null) {

			for (var k = 0; k < 2; k++) {
				if (k == 0) {
					oHeaderColumnHeader = new sap.m.Label({});
					oHeaderColumnHeader.setText(oComponent.getI18nBundle().getText("Name"));
					oHeaderColumn = new sap.m.Column({
						header: oHeaderColumnHeader,
						width: "20%"
					});
				} else if (k == 1) {
					oHeaderColumnHeader = new sap.m.Label({});
					oHeaderColumnHeader.setText(oComponent.getI18nBundle().getText("val"));
					oHeaderColumn = new sap.m.Column({
						header: oHeaderColumnHeader
					});
				}
				rctcomp.addColumn(oHeaderColumn);
			}
			columnListItemrct.addCell(new sap.m.Label({
				text: "{TEXTNAM}"
			}));
			var colcell = new sap.ui.richtexteditor.RichTextEditor({
				value: "{TEXT}",
				change: _onChange,
				editable: bEditable,
				width: "100%",
			});
			columnListItemrct.addCell(colcell);

			rctcomp.bindItems("/", columnListItemrct, null, null);
			var udtdata = udtprop.collection.getModel().getData();
			var oModeludt = new sap.ui.model.json.JSONModel(udtdata);
			udtab.setModel(oModeludt);

			var jmod = new JSONModel();
			jmod.setProperty("/progindref", compindref);
			jmod.setProperty("/mandttot", mandatoryfieldcounter);
			jmod.setProperty("/valbindpath", "");
			jmod.setProperty("/radbtn", false);
			colcell.setModel(jmod, "prog");
		} else {
			udtab.setVisible(false);
		}

	};

	PropQual.prototype._onCharEdit = function (oCollection, oCharHeader, oEvent) { //FIXMEVC:refactor
		var iInstanceIndex = oCollection.getEntryIndexOfControl(oEvent.getSource());
		var oInstance = oCollection.getEntry(iInstanceIndex);
		oCharHeader.openEdit(oInstance, jQuery.proxy(this._onCharEditStore, this, oCharHeader, iInstanceIndex, oCollection));
	};

	PropQual.prototype._onCharEditStore = function (oCharHeader, iInstanceIndex, oCollection, aCharValues, bNoUpdate) { // FIXMEVC: refactor
		oCollection.setFieldValue(iInstanceIndex, oCharHeader.getFieldName(), aCharValues, bNoUpdate);
	};

	PropQual.prototype = Object.create(PropBase.prototype);
	PropQual.prototype.constructor = PropQual;

	PropQual.prototype._formatEditMode = function (bAppEditMode) {
		var bEditMode = bAppEditMode && this._bEditable;
		return bEditMode;
	};
	PropQual.prototype._infopop = function (oEvent) {

		this._oevent = oEvent;
		var sServiceUrl = "/sap/opu/odata/GMT/VC_ODATA_SRV";
		var oDatModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);
		var that = this;
		var mParameters = {
			method: "GET",
			urlParameters: {
				"ESTCAT": that._estcat
			},
			context: null,
			success: function (OData, response) {
				that._oDialogadd = that._oComponent.getNavigator().createFragment("ESM2.frag.helpopup", that);
				that._Odiahelp = new JSONModel();
				that._Odiahelp.setProperty("/aData", OData.Info);
				that._oDialogadd.control.setModel(that._Odiahelp, "resModel");

				that._oDialogadd.control.openBy(that._oevent.getSource());

				that.getOwnerComponent().getNavigator().releaseBusyDialog();
			},
			error: function (oError) {
				sap.m.MessageToast.show(oError.message);
				that.getOwnerComponent().getNavigator().releaseBusyDialog();
			},
			async: true
		};
		oDatModel.callFunction("/GetVatInfo", mParameters);
		this.getOwnerComponent().getNavigator().requireBusyDialog();

	};
	return PropQual;
});