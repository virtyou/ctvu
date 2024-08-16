vu.builders.scene = {
	_: {
		selectors: {},
		menus: {
			cameras: "top",
			main: "topleft",
			score: "topleft",
			props: "topright",
			portals: "topright",
			steps: "bottomleft",
			actors: "bottomright",
			automatons: "bottomright"
		},
		proppers: ["furnishing", "carpentry"],
		swappers: ["props", "portals", "main", "score", "actors", "automatons"],
		upons: function(a) {
			var surfaces = ["bottom"].concat(zero.core.current.room.surfaces(true)),
				vg = vu.game, aobj = vg.util.state().actors[a.name], flists = {},
				aupons = aobj.upons = aobj.upons || {}, surfs, changed;
			var slup = function(uname) {
				aupons[uname] = flists[uname].fields.value();
				changed = true;
			}, slot = function(uname) {
				flists[uname] = CT.dom.div();
				vu.core.fieldList(flists[uname], aupons[uname], () => slup(uname));
				return CT.dom.div([
					CT.dom.div(uname, "big"),
					flists[uname]
				], "bordered padded margined round");
			}, slotter = function() {
				surfs = surfaces.filter(s => !(s in aupons));
				if (!surfs.length)
					return alert("no unconfigured surfaces!");
				CT.modal.choice({
					prompt: "please select a surface",
					data: surfs,
					cb: function(surf) {
						aupons[surf] = [];
						CT.dom.addContent(slots, slot(surf));
					}
				});
			}, slots = CT.dom.div(Object.keys(aupons).map(slot));
			CT.modal.modal([
				CT.dom.button("add location", slotter, "right"),
				CT.dom.div("upon triggers for " + a.name, "bigger bold"),
				'respond "upon" for location-based responses',
				slots
			], () => changed && vg.step.upstate(), { className: "basicpopup notBig"});
		},
		actor: function(a) {
			var _ = vu.builders.scene._, zcc = zero.core.current, vg = vu.game,
				possers = vg.util.positioners(a.name, zcc.scene.name, true),
				gup = vg.step.upstate, state = vg.util.state(), az = state.actors,
				r = zcc.room, bod = zcc.people[a.name].body, sz = bod.springs;
			return CT.dom.div([
				a.name,
				CT.dom.smartField({
					isTA: true,
					noBreak: true,
					classname: "w1",
					value: az[a.name].description,
					blurs: ["enter a short description", "describe this person"],
					cb: function(desc) {
						az[a.name].description = desc.trim();
						gup();
					}
				}),
				CT.dom.div([
					"weave",
					CT.dom.range(function(val) {
						sz.weave.target = parseInt(val);
					}, r.bounds.min.x, r.bounds.max.x,
						sz.weave.target, 1, "w1 block")
				], "bordered padded margined round"),
				CT.dom.div([
					"slide",
					CT.dom.range(function(val) {
						sz.slide.target = parseInt(val);
					}, r.bounds.min.z, r.bounds.max.z,
						sz.slide.target, 1, "w1 block")
				], "bordered padded margined round"),
				CT.dom.div([
					"orientation",
					CT.dom.range(function(val) {
						sz.orientation.target = parseInt(val);
					}, -Math.PI, Math.PI,
						sz.orientation.target, 1, "w1 block")
				], "bordered padded margined round"),
				CT.dom.button("set initial position", function() {
					for (axis of ["weave", "bob", "slide", "orientation"])
						possers[axis] = sz[axis].target;
					gup();
				}, "w1"),
				CT.dom.button("set upon triggers", () => _.upons(a), "w1 block")
			], "bordered padded margined round inline-block", null, {
				onclick: () => zero.core.camera.follow(bod)
			});
		},
		actors: function() {
			var _ = vu.builders.scene._, selz = _.selectors,
				zcc = zero.core.current, scene = zcc.scene, actor,
				az = CT.dom.div(scene.actors.map(_.actor));
			CT.dom.setContent(selz.actors, [
				CT.dom.button("add", function() {
					var akeys = scene.actors.map(a => a.key);
					CT.modal.choice({
						prompt: "please select an actor",
						data: vu.storage.get("people").filter(function(p) {
							return !akeys.includes(p.key);
						}),
						cb: function(perobj) {
							scene.actors.push(perobj);
							vu.storage.edit({
								key: scene.key,
								actors: scene.actors.map(a => a.key)
							});
							zero.core.util.join(perobj, function(person) {
								CT.dom.addContent(az, _.actor(perobj));
							});
						}
					});
				}, "abs ctr shiftup"),
				az
			]);
		},
		adrop: function(name, dcfg) {
			return CT.dom.div([
				"drop on " + name,
				CT.dom.select({
					names: ["none", "knocker", "grabber", "smasher", "flamer"],
					curvalue: dcfg[name] || "none",
					onchange: function(val) {
						dcfg[name] = val;
						vu.game.step.upstate();
					}
				})
			]);
		},
		automaton: function(auto) {
			var _ = vu.builders.scene._, vg = vu.game, gup = vg.step.upstate,
				zc = zero.core, az = vg.util.state(zc.current.scene.name, "automatons"),
				n = CT.dom.div(), check = vu.build.core.check, acfg, tcfg, dcfg;
			auto.onperson(function(per) {
				acfg = az[per.name] = az[per.name] || {};
				tcfg = acfg.throw = acfg.throw || {};
				dcfg = acfg.drop = acfg.drop || {};
				CT.dom.setContent(n, [
					CT.dom.div(per.name, "big"),
					CT.dom.div([
						CT.dom.div("general", "right bold small up10 right5"),
						check("fly", acfg, gup),
					], "bordered padded margined round"),
					CT.dom.div([
						CT.dom.div("items", "right bold small up10 right5"),
						["start", "stop"].map(k => _.adrop(k, dcfg))
					], "bordered padded margined round"),
					CT.dom.div([
						CT.dom.div("throws", "right bold small up10 right5"),
						["fauna", "fire", "ice", "acid"].map(k => check(k, tcfg, gup))
					], "bordered padded margined round")
				]);
				n.onclick = () => zc.camera.follow(per.body)
			});
			return CT.dom.div(n, "bordered padded margined round inline-block");
		},
		automatons: function() {
			var _ = vu.builders.scene._, selz = _.selectors,
				autos = zero.core.current.room.automatons;
			CT.dom.setContent(selz.automatons, autos.map(_.automaton));
		},
		portswap: function(p, cb) {
			vu.game.util.sports(p, function(rscenes) {
				CT.modal.choice({
					prompt: "which scene should this portal initially link to?",
					data: ["no initial linkage"].concat(rscenes),
					cb: function(target) {
						if (target == "no initial linkage")
							delete p.target;
						else
							p.target = target.name;
						vu.game.step.upstate();
						cb();
					}
				});
			});
		},
		linkage: function(p) {
			var linkage = CT.dom.div(), swap = function() {
				vu.builders.scene._.portswap(p, linkage.update);
			};
			linkage.update = function() {
				CT.dom.setContent(linkage, CT.dom.link(p.target
					|| "link portal to scene", swap));
			};
			linkage.update();
			return CT.dom.div([
				"Scene Linkage",
				linkage
			], "bordered padded margined round");
		},
		portal: function(p) {
			var _ = vu.builders.scene._, zcc = zero.core.current,
				scene = zcc.scene, ports = vu.game.util.state(scene.name, "portals"),
				pobj = ports[p.name] = ports[p.name] || { name: p.name };
			return CT.dom.div([
				p.name,
				CT.dom.smartField({
					isTA: true,
					classname: "w1",
					value: pobj.description,
					blurs: ["enter a short description", "describe this portal"],
					cb: function(desc) {
						pobj.description = desc.trim();
						vu.game.step.upstate();
					}
				}),
				_.linkage(pobj)
			], "bordered padded margined round", null, {
				onclick: function() {
					zero.core.camera.follow(zcc.room[p.name]);
				}
			});
		},
		portals: function() {
			var _ = vu.builders.scene._, selz = _.selectors,
				zcc = zero.core.current,
				ports = vu.game.util.state(zcc.scene.name, "portals"),
				pvalz = Object.values(ports),
				pz = CT.dom.div(pvalz.map(_.portal));
			CT.dom.setContent(selz.portals, [
				CT.dom.button("add", function() {
					var pnames = pvalz.map(p => p.name),
						data = zcc.room.objects.filter(function(p) {
							return p.opts.kind == "portal" && !pnames.includes(p.name);
						});
					data.length ? CT.modal.choice({
						prompt: "please select a portal",
						data: data,
						cb: function(port) {
							zero.core.camera.follow(port);
							CT.dom.addContent(pz, _.portal(port));
						}
					}) : alert("add one on the zone page!");
				}, "abs ctr shiftup"),
				pz
			]);
		},
		prop: function(p) {
			var zcc = zero.core.current, scene = zcc.scene, pushit = function() {
				vu.storage.edit({
					key: scene.key,
					props: scene.props
				});
			}, pobj = scene.props[p.name] = scene.props[p.name] || {
				name: p.name
			}, upit = function(key, val) {
				pobj[key] = val;
				pushit();
			}, treasure, prop = zcc.room[p.name], conts = [
				p.name,
				CT.dom.smartField({
					isTA: true,
					classname: "w1",
					value: pobj.description,
					blurs: ["enter a short description", "describe this prop"],
					cb: desc => upit("description", desc.trim())
				})
			];
			if (prop.opts.variety == "chest") {
				pobj.treasure = pobj.treasure || "consumable";
				treasure = CT.dom.link(pobj.treasure, function() {
					CT.modal.choice({
						prompt: "please select the treasure for this chest",
						data: ["consumable"].concat(vu.core.options.names("held")),
						cb: function(item) {
							upit("treasure", item);
							CT.dom.setContent(treasure, item);
						}
					});
				});
				conts.push([
					CT.dom.span("treasure:"),
					CT.dom.pad(),
					treasure
				]);
			}
			return CT.dom.div(conts, "bordered padded margined round", null, {
				onclick: () => zero.core.camera.follow(prop)
			});
		},
		props: function() {
			var _ = vu.builders.scene._, selz = _.selectors,
				zcc = zero.core.current, scene = zcc.scene,
				pvalz = Object.values(scene.props),
				pz = CT.dom.div(pvalz.map(_.prop));
			CT.dom.setContent(selz.props, [
				CT.dom.button("add", function() {
					var pnames = pvalz.map(p => p.name),
						data = zcc.room.objects.filter(function(p) {
							return _.proppers.includes(p.opts.kind) && !pnames.includes(p.name);
						});
					data.length ? CT.modal.choice({
						prompt: "please select a prop",
						data: data,
						cb: function(furn) {
							zero.core.camera.follow(furn);
							CT.dom.addContent(pz, _.prop(furn));
						}
					}) : alert("add something on the zone page!");
				}, "abs ctr shiftup"),
				pz
			]);
		},
		item: function(iopts) { // also creates/places thing!!
			var r = zero.core.current.room,
				gup = vu.game.step.upstate,
				item = r.attach(CT.merge(iopts,
					vu.core.options.get(iopts.kind, iopts.name)));
			return CT.dom.div([
				CT.dom.div(" (" + iopts.kind + ")", "right small"),
				item.name,
				CT.dom.smartField({
					isTA: true,
					noBreak: true,
					classname: "w1",
					value: iopts.description,
					blurs: ["enter a short description", "describe this item"],
					cb: function(desc) {
						iopts.description = desc.trim();
						gup();
					}
				}),
				["x", "y", "z"].map(function(dim, i) {
					return CT.dom.div([
						dim,
						CT.dom.range(function(val) {
//							item.springs[dim].target = parseInt(val);
							item.adjust("position", dim, parseInt(val));
						}, r.bounds.min[dim], r.bounds.max[dim],
							iopts.position[i], 1, "w1 block")
					], "bordered padded margined round");
				}),
				CT.dom.button("set initial position", function() {
					var pos = item.position();
					iopts.position = [pos.x, pos.y, pos.z];
					gup();
				}, "w1")
			], "bordered padded margined round", null, {
				onclick: function() {
					zero.core.camera.follow(item);
				}
			});
		},
		items: function() {
			var _ = vu.builders.scene._, selz = _.selectors,
				zc = zero.core, zcu = zc.util, zcc = zc.current,
				si = vu.game.util.state(zcc.scene.name, "items"),
				iz = CT.dom.div(Object.values(si).map(_.item));
			CT.dom.setContent(selz.items, [
				CT.dom.button("add", function() {
					CT.modal.choice({
						prompt: "what kind of item?",
						data: ["held"].concat(zcu.worns).filter(k => vu.storage.get(k)),
						cb: function(kind) {
							CT.modal.choice({
								prompt: "please select an item",
								data: vu.core.options.names(kind),
								cb: function(iname) {
									si[iname] = {
										name: iname,
										kind: kind,
										position: [0, 0, 0]
									};
									CT.dom.addContent(iz, _.item(si[iname]));
								}
							});
						}
					});
				}, "right"),
				"Items",
				iz
			]);
		},
		lights: function() {
			var _ = vu.builders.scene._, selz = _.selectors,
				zcc = zero.core.current, scene = zcc.scene,
				lz = zcc.room.lights, state = vu.game.util.state(scene.name);
			if (state.lights) {
				lz.forEach(function(l, i) {
					l.setIntensity(state.lights[i]);
				});
			}
			CT.dom.setContent(selz.lights, CT.dom.div([
				"Lights",
				CT.dom.div(lz.map(function(light, i) {
					return CT.dom.range(function(val) {
						light.setIntensity(parseInt(val) / 100);
					}, 0, 100, light.opts.intensity * 100, 1, "w1 block");
				}), "noflow"),
				CT.dom.button("set initial lighting", function() {
					state.lights = zcc.room.lights.map(l => l.opts.intensity);
					vu.game.step.upstate();
				}, "w1")
			], "pt10"));
		},
		roomReady: function() {
			vu.game.util.prestart();
			vu.builders.scene._.automatons();
		},
		backstage: function() {
			var _ = vu.builders.scene._, selz = _.selectors,
				zc = zero.core, zcc = zc.current, scene = zcc.scene;
			zcc.room.setBounds();
			_.props();
			_.items();
			_.lights();
			_.actors();
			_.portals();
			zc.util.onRoomReady(_.roomReady);
			zcc.room.setFriction(false); // for positioning......
			vu.controls.initCamera(selz.cameras);
			CT.dom.addContent(selz.props, selz.items);
			CT.dom.addContent(selz.main, selz.lights);
		},
		head: function(section) {
			var n = CT.dom.node(CT.parse.key2title(section)),
				_ = vu.builders.scene._;
			if (_.swappers.indexOf(section) != -1)
				n.onclick = () => vu.core.swap(_.swappers, _.selectors);
			return n;
		},
		swap: function() {
			var sb = vu.builders.scene;
			CT.modal.choice({
				prompt: "please select a scene",
				data: ["new scene"].concat(sb._.scenes),
				cb: function(scene) {
					if (scene == "new scene")
						sb.create();
					else
						sb.load(scene);
				}
			});
		},
		play: function() {
			location = "/vu/adventure.html#" +
				zero.core.current.scene.game.key;
		},
		linx: function() {
			var _ = vu.builders.scene._;
			_.sharer = vu.core.sharer();
			_.curname = CT.dom.span(null, "bold");
			return CT.dom.div([
				[
					CT.dom.span("viewing:"),
					CT.dom.pad(),
					_.curname
				], [
					CT.dom.link("play", _.play),
					CT.dom.pad(),
					CT.dom.link("swap", _.swap),
					CT.dom.pad(),
					_.sharer
				]
			], "left shiftall");
		},
		curscene: function() {
			var s, sz = vu.builders.scene._.scenes,
				cs = CT.storage.get("scene");
			if (cs) {
				for (s of sz)
					if (s.key == cs)
						return s;
			}
			if (sz.length)
				return sz[0];
		}
	},
	load: function(scene) {
		var _ = vu.builders.scene._, selz = _.selectors,
			snode = CT.dom.div(null, "right"),
			upscripts = vu.game.step.upscripts;
		zero.core.current.scene = scene;
		CT.storage.set("scene", scene.key);
		CT.dom.setContent(_.curname, scene.name);
		_.audio = new vu.audio.Controller({
			fx: scene.fx,
			music: scene.music,
			ambient: scene.ambient
		});
		CT.dom.setContent(selz.main, [
			CT.dom.div(scene.name, "bigger"),
			scene.description,
			"room: " + scene.room.name,
			vu.build.core.check("cutscene", scene, true),
			CT.dom.br(),
			snode,
			"Scripts",
			selz.scripts
		]);
		CT.dom.setContent(selz.score, [
			vu.game.event.editor(),
			vu.game.hopper.mod()
		]);
		vu.game.step.setSels(selz);
		vu.game.step.setAudio(_.audio);
		vu.game.step.steps();

		if (!Object.keys(scene.scripts).length)
			scene.scripts.start = [];
		vu.core.fieldList(selz.scripts, Object.keys(scene.scripts), null, function(v) {
			var f = CT.dom.field(null, v);
			if (v) {
				f._trigger = v;
				f.onfocus = function() {
					CT.dom.setContent(snode, f._trigger);
					selz.steps.refresh(f._trigger);
				};
				CT.dom.inputEnterCallback(f, function() {
					if (f.value) {
						f.value = f.value.toLowerCase();
						scene.scripts[f.value] = scene.scripts[f._trigger];
						delete scene.scripts[f._trigger];
						CT.dom.setContent(snode, f.value);
						f._trigger = f.value;
						upscripts();
					} else
						f.value = f._trigger; // meh
				});
			} else {
				f.onkeyup = function() { f.value = f.value.toLowerCase() };
			}
			return f;
		}, function(iput) {
			var key = iput.value;
			if (key in scene.scripts) return; // already exists...
			scene.scripts[key] = [];
			setTimeout(function() {
				iput.focus();
			});
		}, function(val) {
			delete scene.scripts[val];
			upscripts();
		});

		vu.builders.scene.build();
	},
	build: function() {
		var cfg = core.config.ctzero, pobj,
			scene = zero.core.current.scene,
			sgi = scene.game.initial,
			sgia = sgi.actors = sgi.actors || {}, acto;
		cfg.room = scene.room;
		cfg.people = scene.actors;
		for (pobj of cfg.people) {
			acto = sgia[pobj.name] = sgia[pobj.name] || {};
			pobj.positioners = vu.game.util.positioners(pobj.name, scene.name, true);
		}
		zero.core.util.init(null, vu.builders.scene._.backstage);
	},
	create: function() {
		var sb = vu.builders.scene;
		vu.core.my("game", function(gz) {
			if (gz.length == 0)
				return alert("oops! create a game first on the make page!");
			CT.modal.choice({
				prompt: "please select a game",
				data: gz,
				cb: function(game) {
					vu.game.util.scene(game, function(s) {
						s.game = game;
						sb._.scenes.push(s);
						sb.load(s);
					});
				}
			});
		});
	},
	setup: function() {
		var selz = vu.builders.scene._.selectors;
		selz.main = CT.dom.div();
		selz.score = CT.dom.div();
		selz.scripts = CT.dom.div();
		selz.steps = CT.dom.div();
		selz.actors = CT.dom.div();
		selz.automatons = CT.dom.div();
		selz.props = CT.dom.div();
		selz.items = CT.dom.div();
		selz.lights = CT.dom.div();
		selz.portals = CT.dom.div();
		selz.cameras = CT.dom.div(null, "centered");
	},
	menus: function() {
		var section, _ = vu.builders.scene._, selz = _.selectors;
		for (section in _.menus) {
			selz[section].modal = vu.core.menu(section,
				_.menus[section], selz[section], _.head(section));
			["portals", "score", "automatons"].includes(section) || selz[section].modal.show("ctmain");
		}
	},
	init: function() {
		var sb = vu.builders.scene, _ = sb._,
			selz = _.selectors, smatchz,
			skey = location.hash.slice(1);
		location.hash = "";
		CT.dom.addContent("ctheader", _.linx());
		sb.setup();
		sb.menus();
		vu.core.my("scene", function(scenes) {
			_.scenes = scenes;
			if (scenes.length) {
				if (skey) {
					smatchz = scenes.filter(s => s.key == skey);
					if (smatchz.length != 1) {
						alert("oops! you don't have access to that scene :'(");
						location = "/vu/game.html";
					} else
						sb.load(smatchz[0]);
				} else
					sb.load(_.curscene());
			} else
				sb.create();
		}, "json_plus");
	}
};