enyo.kind({
	name: "SelectDecorator",
	classes: "onyx-button select-decorator",
	handlers: {
		onchange : "changeHandler"
	},
	published: {
		disabled : false,
		showCaption : true,
		showArrow : true,
		icon: ""
	},
	showCaptionChanged: function() {
		this.$.innerText.setShowing(this.showCaption);
		this.addRemoveClass("select-decorator-no-caption", !this.showCaption);
	},
	disabledChanged: function() {
		this.addRemoveClass("select-decorator-disabled", this.disabled);
	},
	showArrowChanged: function() {
		this.addRemoveClass("select-decorator-no-arrow", !this.showArrow);
	},
	iconChanged: function() {
		this.$.innerIcon.setStyle("background-image: url('" + this.icon + "')");
		this.$.innerIcon.setShowing((this.icon !== ""));
	},
	create: function() {
		this.inherited(arguments);
		this.disabledChanged();
		this.showCaptionChanged();
		this.showArrowChanged();
		this.iconChanged();
	},
	rendered: function() {
		this.inherited(arguments);
		var select = this.getClientControls()[0];

		if(select) {
			this.changeHandler(select);
		}
	},
	changeHandler: function(sender, event) {
		var caption = sender.getControls()[sender.getSelected()].getContent();
		this.$.innerText.setContent(caption);
	},
	components: [
		{classes: "select-decorator-inner", components: [
			{classes: "select-decorator-inner-arrow"},
			{name: "innerIcon", classes: "select-decorator-inner-icon"},
			{name: "innerText",	fit : true,	classes : "select-decorator-inner-text"}
		]}
	]
});