vu.build.core = {
	getOpts: function(oname) {
		var oz = vu.builders.zone._.opts;
		if (oname)
			return oz[oname];
		return oz;
	},
	getSel: function(sname) {
		var selz = vu.builders.zone._.selectors;
		if (sname)
			return selz[sname];
		return selz;
	},
	regObj: function(furn) {
		CT.data.add(furn.opts);
		zero.core.click.register(furn, function() {
			vu.build.core.getSel("controls").update(furn);
		});
	},
	upper: function(opts, prop) {
		var ups = { key: opts.key };
		return function() {
			ups[prop] = opts[prop];
			vu.storage.edit(ups);
		};
	},
	check: function(prop, fopts, cb) {
		if (cb === true)
			cb = vu.build.core.upper(fopts, prop);
		return CT.dom.checkboxAndLabel(prop, fopts[prop], null, null, null, function(cbox) {
			fopts[prop] = cbox.checked;
			cb && cb();
		});
	},
	name: function(furn) {
		var n = CT.dom.div(furn.name);
		n.onclick = function() {
			vu.build.core.getSel("controls").update(furn);
		};
		return n;
	},
	txupper: function(item, fulltxcb) {
		return CT.dom.div([
			"Texture",
			vu.media.swapper.texmo(item, function(txups) {
				Object.assign(item.opts, txups); // questionable ... necessary?
				vu.storage.setOpts(item.opts.key, txups);
			}, false, fulltxcb)
		], "topbordered padded margined");
	},
	materials: function(furn) {
		var obj, selz = furn || vu.build.core.getSel();
		selz.color = CT.dom.div();
		selz.color.update = function() {
			obj = furn || zero.core.current.room;
			CT.dom.setContent(selz.color, vu.color.selector(obj, "color"));
		};

		selz.specular = CT.dom.div();
		selz.specular.update = function() {
			obj = furn || zero.core.current.room;
			CT.dom.setContent(selz.specular, vu.color.selector(obj, "specular"));
		};

		selz.shininess = CT.dom.div();
		selz.shininess.update = function() {
			obj = furn || zero.core.current.room;
			if (!obj.thring)
				return CT.dom.hide(selz.shininess.full);
			CT.dom.show(selz.shininess.full);
			CT.dom.setContent(selz.shininess, CT.dom.range(function(val) {
				val = parseInt(val);
				obj.opts.material.shininess = obj.thring.material.shininess = val;
				vu.storage.setMaterial(obj.opts.key, { shininess: val });
			}, 0, 150, obj.thring.material.shininess || 30, 1, "w1"));
		};
		selz.shininess.full = CT.dom.div([
			"Shininess",
			selz.shininess
		], "topbordered padded margined");

		selz.opacity = CT.dom.div();
		selz.opacity.update = function() {
			obj = furn || zero.core.current.room;
			if (!obj.thring)
				return CT.dom.hide(selz.opacity.full);
			CT.dom.show(selz.opacity.full);
			CT.dom.setContent(selz.opacity, [
				CT.dom.checkboxAndLabel("transparent", obj.opts.material.transparent,
					null, null, "bordered round small right up20", function(cbox) {
						obj.opts.material.transparent = obj.thring.material.transparent = cbox.checked;
						vu.storage.setMaterial(obj.opts.key, {
							transparent: cbox.checked
						});
					}
				),
				CT.dom.range(function(val) {
					val = parseInt(val);
					obj.opts.material.opacity = obj.thring.material.opacity = val;
					vu.storage.setMaterial(obj.opts.key, {
						opacity: val
					});
				}, 0.1, 1, obj.thring.material.opacity || 1, 0.1, "w1")
			]);
		};
		selz.opacity.full = CT.dom.div([
			"Opacity",
			selz.opacity
		], "topbordered padded margined");

		if (furn) {
			selz.color.update();
			selz.specular.update();
			selz.shininess.update();
			selz.opacity.update();
		}

		return [
			CT.dom.div([
				"Color",
				selz.color
			], "topbordered padded margined"),
			CT.dom.div([
				"Specular",
				selz.specular
			], "topbordered padded margined"),
			selz.shininess.full,
			selz.opacity.full
		];
	},
	unfurn: function(furn) {
		var msg = "really remove this " + furn.opts.kind;
		if (furn.opts.kind == "portal")
			msg += " and all incoming/outgoing linkages";
		msg += "?";
		return CT.dom.button("remove " + furn.opts.kind, function() {
			if (!confirm(msg)) return;
			zero.core.current.room.removeObject(furn);
			vu.build.core.getSel("furnishings").update();
			vu.storage.edit(furn.opts.key, null, "delete", "key");
		}, "up5 right");
	},
	scale: function(furn, cb, min, max, unit) {
		return vu.core.ranger("Scale", function(val) {
			var fval = parseFloat(val);
			furn.scale(fval);
			(furn.opts.kind == "elemental") ||
				furn.setBounds(true); // TODO: maybe move to zero.core.Thing.scale()?
			cb ? cb(fval) : vu.storage.setOpts(furn.opts.key, {
				scale: [fval, fval, fval]
			});
		}, min, max, furn.scale().x, unit);
	},
	rot: function(thing, dim, cb, boundit) {
		var unit = Math.PI / 2;
		return vu.core.ranger("rotation (" + dim + ")", function(val) {
			val = parseFloat(val);
			thing.adjust("rotation", dim, val);
			boundit && thing.basicBound();
			cb(val);
		}, 0, unit * 3, thing.rotation()[dim], unit);
	},
	tilt: function(ramp, cb) {
		var unit = Math.PI / 16;
		return vu.core.ranger("Tilt", function(val) {
			var fval = parseFloat(val);
			ramp.adjust("rotation", "x", fval);
			ramp.setBounds(true);
			cb(fval);
		}, unit * 4, unit * 12, ramp.rotation().x, unit);
	},
	grip: function(floor, cb) {
		return CT.dom.checkboxAndLabel("grippy", floor.opts.grippy,
			null, null, null, function(cbox) {
				floor.grippy = cbox.checked;
				cb(floor.grippy);
			});
	},
	climb: function(wall, cb) {
		return CT.dom.checkboxAndLabel("climby", wall.opts.climby,
			null, null, null, function(cbox) {
				wall.climby = cbox.checked;
				cb(wall.climby);
			});
	},
	mosh: function(floor, cb) {
		return vu.core.ranger("moshiness",
			val => cb(parseInt(val)), 0, 5, floor.moshy || 0, 1);
	},
	scroll: function(floor, cb) {
		var fos = floor.opts.scroll, curval = fos ? (
			"scroll " + ( fos.axis || "y" )
		) : "no scroll";
		return CT.dom.select({
			names: ["no scroll", "scroll x", "scroll y"],
			curvalue: curval,
			onchange: function(val) {
				if (val == "no scroll")
					floor.unscroll(true);
				else
					floor.scroll({ axis: val.split(" ").pop() });
				cb(floor.opts.scroll);
			}
		});
	},
	shift: function(floor, cb) {
		var fos = floor.opts.shift, curval = fos ? (
			"shift " + ( fos.axis || "z" )
		) : "no shift", curmode = fos && fos.mode, modesel = CT.dom.select({
			names: ["bounce", "recycle"],
			curvalue: curmode || "bounce",
			onchange: function(val) {
				floor.shift({ mode: val });
				cb(floor.opts.shift);
			}
		});
		fos || CT.dom.hideV(modesel);
		return [
			CT.dom.select({
				names: ["no shift", "shift x", "shift y", "shift z"],
				curvalue: curval,
				onchange: function(val) {
					if (val == "no shift") {
						floor.unshift(true);
						CT.dom.hideV(modesel);
					}
					else {
						floor.shift({
							mode: modesel.value,
							axis: val.split(" ").pop()
						});
						CT.dom.showV(modesel);
					}
					cb(floor.opts.shift);
				}
			}),
			modesel
		];
	},
	rampside: function(ramp, cb) {
		var ropts = ramp.opts;
		return CT.dom.select({
			names: ["neither wall", "left wall", "right wall", "both walls"],
			values: ["neither", "left", "right", "both"],
			curvalue: ropts.side || "neither",
			onchange: function(val) {
				ropts.side = val;
				ramp.setSides(true);
				cb(val);
			}
		})
	},
	side: function(floor, cb) {
		var fopts = floor.opts;
		return CT.dom.select({
			names: ["Front Side", "Back Side", "Double Side"],
			values: [0, 1, 2],
			curvalue: fopts.material && fopts.material.side,
			onchange: function(val) {
				if (!fopts.material)
					fopts.material = {};
				floor.material.side = fopts.material.side = parseInt(val);
				cb(fopts.material);
			}
		});
	},
	comprog: function(cb) {
		var vbc = vu.build.core, cbwrap;
		vbc.sprompter("program", ["video", "vstrip", "message"], function(program) {
			cbwrap = data => cb({ program: program, data: data });
			if (program == "message") {
				CT.modal.prompt({
					prompt: "what's the message?",
					cb: cbwrap
				});
			} else if (program == "vstrip")
				vbc.sprompter("vstrip", Object.keys(templates.one.vstrip), cbwrap);
			else // video
				vbc.vidsel(cbwrap);
		});
	},
	vidsel: function(cb) {
		var fpref = "fzn:";
		CT.modal.choice({
			prompt: "what kind of video program?",
			data: ["channel", "stream (down)", "stream (up)"],
			cb: function(sel) {
				if (sel == "channel") { // tl channel
					return CT.modal.choice({
						prompt: "what channel?",
						data: core.config.ctvu.loaders.tlchans,
						cb: chan => cb("tlchan:" + chan)
					});
				} // fzn stream
				if (sel.includes("up"))
					fpref += "up:";
				CT.modal.prompt({
					prompt: "ok, what's the name of the stream?",
					cb: name => cb(fpref + name)
				});
			}
		});
	},
	sprompter: function(prop, data, cb) {
		CT.modal.choice({
			prompt: "what " + prop + " should we use?",
			data: data,
			cb: cb
		});
	},
	seller: function(opts, prop, opper, cb) {
		var swapper = CT.dom.link(opts[prop] || "(none)", function() {
			vu.build.core.sprompter(prop, opper(), function(sel) {
				CT.dom.setContent(swapper, sel);
				opts[prop] = sel;
				cb(sel);
			});
		});
		return [
			CT.dom.span(prop + ":"),
			CT.dom.pad(),
			swapper
		];
	},
	circuit: function(app, cb, asopts) {
		return vu.build.core.seller(asopts ? app : app.opts, "circuit",
			() => Object.keys(zero.core.Appliance.circuitry), cb);
	},
	opener: function(app, cb) {
		return vu.build.core.seller(app.opts, "opener",
			() => ["swing", "slide", "squish"], cb);
	},
	screensaver: function(app, cb) {
		return vu.build.core.seller(app.opts, "screenSaver",
			() => Object.keys(templates.one.vstrip), cb);
	},
	vtemplate: function(app, cb) {
		var aoz = app.opts;
		return vu.build.core.seller(aoz, "variety",
			() => Object.keys(templates.one.appliance[aoz.kind]), cb);
	},
	level: function(furn, cb) {
		var rbz = zero.core.current.room.getBounds();
		return vu.core.ranger("Level", function(val) {
			var fval = parseInt(val);
			furn.setLevel(fval);
			if (cb)
				cb(fval);
			else {
				var fp = furn.position();
				vu.storage.setOpts(furn.opts.key, {
					position: [fp.x, fval, fp.z]
				});
			}
		}, rbz.min.y, rbz.max.y, furn.position().y, 1);
	},
	scalers: function(obj, cb, min, max, unit, dims, cname) {
		var scale = obj.scale(),
			scopts = [scale.x, scale.y, scale.z];
		return CT.dom.div([
				"Scale",
				(dims || ["x", "y", "z"]).map(function(dim, i) {
					return vu.core.ranger(dim, function(val) {
						val = parseFloat(val);
						scopts[i] = val;
						obj.adjust("scale", dim, val);
						obj.setBounds();
						cb(scopts);
					}, min || 0.3, max || 256, scale[dim], unit || 0.1, true);
				})
			], cname || "padded bordered round mb5");
	}
};