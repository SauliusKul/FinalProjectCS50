from flask import Flask, render_template

app = Flask(__name__)
app.config["TEMPLATES_AUTO_RELOAD"] = True


@app.route("/")
def hello_world():
    a = 1 + 3
    hi = "hiya"
    return render_template("index.html")