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
		CT.dom.setContent("ctmain", [
			CT.dom.div("games", "biggest centered"),
			games.map(function(g) {
				return CT.dom.link([
					CT.dom.div(g.name, "big"),
					g.description
				], null, "/vu/adventure.html#" + g.key,
					"bordered padded margined round inline-block hoverglow");
			})
		]);
	}, null, null, null, {
		live: true
	});
});