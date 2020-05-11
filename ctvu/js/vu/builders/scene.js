vu.builders.scene = {
	_: {
		selectors: {},
		menus: {
			info: "top",
			scripts: "topleft",
			steps: "bottomleft",
			actors: "topright",
			props: "bottomright"
		},
		load: function(scene) {
			var _ = vu.builders.scene._, selz = _.selectors,
				sname = CT.dom.span();
			CT.dom.setContent(selz.info, [
				CT.dom.div(scene.name, "bigger"),
				scene.description,
				"room: " + scene.room.name,
				CT.dom.span("script:"),
				CT.dom.pad(),
				sname
			]);
			CT.dom.setContent(selz.actors, scene.actors.map(function(a) {
				return a.name;
			}));

			selz.steps.update = function() {

			};
			selz.steps.refresh = function(sname) {
				CT.dom.setContent(selz.steps, scene.scripts[sname].map(function(s) {
					return JSON.stringify(s);
				}));
			};

			vu.core.fieldList(selz.scripts, Object.keys(scene.scripts), null, function(v) {
				var f = CT.dom.field(null, v);
				if (v) {
					f._trigger = v;
					f.onfocus = function() {
						sname.innerHTML = f._trigger;
						selz.steps.refresh(f._trigger);
					};
					f.onkeyup = function() {
						if (f.value) {
							f.value = f.value.toLowerCase();
							scene.scripts[f.value] = scene.scripts[f._trigger];
							delete scene.scripts[f._trigger];
							sname.innerHTML = f._trigger = f.value;
							vu.storage.edit({
								key: scene.key,
								scripts: scene.scripts
							});
						} else
							f.value = f._trigger; // meh
					};
				} else {
					f.onkeyup = function() { f.value = f.value.toLowerCase() };
				}
				return f;
			}, function(iput) {
				var key = iput.value;
				if (key in scene.scripts) return; // already exists...
				scene.scripts[key] = [];
				setTimeout(function() {
					iput.focus();
				});
			}, function(val) {
				delete scene.scripts[val];
				vu.storage.edit({
					key: scene.key,
					scripts: scene.scripts
				});
			});
		},
		setup: function() {
			var skey = location.hash.slice(1),
				_ = vu.builders.scene._, selz = _.selectors;
			if (!skey)
				return alert("no scene specified!");
			selz.info = CT.dom.div();
			selz.scripts = CT.dom.div();
			selz.steps = CT.dom.div();
			selz.actors = CT.dom.div();
			selz.props = CT.dom.div();
			CT.db.one(skey, _.load, "json");
		}
	},
	menus: function() {
		var section, _ = vu.builders.scene._, selz = _.selectors;
		_.setup();
		for (section in _.menus) {
			selz[section].modal = vu.core.menu(section,
				_.menus[section], selz[section]);
			selz[section].modal.show("ctmain");
		}
	}
};