vu.game.stepper = {
	_: {
		swap: function(cb) {
			var zcc = zero.core.current, c = zcc.scene,
				scenes = Object.keys(c.game.initial.scenes);
			CT.modal.choice({
				prompt: "please select a scene",
				data: scenes.filter(s => s != c.name),
				cb: function(scene) {
					cb({ scene: scene });
				}
			});
		},
		port: function(cb) {
			var zcc = zero.core.current, s = zcc.scene, sobj = {},
				portals = s.game.initial.scenes[s.name].portals;
			CT.modal.choice({
				prompt: "please select a portal",
				data: Object.values(portals),
				cb: cb
			});
		},
		link: function(cb) {
			vu.game.stepper._.port(function(portal) {
				var sobj = { portal: portal.name };
				vu.game.util.sports(portal, function(rscenes) {
					CT.modal.choice({
						prompt: "please select a scene",
						data: ["none (locked)"].concat(rscenes),
						cb: function(target) {
							if (target != "none (locked)")
								sobj.target = target.name;
							cb({ scene: sobj });
						}
					});
				});
			});
		},
		actor: function(cb) {
			CT.modal.choice({
				prompt: "please select an actor",
				data: zero.core.current.scene.actors,
				cb: cb
			});
		},
		state: function(cb, ptxt, vtxt) {
			var zcc = zero.core.current, actor,
				sgia = zcc.scene.game.initial.actors;
			vu.game.stepper._.actor(function(person) {
				actor = person.name;
				CT.modal.choice({
					prompt: ptxt || "what's changing?",
					data: [
						"new property with initial state",
						"new property without initial state"
					].concat(Object.keys(sgia[actor]).filter(p => p != "positioners")),
					cb: function(prop) {
						var getval = function(prop) {
							CT.modal.prompt({
								prompt: vtxt || "what's the new value?",
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
			});
		}
	},
	scene: function(cb) {
		var zcc = zero.core.current,
			s = zcc.scene, opts = ["swap scenes"];
		if (Object.keys(s.game.initial.scenes[s.name].portals).length)
			opts.push("link portal to scene");
		var dosel = function(sel) {
			vu.game.stepper._[sel.slice(0, 4)](cb);
		};
		if (opts.length == 1)
			return dosel(opts[0]);
		CT.modal.choice({
			prompt: "switch scenes or update portal->scene linkage?",
			data: opts,
			cb: dosel
		});
	},
	script: function(cb) {
		CT.modal.choice({
			prompt: "trigger which script?",
			data: Object.keys(zero.core.current.scene.scripts),
			cb: name => cb({ script: name })
		});
	},
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
		vu.game.stepper._.actor(function(actor) {
			CT.modal.choice({
				prompt: "please select an action",
				data: ["say", "respond", "move", "approach", "chase", "sit", "lie", "leave"],
				cb: function(action) {
					var act = function(line) {
						cb({
							actor: actor.name,
							action: action,
							line: line
						});
					}, tar = function(data) {
						CT.modal.choice({
							prompt: "please select a target",
							data: data,
							cb: target => act(target.name)
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
					} else if (action == "approach" || action == "chase") {
						var aopts = ["player", "actor"];
						if (action == "approach")
							aopts.push("furnishing");
						CT.modal.choice({
							data: aopts,
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
								tar(data);
							}
						});
					} else if (action == "sit" || action == "lie")
						tar(Object.values(zcc.room.objects));
					else if (action == "leave")
						vu.game.stepper._.port(port => act(port.name));
					else {
						CT.modal.prompt({
							prompt: "what's the line?",
							cb: act
						})
					}
				}
			});
		});
	},
	camera: function(cb) {
		var zcc = zero.core.current;
		CT.modal.choice({
			prompt: "please select an angle",
			data: ["front", "behind", "pov", "polar", "cycle",
				"0", "1", "2", "3", "4", "5", "6", "7", "8"],
			cb: function(angle) {
				if (!["front", "behind", "pov", "polar"].includes(angle))
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
	logic: function(cb) {
		var _ = vu.game.stepper._, logic = {}, yesno = function() {
			CT.modal.prompt({
				prompt: "what script should we call if the condition is met?",
				cb: function(yesname) {
					if (yesname)
						logic.yes = yesname;
					CT.modal.prompt({
						prompt: "what script should we call otherwise?",
						cb: function(noname) {
							if (noname)
								logic.no = noname;
							cb({ logic: logic });
						}
					});
				}
			});
		}, result = function(condition) {
			logic.gate = condition;
			yesno();
		};
		CT.modal.choice({
			prompt: "what kind of logic gate?",
			data: ["actor", "gear", "story", "coin flip"],
			cb: function(kind) {
				if (kind == "actor") {
					_.state(sobj => result(sobj.state),
						"what property should we check?",
						"what value are we looking for?");
				} else if (kind == "gear") {
					CT.modal.choice({
						prompt: "which item should we check for?",
						data: Object.keys(vu.storage.get("items")),
						cb: item => result({ gear: item })
					});
				} else if (kind == "story") {
					CT.modal.prompt({
						prompt: "what's the story line?",
						cb: line => result({ story: line })
					});
				} else // coin flip
					result({ coinflip: true });
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
		vu.game.stepper._.state(cb);
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