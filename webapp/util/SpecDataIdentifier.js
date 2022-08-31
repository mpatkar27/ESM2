sap.ui.define([
	"sap/base/assert",
	"sap/ui/model/json/JSONModel",
	"ESM2/util/SpecDataTabBase",
	"ESM2/util/TableManager",
	"ESM2/util/ValueHelperDialog"
], function(assert, JSONModel, SpecDataTabBase, TableManager, ValueHelperDialog) {
	"use strict";

	var SpecDataIdentifier = function(oComponent) {
		SpecDataTabBase.call(this, oComponent, "ESM2.frag.SpecDataIdentifier");

		// EXT_CLASS
		oComponent.initClassExtension(this, "ESM2.util.SpecDataIdentifier", arguments);

		// Setup toolbar.

		var oToolbar = this._byId("toolbar");
		this._oToolbarModel = new JSONModel();
		oToolbar.setModel(this._oToolbarModel, "toolbarModel");

		// Setup table.

		var oTable = this._byId("table");
		var oTableItem = this._byId("table.item");
		this._oTableManager = new TableManager(this._getOwnerComponent(), oTable, oTableItem);

		// Setup value helper parameters.

		this._oValueHelperPropMaps = {
				"IDTYPE": {"IDTYPE": {property: "IDTYPE"},
						   "IDTYPE_NAME": {property: "IDTNAM"}},
				"IDCAT": {"IDCAT": {property: "IDCAT"},
						  "IDCAT_NAME": {property: "IDCNAM"}},
				"LANGU": {"LANGU": {property: "SPRAS"}}
		};

		// EXT_HOOK: _extHookConstructorEnd
		// Invoked at the end of constructor.

		if (this._extHookConstructorEnd)
			this._extHookConstructorEnd();
	};

	SpecDataIdentifier.prototype = Object.create(SpecDataTabBase.prototype);
	SpecDataIdentifier.prototype.constructor = SpecDataIdentifier;

	SpecDataIdentifier.prototype.getInitialRequests = function(oSpecificationKey) {
		// Store specification key.

		this._oSpecificationKey = oSpecificationKey; // TODO_FUTURE: keep this._oInstance or pass as parameter?

		// Construct requests.

		var oRequest = this._getOwnerComponent().getModelManager().requestForFetchIdentifierBySpecificationKey(this._oSpecificationKey);

		var aRequests = [oRequest];

		// EXT_HOOK: _extHookGetInitialRequestsAddRequests
		// Add custom requests.

		if (this._extHookGetInitialRequestsAddRequests) {
			var _aRequests = this._extHookGetInitialRequestsAddRequests();
			aRequests = aRequests.concat(_aRequests);
		}

		return aRequests;
	};

	SpecDataIdentifier.prototype.setInitialResponses = function(aResponses) {
		this._displayData(aResponses);
	};

	SpecDataIdentifier.prototype._displayData = function(aResponses) {
		var iResponseIndex = 0;
		
		this._oCollection = aResponses[iResponseIndex++];
		assert(this._oCollection, "oCollection should be set");

		// Enable create default button, if we have at least one default identifier.

		var oAdditional = this._oCollection.getAdditional();
		this._aDefaultIdentifiers = oAdditional.defaultIdentifiers;

		// EXT_HOOK: _extHookDisplayDataProcess
		// Do custom response processing.

		if (this._extHookDisplayDataProcess) {
			var _aResponses = aResponses.slice(iResponseIndex);
			this._extHookDisplayDataProcess(_aResponses);
		}

		this._oToolbarModel.setProperty("/enableCreateDefault", this._aDefaultIdentifiers.length > 0);

		// Display identifiers.
		
		this._oTableManager.setCollection(this._oCollection);

		// EXT_HOOK: _extHookDisplayDataEnd
		// Invoked at the end of displayData.

		if (this._extHookDisplayDataEnd)
			this._extHookDisplayDataEnd();
	};

	SpecDataIdentifier.prototype._formatCreateDefaultEnabled = function(bEditMode, bEnableCreateDefault) {
		var bEnabled = bEditMode && bEnableCreateDefault;
		return bEnabled;
	};

	SpecDataIdentifier.prototype._onCreate = function() {
		this._oCollection.create(null);
	};

	SpecDataIdentifier.prototype._onCreateDefault = function() {
		// EXT_HOOK: _extHookOnCreateDefault
		// Override button behaviour.

		if (this._extHookOnCreateDefault) {
			this._extHookOnCreateDefault();
		} else {
			for (var i = 0; i < this._aDefaultIdentifiers.length; i++) {
				var oDefaultIdentifier = this._aDefaultIdentifiers[i];
				this._oCollection.create(oDefaultIdentifier);
			}
		}
	};

	SpecDataIdentifier.prototype._onValueHelpRequest = function(oEvent) {
		ValueHelperDialog.openDialog(this._getOwnerComponent(),
				"Identifiers",
				this._oValueHelperPropMaps,
				null,
				oEvent.getSource(),
				this._oCollection);
	};

	return SpecDataIdentifier;
});
