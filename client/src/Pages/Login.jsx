import React, { useState,useEffect } from "react";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Paper,
  Link,
} from "@mui/material";
import toast,{Toaster}  from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useLoading } from "../contexts/LoadingContext.jsx";

const AUTH_SERVER = import.meta.env.VITE_AUTH_SERVER_URL;



const Login = () => {

  const{setLoading} = useLoading();
  const {login} = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    // console.log(form);
    const result = await login(form.email, form.password); 
    if (result) {
      
      toast.success("Login successful", {
        position: "top-center",
        duration: 3000,
      });
      setLoading(false);
      window.location.href = "/";
    } else {
      toast.error("Login failed. Please check your credentials.", {
        position: "top-center",
      });
      setLoading(false);
    }
  };


  
  return (
    <Container component="main" maxWidth="xs">
      <Toaster />
      <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={form.email}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
          </Box>
        </Box>
      <Typography variant="body2" color="text.secondary" align="center">
        Don't have an account? <Link href="/signup" color="primary">Register.</Link>
      </Typography>
      </Paper>
    </Container>
  );
};

export default Login;
