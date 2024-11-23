vu.build.elect = {
	_: {
		up: function() {
			var ro = vu.build.elect._.opts();
			vu.storage.setOpts(ro.key, { electrical: ro.electrical });
		},
		opts: function(sub) {
			var opts = zero.core.current.room.opts;
			return sub ? opts[sub] : opts;
		},
		eopts: function(sub) {
			var opts = vu.build.elect._.opts("electrical");
			return sub ? opts[sub] : opts;
		},
		aopts: function(sub) {
			var opts = vu.build.elect._.eopts("appliances");
			return sub ? opts[sub] : opts;
		},
		circ: function(circs, canRemove) {
			var zc = zero.core, vb = vu.build, _ = vb.elect._, saveUp = function() {
				_.up();
				vb.core.getSel().circuits.update();
				zc.Appliance.initCircuits(_.eopts("circuits"));
			};
			return CT.dom.div(Object.keys(circs).map(function(c) {
				return CT.dom.div([
					canRemove && CT.dom.link("-", function() {
						if (!confirm("really remove this circuit?")) return;
						delete circs[c];
						saveUp();
					}, null, "right red"),
					CT.dom.link("+", function() {
						CT.modal.prompt({
							prompt: "what's the new circuit called?",
							cb: function(cname) {
								circs[c][cname] = {};
								saveUp();
							}
						});
					}, null, "right green"),
					c,
					CT.dom.div(_.circ(circs[c], true), "tabbed")
				]);
			}), "bordered");
		},
		app: function(app) {
			var vb = vu.build, lec = vb.elect, _ = lec._, vbc = vb.core, saveUp = function(prop) {
				_.aopts(aoz.kind).parts[aoz.index][prop] = aoz[prop];
				_.up();
			}, aoz = app.opts, isbulb = aoz.kind == "bulb", rdim = isbulb ? "x" : "y", cont = [
				CT.dom.br(),
				vbc.name(app),
				vbc.level(app, function(yval) {
					aoz.position[1] = yval;
					saveUp("position");
				}),
				vbc.rot(app, rdim, function(rval) {
					aoz.rotation[isbulb ? 0 : 1] = rval;
					saveUp("rotation");
				}),
				vbc.circuit(app, function(circ) {
					saveUp("circuit");
					app.plug(circ);
				})
			];
			if (isbulb) {
				// TODO: color
			} else if (aoz.kind == "gate") // TODO: width/height ; door{}
				cont.push(vbc.opener(app, () => saveUp("opener")));
			else if (aoz.kind == "elevator") {
				// TODO: targets[]
			} else if (aoz.kind == "panel")
				cont.push(lec.controls.panel(app, saveUp));
			return cont;
		},
		apps: function(cat) {
			var r = zero.core.current.room, anames = Object.keys(r[cat] || {}),
				cont = CT.dom.div(anames.map(a => vu.build.elect._.app(r[a])));
			return CT.dom.div([
				CT.dom.button("add", function() {

					// TODO!!!!

				}, "right"),
				cat,
				cont
			], "topbordered pv10");
		}
	},
	controls: {
		button: function(butt, cb) { // [{appliance,order}]
			var r = zero.core.current.room, swapper, odata,
				appkinds = ["bulb", "gate", "elevator"].filter(k=>r[k]);
			swapper = CT.dom.link(null, function() {
				CT.modal.choice({
					prompt: "what kind of appliance?",
					data: appkinds,
					cb: function(akind) {
						CT.modal.choice({
							prompt: "which one?",
							data: Object.keys(r[akind]),
							cb: function(aname) {
								if (akind == "gate")
									odata = ["swing", "slide", "squish"];
								else if (akind == "elevator")
									odata = r[aname].opts.targets;
								else // TODO : bulb color!
									return alert("sorry, unimplemented!");
								CT.modal.choice({
									prompt: "what's the order?",
									data: odata,
									cb: function(order) {
										butt.appliance = aname;
										butt.order = order;
										swapper.refresh();
										cb();
									}
								});
							}
						});
					}
				});
			}, "centered block");
			swapper.refresh = function() {
				CT.dom.setContent(swapper, butt.appliance + " : " + butt.order);
			};
			swapper.refresh();
			return swapper;
		},
		flipper: function(item, cb) { // [{circuit}]
			return vu.build.core.circuit(item, cb, true);
		},
		strip: function(pan, kind, cb) {
			var cons = vu.build.elect.controls, cber = () => cb(kind),
				kinder = cons[kind] || cons.flipper,
				toggler = item => kinder(item, cber);
			return CT.dom.div([
				CT.dom.button("add", function() {
					// TODO!
				}, "right"),
				kind,
				pan.opts[kind].map(toggler)
			], "clearnode");
		},
		panel: function(pan, cb) {
			var n = CT.dom.div(), fullCb = function(kind) {
				// TODO: refresh pan itself!
				n.refresh();
				cb(kind);
			}, strip = vu.build.elect.controls.strip;
			n.refresh = function() {
				CT.dom.setContent(n, pan.kinds.map(k => strip(pan, k, fullCb)));
			};
			n.refresh();
			return n;
		}
	},
	circuits: function() {
		var vb = vu.build, _ = vb.elect._,
			sel = vb.core.getSel().circuits = CT.dom.div();
		sel.update = function() {
			CT.dom.setContent(sel, _.circ(_.eopts("circuits")));
		};
		return CT.dom.div([
			"circuits",
			sel
		], "topbordered pv10");
	},
	appliances: function() {
		var vb = vu.build, _ = vb.elect._,
			sel = vb.core.getSel().appliances = CT.dom.div();
		sel.update = function() {
			CT.dom.setContent(sel,
				["panel", "bulb", "gate", "elevator"].map(vb.elect._.apps));
		};
		return CT.dom.div([
			"appliances",
			sel
		], "topbordered pv10");
	},
	electrical: function() {
		var vb = vu.build, lec = vb.elect, sel = CT.dom.div([
			"Electrical",
			lec.circuits(),
			lec.appliances()
		]), selz = vb.core.getSel();
		selz.electrical = sel;
		sel.update = function() {
			selz.circuits.update();
			selz.appliances.update();
		};
	}
};