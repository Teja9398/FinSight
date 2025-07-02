import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import TransactionPage from "./Pages/TransactionPage.jsx";
import Dashboard from "./Pages/Dashboard.jsx";
import Login from "./Pages/Login.jsx";
import Signup from "./Pages/Signup.jsx";
import Layout from "./Pages/Layout.jsx";

import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import WorkIcon from "@mui/icons-material/Work";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

import { AuthProvider, useAuth } from "./contexts/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { LoadingProvider } from "./contexts/LoadingContext.jsx";
import GlobalLoadingOverlay from "./components/GlobalLoadingOverlay.jsx";

function AppContent() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated()) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<Login />} />
        </Routes>
      </Router>
    );
  }

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
  const [transactions, setTransactions] = useState([]);
  useEffect(() => {
    fetch("http://localhost:5000/transactions/get", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setTransactions(data);
        // setCheckedItems(new Array(data.length).fill(false));
      })
      .catch((error) => {
        console.error("Error fetching transactions:", error);
      });
  }, []);
  const token = localStorage.getItem("token");

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard
                  transactionsData={transactions}
                  categories={categories}
                  getCategoryIcon={getCategoryIcon}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard
                  transactionsData={transactions}
                  categories={categories}
                  getCategoryIcon={getCategoryIcon}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <TransactionPage
                  transactionsData={transactions}
                  categories={categories}
                  getCategoryIcon={getCategoryIcon}
                />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <LoadingProvider>
      <GlobalLoadingOverlay />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LoadingProvider>
  );
}
export default App;
