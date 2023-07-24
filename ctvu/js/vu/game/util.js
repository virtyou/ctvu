vu.game.util = {
	scene: function(game, cb) {
		CT.modal.choice({
			prompt: "please select a room",
			data: vu.storage.get("rooms"),
			cb: function(room) {
				vu.core.create("scene", function(s) {
					game.scenes.push(s.key);
					vu.storage.edit({
						key: game.key,
						scenes: game.scenes
					});
					cb(s);
				}, {
					room: room.key
				});
			}
		});
	},
	positioners: function(aname, sname, fallback) {
		var state = vu.game.util.state(),
			az = state.actors = state.actors || {},
			acfg = az[aname] = az[aname] || {},
			possers = acfg.positioners = acfg.positioners || {};
		if ("slide" in possers) {
			possers = acfg.positioners = {
				default: possers
			};
		} // slide/fallback/default stuff for backwards compatibility
		if (!possers[sname])
			possers[sname] = fallback ? CT.merge(possers.default) : {};
		return possers[sname];
	},
	sports: function(p, cb) {
		var zcc = zero.core.current, rscenes,
			og = zcc.room[p.name].opts.portals.outgoing;
		if (!og)
			return alert("this portal doesn't go anywhere!");
		CT.db.one(og.target, function(door) {
			if (door.kind != "portal")
				return alert("this portal's destination has not been confirmed!");
			CT.db.multi(zcc.scene.game.scenes, function(scenes) {
				rscenes = scenes.filter(s => s.room.key == door.parent);
				if (!rscenes.length)
					return alert("no scenes in that room :(");
				cb(rscenes);
			});
		}, "json");
	},
	state: function(ofScene, sub, subsub) {
		var zcc = zero.core.current,
			i = (zcc.adventure || zcc.scene).game.initial;
		if (!ofScene) return i;
		if (!i.scenes) i.scenes = {};
		if (!i.scenes[ofScene]) i.scenes[ofScene] = {};
		if (!sub) return i.scenes[ofScene];
		if (!i.scenes[ofScene][sub]) i.scenes[ofScene][sub] = {};
		if (!subsub) return i.scenes[ofScene][sub];
		if (!i.scenes[ofScene][sub][subsub]) i.scenes[ofScene][sub][subsub] = {};
		return i.scenes[ofScene][sub][subsub];
	},
	upstate: function(state, ups) {
		var k, v, p, zcc = zero.core.current;
		for (k in ups) {
			v = ups[k];
			if (k == "inventory") { // hmmm.....
				state.inventory.bag[v.area][v.side] = v.value;
//				state.inventory.bag.push(v);
			} else if (k in zcc.people)
				for (p in v)
					state.actors[k][p] = v[p];
			else
				state[k] = v;
		}
	},
	text: function(msg, pause) {
		var mod = CT.modal.modal(msg, null, {
			noClose: true,
			transition: "fade",
			className: "basicpopup screentext"
		});
		setTimeout(mod.hide, pause || 3000);
	},
	logic: function(logic, state, audio, altered) { // TODO: multi-cond gates?
		var zcc = zero.core.current, vgu = vu.game.util, go = function(doit) {
			if (doit)
				logic.yes && vgu.doscript(logic.yes, state, audio, altered);
			else
				logic.no && vgu.doscript(logic.no, state, audio, altered);
		}, g = logic.gate, b = zcc.person.body;
		if (g.coinflip)
			go(CT.data.random());
		else if (g.gear)
			go(vu.storage.get("items")[g.gear].key in b.gearmap);
		else if (g.story)
			go(state.story.includes(g.story));
		else {
			var actor = Object.keys(g)[0],
				prop = Object.keys(g[actor])[0];
			go(state.actors[actor][prop] == g[actor][prop]);
		}
	},
	step: function(step, nextStep, state, audio, altered) {
		var zcc = zero.core.current, k, r = zcc.room,
			cam = zero.core.camera, vgu = vu.game.util;
		if (step.lights) {
			step.lights.forEach(function(val, i) {
				r.lights[i][step.directive || "setIntensity"](val);
			});
		}
		if (step.text) {
			altered.story = true;
			vgu.text(step.text, step.pause);
			state && state.story.push(step.text);
		}
		if (step.story) {
			altered.story = true;
			state && state.story.push(step.story);
		}
		if (step.camera)
			cam.angle(step.camera, step.target);
		if (step.prop)
			r[step.prop][step.directive](step.direction);
		for (k of ["fx", "music", "ambient"])
			if (step[k])
				audio.play(k, step[k]);
		if (state) {
			if (step.state) {
				altered.state = true;
				vgu.upstate(state, step.state);
			}
			if (step.logic)
				vgu.logic(step.logic, state, audio, altered);
			if (step.scene) {
				if (step.scene.portal) {
					altered.state = true;
					state.scenes[zcc.scene.name].portals[step.scene.portal].target = step.scene.target;
				} else { // direct
					cam.perspective();
					zcc.person.watch(false, true);
					setTimeout(function() {
						zcc.injector = null;
						zcc.room.eject(zcc.person);
						setTimeout(function() {
							vu.portal.depart();
							zcc.adventure.scene(step.scene);
						}, 500);
					}, 500);
				}
			}
		}
		if (step.script)
			vgu.doscript(step.script, state, audio, altered);
		if (step.actor) {
			zcc.people[step.actor][step.action || "say"](step.line, nextStep, true);
			if (step.action == "respond")
				zcc.people[step.actor].click();
		} else
			nextStep && nextStep();
	},
	doscript: function(name, state, audio, altered) {
		var zcc = zero.core.current;
		if (zcc.scene && zcc.scene.script)
			return zcc.scene.script(name); // for state, audio, main "thread"
		vu.game.util.script(zcc.scene.scripts[name], null, state, audio, altered);
	},
	script: function(script, cb, state, audio, altered) {
		altered = altered || {};
		script = script.slice();
		var step = script.shift();
		if (!step)
			return cb && cb(altered);
		var curroom = zero.core.current.room;
		vu.game.util.step(step, function() {
			if (curroom != zero.core.current.room)
				return CT.log("room/scene changed! ABORTING SCRIPT!!!");
			setTimeout(vu.game.util.script, step.pause || 0,
				script, cb, state, audio, altered);
		}, state, audio, altered);
	}
};