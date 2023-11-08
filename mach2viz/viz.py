from flask import Flask  # Import flask

app = Flask(__name__, static_url_path='/mach2-viz/')  # Setup the flask app by creating an instance of Flask

@app.route('/')
def home():  # At the same home function as before
    return app.send_static_file('index.html')  # Return index.html from the static folder

if __name__ == '__main__':  # If the script that was run is this script (we have not been imported)
    app.run()  # Start the server