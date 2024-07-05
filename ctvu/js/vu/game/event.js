vu.game.event = {
	_: {
		nodes: {},
		t2f: {
			melt: "frozen",
			shart: "brittle",
			burn: "flammable",
			die: "automaton",
			wile: "automaton",
			receive: "actor"
		},
		nolerts: {
			actor: "no unconfigured actors - add one using the Actors menu!",
			automaton: "no unconfigured automatons - add one on the pop page!",
			default: feature => "no unconfigured " + feature + " objects - add one on the zone page!"
		},
		up: function() {
			var scene = zero.core.current.scene;
			vu.storage.edit({
				key: scene.key,
				triggers: scene.triggers
			});
		},
		trigs: function(trig) {
			var _ = vu.game.event._, alltrigs = zero.core.current.scene.triggers,
				trigs = alltrigs[trig] = alltrigs[trig] || {};
			return trigs;
		},
		options: function(feature, trigs) {
			var _ = vu.game.event._, zcc = zero.core.current, zccr = zcc.room, ops;
			if (feature == "automaton")
				ops = zccr.automatons.map(a => a.person);
			else if (feature == "actor")
				ops = zcc.scene.actors;
			else
				ops = zccr.getFeaturing(feature);
			ops = ops.filter(f => !(f.name in trigs));
			ops.length || alert(_.nolerts[feature] || _.nolerts.default(feature));
			return ops;
		},
		slotter: function(trigs) {
			return function(name) {
				var tlabel, tn, val = trigs[name];
				if (typeof val == "string")
					tlabel = "<b>" + name + "</b>: " + val;
				else {
					tlabel = [
						CT.dom.div(name, "bold"),
						Object.keys(val).map(k => k + " -> " + val[k])
					];
				}
				tn = CT.dom.div([
					CT.dom.button("unregister", function() {
						delete trigs[name];
						tn.remove();
						vu.game.event._.up();
					}, "right red"),
					tlabel
				], "borderd padded margined");
				return tn;
			};
		},
		slot: function(val, item, trig) {
			var _ = vu.game.event._, trigs = _.trigs(trig);
			trigs[item.name] = val;
			CT.dom.addContent(_.nodes[trig], _.slotter(trigs)(item.name));
			_.up();
		}
	},
	selectors: {
		object: function(cb, feats) {
			CT.modal.choice({
				prompt: "please select object",
				data: feats,
				cb: cb
			});
		},
		script: function(cb, pfor) {
			var prompt = "please select a script to trigger";
			if (pfor)
				prompt += " for " + pfor;
			CT.modal.choice({
				prompt: prompt,
				data: Object.keys(zero.core.current.scene.scripts),
				cb: cb
			});
		},
		scripts: function(cb, items) {
			var vals = {}, index = 0, setScript = function(iname, sname) {
				index += 1;
				vals[iname] = sname;
				items[index] ? reqScript() : cb(vals);
			}, reqScript = function() {
				vu.game.event.selectors.script(sname => setScript(items[index],
					sname), items[index]);
			};
			reqScript();
		},
		qitems: function(cb) {
			CT.modal.choice({
				prompt: "please select quest items",
				style: "multiple-choice",
				data: vu.core.options.names("held", "quest"),
				cb: cb
			});
		}
	},
	register: function(item, trig) {
		var vge = vu.game.event, _ = vge._, selz = vge.selectors, feature = _.t2f[trig];
		if (feature == "actor") {
			return selz.qitems(function(items) {
				selz.scripts(mapping => _.slot(mapping, item, trig), items);
			});
		}
		selz.script(sname => _.slot(sname, item, trig));
	},
	node: function(trig) {
		var vge = vu.game.event, _ = vge._, selz = vge.selectors, feats,
			trigs = _.trigs(trig), tnode = _.slotter(trigs), feature = _.t2f[trig],
			tnodes = _.nodes[trig] = CT.dom.div(Object.keys(trigs).map(tnode));
		return CT.dom.div([
			CT.dom.button("add", function() {
				feats = _.options(feature, trigs);
				feats.length && selz.object(item => vge.register(item, trig), feats);
			}, "right"),
			CT.dom.div(trig + " (" + feature + ")", "bold"),
			tnodes
		], "bordered padded margined round");
	},
	editor: function() {
		var ge = vu.game.event;
		return CT.dom.div([
			CT.dom.div("script triggers", "big"),
			Object.keys(ge._.t2f).map(ge.node)
		], "bordered padded margined round");
	}
};