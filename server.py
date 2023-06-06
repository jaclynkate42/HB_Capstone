"""Server for global echoes app."""
from flask import (Flask, render_template, request, flash, session, redirect)
from model import connect_to_db, db
# import crud

from jinja2 import StrictUndefined

app = Flask(__name__)
app.secret_key = "dev"
app.jinja_env.undefined = StrictUndefined


# @app.route('/')
# def homepage():
#     """View homepage"""

#     return render_template('homeage.html')

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