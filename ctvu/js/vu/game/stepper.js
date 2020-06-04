vu.game.stepper = {
	_: {},
	setAudio: function(aud) {
		vu.game.stepper._.audio = aud;
	},
	pause: function(cb) {
		CT.modal.prompt({
			prompt: "0.25 to five seconds",
			style: "number",
			cb: function(val) {
				cb({ pause: val * 1000 });
			}
		});
	},
	action: function(cb) {
		var zcc = zero.core.current;
		CT.modal.choice({
			prompt: "please select an actor",
			data: zcc.scene.actors,
			cb: function(actor) {
				CT.modal.choice({
					prompt: "please select an action",
					data: ["say", "respond", "move", "approach"],
					cb: function(action) {
						var act = function(line) {
							cb({
								actor: actor.name,
								action: action,
								line: line
							});
						};
						if (action == "move") {
							CT.modal.choice({
								prompt: "please adjust " + actor.name + "'s position and orientation, and click 'ready' to save. click 'cancel' to abort.",
								data: ["ready", "cancel"],
								cb: function(resp) {
									var pbs = zcc.people[actor.name].body.springs;
									(resp == "ready") && act({
										weave: pbs.weave.target,
										slide: pbs.slide.target,
										orientation: pbs.orientation.target
									});
								}
							});
						} else if (action == "approach") {
							CT.modal.choice({
								data: ["player", "actor", "furnishing"],
								cb: function(cat) {
									if (cat == "player")
										return act("player");
									var data;
									if (cat == "actor") {
										data = zcc.scene.actors.filter(function(a) {
											return a.name != actor.name;
										});
									} else // furnishing
										data = Object.values(zcc.room.objects);
									CT.modal.choice({
										prompt: "please select a target",
										data: data,
										cb: function(target) {
											act(target.name);
										}
									});
								}
							});
						} else {
							CT.modal.prompt({
								prompt: "what's the line?",
								cb: act
							})
						}
					}
				})
			}
		});
	},
	camera: function(cb) {
		var zcc = zero.core.current;
		CT.modal.choice({
			prompt: "please select an angle",
			data: ["front", "behind", "pov", "cycle",
				"0", "1", "2", "3", "4", "5", "6", "7", "8"],
			cb: function(angle) {
				if (!["front", "behind", "pov"].includes(angle))
					return cb({ camera: angle });
				CT.modal.choice({
					prompt: "please select a target",
					data: ["player"].concat(zcc.scene.actors.map(a => a.name)),
					cb: function(target) {
						cb({ camera: angle, target: target });
					}
				});
			}
		});
	},
	lights: function(cb) {
		var zcc = zero.core.current;
		CT.modal.choice({
			prompt: "please adjust the lighting, and click 'ready' to save. click 'cancel' to abort.",
			data: ["ready", "cancel"],
			cb: function(resp) {
				(resp == "ready") && cb({
					lights: zcc.room.lights.map(function(light) {
						return light.opts.intensity;
					})
				});
			}
		});
	},
	text: function(cb) {
		CT.modal.prompt({
			prompt: "what should it say?",
			isTA: true,
			cb: function(msg) {
				cb({ text: msg });
			}
		});
	},
	story: function(cb) {
		CT.modal.prompt({
			prompt: "what's the story?",
			isTA: true,
			cb: function(msg) {
				cb({ story: msg });
			}
		});
	},
	state: function(cb) {
		var zcc = zero.core.current, _ = vu.game.stepper._,
			sgia = zcc.scene.game.initial.actors;
		CT.modal.choice({
			prompt: "please select an actor",
			data: zcc.scene.actors.map(a => a.name),
			cb: function(actor) {
				CT.modal.choice({
					prompt: "what's changing?",
					data: [
						"new property with initial state",
						"new property without initial state"
					].concat(Object.keys(sgia[actor]).filter(p => p != "positioners")),
					cb: function(prop) {
						var getval = function(prop) {
							CT.modal.prompt({
								prompt: "what's the new value?",
								cb: function(val) {
									var sobj = {};
									sobj[actor] = {};
									sobj[actor][prop] = val;
									cb({ state: sobj });
								}
							});
						};
						if (prop.startsWith("new property")) {
							CT.modal.prompt({
								prompt: "ok, what's the new property?",
								cb: function(prop) {
									if (prop.includes("without"))
										return getval(prop);
									CT.modal.prompt({
										prompt: "what's the initial value (value _prior to_ current step!)?",
										cb: function(ival) {
											sgia[actor][prop] = ival;
											vu.game.step.upstate();
											getval(prop);
										}
									});
								}
							});
						} else
							getval(prop);
					}
				});
			}
		});
	},
	audio: function(stype, cb) { // fx, music, ambient
		var zcc = zero.core.current, _ = vu.game.stepper._;
		vu.media.swapper.audio(function(aud) {
			if (!(aud.name in _.audio[stype])) {
				var uobj = {
					key: zcc.scene.key
				};
				_.audio.add(aud);
				zcc.scene[stype].push(aud);
				uobj[stype] = zcc.scene[stype].map(s => s.key);
				vu.storage.edit(uobj);
			}
			var aobj = {};
			aobj[stype] = aud.name;
			cb(aobj);
		}, stype, true);
	},
	step: function(stype, cb) {
		if (vu.game.stepper[stype])
			vu.game.stepper[stype](cb);
		else
			vu.game.stepper.audio(stype, cb);
	}
};