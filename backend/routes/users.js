var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { userModel } = require('./schemas');
const verifyToken = require('../middlewares/verifyToken');
const url = 'mongodb://localhost:27017/finsightDB';
const connectDB = require('../config/connectDB');
require('dotenv').config();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));



/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('<h1>User Home</h1>');
});

router.post('/register', async (req, res) => {
      const originalPassword = req.body.passwordHash;
      const data = req.body;
      data.passwordHash = await bcrypt.hash(data.passwordHash, 10);

      const user = new userModel(data);
      const fetch = await userModel.findOne({ email: data.email });
      console.log(fetch);
      
      if (fetch != null && fetch.email === data.email) {
            res.status(400)
            res.send('User already exists');
      }else {
            await user.save();
            res.send("User registered successfully");
            res.status(201)
      }
});

// function verifyToken(req, res, next) {
//       const token = req.headers.authorization;
//       if (!token) {
//             return res.status(403).send('A token is required for authentication');
//       }
//       try {
//             const decoded = jwt.verify(token, "Access125");
//             console.log(decoded);
//             req.user = decoded;
//       } catch (err) {
//             return res.status(401).send('Invalid Token');
//       }
//       return next();
// }

router.get('/getAllUsers', async (req, res) =>{
      
      userModel.find().then((users) => {
            res.status(200).json(users);
      }).catch((err) => {
            res.status(500).json({ message: 'Error fetching users' });
      });

}); 

router.post('/login', async (req, res) => {
  
      const userExists = await userModel.findOne({ email: data.email });
      if (!userExists) {
            return res.status(400).send({message:'User not found'});
      }else{
            const isMatch = await bcrypt.compare(data.passwordHash,userExists.passwordHash);
            if (isMatch) {
                  const token = jwt.sign({ id: userExists._id,email:data.email }, "Access125");
                  res.status(200).send({message:'Login successful',token:token,userId:userExists._id}); 
            }
            else {
                  res.status(400).send('Invalid password');
            }
      }

})




module.exports = router;
