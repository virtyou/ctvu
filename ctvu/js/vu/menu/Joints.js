vu.menu.Joints = CT.Class({
	CLASSNAME: "vu.menu.Joints",
	neutral: 0,
	bodmod: function(modpart) { // scale-oriented -- override in gesture
		modpart.scale = {
			width: 1,
			height: 1,
			depth: 1
		};
	},
	constraints: function(side, sub, part, axis) {
		return {
			min: 0.1,
			max: 2.0
		};
	},
	modder: function(sname, sitem, val, side, sub, part, axis, modpart) {
		var constraints = this.constraints(side, sub, part, axis),
			person = zero.core.current.person,
			gopts = person.opts[sname],
			per = this._.peritem;
		return CT.dom.div([
			axis ? CT.parse.toCaps([part, axis]).join(" ") : CT.parse.capitalize(part),
			CT.dom.range(function(val) {
				CT.log([side, sub, part, axis, ":", val].join(" "));
				modpart[part][axis] = val / 100;
				person[sname.slice(0, -1)](sitem);
				per(sname, gopts);
			}, constraints.min * 100, constraints.max * 100, 100 * (val || 0), 1, "w1")
		], "w1 pr10");
	}
}, vu.menu.Body);