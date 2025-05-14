var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const { transactionModel } = require('./schemas');
router.use(express.json());
router.use(express.urlencoded({ extended: true })); 

/* GET home page. */
router.get('/', function(req, res, next) {
      res.json({ message: 'Welcome to the Transactions API' });
});

router.post('/add', async (req, res) => {
      const data = req.body;
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
 router.get('/get', async (req, res) => {
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
