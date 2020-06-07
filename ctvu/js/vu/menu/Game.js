vu.menu.Game = CT.Class({
	CLASSNAME: "vu.menu.Game",
	_: {
		selectors: {},
		menus: {
			story: "bottomleft"
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
			var _ = this._, zc = zero.core, iz = _.interactionals,
				s = CT.dom.div(statement, "biggest");
			if (iz.say)
				iz.say.set([person.name, s]);
			else
				iz.say = _.basic(person.name, "top", s, _.hider("say"));
			iz.say.show("ctmain");
		},
		convo: function(person) {
			setTimeout(function() { // ... meh
//				person.look(zero.core.camera);
				zero.core.camera.angle("front", person.name, "lookHigh");
			});
			person.onsay(this._.sayer);
			var n = CT.dom.div();
			vu.controls.setTriggers(n, this._.upper, person);
			return n;
		},
		basic: function(name, side, info, cb, header) {
			return vu.core.menu(name, side, info,
				header, cb || this._.collapse(name));
		},
		info: function(name, info) {
			var _ = this._, zc = zero.core, iz = _.interactionals;
			if (iz.info)
				iz.info.set([name, info]);
			else
				iz.info = _.basic("info", "bottom",
					info, _.hider("info", true), name);
			return iz.info;
		},
		setup: function() {
			this._.selectors.story = CT.dom.div(null,
				"scrolly kidvp mt5 hm400p");
		}
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
	item: function(item) {
		this.info(item.name, item.opts.description, item);
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