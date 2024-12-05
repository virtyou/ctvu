vu.build.elect = {
	_: {
		nodes: {},
		up: function() {
			var ro = vu.build.elect._.opts();
			vu.storage.setOpts(ro.key, { electrical: ro.electrical });
		},
		prup: function(tar, prop) {
			var _ = vu.build.elect._, toz = tar.opts;
			_.eitem(toz.kind, toz.index)[prop] = toz[prop];
			_.up();
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
		eitem: function(kind, index) {
			return vu.build.elect._.aopts(kind).parts[index];
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
			var vb = vu.build, lec = vb.elect, _ = lec._, saveUp = function(prop) {
				_.prup(app, prop);
			}, vbc = vb.core, aoz = app.opts, k = aoz.kind, isbulb = k == "bulb",
				isgate = k == "gate", rdim = isbulb ? "x" : "y", cont;
			cont = [
				CT.dom.br(),
				vbc.name(app),
				vbc.circuit(app, function(circ) {
					saveUp("circuit");
					app.plug(circ);
				}),
				vbc.level(app, function(yval) {
					aoz.position[1] = yval;
					saveUp("position");
				}),
				vbc.rot(app, rdim, function(rval) {
					aoz.rotation[isbulb ? 0 : 1] = rval;
					saveUp("rotation");
				}, isgate)
			];
			// TODO : elevator targets[]
			if (isbulb) {
				cont.push(vu.core.ranger("intensity", function(intensity) {
					intensity = parseInt(intensity) / 100;
					aoz.intensity = intensity;
					app.setIntensity();
					saveUp("intensity");
				}, 0, 100, aoz.intensity * 100, 1));
				cont.push(vu.core.ranger("invariance", function(invariance) {
					invariance = parseInt(invariance);
					aoz.invariance = invariance;
					saveUp("invariance");
				}, 2, 20, aoz.invariance, 1));
				cont.push(vu.core.ranger("flickRate", function(flickRate) {
					flickRate = parseInt(flickRate);
					aoz.flickRate = flickRate;
					saveUp("flickRate");
				}, 0, 10, aoz.flickRate, 1));
				cont.push(CT.dom.div([
					"color",
					vu.color.selector(app, "color", null, function(color) {
						aoz.color = color;
						saveUp("color");
					})
				], "topbordered margined padded"));
			} else {
				cont.push(vbc.vtemplate(app, () => saveUp("variety")));
				if (isgate) // TODO: width/height ; door{}
					cont.push(vbc.opener(app, () => saveUp("opener")));
				else if (k == "panel")
					cont.push(lec.controls.panel(app, saveUp));
				else if (k == "computer") // TODO : programs{}????
					cont.push(vbc.screensaver(app, () => saveUp("screenSaver")));
			}
			return cont;
		},
		doadd: function(cat, opts) {
			var _ = vu.build.elect._, r = zero.core.current.room,
				athing = r.addElec(cat, opts), cont = _.nodes[cat];
			athing.onReady(() => CT.dom.addContent(cont, _.app(athing)));
			r.elecBase(cat).parts.push(opts || {});
			_.up();
		},
		adder: function(cat) {
			var vb = vu.build, _ = vb.elect._, toa = templates.one.appliance;
			if (!toa[cat]) // panel or bulb
				return _.doadd(cat);
			vb.core.sprompter("variety", Object.keys(toa[cat]),
				sel => _.doadd(cat, { variety: sel }));
		},
		apps: function(cat) {
			var _ = vu.build.elect._, r = zero.core.current.room,
				anames = Object.keys(r[cat] || {}),
				cont = _.nodes[cat] = CT.dom.div(anames.map(a => _.app(r[a])));
			return CT.dom.div([
				CT.dom.button("add", () => _.adder(cat), "right"),
				cat,
				cont
			], "topbordered pv10");
		}
	},
	controls: {
		butter: function(cb) {
			var r = zero.core.current.room, odata,
				appkinds = vu.build.elect.varieties.slice(1).filter(k=>r[k]);
			CT.modal.choice({
				prompt: "what kind of appliance?",
				data: appkinds,
				cb: function(akind) {
					CT.modal.choice({
						prompt: "which one?",
						data: Object.keys(r[akind]),
						cb: function(aname) {
							if (akind == "bulb")
								vu.color.modal(color => cb(aname, color));
							else {
								if (akind == "gate")
									odata = ["swing", "slide", "squish"];
								else if (akind == "elevator")
									odata = r[aname].opts.targets;
								CT.modal.choice({
									prompt: "what's the order?",
									data: odata,
									cb: order => cb(aname, order)
								});
							}
						}
					});
				}
			});
		},
		button: function(butt, cb) { // [{appliance,order}]
			var swapper = CT.dom.link(null, function() {
				vu.build.elect.controls.butter(function(appliance, order) {
					butt.appliance = appliance;
					butt.order = order;
					swapper.refresh();
					cb();
				});
			}, null, "block");
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
			var cber = () => cb(kind), adder = function(item) {
				pan.opts[kind].push(item);
				pan.refresh();
				cber();
			}, cons = vu.build.elect.controls, kinder = cons[kind] || cons.flipper,
				toggler = item => kinder(item, cber);
			return CT.dom.div([
				CT.dom.button("add", function() {
					if (kind == "button") {
						cons.butter(function(appliance, order) {
							adder({ appliance: appliance, order: order });
						});
					} else { // switch/lever
						CT.modal.choice({
							prompt: "what circuit?",
							data: Object.keys(zero.core.Appliance.circuitry),
							cb: function(circ) {
								adder({ circuit: circ });
							}
						});
					}
				}, "right"),
				kind,
				pan.opts[kind].map(toggler)
			], "clearnode");
		},
		panel: function(pan, cb) {
			var n = CT.dom.div(), fullCb = function(kind) {
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
	varieties: ["panel", "bulb", "gate", "elevator", "computer"],
	posup: function(target) {
		vu.build.elect._.prup(target, "position");
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
		var vb = vu.build, lec = vb.elect,
			sel = vb.core.getSel().appliances = CT.dom.div();
		sel.update = function() {
			CT.dom.setContent(sel, lec.varieties.map(lec._.apps));
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