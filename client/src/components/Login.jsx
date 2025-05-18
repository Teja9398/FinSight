import React, { useState } from 'react';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import {
Container,
Box,
Typography,
TextField,
Button,
Avatar,
Paper,
} from '@mui/material';

const Login = () => {
const [form, setForm] = useState({ email: '', password: '' });

const handleChange = (e) => {
      setForm({ ...form, [e.target.name]: e.target.value });
};

const handleSubmit = (e) => {
      e.preventDefault();
      // Handle login logic here
      console.log(form);
      fetch('http://localhost:5000/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                  email: form.email,
                  passwordHash: form.password,
            }),
      })
            .then((response) => response.json())
            .then((data) => {
                  console.log('Login successful:', data);
                  // Redirect to dashboard or handle login success
                  if(data.token){
                        localStorage.setItem('token', data.token);
                        alert('Login successful');
                        window.location.href = '/';
                  }
                  else{
                        alert('Login failed');
                  }
            })
            .catch((error) => {
                  console.error('Error during login:', error);
            });
};

return (
      <Container component="main" maxWidth="xs">
            <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
                  <Box
                        sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                        }}
                  >
                        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
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
            </Paper>
      </Container>
);
};

export default Login;