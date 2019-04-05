vu.media = {
	_: {
		types: {
			image: "img",
			background: "img"
		}
	},
	selector: function(rez, sel, cb) {
		var isIframe = sel == "iframe",
			isMap = ["map", "panorama"].indexOf(sel) != -1,
			opts = rez[sel] || {
				variety: sel,
				modelName: "resource"
			}, item, blurs = core.config.ctvu.blurs;

		// viewer (img/audio)
		var viewer = CT.dom.div(null, "mt5");
		var setViewer = function() {
			if (sel == "environment") return;
			if (isMap) {
				viewer.classList.add("h100p");
				return zero.core.util[sel](opts.item, viewer);
			}
			CT.dom.setContent(viewer, CT.dom[vu.media._.types[sel] || sel]({
				src: opts.item,
				controls: true,
				className: "w1"
			}));
		};
		if (opts.item)
			setViewer();

		// item
		if (sel == "environment") {
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
						setViewer();
						cb();
					}
				}, "w1 block mt5" + ((i && !oi[axis]) ? " hidden" : ""),
					null, oi[axis], null, blurs[axis]);
			}), !opts.item.lat && "hidden");
		} else if (!isIframe) { // standard -- drag drop
			item = CT.dom.div(CT.file.dragdrop(function(ctfile) {
				ctfile.upload("/_db", function(url) {
					opts.item = url;
					setViewer();
					cb();
				}, {
					action: "blob",
					key: opts.key,
					property: "item"
				});
			}), !opts.item && "hidden");
		}

		// name (required)
		var name = CT.dom.smartField(function(val) {
			if (!val) return name.blur();
			opts.name = val;
			var medUp = function(resource) {
				if (!(sel in rez))
					rez[sel] = opts;
				if (resource && resource.key)
					opts.key = resource.key;
				if (isIframe) {
					opts.item = val;
					setViewer();
				} else
					CT.dom.show(item);
				cb();
			};
			if (isIframe || isMap || sel == "environment")
				return medUp();
			CT.net.post({
				path: "/_db",
				params: {
					action: "edit",
					pw: core.config.ctvu.storage.apikey,
					data: opts
				},
				cb: medUp
			});
		}, null, null, opts.name, null, blurs[sel] || blurs.resource);

		return CT.dom.div([name, item, viewer], !rez[sel] && "hidden");
	}
};