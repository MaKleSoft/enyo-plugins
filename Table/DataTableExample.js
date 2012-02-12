enyo.kind({
    name: "DataTableExample",
    kind: "VFlexBox",
    components: [{
        kind: "Header",
        components: [{content: "ScrollingVirtualTable example <br> <span style='color:gray; font-size: 12pt'>Brought to you by MaKleSoft</span>", flex: 1},
        {kind: "Button", caption: "load data", onclick: "loadData"}]
    },{
        kind: "HFlexBox", flex: 1, components: [{
            kind: "Scroller", flex: 1, components: [{
                kind: "maklesoft.DataTable",
                name: "table",
                rowCount: 50,
                colCount: 7,
                selectionMode: maklesoft.DataTable.SelectionMode.MULTI_ROW,
                editable: true
            }]
        },{
            kind: "BasicScroller", autoHorizontal: false, horizontal: false, style: "width: 320px", components: [{
                kind: "RowGroup", components: [{
                    kind: "HFlexBox", components: [{content: "column names", flex: 1},
                    {kind: "ToggleButton", onChange: "toggleColNames"}]
                },{
                    kind: "HFlexBox", components: [{content: "row numbers", flex: 1},
                    {kind: "ToggleButton", onChange: "toggleRowNumbers", state: false}]
                },{
                    kind: "HFlexBox", components: [{content: "editable", flex: 1},
                    {kind: "ToggleButton", onChange: "toggleEditable", state: true}]
                },{
                    kind: "ListSelector", label: "selection mode", onChange: "selectionModeChanged", items: [
                        {caption: "SINGLE_ROW", value: maklesoft.DataTable.SelectionMode.SINGLE_ROW},
                        {caption: "MULTI_ROW", value: maklesoft.DataTable.SelectionMode.MULTI_ROW},
                        {caption: "SINGLE_COLUMN", value: maklesoft.DataTable.SelectionMode.SINGLE_COLUMN},
                        {caption: "MULTI_COLUMN", value: maklesoft.DataTable.SelectionMode.MULTI_COLUMN},
                        {caption: "NONE", value: maklesoft.DataTable.SelectionMode.NONE}
                    ], value: maklesoft.DataTable.SelectionMode.MULTI_ROW
                },{
                    kind: "Button",
                    caption: "remove selected",
                    onclick: "removeSelected"
                },{
                    kind: "Button",
                    caption: "insert at selected",
                    onclick: "insert"
                },{
                    kind: "Button",
                    caption: "add row",
                    onclick: "addRow"
                },{
                    kind: "Button",
                    caption: "add column",
                    onclick: "addColumn"
                }]
            },{
                style: "color:gray; font-size: 12pt; padding: 0px 10px 10px 10px",
                content: "Click to select in normal mode, double click to select in editable mode.<br>" +
                    "Click and hold to trigger range selection in MULTI_ROW selection mode. Click again to finish range selection."
            }]
        }]
    }],
    loadData: function() {
        var data = [];
        for (var i = 0, dataRow; i < this.$.table.getRowCount(); i++) {
            dataRow = [];
            for (var j = 0; j < this.$.table.getColCount(); j++) {
                dataRow.push("row " + i + ", col " + j);
            }
            data.push(dataRow);
        }
        this.$.table.setData(data);
    },
    toggleColNames: function(sender, state) {
        this.$.table.setShowColumnNames(state);
    },
    toggleRowNumbers: function(sender, state) {
        this.$.table.setShowRowNumbers(state);
    },
    toggleEditable: function(sender, state) {
        this.$.table.setEditable(state);
    },
    selectionModeChanged: function(sender, value) {
        this.$.table.setSelectionMode(value);
    },
    removeSelected: function() {
        this.$.table.removeSelected();
    },
    insert: function() {
        this.$.table.insertBeforeSelected();
    },
    addRow: function() {
        this.$.table.addRow();
    },
    addColumn: function() {
        this.$.table.addColumn();
    }
});
