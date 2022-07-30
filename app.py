import sqlite3
from flask import Flask, render_template, url_for, request, flash
from flask_session import Session
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.config["TEMPLATES_AUTO_RELOAD"] = True

app.config["SESSION_TYPE"] = "filesystem"
app.config["SESSION_PERMANENT"] = False
Session(app)

@app.route("/")
def hello_world():
    return render_template("index.html")

@app.route("/login")
def login():
    return render_template("login.html")

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

        # connection = sqlite3.connect("aquarium.db")
        # cursor = connection.cursor()
        # cursor.execute("CREATE TABLE fish (name TEXT, species TEXT, tank_number INTEGER)")
        # cursor.execute("INSERT INTO fish VALUES ('Sammy', 'shark', 1)")
        # cursor.execute("SELECT * FROM fish")
        # print(cursor.fetchall())


        flash("Registered sucessfully!", "info")

    return render_template("register.html")

@app.route("/leaderboard")
def leaderboard():
    return render_template("leaderboard.html")