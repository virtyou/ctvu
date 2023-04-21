vu.controls = {
	initCamera: function(node, cb) {
		var activeCam, activate = function(node) {
			if (activeCam)
				activeCam.classList.remove("active");
			activeCam = node;
			activeCam.classList.add("active");
		}, bwip = function(e) {
			activate(e.target);
			zero.core.audio.ux("blipon");
		}, mode = location.pathname.split("/").pop().split(".")[0];
		if (["zone", "play", "scene", "adventure", "pop"].indexOf(mode) != -1) {
			var cycbutt = CT.dom.button("cycle", function(e) {
				bwip(e);
				if (zero.core.camera.cycle())
					cycbutt.innerHTML = "stop cycling";
				else
					cycbutt.innerHTML = "cycle";
				e.stopPropagation();
			}), room, tbutts, per, dim, bl, looker = function(perspective) {
				return function(e) {
					bwip(e);
					zero.core.camera.angle(perspective);
					e.stopPropagation();
				};
			}, bcams, polar = CT.dom.button("polar", looker("polar")),
				pov = CT.dom.button("pov", looker("pov")),
				behind = CT.dom.button("behind", looker("behind")),
				front = CT.dom.button("front", looker("front"));
			activate(polar);
			node.update = function() {
				room = zero.core.current.room;
				tbutts = [cycbutt];
				if (mode == "scene") {
					bcams = [];
					tbutts.pop();
				} else if (mode == "play") {
					tbutts = [polar, behind];
					bcams = [pov, front, cycbutt];
				} else
					bcams = [polar, pov, behind, front];
				(mode == "zone") && tbutts.push(CT.dom.button("refresh", function(e) {
					bwip(e);
					room.updateCameras();
					node.update();
					vu.builders.zone.persist({
						cameras: room.cameras
					});
					e.stopPropagation();
				}));
				CT.dom.setContent(node, [
					CT.dom.div(tbutts, "right up25"),
					CT.dom.div(bcams.concat(room.cameras.map(function(cam, i) {
						return CT.dom.button("cam " + i, function(e) {
							bwip(e);
							room.cut(i);
							e.stopPropagation();
						});
					})), "centered clearnode")
				]);
			};
			["play", "scene"].includes(mode) && node.update();
		} else {
			var butt = CT.dom.button("far", function(e) {
				bwip(e);
				if (!butt._baseY)
					butt._baseY = zero.core.camera.position().y;
				if (butt.innerHTML == "far") {
					butt.innerHTML = "near";
					zero.core.camera.move({ z: 160, y: butt._baseY });
				} else if (butt.innerHTML == "near") {
					butt.innerHTML = "face";
					zero.core.camera.move({ z: 80, y: butt._baseY });
				} else { // face
					butt.innerHTML = "far";
					zero.core.camera.move({ z: 30, y: 20 });
				}
				cb && cb(butt.innerHTML);
				e.stopPropagation();
			});
			CT.dom.setContent(node, butt);
			zero.core.camera.perspective();
		}
	},
	trigNode: function(trig, i, cb) {
		return CT.dom.div(trig, "bordered padded margined inline-block hoverglow", null, {
			onclick: function(e) {
				e.stopPropagation();
				cb(trig, i);
			}
		});
	},
	triggerMap: function(trigz, cb, notArray) {
		return (notArray ? Object.keys(trigz)
			: trigz).map((t, i) => vu.controls.trigNode(t, i, cb));
	},
	help: function(flow) {
		return CT.dom.link("?", () => vu.help.flow(flow),
			null, "right up15 bigger bold hoverglow");
	},
	setTriggers: function(node, cb, person, trigzonly) {
		person = person || zero.core.current.person;
		var responses = person.opts.responses, content = [
			vu.controls.help("triggers and vibes")
		], triggers = person.brain.triggers,
			tkz = Object.keys(triggers),
			trigz = trigzonly ? tkz : CT.data.uniquify(Object.keys(responses).concat(tkz)),
			isgame = location.pathname == "/vu/adventure.html",
			vibez = person.vibe.opts.vibes;
		if (isgame)
			CT.data.remove(trigz, "unintelligible");
		content.push(vu.controls.triggerMap(trigz, function(trig) {
			person.respond(trig);
			vu.controls.setTriggers(node, cb, person, trigzonly);
			cb && cb("trigger", trig, person);
		}));
		if (!isgame) {
			content = content.concat([
				"Vibes",
				vu.controls.triggerMap(vibez, function(vibe) {
					person.vibe.update(vibe);
					cb && cb("vibe", vibe);
				}, true)
			]);
		}
		CT.dom.setContent(node, content);
	},
	setGestures: function(node, cb) {
		var person = zero.core.current.person,
			gestz = person.opts.gestures,
			dances = person.opts.dances,
			modz = person.opts.mods;
		CT.dom.setContent(node, [
			vu.controls.help("gestures dances and mods"),
			vu.controls.triggerMap(["ungesture"].concat(Object.keys(gestz)), function(gest, i) {
				i ? person.gesture(gest) : person.ungesture();
				cb && cb("gesture", gest);
			}),
			"Dances",
			vu.controls.triggerMap(["undance"].concat(Object.keys(dances)), function(dance, i) {
				i ? person.dance(dance) : person.undance();
				cb && cb("dance", dance);
			}),
			"Mods",
			vu.controls.triggerMap(["unmod"].concat(Object.keys(modz)), function(m, i) {
				i ? person.mod(m) : person.unmod();
				cb && cb("mod", m);
			})
		]);
	}
};