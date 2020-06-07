vu.game.util = {
	sports: function(p, cb) {
		var zcc = zero.core.current, rscenes,
			og = zcc.room[p.name].opts.portals.outgoing;
		if (!og)
			return alert("this portal doesn't go anywhere!");
		CT.db.one(og.target, function(door) {
			if (door.kind != "portal")
				return alert("this portal's destination has not been confirmed!");
			CT.db.multi(zcc.scene.game.scenes, function(scenes) {
				rscenes = scenes.filter(s => s.room == door.parent);
				if (!rscenes.length)
					return alert("no scenes in that room :(");
				cb(rscenes);
			});
		}, "json");
	},
	upstate: function(state, ups) {
		var k, v, p, zcc = zero.core.current;
		for (k in ups) {
			v = ups[k];
			if (k == "inventory") // hmmm.....
				state.inventory.bag.push(v);
			else if (k in zcc.people)
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
	step: function(step, nextStep, state, audio, altered) {
		var zcc = zero.core.current, k, r = zcc.room;
		if (step.lights) {
			step.lights.forEach(function(val, i) {
				r.lights[i][step.directive || "setIntensity"](val);
			});
		}
		if (step.text) {
			altered.story = true;
			vu.game.util.text(step.text, step.pause);
			state && state.story.push(step.text);
		}
		if (step.story) {
			altered.story = true;
			state && state.story.push(step.story);
		}
		if (step.camera)
			zero.core.camera.angle(step.camera, step.target);
		if (step.prop)
			r[step.prop][step.directive](step.direction);
		if (state) {
			if (step.state) {
				altered.state = true;
				vu.game.util.upstate(state, step.state);
			}
			if (step.scene) {
				if (step.scene.portal) {
					altered.state = true;
					state.scenes[zcc.scene.name].portals[step.scene.portal].target = step.scene.target;
				} else { // direct
					zcc.injector = null;
					zcc.adventure.scene(step.scene);
				}
			}
		}
		for (k of ["fx", "music", "ambient"])
			if (step[k])
				audio.play(k, step[k]);
		if (step.actor) {
			zcc.people[step.actor][step.action || "say"](step.line, nextStep, true);
			if (step.action == "respond")
				zcc.people[step.actor].click();
		} else
			nextStep && nextStep();
	},
	script: function(script, cb, state, audio, altered) {
		altered = altered || {};
		script = script.slice();
		var step = script.shift();
		if (!step)
			return cb && cb(altered);
		vu.game.util.step(step, function() {
			setTimeout(vu.game.util.script, step.pause || 0,
				script, cb, state, audio, altered);
		}, state, audio, altered);
	}
};