vu.builders.pop = {
	_: {
		selectors: {},
		menus: {
			cameras: "top",
			automatons: "topleft",
			activities: "topright",
			natural: "bottomright",
			program: "bottomleft",
			minimap: "bottom"
		},
		joined: function(person) {
			var _ = vu.builders.pop._, r = zero.core.current.room;
			zero.core.util.setCurPer(person);
			r.onReady(() => _.set(r.opts, true));
			new zero.core.Controls({
				cams: true,
				target: person
			});
		},
		set: function(room, noUpdate) {
			var _ = vu.builders.pop._, selz = _.selectors, item, upmenus = function() {
				for (item of ["automatons", "cameras", "minimap", "natural"])
					selz[item].update(); // automatons updates activities/program
			};
			_.opts = room;
			_.sharer.update(room);
			vu.core.setroom(room);
			CT.dom.setContent(_.curname, room.name || room.environment);
			noUpdate ? upmenus() : vu.builders.pop.update(upmenus);
		},
		select: function() {
			var _ = vu.builders.pop._,
				zones = vu.storage.get("rooms");
			CT.modal.choice({
				prompt: "select zone",
				data: [{ name: "new zone" }].concat(zones),
				cb: function(zone) {
					if (zone.name == "new zone")
						location = "/vu/zone.html";
					else
						_.set(zone);
				}
			});
		},
		linx: function() {
			var _ = vu.builders.pop._;
			_.sharer = vu.core.sharer();
			_.curname = CT.dom.span(null, "bold");
			zero.core.util.join(vu.core.person(vu.storage.get("person"), false, [
				0, 800, 0 // meh, hacky (should use max height or something)
			]), _.joined);
			return CT.dom.div([
				[
					CT.dom.span("viewing:"),
					CT.dom.pad(),
					_.curname
				], [
					CT.dom.link("swap", _.select),
					CT.dom.pad(),
					_.sharer
				]
			], "left shiftall");
		},
		mima: function() {
			var _ = vu.builders.pop._, selz = _.selectors,
				sel = selz.minimap = CT.dom.div();
			_.minimap = new vu.menu.Map({ node: sel, wait: true });
			sel.update = _.minimap.refresh;
		},
		automaton: function(auto) { // {person,program{base,coefficient,randomize},activities[]}
			var _ = vu.builders.pop._, selz = _.selectors, pname = CT.dom.div();
			auto.onperson(p => CT.dom.setContent(pname, p.name));
			return CT.dom.div(pname, "bordered padded margined round hoverglow", null, {
				onclick: function() {
					_.auto = auto;
					selz.program.update();
					selz.activities.update();
				}
			});
		},
		automatons: function() {
			var _ = vu.builders.pop._, selz = _.selectors, zcc = zero.core.current;
			selz.automatons = CT.dom.div();
			selz.automatons.update = function() {
				var autos = zcc.room.automatons, adder = function() {
					var akeys = autos.map(a => a.person.opts.key);
					akeys.push(zcc.person.opts.key);
					CT.modal.choice({
						prompt: "please select an automaton",
						data: vu.storage.get("people").filter(p => !akeys.includes(p.key)),
						cb: function(perobj) {
							var auto = new zero.core.auto.Automaton({
								person: perobj,
								onjoin: function() {
									var anode = _.automaton(auto);
									CT.dom.addContent(az, anode);
									anode.onclick();
								}
							});
							autos.push(auto);
						}
					});
				}, az = CT.dom.div(autos.map(_.automaton));
				CT.dom.setContent(selz.automatons, [
					CT.dom.button("add", adder, "up20 right"),
					az
				]);
//				az.firstChild ? az.firstChild.onclick() : adder();
			};
		},
		activity: function(act, remover) { // {action[say|respond|move|wander|dance],value}
			var n = CT.dom.div([
				CT.dom.button("remove", function() {
					if (!confirm("really?")) return;
					n.remove();
					remover(act);
				}, "bold red right"),
				CT.dom.span(act.action, "bold"),
				CT.dom.pad(),
				CT.dom.span(act.value)
			], "bordered padded margined round");
			return n;
		},
		activities: function() {
			var _ = vu.builders.pop._, selz = _.selectors,
				zc = zero.core, zcc = zc.current;
			selz.activities = CT.dom.div();
			selz.activities.update = function() {
				var actz = _.auto.activities, rmAct = function(act) {
					CT.data.remove(actz, act);
					vu.builders.pop.persist();
				}, addAct = function(act) {
					actz.push(act);
					vu.builders.pop.persist();
					(actz.length == 1) && _.auto.play();
					CT.dom.addContent(az, _.activity(act, rmAct));
				}, addWander = function(area) {
					addAct({
						action: "wander",
						value: area
					});
				}, adder = function() {
					CT.modal.choice({
						prompt: "please select an action",
						data: ["say", "respond", "dance", "wander", "move"],
						cb: function(action) {
							if (action == "dance") {
								CT.modal.choice({
									prompt: "please select a dance",
									data: Object.keys(_.auto.person.opts.dances),
									cb: function(dance) {
										addAct({
											action: "dance",
											value: dance
										});
									}
								});
							} else if (action == "wander") {
								if (zcc.room.floor || zcc.room.obstacle)
									zc.util.getArea(addWander);
								else
									addWander("bottom");
							} else if (action == "move") {
								vu.media.prompt.adjusters(null, _.auto.person.body,
									"position", zcc.room.bounds, 1, function() {
										var abo = _.auto.person.body, mobj = abo.wbs(),
											ospr = abo.springs.orientation;
										CT.modal.modal([
											"orientation",
											CT.dom.range(function(val) {
												ospr.target = parseFloat(val);
											}, 0, 6, ospr.target, 1, "w1")
										], function() {
											mobj.orientation = ospr.target;
											addAct({
												action: "move",
												value: mobj
											});
										});
									}
								);
							} else { // say/respond
								CT.modal.prompt({
									prompt: action + " what?",
									cb: function(phrase) {
										addAct({
											action: action,
											value: phrase
										});
									}
								});
							}
						}
					});
				}, az = CT.dom.div(actz.map(a => _.activity(a, rmAct)));
				CT.dom.setContent(selz.activities, [
					CT.dom.button("add", adder, "up20 right"),
					az
				]);
				az.firstChild || adder();
			};
		},
		program: function() { // {base,coefficient,randomize}
			var _ = vu.builders.pop._, selz = _.selectors,
				pname = CT.dom.div(null, "up15 right bigger bold");
			selz.program = CT.dom.div();
			selz.program.update = function() {
				var pr = _.auto.program;
				_.auto.onperson(p => CT.dom.setContent(pname, p.name));
				CT.dom.setContent(selz.program, [
					pname,
					CT.dom.checkboxAndLabel("randomize activities",
						pr.randomize, null, null, null, function(cbox) {
							_.auto.reprogram({
								randomize: cbox.checked
							});
							vu.builders.pop.persist();
						}),
					CT.dom.div([
						CT.dom.div("interval", "big right"),
						"base",
						CT.dom.range(function(val) {
							val = parseFloat(val);
							_.auto.reprogram({
								base: val
							});
							vu.builders.pop.persist();
						}, 1, 10, pr.base, 0.5, "w1"),
						"coefficient (random multiplier)",
						CT.dom.range(function(val) {
							val = parseFloat(val);
							_.auto.reprogram({
								coefficient: val
							});
							vu.builders.pop.persist();
						}, 1, 10, pr.coefficient, 0.5, "w1")
					], "bordered padded margined round")
				]);
			};
		},
		nat: function(variety) {
			var opts = vu.builders.pop._.opts, upd = {};
			return zero.core.natural.editors(variety, opts, function(collectionName) {
				upd[collectionName] = opts[collectionName];
				vu.storage.setOpts(opts.key, upd);
			});
		},
		flofa: function() {
			var _ = vu.builders.pop._, selz = _.selectors;
			selz.natural = CT.dom.div();
			selz.natural.update = function() {
				CT.dom.setContent(selz.natural, ["flora", "fauna"].map(_.nat));
			};
		},
		setup: function() {
			var _ = vu.builders.pop._, selz = _.selectors;
			selz.cameras = CT.dom.div(null, "centered");
			vu.controls.initCamera(selz.cameras);
			_.automatons();
			_.activities();
			_.program();
			_.flofa();
			_.mima();
		}
	},
	persist: function() { // NB: this only works in remote mode, screw it ;)
		var oz = vu.builders.pop._.opts;
		oz.automatons = zero.core.auto.json();
		vu.storage.edit({
			key: oz.key,
			automatons: oz.automatons
		});
	},
	update: function(cb) {
		zero.core.util.room(CT.merge({
			onbuild: function(room) {
				cb && cb();
				zero.core.camera.cutifroom();
			}
		}, vu.builders.pop._.opts));
	},
	menus: function() {
		var section, _ = vu.builders.pop._, selz = _.selectors;
		_.setup();
		for (section in _.menus)
			vu.core.menu(section, _.menus[section], selz[section]).show("ctmain");
	}
};