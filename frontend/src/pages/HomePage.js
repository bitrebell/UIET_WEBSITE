import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  Link,
  Paper,
  Stack,
} from '@mui/material';
import {
  School,
  Notifications,
  ShoppingBag,
  People,
  Star,
  TrendingUp,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <School color="primary" sx={{ fontSize: 40 }} />,
      title: 'Digital Notes Library',
      description: 'Access comprehensive study materials and notes uploaded by experienced teachers across all departments.',
    },
    {
      icon: <Notifications color="primary" sx={{ fontSize: 40 }} />,
      title: 'Real-time Notifications',
      description: 'Stay updated with important announcements, exam schedules, and college events through our notification system.',
    },
    {
      icon: <ShoppingBag color="primary" sx={{ fontSize: 40 }} />,
      title: 'College Merchandise',
      description: 'Purchase official college merchandise including books, stationery, apparel, and more with secure payment options.',
    },
    {
      icon: <People color="primary" sx={{ fontSize: 40 }} />,
      title: 'User Management',
      description: 'Comprehensive user management system with role-based access for students, teachers, and administrators.',
    },
  ];

  const stats = [
    { icon: <People />, label: 'Active Students', value: '2,500+' },
    { icon: <School />, label: 'Study Materials', value: '1,000+' },
    { icon: <Star />, label: 'Expert Teachers', value: '150+' },
    { icon: <TrendingUp />, label: 'Success Rate', value: '95%' },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            UIET College
          </Typography>
          {isAuthenticated ? (
            <Button
              color="inherit"
              onClick={() => navigate('/dashboard')}
              variant="outlined"
              sx={{
                borderColor: 'white',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
              }}
            >
              Go to Dashboard
            </Button>
          ) : (
            <Stack direction="row" spacing={2}>
              <Button
                color="inherit"
                component={RouterLink}
                to="/login"
                variant="outlined"
                sx={{
                  borderColor: 'white',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                }}
              >
                Login
              </Button>
              <Button
                color="secondary"
                component={RouterLink}
                to="/register"
                variant="contained"
              >
                Register
              </Button>
            </Stack>
          )}
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: 'white',
          py: 8,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 'bold',
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  lineHeight: 1.2,
                }}
              >
                Excellence in Education,{' '}
                <Typography component="span" variant="inherit" color="secondary">
                  Innovation in Technology
                </Typography>
              </Typography>
              <Typography
                variant="h6"
                paragraph
                sx={{
                  opacity: 0.9,
                  fontSize: { xs: '1rem', md: '1.25rem' },
                  mb: 4,
                }}
              >
                Welcome to UIET College - Your gateway to quality education, comprehensive resources, and a vibrant academic community. Access study materials, stay connected with notifications, and explore our college merchandise store.
              </Typography>
              {!isAuthenticated && (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    component={RouterLink}
                    to="/register"
                    sx={{ py: 1.5, px: 4 }}
                  >
                    Join Our Community
                  </Button>
                  <Button
                    variant="outlined"
                    color="inherit"
                    size="large"
                    component={RouterLink}
                    to="/login"
                    sx={{
                      py: 1.5,
                      px: 4,
                      borderColor: 'white',
                      '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                    }}
                  >
                    Student Login
                  </Button>
                </Stack>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 400,
                }}
              >
                <Paper
                  elevation={8}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    textAlign: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <School sx={{ fontSize: 80, color: 'secondary.main', mb: 2 }} />
                  <Typography variant="h4" gutterBottom color="white">
                    Digital Learning Hub
                  </Typography>
                  <Typography variant="body1" color="rgba(255, 255, 255, 0.8)">
                    Empowering students with modern tools and resources for academic success
                  </Typography>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Statistics Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  borderRadius: 3,
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' },
                }}
              >
                <Box sx={{ color: 'primary.main', mb: 1 }}>
                  {React.cloneElement(stat.icon, { sx: { fontSize: 40 } })}
                </Box>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section */}
      <Box sx={{ backgroundColor: 'background.default', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            textAlign="center"
            gutterBottom
            fontWeight="bold"
            sx={{ mb: 6 }}
          >
            Why Choose UIET College?
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: (theme) => theme.shadows[8],
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                    <Typography variant="h5" component="h3" gutterBottom fontWeight="bold">
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" lineHeight={1.7}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Mission & Vision Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={6}>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={4}
              sx={{
                p: 4,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
              }}
            >
              <Typography variant="h4" gutterBottom fontWeight="bold">
                Our Mission
              </Typography>
              <Typography variant="body1" lineHeight={1.7}>
                To provide world-class education in engineering and technology, fostering innovation,
                critical thinking, and ethical leadership. We are committed to preparing our students
                for successful careers while contributing to society's advancement through research
                and technological development.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={4}
              sx={{
                p: 4,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
              }}
            >
              <Typography variant="h4" gutterBottom fontWeight="bold">
                Our Vision
              </Typography>
              <Typography variant="body1" lineHeight={1.7}>
                To be recognized as a premier institution of higher learning in engineering and
                technology, known for excellence in education, research, and innovation. We aspire
                to create global citizens who will lead the technological transformation of society.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          backgroundColor: 'primary.main',
          color: 'white',
          py: 4,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                UIET College
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, lineHeight: 1.7 }}>
                University Institute of Engineering and Technology<br />
                Excellence in Education, Innovation in Technology<br />
                Creating tomorrow's leaders today.
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Quick Links
              </Typography>
              <Stack spacing={1}>
                <Link component={RouterLink} to="/about" color="inherit" underline="hover">
                  About Us
                </Link>
                <Link component={RouterLink} to="/admissions" color="inherit" underline="hover">
                  Admissions
                </Link>
                <Link component={RouterLink} to="/departments" color="inherit" underline="hover">
                  Departments
                </Link>
                <Link component={RouterLink} to="/contact" color="inherit" underline="hover">
                  Contact
                </Link>
              </Stack>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Student Portal
              </Typography>
              <Stack spacing={1}>
                {isAuthenticated ? (
                  <>
                    <Link component={RouterLink} to="/dashboard" color="inherit" underline="hover">
                      Dashboard
                    </Link>
                    <Link component={RouterLink} to="/notes" color="inherit" underline="hover">
                      Notes
                    </Link>
                    <Link component={RouterLink} to="/merchandise" color="inherit" underline="hover">
                      Store
                    </Link>
                  </>
                ) : (
                  <>
                    <Link component={RouterLink} to="/login" color="inherit" underline="hover">
                      Student Login
                    </Link>
                    <Link component={RouterLink} to="/register" color="inherit" underline="hover">
                      Register
                    </Link>
                  </>
                )}
              </Stack>
            </Grid>
          </Grid>
          <Box sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.2)', pt: 3, mt: 3 }}>
            <Typography variant="body2" textAlign="center" sx={{ opacity: 0.7 }}>
              © 2024 UIET College. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
