enyo.kind({
	name: "onyx.custom.SelectDecorator",
	classes: "onyx-button select-decorator",
	handlers: {
		onchange: "changedHandler"
	},
	rendered: function() {
		this.inherited(arguments);
		this.changedHandler(this.getComponents()[3]);
	},
	changedHandler: function(sender, event) {
		var caption = sender.hasNode().childNodes[sender.getSelected()].innerHTML;
		this.$.innerText.setContent(caption);
	},
	components: [
		{kind: "FittableColumns", noStretch: true, classes: "select-decorator-inner", components: [
			{name: "innerText", fit: true, classes: "select-decorator-inner-text"},
			{classes: "select-decorator-inner-arrow"}
		]}
	]
});