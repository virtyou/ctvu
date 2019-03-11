from cantools.web import respond, succeed, cgi_get, read_file
from ctone.spawners import person, thing, asset, room
from model import db

def response():
	action = cgi_get("action", choices=["person", "import", "thing", "asset", "room"])
	if action == "asset":
		succeed(asset(cgi_get("name"),
			variety=cgi_get("variety"),
			owner=cgi_get("owner"),
			data=read_file(cgi_get("data"))).get().data())
	if action == "room":
		succeed(room(cgi_get("name"), cgi_get("owner"),
			cgi_get("environment", required=False),
			cgi_get("cameras", default=[]),
			cgi_get("opts", default={})).data())
	if action == "thing":
		succeed(thing(cgi_get("data"), cgi_get("owner")).data())
	if action == "person":
		succeed(person(cgi_get("name"), cgi_get("owner")).data())
	if action == "import":
		pfrom = db.get(cgi_get("from"))
		pto = db.get(cgi_get("to"))
		pfbod = pfrom.body.get()
		ptbod = pto.body.get()
		for item in ["vibe", "gestures", "dances", "responses"]:
			setattr(pto, item, getattr(pfrom, item))
		ptbod.morphs = pfbod.morphs
		db.put_multi([pto, ptbod])

respond(response)