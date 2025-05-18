var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { transactionModel } = require('./schemas');
require('dotenv').config();
// const cors = require('cors');
router.use(express.json());
router.use(express.urlencoded({ extended: true })); 
// router.use(cors({origin: 'http://localhost:5173'}));


/* GET home page. */
router.get('/', function(req, res) {
      console.log(req.body);
      
      res.json({ message: 'Welcome to the Transactions API' });
});

router.post('/add', async (req, res) => {
      const data = req.body;
      console.log(data);
      mongoose.connect('mongodb://localhost:27017/finsightDB')
      .then(() => {
            console.log('Connected to MongoDB');
      }).catch(err => {
            console.error('Error connecting to MongoDB', err.message);
      });
      const transaction = new transactionModel(data);
      transaction.save()
      .then(() => {
            console.log('Transaction saved successfully');
            res.status(201).json({ message: 'Transaction added successfully' });
      }).catch(err => {
            console.error('Error saving transaction', err.message);
            res.status(500).json({ message: 'Error saving transaction' });
      });
})
function verifyToken(req, res, next) {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      // console.log(token);
      if (!token) {
            return res.status(403).send('A token is required for authentication');
      }
      try{

            const decoded = jwt.verify(token, "Access125");
            // console.log("DECODED:",decoded);  
            req.user = decoded;
      }catch (err) {
            return res.status(401).send('Invalid Token');
      }
      
      return next();
}
 router.get('/get', verifyToken,async (req, res) => {
      mongoose.connect('mongodb://localhost:27017/finsightDB')
      .then(() => {
            console.log('Connected to MongoDB');
      }).catch(err => {
            console.error('Error connecting to MongoDB', err.message);
      });
      const transactions = await transactionModel.find();
      res.status(200).json(transactions);
      console.log(transactions);
 })
 router.get('/get/:id', async (req, res) => {
      mongoose.connect('mongodb://localhost:27017/finsightDB')
      .then(() => {
            console.log('Connected to MongoDB');
      }).catch(err => {
            console.error('Error connecting to MongoDB', err.message);
      });
      const transaction = await transactionModel.findById(req.params.id);
      if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
      }
      res.status(200).json(transaction);
 })

module.exports = router;
