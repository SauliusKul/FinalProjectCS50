from gevent import monkey
monkey.patch_all() 
import sqlite3
from flask import Flask, render_template, url_for, request, flash, redirect, session, get_flashed_messages
from flask_session import Session
from flask_socketio import SocketIO, send, emit
from werkzeug.security import generate_password_hash, check_password_hash

# Creates the flask app variable
app = Flask(__name__)

app.config["TEMPLATES_AUTO_RELOAD"] = True
app.config["SESSION_TYPE"] = "filesystem"
app.config["SESSION_PERMANENT"] = False
Session(app)

socketio = SocketIO(app,async_mode = 'gevent')

# Prints I'm connected when a socket is connected
@socketio.on("message")
def handle_my_custom_event(message):
    print("Received message: " + message["data"])


# Invites a player to a match of Connect 4 CURRENTLY NOT WORKING
@socketio.on("invite")
def sendRequest(challengedName):

    print("Challenged name: " + challengedName)
    
    db = sqlite3.connect("user_info.db")
    cursor = db.cursor()

    cursor.execute("SELECT * FROM users WHERE name = ?", [challengedName])

    nameFromDB = cursor.fetchall()

    if (len(nameFromDB) != 1):
        socketio.emit("enableHTML", "Such user does not exist")
        print("Works")


# Renders index page
@app.route("/")
def index():
    return render_template("index.html")


# Registers a user and records user information in the SQL database
# TODO: allow only alphanumeric chars in the input fields
@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        userInfo = []
        userInfo.append(request.form.get("username")) 

        db = sqlite3.connect("user_info.db")
        cursor = db.cursor()
        
        # Selects the user id if the user already exists in the database
        cursor.execute("SELECT id FROM users WHERE name = ?;", userInfo)

        # Checks if the database returned an id, flashes an error if yes
        if (not len(cursor.fetchall()) == 0):
            flash("Username is already taken", "info")
            return render_template("register.html")

        cursor.close()

        # Checks if the user provided any input in the username field
        if (userInfo[0] == ""):
            flash("Please provide a username >:(")
            return render_template("register.html")

        # Checks if the username is not longer than 100 chars
        if (len(userInfo[0]) > 100):
            flash("Username cannot exceed 100 characters >:(")
            return render_template("register.html")

        password = request.form.get("password")
        confirmPassword = request.form.get("confirmPassword")

        # Checks if the user provided a password
        if (password == ""):
            flash("Please provide a password >:c")
            return render_template("register.html")

        # Checks if the user provided password matches with the confirm password field
        if (not password == confirmPassword):
            flash("Passwords don't match :/")
            return render_template("register.html")

        # Appends hashed password and the number of games played (0) to the user info array
        userInfo.append(generate_password_hash(password))
        userInfo.append(0)

        cursor = db.cursor()

        # Inserts the user info into the database
        cursor.execute("INSERT INTO users (name, hashed_password, rank) VALUES (?, ?, ?)", userInfo)
        
        db.commit()
        cursor.close()

        flash("Registered sucessfully!")
        return redirect("/login")

    return render_template("register.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    # Clears any left over session data
    session.clear()

    if (request.method == "POST"):
        db = sqlite3.connect("user_info.db")

        userInfo = {"username":"",
                    "password":""}
        userInfo["username"] = (request.form.get("username"))
        
        # Checks if the username was provided
        if not userInfo["username"]:
            flash("Username was not provided")
            return render_template("login.html")

        cursor = db.cursor()
        
        # Selects the user with the provided username from the database
        cursor.execute("SELECT * FROM users WHERE name = ?", [userInfo["username"]])
        dbUserInfo = cursor.fetchall()
        cursor.close()

        # Checks if there is a user with the provided username
        if (not len(dbUserInfo) == 1):
            flash("This username does not exist!")
            return render_template("login.html")

        password = dbUserInfo[0][2]

        # Checks if the user provided a password and if the provided password matches the database 
        if (request.form.get("password") == "" or not check_password_hash(password, request.form.get("password"))):
            flash("Password/Username do not match")
            return render_template("login.html")
        
        flash("You have logged in successfully!")
        
        # Sets user_id to the username
        session["user_id"] = dbUserInfo[0][1]
    return render_template("login.html")

# Logs the user out
@app.route("/logout")
def logout():
    session.clear()
    flash("You have been logged out!")
    return render_template("login.html")

# Shows the leadearboard of games played for each user
@app.route("/leaderboard")
def leaderboard():
    db = sqlite3.connect("user_info.db")
    cursor = db.cursor()

    cursor.execute("SELECT name, rank FROM users ORDER BY rank DESC;")

    users = cursor.fetchall()

    return render_template("leaderboard.html", users=users)

# Updates the games played count after a user has played a game 
@app.route("/gameOver", methods=["GET", "POST"])
def gameOver():
    if request.method == "POST":

        db = sqlite3.connect("user_info.db")
        cursor = db.cursor()

        # If a user is logged in, increments his games played count by 1
        if ("user_id" in session and session["user_id"]):
            cursor.execute("UPDATE users SET rank = rank + 1 WHERE name = ?", [session["user_id"]])
            db.commit()
            cursor.close()

        # If a user is not logged in, and the user anonymous does not exist, a new user anonymous
        # is created and his games played count is set to 1
        elif (len(cursor.execute('SELECT * FROM users WHERE name = "anonymous";').fetchall()) == 0):
            cursor.execute("""INSERT INTO users(name, hashed_password, rank) 
                            VALUES ("anonymous", "ifYouUseThisUserYouAreABadPerson", 1)""")
            db.commit()
            cursor.close()
        
        # If a user is not logged in and an anonymous user already exists, his rank is incremented by 1
        else:
            cursor.execute('UPDATE users SET rank = rank + 1 WHERE name = "anonymous"')
            db.commit()
            cursor.close()

    return "0"

# TODO
@app.route ("/live_game", methods=["GET", "POST"])
def live_game():
    return render_template("live_game.html")

# Initializes flask socketIO app
if __name__ == "__main__":
    socketio.run(app)