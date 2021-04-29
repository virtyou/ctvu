vu.color = {
	set: function(target, color, prop, lnum, uplight) {
		var copts = {}, rgb = zero.core.util.hex2rgb(color);
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
		var bcolor = target.opts.color || target.opts.material[prop] || "#FFFFFF",
			scolor = (typeof bcolor == "string") ? bcolor : ("#" + bcolor.toString(16));
		if (!prop)
			prop = "light " + lnum;
		var cnode = vu.color.picker(target.opts.key + " " + prop, scolor, function() {
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
				actionCallback: function() {
					CT.log(n.value);
					setTimeout(function() {
						if (n.value.startsWith("rgba(")) {
							n.value = zero.core.util.rgbToHex.apply(null,
								n.value.slice(5,
									-1).split(", ").map(s => parseInt(s)));
							CT.log(n.value);
						}
						cb();
					}, 20); // so silly...
				}
			});
		});
		return n;
	}
};