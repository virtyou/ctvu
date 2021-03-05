vu.voice = {
	_: {
		convo: false,
		listening: false,
		mode: "walk", // walk|look|dance
		cams: ["pov", "behind", "front", "cycle"],
		personal: ["say", "approach", "dance", "gesture", "mod", "vibe"],
		resume: function() {
			var _ = vu.voice._;
			_.listening && zero.core.rec.listen(vu.voice.parse, _.resume);
		},
		action: function(action, target) {
			var zcc = zero.core.current, p = zcc.person, checker;
			if (action == "vibe")
				checker = p.opts.vibe;
			else if (action == "approach")
				checker = zcc.people;
			else if (action != "say")
				checker = p.opts[action + "s"];
			if (checker && !(target in checker))
				p.say("i can't " + action + " " + target);
			else if (action == "vibe")
				p.vibe.update(target);
			else
				p[action](target);
		}
	},
	commands: {
		mode: function(mode) {
			CT.log("mode: " + mode);
			vu.voice._.mode = mode;
			// TODO: accelerometer modes!!!!
		},
		camera: function(cmode) {
			if (!vu.voice._.cams.includes(cmode))
				return CT.log("not a camera angle: " + cmode);
			zero.core.camera.angle(cmode);
		}
	},
	parse: function(phrase) {
		phrase = phrase.toLowerCase();
		var _ = vu.voice._, comz = vu.voice.commands,
			words = phrase.split(" "), action = words.shift(),
			rest = words.join(" "), p = zero.core.current.person;
		CT.log(phrase);
		if (_.convo) {
			if (phrase == "end conversation")
				_.convo = false;
			else
				p.say(phrase);
		} else if (phrase == "start conversation")
			_.convo = true;
		else if (_.personal.includes(action))
			_.action(action, rest);
		else if (action in comz)
			comz[action](rest);
		else
			CT.log("no match: " + phrase);
		_.resume();
	},
	unlisten: function() {
		vu.voice._.listening = false;
	},
	listen: function() {
		var _ = vu.voice._;
		_.listening = true;
		_.resume();
	}
};