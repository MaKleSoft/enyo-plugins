@author Martin Kleinschrodt
Copyright (c) by MaKleSoft
This code is provided "as is", without any kind of warranty.
http://www.maklesoft.com

## maklesoft.Table
The table kind allows to generate any kind of tabular layout using Repeater-like event-based cell rendering. For example the enyo code

	{
		kind: "Table", colCount: 2, rowCount: 2, onSetupCell: "setupCell"
	},
	setupCell: function(sender, rowIndex, colIndex) {
		return "cell " + rowIndex + "," + colIndex;
	}

produces the following markup:

	<table>
		<tbody>
			<tr><td>cell 0,0</td><td>cell 0,1</td></tr>
			<tr><td>cell 1,0</td><td>cell 1,1</td></tr>
		</tbody>
	</table>

You can also fill the cells with any kind of enyo control. For example:

	setupCell: function() {
		return {kind: "Input", value: "cell " + rowIndex + "," + colIndex};
	}

## maklesoft.DataTable

    A control that is designed to display and/or collect tabular data. This implementation uses the maklesoft.Table kind for displaying the data.
    Aside from editing cells and deleting and adding rows and columns this control also supports various selection modes and dynamical styling of
    cells. For more info see the source doku. An example can be found in the DataTableExample kind.
