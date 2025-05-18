import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import { Container, Typography } from "@mui/material";
import Navbar from "./components/Navbar.jsx";
import TransactionPage from "./components/TransactionPage.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Login from "./components/Login.jsx";
import Signup from "./components/Signup.jsx";


function App() {
  const token = localStorage.getItem("token");

  return (
      <Container
        component="root"
        sx={{ minWidth: "100vw", bgcolor: "#f5f5f5", minHeight: "100vh" }}
      >
        <Router>
          {!!token && <Navbar />}
          <Routes>
            <Route path="/" element={!!token ? <Dashboard /> : <Login />} />
            <Route
              path="/transactions"
              element={!!token ? <TransactionPage /> : <Login />}
            />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </Router>
      </Container>
  );
}

export default App;
