import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { CheckCircle, Error, School } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const { verifyEmail } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  
  const token = searchParams.get('token');

  useEffect(() => {
    const handleVerification = async () => {
      if (!token) {
        setVerificationStatus('error');
        setMessage('Invalid or missing verification token');
        return;
      }

      try {
        const result = await verifyEmail(token);
        if (result.success) {
          setVerificationStatus('success');
          setMessage('Your email has been successfully verified!');
        } else {
          setVerificationStatus('error');
          setMessage(result.error || 'Email verification failed');
        }
      } catch (error) {
        setVerificationStatus('error');
        setMessage('An unexpected error occurred during verification');
      }
    };

    handleVerification();
  }, [token, verifyEmail]);

  if (verificationStatus === 'loading') {
    return (
      <Box textAlign="center">
        <CircularProgress size={60} sx={{ mb: 3 }} />
        <Typography variant="h5" component="h1" fontWeight="bold" gutterBottom>
          Verifying Your Email
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Please wait while we verify your email address...
        </Typography>
      </Box>
    );
  }

  if (verificationStatus === 'success') {
    return (
      <Box textAlign="center">
        <CheckCircle color="success" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom color="success.main">
          Email Verified!
        </Typography>
        <Alert severity="success" sx={{ mb: 3, textAlign: 'left' }}>
          {message} You can now log in to access your dashboard and all features.
        </Alert>
        <Typography variant="body1" paragraph color="text.secondary">
          Welcome to UIET College! Your account is now active and ready to use.
        </Typography>
        <Button
          variant="contained"
          component={RouterLink}
          to="/login"
          size="large"
          sx={{ mt: 2 }}
        >
          Continue to Login
        </Button>
      </Box>
    );
  }

  return (
    <Box textAlign="center">
      <Error color="error" sx={{ fontSize: 60, mb: 2 }} />
      <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom color="error">
        Verification Failed
      </Typography>
      <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
        {message}
      </Alert>
      <Typography variant="body1" paragraph color="text.secondary">
        The verification link may have expired or is invalid. You can request a new verification email.
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          component={RouterLink}
          to="/login"
          size="large"
        >
          Go to Login
        </Button>
        <Button
          variant="outlined"
          component={RouterLink}
          to="/register"
          size="large"
        >
          Register Again
        </Button>
      </Box>
    </Box>
  );
};

export default VerifyEmailPage;
