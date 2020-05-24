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
		CT.dom.setContent(this._.selectors.held,
			["right", "left"].map(this.hmodder));
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
		var set = function(livepart) {
			if (livepart.target) livepart = null; // is click event;
			vu.media.prompt.thing(function(fullp) {
				modpart[part] = fullp.key;
				per.gear(per.opts.gear);
				peritem("gear", per.opts.gear);
				up();
			}, (gtype == "held") ? "held" :
				("worn_" + ((sub == "hand") ? "finger" : part)),
				livepart, side, sub);
		};
		var adjusters = function(livepart, upthing) {
			CT.modal.choice({
				data: ["position", "rotation", "scale"],
				cb: function(variety) {
					vu.media.prompt.adjusters(function(upobj) {
						vu.storage.setOpts(livepart.opts[upthing
							? "thing_key" : "key"], upobj);
					}, livepart, variety);
				}
			});
		};
		var adjust = function(livepart) {
			if (livepart.opts.owners.includes(user.core.get("key"))) {
				CT.modal.choice({
					prompt: "adjust base (thing) or just this instance (part)?",
					data: ["part", "thing"],
					cb: function(resp) {
						adjusters(livepart, resp == "thing");
					}
				});
			} else
				adjusters(livepart);
		};
		var up = function() {
			if (modpart[part]) {
				CT.db.one(modpart[part], function(fullp) {
					CT.dom.setContent(n, CT.dom.link(fullp.name, function() {
						CT.modal.choice({
							data: ["swap", "adjust", "remove"],
							cb: function(eopt) {
								if (eopt == "remove") {
									if (!confirm("really?")) return;
									per.ungear(modpart[part]);
									vu.storage.edit(modpart[part], null, "delete", "key");
									modpart[part] = null;
									up();
								} else
									((eopt == "swap") ? set :
										adjust)(per.body.gearmap[modpart[part]]);
							}
						});
					}));
				}, "json");
			} else
				CT.dom.setContent(n, CT.dom.link("add", set));
		};
		up();
		return n;
	},
	modder: function(sname, sitem, val, side, sub, part, axis, modpart) {
		return CT.dom.div([
			part,
			this.swapper(modpart, sitem, part, side, sub)
		], "bordered padded margined round");
	},
	hmodder: function(side) {
		var mp = zero.core.current.person.opts.gear.held,
			n = this.modder("gear", "held", mp[side],
				side, null, side, null, mp);
		n.classList.add("inline-block");
		return n;
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