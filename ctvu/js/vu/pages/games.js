CT.require("CT.align");
CT.require("CT.data");
CT.require("CT.db");
CT.require("CT.dom");
CT.require("CT.layout");
CT.require("CT.modal");
CT.require("CT.parse");
CT.require("CT.storage");
CT.require("CT.trans");
CT.require("core");
CT.require("user.core");

CT.onload(function() {
	CT.initCore();
	CT.db.get("game", function(games) {
		var nclass = "bordered padded margined round inline-block hoverglow", cont = [
			CT.dom.div("games", "biggest centered"),
			games.map(function(g) {
				return CT.dom.link([
					CT.dom.div(g.name, "big"),
					g.description
				], null, "/vu/adventure.html#" + g.key, nclass);
			})
		], bclass = nclass + " big", gcfg = core.config.ctvu.builders.games,
			dcfg = gcfg && gcfg.demos;
		if (dcfg && dcfg.length) {
			cont.push(CT.dom.div("demos", "biggest centered"));
			cont.push(CT.dom.div(dcfg.map(d => CT.dom.link(d.name,
				null, d.link, bclass)), "centered"));
		}
		CT.dom.setMain(cont);
	}, null, null, null, {
		live: true
	});
});