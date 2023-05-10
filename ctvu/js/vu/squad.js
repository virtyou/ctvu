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
	invite2squad: function(iname, noroom) {
		var _ = vu.squad._, squads, inviter = vu.live[iname];
		if (noroom && _.current != "room")
			return inviter(_.current);
		squads = vu.squad.chans(noroom);
		if (squads.length == 1)
			return inviter("global");
		CT.modal.choice({
			prompt: "which squad are you telling?",
			data: squads,
			cb: inviter
		});
	},
	roomvite: function() {
		vu.squad.invite2squad("roomvite", true);
	},
	gamevite: function() {
		vu.squad.invite2squad("gamevite");
	},
	mod: function(e) {
		var _ = vu.squad._, chans = ["switch channels", "join squad", "send room invite"];
		e.stopPropagation();
		if (location.pathname.includes("adventure"))
			chans.push("send game invite");
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
				else if (action == "send game invite")
					vu.squad.gamevite();
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