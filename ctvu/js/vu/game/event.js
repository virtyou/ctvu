vu.game.event = {
	_: {
		t2f: {
			melt: "frozen",
			shart: "brittle",
			burn: "flammable"
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
				feats = zcc.room.getFeaturing(feature).filter(f => !(f.name in trigs));
				if (!feats.length)
					return alert("no unconfigured " + feature + " objects - add one on the zone page!");
				CT.modal.choice({
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