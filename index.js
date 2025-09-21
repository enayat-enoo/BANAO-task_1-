const express = require("express");
const path = require("path");
const  connectToDb  = require("./connection");
const router  = require("./router/router");
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8001;
const mongoDB_URL = process.env.MONGODB_URL;


app.use(express.urlencoded({ extended: false }));

app.set('view engine','ejs')
app.set('views',path.resolve('./views'))


//Database connection
connectToDb(mongoDB_URL).
then(()=>console.log("Database connected successfully")).
catch((err)=>{
    console.log("Database connection failed",err);
    process.exit(1);
});


app.use('/',router);

app.listen(PORT,()=>{
    console.log(`app is listening at ${PORT}`)
})