/*
@author Martin Kleinschrodt
Copyright (c) by MaKleSoft
This code is provided "as is", without any kind of warranty.
http://www.maklesoft.com
*/
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
				
				config = this.doSetupCell(i, j) || "";

				// Provide the ability to fill the cells with plain content instead of another control.
				if (typeof config == "string" || typeof config == "number") {
					cell.setContent(config);
				} else {
					config = enyo.isArray(config) ? config : [config];

					if (this.shouldDecorateCells) {
						this.decorateCell(config, i, j);
					}

					cell.createComponents(config, {owner: this.owner});
				}
			}
		}
	},
	decorateCell: function(config, row, col) {
		for (var i=0, c; c=config[i]; i++) {
			c.rowIndex = row;
			c.colIndex = col;
		}
	},
    //* @public
    /**
     * Fetch the row control at the given index
     * @param {int} index
     * The index of the row
     */
	fetchRow: function(rowIndex) {
		return this.getControls()[rowIndex];
	},
    //* @public
    /**
     * Rebuild the table.
     */
	refresh: function() {
		this.build();
		this.render();
	}
});