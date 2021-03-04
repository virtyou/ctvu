vu.controls = {
	initCamera: function(node, cb) {
		var mode = location.pathname.split("/").pop().split(".")[0];
		if (["zone", "play", "scene", "adventure"].indexOf(mode) != -1) {
			var cycbutt = CT.dom.button("cycle", function(e) {
				if (zero.core.camera.cycle())
					cycbutt.innerHTML = "stop cycling";
				else
					cycbutt.innerHTML = "cycle";
				e.stopPropagation();
			}), room, tbutts, per, dim, bl, looker = function(perspective) {
				return function(e) {
					zero.core.camera.angle(perspective);
					e.stopPropagation();
				};
			}, pov = CT.dom.button("pov", looker("pov")), bcams,
				behind = CT.dom.button("behind", looker("behind")),
				front = CT.dom.button("front", looker("front"));
			node.update = function() {
				room = zero.core.current.room;
				tbutts = [cycbutt];
				if (mode == "scene") {
					bcams = [];
					tbutts.pop();
				} else
					bcams = [pov, behind, front];
				(mode == "zone") && tbutts.push(CT.dom.button("refresh", function(e) {
					room.updateCameras();
					node.update();
					vu.builders.zone.persist({
						cameras: room.cameras
					});
					e.stopPropagation();
				}));
				CT.dom.setContent(node, [
					CT.dom.div(tbutts, "right up20"),
					CT.dom.div(bcams.concat(room.cameras.map(function(cam, i) {
						return CT.dom.button("cam " + i, function(e) {
							room.cut(i);
							e.stopPropagation();
						});
					})), "centered clearnode")
				]);
			};
			((mode == "play") || (mode == "scene")) && node.update();
		} else {
			var butt = CT.dom.button("far", function(e) {
				if (butt.innerHTML == "far") {
					butt.innerHTML = "near";
					zero.core.camera.move({ z: 160 });
				} else {
					butt.innerHTML = "far";
					zero.core.camera.move({ z: 80 });
				}
				cb && cb(butt.innerHTML);
				e.stopPropagation();
			});
			CT.dom.setContent(node, butt);
		}
	},
	setTriggers: function(node, cb, person, trigzonly) {
		person = person || zero.core.current.person;
		var responses = person.opts.responses,
			triggers = person.brain.triggers,
			tkz = Object.keys(triggers),
			trigz = trigzonly ? tkz : CT.data.uniquify(Object.keys(responses).concat(tkz)),
			vibez = person.vibe.opts.vibes, content = [],
			isgame = location.pathname == "/vu/adventure.html";
		if (isgame)
			CT.data.remove(trigz, "unintelligible");
		content.push(trigz.map(function(trig) {
			return CT.dom.div(trig, "bordered padded margined inline-block hoverglow", null, {
				onclick: function(e) {
					person.respond(trig);
					vu.controls.setTriggers(node, cb, person, trigzonly);
					e.stopPropagation();
					cb && cb("trigger", trig, person);
				}
			});
		}));
		if (!isgame) {
			content = content.concat([
				"Vibes",
				Object.keys(vibez).map(function(vibe) {
					return CT.dom.div(vibe, "bordered padded margined inline-block hoverglow", null, {
						onclick: function(e) {
							person.vibe.update(vibe);
							e.stopPropagation();
							cb && cb("vibe", vibe);
						}
					});
				})
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
			["ungesture"].concat(Object.keys(gestz)).map(function(gest, i) {
				return CT.dom.div(gest, "bordered padded margined inline-block hoverglow", null, {
					onclick: function(e) {
						i ? person.gesture(gest) : person.ungesture();
						e.stopPropagation();
						cb && cb("gesture", gest);
					}
				});
			}),
			"Dances",
			["undance"].concat(Object.keys(dances)).map(function(dance, i) {
				return CT.dom.div(dance, "bordered padded margined inline-block hoverglow", null, {
					onclick: function(e) {
						i ? person.dance(dance) : person.undance();
						e.stopPropagation();
						cb && cb("dance", dance);
					}
				});
			}),
			"Mods",
			["unmod"].concat(Object.keys(modz)).map(function(m, i) {
				return CT.dom.div(m, "bordered padded margined inline-block hoverglow", null, {
					onclick: function(e) {
						i ? person.mod(m) : person.unmod();
						e.stopPropagation();
						cb && cb("mod", m);
					}
				});
			})
		]);
	}
};