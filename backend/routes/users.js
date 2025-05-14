var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { userModel } = require('./schemas');
const url = 'mongodb://localhost:27017/finsightDB';

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
      // console.log({
      //       originalPassword,
      //       hashedPassword: req.body.passwordHash
      // });
      
      const user = new userModel(data);
      mongoose.connect(url)
      .then(() => {
            console.log('Connected to MongoDB');
      })
      .catch(err => {
            console.error('Error connecting to MongoDB', err);
      });
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


router.get('/login', async (req, res) => {
      const data = req.body;
      mongoose.connect(url).then(() => {
            console.log('Connected to MongoDB');
      }).catch(err => {
            console.error('Error connecting to MongoDB', err);
      });
      const userExists = await userModel.findOne({ email: data.email });
      if (!userExists) {
            return res.status(400).send('User not found');
      }else{
            const isMatch = await bcrypt.compare(data.passwordHash,userExists.passwordHash);
            if (isMatch) {
                  res.status(200).send('Login successful');
            }
            else {
                  res.status(400).send('Invalid password');
            }
      }

})




module.exports = router;
