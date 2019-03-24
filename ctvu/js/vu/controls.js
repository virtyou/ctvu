vu.controls = {
	initCamera: function(node, cb) {
		var mode = location.pathname.split("/").pop().split(".")[0];
		if (["zone", "play"].indexOf(mode) != -1) {
			var cycbutt = CT.dom.button("cycle", function() {
				if (cycbutt._cycler) {
					clearInterval(cycbutt._cycler);
					delete cycbutt._cycler;
					cycbutt.innerHTML = "cycle";
				} else {
					cycbutt._cycler = setInterval(zero.core.current.room.cut, 3000);
					cycbutt.innerHTML = "stop cycling";
				}
			}), pov = CT.dom.button("pov", function() {
				zero.core.camera.setSprings(200);
				zero.core.camera.perspective(zero.core.current.person);
			}), room, tbutts;
			node.update = function() {
				room = zero.core.current.room;
				tbutts = [cycbutt];
				(mode == "zone") && tbutts.push(CT.dom.button("refresh", function() {
					room.updateCameras();
					node.update();
					vu.builders.zone.persist({
						cameras: room.cameras
					});
				}));
				CT.dom.setContent(node, [
					CT.dom.div(tbutts, "right up20"),
					CT.dom.div([pov].concat(room.cameras.map(function(cam, i) {
						return CT.dom.button("cam " + i, function() {
							zero.core.camera.setSprings(20);
							zero.core.camera.perspective();
							room.cut(i);
						});
					})), "centered clearnode")
				]);
			};
			(mode == "play") && node.update();
		} else {
			zero.core.camera.unfollow();
			var butt = CT.dom.button("far", function() {
				if (butt.innerHTML == "far") {
					butt.innerHTML = "near";
					zero.core.camera.move({ z: 280 });
				} else {
					butt.innerHTML = "far";
					zero.core.camera.move({ z: 120 });
				}
				cb && cb(butt.innerHTML);
			});
			CT.dom.setContent(node, butt);
		}
	},
	setTriggers: function(node) {
		var person = zero.core.current.person,
			responses = person.opts.responses,
			triggers = person.brain.triggers,
			trigz = CT.data.uniquify(Object.keys(responses).concat(Object.keys(triggers))),
			vibez = person.vibe.opts.vibes;
		CT.dom.setContent(node, [
			trigz.map(function(trig) {
				return CT.dom.div(trig, "bordered padded margined inline-block hoverglow", null, {
					onclick: function() {
						person.respond(trig);
						vu.controls.setTriggers(node);
					}
				});
			}),
			"Vibes",
			Object.keys(vibez).map(function(vibe) {
				return CT.dom.div(vibe, "bordered padded margined inline-block hoverglow", null, {
					onclick: function() {
						person.vibe.update(vibe);
					}
				});
			})
		]);
	},
	setGestures: function(node) {
		var person = zero.core.current.person,
			gestz = person.opts.gestures,
			dances = person.opts.dances;
		CT.dom.setContent(node, [
			["ungesture"].concat(Object.keys(gestz)).map(function(gest, i) {
				return CT.dom.div(gest, "bordered padded margined inline-block hoverglow", null, {
					onclick: function() {
						i ? person.gesture(gest) : person.ungesture();
					}
				});
			}),
			"Dances",
			["undance"].concat(Object.keys(dances)).map(function(dance, i) {
				return CT.dom.div(dance, "bordered padded margined inline-block hoverglow", null, {
					onclick: function() {
						i ? person.dance(dance) : person.undance();
					}
				});
			})
		]);
	}
};