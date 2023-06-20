"""CRUD operations."""

from model import db, User, Location, Liked_location, connect_to_db

def create_user(email, password, user_name, first_name, last_name):
    """Create and return a new user."""

    user = User(email=email, password=password, user_name=user_name, first_name=first_name, last_name=last_name)

    return user

def get_user_by_email(email):
    """Return a user by email."""

    return User.query.filter(User.email == email).first()

def create_location(location_name, longitude, latitude):
    """Create and return a new location."""

    location = Location(location_name=location_name, longitude=longitude, latitude=latitude)
    db.session.add(location)
    db.session.commit()

    return location

def get_location_by_id(location_id):
    """Return a location by its ID."""

    return Location.query.get(location_id)

# def create_liked_location(user_id, location_id):
#     """Create a new entry in the liked_locations table."""
#     liked_location = Liked_location(user_id=user_id, location_id=location_id)
#     return liked_location

# def get_liked_locations_by_user(user_id):
#     """Get the liked locations for a given user."""
#     liked_locations = Liked_location.query.filter_by(user_id=user_id).all()
#     return liked_locations

if __name__ == '__main__':
    from server import app
    connect_to_db(app)