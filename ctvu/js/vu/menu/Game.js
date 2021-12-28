vu.menu.Game = CT.Class({
	CLASSNAME: "vu.menu.Game",
	_: {
		selectors: {},
		menus: {
			minimap: "topright",
			story: "bottomleft",
			camera: "bottomright"
		},
		interactionals: {},
		collapse: function(section) {
			var sel = this._.selectors[section];
			return function() {
				sel._collapsed = !sel._collapsed;
				sel.modal.node.classList[sel._collapsed ? "add" : "remove"]("collapsed");
			};
		},
		upper: function(variety, name, person) {
			var zcc = zero.core.current,
				astate = this.state.actors[person.name];
			this.log("upper():", person.name, variety, name);
			if (astate.vibe != person.vibe.current) {
				astate.vibe = person.vibe.current;
				zcc.adventure.upstate();
			}
			zcc.scene.script(name);
		},
		hider: function(menu, cambak) {
			var zc = zero.core, iz = this._.interactionals;
			return function() {
				iz[menu].hide();
				cambak && zc.camera.follow(zc.current.person.body);
			};
		},
		sayer: function(statement, person) {
			this._.interactional("say", "top", person.name,
				CT.dom.div(statement, "biggest"), true).show("ctmain");
		},
		convo: function(person) {
			setTimeout(function() { // ... meh
//				person.look(zero.core.camera);
				zero.core.camera.angle("front", person.name);//, "lookHigh");
			});
			person.onsay(this._.sayer);
			var n = CT.dom.div();
			vu.controls.setTriggers(n, this._.upper, person, true);
			return n;
		},
		basic: function(name, side, info, cb, header) {
			return vu.core.menu(name, side, info,
				header, cb || this._.collapse(name));
		},
		interactional: function(itype, side, name, info, recenter) {
			var _ = this._, iz = _.interactionals;
			if (iz[itype]) {
				iz[itype].set([name, info]);
				recenter && iz[itype].node.recenter();
			} else
				iz[itype] = _.basic(itype, side,
					info, _.hider(itype, true), name);
			return iz[itype];
		},
		info: function(name, info) {
			return this._.interactional("info", "bottom", name, info);
		},
		seeing: function(name, info) {
			return this._.interactional("seeing", "right", name, info);
		},
		hearing: function(name, info) {
			return this._.interactional("hearing", "left", name, info);
		},
		setup: function() {
			var _ = this._, selz = _.selectors, cam = zero.core.camera;
			selz.story = CT.dom.div(null, "scrolly kidvp mt5 hm400p");
			selz.camera = CT.dom.div();
			selz.minimap = CT.dom.div();
			_.minimap = new vu.menu.Map({
				wait: true,
				node: selz.minimap
			});
			selz.camera.update = function() {
				CT.dom.setContent(selz.camera, [
					CT.dom.div(cam.current, "abs ctr shiftup yellow small mr5"),
					["behind", "pov", "front", cam.cyclabel()].map(function(p) {
						return CT.dom.button(p, function(e) {
							cam.angle(p);
							e.stopPropagation();
						});
					})
				]);
				selz.camera.modal.show();
			};
			cam.onchange(selz.camera.update);
		}
	},
	minimap: function() {
		var _ = this._, mod = _.selectors.minimap.modal;
		if (mod.node.classList.contains("collapsed"))
			mod.node.classList.remove("collapsed");
		mod.show("ctmain", _.minimap.refresh);
	},
	story: function() {
		var sel = this._.selectors.story, s = this.state,
			mod = sel.modal, snode = mod.node;
		CT.dom.setContent(sel, [
			CT.dom.button("state", function() {
				CT.modal.modal([
					CT.dom.button("reset", function() {
						if (!(confirm("are you sure you want to start over?") && confirm("really delete all your progress?")))
							return;
						zero.core.current.adventure.reset();
					}, "abs ctl shiftup"),
					CT.dom.div("known state", "big centered"),
					Object.keys(s.actors).map(function(a) {
						return CT.dom.div([
							CT.dom.div(a, "bold"),
							Object.keys(s.actors[a]).filter(p => p != "positioners").map(function(p) {
								return p + ": " + s.actors[a][p];
							})
						], "bordered padded margined round");
					})
				], null, null, true);
			}, "abs ctr shiftup"),
			s.story
		]);
		mod.show();
		if (snode.classList.contains("collapsed"))
			snode.classList.remove("collapsed");
		setTimeout(function() { // TODO: fix this!!
			sel.firstChild.lastChild.lastChild.scrollIntoView({
				behavior: "smooth"
			});
		}, 500);
	},
	info: function(name, info, thing) {
		this._.info(name, info).show();
		zero.core.camera.follow(thing);
	},
	attribution: function(atype, name, info, source) {
		var mod = this._[atype](CT.dom.div(name, "big"), CT.dom.div([
			info, CT.dom.div(source, "biggest")
		], "centered"));
		mod.show();
		setTimeout(mod.hide, 5000);
	},
	item: function(item) {
		var zcc = zero.core.current, per = zcc.person,
			state = this.state, msg = "you get a " + item.name;
		this.info(item.name, [
			item.opts.description,
			CT.dom.button("get", function() {
				per.get(item, function() {
					vu.game.util.text(msg);
					state.story.push(msg);
					if (item.opts.kind == "held")
						state.inventory.gear.held = per.opts.gear.held;
					else
						state.inventory.gear.worn = per.opts.gear.worn;
					delete state.scenes[zcc.scene.name].items[item.name];
					zcc.adventure.upstate();
				});
			}, "w1 mv5")
		], item);
	},
	portal: function(portal) {
		var scene = zero.core.current.scene.name,
			portals = this.state.scenes[scene].portals;
		this.info(portal.name, portals[portal.name].description, portal);
	},
	prop: function(prop) {
		var props = zero.core.current.scene.opts.props;
		this.info(prop.name, props[prop.name].description, prop);
	},
	person: function(person) {
		var zcc = zero.core.current,
			aopts = this.state.actors[person.name];
		this.info(person.name, person == zcc.person
			? "it's you!" : [
				aopts.description, this._.convo(person)
			], person.body);
	},
	init: function(opts) {
		var _ = this._, s, selz = _.selectors;
		this.opts = opts = CT.merge(opts, {
			// ???
		});
		this.state = opts.state;
		_.setup();
		for (s in _.menus)
			selz[s].modal = _.basic(s, _.menus[s], selz[s]);
	}
});