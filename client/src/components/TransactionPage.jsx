import React, { useEffect, useState, useRef } from "react";
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
  useMediaQuery,
  Box,
  Fab,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import EditIcon from "@mui/icons-material/Edit";
import MicIcon from "@mui/icons-material/Mic";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";

const categories = [
  "Income",
  "Groceries and Utilities",
  "Transportation",
  "Medical & Healthcare",
  "Food and drinks",
  "other",
];

function TransactionPage() {
  const [transactions, setTransactions] = useState([]);
  const token = localStorage.getItem("token");
  const [checkAll, setCheckAll] = useState(false);
  const [checkedItems, setCheckedItems] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const [openSpeedDial, setOpenSpeedDial] = useState(false);
  const [openVoiceDialog, setOpenVoiceDialog] = useState(false);
  const [openManualEntryDialog, setOpenManualEntryDialog] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const recognitionRef = useRef(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = "en-IN";

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setVoiceText((prev) => prev + " " + transcript);
        setListening(false);
      };

      recognitionRef.current.onend = () => setListening(false);
    }
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/transactions/get", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setTransactions(data);
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

  const handleVoiceCapture = () => {
    if (recognitionRef.current) {
      setListening(true);
      recognitionRef.current.start();
    }
  };

  const handleVoiceSubmit = async() => {
    // Here you can process the voice text and create a transaction
    const response = await fetch("http://localhost:8000/validate",{
      method:"POST",
      headers:{
        "content-type":"application/json"
      },
      body:JSON.stringify({
        "sentence": voiceText
      })
    })

    const validatedVoiceText = await response.json()

    if(!validatedVoiceText)alert("Invalid input enter a valid input")
    else{
        alert("Yayyy!!! valid input")
        setOpenVoiceDialog(false);
    } 
    // You might want to use AI to parse the text into transaction details

    
    setVoiceText("");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddTransaction = async () => {
    if (
      formData.date &&
      formData.description &&
      formData.category &&
      formData.amount
    ) {
      const response = await fetch("http://localhost:5000/transactions/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: formData.date,
          userId: localStorage.getItem("userId"),
          note: formData.description,
          type: formData.category === "Income" ? "income" : "expense",
          source: "manual",
          category: formData.category,
          amount: parseFloat(formData.amount),
        }),
      });
      const newTxn = await response.json();
      console.log(newTxn);

      setTransactions([newTxn.transaction, ...transactions]); // Add to top
      setCheckedItems([false, ...checkedItems]);
      setFormData({ date: "", description: "", category: "", amount: "" });
      setOpenManualEntryDialog(false)
    } 
  };
  const handleCheckAll = (e) => {
    const checked = e.target.checked;
    if (checked) {
      setCheckAll(e.target.checked);
      setCheckedItems(new Array(transactions.length).fill(checked));
    } else {
      setCheckAll(false);
      setCheckedItems(new Array(transactions.length).fill(false));
    }
  };
  const handleRowCheck = (index) => (e) => {
    const updated = [...checkedItems];
    updated[index] = e.target.checked;
    setCheckedItems(updated);

    if (updated.every(Boolean)) {
      setCheckAll(true);
    } else {
      setCheckAll(false);
    }
  };

  const handleEditChange = (index, field, value) => {
    const updated = [...transactions];
    updated[index] = { ...updated[index], [field]: value };
    setTransactions(updated);
  };
  const handleSaveTransaction = (transaction) => {
    fetch(
      `http://localhost:5000/transactions/update/${transaction._id.toString()}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: transaction._id,
          date: transaction.date,
          note: transaction.note,
          category: transaction.category,
          amount: parseFloat(transaction.amount),
        }),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        // Optionally update UI with new data
        setCheckedItems(Array(transactions.length).fill(false));
      })
      .catch((error) => {
        console.error("Error updating transaction:", error);
      });
  };
  const handleDeleteTransaction = () => {
    fetch("http://localhost:5000/transactions/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ids: transactions
          .filter((_, idx) => checkedItems[idx])
          .map((txn) => txn._id),
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Optionally update UI with new data
        setCheckedItems(Array(transactions.length).fill(false));
      })
      .catch((error) => {
        console.error("Error deleting transaction:", error);
      });
  };

  function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate();
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    const getOrdinal = (n) => {
      if (n > 3 && n < 21) return "th";
      switch (n % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };

    return `${day}${getOrdinal(day)} ${month}, ${year}`;
  }

  return (
    <Container
      maxWidth="md"
      sx={{ mt: isMobile ? 1 : 4, px: isMobile ? 0.5 : 2 }}
    >
      <Typography variant={isMobile ? "h5" : "h4"} gutterBottom>
        Transactions
      </Typography>

      <TableContainer
        component={Paper}
        sx={{ width: "100%", overflowX: "auto" }}
      >
        <Table size={isMobile ? "small" : "medium"}>
          <TableHead>
            <TableRow
              sx={{
                background: "linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)",
              }}
            >
              <TableCell>
                <Typography
                  variant="subtitle2"
                  sx={{ color: "#fff", fontWeight: "bold", letterSpacing: 1 }}
                >
                  Date
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  variant="subtitle2"
                  sx={{ color: "#fff", fontWeight: "bold", letterSpacing: 1 }}
                >
                  Description
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  variant="subtitle2"
                  sx={{ color: "#fff", fontWeight: "bold", letterSpacing: 1 }}
                >
                  Category
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  variant="subtitle2"
                  sx={{ color: "#fff", fontWeight: "bold", letterSpacing: 1 }}
                >
                  Amount (₹)
                </Typography>
              </TableCell>
              <TableCell>
                <Checkbox
                  checked={checkAll || false}
                  onChange={handleCheckAll}
                  sx={{
                    color: "#fff",
                    "&.Mui-checked": { color: "#fff" },
                  }}
                />
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((txn, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: isMobile ? "0.9rem" : "1rem",
                      color: "#222",
                    }}
                  >
                    {editIndex === index ? (
                      <TextField
                        type="date"
                        value={txn.date.split("T")[0]}
                        onChange={(e) =>
                          handleEditChange(index, "date", e.target.value)
                        }
                        size={isMobile ? "small" : "medium"}
                      />
                    ) : (
                      formatDate(txn.date)
                    )}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: isMobile ? "0.9rem" : "1rem",
                      color: "#222",
                    }}
                  >
                    {editIndex === index ? (
                      <TextField
                        value={txn.note}
                        onChange={(e) =>
                          handleEditChange(index, "note", e.target.value)
                        }
                        size={isMobile ? "small" : "medium"}
                      />
                    ) : (
                      txn.note
                    )}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: isMobile ? "0.9rem" : "1rem",
                      color: "#222",
                    }}
                  >
                    {editIndex === index ? (
                      <TextField
                        select
                        value={txn.category}
                        onChange={(e) =>
                          handleEditChange(index, "category", e.target.value)
                        }
                        size={isMobile ? "small" : "medium"}
                      >
                        {categories.map((cat) => (
                          <MenuItem key={cat} value={cat}>
                            {cat}
                          </MenuItem>
                        ))}
                      </TextField>
                    ) : (
                      txn.category
                    )}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: isMobile ? "0.9rem" : "1rem",
                      color: txn.type === "income" ? "green" : "red",
                    }}
                  >
                    {editIndex === index ? (
                      <TextField
                        value={txn.amount}
                        onChange={(e) =>
                          handleEditChange(index, "amount", e.target.value)
                        }
                        size={isMobile ? "small" : "medium"}
                      />
                    ) : (
                      "₹" + txn.amount
                    )}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Checkbox
                    checked={checkedItems[index] || false}
                    onChange={handleRowCheck(index)}
                    size={isMobile ? "small" : "medium"}
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
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "stretch" : "center",
          backgroundColor: "lightblue",
          p: isMobile ? 1 : 2,
          mt: 1,
          gap: isMobile ? 1 : 0,
        }}
      >
        <Typography variant="subtitle1" sx={{ mb: isMobile ? 1 : 0 }}>
          {checkedItems.filter(Boolean).length} selected
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? 1 : 2,
          }}
        >
          <Button
            variant="text"
            color="primary"
            disabled={checkedItems.filter(Boolean).length !== 1}
            sx={{ mr: isMobile ? 0 : 2, minWidth: isMobile ? "100%" : 80 }}
            onClick={() => {
              const selectedIndex = checkedItems.findIndex((v) => v === true);
              if (selectedIndex !== -1) {
                setEditIndex(selectedIndex);
              }
            }}
          >
            Edit
          </Button>

          <Button
            variant="contained"
            color="success"
            sx={{ mr: isMobile ? 0 : 2, minWidth: isMobile ? "100%" : 80 }}
            disabled={editIndex === null}
            onClick={() => {
              handleSaveTransaction(transactions[editIndex]);
              setEditIndex(null);
            }}
          >
            Save
          </Button>

          <Button
            variant="contained"
            color="error"
            disabled={checkedItems.every((v) => !v)}
            sx={{ minWidth: isMobile ? "100%" : 80 }}
            onClick={() => {
              const remainingTransactions = transactions.filter(
                (_, idx) => !checkedItems[idx]
              );
              if (window.confirm("Are you sure you want to delete?")) {
                setTransactions(remainingTransactions);
                handleDeleteTransaction();
              } else {
                setCheckedItems(
                  Array(remainingTransactions.length).fill(false)
                );
              }
            }}
          >
            Delete
          </Button>
        </Box>
      </Paper>

      {/* Speed Dial */}
      <SpeedDial
        ariaLabel="Add Transaction"
        sx={{ position: "fixed", bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
        open={openSpeedDial}
        onOpen={() => setOpenSpeedDial(true)}
        onClose={() => setOpenSpeedDial(false)}
      >
        <SpeedDialAction
          icon={<EditIcon />}
          tooltipTitle="Manual Entry"
          onClick={() => {
            setOpenSpeedDial(false);
            setOpenManualEntryDialog(true);
          }}
        />
        <SpeedDialAction
          icon={<MicIcon />}
          tooltipTitle="Voice Entry"
          onClick={() => {
            setOpenSpeedDial(false);
            setOpenVoiceDialog(true);
          }}
        />
      </SpeedDial>

      <Dialog
        open={openVoiceDialog}
        onClose={() => setOpenVoiceDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Voice Transaction Entry</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={voiceText}
            onChange={(e) => setVoiceText(e.target.value)}
            placeholder="Speak or type your transaction details..."
            sx={{ mt: 2 }}
          />
          <IconButton
            onClick={handleVoiceCapture}
            color={listening ? "primary" : "default"}
            sx={{ mt: 2 }}
          >
            <MicIcon />
          </IconButton>
          {listening && <Typography color="primary">Listening...</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenVoiceDialog(false)}>Cancel</Button>
          <Button
            onClick={handleVoiceSubmit}
            variant="contained"
            color="primary"
          >
            Add Transaction
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openManualEntryDialog}
        onClose={() => setOpenManualEntryDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Add Transaction</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: isMobile ? 1 : 2,
              alignItems: isMobile ? "stretch" : "center",
              width: "100%",
              flexWrap: "wrap",
              py: 2,
            }}
          >
            <TextField
              label="Date"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              fullWidth={isMobile}
              sx={{ my: 1, flex: 1, minWidth: isMobile ? "100%" : 120 }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              fullWidth={isMobile}
              sx={{ my: 1, flex: 2, minWidth: isMobile ? "100%" : 120 }}
            />
            <TextField
              label="Category"
              name="category"
              select
              value={formData.category}
              onChange={handleChange}
              fullWidth={isMobile}
              sx={{ my: 1, flex: 1, minWidth: isMobile ? "100%" : 120 }}
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
              fullWidth={isMobile}
              sx={{ my: 1, flex: 1, minWidth: isMobile ? "100%" : 100 }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            variant="text"
            onClick={() => setOpenManualEntryDialog(false)}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddTransaction}
          >
            Add Transaction
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default TransactionPage;
