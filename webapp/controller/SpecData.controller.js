sap.ui.define([
	"sap/base/assert",
	"sap/ui/model/json/JSONModel",
	"sap/m/IconTabFilter",
	"sap/m/Text",
	"sap/ui/core/Fragment",
	"ESM2/util/ControllerBase",
	"ESM2/util/SpecDataError",
	"ESM2/util/Util",
	"ESM2/util/CompType",
	"ESM2/util/PropMode",
	"ESM2/util/SpecDataTabProp",
	"ESM2/util/SpecDataTabPropEdit",
	"ESM2/util/SpecDataTabAttachment",
	"ESM2/util/SpecDataTabMessage",
	"ESM2/util/RecipeTab",
	"ESM2/util/AdhocReport",
	"ESM2/util/SpecDataIdentifier",
	"ESM2/util/QAS"
], function (assert, JSONModel, IconTabFilter, Text, Fragment, ControllerBase, SpecDataError, Util, CompType, PropMode, SpecDataTabProp,
	SpecDataTabPropEdit,
	SpecDataTabAttachment, SpecDataTabMessage, RecipeTab, AdhocReport, Identifier, QAS) {
	"use strict";

	var SpecData = ControllerBase.extend("ESM2.controller.SpecData", {
		onInit: function () {
			// Attach save/reset callbacks.
			// TODO: move save messagetoast to _afterSave?
			this.getOwnerComponent().getNavigator().releaseBusyDialog();

			this.getOwnerComponent().getSaveHandler().attachBeforeSave(jQuery.proxy(this._beforeSave, this));
			this.getOwnerComponent().getSaveHandler().attachAfterSave(jQuery.proxy(this._afterSave, this));
			this.getOwnerComponent().getSaveHandler().attachAfterReset(jQuery.proxy(this._afterReset, this));
			this._navbartr = 0;
			// Construct page model.

			// var oModel = new JSONModel("./view/treetabledata.json");
			// this.byId("TreeTableBasic").setModel(oModel);
			// this._oPageModel = new JSONModel();   //test

			var oPage = this.byId("ictb"); //test
			// oPage.setModel(this._oPageModel, "pageModel");   //test
			this._objlay = this.byId("ictb1");
			// Setup error popover.

			this._oErrorPopover = new SpecDataError(this.getOwnerComponent(), this.getView());

			// Setup tabs.
			// FIXMEVC: use classnames -> simplify using for loop?

			this._aTabControllers = [];

			this._oTabControllerPropNonEditable = new SpecDataTabProp(this.getOwnerComponent(), false);
			this._setupTab(this._oTabControllerPropNonEditable);

			this._oTabControllerPropEditable = new SpecDataTabPropEdit(this.getOwnerComponent(), true);
			this._setupTab(this._oTabControllerPropEditable);

		},

		// 2224
		onnavtab: function (oevent) {
			var objpgly = this.byId("ictb1");
			// if (this._navbartr == 0) {

			// var test1 = objpgly.getAggregation("_anchorBar");
			// var anchbarctnt = test1.getAggregation("content");
			// var anchbarmenuitm = anchbarctnt[1].getAggregation("menu");
			// var menustr = null;
			// for (var n = 0; n < anchbarmenuitm.getItems().length; n++) {
			// 	menustr = anchbarmenuitm.getItems()[n].getProperty("text");
			// 	if (menustr == "") {

			// 		anchbarmenuitm.removeItem(n);
			// 		n--;
			// 	}
			// }
			// this._navbartr++;
			// } else {
			// if (!this.secondrun) {
			// 	var test1 = this._anchorbar.getAggregation("_anchorBar");
			// 	var anchbarctnt = test1.getAggregation("content");
			// 	var anchbarmenuitm = anchbarctnt[1].getAggregation("menu");
			// 	var anchbarmenuitm1 = anchbarctnt[2].getAggregation("menu");
			// 	var menustr = null;
			// 	for (var n = 0; n < anchbarmenuitm.getItems().length; n++) {
			// 		menustr = anchbarmenuitm.getItems()[n].getProperty("text");
			// 		if (menustr == "") {

			// 			anchbarmenuitm.removeItem(n);
			// 			n--;
			// 		}
			// 	}
			// 	for (var n = 0; n < anchbarmenuitm1.getItems().length; n++) {
			// 		menustr = anchbarmenuitm1.getItems()[n].getProperty("text");
			// 		if (menustr == "") {

			// 			anchbarmenuitm1.removeItem(n);
			// 			n--;
			// 		}
			// 	}
			// }
			var key = objpgly.getSelectedSection();

			// objpgly.getAggregation("_anchorBar").scrollToSection(objpgly.getSections()[1].getSubSections()[10].getId());
			// var sections = objpgly.getSections();
			// var subsections = sections[1].getSubSections();
			// objpgly._scrollTo(subsections[9].getId());
			this._key = key;
			if (key.includes("maintain") || key.includes("ident")) {
				this._onEdit();
				objpgly.setShowFooter(true);
				this.byId("icnupld2").setVisible(true);
				this.byId("icnupld1").setVisible(true);
			} else if (key.includes("attachments") || key.includes("chat")) {
				objpgly.setShowFooter(false);
				this.byId("icnupld2").setVisible(false);
				this.byId("icnupld1").setVisible(false);
				this._onCancel();
			} else {
				objpgly.setShowFooter(false);
				this.byId("icnupld2").setVisible(false);
				this.byId("icnupld1").setVisible(false);

				this._onCancel();
			}

		},
		// 2224
		onBeforeShow: function (oViewParam) {
			// Read parameters.

			this._oSpecificationSUBIDKey = null;

			var sSUBID = oViewParam.SUBID;
			if (sSUBID != null) {
				this._oSpecificationSUBIDKey = {
					SUBID: sSUBID,
					KEYDATE: new Date()
				};
			}

			// Determine if we need to switch to edit mode after successful data fetch.

			this._bNeedEditMode = false;

			var oParams = oViewParam["?query"];
			if (oParams && oParams.mode == "edit")
				this._bNeedEditMode = true;

			// Disable all controls before showing the view.

			this._setEnablePage(false);

			// In case of deep-linking:
			// - No unsaved changes dialog (since url hash is already updated).
			// - Clear storage.

			this._clearStorage();

			// Initialize save indicators
			// (see https://experience.sap.com/fiori-design-web/manage-objects-with-the-global-flow).

			this._initSave();
			// Initialize every tab.

			for (var i = 0; i < this._aTabControllers.length; i++) {
				var oTabController = this._aTabControllers[i];
				oTabController.onBeforeShow();
			}
		},
		_onAdhocReport: function () {
			// Ask user to save unsaved changes.

			var oI18nBundle = this.getOwnerComponent().getI18nBundle();
			this.getOwnerComponent().getSaveHandler().confirmAndSave(oI18nBundle.getText("SpecDetail.adhocReportConfirm"), false, jQuery.proxy(
				this._onAdhocReportContinue, this));
		},
		_onAdhocReportContinue: function (bContinue) {
			if (bContinue) {
				// Bring-up adhoc report dialog.

				if (!this._oAdhocReport)
					this._oAdhocReport = new AdhocReport(this.getOwnerComponent(), this.getView());

				this._oAdhocReport.open(this.oSpecificationkey);
			}
		},
		onAfterShowInited: function () {
			if (!this._oSpecificationSUBIDKey) {
				Util.showMessageBox(this.getOwnerComponent(), {
					type: Util.MessageBoxType.Error,
					message: this.getOwnerComponent().getI18nBundle().getText("SpecData.error.param"),
				}, jQuery.proxy(this._noParameter, this));

				return;
			}

			// Resolve SUBID to RECNROOT, ACTN.

			this._fetchSpecificationInfo();
		},
		//VC change
		_formatTitle: function (sSUBID, sIDTYPE_VALUE, sID_VALUE) {
			var oI18nBundle = this.getOwnerComponent().getI18nBundle();
			var sTitle;

			if (sIDTYPE_VALUE && sID_VALUE) // Test for null and empty value.
				sTitle = oI18nBundle.getText("SpecDetail.title.final", [sSUBID, sIDTYPE_VALUE, sID_VALUE]);
			else
				sTitle = oI18nBundle.getText("SpecDetail.title.initial", [sSUBID]);

			return sTitle;
		},
		// VC change
		getHandledRoutes: function () {
			var aHandledRoutes = ["SpecData", "SpecData_SUBID"];
			return aHandledRoutes;
		},

		_setupTab: function (oTabController) {

			// if (this.secondrun) {

			// 	this._aTabControllers.splice(2, 0, oTabController);
			// } else {

			this._aTabControllers.push(oTabController);
			// }

			// It is easier if we bind visible in a central place, instead of repeating it in every view.

			var oControl = oTabController.getControl();
			oControl.bindProperty("visible", {
				path: "pageModel>/enablePage"
			});
			// if(oTabController == "_filter0")
			// {
			// oControl.bindProperty("key","prereq");
			// oControl.bindProperty("icon","prereq");
			// oControl.bindProperty("icon","prereq");
			// }

			// var oPage = this.byId("page");

			// oPage.addSection(oControl);

			// this.otab = this.byId("ictb");
			// this.otab.addItem(oControl);
			this.otab = this.byId("ictb1");
			this.otab.addSection(oControl);
		},

		_noParameter: function () {
			// FIXMEVC: navigate back?
		},

		_fetchSpecificationInfo: function () {
			assert(this._oSpecificationSUBIDKey, "oSpecificationSUBIDKey should be set");

			var oRequest = this.getOwnerComponent().getODataManager().requestForFetchSpecificationInfo(this._oSpecificationSUBIDKey);
			this.getOwnerComponent().getODataManager().executeRequest(oRequest,
				jQuery.proxy(this._fetchSpecificationInfoSuccess, this),
				jQuery.proxy(this._fetchSpecificationInfoError, this));
				
				var userinfo = this.getOwnerComponent().getModel("userModel").getData();              
		},

		_fetchSpecificationInfoSuccess: function (oData) {
			var oSpecificationKey = {
				RECNROOT: oData.RECNROOT,
				ACTN: oData.ACTN
			};
			this.oSpecificationkey = oSpecificationKey;
			this.getOwnerComponent().getSaveHandler().setSpecificationKey(oSpecificationKey);

			// this._initialFetch(this.oSpecificationkey);
			var oRequest = this.getOwnerComponent().getODataManager().requestForFetchLogo(oSpecificationKey);
			this.getOwnerComponent().getODataManager().executeRequest(oRequest,
				jQuery.proxy(this._logosuccess, this), jQuery.proxy(this._logoerror, this));
		},
		_logosuccess: function (oLogo) {

			// var logod = oLogo.entries;
			// var oLogoKey = {
			// 	DOKAR: logod[0].DOKAR,
			// 	DOKNR: logod[0].DOKNR,
			// 	DOKVR: logod[0].DOKVR,
			// 	DOKTL: logod[0].DOKTL
			// };

			// var oLogoKey1 = {
			// 	DOKAR: logod[1].DOKAR,
			// 	DOKNR: logod[1].DOKNR,
			// 	DOKVR: logod[1].DOKVR,
			// 	DOKTL: logod[1].DOKTL
			// };
			// if (logod[0].DOKAR != "")
			// 	var sURL = this.getOwnerComponent().getODataManager().getDocDownloadURL(oLogoKey);
			// var sURL1 = this.getOwnerComponent().getODataManager().getDocDownloadURL(oLogoKey1);
			// this.byId("icnspec").setSrc(sURL);
			// this.byId("icnspec1").setSrc(sURL);

			// this.byId("imglog").setSrc(sURL1);
			this._initialFetch(this.oSpecificationkey);
			// FIXMEVC: what to do in case of error? navigate back?
		},
		_logoerror: function (oLogo) {

			this._initialFetch(this.oSpecificationkey);
			// FIXMEVC: what to do in case of error? navigate back?
		},
		_fileupld: function (oEvent) {
			var keymod = new JSONModel();
			keymod.setProperty("logokey", null);
			if (!this._oDiag) {
				this._oDiag = this.getOwnerComponent().getNavigator().createFragment("ESM2.frag.specimage", this);
			}
			// this.getView().addDependent(this._oDiag);
			this._oDiag.control.open();
		},
		_onClosespecimg: function (oEvent) {
			this._oDiag.control.close();
		},
		_onupld: function (oEvent) {

			var upldURL = this.getOwnerComponent().getODataManager().getDocUploadURL();

			var filecomp = oEvent.getSource();
			filecomp.setUploadUrl(upldURL);

			var slugval = filecomp.getValue() + "/" + "Image File";
			var headerParam = new sap.ui.unified.FileUploaderParameter();
			var headerParam1 = new sap.ui.unified.FileUploaderParameter();
			var headerParam2 = new sap.ui.unified.FileUploaderParameter();

			headerParam.setName("slug");
			headerParam.setValue(slugval);

			headerParam1.setName("Accept");
			headerParam1.setValue("application/json");

			headerParam2.setName("x-csrf-token");
			headerParam2.setValue(this.getOwnerComponent().getODataManager().getSecurityToken());

			filecomp.addHeaderParameter(headerParam);
			filecomp.addHeaderParameter(headerParam1);
			filecomp.addHeaderParameter(headerParam2);
			filecomp.upload();
			this.getOwnerComponent().getNavigator().requireBusyDialog();
		},
		_onUploadCompletelg: function (oEvent2) {
			this.getOwnerComponent().getNavigator().releaseBusyDialog();

			var iStatus = oEvent2.getParameter("status");
			var sRawResponse = oEvent2.getParameter("responseRaw");
			var sFilename = oEvent2.getParameter("fileName");
			this.getOwnerComponent().getODataManager().parseRawResponse(iStatus, sRawResponse, "CharEditDocLink.error.upload", jQuery.proxy(
				this._onUploadCompleteSuccess,
				this, sFilename));

		},
		_onUploadCompleteSuccess: function (sFilename, oData) {
			// Create doclink.
			// var oEvent = this._oevent;
			// var iLength = this._collection.getData().length;
			this._oLogoKey = {
				ACTN: this.oSpecificationkey.ACTN,
				DOKAR: oData.DOKAR,
				DOKNR: oData.DOKNR,
				DOKVR: oData.DOKVR,
				DOKTL: oData.DOKTL,
				RECNROOT: this.oSpecificationkey.RECNROOT
			};
			var oSpecKey = {
				DOKAR: oData.DOKAR,
				DOKNR: oData.DOKNR,
				DOKVR: oData.DOKVR,
				DOKTL: oData.DOKTL
			};

			var sURL = this.getOwnerComponent().getODataManager().getDocDownloadURL(oSpecKey);
			this.byId("icnspec").setSrc(sURL);
			this.byId("icnspec1").setSrc(sURL);
			this._imagechanged = true;
		},
		_fetchSpecificationInfoError: function () {
			// FIXMEVC: what to do in case of error? navigate back?
		},

		_initialFetch: function (oSpecificationKey) {
			// FIXMEVC: It would be nice, if we can collect requests from tab controllers, instead of hardcoding them.

			var oPropTreeRequest = this.getOwnerComponent().getModelManager().requestForFetchPropertyBySpecificationKey(oSpecificationKey);
			// FIXMEVC: also request list of properties to be displayed/edited.
			var activityparam = jQuery.sap.getUriParameters().get("ACTIVITY");
			if (activityparam)
				oSpecificationKey.actvtparam = activityparam;
			else
				oSpecificationKey.actvtparam = "";

			//specnum
			var aRequests = [];
			var oHeaderInfoRequest = this.getOwnerComponent().getModelManager().requestForFetchHeaderInfoBySpecificationKey(oSpecificationKey);

			aRequests.push(oHeaderInfoRequest);
			aRequests.push(oPropTreeRequest);

			//specnum
			// Execute data fetches.

			this.getOwnerComponent().getModelManager().executeFetchRequests(aRequests, jQuery.proxy(this._initialFetchCallback, this));
		},

		_initialFetchCallback: function (oExecuteData, bckenddat) {
			if (oExecuteData.allSuccess) {

				//specnum
				var specval = oExecuteData.responses[0].response._oModel.oData[0].ID_VALUE;
				var specid = this._oSpecificationSUBIDKey.SUBID;
				var headdat = oExecuteData.responses[0].response._oModel.oData[0];

				var jmod = new JSONModel();
				jmod.setProperty("/mandtchngdfieldsno", 0);

				this.byId("t3").setText(specid);
				this.byId("t4").setText(specid);
				this.byId("t1").setText(headdat.ID_VALUE);
				this.byId("t2").setText(headdat.ID_VALUE);
				this.byId("txthd1").setText(headdat.SUBCAT_VALUE);
				this.byId("txthd2").setText(headdat.AUTHGRP_NAME);
				this.byId("txthd3").setText(headdat.STATUS_DESC);
				this._compindref = this.byId("completionind");
				this._compindref.setModel(jmod);
				var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "yyyy-MM-dd"
				});
				var dateFormatted = dateFormat.format(headdat.CRDAT);

				this.byId("dpcreate").setText(dateFormatted);

				var spectxt = this.getOwnerComponent().getI18nBundle().getText("specnum");
				// this.byId("txthd1").setText(specval + "\n" + spectxt + specid);
				// this.byId("txthd2").setText("Specification ID: "+specid);
				//specnum
				var hdinfo = oExecuteData.responses[0].response;
				var oPropTreeCollection = oExecuteData.responses[1].response;
				var oPropTreeAdditional = oPropTreeCollection.getAdditional();

				if (bckenddat.responses[2] != null) {
					var tst = bckenddat.responses[2].response[0].__metadata.type;
					var propinf_resp = bckenddat.responses[2].response;
					this.secondrun = false;
				} else {
					this.secondrun = true;
					var tst = bckenddat.responses[0].response[0].__metadata.type;
					var propinf_resp = bckenddat.responses[0].response;
				}
				this._aPropInfos = [];
				var udt = "UDT";
				if (tst == "GMT.VC_ODATA_SRV.GetVATList") {
					for (var i = 0; i < propinf_resp.length; i++) {

						var propmode, udtinst = false;
						if (propinf_resp[i].Layout == "TABLE") {
							propmode = PropMode.Composition;
							this._mlc = false;
						} else if (propinf_resp[i].Layout == "FORM") {
							propmode = PropMode.Instance;
							this._mlc = false;
						} else if (propinf_resp[i].Layout == "TREE TABLE") {
							this._mlc = true;
							propmode = PropMode.Composition;
						} else if (propinf_resp[i].Layout == "PHRASE") {
							propmode = PropMode.Phrase;
							this._mlc = false;
						} else if (propinf_resp[i].Layout == "UDT_INST") {
							propmode = PropMode.Instance;
							this._mlc = false;
							udtinst = true;
						}
						// var oPropModel = new JSONModel();
						var prpinfline = {
							ESTCAT: propinf_resp[i].Estcat,
							propMode: propmode,
							editable: propinf_resp[i].Editable,
							sortorder: propinf_resp[i].SortOrder,
							PhrKey: propinf_resp[i].Phrkey,
							UDT: propinf_resp[i].NumOfTexts,
							UDTPos: "",
							MLC: this._mlc,
							UDTINST: udtinst,
							Layout: propinf_resp[i].Layout,
							Visible: true,
							PropListId: propinf_resp[i].PropertyListId,
							propid: null,
							grpfilter: propinf_resp[i].GroupFilter
						};
						this._aPropInfos.push(prpinfline);
					}
				} else {
					// FIXMEVC: also request list of properties to be displayed/edited.
					// FIXMEVC: handle cases if this is empty(inst/comp)
					this._aPropInfos = [{
						ESTCAT: null,
						propMode: null,
						editable: false
					}];
				}
				this._fetchInstance(oPropTreeAdditional, hdinfo);
			} else {
				// On error, display dialog.

				Util.showExecuteError(this.getOwnerComponent(), "SpecData.error.fetch", oExecuteData, true, jQuery.proxy(this._initialFetchClose,
					this));
			}
		},

		_initialFetchClose: function () {
			// FIXMEVC: what to do in case of error?: navigate back?
		},

		_fetchInstance: function (oPropTreeAdditional, hdinfo) {
			var oNodesByESTCAT = oPropTreeAdditional.nodesByESTCAT; //FIXMEVC:can we use nodesByESTCAT here, or is it internal?
			var aUnknownESTCATs = [];
			var aRequests = [];
			var hdinfo1 = hdinfo._oModel.oData[0];

			for (var i = 0; i < this._aPropInfos.length; i++) {
				var oPropInfo = this._aPropInfos[i];
				var sESTCAT = oPropInfo.ESTCAT;
				var oTreeNode = oNodesByESTCAT[sESTCAT];
				var phrky = this._aPropInfos[i].PhrKey;

				if (!oTreeNode && this._aPropInfos[i].propMode != "Phrase") {
					// if (!oTreeNode ) {
					aUnknownESTCATs.push(sESTCAT);
					continue;
				}

				if (this._aPropInfos[i].propMode == "Phrase") {
					var oTreeNode2 = {
						RECNROOT: "",
						ACTN: "",
						MENID: "",
						ID: "",
						TEXT: "",
						ESTCAT: "",
						Phrkey: phrky,
						MLC: this._aPropInfos[i].MLC,
						PROPLIST_ID : this._aPropInfos[i].PropListId
					};
				} else {
					var oTreeNode2 = {
						RECNROOT: oTreeNode.RECNROOT,
						ACTN: oTreeNode.ACTN,
						MENID: oTreeNode.MENID,
						ID: oTreeNode.ID,
						TEXT: oTreeNode.TEXT,
						ESTCAT: oTreeNode.ESTCAT,
						Phrkey: phrky,
						MLC: this._aPropInfos[i].MLC,
						PROPLIST_ID : this._aPropInfos[i].PropListId
					};

				}
				oPropInfo.treeNode = oTreeNode2;

				var oRequest = this.getOwnerComponent().getModelManager().requestForFetchInstanceByPropertyKey(oTreeNode2); //FIXMEVC:get req from propctrl?
				aRequests.push(oRequest);
			}
			// dynamic prop
			for (var i = 0; i < this._aPropInfos.length; i++) {
				var oPropInfo = this._aPropInfos[i];
				var sESTCAT = oPropInfo.ESTCAT;
				var oTreeNode = oNodesByESTCAT[sESTCAT];

				if (!oTreeNode && this._aPropInfos[i].propMode != "Phrase" && this._aPropInfos[i].propMode != "doc") {
					// if (!oTreeNode) {
					this._aPropInfos.splice(i, 1);
					i--;
					continue;
				}
			}
			// dynamic prop
			// Display errors.

			// if (aUnknownESTCATs.length > 0) {
			// 	var sDetail = aUnknownESTCATs.join("\n");
			// 	Util.showMessageBox(this.getOwnerComponent(), {
			// 		type: Util.MessageBoxType.Error,
			// 		message: this.getOwnerComponent().getI18nBundle().getText("SpecData.error.unknownProp"),
			// 		details: sDetail
			// 	});
			// 	//FIXMEVC:navigate back on error?

			// 	return;
			// }

			// If there are no requests, then we are finished.

			if (aRequests.length == 0) {
				this._fetchFinish();
				return;
			}

			// Execute data fetches.

			this.getOwnerComponent().getModelManager().executeFetchRequests(aRequests, jQuery.proxy(this._fetchInstanceCallback, this));
		},

		_fetchInstanceCallback: function (oExecuteData, oBackendExecuteData) {
			if (oExecuteData.allSuccess) {
				var aExecuteResponses = oExecuteData.responses;
				assert(this._aPropInfos.length == aExecuteResponses.length, "Length inconsistency");
				var instinf = [],
					instdoc = [],
					treenode3 = null;
				var txtcmp = "COMP_TYPE";
				instinf[txtcmp] = "Phrase";
				instdoc[txtcmp] = "DocLink";
				for (var i = 0; i < this._aPropInfos.length; i++) {
					var oPropInfo = this._aPropInfos[i];
					if (oPropInfo.propMode != "Phrase" && oPropInfo.propMode != "doc") {
						var oCollection = aExecuteResponses[i].response;
						var oInstanceAdditional = oCollection.getAdditional();

						oPropInfo.instanceInfo = oInstanceAdditional.info;
						//oPropInfo.instanceInfo = oCollection.info;

						if (oPropInfo.propMode == PropMode.Instance) {
							treenode3 = oPropInfo.treeNode;
							if (oPropInfo.UDT > 0) {
								var aInstances = oCollection.getEntries();
								// var aInstances = oCollection.entries;
								assert(aInstances.length > 0, "aInstances.length should be > 0"); //FIXMEVCX:check for status?

								oPropInfo._instanceKey = aInstances[0];
							}
							oPropInfo.collection = oCollection;
						} else {
							// Fetch detail for the first instance.

							var aInstances = oCollection.getEntries();
							// var aInstances = oCollection.entries;
							assert(aInstances.length > 0, "aInstances.length should be > 0"); //FIXMEVCX:check for status?
							var instky = jQuery.extend(true, [], aInstances[0]);
							instky.PROPLIST_ID = oPropInfo.PropListId;
							oPropInfo._instanceKey = instky;
							
							var instkey = aInstances[0];
						}
					} else {

						oPropInfo.propMode = "Composition";
						oPropInfo.instanceInfo = instinf;
					}

				}
				this._fetchDetail();
			} else {
				// On error, display dialog.

				Util.showExecuteError(this.getOwnerComponent(), "SpecData.error.fetch", oExecuteData, true, jQuery.proxy(this._fetchInstanceClose,
					this));
			}
		},

		_fetchInstanceClose: function () {
			// FIXMEVC: what to do in case of error?: navigate back?
		},

		_fetchDetail: function () {
			var aUnknownComps = [];
			var aRequests = [];
			var proplist = this._aPropInfos;
			var instinf = [];
			var txtcmp = "COMP_TYPE";
			instinf[txtcmp] = "UserDefinedText";

			for (var i = 0; i < proplist.length; i++) {
				if (proplist[i].UDT != 0)
				// if(proplist[i].instanceInfo.COMP_LABEL == "Allergens")
				{
					var udtprop = {
						ESTCAT: proplist[i].ESTCAT,
						propMode: proplist[i].propMode,
						// propMode: "Composition",
						editable: "",
						sortorder: "",
						PhrKey: "udt",
						UDT: "",
						_instanceKey: proplist[i]._instanceKey,
						instanceInfo: instinf,
						Layout: proplist[i].Layout
					};
					this._aPropInfos[i].UDTPos = this._aPropInfos.length;
					this._aPropInfos.push(udtprop);
				} else {
					this._aPropInfos[i].UDTPos = null;
				}
			}

			for (var i = 0; i < this._aPropInfos.length; i++) {
				var oPropInfo = this._aPropInfos[i];
				var oInstanceKey = oPropInfo._instanceKey;
				var oRequest = null;

				switch (oPropInfo.propMode) {
				case PropMode.Instance: // Already handled in _fetchInstanceCallback.
					if (oPropInfo.PhrKey == "udt") {
						oInstanceKey.Layout = oPropInfo.Layout;
						oRequest = this.getOwnerComponent().getModelManager().requestForFetchUserDefinedTextByInstanceKey(oInstanceKey);
					}
					break;

				case PropMode.Composition:
					var sCOMP_TYPE = oPropInfo.instanceInfo.COMP_TYPE;

					switch (sCOMP_TYPE) {
						case CompType.Qual:
						oInstanceKey.proplistid = oPropInfo.PropListId;
						oRequest = this.getOwnerComponent().getModelManager().requestForFetchQualByInstanceKey(oInstanceKey);
						break;

					case CompType.MultiComp:
						this._multicmpestcat = oPropInfo.ESTCAT;
						oRequest = this.getOwnerComponent().getModelManager().requestForFetchMultiCompositionByInstanceKey(oInstanceKey); //FIXMEVC:implement requestForFetchMultiCompositionByInstanceKey
						break;

					case CompType.Quant:
						oInstanceKey.proplistid = oPropInfo.PropListId;
						oRequest = this.getOwnerComponent().getModelManager().requestForFetchQuantByInstanceKey(oInstanceKey); //FIXMEVC:implement requestForFetchMultiCompositionByInstanceKey
						break;

					case CompType.Phrase:
						var phrkey = oPropInfo.PhrKey;
						oRequest = this.getOwnerComponent().getODataManager().requestForFetchText(phrkey);
						var ndmetadata = [],
							txtnm = "name",
							phrkeytxt = "Phrkey";
						ndmetadata[txtnm] = "Phrase";
						ndmetadata[phrkeytxt] = phrkey;
						oRequest.nodeMetadata = ndmetadata;
						break;

					case CompType.UserDefinedText:

						oInstanceKey.Layout = oPropInfo.Layout;
						oRequest = this.getOwnerComponent().getModelManager().requestForFetchUserDefinedTextByInstanceKey(oInstanceKey);
						break;
					default:
						var sUnknownComp = oPropInfo.ESTCAT + ": " + sCOMP_TYPE; //FIXMEVC:i18n?
						aUnknownComps.push(sUnknownComp);
					}
					break;

				default:
					assert(false, "propMode is unknown");
				}

				if (oRequest) {
					oPropInfo._fetchDetail = true; //FIXMEVC:or use _instancekey?
					aRequests.push(oRequest);
				}
			}

			// Display errors.

			if (aUnknownComps.length > 0) {
				var sDetail = aUnknownComps.join("\n");
				Util.showMessageBox(this.getOwnerComponent(), {
					type: Util.MessageBoxType.Error,
					message: this.getOwnerComponent().getI18nBundle().getText("SpecData.error.unknownComp"),
					details: sDetail
				}); //FIXMEVC:navigate back on error?

				return;
			}

			// If there are no requests, then we are finished.

			if (aRequests.length == 0) {
				this._fetchFinish();
				return;
			}

			// Execute data fetches.

			this.getOwnerComponent().getModelManager().executeFetchRequests(aRequests, jQuery.proxy(this._fetchDetailCallback, this));
		},

		_fetchDetailCallback: function (oExecuteData) {
			if (oExecuteData.allSuccess) {
				var aExecuteResponses = oExecuteData.responses;
				var iExecuteResponseIndex = 0;
				var tst = 0;
				for (var i = 0; i < this._aPropInfos.length; i++) {
					var oPropInfo = this._aPropInfos[i];
					var pos = oPropInfo.UDT;
					if (oPropInfo._fetchDetail || oPropInfo.PhrKey == "udt") {
						//FIXMEVC:or use _instancekey?
						var indx = iExecuteResponseIndex;

						var tst1 = tst++;
						var oCollection = aExecuteResponses[iExecuteResponseIndex++].response;
						var dat = oCollection.getEntries();
						oPropInfo.collection = oCollection;
					}
				}
				this._fetchFinish();
			} else {
				// On error, display dialog.

				Util.showExecuteError(this.getOwnerComponent(), "SpecData.error.fetch", oExecuteData, true, jQuery.proxy(this._fetchDetailClose,
					this));
			}
		},

		_fetchDetailClose: function () {
			// FIXMEVC: what to do in case of error?: navigate back?
		},

		_fetchFinish: function () {
			// Display properties.
			var mandatoryfieldcounter = 0;

			for (var m = 0; m < this._aPropInfos.length; m++) {
				var oPropInfo = this._aPropInfos;
				oPropInfo[m].hasPhrase = false;
				oPropInfo[m].PhraseInserted = false;
				oPropInfo[m].PhraseCount = 0;
				oPropInfo[m].Phrase = null;
			}
			var phrtxt = [];
			for (var m = 0; m < this._aPropInfos.length; m++) {

				var oPropInfo = this._aPropInfos[m];
				if (oPropInfo.ESTCAT != "") {
					if (oPropInfo.Layout == "TABLE") {
						if (oPropInfo.instanceInfo.COMP_TYPE == "QUAL") {
							var aCharHeaders = oPropInfo.collection.getAdditional().parent.CompHeader;
						} else if (oPropInfo.instanceInfo.COMP_TYPE == "QUANT") {
							var aCharHeaders = oPropInfo.collection.getAdditional().parent.CompHeaderqnt;
						}
						for (var i = aCharHeaders.length - 1; i >= 0; i--) {
							var oCharHeader = aCharHeaders[i];

							if (oCharHeader.AsCheckBox) {
								if (oCharHeader._Linked_prop != "") {
									for (var p = 0; p < this._aPropInfos.length; p++) {
										if (this._aPropInfos[p].PropListId == oCharHeader._Linked_prop) {
											this._aPropInfos[p].Visible = oPropInfo.collection.getModel().getProperty("/0/" + oCharHeader._sFieldName + "/0/value");

										}
									}
								}
							}
						}
					} else if (oPropInfo.Layout == "FORM" && oPropInfo.PhrKey != "udt") {
						var aCharHeaders = oPropInfo.collection.getAdditional().charHeaderInfo.byOrder;
						for (var i = aCharHeaders.length - 1; i >= 0; i--) {
							var oCharHeader = aCharHeaders[i];

							if (oCharHeader._isCheckBox) {
								if (oCharHeader._Linked_prop != "") {
									for (var p = 0; p < this._aPropInfos.length; p++) {
										if (this._aPropInfos[p].PropListId == oCharHeader._Linked_prop) {
											this._aPropInfos[p].Visible = oPropInfo.collection.getModel().getProperty("/0/" + oCharHeader._sFieldName + "/0/value");

										}
									}
								}
							}
						}
					}

				}
				// if (oPropInfo[m].instanceInfo.COMP_TYPE == "Phrase" && !oPropInfo[m].PhraseInserted) {
				// 	var j = m;
				// 	var k = 0;
				// 	do {
				// 		k++;
				// 		phrtxt.push(oPropInfo[m].collection.getModel().getData()[0][0].Phrtxt);
				// 		oPropInfo[j].PhraseInserted = true;
				// 		j++;
				// 	}
				// 	while (oPropInfo[j].instanceInfo.COMP_TYPE == "Phrase");
				// 	oPropInfo[j].hasPhrase = true;
				// 	oPropInfo[j].PhraseCount = k;
				// 	oPropInfo[j].Phrase = phrtxt;
				// }

			}

			for (var i = 0; i < this._aPropInfos.length; i++) {
				var oPropInfo = this._aPropInfos[i];

				if (oPropInfo.PhrKey != "doc" & oPropInfo.ESTCAT != "") {
					if (oPropInfo.UDTPos != null && oPropInfo.PhrKey != "udt") {

						if (oPropInfo.instanceInfo.COMP_TYPE == "QUAL" || oPropInfo.instanceInfo.COMP_TYPE == "QUANT") {

							if (oPropInfo.instanceInfo.COMP_TYPE == "QUANT") {
								var aCharHeaders = oPropInfo.collection.getAdditional().parent.CompHeaderqnt;
							} else {
								var aCharHeaders = oPropInfo.collection.getAdditional().parent.CompHeader;
							}

							var coldatval = oPropInfo.collection.getModel().getData();
							for (var l = 0; l < coldatval.length; l++) {
								var bindpath = "/" + l + "/Mandatoryfields";
								oPropInfo.collection.getModel().setProperty(bindpath, []);
							}

							for (var k = 0; k < aCharHeaders.length; k++) {
								if (aCharHeaders[k].MANDATORY) {
									mandatoryfieldcounter = mandatoryfieldcounter + oPropInfo.collection.getModel().getData().length;
									if (oPropInfo.collection.getModel().getData().length != 0) {
										var colhdtxt = aCharHeaders[k].getFieldName();
										var coldatval = oPropInfo.collection.getModel().getData()[0].colhdtxt;
										for (var l = 0; l < coldatval.length; l++) {
											var bindpath = "/" + l + "/" + colhdtxt;
											var bindpathmf = "/" + l + "/Mandatoryfields";
											var mandfarr = oPropInfo.collection.getModel().getProperty(bindpathmf);
											var mandfarrsub = {
												"Label": colhdtxt,
												"changecounter": 0,
												"changevalues": []
											};
											mandfarr.push(mandfarrsub);
											oPropInfo.collection.getModel().setProperty(bindpathmf, mandfarr);
											var propval = oPropInfo.collection.getModel().getProperty(bindpath);
											if (Array.isArray(propval)) {
												for (var m = 0; m < propval.length; m++) {
													if (propval[m] != "") {

														var jmod = this._compindref.getModel();
														var mandtcnt = jmod.getProperty("/mandtchngdfieldsno");
														mandtcnt++;
														jmod.setProperty("/mandtchngdfieldsno", mandtcnt);
													}
												}
											} else {
												var jmod = this._compindref.getModel();
												var mandtcnt = jmod.getProperty("/mandtchngdfieldsno");
												mandtcnt++;
												jmod.setProperty("/mandtchngdfieldsno", mandtcnt);
											}
										}
									}
								}
							}
						} else if (oPropInfo.instanceInfo.COMP_TYPE != "MLVL_COMP") {
							var aCharHeaders = oPropInfo.collection.getAdditional().charHeaderInfo.byOrder;

							var coldatval = oPropInfo.collection.getModel().getData();
							for (var l = 0; l < coldatval.length; l++) {
								var bindpath = "/" + l + "/Mandatoryfields";
								oPropInfo.collection.getModel().setProperty(bindpath, []);
							}
							for (var k = 0; k < aCharHeaders.length; k++) {
								if (aCharHeaders[k]._mandatory) {

									mandatoryfieldcounter = mandatoryfieldcounter + oPropInfo.collection.getModel().getData().length;
									if (oPropInfo.collection.getModel().getData().length != 0) {
										var colhdtxt = aCharHeaders[k].getFieldName();
										var coldatval = oPropInfo.collection.getModel().getData();
										for (var l = 0; l < coldatval.length; l++) {
											var bindpath = "/" + l + "/" + colhdtxt;
											var bindpathmf = "/" + l + "/Mandatoryfields";
											var mandfarr = oPropInfo.collection.getModel().getProperty(bindpathmf);
											var mandfarrsub = {
												"Label": colhdtxt,
												"changecounter": 0,
												"changevalues": []
											};
											mandfarr.push(mandfarrsub);
											oPropInfo.collection.getModel().setProperty(bindpathmf, mandfarr);
											var propval = oPropInfo.collection.getModel().getProperty(bindpath);
											if (Array.isArray(propval)) {
												if (aCharHeaders[k]._bIsRealPhrase) {
													for (var m = 0; m < propval.length; m++) {
														if (propval[m].value != "") {

															var jmod = this._compindref.getModel();
															var mandtcnt = jmod.getProperty("/mandtchngdfieldsno");
															mandtcnt++;
															jmod.setProperty("/mandtchngdfieldsno", mandtcnt);
														}
													}
												} else {
													for (var m = 0; m < propval.length; m++) {
														if (propval[m] != "") {

															var jmod = this._compindref.getModel();
															var mandtcnt = jmod.getProperty("/mandtchngdfieldsno");
															mandtcnt++;
															jmod.setProperty("/mandtchngdfieldsno", mandtcnt);
														}
													}
												}

											}
										}
									}
								}
							}
						}

					} else if (oPropInfo.UDTPos == null && oPropInfo.PhrKey != "udt") {

						if (oPropInfo.instanceInfo.COMP_TYPE == "QUAL" || oPropInfo.instanceInfo.COMP_TYPE == "QUANT") {

							if (oPropInfo.instanceInfo.COMP_TYPE == "QUANT") {
								var aCharHeaders = oPropInfo.collection.getAdditional().parent.CompHeaderqnt;
							} else {
								var aCharHeaders = oPropInfo.collection.getAdditional().parent.CompHeader;
							}

							var coldatval = oPropInfo.collection.getModel().getData();
							for (var l = 0; l < coldatval.length; l++) {
								var bindpath = "/" + l + "/Mandatoryfields";
								oPropInfo.collection.getModel().setProperty(bindpath, []);
							}

							for (var k = 0; k < aCharHeaders.length; k++) {
								if (aCharHeaders[k].MANDATORY) {
									mandatoryfieldcounter = mandatoryfieldcounter + oPropInfo.collection.getModel().getData().length;
									if (oPropInfo.collection.getModel().getData().length != 0) {
										var colhdtxt = aCharHeaders[k].getFieldName();
										var coldatval = oPropInfo.collection.getModel().getData()[0].colhdtxt;
										for (var l = 0; l < coldatval.length; l++) {
											var bindpath = "/" + l + "/" + colhdtxt;
											var bindpathmf = "/" + l + "/Mandatoryfields";
											var mandfarr = oPropInfo.collection.getModel().getProperty(bindpathmf);
											var mandfarrsub = {
												"Label": colhdtxt,
												"changecounter": 0,
												"changevalues": []
											};
											mandfarr.push(mandfarrsub);
											oPropInfo.collection.getModel().setProperty(bindpathmf, mandfarr);
											var propval = oPropInfo.collection.getModel().getProperty(bindpath);
											if (Array.isArray(propval)) {
												for (var m = 0; m < propval.length; m++) {
													if (propval[m] != "") {

														var jmod = this._compindref.getModel();
														var mandtcnt = jmod.getProperty("/mandtchngdfieldsno");
														mandtcnt++;
														jmod.setProperty("/mandtchngdfieldsno", mandtcnt);
													}
												}
											} else {
												var jmod = this._compindref.getModel();
												var mandtcnt = jmod.getProperty("/mandtchngdfieldsno");
												mandtcnt++;
												jmod.setProperty("/mandtchngdfieldsno", mandtcnt);
											}
										}
									}
								}
							}
						} else if (oPropInfo.instanceInfo.COMP_TYPE != "MLVL_COMP") {
							var aCharHeaders = oPropInfo.collection.getAdditional().charHeaderInfo.byOrder;

							var coldatval = oPropInfo.collection.getModel().getData();
							for (var l = 0; l < coldatval.length; l++) {
								var bindpath = "/" + l + "/Mandatoryfields";
								oPropInfo.collection.getModel().setProperty(bindpath, []);
							}
							for (var k = 0; k < aCharHeaders.length; k++) {
								if (aCharHeaders[k]._mandatory) {

									mandatoryfieldcounter = mandatoryfieldcounter + oPropInfo.collection.getModel().getData().length;
									if (oPropInfo.collection.getModel().getData().length != 0) {
										var colhdtxt = aCharHeaders[k].getFieldName();
										var coldatval = oPropInfo.collection.getModel().getData();
										for (var l = 0; l < coldatval.length; l++) {
											var bindpath = "/" + l + "/" + colhdtxt;
											var bindpathmf = "/" + l + "/Mandatoryfields";
											var mandfarr = oPropInfo.collection.getModel().getProperty(bindpathmf);
											var mandfarrsub = {
												"Label": colhdtxt,
												"changecounter": 0,
												"changevalues": []
											};
											mandfarr.push(mandfarrsub);
											oPropInfo.collection.getModel().setProperty(bindpathmf, mandfarr);
											var propval = oPropInfo.collection.getModel().getProperty(bindpath);
											if (Array.isArray(propval)) {
												if (aCharHeaders[k]._bIsRealPhrase) {
													for (var m = 0; m < propval.length; m++) {
														if (propval[m].value != "") {

															var jmod = this._compindref.getModel();
															var mandtcnt = jmod.getProperty("/mandtchngdfieldsno");
															mandtcnt++;
															jmod.setProperty("/mandtchngdfieldsno", mandtcnt);
														}
													}
												} else {
													for (var m = 0; m < propval.length; m++) {
														if (propval[m] != "") {

															var jmod = this._compindref.getModel();
															var mandtcnt = jmod.getProperty("/mandtchngdfieldsno");
															mandtcnt++;
															jmod.setProperty("/mandtchngdfieldsno", mandtcnt);
														}
													}
												}
											} else {

											}
										}
									}
								}
							}
						}
					}
				}
			}
			// if(this.secondrun)
			// {
			// 	this._objlay.destroySections();
			// 	this._oTabControllerPropNonEditable = new SpecDataTabProp(this.getOwnerComponent(), false);
			// this._setupTab(this._oTabControllerPropNonEditable);

			// this._oTabControllerPropEditable = new SpecDataTabPropEdit(this.getOwnerComponent(), true);
			// this._setupTab(this._oTabControllerPropEditable);
			// }
			for (var i = 0; i < this._aPropInfos.length; i++) {
				var oPropInfo = this._aPropInfos[i];
				// add condition to add to the document
				if (oPropInfo.PhrKey != "doc") {
					if (oPropInfo.UDTPos != null && oPropInfo.PhrKey != "udt" && (!this.secondrun || oPropInfo.instanceInfo.COMP_TYPE == "MLVL_COMP")) {
						var oTabController = oPropInfo.editable ? this._oTabControllerPropEditable : this._oTabControllerPropNonEditable;
						// if (oPropInfo.instanceInfo.COMP_TYPE != "Phrase") {
						oTabController.addProp(oPropInfo.propMode, oPropInfo.treeNode, oPropInfo.instanceInfo, oPropInfo.collection, this._aPropInfos[
								oPropInfo.UDTPos], this.secondrun, this.oSpecificationkey, this._multicmpestcat, this._compindref, mandatoryfieldcounter,
							oPropInfo.UDTINST, oPropInfo.Layout, this._objlay, this._aPropInfos, oPropInfo, i);
						// }

					} else if (oPropInfo.UDTPos == null && oPropInfo.PhrKey != "udt" && (!this.secondrun || oPropInfo.instanceInfo.COMP_TYPE ==
							"MLVL_COMP")) {
						var oTabController = oPropInfo.editable ? this._oTabControllerPropEditable : this._oTabControllerPropNonEditable;
						// if (oPropInfo.instanceInfo.COMP_TYPE != "Phrase") {
						oTabController.addProp(oPropInfo.propMode, oPropInfo.treeNode, oPropInfo.instanceInfo, oPropInfo.collection, null, this.secondrun,
							this.oSpecificationkey, this._multicmpestcat, this._compindref, mandatoryfieldcounter, oPropInfo.UDTINST, oPropInfo.Layout,
							this._objlay, this._aPropInfos, oPropInfo, i);
						// }
					}
				}

			}

			// setTimeout(this._rtde, 1000);
			var instkey = {
				"RECNROOT": this.oSpecificationkey.RECNROOT,
				"ACTN": this.oSpecificationkey.ACTN,
				"RECNPARENT": "0",
				"ESTCAT": "0",
				"RECN_VP": "0",
				"ACTN_VP": "0"
			};

			if (this._aTabControllers.length == 5) {
				// this._rcptab = this._aTabControllers[4];
				this._aTabControllers.splice(2, 3);
				for (var j = 0; j < this.otab.getSections().length; j++) {
					if (j > 1) {
						this.otab.removeSection(this.otab.getSections()[j]);
						j--;
					}
				}
			}

			// await this._rtde();

			// setTimeout(this._rtde, 1000);
			{
				this._oTabControllerAttachment = new SpecDataTabAttachment(this.getOwnerComponent(), instkey);
				this._setupTab(this._oTabControllerAttachment);

				var objpgly = this.byId("ictb1");

				this._oTabControllerMessage = new SpecDataTabMessage(this.getOwnerComponent(), this.oSpecificationkey.RECNROOT);
				this._setupTab(this._oTabControllerMessage);

				// if (!this.secondrun)
				// this._oTabControllerrecipe = new RecipeTab(this.getOwnerComponent(), this._oSpecificationSUBIDKey, objpgly, this.secondrun);
				// this._setupTab(this._oTabControllerrecipe);

				this._oTabControllerIdentifier = new Identifier(this.getOwnerComponent());
				this._setupTab(this._oTabControllerIdentifier);

				// this._oTabControllerQAS = new QAS(this.getOwnerComponent(), this._oSpecificationSUBIDKey, objpgly, this.secondrun);
				// this._setupTab(this._oTabControllerQAS);

				var aTabRequests = this._oTabControllerIdentifier.getInitialRequests(this.oSpecificationkey);
				var aRequests = [],
					aTabRequestsLengths = [];
				aRequests = aRequests.concat(aTabRequests);
				aTabRequestsLengths.push(aTabRequests.length);
				this.getOwnerComponent().getModelManager().executeFetchRequests(aRequests,
					jQuery.proxy(this._initialFetchCallbackIdent, this, aTabRequestsLengths));
			}

			// Switch to edit mode, if needed.

			if (this._bNeedEditMode)
				this._setEditMode(true);

		},

		_initialFetchCallbackIdent: function (aTabRequestsLengths, oExecuteData) {
			if (oExecuteData.allSuccess) {
				// EXT_HOOK: _extHookGetDefaultTabControllerIndex
				// Determine which tab should be selected after data fetch.

				// var iIndex = this._extHookGetDefaultTabControllerIndex ? this._extHookGetDefaultTabControllerIndex() : 0;
				// this.byId("tabBar").setSelectedKey(iIndex.toString());

				// this._setEnableScrolling();

				// On successful fetch, enable controls.

				// this._setEnablePage(true);

				// Display header info.

				// var oHeaderInfoCollection = oExecuteData.responses[0].response;
				// this._displayData(oHeaderInfoCollection);

				// Invoke each tab controller to display its own data.

				var iTabResponseIndex = 1;

				// for (var i = 0; i < this._aTabControllers.length; i++) {
				var oTabController = this._aTabControllers[4];
				// var iTabRequestsLength = aTabRequestsLengths[i];
				// var iNextTabResponseIndex = iTabResponseIndex + iTabRequestsLength;

				var aExecuteResponses = oExecuteData.responses;
				// iTabResponseIndex = iNextTabResponseIndex;

				// Strip off .response from elements of aExecuteResponses.

				var aResponses = [];

				for (var j = 0; j < aExecuteResponses.length; j++) {
					var oExecuteResponse = aExecuteResponses[j];
					var vResponse = oExecuteResponse.response;
					// vResponse can be null, even in normal circumstances, so
					// we can't assert here.

					aResponses.push(vResponse);
				}

				oTabController.setInitialResponses(aResponses);
				// } 

				// Switch to edit mode, if needed. Executed after setInitialResponses call (see above)
				// to allow editModeChange event (see Component.js) to see tabs in their fully initialized
				// state.
				// TODO: with chainloading, this logic need change.

				if (this._bNeedEditMode)
					this._setEditMode(true);
			} else {
				// On error, display dialog.

				Util.showExecuteError(this.getOwnerComponent(), "SpecDetail.error.fetch", oExecuteData, true, jQuery.proxy(this._initialFetchClose,
					this));
			}
		},
		_clearStorage: function () {
			this.getOwnerComponent().getModelManager().clearStorage();
		},

		_beforeSave: function (fContinue) {
			this._showError(false);

			fContinue();
		},
		_rtde: function () {
			var testdat = 1234;
		},
		_afterSave: function (oSaveInfo, fContinue) {
			// In case of top-level error, entryErrorInfos is null. Since
			// ModelManager is not clearing errors in this case, then we
			// need to retain them in error popover.

			var aEntryErrorInfos = oSaveInfo.entryErrorInfos;
			if (aEntryErrorInfos) {
				var iEntryErrorCount = aEntryErrorInfos.length;

				this._setEntryErrorCount(iEntryErrorCount);

				// Bring-up the error dialog, if there are errors to show.

				if (iEntryErrorCount > 0) {
					this._oErrorPopover.setEntryErrorInfos(aEntryErrorInfos);
					this._showError(true);
				}
			}
			// this.onInit();
			this._fcont = fContinue;
			if (this._subbtn) {
				var oRequest = this.getOwnerComponent().getODataManager().requestForSubmit(this.oSpecificationkey);
				this.getOwnerComponent().getODataManager().executeRequest(oRequest,
					jQuery.proxy(this._submitsuccess, this), jQuery.proxy(this._submiterror, this));
			} else {
				this._fetchSpecificationInfo();
				fContinue();
			}
		},
		_submitsuccess: function (fContinue) {
			this._fetchSpecificationInfo();
			this._fcont();
		},
		_submiterror: function (fContinue) {
			this._fetchSpecificationInfo();
			this._fcont();
		},
		_afterReset: function (fContinue) {
			// Initialize save indicators.

			this._initSave();

			fContinue();
		},

		_setEnablePage: function (bEnabled) {
			// this._oPageModel.setProperty("/enablePage", bEnabled);  test
		},

		_setEditMode: function (bEditMode) {
			// TODO: Check spec edit role on backend.
			this.getOwnerComponent().setEditMode(bEditMode);
		},

		_setEntryErrorCount: function (iEntryErrorCount) {
			// this._oPageModel.setProperty("/entryErrorCount", iEntryErrorCount);
		},

		_initSave: function () {
			this._setEditMode(false);
			this._setEntryErrorCount(0);
			this._showError(false);
		},

		_showError: function (bShow) {
			var oControl = this.byId("footer.showerror");
			this._oErrorPopover.show(bShow, oControl);
		},

		_formatEditEnabled: function (bEnablePage, bEditMode) {
			var bEnabled = (bEnablePage && !bEditMode);
			return bEnabled;
		},

		_formatEntryErrorText: function (iEntryErrorCount) {
			var sText = (iEntryErrorCount > 0) ? iEntryErrorCount.toString() : "";
			return sText;
		},

		_formatEntryErrorEnabled: function (iEntryErrorCount) {
			var bEnabled = (iEntryErrorCount > 0);
			return bEnabled;
		},

		_onEdit: function () {
			this._setEditMode(true);
		},

		_onShowError: function () {
			this._showError(null);
		},

		_onSave: function () {
			this._subbtn = false;
			// var compindval = this._compindref.getPercentValue();

			// if(compindval != 100)
			// {
			// 	sap.m.MessageToast.show("Please fill all mandatory fields!!"); 
			// }
			// else
			// {
			if (this._imagechanged) {
				var oRequest = this.getOwnerComponent().getODataManager().requestForUpdateLogo(this._oLogoKey);
				this.getOwnerComponent().getODataManager().executeRequest(oRequest,
					jQuery.proxy(this._logoupdtsuccess, this), jQuery.proxy(this._logoupdterror, this));
			} else {
				this.getOwnerComponent().getSaveHandler().save();
			}
			// }

		},

		_onSaveSub: function () {
			this._subbtn = true;
			var compindval = this._compindref.getPercentValue();

			if (compindval != 100) {
				sap.m.MessageToast.show("Please fill all mandatory fields!!");
			} else {
				if (this._imagechanged) {
					var oRequest = this.getOwnerComponent().getODataManager().requestForUpdateLogo(this._oLogoKey);
					this.getOwnerComponent().getODataManager().executeRequest(oRequest,
						jQuery.proxy(this._logoupdtsuccess, this), jQuery.proxy(this._logoupdterror, this));
				} else {
					this.getOwnerComponent().getSaveHandler().save();
				}
			}

		},
		_logoupdterror: function () {
			this.getOwnerComponent().getSaveHandler().save();
		},
		_logoupdtsuccess: function () {
			this.getOwnerComponent().getSaveHandler().save();
		},
		_onCancel: function () {

			var objpgly = this.byId("ictb1");
			// var key = objpgly.getSelectedKey();
			var key = objpgly.getSelectedSection();
			var oI18nBundle = this.getOwnerComponent().getI18nBundle();
			this.getOwnerComponent().getSaveHandler().confirmAndReset(oI18nBundle.getText("SpecData.cancelConfirm"), null, key);
		}
	});

	return SpecData;
});