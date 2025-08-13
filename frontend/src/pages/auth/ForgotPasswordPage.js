import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Stack,
  Alert,
} from '@mui/material';
import { Email, School } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';

const ForgotPasswordPage = () => {
  const { forgotPassword } = useAuth();
  const [emailSent, setEmailSent] = useState(false);

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
  });

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      const result = await forgotPassword(values.email);
      if (result.success) {
        setEmailSent(true);
      } else {
        setFieldError('email', result.error);
      }
    } catch (error) {
      setFieldError('email', 'An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (emailSent) {
    return (
      <Box textAlign="center">
        <Email color="primary" sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom color="primary">
          Check Your Email
        </Typography>
        <Alert severity="success" sx={{ mb: 3, textAlign: 'left' }}>
          We've sent a password reset link to your email address. Please check your inbox
          and follow the instructions to reset your password.
        </Alert>
        <Typography variant="body1" paragraph color="text.secondary">
          Didn't receive the email? Check your spam folder or try again.
        </Typography>
        <Button
          variant="contained"
          component={RouterLink}
          to="/login"
          size="large"
          sx={{ mt: 2 }}
        >
          Back to Login
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
          Enter your email address and we'll send you a link to reset your password
        </Typography>
      </Box>

      {/* Form */}
      <Formik
        initialValues={{ email: '' }}
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

              <Button
                fullWidth
                size="large"
                variant="contained"
                onClick={submitForm}
                disabled={isSubmitting}
                sx={{ py: 1.5 }}
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPasswordPage;
