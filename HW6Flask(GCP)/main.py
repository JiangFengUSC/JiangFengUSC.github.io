import json
import requests
from flask import Flask, request, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder='static')
CORS(app)

url = "https://api.tomorrow.io/v4/timelines"


@app.route('/')
def index():
    return send_from_directory(app.static_folder, "weather.html")


# @app.route('/')
# def hello_world():
#     return 'Hello World!'


# https://weather-327406.wl.r.appspot.com/weather?latitude=34.0522&longitude=-118.2437
@app.route('/weather')
def localWeather():
    latitude = request.args.get('latitude')
    longitude = request.args.get('longitude')
    timeLineJSON = getTimeLineJSON(latitude, longitude)
    return json.dumps(timeLineJSON)


def getTimeLineJSON(latitude, longitude):
    #
    # payload = {
    #     "fields": ["temperature", "temperatureApparent", "temperatureMin", "temperatureMax", "windSpeed",
    #                "windDirection", "humidity", "pressureSeaLevel", "uvIndex", "weatherCode",
    #                "precipitationProbability", "precipitationType", "sunriseTime", "sunsetTime", "visibility",
    #                "moonPhase", "cloudCover"],
    #     "units": "imperial",
    #     "timesteps": ["1d", "1h"],
    #     "location": [float(latitude), float(longitude)],
    #     "timezone": "America/Los_Angeles"
    # }
    #
    # headers = {
    #     "Accept": "application/json",
    #     "Content-Type": "application/json"
    # }
    #
    # response = requests.request("POST", url, json=payload, headers=headers, params=querystring)
    # print(response.text)
    # weatherJson = response.json()
    querystring = {"location": str(latitude) + ", " + str(longitude),
                   "fields": ["temperature", "temperatureMin", "temperatureMax", "windSpeed",
                              "windDirection", "humidity", "pressureSeaLevel", "uvIndex", "weatherCode",
                              "precipitationProbability", "precipitationType", "sunriseTime", "sunsetTime",
                              "visibility", "cloudCover"],
                   "units": "imperial",
                   "timesteps": ["1d", "1h"],
                   "timezone": "America/Los_Angeles",
                   "apikey": "TsI9kmcAz5eRNtRNMyJgb3tUDsIx0d6G"
                   }
    headers = {"Accept": "application/json"}

    response = requests.request("GET", url, headers=headers, params=querystring)
    weatherJSON = json.loads(response.text)
    timeLineJSON = weatherJSON["data"]["timelines"]
    print(timeLineJSON)
    return timeLineJSON


if __name__ == '__main__':
    app.run()

# DONE with backend
