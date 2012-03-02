/*
@author Martin Kleinschrodt
Copyright (c) by MaKleSoft
This code is provided "as is", without any kind of warranty.
http://www.maklesoft.com
*/
enyo.kind({
    name: "maklesoft.BasicVirtualTable",
    kind: "VFlexBox",
    className: "maklesoft-table",
    published: {
        rowCount: 0,
        colCount: 0,
        editable: false,
        data: [[]],
        selectionMode: "NONE",
        showRowNumbers: true,
        showColumnNames: false,
        columnNames: "ABCDEFGHIJKLMNOPQURSTUVWXYZ".split(""),
        cellClassProvider: function(colIndex, rowIndex, data) {if (typeof(data) == "number") {
                return {className: "number", add: true};
            } else {
                return {className: "number", add: false};
            }
        },
        rowClassProvider: function(rowIndex) {if (rowIndex % 2 == 1) {
            return {className: "odd", add: true};
        } else {
            return {className: "odd", add: false};
        }},
        colClassProvider: function() {}
    },
    rowCountChanged: function() {
        this.refresh();
    },
    colCountChanged: function() {
        this.refresh(true, true);
    },
    editableChanged: function() {
        for (var i = 0; i < this.colCount; i++) {
            this.$["input" + i].setDisabled(!this.editable);
        }
        this.refresh();
    },
    dataChanged: function() {
        this.data = this.data.concat([]); //Make a copy of the passed data rather than using the actual array
        this.rowCount = Math.max(this.data.length, this.rowCount);
        this.colCount = this.colCount || this.getMaxColLength();
        this.refresh(true, true);
    },
    selectionModeChanged: function() {
        if (this.selectionMode == "SINGLE_ROW" || this.selectionMode == "SINGLE_COLUMN") {
            this.$.selection.setMulti(false);
        } else if (this.selectionMode == "MULTI_ROW" || this.selectionMode == "MULTI_COLUMN") {
            this.$.selection.setMulti(true);
        }
        this.$.selection.clear();
        this.refresh(true);
    },
    showRowNumbersChanged: function() {
        this.createCells();
        if (this.showColumnNames) {
            this.createColNames();
        }
        this.refresh(true);
    },
    showColumnNamesChanged: function() {
        this.createColNames();
    },
    create: function(params) {
        this.rangeSelectionStartIndex = null;
        this.inherited(arguments);
        this.rowCount = this.rowCount || this.data.length;
        this.selectionModeChanged();
        this.colCount = this.colCount || this.getMaxColLength();
        this.createCells();
        this.createColNames();
        this.editableChanged();
        this.refresh();
    },
    createCells: function() {
        this.$.row.destroyControls();
        if (this.showRowNumbers) {
            this.$.row.createComponent({className: "rownumber", name: "rowNumber", owner: this});
        }
        for (var i = 0, c; i < this.colCount; i++) {
            c = this.$.row.createComponent({
                owner: this, kind: "HFlexBox",
                name: "cell" + i, colIndex: i, className: "cell",
                flex: 1, onclick: "cellClick", ondblclick: "cellDblclick",
                components: [{kind: "BasicInput", name: "input" + i, flex: 1, style: "width: 100%; padding: 0px 10px 0px 10px", hint: "", colIndex: i, onchange: "inputChanged"}]
            });
            var cellClass = this.colClassProvider(i);
            if (cellClass) {
                c.addRemoveClass(cellClass.className, cellClass.add);
            }
        }
        this.cellsBuilt = true;
    },
    createColNames: function() {
        if (this.showColumnNames) {
            this.$.columnNames.destroyControls();
            if (this.showRowNumbers) {
                this.$.columnNames.createComponent({className: "rowNumber"});
            }
            for (var i = 0; i < this.colCount; i++) {
                this.$.columnNames.createComponent({className: "colname", content: this.columnNames[i] || "column " + i, flex: 1});
            }
            this.$.columnNames.render();
            this.$.columnNames.show();
        } else {
            this.$.columnNames.hide();
        }
    },
    listSetupRow: function(sender, index) {
        if (index >= 0 && index < this.rowCount && (this.cellsBuilt)) {
            var rowData = this.data[index] || [];
            for (var i = 0; i < this.colCount; i++) {
                //set the row number
                if (this.showRowNumbers) {this.$.rowNumber.setContent(index);}
                //set the cell value
                this.$["input" + i].setValue(rowData[i] || "");
                if ((this.selectionMode == "SINGLE_COLUMN" || this.selectionMode == "MULTI_COLUMN")) {
                    //apply the 'selected' class to all cells at the selected column indizes
                    this.$["cell" + i].addRemoveClass("selected", this.$.selection.isSelected(i));
                }
                var cellClass = this.cellClassProvider(i, index, rowData[i]);
                if (cellClass) {
                    this.$["cell" + i].addRemoveClass(cellClass.className, cellClass.add);
                }
            }
            var rowClass = this.rowClassProvider(index);
            if (rowClass) {
                this.$.row.addRemoveClass(rowClass.className, rowClass.add);
            }
            if ((this.selectionMode == "SINGLE_ROW" || this.selectionMode == "MULTI_ROW")) {
                //apply the 'selected' class to all rows at the selected row indizes
                this.$.row.addRemoveClass("selected", this.$.selection.isSelected(index));
            }
            return true;
        }
    },
    rowClick: function(sender, event) {
        if (this.selectionMode == "SINGLE_ROW" || this.selectionMode == "MULTI_ROW") {
            //if range selection has been triggered
            if (this.rangeSelectionStartIndex !== null) {
                //and the startIndex is not the index of the row itself
                if (this.rangeSelectionStartIndex != event.rowIndex) {
                    //apply the range selection
                    this.endRangeSelection(event.rowIndex);
                }
            //select on single click only if the cells are not editable. Otherwise double click is necessary
            } else if (!this.editable) {
                this.selectRow(event.rowIndex);
            }
        }
    },
    rowDblclick: function(sender, event) {
        //If the cells are editable a double click is required to select
        if (this.editable && (this.selectionMode == "SINGLE_ROW" || this.selectionMode == "MULTI_ROW")) {
            this.selectRow(event.rowIndex);
        }
    },
    rowMouseheld: function(sender, event) {
        //If the selection mode allows multiple rows to be selected, trigger the range selection
        if (this.selectionMode == "MULTI_ROW") {
            this.startRangeSelection(event.rowIndex);
        } else if (this.selectionMode == "SINGLE_ROW") {
            this.selectRow(event.rowIndex);
        }
    },
    startRangeSelection: function(startIndex) {
        //if the range selection has allready been triggered with another startindex
        if (this.rangeSelectionStartIndex) {
            //remove the marker from the old start index row
            this.$.list.prepareRow(this.rangeSelectionStartIndex);
            this.$.row.removeClass("rangeselection");
        }
        //Highlight the row at the start index
        this.$.list.prepareRow(startIndex);
        this.$.row.addClass("rangeselection");
        this.rangeSelectionStartIndex = startIndex;
    },
    endRangeSelection: function(endIndex) {
        var startIndex = this.rangeSelectionStartIndex;
        this.$.list.prepareRow(startIndex);
        this.$.row.removeClass("rangeselection");
        for (var i = Math.min(startIndex, endIndex); i <= Math.max(startIndex, endIndex); i++) {
            this.$.selection.select(i);
        }
        this.refresh();
        this.rangeSelectionStartIndex = null;
    },
    selectRow: function(index) {
        this.$.selection.select(event.rowIndex);
        //this.$.list.refresh();
        //Directly change the selected rows styling instead of refreshing for better performance
        this.$.list.prepareRow(event.rowIndex);
        this.$.row.addRemoveClass("selected", this.$.selection.isSelected(index));
        //But then we have to make sure that the last selected rows styling is also changed when in SINGLE_ROW selection mode
        if (this.selectionMode == "SINGLE_ROW" && (this.lastSelected !== undefined)) {
            this.$.list.prepareRow(this.lastSelected);
            this.$.row.removeClass("selected");
        }
        this.lastSelected = event.rowIndex;
    },
    cellClick: function(sender, event) {
        if (!this.editable && (this.selectionMode == "SINGLE_COLUMN" || this.selectionMode == "MULTI_COLUMN")) {
            this.$.selection.select(sender.colIndex);
            this.refresh();
        }
    },
    cellDblclick: function(sender, event) {
        if (this.editable && (this.selectionMode == "SINGLE_COLUMN" || this.selectionMode == "MULTI_COLUMN")) {
            this.$.selection.select(sender.colIndex);
            this.refresh();
        }
    },
    inputChanged: function(sender, event) {
        this.$.list.prepareRow(event.rowIndex);
        //fill up the rows to the given row index
        while (this.data.length <= event.rowIndex) {
            this.data.push([]);
        }
        //fill up the columns to the given column index
        while (this.data[event.rowIndex].length <= sender.colIndex) {
            this.data[event.rowIndex].push("");
        }
        //apply the change to the data array
        this.data[event.rowIndex][sender.colIndex] = sender.getValue();
    },
    getMaxColLength: function() {
        var max = 0;
        for (var i = 0; i < this.data.length; i++) {
            max = Math.max(max, this.data[i].length);
        }
        return max;
    },
    //* @public
    /**
     * Removes the selected rows or columns, depending on the selection mode
     */
    removeSelected: function() {
        var selected = this.getSelectedIndizes();
        if (this.selectionMode == "SINGLE_ROW" || this.selectionMode == "MULTI_ROW") {
            this.removeRows(selected);
        } else if (this.selectionMode == "SINGLE_COLUMN" || this.selectionMode == "MULTI_COLUMN") {
            this.removeColumns(selected);
        }
        this.$.selection.clear();
        this.refresh();
    },
    //* @public
    /**
     * Removes the row at the given index. Also removes the corresponding entry in the data array
     * @param {int} index
     * The index of the row that is supposed to be removed
     * @param {boolean} refresh
     * Whether or not to refresh the table after removing the row.
     * When removing multiple rows pass false and refresh the table manually for performance optimization
     */
    removeRow: function(index, refresh) {
        refresh = (refresh !== undefined) ? refresh : true;
        this.data.remove(index);
        this.columnNames.remove(index);
        this.rowCount--;
        if (refresh) {
            if (this.selectionMode == "SINGLE_ROW" || this.selectionMode == "MULTI_ROW") {
                this.$.selection.clear();
            }
            this.refresh();
        }
    },
    removeRows: function(indizes) {
        for (var i = 0; i < indizes.length; i++) {
            this.removeRow(indizes[i]-i, false);
        }
    },
    removeColumns: function(indizes) {
        for (var i = 0; i < indizes.length; i++) {
            this.removeColumn(indizes[i]-i, false);
        }
        this.createCells();
    },
    //* @public
    /**
     * Removes the column at the given index. Also removes the corresponding entrys in the data array
     * @param {int} index
     * The index of the column that is supposed to be removed
     * @param {boolean} refresh
     * Whether or not to refresh the table after removing the row.
     * When removing multiple columns pass false and refresh the table manually for performance optimization
     */
    removeColumn: function(index, refresh) {
        refresh = (refresh !== undefined) ? refresh : true;
        for (var i = 0; i < this.data.length; i++) {
            this.data[i].remove(index);
        }
        this.colCount--;
        if (refresh) {
            if (this.selectionMode == "SINGLE_COLUMN" || this.selectionMode == "MULTI_COLUMN") {
                this.$.selection.clear();
            }
            this.createCells();
            this.refresh();
        }
    },
    //* @public
    /**
     * Returnes the indizes of all selected rows or columns, depending on the selection mode
     * @returns
     * An array with the indizes of all selected rows / columns
     */
    getSelectedIndizes: function() {
        var selected = [];
        if (this.selectionMode == "SINGLE_ROW" || this.selectionMode == "MULTI_ROW") {
            for (var i = 0; i < this.rowCount; i++) {
                if (this.$.selection.isSelected(i)) {
                    selected.push(i);
                }
            }
        } else if (this.selectionMode == "SINGLE_COLUMN" || this.selectionMode == "MULTI_COLUMN") {
            for (var j = 0; j < this.colCount; j++) {
                if (this.$.selection.isSelected(j)) {
                    selected.push(j);
                }
            }
        }
        return selected;
    },
    //* @public
    /**
     * Fills the value of the cell at the given row and column index
     * @param {int} colIndex
     * The column index
     * @param {int} rowIndex
     * The row index
     * @param {string/number}
     * The value that is supposed to be inserted
     */
    setValue: function(colIndex, rowIndex, value) {
        this.$.list.prepareRow(rowIndex);
        this.$["input" + colIndex].setValue(value);
    },
    //* @public
    /**
     * Returns the value of the cell at the given row and column index
     * @param {int} colIndex
     * The column index
     * @param {int} rowIndex
     * The row index
     */
    getValue: function(colIndex, rowIndex) {
        this.$.list.prepareRow(rowIndex);
        return this.$["input" + colIndex].getValue();
    },
    //* @public
    /**
     * Inserts a row at the given index. Also inserts an empty array at the corresponding place in the data array.
     * @param {int} index
     * The index at which the row is supposed to be inserted
     */
    insertRowAt: function(index) {
        this.$.selection.clear();
        this.rowCount++;
        this.data = this.data.insertAt(index, []);
        this.refresh();
    },
    //* @public
    /**
     * Inserts a column at the given index. Also inserts an empty string at the corresponding place in the data array.
     * @param {int} index
     * The index at which the column is supposed to be inserted
     */
    insertColumnAt: function(index) {
        this.$.selection.clear();
        this.colCount++;
        for (var i = 0; i < this.data.length; i++) {
            this.data[i] = this.data[i].insertAt(index, "");
        }
        this.refresh(true, true);
    },
    //* @public
    /**
     * Inserts a column or row right before the lowest selected index, depending on the selection mode
     */
    insertBeforeSelected: function() {
        if (this.selectionMode == "SINGLE_ROW" || this.selectionMode == "MULTI_ROW") {
            this.insertRowAt(this.getSelectedIndizes()[0] || 0);
        } else if (this.selectionMode == "SINGLE_COLUMN" || this.selectionMode == "MULTI_COLUMN") {
            this.insertColumnAt(this.getSelectedIndizes()[0] || 0);
        }
    },
    //* @public
    /**
     * Adds a row at the end of the table
     */
    addRow: function() {
        this.rowCount++;
        this.refresh();
    },
    //* @public
    /**
     * Adds a column at the end of the table
     */
    addColumn: function() {
        this.colCount++;
        this.refresh(true, true);
    },
    //* @public
    /**
     * Refreshes the table
     */
    refresh: function(createCells, createColNames) {
        if (createCells) {
            this.createCells();
        }
        if (createColNames) {
            this.createColNames();
        }
    },
    clear: function() {
        this.setData([]);
        this.setColCount(0);
        this.setRowCount(0);
        this.$.selection.clear();
        this.refresh(true, true);
    }
});

/**
 * Removes the elements in the specified range from an array
 * @param {Object} from
 * starting removing here
 * @param {Object} to
 * stop removing here
 */
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

/**
 * Inserts the given value at the given index and returns the resulting array. Does NOT alter the original array
 */
Array.prototype.insertAt = function(index, value) {
    return this.slice(0, index).concat([value], this.slice(index));
};

