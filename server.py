"""Server for global echoes app."""
from flask import (Flask, render_template, request, flash, session, redirect)
from model import connect_to_db, db
import os 
# import crud

from jinja2 import StrictUndefined

app = Flask(__name__)
app.secret_key = "dev"
app.jinja_env.undefined = StrictUndefined

API_KEY = os.environ['GOOGLE_MAPS_KEY']

@app.route('/')
def homepage():
    """View homepage"""

    return render_template('homepage.html', google_key=API_KEY)

@app.route('/searchresults')
def get_sounds():
    """Search for sounds on Freesound"""

    api_key = "FREESOUND_API_KEY"
    endpoint = "https://freesound.org/apiv2/search/text/"
    max_distance = 80

    geotag_filter = f"{{!geofilt sfield=geotag pt={latitude},{longitude} d={max_distance}}}"
    url = f"{endpoint}?filter={geotag_filter}&token={api_key}"

# @app.route('/login', methods=['POST'])
# def login(): 
#     email = request.form.get('email')
#     password = request.form.get('password')

#     user = crud.get_user_by_email(email)
#     if user == None or user.password != password:
#         flash('THAT EMAIL & PASSWORD COMBO IS INCORRECT')
#     else: 
#         session['user_email'] = user.email
#         flash('WELCOME')
#     return redirect('/user_profile')

# @app.route("/login", methods=["POST"])
# def register_user():
#     """Create a new user."""
#     email = request.form.get('email')
#     password = request.form.get('password')

#     user = crud.get_user_by_email(email)

#     if user: 
#         flash('THAT EMAIL IS ALREADY IN USE. TRYING SIGNING IN.')
#     else:  
#         new_user = crud.create_user(email, password)
#         db.session.add(new_user)
#         db.session.commit()
#         flash("Account created! Please log in.")

#     return redirect("/")

# @app.route('/user_profile')

# @app.route('/search_results')

# @app.route('/location/<location_id>')
# # """streetview of specific location"""

if __name__ == "__main__":
    connect_to_db(app)
    app.run(host="0.0.0.0", debug=True)