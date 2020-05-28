vu.menu.Game = CT.Class({
	CLASSNAME: "vu.menu.Game",
	_: {
		upper: function(variety, name) {
			var scene = zero.core.current.scene;
			this.log("upper():", variety, name);
			if (name in scene.opts.scripts)
				scene.script(name);
		},
		convo: function(person) {
			var n = CT.dom.div();
			vu.controls.setTriggers(n, this._.upper, person);
			return n;
		},
		info: function(name, info) {
			var _ = this._, zc = zero.core;
			if (_.infomenu)
				_.infomenu.set([name, info]);
			else {
				_.infomenu = vu.core.menu(name, "bottom", info, null, function() {
					_.infomenu.hide();
					zc.camera.follow(zc.current.person.body);
				});
			}
			return _.infomenu;
		}
	},
	info: function(name, info, thing) {
		this._.info(name, info).show();
		zero.core.camera.follow(thing);
	},
	item: function(item) {
		this.info(item.name, item.opts.description, item);
	},
	prop: function(prop) {
		this.info(prop.name,
			this.opts.props[prop.name].description, prop);
	},
	person: function(person) {
		var zcc = zero.core.current,
			aopts = this.state.actors[person.name];
		this.info(person.name, person == zcc.person
			? "it's you!" : [
				aopts.description, this._.convo(person)
			], person.body);
	},
	init: function(opts) {
		this.opts = opts = CT.merge(opts, {
			// ???
		});
		this.state = opts.state;
	}
});