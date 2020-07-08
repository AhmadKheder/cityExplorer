'use strict'

/* START SETTING UP THE SERVER */

//require the  expresss lib to give the server its built-in methods 
const express = require('express');
const superagent = require('superagent')
//CORS : Cross Origin Resource Sharing
//to give permissions to the host(maybe) that can touch my server
const cors = require('cors');

//DOTENV e.g read our ennironmet variable
//require and configure it 
require('dotenv').config();

// process : var process : Node.js Process ???
//to give it an API key ,when?? 
const PORT = process.env.PORT || 3040;//now I should the port in .env

const app = express();//the app has express properties to use

app.use(cors());//the server/app is shared with everyone

/* END OF SETTING UP THE SERVER */

//quiries navigation

app.get('/location', (req, res) => {
    arrOfLocData = [];
    const loc = req.query.city;
    let key = process.env.GEOCODE_API_KEY;

    let url = `https://eu1.locationiq.com/v1/search.php?key=${key}&city=${loc}&format=json`;
    // https://eu1.locationiq.com/v1/search.php?key=c798db54cb9e1a&city=dubai&format=json
    superagent.get(url)
        .then((geoObj) => {
            let locData = new Location(loc, geoObj.body);
            res.status(200).json(locData);
            console.log(arrOfLocData);

        });

});
let arrOfLocData = [];


app.get('/weather', (req, res) => {
    const key = process.env.WEATHER_API_KEY;

    let url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${arrOfLocData[0].latitude}&lon=${arrOfLocData[0].longitude}&key=${key}`;

    superagent.get(url)
        .then((weatherGeoJSON) => {
            let weatherXD = weatherGeoJSON.body.data.map((day, index) => {
                let desc = day.weather.description;
                let date = day.datetime;
                let weathObj = new Weather(desc, date);
                return weathObj;
            });
            res.status(200).json(weatherXD);
        });

});
app.get("/trails", (req, res) => {
    let trailskey = process.env.TRAIL_API_KEY;
    let url = `https://www.hikingproject.com/data/get-trails?lat=${arrOfLocData[0].latitude}&lon=${arrOfLocData[0].longitude}&maxDistance=10&key=${trailskey}`;



    superagent.get(url)
        .then((hikingJSON) => {
            let hikeInfo = hikingJSON.body.trails.map((tr) => {
                return new Hike(tr);
            });
            res.status(200).json(hikeInfo);
        });

});





function Location(location, locationInfoJSONFromUrl) {

    //properties to send as response 

    this.search_query = location;
    this.formatted_query = locationInfoJSONFromUrl[0].display_name;
    this.latitude = locationInfoJSONFromUrl[0].lat;
    this.longitude = locationInfoJSONFromUrl[0].lon;
    arrOfLocData.push(this);
}
function Weather(description, date) {
    //properties
    this.forecast = description;
    this.time = new Date(date).toDateString();
}

function Hike(trailsData) {
    this.name = trailsData.name;
    this.location = trailsData.location;
    this.length = trailsData.length;
    this.stars = trailsData.stars;
    this.star_votes = trailsData.star_votes;
    this.summary = trailsData.summary;
    this.trail_url = trailsData.trail_url;
    this.conditions = trailsData.conditions;
    this.condition_date = new Date(trailsData).toDateString();
    this.condition_time = new Date(trailsData).toTimeString();
}
app.get('/', (req, res) => {
    res.send('HI');
});


app.get('*', (req, res) => {

    res.status(404).send('Not Found');
});
app.use((err, req, res) => {
    let errObj = {
        status: 500,
        responseText: "Sorry, somthing went wrong",
    }
    res.status(500).send(errObj);
});


//Hey server, listen to the port PORT and (req,res)=>{...}
app.listen(PORT, (req, res) => {
    console.log(`liddsssstening on port ${PORT}`)
})





