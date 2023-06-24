"""Models for golbal echoes app."""

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class User(db.Model):
    """A user."""

    __tablename__ = "users"

    user_id = db.Column(db.Integer,
                        autoincrement=True,
                        primary_key=True)
    email = db.Column(db.String, unique=True)
    password = db.Column(db.String)
    user_name = db.Column(db.String, unique=True)
    first_name = db.Column(db.String)
    last_name = db.Column(db.String)

    locations = db.relationship("Location", secondary="liked_locations", back_populates="users")

    def __repr__(self):
        return f'<User user_id={self.user_id} email={self.email}>'
    
class Location(db.Model):
    """A location."""

    __tablename__ = "locations"

    location_id = db.Column(db.String,
                        primary_key=True)
    location_name = db.Column(db.String)
    longitude = db.Column(db.Numeric(12, 9))
    latitude = db.Column(db.Numeric(12, 9))

    users = db.relationship("User", secondary="liked_locations", back_populates="locations")

    def __repr__(self):
        return f'<Location location_id={self.location_id} location_name={self.location_name}>'
    
class Liked_location(db.Model):
    """A user-liked location."""

    __tablename__ = "liked_locations"

    id = db.Column(db.Integer,
                        autoincrement=True,
                        primary_key=True)
    location_id = db.Column(db.String, db.ForeignKey("locations.location_id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable=False)

    def __repr__(self):
        return f'<Liked_location id={self.id}>'


def connect_to_db(flask_app, db_uri="postgresql:///soundscape", echo=True):
    flask_app.config["SQLALCHEMY_DATABASE_URI"] = db_uri
    flask_app.config["SQLALCHEMY_ECHO"] = echo
    flask_app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.app = flask_app
    db.init_app(flask_app)

    print("Connected to the db!")


if __name__ == "__main__":
    from server import app

    connect_to_db(app)   