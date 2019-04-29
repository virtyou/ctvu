vu.media = {
	_: {
		types: {
			image: "img",
			background: "img"
		},
		bgz: ["background", "video", "iframe", "map", "panorama", "environment"],
		isMap: function(sel) {
			return ["map", "panorama"].indexOf(sel) != -1;
		},
		isResource: function(sel) {
			return ["image", "background", "audio", "video"].indexOf(sel) != -1;
		},
		fetch: function(variety, cb) {
			if (vu.media._.resources)
				return cb(vu.media._.resources[variety]);
			CT.db.get("resource", function(rez) {
				var rz = vu.media._.resources = {};
				rez.forEach(function(r) {
					if (!(r.variety in rz))
						rz[r.variety] = [];
					rz[r.variety].push(r);
				});
				cb(rz[variety]);
			});
		}
	},
	checkBoxGate: function(obj, sel, node) {
		var bgz = vu.media._.bgz;
		return CT.dom.checkboxAndLabel(sel, !!obj[sel], null, null, null, function(cbox) {
			if (cbox.checked && (bgz.indexOf(sel) != -1)) {
				for (var i = 0; i < bgz.length; i++) {
					if (obj[bgz[i]]) {
						cbox.checked = false;
						return;
					}
				}
			}
			CT.dom.showHide(node, cbox.checked, !cbox.checked);
			if (!cbox.checked)
				delete obj[sel];
		});
	},
	browse: function(variety, cb) {
		vu.media._.fetch(variety, function(resources) {
			if (!resources)
				return alert("nothing yet -- add the first one!");
			vu.core.choice({
				data: resources,
				cb: cb
			})
		});
	},
	viewer: function(node, opts, sel) {
		if (sel == "environment" || sel == "button") return;
		if (vu.media._.isMap(sel)) {
			node.classList.add("h100p");
			return zero.core.util[sel](opts.item, node);
		}
		CT.dom.setContent(node, CT.dom[vu.media._.types[sel] || sel]({
			src: opts.item,
			controls: true,
			className: "w1"
		}));
	},
	selector: function(rez, sel, cb, forceShow) {
		var isIframe = sel == "iframe",
			isMap = vu.media._.isMap(sel),
			opts = rez[sel] || {
				variety: sel,
				modelName: "resource"
			}, item, blurs = core.config.ctvu.blurs;

		// viewer (img/audio)
		var viewer = CT.dom.div(null, "mt5");
		if (opts.item)
			vu.media.viewer(viewer, opts, sel);

		// item
		if (sel == "button") {
			var oi = opts.item = opts.item || {};
			item = CT.dom.div(["trigger", "className", "css"].map(function(part) {
				return CT.dom.smartField(function(val) {
					oi[part] = val;
					cb();
				}, "w1 block mt5", null, oi[part], null, blurs[part], part == "css");
			}), !opts.name && "hidden");
		} else if (sel == "environment") {
			item = CT.dom.select(core.config.ctvu.loaders.environments,
				null, null, opts.item && opts.item.environment, null, function(val) {
					opts.item = {
						environment: val,
						lights: core.config.ctzero.room.lights
					};
					cb();
				});
			if (!opts.item)
				item.className = "hidden";
		} else if (isMap) {
			var oi = opts.item = opts.item || {};
			item = CT.dom.div(["lat", "lng"].map(function(axis, i) {
				return CT.dom.smartField(function(val) {
					oi[axis] = parseFloat(val);
					item.lastElementChild.style.display = "block";
					if (oi.lat && oi.lng) {
						vu.media.viewer(viewer, opts, sel);
						cb();
					}
				}, "w1 block mt5" + ((i && !oi[axis]) ? " hidden" : ""),
					null, oi[axis], null, blurs[axis]);
			}), !opts.item.lat && "hidden");
		} else if (!isIframe) { // standard -- drag drop
			item = CT.dom.div(CT.file.dragdrop(function(ctfile) {
				ctfile.upload("/_db", function(url) {
					opts.item = url;
					vu.media.viewer(viewer, opts, sel);
					cb();
				}, {
					action: "blob",
					key: opts.key,
					property: "item"
				});
			}), !opts.item && "hidden");
		}

		var update = function(resource) {
			if (!(sel in rez))
				rez[sel] = opts;
			if (resource && resource.key)
				opts.key = resource.key;
			if (isIframe) {
				opts.item = val;
				vu.media.viewer(viewer, opts, sel);
			} else
				CT.dom.show(item);
			cb();
		};

		// name (required)
		var name = CT.dom.smartField(function(val) {
			if (!val) return name.blur();
			opts.name = val;
			if (isIframe || isMap || ["button", "environment"].indexOf(sel) != -1)
				return update();
			CT.net.post({
				path: "/_db",
				params: {
					action: "edit",
					pw: core.config.ctvu.storage.apikey,
					data: opts
				},
				cb: update
			});
		}, null, null, opts.name, null, blurs[sel] || blurs.resource);

		// media selector popup
		var browse = CT.dom.img("/img/vu/browse.png", "right h30p up5", function() {
			vu.media.browse(sel, function(res) {
				rez[sel] = opts = res;
				name.value = opts.name;
				vu.media.viewer(viewer, opts, sel);
				cb();
			});
		});
		if (!vu.media._.isResource(sel))
			CT.dom.hide(browse);

		return CT.dom.div([browse, name, item, viewer], !forceShow && !rez[sel] && "hidden");
	}
};