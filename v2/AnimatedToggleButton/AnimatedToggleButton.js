/**
A control that looks like a switch with labels for two states. Each time a ToggleButton is tapped,
it switches its value and fires an onChange event.

	{kind: "onyx.ToggleButton", onContent: "foo", offContent: "bar", onChange: "buttonToggle"}

	buttonToggle: function(inSender, inEvent) {
		this.log("Toggled to value " + inEvent.value);
	}

To find out the value of the button, use getValue:

	queryToggleValue: function() {
		return this.$.toggleButton.getValue();
	}
*/
enyo.kind({
	name: "onyx.AnimatedToggleButton",
	kind: "onyx.ToggleButton",
	classes: "onyx-animated-toggle-button",
	components: [
		{name: "contentOn", classes: "onyx-toggle-content on"},
		{name: "contentOff", classes: "onyx-toggle-content off"},
		{kind: "onyx.Slideable", name: "knob", axis: "h", unit: "px", max: 30, min: 0, overMoving: false,
			classes: "onyx-toggle-button-knob", ondragfinish: "tap"}
	],
	valueChanged: function() {
		this.inherited(arguments);
		this.calculateSlidingBounds();
		if (this.value) {
			this.$.knob.animateToMax();
		} else {
			this.$.knob.animateToMin();
		}

	},
	activeChanged: function() {
		this.setValue(this.active);
		this.bubble("onActivate");
	},
	onContentChanged: function() {
		this.inherited(arguments);
		this.calculateSlidingBounds();
		this.valueChanged();
	},
	offContentChanged: function() {
		this.inherited(arguments);
		this.calculateSlidingBounds();
		this.valueChanged();
	},
	disabledChanged: function() {
		this.inherited(arguments);
		this.$.knob.setDraggable(!this.disabled);
	},
	rendered: function() {
		this.inherited(arguments);
		this.valueChanged();
	},
	calculateSlidingBounds: function() {
		this.$.knob.setMax(this.getBounds().width-this.$.knob.getBounds().width-2);
	},
	dragstart: function(inSender, inEvent) {
	},
	drag: function(inSender, inEvent) {
	},
	dragfinish: function(inSender, inEvent) {
	}
});
