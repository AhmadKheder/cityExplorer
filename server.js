'use strict'

/* START SETTING UP THE SERVER */

//require the  expresss lib to give the server its built-in methods 
const express = require('express');

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
    //get the queried location from the requist url
    const loc = req.query.loc_name

    //grab the locations json obj
    const locData = require('./data/location.json');

    //invoce the function that convert the search query to response with a specific data
    //by creating obj
    const locQueriedData = new Location(loc, locData);
    //response with the data
    res.send(locQueriedData);
});

function Location(location, locationInfoJSON) {

    //properties to send as response 
    
    this.search_query = location;
    this.formatted_query = locationInfoJSON[0].display_name;
    this.latitude = locationInfoJSON[0].lat;
    this.longitude = locationInfoJSON[0].lon;

}
app.get('/', (req, res) => {
    res.send('HI');
});

app.get('*', (req, res) => {
    res.status(404).send('NOT FOUND');
})

//Hey server, listen to the port PORT and (req,res)=>{...}
app.listen(PORT, (req, res) => {
    console.log(`liddsssstening on port ${PORT}`)
})

























// 'use strict';

// const express = require('express');

// const cors = require('cors');

// require('dotenv').config();

// const PORT = process.env.PORT || 3040;

// const app = express();

// app.use(cors());

// app.get('/location', (req, res) => {
//     const city = req.query.data;
//     // res.send('hello');
//     console.log(city);
//     const geoData = require('./data/location.json');
//     const locationData = new Location(city, geoData);
//     res.send(locationData);
// });

// function Location(city, geoData) {

//     this.search_query = city;
//     this.formatted_query = geoData[0].display_name;
//     this.latitude = geoData[0].lat;
//     this.longitude = geoData[0].lon;

// }


// app.get('/', (req, res) => { res.send('welcome to home page'); });


// app.listen(PORT, () => {
//     console.log('i am listening on port ', PORT);
// });
