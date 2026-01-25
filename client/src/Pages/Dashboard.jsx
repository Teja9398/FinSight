import React, { useEffect, useState } from "react";
import {
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  Container,
  useMediaQuery,
  useTheme,
  Table,
  Box,
} from "@mui/material";
import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Chip,
} from "@mui/material";
import { Margin, MoreVert } from "@mui/icons-material";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";


import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import WorkIcon from "@mui/icons-material/Work";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useAuth } from "../contexts/AuthContext";


const categories = [
  "Income",
  "Groceries and Utilities",
  "Transportation",
  "Medical & Healthcare",
  "Food and drinks",
  "other",
];

const getCategoryIcon = (category) => {
  switch (category) {
    case "Food and drinks":
    case "Food":
      return <RestaurantIcon />;
    case "Transportation":
    case "Transport":
      return <LocalGasStationIcon />;
    case "Salary":
    case "Income":
      return <WorkIcon />;
    case "Medical & Healthcare":
      return <LocalHospitalIcon />;
    case "Groceries and Utilities":
      return <ShoppingCartIcon />;
    default:
      return <AttachMoneyIcon />;
  }
};

function Dashboard({transactionsData}) {
  const {user} = useAuth(); 
  const [data, setData] = useState([
    { amount: 200, category: "Food" },
    { amount: 300, category: "Transport" },
  ]);
  const BACKEND_SERVER = import.meta.env.VITE_BACKEND_SERVER_URL;
  const [recentTransactions, setRecentTransactions] = useState(transactionsData.slice(0, 5));
  const [lineData, setLineData] = useState();
  const [incomeData, setIncomeData] = useState();
  const [expenseData, setExpenseData] = useState();

  const filledLineData = (lineData || []).map((d) => ({
    ...d,
    income: d.income ?? 0,
    expenses: d.expenses ?? 0,
  }));

  const summary = [
    "Total Expenses this month",
    "Balance This month",
  ];
  const [summaryData, setSummaryData] = useState({
    income: 0,
    expense: 0,
  });

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8377c7"];
  const [NetBalance, SetNetBalance] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {

    fetch(`${BACKEND_SERVER}/transactions/getbycat`, {
      headers: { authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((response) => response.json())
      .then((data) => {
        // console.log("data from /getbycat", data);
        setData(data);
      });

    fetch(`${BACKEND_SERVER}/transactions/getincomeandexp`, {
      headers: { authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((response) => response.json())
      .then((data) => {
        // console.log("line data:", data);
        setLineData(data);
      });

    fetch(`${BACKEND_SERVER}/transactions/totalincomeandexpenses`, {
      headers: { authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((response) => response.json())
      .then((data) => {
        // console.log("summary data: ",data);
        setSummaryData(data);
      });
    fetch(`${BACKEND_SERVER}/transactions/getnetbalance`, {
      headers: { authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((response) => response.json())
      .then((data) => {
        SetNetBalance(data.netbalance);
      });
  }, []);

  useEffect(() => {
    setRecentTransactions(transactionsData.slice(0, 5));
  },[transactionsData]);

  return (
    <Box
      sx={{
        ml: { xs: 0, md: 0 }, // Remove left margin
        display: "flex",
        flexDirection: "column",
        alignItems: { xs: "center", md: "stretch" }, // Center on mobile
      }}
    >
      <Typography
        variant="h4"
        fontWeight={700}
        sx={{ mb: 0.5, textAlign: { xs: "center", md: "left" } }}
      >
        Dashboard
      </Typography>
      <Typography
        variant="subtitle1"
        color="text.secondary"
        sx={{ mb: 2, textAlign: { xs: "center", md: "left" } }}
      >
        Welcome back {user && user.name ? user.name : ""}! Here's your financial overview.
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          mb: 4,
          alignItems: { xs: "center", md: "stretch" }, // Center cards on mobile
        }}
      >
        {summary.map((item, index) => (
          <Card
            key={index}
            sx={{
              flex: 1,
              minWidth: 100,
              p: 2,
              boxShadow: 2,
              borderRadius: 3,
              bgcolor: "#fff",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              height: 90,
              mx: { xs: "auto", md: 0 }, // Center card horizontally on mobile
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              {item}
            </Typography>
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{
                color: index === 0 ? "Blue" : index === 1 ? "#FF9800" : "green",
              }}
            >
              ₹
              {
                index === 0
                ? summaryData.expense? summaryData.expense
                : 0
                : index === 1
                ? summaryData.income - summaryData.expense
                : NetBalance} 
            </Typography>
          </Card>
        ))}
      </Box>
      <Card 
        sx={{
          width: "100%",
          maxWidth: 850,
          mx: { xs: "auto", md: 0 },
          mb: 3,
          p: 2,
          boxShadow: 3,
          borderRadius: 4,
          bgcolor: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          alignSelf: "center", 
        }}
      >
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{ mb: 2, textAlign: "center" }}
        >
          Savings Percentage (This Month)
        </Typography>
        {summaryData.income > 0 ? (
          <>
            <Box sx={{ width: "100%", mb: 1 }}>
              <Box
                sx={{
                  height: 20,
                  backgroundColor: "#f0f0f0",
                  borderRadius: 10,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    height: "100%",
                    width: `${Math.max(
                      0,
                      Math.min(
                        100,
                        ((summaryData.income - summaryData.expense) /
                          summaryData.income) *
                          100
                      )
                    ).toFixed(1)}%`,
                    background:
                      "linear-gradient(90deg, #00C49F 0%, #0088FE 100%)",
                    transition: "width 0.6s",
                  }}
                />
              </Box>
            </Box>
            <Typography variant="subtitle1" fontWeight="bold" color="primary">
              {Math.max(
                0,
                Math.min(
                  100,
                  ((summaryData.income - summaryData.expense) /
                    summaryData.income) *
                    100
                )
              ).toFixed(1)}
              % saved
            </Typography>
          </>
        ) : (
          <Typography variant="body2" color= "text.secondary" >
            No income data for this month.
          </Typography>
        )}
      </Card>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          mb: 2,
          alignItems: { xs: "center", md: "stretch" }, // Center charts on mobile
        }}
      >
        <Card
          sx={{
            width: "100%",
            maxWidth: 400,
            mx: { xs: "auto", md: 0 }, // Center card horizontally on mobile
            mb: 2,
            p: 2,
            boxShadow: 3,
            borderRadius: 4,
            bgcolor: "white",
          }}
        >
          <Typography
            variant="h6"
            align="left"
            fontWeight="bold"
            sx={{ mb: 2, textAlign: { xs: "center", md: "left" } }}
          >
            Expenses by Category
          </Typography>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Tooltip />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
              />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={60}
                dataKey="amount"
                nameKey="_id"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card
          sx={{
            width: "100%",
            maxHeight:250,
            maxWidth: 400,
            mx: { xs: "auto", md: 0 }, // Center card horizontally on mobile
            p: 2,
            boxShadow: 3,
            borderRadius: 4,
            bgcolor: "white",
          }}
        >
          <Typography
            variant="h6"
            align="left"
            fontWeight="bold"
            sx={{ mb: 2, textAlign: { xs: "center", md: "left" } }}
          >
            Income vs Expenses
          </Typography>
          <ResponsiveContainer width="100%" height={200}>
            {filledLineData.length!=0  &&(
            <LineChart data={filledLineData}>
              <CartesianGrid />
              <Tooltip
                formatter={(value, name, props) => [value, name]}
                labelFormatter={(label, payload) => {
                  if (
                    payload &&
                    payload.length > 0 &&
                    payload[0].payload &&
                    payload[0].payload.category
                  ) {
                    return payload[0].payload.category;
                  }
                  return label;
                }}
              />
              <Legend />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => {
                  const d = new Date(date);
                  const day = d.getDate();
                  const month = d.toLocaleString("default", { month: "short" });
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
                  return `${day}${getOrdinal(day)} ${month}`;
                }}
              />
              <YAxis />
              <Line
                type="monotone"
                strokeWidth={3}
                dataKey={"income"}
                nameKey="category"
                stroke="blue"
              />
              <Line
                type="monotone"
                strokeWidth={3}
                dataKey={"expenses"}
                nameKey="category"
                stroke="red"
              />
            </LineChart>
            ) || <Typography sx={{m:9,ml:15}}>No data available</Typography>}
          </ResponsiveContainer>
        </Card>
      </Box>
      <Card
        sx={{
          boxShadow: 3,
          borderRadius: 4,
          bgcolor: "white",
          mx: { xs: "auto", md: 0 }, // Center card horizontally on mobile
          width: { xs: "100%", md: "auto" },
        }}
      >
        <CardContent>
          <Typography
            variant="h6"
            sx={{ mb: 2, textAlign: { xs: "center", md: "left" } }}
          >
            Recent Transactions
          </Typography>
          <List sx={{ py: 0 }}>
            {recentTransactions.map((transaction, index) => (
              <ListItem
                key={index}
                sx={{
                  px: 3,
                  borderBottom:
                    index < recentTransactions.length - 1
                      ? "1px solidrgb(23, 23, 23)"
                      : "none",
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {getCategoryIcon(transaction.category)}
                </ListItemIcon>
                <ListItemText
                  primary={transaction.note}  
                  secondary={
                    <Box
                      component={"span"}
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "start",
                        gap: 1,
                        mt: 0.5,
                      }}
                    >
                      <Chip
                        component="span"
                        label={transaction.category}
                        size="small"
                        sx={{ fontSize: "0.7rem", height: 20 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {transaction.date.toString().split("T")[0]}
                      </Typography>
                    </Box>
                  }
                />
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    color:
                      transaction.type === "income"
                        ? "success.main"
                        : "error.main",
                    mr: 1,
                  }}
                >
                  {transaction.type === "income" ? "+" : "-"}₹
                  {transaction.amount.toFixed(2)}
                </Typography>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Dashboard;
