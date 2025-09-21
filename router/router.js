const express = require('express');
const router  = express.Router();
const { userRegistration,userLogin,forgetPassword } = require('../controller/user')

//Home page
router.get('/',(req,res)=>{
    res.render('home')
})

//Registration page
router.get('/register',(req,res)=>{
    res.render('register');
})

//Login page
router.get('/login',(req,res)=>{
    res.render('login');
})

//Forget password page
router.get('/forgetpassword',(req,res)=>{
    res.render('forget_password');
})

router.post('/register',userRegistration);
router.post('/login',userLogin);
router.post('/forgetpassword',forgetPassword);


module.exports = router;