vu.controls = {
	initCamera: function(node) {
		zero.core.camera.unfollow();
		var butt = CT.dom.button("far", function() {
			if (butt.innerHTML == "far") {
				butt.innerHTML = "near";
				zero.core.camera.move({ z: 280 });
			} else {
				butt.innerHTML = "far";
				zero.core.camera.move({ z: 120 });
			}
		});
		CT.dom.setContent(node, butt);
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