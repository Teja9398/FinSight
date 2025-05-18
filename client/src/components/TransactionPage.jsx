import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
} from "@mui/material";

const categories = [
  "Income",
  "Groceries",
  "Transportation",
  "Entertainment",
  "Utilities",
  "Healthcare",
  "Housing",
  "medical",
  "other"
];

function TransactionPage() {
  const [transactions, setTransactions] = useState([]);
  const token = localStorage.getItem("token");
  const [checkAll, setCheckAll] = useState(false);
  const [checkedItems, setCheckedItems] = useState([]);

  // console.log("token:", token);

  useEffect(() => {
    fetch("http://localhost:5000/transactions/get", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setTransactions(data);
        // console.log("Fetched transactions:", data);
        setCheckedItems(new Array(data.length).fill(false));
      })
      .catch((error) => {
        console.error("Error fetching transactions:", error);
      });
  }, []);
  const [formData, setFormData] = useState({
    date: "",
    description: "",
    category: "",
    amount: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddTransaction = () => {
    if (
      formData.date &&
      formData.description &&
      formData.category &&
      formData.amount
    ) {
      fetch("http://localhost:5000/transactions/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: formData.date,
          note: formData.description,
          type: formData.category === "Income" ? "income" : "expense",
          source: "manual",
          category: formData.category,
          amount: parseFloat(formData.amount),
        }),
      });
      setTransactions([...transactions, formData]);
      console.log("Transaction added:", formData);

      setFormData({ date: "", description: "", category: "", amount: "" });
    }
  };
  const handleCheckAll = (e) => {
    const checked = e.target.checked;
    if (checked) {
      setCheckAll(e.target.checked);
      setCheckedItems(new Array(transactions.length).fill(checked));
      // setCheckedItems(newCheckedItems);
    } else {
      setCheckAll(false);
      setCheckedItems(new Array(transactions.length).fill(false));
    }
  };
  const handleRowCheck = (index) => (e) => {
    console.log(transactions[index]);
    const updated = [...checkedItems];
    updated[index] = e.target.checked;
    setCheckedItems(updated);

    // Optional: If all are checked, update the checkAll flag
    if (updated.every(Boolean)) {
      setCheckAll(true);
    } else {
      setCheckAll(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Transactions
      </Typography>

      <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6">Add Transaction</Typography>
        <TextField
          label="Date"
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          fullWidth
          sx={{ my: 1 }}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          fullWidth
          sx={{ my: 1 }}
        />
        <TextField
          label="Category"
          name="category"
          select
          value={formData.category}
          onChange={handleChange}
          fullWidth
          sx={{ my: 1 }}
        >
          {categories.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Amount"
          name="amount"
          type="number"
          value={formData.amount}
          onChange={handleChange}
          fullWidth
          sx={{ my: 1 }}
        />
        <Button
          variant="contained"
          onClick={handleAddTransaction}
          sx={{ mt: 2 }}
        >
          Add
        </Button>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead style={{ backgroundColor: "lightblue" }}>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Amount ($)</TableCell>
              <TableCell>
                <Checkbox
                  checked={checkAll || false}
                  onChange={handleCheckAll}
                />
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((txn, index) => (
              <TableRow key={index}>
                <TableCell>{new Date(txn.date).toLocaleDateString()}</TableCell>
                <TableCell>{txn.note}</TableCell>
                <TableCell>{txn.category}</TableCell>
                <TableCell>{txn.amount}</TableCell>
                <TableCell>
                  <Checkbox
                    checked={checkedItems[index] || false}
                    onChange={handleRowCheck(index)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Paper
        elevation={1}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "lightblue",
          p: 2,
          mt: 1,
        }}
      >
        <Typography variant="subtitle1">
          {checkedItems.filter(Boolean).length} selected
        </Typography>
        <div>
          <Button
            variant="text"
            color="primary"
            disabled={checkedItems.filter(Boolean).length !== 1}
            sx={{ mr: 2 }}
            onClick={() => {
              const selectedIndex = checkedItems.findIndex((v) => v === true);
              if (selectedIndex !== -1) {
                console.log("Edit transaction:", transactions[selectedIndex]);
                // Add your edit logic here
              }
            }}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={checkedItems.every((v) => !v)}
            onClick={() => {
              const remainingTransactions = transactions.filter(
                (_, idx) => !checkedItems[idx]
              );
              setTransactions(remainingTransactions);
              setCheckedItems(Array(remainingTransactions.length).fill(false));
            }}
          >
            Delete
          </Button>
        </div>
      </Paper>
    </Container>
  );
}

export default TransactionPage;
