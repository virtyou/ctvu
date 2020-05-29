vu.game.util = {
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
			zero.core.camera.angle(step.camera);
		if (step.prop)
			r[step.prop][step.directive](step.direction);
		if (state && step.state) {
			altered.state = true;
			vu.game.util.upstate(state, step.state);
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