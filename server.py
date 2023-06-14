"""Server for global echoes app."""
from flask import (Flask, render_template, request, flash, session, redirect,jsonify)
from model import connect_to_db, db
import os 
import requests
import crud

from jinja2 import StrictUndefined

app = Flask(__name__)
app.secret_key = "dev"
app.jinja_env.undefined = StrictUndefined

API_KEY = os.environ['GOOGLE_MAPS_KEY']
FS_API_KEY = os.environ['FREESOUND_API_KEY']

@app.route('/')
def homepage():
    """View homepage"""

    return render_template('homepage.html', google_key=API_KEY)

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
    username = request.form.get("username")
    user = crud.get_user_by_email(email)
    
    if user:
        flash("An account with that email already exsits. Please log in.")
    else:
        user = crud.create_user(email, password, username, first_name, last_name)
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

    return render_template('user_profile.html', user=user)


@app.route('/search-sounds', methods=['POST'])
def search_sounds():
    # Retrieve the latitude and longitude values from the request
    latitude = request.form.get('latitude')
    longitude = request.form.get('longitude')

    # Make a request to the Freesound API to search for sounds by location
    api_url = 'https://freesound.org/apiv2/search/text/'
    headers = {
        'Authorization': f'Token {FS_API_KEY}'
    }
    params = {
        'query': 'ambient soundscape',
        'filter': f'{{!geofilt sfield=geotag pt={latitude},{longitude} d=60}}',
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


if __name__ == "__main__":
    connect_to_db(app)
    app.run(host="0.0.0.0", debug=True)