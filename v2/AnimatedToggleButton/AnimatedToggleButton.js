/**
An extension fo the ToggleButton kind that animates between the on and off position and allows actual dragging of the knob.
*/
enyo.kind({
	name: "onyx.custom.AnimatedToggleButton",
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
		// Do this after the Control has been rendered so that the sliding bounds can be calculated properly
		this.valueChanged();
	},
	// Calculate the maximum sliding position for the knob
	calculateSlidingBounds: function() {
		this.$.knob.setMax(this.getBounds().width-this.$.knob.getBounds().width-2);
	},
	// Prevent the drag handling of the super kind
	dragstart: function(inSender, inEvent) {
	},
	drag: function(inSender, inEvent) {
	},
	dragfinish: function(inSender, inEvent) {
	}
});
