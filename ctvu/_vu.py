from cantools.web import respond, succeed, cgi_get
from ctone.spawners import person
from model import db

def response():
	action = cgi_get("action", choices=["person", "import"])
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