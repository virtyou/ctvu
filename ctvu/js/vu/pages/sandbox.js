CT.require("CT.align");
CT.require("CT.data");
CT.require("CT.db");
CT.require("CT.dom");
CT.require("CT.key");
CT.require("CT.modal");
CT.require("CT.parse");
CT.require("CT.storage");
CT.require("CT.trans");
CT.require("core");
CT.require("user.core");
CT.require("zero.core");
CT.require("vu.core");

CT.onload(function() {
	var h = location.hash.slice(1);
	if (!h) return document.body.appendChild(CT.dom.div("no module specified"));

	CT.require("sandbox." + h, true);
	// scriptImport probs wouldn't work in closure (prod) mode
//	CT.scriptImport("sandbox." + h);
});