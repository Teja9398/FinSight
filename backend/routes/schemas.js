const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const Types = mongoose.Types;

const userSchema = new Schema({
  _id: { type: Types.ObjectId, auto: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  passwordHash: { type: String, required: true },
  authProvider: { type: String, enum: ["local", "google"], required: true },
  createdAt: { type: Date, default: Date.now },
  preferences: {
    currency: { type: String, default: "INR" },
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
      source: { type: String, enum: ['manual','text', 'voice'] },
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

const userModel = mongoose.model('users', userSchema);
const transactionModel = mongoose.model('transactions', transactionSchema);
const budgetModel = mongoose.model('budgets', budgetSchema);

module.exports = {
      userModel,
      transactionModel,
      budgetModel
};