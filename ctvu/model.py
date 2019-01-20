from cantools import db

class Resource(db.TimeStampedBase):
	name = db.String()
	item = db.Binary()