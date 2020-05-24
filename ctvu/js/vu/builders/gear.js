vu.builders.Gear = CT.Class({
	CLASSNAME: "vu.builders.Gear",
	initMain: function() {
		var p = zero.core.current.person;
		p.opts.gear.worn = {};
		p.opts.gear.held = {};
		this.loadMain();
	},
	loadMain: function() {
		this.setItem("gear", "worn", true);
	},
	swapper: function(modpart, gtype, part, side, sub) {
		if (modpart[part]) {
			var tnode = CT.dom.div();
			CT.db.one(modpart[part], function(fullp) {
				CT.dom.setContent(tnode, fullp.name);
			}, "json");
			return [
				tnode,
				CT.dom.link("swap", function() {
					// vu.media.....
				}),
				CT.dom.pad(),
				CT.dom.link("adjust", function() {
					// vu.media.....
				})
			];
		} else {
			return CT.dom.link("add", function() {
				vu.media.prompt.thing(function(fullp) {
					modpart[part] = fullp.key;


					debugger; // TODO: the actual thing.....


				}, (gtype == "held") ? "held" : ("worn_" + part),
					null, side, sub);
			});
		}
	},
	modder: function(sname, sitem, val, side, sub, part, axis, modpart) {
		console.log(sname, sitem, val, side, sub, part, axis, modpart);
		return CT.dom.div([
			part,
			this.swapper(modpart, sitem, part, side, sub)
		], "bordered padded margined round");
	}
}, vu.menu.Body);

vu.builders.gear = {
	menus: function() {
		vu.builders.gear = new vu.builders.Gear({
			main: "gear",
			secondary: "held",
			impex: false
		});
	}
};