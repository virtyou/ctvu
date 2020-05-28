vu.menu.Game = CT.Class({
	CLASSNAME: "vu.menu.Game",
	_: {
		selectors: {},
		menus: {
			story: "bottomleft"
		},
		collapse: function(section) {
			var _ = this._, selz = _.selectors,
				sel = selz[section];
			return function() {
				sel._collapsed = !sel._collapsed;
				sel.modal.node.classList[sel._collapsed ? "add" : "remove"]("collapsed");
			};
		},
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
		basic: function(name, side, info, cb) {
			return vu.core.menu(name, side, info,
				null, cb || this._.collapse(name));
		},
		info: function(name, info) {
			var _ = this._, zc = zero.core;
			if (_.infomenu)
				_.infomenu.set([name, info]);
			else {
				_.infomenu = _.basic(name, "bottom", info, function() {
					_.infomenu.hide();
					zc.camera.follow(zc.current.person.body);
				});
			}
			return _.infomenu;
		},
		setup: function() {
			this._.selectors.story = CT.dom.div(null, "kidvp");
		}
	},
	story: function() {
		var _ = this._, selz = _.selectors,
			mod = selz.story.modal, snode = mod.node;
		CT.dom.setContent(selz.story, this.state.story);
		mod.show();
		if (snode.classList.contains("collapsed"))
			snode.classList.remove("collapsed");
		// TODO: scroll to bottom!
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
		var _ = this._, s, selz = _.selectors;
		this.opts = opts = CT.merge(opts, {
			// ???
		});
		this.state = opts.state;
		_.setup();
		for (s in _.menus)
			selz[s].modal = _.basic(s, _.menus[s], selz[s]);
	}
});