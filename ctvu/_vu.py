from cantools.web import respond, succeed, cgi_get
from ctone.spawners import person
from model import db

def response():
	action = cgi_get("action", choices=["person"])
	if action == "person":
		succeed(person(cgi_get("name"), cgi_get("owner")).data())

respond(response)