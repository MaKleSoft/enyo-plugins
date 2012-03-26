enyo.kind({
	name: "onyx.custom.SelectDecorator",
	classes: "onyx-button select-decorator",
	handlers: {
		onchange: "changedHandler"
	},
	rendered: function() {
		this.inherited(arguments);
		var selectNode = this.hasNode().childNodes[1];
		this.log(selectNode);
		if (selectNode.childNodes.length) {
			var caption = selectNode.childNodes[selectNode.selectedIndex].innerHTML;
			this.$.innerText.setContent(caption);
		}
	},
	changedHandler: function(sender, event) {
		if (sender) {
			var caption = sender.hasNode().childNodes[sender.getSelected()].innerHTML;
			this.$.innerText.setContent(caption);
		}
	},
	components: [
		{kind: "FittableColumns", noStretch: true, classes: "select-decorator-inner", components: [
			{name: "innerText", fit: true, classes: "select-decorator-inner-text"},
			{classes: "select-decorator-inner-arrow"}
		]}
	]
});