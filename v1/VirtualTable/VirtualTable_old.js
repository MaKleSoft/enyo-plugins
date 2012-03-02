/*
@author Martin Kleinschrodt
Copyright (c) by MaKleSoft
This code is provided "as is", without any kind of warranty.
http://www.maklesoft.com
*/
/**
    A control that is designed to display and/or collect tabular data. The rows are rendered using the VirtualList kind so
    it is fit to display large amounts of data. Aside from editing cells and deleting and adding rows and columns
    this control also supports various selection modes and dynamical styling of rows, columns, and even individual cells
    based on indizes and values.
    
    ## properties
        * rowCount: The number of rows the table should have. If no row count is specified the length of the data
            array is used
            Default 0
        * colCount: The number of columns the table should have. If no column count is specified the maximum
            column length of the data array is used
            Default 0
        * editable: A boolean that specifies whether or not the cells should be editable. If true, row and column
            selection requires a double tap instead of a single tap
            Default false
        * data: A two dimensional array containing the data to be displayed. Omit this property to get a blank table
            but dont forget to set the row and column count and make the table editable!
            Default [[]]
        * selectionMode: Determines the selection behaviour of the table. There are five different selection modes:
            * SINGLE_ROW: One row can be selected at a time
            * MULTI_ROW: Multiple rows can be selected at a time
            * SINGLE_COLUMN: One column can be selected at a time
            * MULTI_COLUMN: Multiple columns can be selected at a time
            * NONE: No selection possible
            Default: NONE
        * showRowNumbers: Whether or not to display the row numbers
            Default: true
        * showColumnNames: Whether or not to use column names
            Default: false
        * columnNames: An array specifying the column names to be used. If this property is omitted the columns will
            be labeled alphabetically
        * cellClassProvider: A function that takes the column index, the row index and the cell data as arguments
            and returns a class name to be applied to the cell
        * rowClassProvider: A function that takes the row index as arguments and returns a class name to be applied to the row
        * colClassProvider: A function that takes the column index as arguments and returns a class name to be applied to the column
        
    ## Selection
        The VirtualTable kind supports various selection modes for selecting single or multiple rows or columns.
        If the table is not editable the user can select a row/column by tapping/clicking on it. If the table is
        editable a double click/tab is required.
        Range selection is possible by tapping/clicking a row and holding it and then tapping/clicking on another row
        in order to select all rows between both. Range selection is only possible in the MULTI_ROW mode.
        
    ## Adding and deleting rows columns
        Rows and columns can be added or deleted at a given index or based on user selection. For more information inspect the
        documentation of the respective methods.
        
    ## Data manipulation
        The tables data can be manipulated programmatically or through user input. Once the editing is done the data can be
        conveniently received using getData()
        
    ## Dynamic styling
        Custom functions can be provided in order to dynamically style rows, columns or even cells. For example the cellClassProvider
        takes the column and row index and the value of the cell and decides which css class to apply to the cell. The default
        cellClassProvider returns the class name "number" if the value in the cell is a number:
            function(colIndex, rowIndex, data) {
                if (typeof(data) == "number")
                return "number";
            }
 */
enyo.kind({
    name: "maklesoft.VirtualTable",
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
        cellClassProvider: function(colIndex, rowIndex, data) {if (typeof(data) == "number") return "number";},
        rowClassProvider: function(rowIndex) {if (rowIndex % 2 == 1) return "odd";},
        colClassProvider: function() {}
    },
    rowCountChanged: function() {
        this.$.list.refresh();
    },
    colCountChanged: function() {
        this.refresh();
    },
    editableChanged: function() {
        for (var i = 0; i < this.colCount; i++) {
            this.$["input" + i].setDisabled(!this.editable);
        }
        this.$.list.refresh();
    },
    dataChanged: function() {
        this.data = this.data.concat([]); //Make a copy of the passed data rather than using the actual array
        this.rowCount = Math.max(this.data.length, this.rowCount);
        this.colCount = this.colCount || this.getMaxColLength();
        this.refresh();
    },
    selectionModeChanged: function() {
        if (this.selectionMode == "SINGLE_ROW" || this.selectionMode == "SINGLE_COLUMN") {
            this.$.selection.setMulti(false);
        } else if (this.selectionMode == "MULTI_ROW" || this.selectionMode == "MULTI_COLUMN") {
            this.$.selection.setMulti(true);
        }
        this.$.selection.clear();
        this.$.list.refresh();
    },
    showRowNumbersChanged: function() {
        this.createCells();
        if (this.showColumnNames) {
            this.createColNames();
        }
        this.$.list.refresh();
    },
    showColumnNamesChanged: function() {
        this.createColNames();
    },
    components: [{
        kind: "HFlexBox", name: "columnNames"
    },{
		flex: 1, name: "list", kind: "VirtualList", className: "list", onSetupRow: "listSetupRow", components: [
			{name: "row", kind: "HFlexBox", className: "row", onclick: "rowClick", ondblclick: "rowDblclick", onmousehold: "rowMouseheld"}
		]
    },{
        kind: enyo.Selection
    }],
    create: function(params) {
        this.rangeSelectionStartIndex = null;
        this.inherited(arguments);
        this.rowCount = this.rowCount || this.data.length;
        this.selectionModeChanged();
        this.colCount = this.colCount || this.getMaxColLength();
        this.createCells();
        this.createColNames();
        this.editableChanged();
        this.$.list.refresh();
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
                components: [{kind: "Input", name: "input" + i, flex: 1, hint: "", colIndex: i, onchange: "inputChanged"}]
            });
            c.addClass(this.colClassProvider(i) || "");
        }
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
        if (index >= 0 && index < this.rowCount) {
            var rowData = this.data[index] || [];
            for (var i = 0; i < this.colCount; i++) {
                //set the row number
                if (this.showRowNumbers) {this.$.rowNumber.setContent(index)}
                //set the cell value
                this.$["input" + i].setValue(rowData[i] || "");
                if ((this.selectionMode == "SINGLE_COLUMN" || this.selectionMode == "MULTI_COLUMN")) {
                    //apply the 'selected' class to all cells at the selected column indizes
                    this.$["cell" + i].addRemoveClass("selected", this.$.selection.isSelected(i));
                }
                this.$["input" + i].addClass(this.cellClassProvider(i, index, rowData[i]) || "");
            }
            this.$.row.addClass(this.rowClassProvider(index) || "");
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
            if (this.rangeSelectionStartIndex != null) {
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
        this.$.list.refresh();
        this.rangeSelectionStartIndex = null;
    },
    selectRow: function(index) {
        this.$.selection.select(event.rowIndex);
        //this.$.list.refresh();
        //Directly change the selected rows styling instead of refreshing for better performance
        this.$.list.prepareRow(event.rowIndex);
        this.$.row.addRemoveClass("selected", this.$.selection.isSelected(index));
        //But then we have to make sure that the last selected rows styling is also changed when in SINGLE_ROW selection mode
        if (this.selectionMode == "SINGLE_ROW" && (this.lastSelected != undefined)) {
            this.$.list.prepareRow(this.lastSelected);
            this.$.row.removeClass("selected");
        }
        this.lastSelected = event.rowIndex;
    },
    cellClick: function(sender, event) {
        if (!this.editable && (this.selectionMode == "SINGLE_COLUMN" || this.selectionMode == "MULTI_COLUMN")) {
            this.$.selection.select(sender.colIndex);
            this.$.list.refresh();
        }
    },
    cellDblclick: function(sender, event) {
        if (this.editable && (this.selectionMode == "SINGLE_COLUMN" || this.selectionMode == "MULTI_COLUMN")) {
            this.$.selection.select(sender.colIndex);
            this.$.list.refresh();
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
            for (var i = 0; i < selected.length; i++) {
                this.removeRow(selected[i]-i, false);
            }
        } else if (this.selectionMode == "SINGLE_COLUMN" || this.selectionMode == "MULTI_COLUMN") {
            for (var i = 0; i < selected.length; i++) {
                this.removeColumn(selected[i]-i, false);
            }
            this.createCells();
        }
        this.$.selection.clear();
        this.$.list.refresh();
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
        refresh = (refresh != undefined) ? refresh : true;
        this.data.remove(index);
        this.columnNames.remove(index);
        this.rowCount--;
        if (refresh) {
            if (this.selectionMode == "SINGLE_ROW" || this.selectionMode == "MULTI_ROW") {
                this.$.selection.clear();
            }
            this.$.list.refresh();
        }
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
        refresh = (refresh != undefined) ? refresh : true;
        for (var i = 0; i < this.data.length; i++) {
            this.data[i].remove(index);
        }
        this.colCount--;
        if (refresh) {
            if (this.selectionMode == "SINGLE_COLUMN" || this.selectionMode == "MULTI_COLUMN") {
                this.$.selection.clear();
            }
            this.createCells();
            this.$.list.refresh();
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
            for (var i = 0; i < this.colCount; i++) {
                if (this.$.selection.isSelected(i)) {
                    selected.push(i);
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
        this.$["input" + colIndex].setValue(value)
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
        this.$.list.refresh();
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
        this.createCells();
        this.$.list.refresh();
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
        this.$.list.refresh();
    },
    //* @public
    /**
     * Adds a column at the end of the table
     */
    addColumn: function() {
        this.colCount++;
        this.createCells();
        this.$.list.refresh();
    },
    //* @public
    /**
     * Refreshes the table
     */
    refresh: function() {
        this.createCells();
        this.$.list.refresh();
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
