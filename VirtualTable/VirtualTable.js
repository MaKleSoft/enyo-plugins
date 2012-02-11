/*
@author Martin Kleinschrodt
Copyright (c) by MaKleSoft
This code is provided "as is", without any kind of warranty.
http://www.maklesoft.com
*/
/**
    A control that is designed to display and/or collect tabular data. The rows are rendered using the VirtualRepeater kind which makes for more flexible        scrolling behavior but renders this control less efficient for huge amounts of data. If you want to display data with more than 100 rows and can do          without horizontal scrolling use the ScrollingVirtualTable kind instead. Aside from editing cells and deleting and adding rows and columns
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
    kind: "maklesoft.BasicVirtualTable",
    components: [{
        kind: "HFlexBox", name: "columnNames"
    },{
		flex: 1, name: "list", kind: "VirtualRepeater", className: "list", onSetupRow: "listSetupRow", components: [
			{name: "row", kind: "HFlexBox", className: "row", onclick: "rowClick", ondblclick: "rowDblclick", onmousehold: "rowMouseheld"}
		]
    },{
        kind: enyo.Selection
    }],
    refresh: function(createCells, createColNames) {
        this.inherited(arguments);
        this.$.list.render();
    }
});
