import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import TransactionPage from "./Pages/TransactionPage.jsx";
import Dashboard from "./Pages/Dashboard.jsx";
import Login from "./Pages/Login.jsx";
import Signup from "./Pages/Signup.jsx";
import Layout from "./Pages/Layout.jsx";
import Profile from "./Pages/Profile.jsx";

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
import { Navigate } from "react-router-dom";


const BACKEND_SERVER = import.meta.env.VITE_BACKEND_SERVER_URL;
function AppContent() {
  const { isAuthenticated } = useAuth();
  const token = localStorage.getItem("token");

  const categories = [
    "Income",
    "Groceries and Utilities",
    "Transportation",
    "Medical & Healthcare",
    "Food and drinks",
    "Shopping",
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
    if (!token) return;

    fetch(`${BACKEND_SERVER}/transactions/get`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then(setTransactions)
      .catch(console.error);
  }, [token]);

  return (
    <Router>
      <Routes>
        {!isAuthenticated() ? (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <Dashboard
                  transactionsData={transactions}
                  categories={categories}
                  getCategoryIcon={getCategoryIcon}
                />
              }
            />
            <Route
              path="dashboard"
              element={
                <Dashboard
                  transactionsData={transactions}
                  categories={categories}
                  getCategoryIcon={getCategoryIcon}
                />
              }
            />
            <Route
              path="transactions"
              element={
                <TransactionPage
                  transactionsData={transactions}
                  categories={categories}
                  getCategoryIcon={getCategoryIcon}
                />
              }
            />
            <Route path="profile" element={<Profile />} />
          </Route>
        )}
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
