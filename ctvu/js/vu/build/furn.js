vu.build.furn = {
	resizePoster: function(poster, img) {
		var met = img.meta, orig = met && met.original,
			isize = (orig && orig.dims) || (met && met.dims);
		if (!isize) return;
		var w, h, ow = isize.width, oh = isize.height;
		if (ow < oh) {
			w = 100;
			h = 100 * oh / ow;
		} else {
			h = 100;
			w = 100 * ow / oh;
		}
		var upz = {
			planeGeometry: [w, h]
		};
		poster.update(upz);
		vu.storage.setOpts(poster.opts.key, upz);
	},
	poster: function(poster) {
		 var vb = vu.build, vbc = vb.core;
		 return [
		 	vbc.unfurn(poster),
		 	vbc.name(poster),
		 	vbc.scale(poster),
		 	vbc.materials(poster),
			vbc.txupper(poster, img => vb.furn.resizePoster(poster, img))
		 ];
	},
	vidsel: function(scr) {
		var opts = CT.data.get(scr.opts.key);
		return vu.media.selector(opts, "video", function() {
			vu.storage.setOpts(scr.opts.key, {
				video: opts.video
			});
			scr.unvideo();
			opts.video.item && scr.update({ video: opts.video });
		}, true);
	},
	fznsel: function(stream) {
		var opts = CT.data.get(stream.opts.key),
			chan = opts.video && opts.video.slice(4),
			cnode = CT.dom.node(chan, "b");
		return CT.dom.div([
			[
				CT.dom.span("fzn channel:"),
				CT.dom.pad(),
				cnode
			],
			CT.dom.smartField(function(val) {
				cnode.innerHTML = val;
				opts.video = "fzn:" + val;
				vu.storage.setOpts(opts.key, {
					video: opts.video
				});
				val && stream.update({ video: opts.video });
			}, "w1", null, chan)
		], "topbordered padded margined");
	},
	screen: function(scr) {
		 var vb = vu.build, vbc = vb.core;
		 return [
		 	vbc.unfurn(scr),
		 	vbc.name(scr),
		 	vbc.scale(scr),
		 	vbc.materials(scr),
		 	vb.furn.vidsel(scr)
		 ];
	},
	stream: function(scr) {
		 var vb = vu.build, vbc = vb.core;
		 return [
		 	vbc.unfurn(scr),
		 	vbc.name(scr),
		 	vbc.scale(scr),
		 	vbc.materials(scr),
		 	vb.furn.fznsel(scr)
		 ];
	},
	furnishing: function(furn) {
		var vbc = vu.build.core, d = [
			vbc.unfurn(furn),
			vbc.name(furn),
			vbc.scale(furn),
			vbc.level(furn),
			vu.core.ranger("Rotation", function(val) {
				var rot = [0, parseFloat(val), 0];
				furn.rotation(rot);
				vu.storage.setOpts(furn.opts.key, {
					rotation: rot
				});
			}, 0, 6, furn.rotation().y)
		];
		furn.opts.material && Object.keys(furn.opts.material).length && d.push(vbc.materials(furn));
		return d;
	},
	elemental: function(el) { // TODO: more specialized controllers for fire/pool
		var d = vu.build.furn.furnishing(el);
		(el.opts.name == "pool") && d.push(CT.dom.div(CT.dom.checkboxAndLabel("lava",
			el.opts.lava, null, null, null, function(cbox) {
				el.opts.lava = cbox.checked;
				vu.storage.setOpts(el.opts.key, {
					lava: cbox.checked
				}, () => location.reload()); // meh hacky
			}), "topbordered padded margined"));
		return d;
	},
	playlist: function(sp) {
		var pl = sp.opts.playlist = sp.opts.playlist || [],
			s2n = (s) => CT.dom.div(s.name,
				"bordered padded margined round"),
			plist = CT.dom.div(pl.map(s2n));
		return CT.dom.div([
			CT.dom.button("add", function() {
				vu.media.audio(function(song) {
					pl.push(song);
					vu.storage.setOpts(sp.opts.key, {
						playlist: pl
					});
					plist.appendChild(s2n(song));
				}, "music");
			}, "right"),
			"Playlist", plist
		], "topbordered padded margined");
	},
	swaptions: function(cb) {
		var vswarms = templates.one.vswarm;
		CT.modal.choice({
			prompt: "select a voxel swarm",
			data: Object.keys(vswarms),
			cb: function(vswarm) {
				vu.build.furn.part(null, "swarm", cb, {
					name: vswarm,
					kind: "swarm",
					thing: "Swarm",
					frames: vswarms[vswarm]
				});
			}
		});
	},
	bookcode: function(cb) {
		var burl = zero.core.Book.baseurl;
		CT.modal.prompt({
			prompt: "what's the link?",
			cb: function(url) {
				if (url.startsWith(burl))
					return cb(url.slice(burl.length));
				alert("use an archive.org link - should start with: " + burl);
				vu.build.furn.bookcode(cb);
			}
		});
	},
	booksel: function(cb) {
		CT.modal.choice({
			prompt: "select a color",
			data: zero.core.util.colors,
			cb: function(color) {
				CT.modal.prompt({
					prompt: "what's the book called?",
					cb: function(name) {
						CT.modal.prompt({
							prompt: "who wrote it?",
							cb: function(author) {
								vu.build.furn.bookcode(function(code) {
									cb({
										thing: "Book",
										kind: "book",
										name: name,
										code: code,
										cover: color,
										author: author
									});
								});
							}
						});
					}
				});
			}
		});
	},
	booktions: function(cb) {
		var bf = vu.build.furn;
		bf.booksel(opts => bf.part(null, "book", cb, opts));
	},
	carp: function(cb) {
		CT.modal.choice({
			prompt: "what kind of furniture?",
			data: Object.keys(zero.base.carpentry),
			cb: function(carp) {
				vu.build.furn.part(null, "carp", cb, {
					thing: "Shelf",
					kind: "carpentry",
					variety: carp,
					name: carp + Math.floor(Math.random() * 1000)
				});
			}
		});
	},
	carpbooks: function(carp) {
		var upit = function() {
			vu.storage.setOpts(carp.opts.key, {
				items: carp.opts.items
			});
		}, booker = function(book) {
			var bn = CT.dom.div([
				CT.dom.button("remove", function() {
					carp.removeItem(book);
					bn.remove();
					upit();
				}, "right red"),
				book.name
			], "topmargined padded bordered round");
			return bn;
		}, n = CT.dom.div(carp.opts.items.map(booker));
		return CT.dom.div([
			CT.dom.button("add book", function() {
				vu.build.furn.booksel(function(book) {
					n.appendChild(booker(book));
					carp.placeItem(book);
					upit();
				});
			}, "right"),
			CT.dom.link("Books", carp.closeup),
			n
		], "topbordered padded margined");
	},
	carpentry: function(carp) {
		var vb = vu.build, vbc = vb.core, bf = vb.furn;
		return bf.furnishing(carp).concat([
			vbc.txupper(carp),
			bf.carpbooks(carp)
		]);
	},
	speaker: function(sp) {
		var bf = vu.build.furn;
		return bf.furnishing(sp).concat([
			bf.playlist(sp)
		]);
	},
	swarm: function(sw) {
		// TODO: add specialized controllers for swarm
		return vu.build.furn.furnishing(sw);
	},
	book: function(book) {
		// TODO: add specialized controllers for book
		return vu.build.furn.furnishing(book);
	},
	furn: function(furn) {
		return CT.dom.div(vu.build.furn[furn.opts.kind](furn), "margined padded bordered round");
	},
	part: function(thing, kind, cb, eoptsopts) {
		var vb = vu.build, vbc = vb.core, selz = vbc.getSel(), eopts = {
			parent: vbc.getOpts("key"),
			modelName: "furnishing"
		}, zccr = zero.core.current.room;
		if (thing) // not required for poster/screen/stream/swarm/book/carpentry
			eopts.base = thing.key;
		if (kind == "poster" || kind == "screen" || kind == "stream") { // TODO: probs do this elsewhere/better!
			eopts.opts = {
				wall: 0,
				planeGeometry: [100, 100] // TODO: should derive from img/video dims
			};
			eopts.opts.name = kind + Math.floor(Math.random() * 1000);
			eopts.opts.kind = kind; // no base necessary...
		} else if (kind == "portal") {
			eopts.opts = { wall: 0 };
			if (!thing.key)
				eopts.opts = CT.merge(eopts.opts, thing);
		}
		else if (eoptsopts)
			eopts.opts = eoptsopts;
		if (thing && zccr[thing.name]) {
			eopts.opts = eopts.opts || {};
			if (!eopts.opts.name) {
				var altname = thing.name;
				while (altname in zccr)
					altname += "_";
				eopts.opts.name = altname;
			}
		}
		vu.storage.edit(eopts, function(furn) {
			var f = zccr.addObject(furn, function() {
				vbc.regObj(f);
//					f.setBounds(); // TODO: this should probably be in zero.core.Room
				cb && cb(f);
				selz.controls.update(f);
				selz.furnishings.update();
			});
		});
	},
	selfurn: function(kind, cb) {
		var bf = vu.build.furn;
		if (kind == "swarm")
			return bf.swaptions(cb);
		if (kind == "book")
			return bf.booktions(cb);
		if (kind == "carpentry")
			return bf.carp(cb);
		if (kind == "screen" || kind == "stream" || kind == "poster")
			return bf.part(null, kind, cb);
		var options = Object.values(vu.storage.get(kind) || {});
		if (kind == "portal") {
			options = [{
				kind: "portal",
				name: "flat",
				planeGeometry: true
			}].concat(options);
		}
		if (!options.length)
			return alert("add something on the item page!");
		CT.modal.choice({
			data: options,
			cb: function(thing) {
				bf.part(thing, kind, cb);
			}
		});
	},
	furnishings: function() {
		var vb = vu.build, bf = vb.furn, selz = vb.core.getSel();
		selz.furnishings = CT.dom.div();
		selz.furnishings.update = function() {
			CT.dom.setContent(selz.furnishings, [
				CT.dom.button("add", function() {
					CT.modal.choice({
						data: ["furnishing", "carpentry", "poster", "portal", "screen", "stream", "elemental", "speaker", "swarm", "book"],
						cb: bf.selfurn
					});
				}, "up20 right"),
				zero.core.current.room.objects.map(bf.furn)
			]);
		};
	}
};