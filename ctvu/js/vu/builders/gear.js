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
	canClear: function(modpart) {
		if (!confirm("really?")) return false;
		for (var sub in modpart)
			if (modpart[sub])
				vu.storage.edit(modpart[sub],
					null, "delete", "key");
		return true;
	},
	swapper: function(modpart, gtype, part, side, sub) {
		var per = zero.core.current.person,
			peritem = this._.peritem, n = CT.dom.div();
		var up = function() {
			if (modpart[part]) {
				var tnode = CT.dom.div();
				CT.db.one(modpart[part], function(fullp) {
					CT.dom.setContent(tnode, fullp.name);
				}, "json");
				CT.dom.setContent(n, [
					tnode,
					CT.dom.link("edit", function() {
						CT.modal.choice({
							data: ["swap", "adjust", "remove"],
							cb: function(eopt) {
								if (eopt == "remove") {
									if (!confirm("really?")) return;
									per.ungear(modpart[part]);
									vu.storage.edit(modpart[part], null, "delete", "key");
									modpart[part] = null;
									up();
								} else if (eopt == "swap") {

								} else if (eopt == "adjust") {

								}
							}
						});
					})
				]);
			} else {
				CT.dom.setContent(n, CT.dom.link("add", function() {
					vu.media.prompt.thing(function(fullp) {
						modpart[part] = fullp.key;
						per.gear(per.opts.gear);
						peritem("gear", per.opts.gear);
						up();
					}, (gtype == "held") ? "held" : ("worn_" + part),
						null, side, sub);
				}));
			}
		};
		up();
		return n;
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