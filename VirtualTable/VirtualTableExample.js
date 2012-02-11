enyo.kind({
    name: "VirtualTableExample",
    kind: "VFlexBox",
    components: [{
        kind: "Header",
        components: [{content: "VirtualTable example <br> <span style='color:gray; font-size: 12pt'>Brought to you by MaKleSoft</span>", flex: 1},
        {kind: "ToggleButton", onChange: "toggleHScroll", onLabel: "scroll", offLabel: "flex", state: true},
        {kind: "Button", caption: "load data", onclick: "loadData"}]
    },{
        kind: "BasicScroller", flex: 1, autoHorizontal: true, components: [{
            kind: "maklesoft.VirtualTable",
            name: "table",
            rowCount: 50,
            colCount: 15,
            selectionMode: "MULTI_ROW",
            editable: false,
            style: "width: 1800px"
        }]
    }],
    toggleHScroll: function(sender, scroll) {
    try {
        if (scroll) {
            this.$.table.flex = undefined;
            this.$.table.applyStyle("width", "1800px");
        } else {
            this.$.table.flex = 1;
            this.$.table.applyStyle("width", "");
        }
        } catch(e) {alert(e)}
    },
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
    }
});
