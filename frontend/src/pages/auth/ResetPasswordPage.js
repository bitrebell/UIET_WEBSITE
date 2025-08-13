import React, { useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Stack,
  InputAdornment,
  IconButton,
  Alert,
} from '@mui/material';
import { Visibility, VisibilityOff, School } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const { resetPassword } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  
  const token = searchParams.get('token');

  const validationSchema = Yup.object({
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      )
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Please confirm your password'),
  });

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    if (!token) {
      setFieldError('password', 'Invalid or missing reset token');
      return;
    }

    try {
      const result = await resetPassword(token, values.password);
      if (result.success) {
        setResetSuccess(true);
      } else {
        setFieldError('password', result.error);
      }
    } catch (error) {
      setFieldError('password', 'An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <Box textAlign="center">
        <School color="error" sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom color="error">
          Invalid Reset Link
        </Typography>
        <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
          The password reset link is invalid or has expired. Please request a new one.
        </Alert>
        <Button
          variant="contained"
          component={RouterLink}
          to="/forgot-password"
          size="large"
        >
          Request New Reset Link
        </Button>
      </Box>
    );
  }

  if (resetSuccess) {
    return (
      <Box textAlign="center">
        <School color="primary" sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom color="primary">
          Password Reset Successful!
        </Typography>
        <Alert severity="success" sx={{ mb: 3, textAlign: 'left' }}>
          Your password has been successfully reset. You can now log in with your new password.
        </Alert>
        <Button
          variant="contained"
          component={RouterLink}
          to="/login"
          size="large"
          sx={{ mt: 2 }}
        >
          Go to Login
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box textAlign="center" mb={4}>
        <School color="primary" sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Reset Password
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Enter your new password below
        </Typography>
      </Box>

      {/* Reset Form */}
      <Formik
        initialValues={{
          password: '',
          confirmPassword: '',
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
                id="password"
                name="password"
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
                autoComplete="new-password"
                autoFocus
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={values.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                helperText={touched.confirmPassword && errors.confirmPassword}
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                fullWidth
                size="large"
                variant="contained"
                onClick={submitForm}
                disabled={isSubmitting}
                sx={{ py: 1.5 }}
              >
                {isSubmitting ? 'Resetting...' : 'Reset Password'}
              </Button>
            </Stack>
          </Form>
        )}
      </Formik>

      {/* Footer Link */}
      <Box mt={4} textAlign="center">
        <Typography variant="body2" color="text.secondary" component="span">
          Remember your password?{' '}
        </Typography>
        <Link
          component={RouterLink}
          to="/login"
          variant="body2"
          color="primary"
          underline="hover"
          fontWeight="medium"
        >
          Sign in here
        </Link>
      </Box>
    </Box>
  );
};

export default ResetPasswordPage;
