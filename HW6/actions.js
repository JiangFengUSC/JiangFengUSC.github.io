hostURL = "https://weather-327406.wl.r.appspot.com/weather"
// hostURL = "http://127.0.0.1:5000/weather"

ipInfoToken = "3e13ea62221de6"
geoCodingToken = "AIzaSyBeCDTSwYNwH3bEingxqPjOA1wk9ynWLvk"

document.onload = docOnload()

function docOnload(){
    // run when page load or refresh

}

function testOnClick(){
    console.log("onClick")
}

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

function submit(){
    let checkBox = document.getElementById("autoLocation")
    let latitude, longitude

    const getCoordination = new Promise((resolve, reject) => {
        if(checkBox.checked){
            // ipInfo to get coordination
            $.getJSON("https://ipinfo.io/?token="+ipInfoToken, function(data) {
                [latitude, longitude] = data.loc.split(",")
                console.log(latitude)
                console.log(longitude)
                resolve()
            });

        } else {
            // google map to get coordination
            let street = document.getElementById("street").value
            let city = document.getElementById("city").value
            let state = document.getElementById("state").value
            // https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=YOUR_API_KEY
            let url = encodeURI("https://maps.googleapis.com/maps/api/geocode/json?address="+street+city+state+"&key="+geoCodingToken)
            $.getJSON(url, function(data) {
                console.log(data)
                let results = data.results
                if(results.length !== 0){
                    latitude = results[0].geometry.location.lat
                    longitude = results[0].geometry.location.lng
                    console.log(latitude)
                    console.log(longitude)
                }
                resolve()
            });

        }
    })

    getCoordination.then(()=>{
        if(typeof latitude === 'undefined' || typeof longitude === 'undefined'){
            console.log("show 'No Records have been found' box")
        }else{
            // send to backend and call weather api
            let url = hostURL+"?latitude="+latitude+"&longitude="+longitude
            console.log(url)
            $.getJSON(url, function(data) {
                console.log("Data from backend")
                console.log(data)
            });
        }
    })
}