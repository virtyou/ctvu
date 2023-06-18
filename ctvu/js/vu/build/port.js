vu.build.port = {
	_: {},
	portin: function(door) {
		var vbc = vu.build.core, opts = vbc.getOpts(), source, rsource, snode,
			n = CT.dom.div(), pz = door.opts.portals.incoming;
		CT.db.multi(pz.map(function(p) {
			return p.source;
		}), function() {
			CT.dom.setContent(n, pz.map(function(p) {
				source = CT.data.get(p.source);
				rsource = CT.data.get(source.parent);
				snode = CT.dom.div([
					CT.dom.link("X", function() {
						if (!confirm("really unlink?")) return;
						vu.storage.edit({
							key: p.key,
							target: opts.key // demoted to room incoming
						}, function() {
							snode.remove();
							CT.data.remove(pz, p);
							p.target = opts.key;
							opts.portals.push(p);
							vbc.getSel("portal_requests").update();
						});
					}, null, "right red"),
					rsource.name + " (" + source.name + ")"
				]);
				return snode;
			}));
		}, "json");
		return n;
	},
	portout: function(door) {
		var n = CT.dom.div(), og, out, name, sel = function() {
			CT.modal.choice({
				data: vu.storage.get("allrooms"),
				cb: function(room) {
					og = door.opts.portals.outgoing;
					out = {};
					if (og)
						out.key = og.key;
					else {
						out.modelName = "portal";
						out.source = door.opts.key;
					}
					out.target = room.key;
					vu.storage.edit(out, function(pdata) {
						door.opts.portals.outgoing = pdata;
						room.portals.push(pdata);
						setP();
					});
				}
			});
		}, setP = function() {
			if (door.opts.portals.outgoing) {
				CT.db.one(door.opts.portals.outgoing.target, function(target) {
					if (target.kind != "portal")
						name = target.name + " (pending)";
					else
						name = CT.data.get(target.parent).name + " (" + target.name + ")";
					CT.dom.setContent(n, CT.dom.link(name, sel));
				}, "json");
			} else
				CT.dom.setContent(n, CT.dom.link("select", sel));
		};
		setP();
		return n;
	},
	linx: function(portal) {
		var vbp = vu.build.port;
		return [
			CT.dom.div([
				"Outgoing",
				vbp.portout(portal)
			], "topbordered padded margined"),
			CT.dom.div([
				"Incoming",
				vbp.portin(portal)
			], "topbordered padded margined")
		];
	},
	requests: function() { // incoming portal requests
		var vbc = vu.build.core, selz = vbc.getSel(), opts = vbc.getOpts();
		selz.portal_requests = CT.dom.div();
		selz.portal_requests.update = function() {
			CT.db.multi(opts.portals.map(function(p) {
				return p.source;
			}), function() {
				CT.dom.setContent(selz.portal_requests, opts.portals.map(function(p) {
					var source = CT.data.get(p.source),
						rsource = CT.data.get(source.parent),
						n = CT.dom.div([
							rsource.name + " (" + source.name + ")",
							CT.dom.link("ACCEPT", function() {
								CT.modal.choice({
									data: ["new portal"].concat(opts.objects.filter(function(f) {
										return f.kind == "portal";
									})),
									cb: function(port) {
										var pup = function(pthing) {
											vu.storage.edit({
												key: p.key,
												target: pthing.opts.key
											}, function() {
												n.remove();
												p.target = pthing.opts.key;
												CT.data.remove(opts.portals, p);
												pthing.opts.portals.incoming.push(p);
												selz.portal_requests.update();
												selz.furnishings.update();
											});
										};
										if (port == "new portal")
											_.selfurn("portal", pup);
										else
											pup(zero.core.Thing.get(port.key));
									}
								});
							}),
							CT.dom.pad(),
							CT.dom.link("REJECT", function() {
								if (!confirm("really reject?")) return;
								n.remove();
								CT.data.remove(opts.portals, p);
								vu.storage.edit(p.key, null, "delete", "key");
							})
						]);
					return n;
				}));
			}, "json");
		};
	},
	portal: function(portal) {
		 var vb = vu.build, vbc = vb.core;
		 return [
		 	vbc.unfurn(portal),
		 	vbc.fname(portal),
		 	vbc.scale(portal),
		 	vbc.materials(portal),
			vbc.txupper(portal),
		 	vb.port.linx(portal)
		 ];
	},

};