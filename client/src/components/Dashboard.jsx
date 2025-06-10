import React, { useEffect, useState } from "react";
import {
  Typography,
  Card,
  Container,
  useMediaQuery,
  useTheme,
  Table
} from "@mui/material";
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

function Dashboard() {
  const [data, setData] = useState([
    { amount: 200, category: "Food" },
    { amount: 300, category: "Transport" },
  ]);
  const [lineData, setLineData] = useState();
  const [incomeData, setIncomeData] = useState();
  const [expenseData, setExpenseData] = useState();

  const filledLineData = (lineData||[]).map(d=>({
    ...d,
    income:d.income ?? 0,
    expenses: d.expenses ?? 0,
  }));

  const summary = ["Total Income this Month", "Total Expenses this month","Balance This month" ,"Net Balance (Overall)"];
  const [summaryData,setSummaryData] = useState({income:null,expense:null});

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042","#8377c7"];
  const [NetBalance,SetNetBalance] = useState(0);


  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    fetch(
      `http://localhost:5000/transactions/getbycat/${localStorage.getItem(
        "userId"
      )}`
    )
      .then((response) => response.json())
      .then((data) => {
        // console.log(data);
        setData(data);
      });

    fetch(
      `http://localhost:5000/transactions/getincomeandexp/${localStorage.getItem(
        "userId"
      )}`
    )
      .then((response) => response.json())
      .then((data) => {
        // console.log("line data:", data);
        setLineData(data);
      });
    
      fetch(`http://localhost:5000/transactions/totalincomeandexpenses/${localStorage.getItem('userId')}`)
      .then(response =>response.json())
      .then((data)=>{
        // console.log("summary data: ",data);
        setSummaryData(data);
      })
      fetch(`http://localhost:5000/transactions/getnetbalance/${localStorage.getItem('userId')}`)
      .then(response =>response.json())
      .then((data)=>{
        SetNetBalance(data.netbalance);
      })
  }, []);

  return (
    <>
      <Container
        sx={{
          width: isMobile ? "100%" : "100%",
          py: 2,
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: "center",
          justifyContent: isMobile ? "center" : "end",
          px: isMobile ? 1 : 4,
          gap: isMobile ? 2 : 4,
        }}
      >
        {summary.map((item, index) => (
          <Card
            key={index}
            sx={{
              width: isMobile ? "100%" : "100%",
              maxWidth: 220,
              mx: isMobile ? 0 : "auto",
              mb: isMobile ? 2 : 0, 
              p: 2,
              boxShadow: 3,
              borderRadius: 4,
              bgcolor: "white",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
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
              sx={{ color: index == 0 ? "Blue" : index == 1 ? "#FF9800" : "green" }}
            >
              ₹
              {index == 0
                ? summaryData.income
                : index == 1
                ? summaryData.expense
                : index == 2?summaryData.income - summaryData.expense:NetBalance}
            </Typography>
          </Card>
        ))}
      </Container>
      <Container
        sx={{
          width: "100%",
          py: 1,
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: "center",
          justifyContent: isMobile ? "center" : "end",
          px: isMobile ? 1 : 4,
          gap: isMobile ? 2 : 4,
        }}
      >
        <Card
          sx={{
            width: isMobile ? "100%" : "100%",
            maxWidth: 400,
            mx: isMobile ? 0 : "auto",
            mb: isMobile ? 2 : 0,
            p: isMobile ? 2 : 3,
            boxShadow: 3,
            borderRadius: 4,
            bgcolor: "white",
          }}
        >
          <Typography
            variant="h6"
            align="left"
            fontWeight="bold"
            sx={{ mb: 2 }}
          >
            Expenses by Category
          </Typography>

          <ResponsiveContainer width="100%" height={isMobile ? 200 : 250}>
            <PieChart>
              <Tooltip />
              <Legend
                layout={isMobile ? "horizontal" : "vertical"}
                verticalAlign={isMobile ? "bottom" : "middle"}
                align={isMobile ? "center" : "right"}
              />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={isMobile ? 60 : 80}
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
            width: isMobile ? "100%" : "100%",
            maxWidth: 400,
            mx: isMobile ? 0 : "auto",
            p: isMobile ? 2 : 3,
            boxShadow: 3,
            borderRadius: 4,
            bgcolor: "white",
          }}
        >
          <Typography
            variant="h6"
            align="left"
            fontWeight="bold"
            sx={{ mb: 2 }}
          >
            Income vs Expenses
          </Typography>
          <ResponsiveContainer width="100%" height={isMobile ? 200 : 250}>
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
          </ResponsiveContainer>
        </Card>
      </Container>
      {/* <Container>

        <Card>
          <Table>
            To be developed
          </Table>
        </Card>
      </Container> */}
    </>
  );
}

export default Dashboard;
