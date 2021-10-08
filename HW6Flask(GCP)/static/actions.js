const hostURL = "https://weather-327406.wl.r.appspot.com/weather"
// const hostURL = "http://127.0.0.1:5000/weather"

const ipInfoToken = "3e13ea62221de6"
const geoCodingToken = "AIzaSyBeCDTSwYNwH3bEingxqPjOA1wk9ynWLvk";
let timeLine;
let weekday = new Array(7);
weekday[0] = "Sunday";
weekday[1] = "Monday";
weekday[2] = "Tuesday";
weekday[3] = "Wednesday";
weekday[4] = "Thursday";
weekday[5] = "Friday";
weekday[6] = "Saturday";
let month = new Array(12);
month[0] = "Jan";
month[1] = "Feb";
month[2] = "Mar";
month[3] = "Apr";
month[4] = "May";
month[5] = "Jun";
month[6] = "Jul";
month[7] = "Aug";
month[8] = "Sep";
month[9] = "Oct";
month[10] = "Nov";
month[11] = "Dec";

function toggleInputAbility(isDisabled){
    let street = document.getElementById("street")
    let city = document.getElementById("city")
    let state = document.getElementById("state")
    street.disabled = isDisabled
    city.disabled = isDisabled
    state.disabled = isDisabled
    if(isDisabled){
        street.value = ""
        city.value = ""
        state.value = ""
    }
}

async function submitAction() {
    clearBoxes()
    let latitude, longitude
    let formattedLocation
    // let timeLineJSON
    let fetchGeo
    let checkBox = document.getElementById("autoLocation")
    if (checkBox.checked) {
        // ipInfo to get coordination
        let url = "https://ipinfo.io/?token=" + ipInfoToken
        fetchGeo = fetch(url)
            .then(response => response.json())
            .then(data => {
                [latitude, longitude] = data.loc.split(",")
                formattedLocation = data.city + ", " + data.region + ", " + data.country
                console.log("coordination from ipinfo.io:")
                console.log(latitude)
                console.log(longitude)
                console.log(formattedLocation)
            })
    } else {
        // google map to get coordination
        let street = document.getElementById("street").value
        let city = document.getElementById("city").value
        let state = document.getElementById("state").value
        // https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=YOUR_API_KEY
        let url = encodeURI("https://maps.googleapis.com/maps/api/geocode/json?address=" + street + city + state + "&key=" + geoCodingToken + "&language=en_US")
        fetchGeo = fetch(url)
            .then(response => response.json())
            .then(data => {
                let results = data.results
                if (results.length !== 0) {
                    latitude = results[0].geometry.location.lat
                    longitude = results[0].geometry.location.lng
                    formattedLocation = results[0].formatted_address
                    console.log("coordination from google geocode:")
                    console.log(latitude)
                    console.log(longitude)
                    console.log(formattedLocation)
                }
            })

    }

    async function waitTimeLine() {
        return await fetchGeo.then(() => {
            if (typeof latitude === 'undefined' || typeof longitude === 'undefined') {
                console.log("show 'No Records have been found' box")
                return null;
            } else {
                // send to backend and call weather api
                let url = hostURL + "?latitude=" + latitude + "&longitude=" + longitude
                console.log("Check URL to backend")
                console.log(url)
                return fetch(url).then(response => response.json())
            }
        })
    }

    timeLine = await waitTimeLine()
    console.log("timeLine after test()")
    console.log(timeLine)
    if(timeLine){
        // show two box
        displayTodayBox(formattedLocation)
        displayDailyBox()
        // displayDetailBox()
        // displayChart1()
        // displayChart2()

    }else {
        console.log("set no record box as visible")
        let noRecBox = document.getElementById("noRecordBox")
        noRecBox.style.display = 'block'
    }

}

function clickArrowDown(){
    displayChart1()
    displayChart2()
    let arrowDown = document.getElementById("arrowDown")
    arrowDown.style.display = 'none'
    let arrowUp = document.getElementById("arrowUp")
    arrowUp.style.display = 'block'
    arrowUp.scrollIntoView()

}

function clickArrowUp(){
    let chart1 = document.getElementById("chart1Box")
    chart1.style.display = 'none'
    let chart2 = document.getElementById("chart2Box")
    chart2.style.display = 'none'
    let arrowDown = document.getElementById("arrowDown")
    arrowDown.style.display = 'block'
    let arrowUp = document.getElementById("arrowUp")
    arrowUp.style.display = 'none'
}

function displayDetailBox(){
    let index = parseInt(this.id)
    let detailJSON = timeLine[0].intervals[index]
    console.log("detailJSON")
    console.log(detailJSON)
    let detailBox = document.getElementById("detailBox")
    let detailDate = document.getElementById("detailDate")
    let detailTemp = document.getElementById("detailTemp")
    let detailWeatherCode = document.getElementById("detailWeatherCode")
    let detailIcon = document.getElementById("detailIcon")
    let precipitation = document.getElementById("precipitation")
    let rainChance = document.getElementById("rainChance")
    let windSpeed = document.getElementById("windSpeed")
    let humidity = document.getElementById("humidity")
    let visibility = document.getElementById("visibility")
    let sun = document.getElementById("sun")

    let curDate = new Date(detailJSON.startTime)
    detailDate.innerHTML = weekday[curDate.getDay()] + ", " + curDate.getDate() + " " + month[curDate.getMonth()] + " " + curDate.getFullYear()
    detailTemp.innerHTML = detailJSON.values.temperatureMax+"°F/"+detailJSON.values.temperatureMin+"°F"

    let [weatherName, iconURL] = getWeatherNameAndImageSrc(detailJSON.values.weatherCode)
    detailWeatherCode.innerHTML = weatherName
    detailIcon.setAttribute("src", iconURL)
    precipitation.innerHTML = getPrecipitationType(detailJSON.values.precipitationType)
    rainChance.innerHTML = detailJSON.values.precipitationProbability + "%"
    windSpeed.innerHTML = detailJSON.values.windSpeed + " mpb"
    humidity.innerHTML = detailJSON.values.humidity + "%"
    visibility.innerHTML = detailJSON.values.visibility + " mi"
    let sunRiseTime = new Date(detailJSON.values.sunriseTime)
    let sunSetTime = new Date(detailJSON.values.sunsetTime);
    let sunString = sunRiseTime.toLocaleString('en-US', { hour: 'numeric', hour12: true }) + "/" + sunSetTime.toLocaleString('en-US', { hour: 'numeric', hour12: true });
    sun.innerHTML = sunString

    detailBox.style.display = 'block'

    let todayBox = document.getElementById('todayBox')
    todayBox.style.display = 'none'
    let dailyBox = document.getElementById("dailyBox")
    dailyBox.style.display = 'none'
    let chartTitleAndArrow = document.getElementById("chartTitleAndArrow")
    chartTitleAndArrow.style.display = 'block'
    let arrowDown = document.getElementById("arrowDown")
    arrowDown.style.display = 'block'
    let arrowUp = document.getElementById("arrowUp")
    arrowUp.style.display = 'none'
}

function displayChart2(){
    let chart2Box = document.getElementById("chart2Box")
    function Meteogram(timeLine, container) {
        // Parallel arrays for the chart data, these are populated as the JSON file is loaded
        this.humidities = [];
        this.winds = [];
        this.temperatures = [];
        this.pressures = [];

        // Initialize
        this.json = timeLine[1]
        this.container = container;

        // Run
        this.parseData();
    }
    Meteogram.prototype.drawBlocksForWindArrows = function (chart) {
        const xAxis = chart.xAxis[0];

        for (
            let pos = xAxis.min, max = xAxis.max, i = 0;
            pos <= max + 36e5; pos += 36e5,
                i += 1
        ) {

            // Get the X position
            const isLast = pos === max + 36e5,
                x = Math.round(xAxis.toPixels(pos)) + (isLast ? 0.5 : -0.5);

            // Draw the vertical dividers and ticks
            const isLong = this.resolution > 36e5 ?
                pos % this.resolution === 0 :
                i % 2 === 0;

            chart.renderer
                .path([
                    'M', x, chart.plotTop + chart.plotHeight + (isLong ? 0 : 28),
                    'L', x, chart.plotTop + chart.plotHeight + 32,
                    'Z'
                ])
                .attr({
                    stroke: chart.options.chart.plotBorderColor,
                    'stroke-width': 1
                })
                .add();
        }

        // Center items in block
        chart.get('windbarbs').markerGroup.attr({
            translateX: chart.get('windbarbs').markerGroup.translateX + 8
        });

    };
    Meteogram.prototype.getChartOptions = function () {
        return {
            time: {
                useUTC: false
            },
            chart: {
                renderTo: this.container,
                marginBottom: 70,
                marginRight: 40,
                marginTop: 50,
                plotBorderWidth: 1,
                height: 400,
                alignTicks: false,
                scrollablePlotArea: {
                    minWidth: 720
                }
            },


            title: {
                text: 'Hourly Weather(For Next 5 Days)',
                align: 'center',
                style: {
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis'
                }
            },

            credits: {
                text: 'Forecast',
                position: {
                    x: -40
                }
            },

            tooltip: {
                shared: true,
                useHTML: true,
                headerFormat:
                    '<small>{point.x:%A, %b %e, %H:%M} - {point.point.to:%H:%M}</small><br>'
            },

            xAxis: [{ // Bottom X axis
                type: 'datetime',
                tickInterval: 2 * 36e5, // two hours
                // tickInterval: 36e5, // one hours
                minorTickInterval: 36e5, // one hour
                tickLength: 0,
                gridLineWidth: 1,
                gridLineColor: 'rgba(128, 128, 128, 0.1)',
                startOnTick: false,
                endOnTick: false,
                minPadding: 0,
                maxPadding: 0,
                offset: 30,
                showLastLabel: true,
                labels: {
                    format: '{value:%H}'
                },
                crosshair: true
            }, { // Top X axis
                linkedTo: 0,
                type: 'datetime',
                tickInterval: 24 * 3600 * 1000,
                labels: {
                    format: '{value:<span style="font-size: 12px; font-weight: bold">%a</span> %b %e}',
                    align: 'left',
                    x: 3,
                    y: -5
                },
                opposite: true,
                tickLength: 20,
                gridLineWidth: 1
            }],

            yAxis: [{ // temperature axis
                title: {
                    text: null
                },
                labels: {
                    format: '{value}°',
                    style: {
                        fontSize: '10px'
                    },
                    x: -3
                },
                plotLines: [{ // zero plane
                    value: 0,
                    color: '#BBBBBB',
                    width: 1,
                    zIndex: 2
                }],
                maxPadding: 0.3,
                minRange: 8,
                tickInterval: 1,
                gridLineColor: 'rgba(128, 128, 128, 0.1)'

            },
                // { // precipitation axis
                { // humidity axis
                    title: {
                        text: null
                    },
                    labels: {
                        enabled: false
                    },
                    gridLineWidth: 0,
                    tickLength: 0,
                    minRange: 10,
                    min: 0

                },
                { // Air pressure
                    allowDecimals: false,
                    title: { // Title on top of axis
                        text: 'inHg',
                        offset: 0,
                        align: 'high',
                        rotation: 0,
                        style: {
                            fontSize: '10px',
                            color: '#EFA300'
                        },
                        textAlign: 'left',
                        x: 3
                    },
                    labels: {
                        style: {
                            fontSize: '8px',
                            color: '#EFA300'
                        },
                        y: 2,
                        x: 3
                    },
                    gridLineWidth: 0,
                    opposite: true,
                    showLastLabel: false
                }],

            legend: {
                enabled: false
            },

            plotOptions: {
                series: {
                    pointPlacement: 'between'
                }
            },


            series: [
                {
                    name: 'Temperature',
                    data: this.temperatures,
                    type: 'spline',
                    marker: {
                        enabled: false,
                        states: {
                            hover: {
                                enabled: true
                            }
                        }
                    },
                    tooltip: {
                        pointFormat: '<span style="color:{point.color}">\u25CF</span> ' +
                            '{series.name}: <b>{point.y}°F</b><br/>'
                    },
                    zIndex: 1,
                    color: '#FF3333',
                    negativeColor: '#48AFE8'
                },
                // 	{
                // 	name: 'Precipitation',
                // 	data: this.precipitationsError,
                // 	type: 'column',
                // 	color: 'url(#precipitation-error)',
                // 	yAxis: 1,
                // 	groupPadding: 0,
                // 	pointPadding: 0,
                // 	tooltip: {
                // 		valueSuffix: ' mm',
                // 		pointFormat: '<span style="color:{point.color}">\u25CF</span> ' +
                // 			'{series.name}: <b>{point.minvalue} mm - {point.maxvalue} mm</b><br/>'
                // 	},
                // 	grouping: false,
                // 	dataLabels: {
                // 		enabled: this.hasPrecipitationError,
                // 		filter: {
                // 			operator: '>',
                // 			property: 'maxValue',
                // 			value: 0
                // 		},
                // 		style: {
                // 			fontSize: '8px',
                // 			color: 'gray'
                // 		}
                // 	}
                // },
                {
                    name: 'Humidity',
                    data: this.humidities,
                    type: 'column',
                    color: '#83c7f5',
                    yAxis: 1,
                    groupPadding: 0,
                    pointPadding: 0,
                    grouping: false,
                    dataLabels: {
                        enabled: true,
                        filter: {
                            operator: '>',
                            property: 'y',
                            value: 0
                        },
                        style: {
                            fontSize: '8px',
                            color: 'gray'
                        }
                    },
                    tooltip: {
                        valueSuffix: ' %'
                    }
                },
                {
                    name: 'Air pressure',
                    color: '#EFA300',
                    data: this.pressures,
                    marker: {
                        enabled: false
                    },
                    shadow: false,
                    tooltip: {
                        valueSuffix: ' inHg'
                    },
                    dashStyle: 'shortdot',
                    yAxis: 2
                },
                {
                    name: 'Wind',
                    type: 'windbarb',
                    id: 'windbarbs',
                    color: Highcharts.getOptions().colors[1],
                    lineWidth: 1.5,
                    data: this.winds,
                    vectorLength: 18,
                    yOffset: -15,
                    tooltip: {
                        valueSuffix: ' mph'
                    }
                }]
        };
    };
    Meteogram.prototype.onChartLoad = function (chart) {
        this.drawBlocksForWindArrows(chart);
    };
    Meteogram.prototype.createChart = function () {
        this.chart = new Highcharts.Chart(this.getChartOptions(), chart => {
            this.onChartLoad(chart);
        });
    };
    Meteogram.prototype.error = function () {
        document.getElementById('loading').innerHTML =
            '<i class="fa fa-frown-o"></i> Failed loading data, please try again later';
    };
    Meteogram.prototype.parseData = function () {

        let pointStart;

        if (!this.json) {
            return this.error();
        }

        this.json.intervals.forEach((node, i) => {
            const x = Date.parse(node.startTime)
            // console.log("Date")
            // console.log(x)
            const to = x + 36e5;

            this.temperatures.push({
                x,
                y: node.values.temperature,
                to,
            });

            this.humidities.push({
                x,
                y: node.values.humidity
            });

            if (i % 2 === 0) {
                this.winds.push({
                    x,
                    value: node.values.windSpeed,
                    direction: node.values.windDirection
                });
            }

            this.pressures.push({
                x,
                y: node.values.pressureSeaLevel
            });

            if (i === 0) {
                pointStart = (x + to) / 2;
            }

        });

        // Create the chart when the data is loaded
        this.createChart();
    };
    window.meteogram = new Meteogram(timeLine, 'container2');
    chart2Box.style.display = 'block'
}

function getChart1JSON(){
    let intervals = timeLine[0].intervals
    let tempArray = []
    for (let i = 0; i < intervals.length; i++) {
        let timeStamp = Date.parse(intervals[i].startTime)
        let tempLow = intervals[i].values.temperatureMin
        let tempHigh = intervals[i].values.temperatureMax
        tempArray.push([timeStamp, tempLow, tempHigh])
    }
    console.log(tempArray)
    return tempArray
}

function displayChart1(){
    let chart1Box = document.getElementById("chart1Box")
    let chartJSON = getChart1JSON(timeLine)

    function drawChart (data) {
        Highcharts.chart('container', {

            chart: {
                type: 'arearange',
                zoomType: 'x',
                scrollablePlotArea: {
                    minWidth: 600,
                    scrollPositionX: 1
                }
            },

            title: {
                text: 'Temperature variation by day'
            },

            xAxis: {
                type: 'datetime',
                accessibility: {
                    rangeDescription: 'Range: Jan 1st 2017 to Dec 31 2017.'
                }
            },

            yAxis: {
                title: {
                    text: null
                }
            },

            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: '°F',
                xDateFormat: '%A, %b %e'
            },

            legend: {
                enabled: false
            },

            // series: [{
            //     name: 'Temperatures',
            //     data: data,
            //     fillColor: {
            //         linearGradient: {x1: 0, x2: 0, y1: 0, y2: 1},
            //         stops: [
            //             [0, Highcharts.color('#f4b74d')
            //                 .setOpacity(1).get()],
            //             [
            //                 1,
            //                 Highcharts.color('#97C4F8')
            //                     .setOpacity(0.1).get()
            //             ]
            //         ]
            //     }
            //
            // }]
            series: [{
                color: '#f4b74d',
                name: 'Temperatures',
                data: data,
                fillColor: {
                    linearGradient: {x1: 0, x2: 0, y1: 0, color: '#97C4F8', y2: 1},
                    stops: [
                        [0, Highcharts.color('#f4b74d')
                            .setOpacity(1).get()],
                        [
                            1,
                            Highcharts.color('#97C4F8')
                                .setOpacity(0.1).get()
                        ]
                    ]
                },
                marker: {
                    fillColor: '#97C4F8',
                    /* lineColor:'#f4b74d' */
                }

            }]
        });
    }
    drawChart(chartJSON)
    chart1Box.style.display = 'block'
}

function displayDailyBox(){
    let dailyBox = document.getElementById("dailyBox")
    let intervals = timeLine[0].intervals
    // delete last results
    const lastResults = document.getElementsByClassName("contentLine");
    while(lastResults.length > 0){
        lastResults[0].parentNode.removeChild(lastResults[0]);
    }
    // append current results
    for (let i = 0; i < intervals.length; i++) {
        let contentLine = document.createElement('div')
        contentLine.className = "contentLine"
        contentLine.id = i.toString()
        let date = document.createElement('div')
        date.className = "dailyDate"
        console.log(intervals[i].startTime)
        let curDate = new Date(intervals[i].startTime)
        console.log(curDate)
        date.innerHTML = weekday[curDate.getDay()] + ", " + curDate.getDate() + " " + month[curDate.getMonth()] + " " + curDate.getFullYear()
        contentLine.appendChild(date)

        let values = intervals[i].values

        let status = document.createElement('div')
        status.className = "dailyStatus"
        let [nameStr, iconSrc] = getWeatherNameAndImageSrc(values.weatherCode)
        let icon = document.createElement("img")
        icon.setAttribute("src", iconSrc)
        let name = document.createElement("span")
        name.innerHTML = nameStr
        status.appendChild(icon)
        status.appendChild(name)
        contentLine.appendChild(status)

        let tempHigh = document.createElement('div')
        tempHigh.className = "dailyTempHigh"
        tempHigh.innerHTML = values.temperatureMax
        contentLine.appendChild(tempHigh)

        let tempLow = document.createElement('div')
        tempLow.className = "dailyTempLow"
        tempLow.innerHTML = values.temperatureMin
        contentLine.appendChild(tempLow)

        let windSpeed = document.createElement('div')
        windSpeed.className = "dailyWindSpeed"
        windSpeed.innerHTML = values.windSpeed
        contentLine.appendChild(windSpeed)
        contentLine.onclick = displayDetailBox
        dailyBox.appendChild(contentLine)
    }
    dailyBox.style.display = 'block'
}

function displayTodayBox(formattedLocation){
    let [weatherCode, humidity, pressureSeaLevel, windSpeed, visibility, cloudCover, uvIndex, temperature] = parseTodayContent(timeLine[0])
    let [weatherName, weatherIconSrc] = getWeatherNameAndImageSrc(weatherCode)
    document.getElementById("dailyLocation").textContent = formattedLocation
    document.getElementById("todayIcon").src = weatherIconSrc
    document.getElementById("weatherCode").textContent = weatherName
    document.getElementById("todayTemp").textContent = temperature.toString() + "°"
    document.getElementById("humidityNumber").textContent = humidity.toString() + "%"
    document.getElementById("pressureNumber").textContent = pressureSeaLevel.toString() + "inHg"
    document.getElementById("windSpeedNumber").textContent = windSpeed.toString() + "mph"
    document.getElementById("visibilityNumber").textContent = visibility.toString() + "mi"
    document.getElementById("cloudCoverNumber").textContent = cloudCover.toString() + "%"
    document.getElementById("uvLevelNumber").textContent = uvIndex
    let todayBox = document.getElementById("todayBox")
    todayBox.style.display = 'block'
}

function parseTodayContent(dailyJson){
    let intervals = dailyJson.intervals
    let todayValue = intervals[0].values
    let weatherCode = todayValue.weatherCode
    let humidity = todayValue.humidity
    let pressureSeaLevel = todayValue.pressureSeaLevel
    let windSpeed = todayValue.windSpeed
    let visibility = todayValue.visibility
    let cloudCover = todayValue.cloudCover
    let uvIndex = todayValue.uvIndex
    let temperature = todayValue.temperature
    return [weatherCode, humidity, pressureSeaLevel, windSpeed, visibility, cloudCover, uvIndex, temperature]
}

function getPrecipitationType(index){
    switch (index.toString()){
        case "0":
            return "N/A"
        case "1":
            return "Rain"
        case "2":
            return "Snow"
        case "3":
            return "Freezing Rain"
        case "4":
            return "Ice Pellets"
    }
}

function getWeatherNameAndImageSrc(weatherCode){
    let preUrl = "/static/images/weatherIcon/"
    switch (weatherCode){
        case 4201:
            return ["Heavy Rain", preUrl+"rain_heavy.svg"]
        case 4001:
            return ["Rain", preUrl+"rain.svg"]
        case 4200:
            return ["Light Rain", preUrl+"rain_light.svg"]
        case 6201:
            return ["Heavy Freezing Rain", preUrl+"freezing_rain_heavy.svg"]
        case 6001:
            return ["Freezing Rain", preUrl+"freezing_rain.svg"]
        case 6200:
            return ["Light Freezing Rain", preUrl+"freezing_rain_light.svg"]
        case 6000:
            return ["Freezing Drizzle", preUrl+"freezing_drizzle.svg"]
        case 4000:
            return ["Drizzle", preUrl+"drizzle.svg"]
        case 7101:
            return ["Heavy Ice Pellets", preUrl+"ice_pellets_heavy.svg"]
        case 7000:
            return ["Ice Pellets", preUrl+"ice_pellets.svg"]
        case 7102:
            return ["Light Ice Pellets", preUrl+"ice_pellets_light.svg"]
        case 5101:
            return ["Heavy Snow", preUrl+"snow_heavy.svg"]
        case 5000:
            return ["Snow", preUrl+"snow.svg"]
        case 5100:
            return ["Light Snow", preUrl+"snow_light.svg"]
        case 5001:
            return ["Flurries", preUrl+"flurries.svg"]
        case 8000:
            return ["Thunderstorm", preUrl+"tstorm.svg"]
        case 2100:
            return ["Light Fog", preUrl+"fog_light.svg"]
        case 2000:
            return ["Fog", preUrl+"fog.svg"]
        case 1001:
            return ["Cloudy", preUrl+"cloudy.svg"]
        case 1102:
            return ["Mostly Cloudy", preUrl+"mostly_cloudy.svg"]
        case 1101:
            return ["Partly Cloudy", preUrl+"partly_cloudy_day.svg"]
        case 1100:
            return ["Mostly Clear", preUrl+"mostly_clear_day.svg"]
        case 1000:
            return ["Clear, Sunny", preUrl+"clear_day.svg"]
        default:
            return ["Clear, Sunny", preUrl+"clear_day.svg"]
    }
}

function clearContent(){
    let street = document.getElementById("street")
    let city = document.getElementById("city")
    let state = document.getElementById("state")
    street.value = ""
    city.value = ""
    state.value = ""
    clearBoxes()
}

function clearBoxes(){
    document.getElementById("noRecordBox").style.display = 'none';
    document.getElementById("todayBox").style.display = 'none';
    document.getElementById("dailyBox").style.display = 'none';
    document.getElementById("detailBox").style.display = 'none';
    document.getElementById("chart1Box").style.display = 'none';
    document.getElementById("chart2Box").style.display = 'none';
    document.getElementById("chartTitleAndArrow").style.display = 'none';
}

function testOnClick(){
    console.log(this.id)
}