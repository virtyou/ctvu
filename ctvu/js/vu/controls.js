vu.controls = {
	_: {
		cams: {},
		freeCams: ["zone", "play", "scene", "adventure", "pop"],
		cammers: {
			looker: function(perspective) {
				var zc = zero.core;
				if (perspective.startsWith("cam "))
					zc.current.room.cut(parseInt(perspective.slice(4)));
				else
					zc.camera.angle(perspective);
			},
			cycle: function() {
				var _ = vu.controls._, cbutt = _.cams["cycle"];
				if (zero.core.camera.cycle())
					cbutt.innerHTML = "stop cycling";
				else
					cbutt.innerHTML = "cycle";
			},
			refresh: function() {
				var _ = vu.controls._, room = zero.core.current.room;
				room.updateCameras();
				_.camNode.update();
				vu.builders.zone.persist({
					cameras: room.cameras
				});
			}
		},
		camButt: function(name) {
			var vc = vu.controls, _ = vc._;
			_.cams[name] = CT.dom.button(name, function(e) {
				vc.setCam(name);
				e.stopPropagation();
			});
			return _.cams[name];
		},
		camButtActivate: function(name) {
			var _ = vu.controls._;
			if (_.activeCam)
				_.activeCam.classList.remove("active");
			_.activeCam = _.cams[name];
			_.activeCam.classList.add("active");
		},
		bwip: function() {
			zero.core.audio.ux("blipon");
		}
	},
	setCam: function(name, skipcb) {
		var _ = vu.controls._, cz = _.cammers;
		skipcb || (cz[name] || cz.looker)(name);
		_.camButtActivate(name);
		_.bwip();
	},
	initCamera: function(node, cb) {
		var vc = vu.controls, _ = vc._,
			mode = location.pathname.split("/").pop().split(".")[0];
		_.camNode = node;
		if (_.freeCams.includes(mode)) {
			var cycbutt = _.camButt("cycle"),
				polar = _.camButt("polar"),
				pov = _.camButt("pov"),
				behind = _.camButt("behind"),
				front = _.camButt("front"),
				room, rcz, tbutts, bcams;
			vc.setCam("polar", true); // zone page not ready / will handle
			node.update = function() {
				room = zero.core.current.room;
				rcz = room.cameras;
				tbutts = [cycbutt];
				if (mode == "scene") {
					bcams = [];
					tbutts.pop();
				} else if (mode == "play") {
					tbutts = [polar, behind];
					bcams = [pov, front, cycbutt];
				} else
					bcams = [polar, pov, behind, front];
				(mode == "zone") && tbutts.push(_.camButt("refresh"));
				CT.dom.setContent(node, [
					vu.controls.help("cameras"),
					CT.dom.div(tbutts, "right up25"),
					CT.dom.div(bcams.concat(rcz.map((cam, i) => _.camButt("cam " + i))),
						"centered clearnode")
				]);
			};
			["play", "scene"].includes(mode) && node.update();
		} else {
			var butt = CT.dom.button("far", function(e) {
				_.bwip();
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
		return CT.dom.link("?", function(e) {
			zero.core.audio.ux("blipon");
			vu.help.flow(flow);
			e.stopPropagation();
		}, null, "right up15 bigger bold hoverglow");
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