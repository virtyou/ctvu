vu.game.step = {
	_: {
		varieties: ["lights", "camera", "action", "state",
			"story", "text", "pause", "fx", "music", "ambient"]
	},
	setAudio: function(aud) {
		vu.game.step._.audio = aud;
		vu.game.stepper.setAudio(aud);
	},
	setSels: function(sels) {
		vu.game.step._.selectors = sels;
	},
	upscripts: function() {
		var scene = zero.core.current.scene;
		vu.storage.edit({
			key: scene.key,
			scripts: scene.scripts
		});
	},
	upstate: function() {
		var g = zero.core.current.scene.game;
		vu.storage.edit({
			key: g.key,
			initial: g.initial
		});
	},
	step: function(cb, cur) {
		CT.modal.choice({
			prompt: "please select a variety",
			data: vu.game.step._.varieties.filter(function(st) {
				// +props,state
				return !cur || !(st in cur);
			}),
			cb: function(stype) {
				vu.game.stepper.step(stype, cb);
			}
		});
	},
	shifter: function(stpr, dir) {
		var zcc = zero.core.current,
			arr = zcc.scene.scripts[zcc.script],
			i = CT.dom.childNum(stpr),
			el = arr.splice(i, 1)[0];
		if (dir == "up") {
			arr.splice(i - 1, 0, el);
			stpr.parentNode.insertBefore(stpr, stpr.previousSibling);
		} else {
			arr.splice(i + 1, 0, el);
			if (stpr.nextSibling.nextSibling)
				stpr.parentNode.insertBefore(stpr, stpr.nextSibling.nextSibling);
			else
				stpr.parentNode.appendChild(stpr);
		}
		vu.game.step.upscripts();
	},
	stepper: function(s) {
		var vgs = vu.game.step, _ = vgs._, zcc = zero.core.current, k;
		var stpr = CT.dom.div([
			CT.dom.button("edit", function() {
				CT.modal.choice({
					prompt: "how would you like to modify this step?",
					data: ["add something", "remove entirely", "shift"],
					cb: function(etype) {
						if (etype == "remove entirely") {
							CT.data.remove(zcc.scene.scripts[zcc.script], s);
							vgs.upscripts();
							stpr.remove();
						} else if (etype == "add something") {
							vgs.step(function(upz) {
								for (k in upz)
									s[k] = upz[k];
								CT.dom.replace(stpr, vgs.stepper(s));
								vgs.upscripts();
							}, s);
						} else { // shift
							if (stpr.nextSibling && stpr.previousSibling) {
								CT.modal.choice({
									prompt: "which direction?",
									data: ["up", "down"],
									cb: function(dir) {
										vgs.shifter(stpr, dir);
									}
								});
							} else if (stpr.nextSibling)
								vgs.shifter(stpr, "down");
							else if (stpr.previousSibling)
								vgs.shifter(stpr, "up");
							else
								alert("nowhere to shift! first, add another step!");
						}
					}
				});
			}, "right"),
			JSON.stringify(s).replace(/,/g, ",&#8203;")
		], "bordered padded margined round", null, {
			onclick: function() {
				vu.game.util.step(s, null, null, _.audio, {});
			}
		});
		return stpr;
	},
	steps: function() {
		var vgs = vu.game.step, _ = vgs._, selz = _.selectors,
			scene = zero.core.current.scene;
		selz.steps.refresh = function(sname) {
			zero.core.current.script = sname;
			var stez = CT.dom.div(scene.scripts[sname].map(vgs.stepper),
				"nonowrap");
			CT.dom.setContent(selz.steps, [
				CT.dom.div([
					CT.dom.button("add step", function() {
						vgs.step(function(step) {
							CT.dom.addContent(stez, vgs.stepper(step));
							scene.scripts[sname].push(step);
							vgs.upscripts();
						});
					}),
					CT.dom.button("play all", function() {
						vu.game.util.script(scene.scripts[sname],
							null, null, _.audio);
					})
				], "abs ctr shiftup"),
				stez
			]);
		};
	},
};