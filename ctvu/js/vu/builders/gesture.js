vu.builders.Gesture = CT.Class({
	CLASSNAME: "vu.builders.Gesture",
	constraints: function(side, sub, part, axis) {
		return zero.core.current.person.body.torso[sub +
			"s"][side].aspects[part + "_" + axis].opts;
	},
	setDance: function(dname) {
		var _ = this._, selz = _.selectors,
			person = zero.core.current.person,
			dopts = person.opts.dances,
			per = this.persist;
		selz.steps.update = function() {
			dopts[dname].steps = selz.steps.fields.value();
			per({ dances: dopts });
		};
		vu.core.fieldList(selz.steps, dopts[dname].steps);
		CT.dom.setContent(selz.step, dname);
	},
	loadExtras: function() {
		var _ = this._, selz = _.selectors, curDance,
			person = zero.core.current.person;
		var dbutt = CT.dom.button("dance", function() {
			if (person.activeDance)
				person.undance();
			else
				person.dance(curDance);
			dbutt.innerHTML = person.activeDance ? "undance" : "dance";
		});
		CT.dom.setContent(selz.dances_button, dbutt);
		this.selector("dances", function(v) {
			curDance = v;
		});
		CT.dom.addContent(selz.dances, [selz.step, "Steps", selz.steps]);
	}
}, vu.menu.Body);

vu.builders.gesture = {
	menus: function() {
		vu.builders.gesture = new vu.builders.Gesture({
			main: "gestures",
			secondary: "dances",
			subs: {
				"step": CT.dom.div(null, "right"),
				"steps": CT.dom.div()
			}
		});
	}
};