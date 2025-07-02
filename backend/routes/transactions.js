var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { transactionModel } = require("./schemas");
const verifyToken = require("../middlewares/verifyToken.js");
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

/* GET home page. */
router.get("/", function (req, res) {
  // console.log(req.body);
  // console.log("User from token:", req.user);
  res.json({ message: "Welcome to the Transactions API" });
});

router.get("/test-authentication",verifyToken, (req, res) => {
  // console.log("User from token:", req.user);
  res.json({ message: "This is a test route", user: req.user });
})

router.post("/add",verifyToken,async (req, res) => {
  const data = req.body;
  data["userId"] = req.user.id; // Add userId from the token
  // console.log(data);
  // res.send(data);
  mongoose
  .connect("mongodb://localhost:27017/finsightDB")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err.message);
  });
  const transaction = new transactionModel(data);
  transaction
    .save()
    .then((saved) => {
      console.log("Transaction saved successfully: ");
      console.log("Saved Transaction: ",saved);
      res.status(201).json({ message: "Transaction added successfully",transaction:saved });
    })
    .catch((err) => {
      console.error("Error saving transaction", err.message);
      res.status(500).json({ message: "Error saving transaction" });
    });

});


router.get("/get", verifyToken, async (req, res) => {
  // console.log(req.user.id);

  mongoose
    .connect("mongodb://localhost:27017/finsightDB")
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((err) => {
      console.error("Error connecting to MongoDB", err.message);
    });
  const transactions = await transactionModel
    .find({ userId: req.user.id })
    .sort({ date: -1 });
  res.status(200).json(transactions);
  // console.log(transactions);
});

router.get("/get/:id", verifyToken,async (req, res) => {
  mongoose
    .connect("mongodb://localhost:27017/finsightDB")
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((err) => {
      console.error("Error connecting to MongoDB", err.message);
    });
  const transaction = await transactionModel.findById(req.params.id);
  if (!transaction) {
    return res.status(404).json({ message: "Transaction not found" });
  }
  res.status(200).json(transaction);
});

router.put("/update/:id",verifyToken,async (req, res) => {
  console.log("Update request body:", req.body);
  mongoose
    .connect("mongodb://localhost:27017/finsightDB")
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((err) => {
      console.error("Error connecting to MongoDB", err.message);
    });
  const transaction = await transactionModel.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  if (!transaction) {
    return res.status(404).json({ message: "Transaction not found" });
  } else {
    res.status(200).json({ message: "Transaction updated successfully" });
  }
});

router.delete("/delete",verifyToken, async (req, res) => {
  mongoose
    .connect("mongodb://localhost:27017/finsightDB")
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((err) => {
      console.error("Error connecting to MongoDB", err.message);
    });
  const transaction = await transactionModel.deleteMany({
    _id: { $in: req.body.ids },
  });
  if (!transaction) {
    return res.status(404).json({ message: "Transaction not found" });
  } else {
    res.status(200).json({ message: "Transaction deleted successfully" });
  }
});

router.get("/gettest", async (req, res) => {
  mongoose
    .connect("mongodb://localhost:27017/finsightDB")
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((err) => {
      console.error("Error connecting to MongoDB", err.message);
    });
  const transactions = await transactionModel.find().sort({ date: -1 });
  res.status(200).json(transactions);
});

router.get("/getbycat",verifyToken,async (req, res) => {
  mongoose
    .connect("mongodb://localhost:27017/finsightDB")
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((err) => {
      console.error("Error connecting to MongoDB", err.message);
    });
  const data = await transactionModel.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(req.user.id),
        type: "expense", // filtering by expense type
      },
    },
    {
      $group: {
        _id: "$category",
        amount: { $sum: "$amount" },
      },
    },
  ]);
  // console.log(data);
  res.send(data);
});

router.get("/totalincomeandexpenses",verifyToken,async(req,res)=>{
  mongoose.connect("mongodb://localhost:27017/finsightDB")
  .then(()=>{
    console.log("Connected to DB")
  }).catch((err)=>{
    console.log("failed to connect to db:", err.message);
  })
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(),now.getMonth(),1);
    const endOfMonth = new Date(now.getFullYear(),now.getMonth()+1,0,23,59,59,999);

    try{

        const data = await transactionModel.aggregate([
          {
            $match: {
              userId: new mongoose.Types.ObjectId(req.user.id),
              date: { $gte: startOfMonth, $lte: endOfMonth }
            }
          },
          {
            $group:{
              _id:{type:"$type"},
              amount:{$sum:'$amount'}
            }
          },
          {
            $project:{
              _id:0,
              income:{
                $cond:[{$eq:['$_id.type','income']},'$amount',0]
              },
              expense:{
                $cond:[{$eq:['$_id.type','expense']},'$amount',0]
                }
              }
            }
        ])
          // res.send(data);
          const formattedData = {income:null,expense:null};
          data.map(item =>{
            if(item.income!=null){
              formattedData.income = item.income
            }
            if(item.expense!=null){
              formattedData.expense = item.expense;
            }
          })
          res.send(formattedData)

      }catch(err){
        res.send({message:`failed to fetchData:${err.message}` })
      }
})

router.get("/getincomeandexp",verifyToken ,async (req, res) => {
  mongoose
    .connect("mongodb://localhost:27017/finsightDB")
    .then(() => {
      console.log("Connected to DB");
    })
    .catch((err) => {
      console.log("error connecting to DB: ", err.message);
    });
  // console.log(req.params.id);
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );

  try {
    const data = await transactionModel.aggregate([
      {
        $match: { 
          userId: new mongoose.Types.ObjectId(req.user.id),
          date: { $gte: startOfMonth, $lte: endOfMonth },
         },
        
      },
      {
        $group: {
          _id: { date: "$date", type: "$type", category: "$category" },
          amount: { $sum: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id.date",
          income: {
            $cond: [{ $eq: ["$_id.type", "income"] }, "$amount", null],
          },
          expenses: {
            $cond: [{ $eq: ["$_id.type", "expense"] }, "$amount", null],
          },
          category: "$_id.category",
        },
      },
      {
        $sort: { date: 1 },
      },
    ]);
    // Flatten so each entry has either income or expenses, not both
    // console.log(data);
    
    const formatted = data.map((item) => {
      if (item.income !== null) {
        return {
          date: item.date,
          category: item.category,
          income: item.income,
        };
      } else {
        return {
          date: item.date,
          category: item.category,
          expenses: item.expenses,
        };
      }
    });
    res.send(formatted);
    // const data = await transactionModel.find({userId:new mongoose.Types.ObjectId(req.params.id)},{date:1,type:1,amount:1})
    // res.send(data);
  } catch (err) {
    res.send({ message: `an error occured ${err}` });
  }
});

router.get('/getnetbalance',verifyToken,async (req,res)=>{
  console.log("Header: ",req.user);
  
  mongoose.connect('mongodb://localhost:27017/finsightDB')
  .then(()=>{console.log('connected to DB');
  })
  .catch(err=>{
    console.log("error connecting to DB: ",err.message);
  })
  try{
    const data = await transactionModel.aggregate([
      {
        $match: {
          userId:new mongoose.Types.ObjectId(req.user.id),
        }
      },
      {
        $group:{
          _id:{type:"$type"},
          amount:{$sum:"$amount"}
        }
      },
      {
        $project:{
          _id:0,
          type:"$_id.type",
          amount: "$amount"
        }
      },
      {
        $sort:{type:-1}
      }
    ])
    // console.log("NETBALANCE DATA: ",data);
    
    res.send({netbalance:data[0].amount - data[1].amount})
  }catch(error){
    res.send({message:`an error occured: ${error}`,})
  }
})

module.exports = router; 
