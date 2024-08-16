vu.menu.Game = CT.Class({
	CLASSNAME: "vu.menu.Game",
	_: {
		scores: {},
		selectors: {},
		interactionals: {},
		menus: {
			minimap: "topright",
			story: "bottomleft",
			score: "bottomleft",
			camera: "bottomright"
		},
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
				cambak && zc.camera.angle("preferred");
//				cambak && zc.camera.follow(zc.current.person.body);
			};
		},
		sayer: function(statement, person) {
			var m = CT.modal.latest = this._.interactional("say", "top",
				person.name, CT.dom.div(statement, "biggest nonowrap"), true);
			m.on.hide = () => zero.core.camera.angle("preferred");
			m.show("ctmain");
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
		interactional: function(itype, side, name, info, recenter, nocam) {
			var _ = this._, iz = _.interactionals;
			if (iz[itype]) {
				iz[itype].set([name, info]);
				recenter && iz[itype].node.recenter();
			} else
				iz[itype] = _.basic(itype, side,
					info, _.hider(itype, !nocam), name);
			return iz[itype];
		},
		info: function(name, info, nocam) {
			return this._.interactional("info", "topleft", name, info, false, nocam);
		},
		seeing: function(name, info) {
			return this._.interactional("seeing", "right", name, info);
		},
		hearing: function(name, info) {
			return this._.interactional("hearing", "left", name, info);
		},
		setup: function() {
			var _ = this._, selz = _.selectors, zc = zero.core, cam = zc.camera;
			selz.story = CT.dom.div(null, "scrolly kidvp mt5 hm200p");
			selz.score = CT.dom.div();
			selz.camera = CT.dom.div();
			selz.minimap = CT.dom.div();
			_.minimap = zc.current.minimap = new vu.menu.Map({
				wait: true,
				node: selz.minimap,
				onready: vu.game.hopper.load
			});
			selz.camera.update = function() {
				CT.dom.setContent(selz.camera, [
					CT.dom.div(cam.current, "abs ctr shiftup yellow small mr5"),
					["polar", "behind", "pov", "front"].map(function(p) {
						return CT.dom.button(p, function(e) {
							cam.angle(p);
							e.stopPropagation();
						});
					})
				]);
				selz.camera.modal.show();
			};
			cam.onchange(selz.camera.update);
		},
		scoreMeters: function(p) {
			var _ = this._, mz = _.scores[p.name], ps = p.score,
				locap = ps.level * 20, hicap = ps.level * 100;
			if (!mz) {
				mz = _.scores[p.name] = {};
				mz.hp = new vu.game.Meter({
					cap: locap,
					value: ps.hp
				});
				mz.xp = new vu.game.Meter({
					cap: hicap,
					value: ps.xp,
					counterClass: "h10p blueback"
				});
				mz.breath = new vu.game.Meter({
					cap: locap,
					value: ps.breath,
					counterClass: "h10p yellowback"
				});
				mz.zombie = new vu.game.Meter({
					cap: ps.ztick || 10,
					value: ps.ztick || 0,
					counterClass: "h10p greenback"
				});
				mz.all = [mz.hp.line, mz.xp.line, mz.breath.line, mz.zombie.line];
			} else { // update
				mz.hp.set(ps.hp, locap);
				mz.xp.set(ps.xp, hicap);
				mz.breath.set(ps.breath, locap);
				p.zombified && mz.zombie.set(ps.ztick, true);
			}
			mz.breath.setVisibility(!mz.breath.full());
			mz.zombie.setVisibility(p.zombified);
			return mz;
		},
		score: function(p) { // {hp,xp,level,ztick} ; xpcap = level * 100 ; hpcap = level * 20
			var mz = this._.scoreMeters(p);
			return CT.dom.div([
				CT.dom.div([
					CT.dom.span(mz.hp.status(), "red"),
					CT.dom.pad(),
					CT.dom.span(mz.xp.status(), "blueblue"),
					CT.dom.pad(),
					CT.dom.span("level " + p.score.level, p.zombified ? "green" : "white")
				], "right bold small"),
				p.name,
				mz.all
			], "bordered padded margined round");
		}
	},
	minimap: function() {
		var _ = this._, mod = _.selectors.minimap.modal;
		if (mod.node.classList.contains("collapsed"))
			mod.node.classList.remove("collapsed");
		mod.show("ctmain", _.minimap.refresh);
	},
	score: function() {
		var _ = this._, selz = _.selectors, sel = selz.score,
			mod = sel.modal, snode = mod.node,
			pz = Object.values(zero.core.current.people).filter(b => !!b.score);
		pz.sort((a, b) => b.score.xp - a.score.xp);
		CT.dom.setContent(sel, [
			CT.dom.button("story", this.story, "abs ctr shiftup"),
			pz.map(_.score)
		]);
		mod.show("ctmain");
		selz.story.modal.hide();
		if (snode.classList.contains("collapsed"))
			snode.classList.remove("collapsed");
	},
	story: function() {
		var selz = this._.selectors, sel = selz.story, fll,
			s = this.state, mod = sel.modal, snode = mod.node;
		CT.dom.setContent(sel, [
			CT.dom.div([
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
				}),
				CT.dom.button("score", this.score)
			], "abs ctr shiftup"),
			s.story
		]);
		mod.show("ctmain");
		selz.score.modal.hide();
		if (snode.classList.contains("collapsed"))
			snode.classList.remove("collapsed");
		setTimeout(function() { // TODO: fix this!!
			fll = sel.firstChild.lastChild.lastChild;
			fll && fll.scrollIntoView({
				behavior: "smooth"
			});
		}, 500);
	},
	basic: function(name, info, glowy, nocam) {
		var m = this._.info(name, info, nocam);
		m.show("ctmain");
		glowy && setTimeout(() => CT.trans.glow(m.node));
		return m;
	},
	info: function(name, info, thing, nocam) {
		this.basic(name, info, false, nocam);
		zero.core.camera.follow(thing);
	},
	attribution: function(atype, name, info, source) {
		var mod = this._[atype](CT.dom.div(name, "big"), CT.dom.div([
			info, CT.dom.div(source, "biggest")
		], "centered"));
		mod.show("ctmain");
		setTimeout(mod.hide, 5000);
	},
	book: function(item) {
		this.info(item.name, [
			item.opts.author,
			item.readbutt()
		], item);
	},
	shelf: function(item) {
		var bz = item.opts.items, desc,
			sings = ["catches your eye", "gathers dust", "seems neglected", "looks interesting"],
			plurs = ["catch your eye", "gather dust", "seem neglected", "pique your curiosity"];
		if (bz.length == 1)
			desc = "a book " + CT.data.choice(sings);
		else
			desc = bz.length + " books " + CT.data.choice(plur);
		this.info(item.variety, [
			desc,
			item.perusebutt()
		], item);
	},
	chest: function(item) {
		var zcc = zero.core.current, props = zcc.scene.opts.props, popts = CT.merge(props[item.name], {
			description: CT.data.choice(["nice chest", "what's in there?", "a chest"]),
			treasure: "consumable"
		}), pos = item.position();
		this.info(item.name, [
			popts.description,
			item.openbutt(() => vu.game.dropper.drop(pos, popts.treasure), true)
		], item);
	},
	item: function(item) {
		this.info(item.name, [
			item.opts.description,
			CT.dom.button("get", () => setTimeout(vu.game.dropper.get, 0, item), "w1 mv5")
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
		this.info(person.name, person == zcc.person ? vu.clix.yinfo() : [
			CT.dom.button("look", function(e) {
				zero.core.camera.angle("front", person.name);
				e.stopPropagation();
			}, "right up15"),
			aopts.description,
			this._.convo(person)
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