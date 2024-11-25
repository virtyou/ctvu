vu.color = {
	_: {
		primaries: {
			red: { r: 1, g: 0, b: 0 },
			green: { r: 0, g: 1, b: 0 },
			blue: { r: 0, g: 0, b: 1 }
		}
	},
	splash: function(color) {
		zero.core.current.person.splash(vu.color._.primaries[color]);
	},
	set: function(target, color, prop, lnum, uplight) {
		var copts = {}, zcu = zero.core.util, rgb = zcu.hex2rgb(color);
		color = zcu.hex2int(color);
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
		var cnode = vu.color.picker((target.opts.key || target.name) + " " + prop, scolor, function() {
			vu.color.set(target, cnode.value, prop, lnum, uplight);
		});
		return cnode;
	},
	modal: function(cb) {
		var picker = vu.color.picker(), mod = CT.modal.modal([
			"what color?",
			picker,
			CT.dom.button("this color", function() {
				cb(zero.core.util.hex2int(picker.value));
				mod.hide();
			})
		]);
	},
	picker: function(key, val, cb) {
		key = key || "k" + CT.data.token();
		val = val || "#FFFFFF";
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
						cb && cb();
					}, 20); // so silly...
				}
			});
		});
		return n;
	}
};