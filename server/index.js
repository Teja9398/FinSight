const express = require('express');
const mongoose = require('mongoose');
const PORT = 5000;
const url = 'mongodb://localhost:27017/finsightDB';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { Schema, Types } = mongoose;
const userSchema = new Schema({
  _id: { type: Types.ObjectId, auto: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  passwordHash: { type: String, required: true },
  authProvider: { type: String, enum: ["local", "google"], required: true },
  createdAt: { type: Date, default: Date.now },
  preferences: {
    currency: { type: String, default: "USD" },
    language: { type: String, default: "en" }
  }
});
const transactionSchema = new Schema({
      _id: { type: Types.ObjectId, auto: true },
      userId: { type: Types.ObjectId, ref: 'User' },
      amount: Number,
      type: { type: String, enum: ['income', 'expense'] },
      category: String,
      date: Date,
      note: String,
      source: { type: String, enum: ['manual', 'nlp', 'ocr', 'voice'] },
      tags: [String],
      createdAt: { type: Date, default: Date.now }
})
const budgetSchema = new Schema({
      _id: { type: Types.ObjectId, auto: true },
      userId: { type: Types.ObjectId, ref: 'User' },
      category: String,
      limit: Number,
      period:{type:String,enum: ['weekly','monthly']},
      startDate: Date,
      endDate: Date,
})



app.get('/status',(req,res) =>{
      res.status(200).json({
            message: 'Server is running'
      });
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});