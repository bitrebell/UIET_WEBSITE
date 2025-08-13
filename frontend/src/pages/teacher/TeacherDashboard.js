import React from 'react';
import { Box, Grid, Card, CardContent, Typography, Button, Chip, LinearProgress } from '@mui/material';
import { 
  Upload as UploadIcon,
  Notifications as NotificationsIcon,
  Assignment as AssignmentIcon,
  People as StudentsIcon,
  Analytics as AnalyticsIcon,
  Person as ProfileIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import DashboardCard from '../../components/common/DashboardCard';

const TeacherDashboard = () => {
  const { user } = useAuth();

  const quickActions = [
    {
      title: 'Upload Notes',
      description: 'Share study materials',
      icon: <UploadIcon />,
      color: 'primary',
      path: '/teacher/upload-notes'
    },
    {
      title: 'Send Notification',
      description: 'Post announcements',
      icon: <NotificationsIcon />,
      color: 'success',
      path: '/teacher/notifications'
    },
    {
      title: 'Manage Assignments',
      description: 'Create and grade assignments',
      icon: <AssignmentIcon />,
      color: 'warning',
      path: '/teacher/assignments'
    },
    {
      title: 'View Students',
      description: 'Student management',
      icon: <StudentsIcon />,
      color: 'info',
      path: '/teacher/students'
    }
  ];

  const teachingStats = [
    { label: 'Total Students', value: 145, color: 'primary' },
    { label: 'Notes Uploaded', value: 28, color: 'success' },
    { label: 'Assignments Posted', value: 12, color: 'warning' },
    { label: 'Notifications Sent', value: 34, color: 'info' }
  ];

  const recentUploads = [
    {
      title: 'Data Structures - Trees',
      type: 'Lecture Notes',
      subject: 'Computer Science',
      uploads: 156,
      time: '2 hours ago'
    },
    {
      title: 'Operating Systems Assignment 3',
      type: 'Assignment',
      subject: 'Computer Science', 
      uploads: 89,
      time: '1 day ago'
    },
    {
      title: 'Database Systems - SQL Queries',
      type: 'Practice Materials',
      subject: 'Computer Science',
      uploads: 203,
      time: '3 days ago'
    }
  ];

  return (
    <Box>
      {/* Welcome Section */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Welcome, Prof. {user?.name}! 👨‍🏫
        </Typography>
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <Chip 
            label={`Teacher ID: ${user?.teacherId}`} 
            color="primary" 
            variant="outlined" 
          />
          <Chip 
            label={user?.department} 
            color="secondary" 
            variant="outlined" 
          />
          <Chip 
            label="Active Status" 
            color="success" 
            variant="outlined" 
          />
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Quick Actions
          </Typography>
        </Grid>
        
        {quickActions.map((action, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <DashboardCard {...action} />
          </Grid>
        ))}

        {/* Teaching Statistics */}
        <Grid item xs={12}>
          <Typography variant="h6" fontWeight="bold" gutterBottom mt={3}>
            Teaching Overview
          </Typography>
        </Grid>

        {teachingStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h4" fontWeight="bold" color={`${stat.color}.main`}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Recent Content */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Recent Content Uploaded
              </Typography>
              <Box>
                {recentUploads.map((upload, index) => (
                  <Box 
                    key={index}
                    py={2}
                    borderBottom={index < recentUploads.length - 1 ? 1 : 0}
                    borderColor="divider"
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Box flex={1}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {upload.title}
                        </Typography>
                        <Box display="flex" gap={1} my={1}>
                          <Chip 
                            label={upload.type} 
                            size="small" 
                            color="primary" 
                            variant="outlined" 
                          />
                          <Chip 
                            label={upload.subject} 
                            size="small" 
                            color="secondary" 
                            variant="outlined" 
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {upload.uploads} student views
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {upload.time}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min((upload.uploads / 200) * 100, 100)} 
                      sx={{ mt: 1 }}
                    />
                  </Box>
                ))}
              </Box>
              <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
                View All Content
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Summary */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Profile Summary
              </Typography>
              <Box textAlign="center" mb={2}>
                <Box 
                  width={80} 
                  height={80} 
                  borderRadius="50%" 
                  bgcolor="secondary.main" 
                  display="flex" 
                  alignItems="center" 
                  justifyContent="center"
                  mx="auto"
                  mb={2}
                >
                  <ProfileIcon sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Typography variant="h6" fontWeight="bold">
                  Prof. {user?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
              <Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Department:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {user?.department}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Teacher ID:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {user?.teacherId}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="body2">Joined:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {new Date(user?.createdAt).getFullYear()}
                  </Typography>
                </Box>
              </Box>
              <Button variant="outlined" fullWidth>
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TeacherDashboard;
