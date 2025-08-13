import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Grid, Card, CardContent, Typography, Button, Chip } from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  Notifications as NotificationsIcon,
  MenuBook as NotesIcon,
  ShoppingCart as ShopIcon,
  Person as ProfileIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import DashboardCard from '../../components/common/DashboardCard';

const StudentDashboard = () => {
  const { user } = useAuth();

  const quickActions = [
    {
      title: 'View Notifications',
      description: 'Check latest announcements',
      icon: <NotificationsIcon />,
      color: 'primary',
      path: '/student/notifications',
      count: 3 // This would come from API
    },
    {
      title: 'Browse Notes',
      description: 'Access study materials',
      icon: <NotesIcon />,
      color: 'success',
      path: '/student/notes'
    },
    {
      title: 'College Store',
      description: 'Purchase merchandise',
      icon: <ShopIcon />,
      color: 'warning',
      path: '/student/merchandise'
    },
    {
      title: 'View Schedule',
      description: 'Check class timetable',
      icon: <ScheduleIcon />,
      color: 'info',
      path: '/student/schedule'
    }
  ];

  const recentActivity = [
    {
      type: 'notification',
      title: 'New Assignment Posted',
      description: 'Data Structures Assignment 3 has been uploaded',
      time: '2 hours ago',
      subject: 'Computer Science'
    },
    {
      type: 'note',
      title: 'Lecture Notes Available',
      description: 'Operating Systems - Chapter 5 notes uploaded',
      time: '1 day ago',
      subject: 'Computer Science'
    },
    {
      type: 'announcement',
      title: 'Semester Exam Schedule',
      description: 'Final examination timetable has been released',
      time: '2 days ago',
      subject: 'General'
    }
  ];

  return (
    <Box>
      {/* Welcome Section */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Welcome back, {user?.name}! 👋
        </Typography>
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <Chip 
            label={`${user?.department} Department`} 
            color="primary" 
            variant="outlined" 
          />
          <Chip 
            label={`Semester ${user?.semester}`} 
            color="secondary" 
            variant="outlined" 
          />
          <Chip 
            label={user?.rollNumber} 
            color="info" 
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

        {/* Recent Activity */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Recent Activity
              </Typography>
              <Box>
                {recentActivity.map((activity, index) => (
                  <Box 
                    key={index}
                    display="flex" 
                    justifyContent="space-between" 
                    alignItems="flex-start"
                    py={2}
                    borderBottom={index < recentActivity.length - 1 ? 1 : 0}
                    borderColor="divider"
                  >
                    <Box flex={1}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {activity.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {activity.description}
                      </Typography>
                      <Chip 
                        label={activity.subject} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {activity.time}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
                View All Activity
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
                  bgcolor="primary.main" 
                  display="flex" 
                  alignItems="center" 
                  justifyContent="center"
                  mx="auto"
                  mb={2}
                >
                  <ProfileIcon sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Typography variant="h6" fontWeight="bold">
                  {user?.name}
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
                  <Typography variant="body2">Semester:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {user?.semester}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="body2">Roll Number:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {user?.rollNumber}
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

export default StudentDashboard;
