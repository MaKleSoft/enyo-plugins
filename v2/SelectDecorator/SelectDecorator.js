enyo.kind({
	name: "SelectDecorator",
	classes: "onyx-button select-decorator",
	handlers: {
		onchange: "changeHandler"
	},
	published: {
		disabled: false
	},
	disabledChanged: function() {
		this.addRemoveClass("select-decorator-disabled", this.disabled);
	},
	create: function() {
		this.inherited(arguments);
		this.disabledChanged();
	},
	rendered: function() {
		this.inherited(arguments);
		var select = this.getClientControls()[0];

		if (select) {
			this.changeHandler(select);
		}
	},
	changeHandler: function(sender, event) {
		var caption = sender.getControls()[sender.getSelected()].getContent();
		this.$.innerText.setContent(caption);
	},
	components: [
		{kind: "FittableColumns", noStretch: true, classes: "select-decorator-inner", components: [
			{name: "innerText", fit: true, classes: "select-decorator-inner-text"},
			{classes: "select-decorator-inner-arrow"}
		]}
	]
});