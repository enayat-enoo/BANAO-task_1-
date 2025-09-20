const express = require("express");

const app = express();
const PORT = 8001;

app.get('/',(req,res)=>{
    res.send("Hello World");
})

app.listen(PORT,()=>{
    console.log(`app is listening at ${PORT}`)
})