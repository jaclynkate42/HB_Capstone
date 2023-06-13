"""Server for global echoes app."""
from flask import (Flask, render_template, request, flash, session, redirect,jsonify)
from model import connect_to_db, db
import os 
import requests
# import crud

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
def create_user():
    """Create User Account"""

    return render_template('create_account.html')

@app.route('/login')
def create_user():
    """Login"""

    return render_template('login.html')

@app.route('/user_profile')
def user_profile():
    """View User Profile"""

    return render_template('user_profile.html')

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
        'filter': f'{{!geofilt sfield=geotag pt={latitude},{longitude} d=60}}'
        # 'fields': 'id,name'
    }
    print ('starting request')
    try:
        response = requests.get(api_url, headers=headers, params=params)
        response.raise_for_status()
        sounds = response.json()['results']
    except requests.exceptions.RequestException as e:
        return jsonify(error=str(e))
    print

    # Extract relevant information from the API response
    sound_results = []
    for sound in sounds:
        sound_info = {
            'id': sound['id'],
            'name': sound['name']
        }
        sound_results.append(sound_info)

    # Return the sound results as JSON
    return jsonify(sound_results)


if __name__ == "__main__":
    connect_to_db(app)
    app.run(host="0.0.0.0", debug=True)