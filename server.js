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

const pg = require('pg');


const client = new pg.Client(process.env.DATABASE_URL);

// process : var process : Node.js Process ???
//to give it an API key ,when?? 
const PORT = process.env.PORT || 3040;//now I should the port in .env

const app = express();//the app has express properties to use

app.use(cors());//the server/app is shared with everyone

/* END OF SETTING UP THE SERVER */

//quiries navigation
// function errHandler(err, req, res) {
//     res.status(500).json(err);
// }
app.get('/location', (req, res) => {

    const loc = req.query.city;
    let key = process.env.GEOCODE_API_KEY;

    //select quey from db 
    let SQL = `SELECT search_query,formatted_query,latitude,longitude FROM loc WHERE search_query = '${loc}'; `;

    client.query(SQL)
        .then((results) => {

            if (results.rows.length > 0) {
                console.log("DB QUERY 2");

                res.status(200).json(results.rows[0]);
            } else {
                let url = `https://eu1.locationiq.com/v1/search.php?key=${key}&city=${loc}&format=json`
                superagent.get(url)
                    .then((geoObj) => {
                        console.log("URL QUERY 1");

                        let locData = new Location(loc, geoObj.body);
                        let safeValues = [locData.search_query, locData.formatted_query, locData.latitude, locData.longitude];
                        let insertSQL = `INSERT INTO loc(search_query,formatted_query,latitude,longitude) VALUES ($1,$2,$3,$4);`
                        client.query(insertSQL, safeValues)
                            .then(results => {
                                res.status(200).json(locData);
                            });
                        // res.status(200).json(locData);
                        // console.log(arrOfLocData);

                    });
            }
        }).catch((err) => {
            console.log("CATCH ERROR HANDELED", err);
            app.use((err, req, res) => {
                console.log("INSID ERROR HANDELED");

                res.status(500).json(err);
            });
        })
    // .catch(err => errHandler(err));

    arrOfLocData = [];

    // let url = `https://eu1.locationiq.com/v1/search.php?key=${key}&city=${loc}&format=json`;
    // superagent.get(url)
    //     .then((geoObj) => {
    //         let locData = new Location(loc, geoObj.body);
    //         res.status(200).json(locData);
    //         console.log(arrOfLocData);

    //     });

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

    res.status(500).send(err);
});


//Hey server, listen to the port PORT and (req,res)=>{...}

client.connect()
    .then(() => {
        app.listen(PORT, (req, res) => {

            console.log(`liddsssstening on port ${PORT}`)
        })
    })




