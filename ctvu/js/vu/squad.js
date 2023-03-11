vu.squad = {
	_: {
		current: "room",
		squads: []
	},
	join: function() {
		var _ = vu.squad._;
		CT.modal.prompt({
			prompt: "what's the squad called?",
			cb: function(sname) {
				if (sname == "room") {
					alert("sorry, you can't call your squad 'room' - please try again");
					return vu.squad.join();
				}
				if (_.squads.includes(sname))
					alert("you're already in the " + sname + " squad");
				else {
					_.squads.push(sname);
					CT.pubsub.subscribe(sname);
				}
				_.current = sname;
				alert("you're now speaking to the " + sname + " channel");
			}
		});
	},
	switch: function() {
		var _ = vu.squad._;
		CT.modal.choice({
			prompt: "which channel do you want to talk in?",
			data: ["room"].concat(_.squads),
			cb: function(chan) {
				_.current = chan;
			}
		});
	},
	mod: function(e) {
		var _ = vu.squad._;
		e.stopPropagation();
		if (!_.squads.length)
			return _.joinSquad();
		CT.modal.choice({
			prompt: "you're speaking to the " + (_.current || "room") + " channel",
			data: ["switch channels", "join squad", "quit squad"],
			cb: function(action) {
				if (action == "switch channels")
					vu.squad.switch();
				else if (action == "join squad")
					vu.squad.join();
				else // quit squad
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