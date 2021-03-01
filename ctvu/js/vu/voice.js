vu.voice = {
	_: {
		convo: false,
		listening: false,
		mode: "walk", // walk|look|dance
		cams: ["pov", "behind", "cycle"],
		personal: ["say", "approach", "dance", "gesture", "mod", "vibe"],
	},
	commands: {
		mode: function(mode) {
			CT.log("mode: " + mode);
			vu.voice._.mode = mode;
			// TODO ....
		},
		cam: function(cmode) {
			if (!vu.voice._.cams.includes(cmode))
				return CT.log("not a camera angle: " + cmode);
			zero.core.camera.angle(cmode);
		}
	},
	parse: function(phrase) {
		var _ = vu.voice._, comz = vu.voice.commands,
			words = phrase.split(" "), action = words.shift(),
			rest = words.join(" "), p = zero.core.current.person;
		if (_.convo) {
			if (phrase == "end conversation")
				_.convo = false;
			else
				p.say(phrase);
		} else if (phrase == "start conversation")
			_.convo = true;
		else if (_.personal.includes(action))
			p[action](rest);
		else if (action in comz)
			comz[action](rest);
		else
			CT.log("no match: " + phrase);
		if (_.listening)
			zero.core.rec.listen(vu.voice.parse);
	},
	unlisten: function() {
		vu.voice._.listening = false;
	},
	listen: function() {
		vu.voice._.listening = true;
		zero.core.rec.listen(vu.voice.parse);
	}
};