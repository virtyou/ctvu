vu.color = {
	set: function(target, color, prop, lnum, uplight) {
		var copts = {}, _ = vu.builders.zone._, rgb = vu.color.hex2rgb(color);
		color = parseInt(color.slice(1), 16);
		if (uplight) { // light
			target.setColor(rgb);
			uplight(color, lnum);
		} else { // object
			target.thring.material.color = rgb;
			copts[prop] = color;
			vu.storage.setMaterial(target.opts.key, copts);
		}
	},
	selector: function(target, prop, lnum, uplight) {
		var bcolor = target.opts.color || "#FFFFFF",
			scolor = (typeof bcolor == "string") ? bcolor : ("#" + bcolor.toString(16));
		if (!prop)
			prop = "light " + lnum;
		var cnode = vu.color.picker(prop + " selector", scolor, function() {
			vu.color.set(target, cnode.value, prop, lnum, uplight);
		});
		return cnode;
	},
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