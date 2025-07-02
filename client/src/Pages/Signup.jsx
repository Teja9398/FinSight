import React, { useState } from 'react';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';



import {
Container,
Box,
Typography,
TextField,
Button,
Link,
Avatar,
Grid,
Paper,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Toaster,toast } from 'react-hot-toast';

const Signup = () => {
const { signup } = useAuth();

const [form, setForm] = useState({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
});

const [error, setError] = useState('');

const handleChange = (e) => {
      setForm({ ...form, [e.target.name]: e.target.value });
      setError('');
};

const handleSubmit = async (e) => {
      e.preventDefault();
      if (form.password !== form.confirmPassword) {
            setError('Passwords do not match');
            return;
      }
      // Handle signup logic here (API call, etc.)
      // Reset form or redirect on success
      // fetch('http://localhost:7000/signup', {
      //       method:'POST',
      //       headers:{'Content-Type': 'application/json'},
      //       body: JSON.stringify({
      //             name: form.name,
      //             email: form.email,
      //             password: form.password,
      //             authProvider: 'local'
      //       }),
      // })
      // .then((response) => {
      //       if(response.status === 201) {
      //             alert('User registered successfully');
      //             setForm({
      //                   name: '',
      //                   email: '',
      //                   password: '',
      //                   confirmPassword: '',
      //             });
      //             window.location.href = '/'; // Redirect to login page
      //       }else{
      //             return response.json().then(data => {
      //                   throw new Error(data.message || 'Signup failed');
      //             });
      //       }

      // })
      const result = await signup(form.name, form.email, form.password)
      if (result) {
            setForm({
                  name: '',
                  email: '',
                  password: '',
                  confirmPassword: '',
            });
            toast.success('Signup successful', {
                  position: 'top-center',
                  duration: 3000,
            });
            window.location.href = '/login'; // Redirect to login page
      } else {
            toast.error('Signup failed. Please try again.', {
                  position: 'top-center',
            });
            setError('Signup failed. Please try again.');
      }


};

return (
      <Container component="main" maxWidth="xs">
            <Toaster/>
            <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
                  <Box display="flex" flexDirection="column" alignItems="center">
                        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                              <LockOutlinedIcon />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                              Sign Up
                        </Typography>
                        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                              <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    label="Name"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    autoFocus
                              />
                              <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    label="Email Address"
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                              />
                              <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    label="Password"
                                    name="password"
                                    type="password"
                                    value={form.password}
                                    onChange={handleChange}
                              />
                              <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    label="Confirm Password"
                                    name="confirmPassword"
                                    type="password"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                              />
                              {error && (
                                    <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                                          {error}
                                    </Typography>
                              )}
                              <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    sx={{ mt: 3, mb: 2 }}
                              >
                                    Sign Up
                              </Button>
                              <Grid container justifyContent="flex-end">
                                    <Grid item>
                                          <Link href="/login" variant="body2">
                                                Already have an account? Sign in
                                          </Link>
                                    </Grid>
                              </Grid>
                        </Box>
                  </Box>
            </Paper>
      </Container>
);
};

export default Signup;