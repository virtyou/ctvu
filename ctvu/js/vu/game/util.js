vu.game.util = {
	upstate: function(state, ups) {
		var k, v, p, zcc = zero.core.current;
		for (k in ups) {
			v = ups[k];
			if (k == "inventory")
				state.inventory.push(v);
			else if (k in zcc.people)
				for (p in v)
					state.actors[k][p] = v;
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
	step: function(step, nextStep, state, audio) {
		var zcc = zero.core.current, k, r = zcc.room;
		if (step.lights) {
			step.lights.forEach(function(val, i) {
				r.lights[i][step.directive || "setIntensity"](val);
			});
		}
		if (step.text)
			vu.game.util.text(step.text, step.pause);
		if (step.camera)
			zero.core.camera.angle(step.camera);
		if (step.prop)
			r[step.prop][step.directive](step.direction);
		if (step.state)
			vu.game.util.upstate(state, step.state);
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
	script: function(script, cb, state, audio) {
		script = script.slice();
		var step = script.shift();
		if (!step)
			return cb && cb();
		vu.game.util.step(step, function() {
			setTimeout(vu.game.util.script, step.pause || 0,
				script, cb, state, audio);
		}, state, audio);
	}
};