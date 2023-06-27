"""Server for global echoes app."""
from flask import (Flask, render_template, request, flash, session, redirect,jsonify)
from model import connect_to_db, db, User, Location, Liked_location
import os 
import requests
import crud

from jinja2 import StrictUndefined

app = Flask(__name__)
app.secret_key = "dev"
app.jinja_env.undefined = StrictUndefined

API_KEY = os.environ['GOOGLE_MAPS_KEY']
FS_API_KEY = os.environ['FREESOUND_API_KEY']

@app.route('/', methods=['GET'])
def homepage():
    """View homepage"""
    logged_in_email = session.get("user_email")
    user = crud.get_user_by_email(logged_in_email)

    return render_template('homepage.html', google_key=API_KEY, user=user)

@app.route('/handle_saved_locations', methods=['GET'])
def data():
    logged_in_email = session.get("user_email")
    user = crud.get_user_by_email(logged_in_email)
    user_saved_locations = user.locations 

    user_data = [location.location_id for location in user_saved_locations]
    
    return jsonify(user_data)
    

@app.route('/create_account')
def create_account():
    """Create User Account"""

    return render_template('create_account.html')

@app.route('/create_account', methods=['POST'])
def handle_register_form():
    """Handle registration form."""

    email = request.form.get("email")
    password = request.form.get("password")
    first_name = request.form.get("first_name")
    last_name = request.form.get("last_name")
    user_name = request.form.get("user_name")
    user = crud.get_user_by_email(email)
    
    if user:
        flash("An account with that email already exsits. Please log in.")
    else:
        user = crud.create_user(email, password, user_name, first_name, last_name)
        db.session.add(user)
        db.session.commit()
        flash("Account created! Please log in.")

    return render_template('login.html')

@app.route('/login')
def create_user():
    """Login"""

    return render_template('login.html')

@app.route('/login', methods=["POST"])
def handle_login():
    email = request.form.get('email')
    password = request.form.get('password')
    user = crud.get_user_by_email(email)

    if user == None:
        flash("That email doesn't appear to be in our system")
    elif user.password != password:
        flash('Incorrect password')
    else:
        session['user_email'] = user.email
        flash("Welcome. Let's start your audial adventure.")
    return redirect('/user_profile')

@app.route('/user_profile', methods=["POST", "GET"])
def user_profile():
    """View User Profile"""

    logged_in_email = session.get("user_email")
    user = crud.get_user_by_email(logged_in_email)
    user_id = User.user_id
    liked_locations = user.locations
    # liked_locations = Liked_location.query.filter_by(user_id=user_id).all()
    print(liked_locations)


    return render_template('user_profile.html', user=user, liked_locations=liked_locations)


@app.route('/search-sounds', methods=['POST'])
def search_sounds():
    # Retrieve the latitude and longitude values from the request
    latitude = request.form.get('latitude')
    longitude = request.form.get('longitude')
    location_name = request.form.get('location_name')

    # Make a request to the Freesound API to search for sounds by location
    api_url = 'https://freesound.org/apiv2/search/text/'
    headers = {
        'Authorization': f'Token {FS_API_KEY}'
    }
    query = f'ambient background soundscape {location_name}'
    params = {
        'query': query,
        'filter': f'{{!geofilt sfield=geotag pt={latitude},{longitude} d=16}}',
        'fields': 'id,name,previews'
    }
    
    try:
        response = requests.get(api_url, headers=headers, params=params)
        response.raise_for_status()
        sounds = response.json()['results']
    except requests.exceptions.RequestException as e:
        return jsonify(error=str(e))

    # Extract relevant information from the API response
    sound_results = []
    for sound in sounds:
        sound_info = {
            'id': sound['id'],
            'name': sound['name'],
            'playable_link': sound['previews']['preview-hq-mp3']
        }
        sound_results.append(sound_info)

    # Return the sound results as JSON
    return jsonify(sound_results)

@app.route('/save_location', methods=['POST'])
def save_location():
    """Save a location for a user."""

    # Retrieve the user's email and location ID from the request
    email = session.get('user_email')
    location_id = request.form.get('location_id')
    location_name = request.form.get('location_name')
    latitude = request.form.get('location_lat')
    longitude = request.form.get('location_lng')

    # Retrieve the user and location objects
    user = crud.get_user_by_email(email)
    location = crud.get_location_by_id(location_id)

    # Check if the user and location exist
    if user is not None and location is not None:
        # Add the location to the user's locations list
        liked_location= crud.create_liked_location(user.user_id, location_id)
        db.session.add(liked_location)
        db.session.commit()
        flash("Location saved successfully.")
        return redirect('/user_profile')
    elif location is None and user is not None:
        new_location = crud.create_location(location_name, location_id, longitude, latitude)
        db.session.add(new_location)
        new_liked_location = crud.create_liked_location(user.user_id, location_id)
        db.session.add(new_liked_location)
        db.session.commit()
        flash("Location saved successfully.")
        return redirect('/user_profile')
    else:
        flash("Request failed. Please log in to save location.")
        return redirect('/login')
    
@app.route('/streetview', methods=['POST'])
def streetview():
    """View streetview"""
    latitude = request.form.get('location_lat')
    longitude = request.form.get('location_lng')
    location_name = request.form.get('location_name')
    print(latitude)

    return render_template('streetview.html', google_key=API_KEY, 
                           latitude=latitude, longitude=longitude, location_name=location_name)

@app.route('/logout')
def logout():
    """Log out a user."""
    if 'user_email' in session:
        session.pop('user_email')
        flash("You have been logged out.")
    else:
        flash("You are not logged in.")
    return redirect('/')

@app.route('/remove_location', methods=['POST'])
def remove_liked_location():
    """Remove Liked_location"""
    location_id = request.form.get('location_id')
    email = session.get('user_email')
    user = crud.get_user_by_email(email)
    location = crud.get_location_by_id(location_id)

        # Check if the user and location exist
    if user is not None and location is not None:
        # Find the Liked_location record and delete it
        liked_location = Liked_location.query.filter_by(user_id=user.user_id, location_id=location_id).first()
        if liked_location:
            db.session.delete(liked_location)
            db.session.commit()
            flash("Location removed successfully.")
        else:
            flash("Location not found in your favorites.")
    else:
        flash("Request failed. Please log in.")
    
    return redirect('/user_profile')
    

if __name__ == "__main__":
    connect_to_db(app)
    app.run(host="0.0.0.0", debug=True)