vu.color = {
	picker: function(key, val, cb) {
		var id = key.replace(/ /g, ""),
			n = CT.dom.field(id, val, "block", null, null, {
				color: "gray",
				background: val
			});
		CT.dom.doWhenNodeExists(id, function() { // wait a tick
			n.picker = jsColorPicker("input#" + id, {
				color: val,
				readOnly: true,
				actionCallback: cb
			});
		});
		return n;
	},
	// https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb#5624139
	hex2rgb: function(hex) {
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16) / 255,
			g: parseInt(result[2], 16) / 255,
			b: parseInt(result[3], 16) / 255
		} : null;
	}
};