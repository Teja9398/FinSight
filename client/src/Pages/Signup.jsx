import React, { useState } from 'react';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";



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
duration,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useLoading } from '../contexts/LoadingContext.jsx';
import { Toaster,toast } from 'react-hot-toast';

const Signup = () => {
const { signup } = useAuth();
const { setLoading } = useLoading();
const [form, setForm] = useState({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
});

const [error, setError] = useState('');

 const [otpOpen, setOtpOpen] = useState(false);
            const [otp, setOtp] = useState('');

            const handleOtpOpen = () => setOtpOpen(true);
            const handleOtpClose = () => setOtpOpen(false);

            const handleOtpSubmit = () => {
                  // Handle OTP verification logic here
                  toast.success('OTP submitted!');
                  setOtp('');
                  setOtpOpen(false);
            };

const handleChange = (e) => {
      setForm({ ...form, [e.target.name]: e.target.value });
      setError('');
};

const handleSignup = async (e) => {
      // e.preventDefault();
      if (form.password !== form.confirmPassword) {
            setError('Passwords do not match');
            return;
      }
      // Handle signup logic here (API call, etc.)
      // Reset form or redirect on success
      // setLoading(true);
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
      //             toast.success('User registered successfully', {
      //                   position: 'top-center',
      //                   duration: 5000,
      //             });
      //             setForm({
      //                   name: '',
      //                   email: '',
      //                   password: '',
      //                   confirmPassword: '',
      //             });
      //             setLoading(false);
      //             window.location.href = '/login'; // Redirect to login page
      //       }else{
      //             setLoading(false);
      //             toast.error('Signup failed. Please try again.', {
      //                   position: 'top-center',
      //                   duration: 7000
      //             });
      //             return response.json().then(data => {
      //                   throw new Error(data.message || 'Signup failed');
      //             });
      //       }

      // })
      setLoading(true);
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
      setLoading(false); 
};

const checkUserExistence = async () => {
      try {
            const response = await fetch('http://localhost:7000/getuseremails');
            const data = await response.json();
            if(data === null || data === undefined){
                  toast.error('Network Error', {
                        position: 'top-center',
                        duration: 5000,
                  });
                  return null;
            }
            return data.includes(form.email);
      } catch (error) {
            console.log("error checking user existence",error);
            console.error('Error checking user existence:', error);
            return false;
      }
};

return (
      <Container component="main" maxWidth="xs">
            <Toaster />
            <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
                  <Box display="flex" flexDirection="column" alignItems="center">
                        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                              <LockOutlinedIcon />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                              Sign Up
                        </Typography>
                        <Box
                              component="form"
                              onSubmit={async (e) => {
                                    e.preventDefault();
                                    if (form.password !== form.confirmPassword) {
                                          setError('Passwords do not match');
                                          return;
                                    }
                                    // Call backend API to generate and send OTP
                                    try {
                                   
                                    // if(checkUserExistence == null){
                                    //       toast.error('Network Error. Please try again.', {
                                    //             position: 'top-center',
                                    //             duration: 5000,
                                    //       });
                                    //       return;
                                    // }
                                    if(await checkUserExistence()){
                                          toast.error('User with this email already exists', {
                                                position: 'top-center',
                                                duration: 5000,
                                          });
                                          setError('User with this email already exists');
                                          return;
                                    }     
                                          setLoading(true);
                                          const res = await fetch('http://localhost:7000/send-otp', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                      name: form.name,
                                                      email: form.email,
                                                      password: form.password,
                                                }),
                                          });
                                          const data = await res.json();    
                                          setLoading(false);
                                          // console.log('=====res OTP:', res.ok?true:false,'\n\n====== res data OTP:',data);
                                            
                                          if (res.ok && data.success) {
                                                toast.success('OTP sent to your email!', {
                                                      position: 'top-center',
                                                      duration: 5000,
                                                });
                                                
                                                handleOtpOpen();
                                          } else {
                                                toast.error(data.message || 'Failed to send OTP.', {
                                                      position: 'top-center',
                                                });
                                                setError(data.message || 'Failed to send OTP.');
                                          }
                                    } catch (err) {
                                          toast.error('Network error. Please try again.', {
                                                position: 'top-center',
                                          });
                                          // setError('Network error. Please try again.');
                                          setLoading(false);
                                    }
                              }}
                              sx={{ mt: 2 }}
                        >
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
                                    onChange={e=>{
                                          handleChange(e)
                                          // console.log("in form password",e.target.name == "password");
                                          
                                          if(form.password.length>0){
                                                if(e.target.value !== form.confirmPassword){
                                                      setError('Passwords do not match');
                                                }
                                          }
                                    }}
                              />
                              <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    label="Confirm Password"
                                    name="confirmPassword"
                                    type="password"
                                    value={form.confirmPassword}
                                    onChange={(e) => {
                                          handleChange(e);
                                          if (e.target.value !== form.password) {
                                                setError('Passwords do not match');
                                          } else {
                                                setError('');
                                          }
                                    }}
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

            <Dialog open={otpOpen} onClose={handleOtpClose}>
                  <DialogTitle>OTP Verification</DialogTitle>
                  <DialogContent>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                              Please enter the OTP sent to your email to complete registration.
                        </Typography>
                        <TextField
                              autoFocus
                              margin="dense"
                              label="OTP"
                              type="text"
                              pattern="^\d{6}$"
                              fullWidth
                              value={otp}
                              onChange={e => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 6); 
                                    setOtp(value);
                              }}
                        />
                  </DialogContent>
                  <DialogActions>
                        <Button onClick={handleOtpClose}>Cancel</Button>
                        <Button
                              onClick={async () => {
                                    // Call backend API to validate OTP and register user
                                    try {
                                          setLoading(true);
                                          const res = await fetch('http://localhost:7000/validate-otp', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                      email: form.email,
                                                      otp: otp,
                                                }),
                                          });
                                          const data = await res.json();
                                          console.log("verificaion data:",data,"\n res:",res.ok?true:false);
                                          
                                          if (res.ok && data.success) {
                                                handleSignup();
                                                toast.success('Signup successful!', {
                                                      position: 'top-center',
                                                      duration: 5000,
                                                });
                                                setForm({
                                                      name: '',
                                                      email: '',
                                                      password: '',
                                                      confirmPassword: '',
                                                });
                                                setOtp('');
                                                setOtpOpen(false);
                                                // window.location.href = '/login';
                                          } else {
                                                toast.error(data.message || 'Invalid OTP. Please try again.', {
                                                      position: 'top-center',
                                                });
                                          }
                                    } catch (err) {
                                          toast.error('Network error. Please try again.', {
                                                position: 'top-center',
                                          });
                                    }
                                    setLoading(false);

                              }}
                              variant="contained"
                        >
                              Verify OTP
                        </Button>
                  </DialogActions>
            </Dialog>
      </Container>
);
};

export default Signup;