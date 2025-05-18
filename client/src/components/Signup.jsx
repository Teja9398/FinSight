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

const Signup = () => {
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

const handleSubmit = (e) => {
      e.preventDefault();
      if (form.password !== form.confirmPassword) {
            setError('Passwords do not match');
            return;
      }
      // Handle signup logic here (API call, etc.)
      // Reset form or redirect on success
      fetch('http://localhost:5000/users/register', {
            method:'POST',
            headers:{'Content-Type': 'application/json'},
            body: JSON.stringify({
                  name: form.name,
                  email: form.email,
                  passwordHash: form.password,
                  authProvider: 'local'
            }),
      })
};

return (
      <Container component="main" maxWidth="xs">
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