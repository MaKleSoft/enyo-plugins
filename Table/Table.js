enyo.kind({
	name: "maklesoft.Table",
	kind: enyo.Control,
	nodeTag: "table",
	published: {
		colCount: 0,
		rowCount: 0,
		shouldDecorateCells: true
	},
	events: {
		onSetupCell: ""
	},
	//* @protected
	getChildContent: function() {
		this.build();
		return this.inherited(arguments);
	},
	build: function() {
		this.destroyControls();
		var row, cell, config;
		for (var i=0; i<this.rowCount; i++) {
			row = this.createComponent({
				kind: "Control", nodeTag: "tr"
			});
			for (var j=0; j<this.colCount; j++) {
				cell = row.createComponent({
					kind: "Control", nodeTag: "td"
				});
				
				config = this.doSetupCell(i, j) || {};
				config = enyo.isArray(config) ? config : [config];

				if (this.shouldDecorateCells) {
					this.decorateCell(config, i, j);
				}

				cell.createComponents(config, {owner: this.owner});
			}
		}
	},
	decorateCell: function(config, row, col) {
		for (var i=0, c; c=config[i]; i++) {
			c.rowIndex = row;
			c.colIndex = col;
		}
	},
	getRow: function(rowIndex) {
		return this.getControls()[rowIndex];
	},
	refresh: function() {
		this.build();
		this.render();
	}
});

enyo.kind({
	name: "TableTest",
	kind: "Control",
	setupCell: function(row, col) {
		return {content: "cell " + row + ", " + col};
	},
	components: [
		{kind: "maklesoft.Table", onSetupCell: "setupCell", colCount: 5, rowCount: 5}
	]
});