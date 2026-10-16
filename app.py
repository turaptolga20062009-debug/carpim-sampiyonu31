from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

if __name__ == "__main__":
    # Local testing only. For public deployment, use a production server
    # and configure the hosting provider's port as required.
    app.run(host="0.0.0.0", port=5000, debug=True)
