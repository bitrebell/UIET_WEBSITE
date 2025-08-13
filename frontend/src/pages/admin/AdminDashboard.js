import React from 'react';
import { Box, Grid, Card, CardContent, Typography, Button, Chip, Avatar, AvatarGroup } from '@mui/material';
import { 
  People as UsersIcon,
  School as DepartmentIcon,
  Analytics as AnalyticsIcon,
  Notifications as NotificationsIcon,
  ShoppingBag as MerchandiseIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import DashboardCard from '../../components/common/DashboardCard';

const AdminDashboard = () => {
  const { user } = useAuth();

  const quickActions = [
    {
      title: 'User Management',
      description: 'Manage students & teachers',
      icon: <UsersIcon />,
      color: 'primary',
      path: '/admin/users',
      count: 1247 // Total users
    },
    {
      title: 'Analytics',
      description: 'View system analytics',
      icon: <AnalyticsIcon />,
      color: 'success',
      path: '/admin/analytics'
    },
    {
      title: 'Notifications',
      description: 'Send announcements',
      icon: <NotificationsIcon />,
      color: 'warning',
      path: '/admin/notifications'
    },
    {
      title: 'Merchandise',
      description: 'Manage college store',
      icon: <MerchandiseIcon />,
      color: 'info',
      path: '/admin/merchandise'
    }
  ];

  const systemStats = [
    { 
      label: 'Total Users', 
      value: 1247, 
      change: '+12%', 
      color: 'primary',
      details: 'Students: 1089, Teachers: 158'
    },
    { 
      label: 'Active Sessions', 
      value: 324, 
      change: '+5%', 
      color: 'success',
      details: 'Online now'
    },
    { 
      label: 'Notes Uploaded', 
      value: 2856, 
      change: '+18%', 
      color: 'warning',
      details: 'This month'
    },
    { 
      label: 'Revenue', 
      value: '₹45,230', 
      change: '+23%', 
      color: 'info',
      details: 'Merchandise sales'
    }
  ];

  const recentActivities = [
    {
      type: 'user',
      title: '15 new student registrations',
      description: 'Computer Science Department',
      time: '2 hours ago',
      priority: 'normal'
    },
    {
      type: 'content',
      title: 'Dr. Smith uploaded 5 new notes',
      description: 'Mathematics Department - Calculus series',
      time: '4 hours ago',
      priority: 'normal'
    },
    {
      type: 'system',
      title: 'Server maintenance scheduled',
      description: 'Scheduled for tonight 2:00 AM - 4:00 AM',
      time: '6 hours ago',
      priority: 'high'
    },
    {
      type: 'sales',
      title: '23 merchandise orders received',
      description: 'College branded items and textbooks',
      time: '1 day ago',
      priority: 'normal'
    }
  ];

  const departmentOverview = [
    { name: 'Computer Science', students: 456, teachers: 28, color: '#1976d2' },
    { name: 'Mechanical', students: 398, teachers: 24, color: '#388e3c' },
    { name: 'Electrical', students: 234, teachers: 18, color: '#f57c00' },
    { name: 'Civil', students: 178, teachers: 15, color: '#7b1fa2' },
    { name: 'Others', students: 123, teachers: 12, color: '#5d4037' }
  ];

  return (
    <Box>
      {/* Welcome Section */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Admin Dashboard 👑
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Welcome back, {user?.name}! Here's what's happening at UIET College.
        </Typography>
        <Chip 
          label="System Administrator" 
          color="error" 
          variant="outlined" 
          sx={{ mt: 1 }}
        />
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

        {/* System Statistics */}
        <Grid item xs={12}>
          <Typography variant="h6" fontWeight="bold" gutterBottom mt={3}>
            System Overview
          </Typography>
        </Grid>

        {systemStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="h4" fontWeight="bold" color={`${stat.color}.main`}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {stat.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {stat.details}
                    </Typography>
                  </Box>
                  <Chip 
                    label={stat.change} 
                    color="success" 
                    size="small" 
                    icon={<TrendingUpIcon />} 
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Recent System Activity */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Recent System Activity
              </Typography>
              <Box>
                {recentActivities.map((activity, index) => (
                  <Box 
                    key={index}
                    display="flex" 
                    justifyContent="space-between" 
                    alignItems="flex-start"
                    py={2}
                    borderBottom={index < recentActivities.length - 1 ? 1 : 0}
                    borderColor="divider"
                  >
                    <Box flex={1}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {activity.title}
                        </Typography>
                        {activity.priority === 'high' && (
                          <Chip label="High Priority" color="error" size="small" />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {activity.description}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {activity.time}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
                View System Logs
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Department Overview */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Department Overview
              </Typography>
              <Box>
                {departmentOverview.map((dept, index) => (
                  <Box 
                    key={index}
                    display="flex" 
                    justifyContent="space-between" 
                    alignItems="center"
                    py={1.5}
                    borderBottom={index < departmentOverview.length - 1 ? 1 : 0}
                    borderColor="divider"
                  >
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box 
                        width={12} 
                        height={12} 
                        borderRadius="50%" 
                        bgcolor={dept.color}
                      />
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {dept.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {dept.teachers} teachers
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" fontWeight="bold">
                      {dept.students}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
                Manage Departments
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                System Administration
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<SettingsIcon />}
                    sx={{ height: 48 }}
                  >
                    System Settings
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<UsersIcon />}
                    sx={{ height: 48 }}
                  >
                    User Roles
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<DepartmentIcon />}
                    sx={{ height: 48 }}
                  >
                    Departments
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<AssignmentIcon />}
                    sx={{ height: 48 }}
                  >
                    System Backups
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
