import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Card, CardContent, Typography, Box, Badge } from '@mui/material';

const DashboardCard = ({ 
  title, 
  description, 
  icon, 
  color = 'primary', 
  path, 
  count 
}) => {
  const CardComponent = path ? Card : Card;
  const cardProps = path ? { 
    component: RouterLink, 
    to: path,
    sx: { 
      textDecoration: 'none',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 4
      }
    }
  } : {};

  return (
    <CardComponent {...cardProps}>
      <CardContent>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between">
          <Box>
            <Badge badgeContent={count} color="error" max={99}>
              <Box 
                display="flex" 
                alignItems="center" 
                justifyContent="center"
                width={48}
                height={48}
                borderRadius={2}
                bgcolor={`${color}.light`}
                color={`${color}.main`}
                mb={2}
              >
                {icon}
              </Box>
            </Badge>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </CardComponent>
  );
};

export default DashboardCard;
