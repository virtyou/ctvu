vu.squad = {
	_: {
		current: "room",
		squads: CT.storage.get("squads") || []
	},
	join: function(sname) {
		var _ = vu.squad._;
		if (sname == "room") {
			alert("sorry, you can't call your squad 'room' - please try again");
			return vu.squad.joiner();
		}
		if (_.squads.includes(sname))
			alert("you're already in the " + sname + " squad");
		else {
			_.squads.push(sname);
			CT.storage.set("squads", _.squads);
			CT.pubsub.subscribe(sname);
		}
		_.current = sname;
		alert("you're now speaking to the " + sname + " channel");
	},
	joiner: function() {
		CT.modal.prompt({
			prompt: "what's the squad called?",
			cb: vu.squad.join
		});
	},
	quit: function() {
		var _ = vu.squad._;
		CT.modal.choice({
			prompt: "which squad do you want to quit?",
			data: _.squads,
			cb: function(chan) {
				if (chan == _.current)
					_.current = "room";
				CT.data.remove(_.squads, chan);
				CT.storage.set("squads", _.squads);
				CT.pubsub.unsubscribe(chan);
			}
		});
	},
	chans: function(noroom) {
		var _ = vu.squad._, basechans = ["global"];
		noroom || basechans.unshift("room");
		user.core.get("admin") && basechans.push("admin");
		return basechans.concat(_.squads);
	},
	switch: function() {
		var _ = vu.squad._;
		CT.modal.choice({
			prompt: "which channel do you want to talk in?",
			data: vu.squad.chans(),
			cb: function(chan) {
				_.current = chan;
			}
		});
	},
	invite: function() {
		var _ = vu.squad._;
		CT.modal.choice({
			prompt: "which squad are you sharing?",
			data: _.squads,
			cb: vu.live.invite
		});
	},
	roomvite: function() {
		var _ = vu.squad._, squads;
		if (_.current != "room")
			return vu.live.roomvite(_.current);
		squads = vu.squad.chans(true);
		if (squads.length == 1)
			return vu.live.roomvite("global");
		CT.modal.choice({
			prompt: "which squad are you telling?",
			data: squads,
			cb: vu.live.roomvite
		});
	},
	mod: function(e) {
		var _ = vu.squad._, chans = ["switch channels", "join squad", "send room invite"];
		e.stopPropagation();
		if (_.squads.length)
			chans = chans.concat(["send squad invite", "quit squad"]);
		CT.modal.choice({
			prompt: "you're speaking to the " + _.current + " channel",
			data: chans,
			cb: function(action) {
				if (action == "switch channels")
					vu.squad.switch();
				else if (action == "join squad")
					vu.squad.joiner();
				else if (action == "send room invite")
					vu.squad.roomvite();
				else if (action == "send squad invite")
					vu.squad.invite();
				else if (action == "quit squad")
					vu.squad.quit();
			}
		});
	},
	butt: function() {
		return CT.dom.button("squad", vu.squad.mod)
	},
	emit: function(val) {
		var _ = vu.squad._;
		if (_.current == "room")
			vu.live.emit("chat", val);
		else
			vu.live.squadchat(_.current, val);
	}
};