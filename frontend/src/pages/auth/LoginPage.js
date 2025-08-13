import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  Stack,
} from '@mui/material';
import { Visibility, VisibilityOff, School } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .required('Password is required'),
  });

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      const result = await login(values.email, values.password);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setFieldError('email', result.error);
      }
    } catch (error) {
      setFieldError('email', 'An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box textAlign="center" mb={4}>
        <School color="primary" sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Welcome Back
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Sign in to your UIET College account
        </Typography>
      </Box>

      {/* Login Form */}
      <Formik
        initialValues={{
          email: '',
          password: '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          isSubmitting,
          submitForm,
        }) => (
          <Form>
            <Stack spacing={3}>
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email Address"
                type="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
                autoComplete="email"
                autoFocus
              />

              <TextField
                fullWidth
                id="password"
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {location.state?.message && (
                <Alert severity="info">{location.state.message}</Alert>
              )}

              <Button
                fullWidth
                size="large"
                variant="contained"
                onClick={submitForm}
                disabled={isSubmitting}
                sx={{ py: 1.5 }}
              >
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </Button>
            </Stack>
          </Form>
        )}
      </Formik>

      {/* Footer Links */}
      <Box mt={4}>
        <Stack spacing={2} alignItems="center">
          <Link
            component={RouterLink}
            to="/forgot-password"
            variant="body2"
            color="primary"
            underline="hover"
          >
            Forgot your password?
          </Link>
          
          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary" component="span">
              Don't have an account?{' '}
            </Typography>
            <Link
              component={RouterLink}
              to="/register"
              variant="body2"
              color="primary"
              underline="hover"
              fontWeight="medium"
            >
              Sign up here
            </Link>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default LoginPage;
