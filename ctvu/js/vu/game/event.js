vu.game.event = {
	_: {
		t2f: {
			melt: "frozen",
			shart: "brittle",
			burn: "flammable",
			die: "automaton",
			wile: "automaton"
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
			var zccr = zero.core.current.room, ops, isauto = feature == "automaton";
			ops = isauto ? zccr.automatons.map(a => a.person) : zccr.getFeaturing(feature);
			ops = ops.filter(f => !(f.name in trigs));
			if (!ops.length) {
				if (isauto)
					alert("no unconfigured automatons - add one on the pop page!");
				else
					alert("no unconfigured " + feature + " objects - add one on the zone page!");
			}
			return ops;
		},
		slotter: function(trigs) {
			return function(name) {
				var tn = CT.dom.div([
					CT.dom.button("unregister", function() {
						delete trigs[name];
						tn.remove();
						_.up();
					}, "right red"),
					name + ": " + trigs[name]
				], "borderd padded margined");
				return tn;
			};
		}
	},
	node: function(trig) {
		var _ = vu.game.event._, zcc = zero.core.current, trigs = _.trigs(trig),
			tnode = _.slotter(trigs), feature = _.t2f[trig], feats,
			tnodes = CT.dom.div(Object.keys(trigs).map(tnode));
		return CT.dom.div([
			CT.dom.button("add", function() {
				feats = _.options(feature, trigs);
				feats.length && CT.modal.choice({
					prompt: "please select object",
					data: feats,
					cb: function(item) {
						CT.modal.choice({
							prompt: "please select a script to trigger",
							data: Object.keys(zcc.scene.scripts),
							cb: function(sname) {
								trigs[item.name] = sname;
								CT.dom.addContent(tnodes, tnode(item.name));
								_.up();
							}
						});
					}
				});
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