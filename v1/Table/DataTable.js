/*
@author Martin Kleinschrodt
Copyright (c) by MaKleSoft
This code is provided "as is", without any kind of warranty.
http://www.maklesoft.com
*/
/**
    A control that is designed to display and/or collect tabular data. This implementation uses the maklesoft.Table kind for displaying the data. Aside from editing cells and deleting and adding rows and columns
    this control also supports various selection modes and dynamical styling of individual cells
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
            * maklesoft.DataTable.SelectionModes.SINGLE_ROW: One row can be selected at a time
            * maklesoft.DataTable.SelectionModes.MULTI_ROW: Multiple rows can be selected at a time
            * maklesoft.DataTable.SelectionModes.SINGLE_COLUMN: One column can be selected at a time
            * maklesoft.DataTable.SelectionModes.MULTI_COLUMN: Multiple columns can be selected at a time
            * maklesoft.DataTable.SelectionModes.NONE: No selection possible
            Default: maklesoft.DataTable.SelectionModes.NONE
        * showRowNumbers: Whether or not to display the row numbers
            Default: true
        * showColumnNames: Whether or not to use column names
            Default: false
        * columnNames: An array specifying the column names to be used. If this property is omitted the columns will
            be labeled alphabetically
        * cellClass: This can either be a string, specifying a generic class name for all cells or a function that returns a class name depending on the row index, column index and data of the cell. For more information, see 'Dynamic styling'.
        
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
        Custom functions can be provided for the cellClass property in order to dynamically style cells. This function should
        take the column and row index and the value of the cell and decide which css class to apply to the cell. For example the default
        cellClass function returns the class name "number" if the value in the cell is a number:
            function(colIndex, rowIndex, data) {
                if (typeof(data) == "number")
                return "number";
            }
 */
enyo.kind({
    name: "maklesoft.DataTable",
    kind: "Control",
    className: "maklesoft-datatable",
    published: {
        rowCount: 0,
        colCount: 0,
        editable: false,
        data: [[]],
        selectionMode: 4,
        showRowNumbers: false,
        showColumnNames: false,
        columnNames: "ABCDEFGHIJKLMNOPQURSTUVWXYZ".split(""),
        rowNames: [],
        cellClass: function(rowIndex, colIndex, data) {
            var className = "maklesoft-datatable-cell";
            if (rowIndex % 2 == 1) {
                className += " maklesoft-datatable-odd";
            }
            if (typeof data == "number") {
                className += " maklesoft-datatable-number";
            }
            return className;
        }
    },
    rowCountChanged: function() {
        this.refresh();
    },
    colCountChanged: function() {
        this.refresh(true, true);
    },
    editableChanged: function() {
        for (var j=0; j<this.rowCount; j++) {
            for (var i = 0; i < this.colCount; i++) {
                if (this.$["input_" + j + "_" + i]) {
                    this.$["input_" + j + "_" + i].setDisabled(!this.editable);
                }
            }
        }
    },
    dataChanged: function() {
        this.data = this.data.concat([]); //Make a copy of the passed data rather than using the actual array
        this.rowCount = Math.max(this.data.length, this.rowCount);
        this.colCount = this.colCount || this.getMaxColLength();
        this.refresh();
    },
    selectionModeChanged: function() {
        if (this.selectionMode == maklesoft.DataTable.SelectionMode.SINGLE_ROW || this.selectionMode == maklesoft.DataTable.SelectionMode.SINGLE_COLUMN) {
            this.$.selection.setMulti(false);
        } else if (this.selectionMode == maklesoft.DataTable.SelectionMode.MULTI_ROW || this.selectionMode == maklesoft.DataTable.SelectionMode.MULTI_COLUMN) {
            this.$.selection.setMulti(true);
        }
        this.$.selection.clear();
        this.refresh();
    },
    showRowNumbersChanged: function() {
        this.refresh();
    },
    showColumnNamesChanged: function() {
        this.refresh();
    },
    create: function(params) {
        this.rangeSelectionStartIndex = null;
        this.inherited(arguments);
        this.rowCount = this.rowCount || this.data.length;
        this.selectionModeChanged();
        this.colCount = this.colCount || this.getMaxColLength();
        this.refresh();
    },
    setupCell: function(sender, row, col) {
        if (this.showRowNumbers && this.showColumnNames && row === 0 && col === 0) {
            return;
        } else if (this.showRowNumbers && col === 0) {
            if (this.rowNames.length > 0) {
                return {content: this.showColumnNames ? this.rowNames[row-1] : this.rowNames[row], className: "maklesoft-datatable-rowname"};
            } else {
                return {content: this.showColumnNames ? row-1 : row, className: "maklesoft-datatable-rownumber"};
            }
        } else if (this.showColumnNames && row === 0) {
            return {content: this.showRowNumbers ? this.columnNames[col-1] : this.columnNames[col], className: "maklesoft-datatable-colname"};
        } else {
            var rowIndex = this.showColumnNames ? row-1 : row;
            var colIndex = this.showRowNumbers ? col-1 : col;
            var rowData = this.data[rowIndex] || [];
            var data = rowData[colIndex] || "";

            var className = typeof this.cellClass == "function" ? this.cellClass(rowIndex, colIndex, data) : this.cellClass;
            var cellConfig = {
                kind: "HFlexBox", name: "cell_" + rowIndex + "_" + colIndex, onclick: "cellClick", ondblclick: "cellDblclick", onmousehold: "cellMouseheld", className: className, components: [{kind: "BasicInput", value: data, disabled: !this.editable, rowIndex: rowIndex, colIndex: colIndex, name: "input_" + rowIndex + "_" + colIndex, flex: 1, style: "width: 100%; padding: 0px 10px 0px 10px", hint: "", onchange: "inputChanged"}]
            };

            if (((this.selectionMode == maklesoft.DataTable.SelectionMode.SINGLE_COLUMN || this.selectionMode == maklesoft.DataTable.SelectionMode.MULTI_COLUMN) && this.$.selection.isSelected(colIndex)) ||
                ((this.selectionMode == maklesoft.DataTable.SelectionMode.SINGLE_ROW || this.selectionMode == maklesoft.DataTable.SelectionMode.MULTI_ROW) && this.$.selection.isSelected(rowIndex))) {
                cellConfig.className += " maklesoft-datatable-selected";
            }
            return cellConfig;
        }
    },
    cellMouseheld: function(sender, event) {
        var rowIndex = this.showColumnNames ? sender.rowIndex-1 : sender.rowIndex;
        //If the selection mode allows multiple rows to be selected, trigger the range selection
        if (this.selectionMode == maklesoft.DataTable.SelectionMode.MULTI_ROW) {
            this.startRangeSelection(rowIndex);
        } else if (this.selectionMode == maklesoft.DataTable.SelectionMode.SINGLE_ROW) {
            this.selectRow(rowIndex);
        }
    },
    startRangeSelection: function(startIndex) {
        var rowOffset = this.showColumnNames ? 1 : 0;
        //if the range selection has allready been triggered with another startindex
        if (this.rangeSelectionStartIndex) {
            //remove the marker from the old start index row+
            this.$.table.fetchRow(this.rangeSelectionStartIndex + rowOffset).removeClass("maklesoft-datatable-rangeselection");
        }
        //Highlight the row at the start index
        this.$.table.fetchRow(startIndex + rowOffset).addClass("maklesoft-datatable-rangeselection");
        this.rangeSelectionStartIndex = startIndex;
    },
    endRangeSelection: function(endIndex) {
        var startIndex = this.rangeSelectionStartIndex;
        this.$.table.fetchRow(startIndex).removeClass("maklesoft-datatable-rangeselection");
        for (var i = Math.min(startIndex, endIndex); i <= Math.max(startIndex, endIndex); i++) {
            this.$.selection.select(i);
        }
        this.refresh();
        this.rangeSelectionStartIndex = null;
    },
    selectRow: function(index) {
        this.$.selection.select(index);
        var rowOffset = this.showColumnNames ? 1 : 0;
        //this.$.list.refresh();
        //Directly change the selected rows styling instead of refreshing for better performance
        this.$.table.fetchRow(index + rowOffset).addRemoveClass("maklesoft-datatable-selected", this.$.selection.isSelected(index));
        //But then we have to make sure that the last selected rows styling is also changed when in SINGLE_ROW selection mode
        if (this.selectionMode == maklesoft.DataTable.SelectionMode.SINGLE_ROW && (this.lastSelected !== undefined)) {
            this.$.table.fetchRow(this.lastSelected + rowOffset).removeClass("maklesoft-datatable-selected");
        }
        this.lastSelected = index;
    },
    cellClick: function(sender, event) {
        var rowIndex = this.showColumnNames ? sender.rowIndex-1 : sender.rowIndex;
        var colIndex = this.showRowNumbers ? sender.colIndex-1 : sender.colIndex;
        if (!this.editable && (this.selectionMode == maklesoft.DataTable.SelectionMode.SINGLE_COLUMN || this.selectionMode == maklesoft.DataTable.SelectionMode.MULTI_COLUMN)) {
            this.$.selection.select(colIndex);
            this.refresh();
        } else if (this.selectionMode == maklesoft.DataTable.SelectionMode.SINGLE_ROW || this.selectionMode == maklesoft.DataTable.SelectionMode.MULTI_ROW) {
            //if range selection has been triggered
            if (this.rangeSelectionStartIndex !== null) {
                //and the startIndex is not the index of the row itself
                if (this.rangeSelectionStartIndex != rowIndex) {
                    //apply the range selection
                    this.endRangeSelection(rowIndex);
                }
            //select on single click only if the cells are not editable. Otherwise double click is necessary
            } else if (!this.editable) {
                this.selectRow(rowIndex);
            }
        }
    },
    cellDblclick: function(sender, event) {
        var rowIndex = this.showColumnNames ? sender.rowIndex-1 : sender.rowIndex;
        var colIndex = this.showRowNumbers ? sender.colIndex-1 : sender.colIndex;
        if (this.editable && (this.selectionMode == maklesoft.DataTable.SelectionMode.SINGLE_COLUMN || this.selectionMode == maklesoft.DataTable.SelectionMode.MULTI_COLUMN)) {
            this.$.selection.select(colIndex);
            this.refresh();
        } else if (this.editable && (this.selectionMode == maklesoft.DataTable.SelectionMode.SINGLE_ROW || this.selectionMode == maklesoft.DataTable.SelectionMode.MULTI_ROW)) {
            //If the cells are editable a double click is required to select
            this.selectRow(rowIndex);
        }
    },
    inputChanged: function(sender, event) {
        //fill up the rows to the given row index
        while (this.data.length <= sender.rowIndex) {
            this.data.push([]);
        }
        //fill up the columns to the given column index
        while (this.data[sender.rowIndex].length <= sender.colIndex) {
            this.data[sender.rowIndex].push("");
        }
        //apply the change to the data array
        this.data[sender.rowIndex][sender.colIndex] = sender.getValue();
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
        if (this.selectionMode == maklesoft.DataTable.SelectionMode.SINGLE_ROW || this.selectionMode == maklesoft.DataTable.SelectionMode.MULTI_ROW) {
            this.removeRows(selected);
        } else if (this.selectionMode == maklesoft.DataTable.SelectionMode.SINGLE_COLUMN || this.selectionMode == maklesoft.DataTable.SelectionMode.MULTI_COLUMN) {
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
            if (this.selectionMode == maklesoft.DataTable.SelectionMode.SINGLE_ROW || this.selectionMode == maklesoft.DataTable.SelectionMode.MULTI_ROW) {
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
            if (this.selectionMode == maklesoft.DataTable.SelectionMode.SINGLE_COLUMN || this.selectionMode == maklesoft.DataTable.SelectionMode.MULTI_COLUMN) {
                this.$.selection.clear();
            }
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
        if (this.selectionMode == maklesoft.DataTable.SelectionMode.SINGLE_ROW || this.selectionMode == maklesoft.DataTable.SelectionMode.MULTI_ROW) {
            for (var i = 0; i < this.rowCount; i++) {
                if (this.$.selection.isSelected(i)) {
                    selected.push(i);
                }
            }
        } else if (this.selectionMode == maklesoft.DataTable.SelectionMode.SINGLE_COLUMN || this.selectionMode == maklesoft.DataTable.SelectionMode.MULTI_COLUMN) {
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
        this.$["input_" + rowIndex + "_" + colIndex].setValue(value);
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
        return this.$["input_" + rowIndex + "_" + colIndex].getValue();
    },
    //* @public
    /**
     * Inserts a row at the given index. Also inserts an empty array at the corresponding place in the data array.
     * @param {int} index
     * The index at which the row is supposed to be inserted
     */
    insertRowAt: function(index, data) {
        this.$.selection.clear();
        this.rowCount++;
        this.data = this.data.insertAt(index, data || []);
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
        this.refresh();
    },
    //* @public
    /**
     * Inserts a column or row right before the lowest selected index, depending on the selection mode
     */
    insertBeforeSelected: function() {
        if (this.selectionMode == maklesoft.DataTable.SelectionMode.SINGLE_ROW || this.selectionMode == maklesoft.DataTable.SelectionMode.MULTI_ROW) {
            this.insertRowAt(this.getSelectedIndizes()[0] || 0);
        } else if (this.selectionMode == maklesoft.DataTable.SelectionMode.SINGLE_COLUMN || this.selectionMode == maklesoft.DataTable.SelectionMode.MULTI_COLUMN) {
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
        this.$.table.setColCount(this.colCount);
        this.$.table.setRowCount(this.rowCount);
        this.$.table.refresh();
    },
    clear: function() {
        this.setData([]);
        this.setColCount(0);
        this.setRowCount(0);
        this.$.selection.clear();
        this.refresh();
    },
    components: [
        {kind: "maklesoft.Table", name: "table", onSetupCell: "setupCell"},
        {kind: enyo.Selection}
    ]
});

maklesoft.DataTable.SelectionMode = {
    SINGLE_ROW: 0,
    MULTI_ROW: 1,
    SINGLE_COLUMN: 2,
    MULTI_COLUMN: 3,
    NONE: 4
};

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