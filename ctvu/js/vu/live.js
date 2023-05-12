vu.live = {
	_: {
		people: {},
		pending: {},
		springs: ["weave", "slide", "orientation"],
		bsprops: ["target", "value", "boost", "floored", "hard"], // overkill?
		actions: { // message types
			chat: function(person, msg) {
				vu.multi.chat(person, msg);
			},
			squadchat: function(person, chdata) {
				vu.multi.chat(person, chdata.msg, chdata.squad);
			},
			botchat: function(person, chdata) {
				vu.multi.chat(zero.core.current.people[chdata.bot], chdata.msg);
			},
			invite: function(person, squad) {
				vu.multi.chat(person, "join my squad!", null, squad);
			},
			roomvite: function(person, rinvopts) {
				vu.multi.chat(person, rinvopts.msg, rinvopts.squad, null, rinvopts.room);
			},
			gamevite: function(person, ginvopts) {
				vu.multi.chat(person, ginvopts.msg, ginvopts.squad, null, null, ginvopts.game);
			},
			inject: function(person, pkey) { // join
				zero.core.current.room.inject(person, pkey && zero.core.Thing.get(pkey));
//				person.body.show();
			},
			eject: function(person, pkey) { // leave
				zero.core.current.room.eject(person, pkey && zero.core.Thing.get(pkey));
			},
			trigger: function(person, tname) {
				person.respond(tname);
			},
			environment: function(person, data) { // extend/genericize.....
				var zcc = zero.core.current;
				if (person == zcc.person) return;
				var flo = zcc.room[data.name], fos = flo.opts.shift;
				fos.speed = data.speed;
				flo.placer.position[fos.axis] = data.position;
				flo.bounds.min[fos.axis] = data.min;
				flo.bounds.max[fos.axis] = data.max;
			},
			dunk: function(person, pkey) {
				vu.core.ischar(pkey) && vu.portal.port();
			}
		},
		events: {
			subscribe: function(data) {
				var _ = vu.live._, spawn = _.spawn, roomchan = _.isroom(data.channel);
				if (!roomchan)
					return CT.log("skipping subscribe routine for non-room channel");
				data.presence.forEach(function(u, i) {
					spawn(u, data.metamap[u]);//, !vu.core.ischar(u));
				});
				_.events.chmeta({ meta: data.meta.channel });
				if (data.presence.length == 1)
					CT.event.subscribe("environment", vu.live.esync);
				else
					CT.event.unsubscribe("environment", vu.live.esync);
			},
			join: function(chan, user, meta) {
				var _ = vu.live._;
				_.isroom(chan) && _.spawn(user, meta);//, true);
			},
			leave: function(chan, user) {
				var _ = vu.live._, peeps = _.people,
					minimap = zero.core.current.minimap;
				_.isroom(chan) && setTimeout(function() {
					minimap.unperson(peeps[user].name);
					peeps[user].remove();
					delete peeps[user];
					if (Object.keys(peeps).length == 1)
						CT.event.subscribe("environment", vu.live.esync);
				}, 500); // leave time for ejection
			},
			chmeta: function(data) {
				var zcc = zero.core.current, zcu = zero.core.util;
				if ("lights" in data.meta) {
					for (var ldata of Object.values(data.meta.lights)) {
						var lig = zcc.room.lights[ldata.light];
						ldata.color && lig.setColor(zcu.hex2rgb(zcu.componentToHex(ldata.color)));
						if (ldata.position)
							lig.thring.position[ldata.axis] = ldata.position;
						("intensity" in ldata) && lig.setIntensity(ldata.intensity);
					}
				}
				if ("audio" in data.meta)
					for (aud in data.meta.audio)
						zcc.audio.add(data.meta.audio[aud], true, aud);
				// TODO: video etc
			},
			meta: function(data) {
				var _ = vu.live._, person = _.people[data.user], meta = data.meta,
					zcc = zero.core.current;
				if (zcc.person && data.user == zcc.person.opts.key)
					return;
				if (!(person && person.body))
					return; // will handle meta when spawn is complete
				person.language = meta.language;
				if (_.cbs.frozen) return;
				var bod = person.body, sz = bod.springs, s, prop;
				bod.streamify(meta.fznchan);
				for (s of _.springs)
					for (prop in meta[s])
						sz[s][prop] = meta[s][prop];
				for (s of _.bsprops)
					sz.bob[s] = meta.bob[s];
				_.dance(person, meta);
				if (person.helpMe != meta.helpMe) {
					person.helpMe = meta.helpMe;
					(vu.core.ownz() || user.core.get("admin")) && zcc.minimap.help(person);
				}
				if (person.score != meta.score)
					zcc.adventure && zcc.adventure.score(meta.score, person);
			},
			message: function(msg) {
				var _ = vu.live._, person = _.people[msg.user],
					data = msg.message, action = _.actions[data.action];
				if (person && person.body)
					action(person, data.data);
				else if (["squadchat", "invite", "roomvite"].includes(data.action))
					CT.db.one(msg.user, user => action({ name: user.name }, data.data), "json");
				else // probs still building
					_.pending[msg.user] = msg;
			}
		},
		isroom: function(chan) {
			var zccr = zero.core.current.room;
			return zccr && zccr.opts.key == chan;
		},
		dance: function(person, meta) {
			if (meta.vibe != person.vibe.current)
				person.vibe.update(meta.vibe);
			if (meta.gesture)
				(person.activeGesture == meta.gesture) || person.gesture(meta.gesture);
			else if (person.activeGesture)
				person.ungesture();
			if (meta.dance)
				(person.activeDance == meta.dance) || person.dance(meta.dance);
			else if (person.activeDance)
				person.undance();
			if (meta.mod)
				(person.activeMod == meta.mod) || person.mod(meta.mod);
			else if (person.activeMod)
				person.unmod();
		},
		spawn: function(pkey, meta, unfric, invis) {
			var _ = vu.live._, isYou = vu.core.ischar(pkey),
				zc = zero.core, zcu = zc.util, zcc = zc.current;
			if (isYou && pkey in _.people) return; // you switching rooms
			CT.db.one(pkey, function(pdata) {
				if (meta && !invis && !_.cbs.frozen)
					pdata.body.position = [meta.weave.target, meta.bob.target, meta.slide.target];
				var loadPer = function(person) {
					_.people[pdata.key] = person;
					_.cbs.enter(person);
					if (isYou)
						_.cbs.joined(person);
					else if (unfric)
						person.body.setFriction(false);
					if (_.pending[pdata.key]) {
						_.events.message(_.pending[pdata.key]);
						delete _.pending[pdata.key];
					}
					meta && _.events.meta({
						user: pkey,
						meta: meta
					});
				};
				if (pdata.name in zcc.people)
					loadPer(zcc.people[pdata.name]);
				else
					zcu.join(vu.core.person(pdata, invis), loadPer, !isYou);
			}, "json");
		}
	},
	autochatter: function(thing) { // thing = autobot (person)
		var zc = zero.core, zcc = zc.current, cam = zc.camera;
		var cbutt = CT.dom.button("chat", function() {
			thing.automaton.pause();
			thing.look(zcc.person.body, true);
			cam.angle("front", thing.name);
			zcc.person.onsaid(statement => thing.respond(statement, null, true,
				msg => vu.live.botchat(thing.name, msg)));
			CT.dom.setContent(cbox, cchatting);
		}), cstop = CT.dom.button("stop chatting", function() {
			thing.unlook();
			thing.automaton.play();
			cam.angle("polar");
			zcc.person.onsaid();
			CT.dom.setContent(cbox, cbutt);
		}), chelp = CT.dom.button("help!", function() {
			vu.squad.emit("enable help mode");
		}), cchatting = CT.dom.div([
			cstop, chelp
		]), cbox = CT.dom.div(cbutt);
		return cbox;
	},
	esync: function(data) {
		vu.live.emit("environment", data);
	},
	emit: function(action, val, chan) {
		CT.pubsub.publish(chan || vu.live._.channel || zero.core.current.room.opts.key, {
			action: action,
			data: val
		});
	},
	squadchat: function(squadname, val) {
		vu.live.emit("squadchat", {
			msg: val,
			squad: squadname
		}, squadname);
	},
	botchat: function(botname, val) {
		vu.live.emit("botchat", {
			msg: val,
			bot: botname
		});
	},
	invite: function(squadname) {
		vu.live.emit("invite", squadname);
	},
	roomvite: function(squadname, msg) {
		vu.live.emit("roomvite", {
			squad: squadname,
			msg: msg || "check out this zone",
			room: zero.core.current.room.opts.key
		}, squadname);
	},
	gamevite: function(squadname, msg) {
		vu.live.emit("gamevite", {
			squad: squadname,
			msg: msg || "check out this game",
			game: zero.core.current.adventure.game.key
		}, squadname);
	},
	helpme: function() {
		vu.live.roomvite("admin", "help me");
	},
	zmeta: function(data) {
		CT.pubsub.chmeta(vu.live._.channel || zero.core.current.room.opts.key, data);
	},
	meta: function() {
		var zcc = zero.core.current, person = zcc.person,
			bod = person.body, s, sz = bod.springs, _ = vu.live._, targets;
		if (_.cbs.frozen) {
			targets = {
				language: person.language
			};
		} else {
			targets = {
				helpMe: person.helpMe,
				mod: person.activeMod,
				vibe: person.vibe.current,
				dance: person.activeDance,
				gesture: person.activeGesture,
				language: person.language,
				fznchan: bod.fznchan,
				score: person.score
			};
			for (s of _.springs) {
				targets[s] = {
					boost: sz[s].boost || 0,
					value: sz[s].value,
					target: sz[s].target
				};
			}
			targets.orientation.hard = false; // meh hacky
			targets.bob = {};
			for (s of _.bsprops)
				targets.bob[s] = sz.bob[s];
		}
		CT.pubsub.meta(_.channel || zcc.room.opts.key, targets);
	},
	channel: function(channel) {
		vu.live._.channel = channel;
		CT.pubsub.subscribe(channel);
	},
	init: function(cbs) {
		var _ = vu.live._, zcc = zero.core.current;
		cbs = _.cbs = cbs || {};
		["subscribe", "join", "leave", "meta", "chmeta", "message"].forEach(function(ename) {
			CT.pubsub.set_cb(ename, _.events[ename]);
		});
		CT.pubsub.connect(location.hostname, 8888, CT.storage.get("person"));
		if (cbs.find)
			cbs.find(vu.live.channel);
		else if (zcc.room)
			CT.pubsub.subscribe(zcc.room.opts.key);
		CT.pubsub.subscribe("global");
		user.core.get("admin") && CT.pubsub.subscribe("admin");
	}
};