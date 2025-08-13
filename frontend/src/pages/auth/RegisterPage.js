import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Link,
  InputAdornment,
  IconButton,
  Stack,
  MenuItem,
  Alert,
} from '@mui/material';
import { Visibility, VisibilityOff, School } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const departments = [
    'Computer Science Engineering',
    'Information Technology',
    'Electronics and Communication Engineering',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
    'Biotechnology',
  ];

  const validationSchema = Yup.object({
    firstName: Yup.string()
      .min(2, 'First name must be at least 2 characters')
      .max(50, 'First name cannot exceed 50 characters')
      .required('First name is required'),
    lastName: Yup.string()
      .min(2, 'Last name must be at least 2 characters')
      .max(50, 'Last name cannot exceed 50 characters')
      .required('Last name is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
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
    role: Yup.string()
      .oneOf(['student', 'teacher'], 'Please select a valid role')
      .required('Role is required'),
    department: Yup.string()
      .required('Department is required'),
    semester: Yup.number()
      .when('role', (role, schema) => {
        return role === 'student' 
          ? schema
              .min(1, 'Semester must be between 1 and 8')
              .max(8, 'Semester must be between 1 and 8')
              .required('Semester is required for students')
          : schema.nullable();
      }),
    studentId: Yup.string()
      .when('role', (role, schema) => {
        return role === 'student'
          ? schema.required('Student ID is required for students')
          : schema.nullable();
      }),
    teacherId: Yup.string()
      .when('role', (role, schema) => {
        return role === 'teacher'
          ? schema.required('Teacher ID is required for teachers')
          : schema.nullable();
      }),
  });

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      const { confirmPassword, ...registrationData } = values;
      const result = await register(registrationData);
      
      if (result.success) {
        setRegistrationSuccess(true);
      } else {
        setFieldError('email', result.error);
      }
    } catch (error) {
      setFieldError('email', 'An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (registrationSuccess) {
    return (
      <Box textAlign="center">
        <School color="primary" sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom color="primary">
          Registration Successful!
        </Typography>
        <Alert severity="success" sx={{ mb: 3, textAlign: 'left' }}>
          We've sent a verification email to your registered email address. Please check your
          inbox and click the verification link to activate your account.
        </Alert>
        <Typography variant="body1" paragraph color="text.secondary">
          After verifying your email, you can log in to access your dashboard.
        </Typography>
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
          Join UIET College
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create your account to access study materials and more
        </Typography>
      </Box>

      {/* Registration Form */}
      <Formik
        initialValues={{
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: '',
          department: '',
          semester: '',
          studentId: '',
          teacherId: '',
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
              {/* Name Fields */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  id="firstName"
                  name="firstName"
                  label="First Name"
                  value={values.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.firstName && Boolean(errors.firstName)}
                  helperText={touched.firstName && errors.firstName}
                  autoComplete="given-name"
                  autoFocus
                />
                <TextField
                  fullWidth
                  id="lastName"
                  name="lastName"
                  label="Last Name"
                  value={values.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.lastName && Boolean(errors.lastName)}
                  helperText={touched.lastName && errors.lastName}
                  autoComplete="family-name"
                />
              </Stack>

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
              />

              {/* Password Fields */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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
                  autoComplete="new-password"
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
                  label="Confirm Password"
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
              </Stack>

              {/* Role and Department */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  id="role"
                  name="role"
                  label="Role"
                  select
                  value={values.role}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.role && Boolean(errors.role)}
                  helperText={touched.role && errors.role}
                >
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="teacher">Teacher</MenuItem>
                </TextField>
                <TextField
                  fullWidth
                  id="department"
                  name="department"
                  label="Department"
                  select
                  value={values.department}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.department && Boolean(errors.department)}
                  helperText={touched.department && errors.department}
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>

              {/* Role-specific Fields */}
              {values.role === 'student' && (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    fullWidth
                    id="semester"
                    name="semester"
                    label="Semester"
                    type="number"
                    value={values.semester}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.semester && Boolean(errors.semester)}
                    helperText={touched.semester && errors.semester}
                    inputProps={{ min: 1, max: 8 }}
                  />
                  <TextField
                    fullWidth
                    id="studentId"
                    name="studentId"
                    label="Student ID"
                    value={values.studentId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.studentId && Boolean(errors.studentId)}
                    helperText={touched.studentId && errors.studentId}
                  />
                </Stack>
              )}

              {values.role === 'teacher' && (
                <TextField
                  fullWidth
                  id="teacherId"
                  name="teacherId"
                  label="Teacher ID"
                  value={values.teacherId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.teacherId && Boolean(errors.teacherId)}
                  helperText={touched.teacherId && errors.teacherId}
                />
              )}

              <Button
                fullWidth
                size="large"
                variant="contained"
                onClick={submitForm}
                disabled={isSubmitting}
                sx={{ py: 1.5 }}
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </Button>
            </Stack>
          </Form>
        )}
      </Formik>

      {/* Footer Link */}
      <Box mt={4} textAlign="center">
        <Typography variant="body2" color="text.secondary" component="span">
          Already have an account?{' '}
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

export default RegisterPage;
