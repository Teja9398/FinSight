const express = require('express');
const mongoose = require('mongoose');
const PORT = 5000;
const url = 'mongodb://localhost:27017/finsightDB';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/status',(req,res) =>{
      res.status(200).json({
            message: 'Server is running'
      });
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});