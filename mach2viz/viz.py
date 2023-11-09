'''
@author Vikram Ramavarapu

Server side for starting viz via commandline argument
'''

import json

from flask import Flask, jsonify  # Import flask


JSON_FILE = '/Users/vikram/Documents/Research/El-Kebir/mach2-viz/mach2viz-client/src/samples/A1/A1.json'

# Setup the flask app by creating an instance of Flask
app = Flask(__name__, static_url_path='/mach2-viz/')

@app.route('/')
def home():
    ''' Home route to open the page '''

    return app.send_static_file('index.html')  # Return index.html from the static folder

@app.route('/json')
def send_json():
    ''' API Gateway to send json data '''

    # Open the JSON file
    with open(JSON_FILE, 'r', encoding='utf-8') as file:
        # Load the JSON data
        json_data = json.load(file)

    return jsonify({"data": json.dumps(json_data)})

if __name__ == '__main__':  # If the script that was run is this script (we have not been imported)
    app.run()  # Start the server
