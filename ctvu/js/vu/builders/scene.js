vu.builders.scene = {
	_: {
		selectors: {},
		menus: {
			cameras: "top",
			main: "topleft",
			props: "topright",
			portals: "topright",
			steps: "bottomleft",
			actors: "bottomright"
		},
		swappers: ["props", "portals"],
		state: function(ofScene, sub) {
			var i = zero.core.current.scene.game.initial;
			if (!ofScene) return i;
			if (!i.scenes) i.scenes = {};
			if (!i.scenes[ofScene]) i.scenes[ofScene] = {};
			if (!sub) return i.scenes[ofScene];
			if (!i.scenes[ofScene][sub]) i.scenes[ofScene][sub] = {};
			return i.scenes[ofScene][sub];
		},
		actor: function(a) {
			var _ = vu.builders.scene._, zcc = zero.core.current,
				gup = vu.game.step.upstate, state = _.state(), r = zcc.room,
				az = state.actors = state.actors || {},
				bod = zcc.people[a.name].body, sz = bod.springs;
			az[a.name] = az[a.name] || {};
			az[a.name].positioners = az[a.name].positioners || {};
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
					var posz = az[a.name].positioners
					for (axis of ["weave", "slide", "orientation"])
						az[a.name].positioners[axis] = sz[axis].target;
					gup();
				}, "w1")
			], "bordered padded margined round inline-block", null, {
				onclick: function() {
					zero.core.camera.follow(bod);
				}
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
				scene = zcc.scene, ports = _.state(scene.name, "portals"),
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
				ports = _.state(zcc.scene.name, "portals"),
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
			var zcc = zero.core.current, scene = zcc.scene,
				pobj = scene.props[p.name] = scene.props[p.name] || { name: p.name };
			return CT.dom.div([
				p.name,
				CT.dom.smartField({
					isTA: true,
					classname: "w1",
					value: pobj.description,
					blurs: ["enter a short description", "describe this prop"],
					cb: function(desc) {
						pobj.description = desc.trim();
						vu.storage.edit({
							key: scene.key,
							props: scene.props
						});
					}
				})
			], "bordered padded margined round", null, {
				onclick: function() {
					zero.core.camera.follow(zcc.room[p.name]);
				}
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
							return p.opts.kind == "furnishing" && !pnames.includes(p.name);
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
				item = new zero.core.Thing(CT.merge(iopts,
					vu.storage.get("held")[iopts.name]));
			return CT.dom.div([
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
				zcc = zero.core.current,
				si = _.state(zcc.scene.name, "items"),
				iz = CT.dom.div(Object.values(si).map(_.item));
			CT.dom.setContent(selz.items, [
				CT.dom.button("add", function() {
					CT.modal.choice({
						prompt: "please select an item",
						data: Object.keys(vu.storage.get("held")),
						cb: function(iname) {
							si[iname] = {
								name: iname,
								position: [0, 0, 0]
							};
							CT.dom.addContent(iz, _.item(si[iname]));
						}
					})
				}, "right"),
				"Items",
				iz
			]);
		},
		lights: function() {
			var _ = vu.builders.scene._, selz = _.selectors,
				zcc = zero.core.current, scene = zcc.scene,
				lz = zcc.room.lights, state = _.state(scene.name);
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
		backstage: function() {
			var _ = vu.builders.scene._, selz = _.selectors,
				zcc = zero.core.current, scene = zcc.scene;
			_.props();
			_.items();
			_.lights();
			_.actors();
			_.portals();
			zcc.room.setBounds();
			zcc.room.setFriction(false); // for positioning......
			vu.controls.initCamera(selz.cameras);
			CT.dom.addContent(selz.props, selz.items);
			CT.dom.addContent(selz.main, selz.lights);
		},
		swapem: function() {
			var _ = vu.builders.scene._, selz = _.selectors;
			_.swappers.forEach(function(section) {
				selz[section].modal.showHide("ctmain");
			});
		},
		head: function(section) {
			var n = CT.dom.node(CT.parse.key2title(section)),
				_ = vu.builders.scene._;
			if (_.swappers.indexOf(section) != -1)
				n.onclick = _.swapem;
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
		}
	},
	load: function(scene) {
		var _ = vu.builders.scene._, selz = _.selectors,
			snode = CT.dom.div(null, "right"),
			upscripts = vu.game.step.upscripts;
		zero.core.current.scene = scene;
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
			CT.dom.br(),
			snode,
			"Scripts",
			selz.scripts
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
			pobj.positioners = acto.positioners = acto.positioners || {
				slide: 0, bob: 0, weave: 0
			};
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
		selz.scripts = CT.dom.div();
		selz.steps = CT.dom.div();
		selz.actors = CT.dom.div();
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
			(section == "portals") || selz[section].modal.show("ctmain");
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
					sb.load(scenes[0]);
			} else
				sb.create();
		}, "json_plus");
	}
};