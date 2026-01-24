import React, { useEffect, useState, useRef } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  MenuItem,
  useMediaQuery,
  Box,
  Menu,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import { Chip, Avatar, Card, CardContent, Divider } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

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
import Edit from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/Delete";
import toast, { Toaster } from "react-hot-toast";
import { useLoading } from "../contexts/LoadingContext";


function groupTransactions(transactions) {
  const groups = {};
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  transactions.forEach((txn) => {
    const txnDate = new Date(txn.date);
    let groupKey = txnDate.toDateString();

    if (
      txnDate.getDate() === today.getDate() &&
      txnDate.getMonth() === today.getMonth() &&
      txnDate.getFullYear() === today.getFullYear()
    ) {
      groupKey = "Today";
    } else if (
      txnDate.getDate() === yesterday.getDate() &&
      txnDate.getMonth() === yesterday.getMonth() &&
      txnDate.getFullYear() === yesterday.getFullYear()
    ) {
      groupKey = "Yesterday";
    } else {
      groupKey = txnDate.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    if (!groups[groupKey]) groups[groupKey] = [];
    groups[groupKey].push(txn);
  });

  // Keep order: Today, Yesterday, then others by date descending
  const ordered = {};
  if (groups["Today"]) ordered["Today"] = groups["Today"];
  if (groups["Yesterday"]) ordered["Yesterday"] = groups["Yesterday"];
  Object.keys(groups)
    .filter((k) => k !== "Today" && k !== "Yesterday")
    .sort(
      (a, b) =>
        new Date(groups[b][0].date).getTime() -
        new Date(groups[a][0].date).getTime()
    )
    .forEach((k) => (ordered[k] = groups[k]));
  return ordered;
}

function TransactionPage({ transactionsData, categories, getCategoryIcon }) {

  const {setLoading} = useLoading();
  const [transactions, setTransactions] = useState([...transactionsData]);
  const token = localStorage.getItem("token");
  const [checkAll, setCheckAll] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const [checkedItems, setCheckedItems] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const [openSpeedDial, setOpenSpeedDial] = useState(false);
  const [openVoiceDialog, setOpenVoiceDialog] = useState(false);
  const [openManualEntryDialog, setOpenManualEntryDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [editFormData, setEditFormData] = useState({
    _id: "",
    date: "",
    note: "",
    category: "",
    amount: "",
  });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
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
    setTransactions(transactionsData);
    
  }, [transactionsData]);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
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

  const handleVoiceSubmit = async () => {
    setLoading(true);
    try{
      // Here you can process the voice text and create a transaction
      const response = await fetch("http://localhost:8000/validate", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sentence: voiceText,
        }),
      });
  
      const validatedVoiceText = await response.json();
  
      if (!validatedVoiceText) toast.error("Invalid input, please try again",{
        duration: 5000,
      })
      else {
        const response = await fetch("http://localhost:8000/convert",{
          method: "POST",
          headers:{
            "content-type": "application/json",
          },
          body: JSON.stringify({
          sentence: voiceText,
          }),
        })
        
        const transaction = JSON.parse(await response.json());
        console.log("Transaction from voice:", transaction);
        if(!!transaction){
          handleAddTransactionviaVoice(transaction);
        }
        else throw new error("An error occurred while processing your voice input. Retry again!",{
          duration: 5000,
        })
        setLoading(false);
        setOpenVoiceDialog(false);
      }
      // You might want to use AI to parse the text into transaction details
    }catch(error){
      console.error("Error processing voice input:", error);
      toast.error("An error occurred while processing your voice input. Retry again!",{
        duration: 5000,
      });
    }finally{
      setLoading(false);
      setVoiceText("");
    }

  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddTransaction = async () => {
    setLoading(true);
    if (
      formData.date &&
      formData.description &&
      formData.category &&
      formData.amount
    ) {
      const response = await fetch("http://localhost:5000/transactions/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
      toast.success("Transaction added successfully", {
        duration: 3000,
      });
      setFormData({ date: "", description: "", category: "", amount: "" });
      setOpenManualEntryDialog(false);
      setLoading(false);
    }
  };


  const handleAddTransactionviaVoice = async (transaction) => {
    try{
      if (
        transaction.note &&
        transaction.category &&
        transaction.amount
      ) {
        const response = await fetch("http://localhost:5000/transactions/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            date: new Date().toISOString().split("T")[0],
            userId: localStorage.getItem("userId"),
            note: transaction.note,
            type: transaction.type,
            source: "voice",
            category: transaction.category,
            amount: parseFloat(transaction.amount),
          }),
        });
        const newTxn = await response.json();
        console.log(newTxn);
  
        setTransactions([newTxn.transaction, ...transactions]); // Add to top
        toast.success("Transaction added successfully", {
          duration: 3000,
        });
        setOpenVoiceDialog(false);
      }
    }catch (error) {
      console.error("Error adding transaction via voice:", error);
      toast.error("An error occurred while adding the transaction. Please try again.", {
        duration: 5000,
      });
    }finally{
      setVoiceText("");
      setLoading(false);
    }
  }
 

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTransaction(null);
  };

  const handleMenuOpen = (e, transaction) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
    setSelectedTransaction(transaction);
    // console.log("Selected Transaction:", transaction);
  };

  const handleEdit = () => {
    if (selectedTransaction) {
      setEditFormData({
        _id: selectedTransaction._id,
        date: selectedTransaction.date.split("T")[0],
        note: selectedTransaction.note,
        category: selectedTransaction.category,
        amount: selectedTransaction.amount,
      });
      setOpenEditDialog(true);
      handleMenuClose();
    }
  };
  const handleDelete = () => {
    // console.log("Selected Transaction for Deletion:", selectedTransaction);

    setOpenDeleteDialog(true);
    // handleMenuClose();
    // console.log("after closing menu:", selectedTransaction);
  };


  const handleDeleteTransaction = () => {
    console.log("@ handleDelete Transaction: ", selectedTransaction);

    fetch("http://localhost:5000/transactions/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ids: [selectedTransaction._id],
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setTransactions((prev) =>
          prev.filter((txn) => txn._id !== selectedTransaction._id)
        );
        handleMenuClose();
        setOpenDeleteDialog(false);
        toast.success("Transaction deleted successfully");
      })
      .catch((error) => {
        console.error("Error deleting transaction:", error);
      });
  };

  const handleEditFormChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEditSave = async () => {
    const response = await fetch(
      `http://localhost:5000/transactions/update/${editFormData._id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: editFormData._id,
          date: editFormData.date,
          note: editFormData.note,
          category: editFormData.category,
          amount: parseFloat(editFormData.amount),
        }),
      }
    );
    const updated = await response.json();
    // Update local state
    toast.success("Transaction updated successfully")
    setTransactions((prev) =>
      prev.map((txn) =>
        txn._id === editFormData._id ? { ...txn, ...editFormData } : txn
      )
    );
    setOpenEditDialog(false);
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

  const grouped = groupTransactions(transactions);

  return (
    <Container  disableGutters maxWidth="sm" sx={{ mt: 3, mb: 3 }}>
      <Toaster/>
      <Typography variant="h4" fontWeight={700}>
        Transactions
      </Typography>
      <Typography variant="subtitle1" sx={{ pl: 1, mb: 2 }}>
        Manage your transactions
      </Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexDirection: { xs: "column", sm: "row" } }}>

        <TextField
          label="Search"
          variant="outlined"
          size="small"
          fullWidth
          sx={{ flex: 2 }}
          value={formData.search || ""}
          onChange={e => {
            const value = e.target.value;
            setFormData(prev => ({ ...prev, search: value }));
            const filtered = transactionsData.filter(txn => {
              const noteMatch = txn.note?.toLowerCase().includes(value.toLowerCase());
              const amountMatch = value && !isNaN(value) && Number(txn.amount) === Number(value);
              return noteMatch || amountMatch;
            });
            setTransactions(
              (formData.category && formData.category !== "")
                ? filtered.filter(txn => txn.category === formData.category)
                : filtered
            );
          }}
          placeholder="Search by description or amount..."
        />

        <TextField
          label="Category"
          name="category"
          select
          size="small"
          fullWidth
          sx={{ flex: 1, minWidth: 120 }}
          value={formData.category || ""}
          onChange={e => {
            // console.log(formData);
            
            const value = e.target.value;
            setFormData(prev => ({ ...prev, category: value }));
            const filtered = transactionsData.filter(txn => {
              const searchVal = formData.search || "";
              const noteMatch = txn.note?.toLowerCase().includes(searchVal.toLowerCase());
              const amountMatch = searchVal && !isNaN(searchVal) && Number(txn.amount) === Number(searchVal);
              return !formData.search || noteMatch || amountMatch;
            });
            setTransactions(
              value=== "expenses"
              ?filtered.filter(txn=>txn.type === "expense")
              :value
                ? filtered.filter(txn => txn.category === value) 
                : filtered
            );
          }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value = "expenses">All Expenses</MenuItem>
          {categories.map(option => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
      </Box>
      <Box>
        {Object.entries(grouped).map(([group, txns]) => (
          <Box key={group} sx={{ mb: 2 }}>
            <Typography
              variant="subtitle1"
              sx={{ color: "#1976d2", fontWeight: 600, mb: 1, ml: 1 }}
            >
              {group}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {txns.map((txn, idx) => (
              <Card
                key={txn._id || idx}
                sx={{
                  mb: 2,
                  borderRadius: 3,
                  boxShadow: 2,
                  p: 2,
                  display: "flex",
                  alignItems: "stretch",
                  justifyContent: "space-between",
                  width: isMobile ? "100%" : "auto", // full width on mobile
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: txn.type === "income" ? "#16a34a" : "#dc2626",
                      mr: 2,
                      flexShrink: 0,
                    }}
                  >
                    {getCategoryIcon(txn.category)}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight={700}
                      sx={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: { xs: 120, sm: 180, md: 220 },
                      }}
                    >
                      {txn.note}
                    </Typography>
                    <Chip
                      label={txn.category}
                      size="small"
                      sx={{ mt: 0.5, maxWidth: 120 }}
                    />
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    minWidth: 110,
                    ml: 2,
                    flexShrink: 0,
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{
                      color: txn.type === "income" ? "#16a34a" : "#dc2626",
                      textAlign: "right",
                      minWidth: 90,
                    }}
                  >
                    {txn.type === "income"
                      ? `+₹${Number(txn.amount).toFixed(2)}`
                      : `-₹${Number(txn.amount).toFixed(2)}`}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#888",
                      fontSize: "0.9rem",
                      textAlign: "right",
                    }}
                  >
                    {new Date(txn.date).toLocaleDateString()}
                  </Typography>
                </Box>
                <IconButton
                  sx={{ ml: 1, alignSelf: "center" }}
                  onClick={(e) => handleMenuOpen(e, txn)}
                >
                  <MoreVertIcon />
                </IconButton>
              </Card>
            ))}
          </Box>
        ))}

        {/* contextMenu */}

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: { borderRadius: 2 },
          }}
        >
          <MenuItem onClick={handleEdit}>
            <Edit sx={{ mr: 1, fontSize: 20 }} />
            Edit
          </MenuItem>
          <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
            <Delete sx={{ mr: 1, fontSize: 20 }} />
            Delete
          </MenuItem>
        </Menu>
      </Box>

      {/* Speed Dial */}
      <SpeedDial
        ariaLabel="Add Transaction"
        sx={{ position: "fixed", bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
        open={openSpeedDial}
        onClick={()=>setOpenSpeedDial(!openSpeedDial)}
        // onOpen={() => setOpenSpeedDial(true)}
        // onClose={() => setOpenSpeedDial(false)}
      >
        <SpeedDialAction
          icon={<EditIcon />}
          tooltipTitle="Manual Entry"
          onClick={(e) => {
            e.stopPropagation();
            setOpenSpeedDial(false);
            setOpenManualEntryDialog(true);
          }}
        />
        <SpeedDialAction
          icon={<MicIcon />}
          tooltipTitle="Voice Entry"
          onClick={(e) => {
            e.stopPropagation();
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
            placeholder={`Speak or type your transaction details...\nE.g., 'Bought groceries for 500 rupees'`}
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
        slotProps={{
          paper: {
            sx: { borderRadius: 5, p: 2 },
          },
        }}
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
              defaultValue={formData.date}
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
          <Button variant="contained" onClick={handleAddTransaction}>
            Add Transaction
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        fullWidth
        maxWidth="md"
        slotProps={{
          paper: {
            sx: { borderRadius: 5, p: 2 },
          },
        }}
      >
        <DialogTitle>Edit Transaction</DialogTitle>
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
              value={editFormData.date}
              onChange={handleEditFormChange}
              fullWidth={isMobile}
              sx={{ my: 1, flex: 1, minWidth: isMobile ? "100%" : 120 }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Description"
              name="note"
              value={editFormData.note}
              onChange={handleEditFormChange}
              fullWidth={isMobile}
              sx={{ my: 1, flex: 2, minWidth: isMobile ? "100%" : 120 }}
            />
            <TextField
              label="Category"
              name="category"
              select
              value={editFormData.category}
              onChange={handleEditFormChange}
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
              value={editFormData.amount}
              onChange={handleEditFormChange}
              fullWidth={isMobile}
              sx={{ my: 1, flex: 1, minWidth: isMobile ? "100%" : 100 }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button variant="text" onClick={() => setOpenEditDialog(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleEditSave}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        fullWidth
        maxWidth="md"
        slotProps={{
          paper: {
            sx: { borderRadius: 5, p: 2 },
          },
        }}
      >
        <DialogTitle>Delete Transactions</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete the selected transactions?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button variant="text" onClick={() => setOpenDeleteDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteTransaction}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default TransactionPage;
