import sqlite3
import json
from flask import Flask, render_template, url_for, request, flash, redirect, session, get_flashed_messages
from flask_session import Session
from flask_socketio import SocketIO, send, emit
from werkzeug.security import generate_password_hash, check_password_hash
import eventlet 
eventlet.monkey_patch() 

app = Flask(__name__)
app.config["TEMPLATES_AUTO_RELOAD"] = True

app.config["SESSION_TYPE"] = "filesystem"
app.config["SESSION_PERMANENT"] = False
Session(app)

socketio = SocketIO(app,async_mode = 'eventlet')
# socketio = SocketIO(app)



@socketio.on("message")
def handle_my_custom_event(message):
    print("Received message: " + message["data"])

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

@app.route("/")
def index():
    return render_template("index.html")

# allow only alphanumeric
@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        userInfo = []
        userInfo.append(request.form.get("username")) 

        db = sqlite3.connect("user_info.db")
        cursor = db.cursor()
        cursor.execute("SELECT id FROM users WHERE name = ?;", userInfo)

        if (userInfo[0] == ""):
            flash("Please provide a username >:(")
            return render_template("register.html")
    
        if (not len(cursor.fetchall()) == 0):
            flash("Username is already taken", "info")
            return render_template("register.html")

        if (len(userInfo[0]) > 100):
            flash("Username cannot exceed 100 characters >:(")
            return render_template("register.html")

        cursor.close()

        password = request.form.get("password")
        confirmPassword = request.form.get("confirmPassword")

        if (password == ""):
            flash("Please provide a password >:c")
            return render_template("register.html")

        if (not password == confirmPassword):
            flash("Passwords don't match :/")
            return render_template("register.html")

        
        userInfo.append(generate_password_hash(password))
        userInfo.append(0)

        cursor = db.cursor()

        cursor.execute("INSERT INTO users (name, hashed_password, rank) VALUES (?, ?, ?)", userInfo)
        
        db.commit()
        cursor.close()

        flash("Registered sucessfully!")
        return redirect("/login")

    return render_template("register.html")

@app.route("/login", methods=["GET", "POST"])
def login():

    session.clear()

    if (request.method == "POST"):
        db = sqlite3.connect("user_info.db")

        userInfo = {"username":"",
                    "password":""}
        userInfo["username"] = (request.form.get("username"))
        
        if not userInfo["username"]:
            flash("Username was not provided")
            return render_template("login.html")

        cursor = db.cursor()
        cursor.execute("SELECT * FROM users WHERE name = ?", [userInfo["username"]])
        dbUserInfo = cursor.fetchall()
        cursor.close()

        if (not len(dbUserInfo) == 1):
            flash("This username does not exist!")
            return render_template("login.html")

        password = dbUserInfo[0][2]

        if (request.form.get("password") == "" or not check_password_hash(password, request.form.get("password"))):
            flash("Password/Username do not match")
            return render_template("login.html")
        
        flash("You have logged in successfully!")
        session["user_id"] = dbUserInfo[0][1]
    return render_template("login.html")

@app.route("/logout")
def logout():
    session.clear()
    flash("You have been logged out!")
    return render_template("login.html")

@app.route("/leaderboard")
def leaderboard():
    db = sqlite3.connect("user_info.db")
    cursor = db.cursor()

    cursor.execute("SELECT name, rank FROM users ORDER BY rank DESC;")

    users = cursor.fetchall()

    return render_template("leaderboard.html", users=users)

@app.route("/gameOver", methods=["GET", "POST"])
def gameOver():
    if request.method == "POST":

        db = sqlite3.connect("user_info.db")
        cursor = db.cursor()

        if ("user_id" in session and session["user_id"]):
            cursor.execute("UPDATE users SET rank = rank + 1 WHERE name = ?", [session["user_id"]])
            db.commit()
            cursor.close()

        elif (len(cursor.execute('SELECT * FROM users WHERE name = "anonymous";').fetchall()) == 0):
            cursor.execute("""INSERT INTO users(name, hashed_password, rank) 
                            VALUES ("anonymous", "ifYouUseThisUserYouAreABadPerson", 1)""")
            db.commit()
            cursor.close()
        
        else:
            cursor.execute('UPDATE users SET rank = rank + 1 WHERE name = "anonymous"')
            db.commit()
            cursor.close()

    return "0"

@app.route ("/live_game", methods=["GET", "POST"])
def live_game():
    return render_template("live_game.html")


if __name__ == "__main__":
    socketio.run(app)