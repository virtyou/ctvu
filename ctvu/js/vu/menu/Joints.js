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
	jointRange: function(sname, sitem, val, side, sub, part, axis, modpart) {
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
	},
	setJoints: function(sname, sitem, side, sub) {
		var _ = this._, selz = _.selectors,
			person = zero.core.current.person,
			gopts = person.opts[sname],
			sing = _.sing(sname),
			item_opts = gopts[sitem] = gopts[sitem] || {},
			modpart = item_opts[side] = item_opts[side] || {},
			val, partnames, bname = side,
			neu = this.neutral, curl = this.curl, bm = this.bodmod,
			jrange = this.jointRange, jset = this.setJoints;
		if (sub) {
			bname += "_" + sub;
			if (!item_opts[side][sub])
				item_opts[side][sub] = {};
			modpart = item_opts[side][sub]; // such as hand or arm
		}
		partnames = Object.keys(modpart);
		CT.dom.setContent(selz[bname], partnames.length ? partnames.map(function(part) {
			val = modpart[part];
			return CT.dom.div([
				Object.keys(val).map(function(axis) {
					return jrange(sname, sitem, val[axis], side, sub, part, axis, modpart);
				})
			], "jblock pr10");
		}) : "");
		CT.dom.setContent(selz[bname + "_button"], partnames.length ? CT.dom.button("clear", function() {
			if (!confirm("really?"))
				return;
			person["un" + sing](null, side, sub);
			if (sub) {
				delete item_opts[side][sub];
				if (!Object.keys(item_opts[side]).length)
					delete item_opts[side];
			} else
				delete item_opts[side];
			jset(sname, sitem, side, sub);
		}) : CT.dom.button("add", function() {
			var _c = CT.parse.capitalize,
				pmod = zero.core[_c(side)] || zero.core[_c(sub)],
				az = zero.base.aspects[sub || side];
			if (pmod.parts) {
				pmod.parts.forEach(function(part) {
					modpart[part] = {};
					Object.keys(az[part]).forEach(function(dim) {
						if (curl || (dim != "curl"))
							modpart[part][dim] = neu;
					});
				});
			} else // body
				bm(modpart);
			jset(sname, sitem, side, sub);
		}));
	}
}, vu.menu.Body);