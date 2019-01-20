from cantools import db

class Resource(db.TimeStampedBase):
	variety = db.String(choices=["image", "background", "sound"])
	name = db.String()
	item = db.Binary(unique=True)