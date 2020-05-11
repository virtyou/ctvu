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
	step: function(step, nextStep) {
		var zcc = zero.core.current, r = zcc.room;
		if (step.lights) {
			step.lights.forEach(function(val, i) {
				r.lights[i][step.directive || "setIntensity"](val);
			});
		}
		if (step.camera)
			zero.core.camera[step.camera](step.camopts);
		if (step.prop)
			r[step.prop][step.directive](step.direction);
		if (step.state)
			vu.game.util.upstate(state, step.state);
		if (step.actor)
			zcc.people[step.actor][step.action || "say"](step.line, nextStep);
		else
			nextStep();
	},
	script: function(script, cb, state) {
		var step = script.shift();
		if (!step)
			return cb && cb();
		vu.game.util.step(step, function() {
			setTimeout(zero.core.util.script, step.pause || 0,
				script, cb, state);
		});
	}
};