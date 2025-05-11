import React, { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const COLORS = ['#ed6c02', '#2e7d32', '#1976d2'];
const booksColors = ['#d32f2f', '#00bcd4', '#85089e', '#1976d2']; 
const librariansColors = ['#2e7d32', '#ffc400', '#cb06b1'];


const Dashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalUsers: 0,
    approvedLibrarians: 0,
    pendingLibrarians: 0,
    allLibrarians: 0,
    allBooks: 0,
    availableBooks: 0,
    unavailableBooks: 0,
    borrowedBooks: 0,
  });
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, librariansRes, booksRes, borrowedBooksRes] = await Promise.all([
          axios.get("http://localhost:5209/admin/users"),
          axios.get("http://localhost:5209/admin/librarians"),
          axios.get("http://localhost:5209/admin/all-books"),
          axios.get("http://localhost:5209/admin/BorrowedBooks")
        ]);
    
        const users = usersRes.data || [];
        const librarians = librariansRes.data || [];
        const books = booksRes.data || [];
        const borrowedBooks = borrowedBooksRes.data || [];
        
        const approvedLibrarians = librarians.filter(lib => lib.isApproved === true);
        const pendingLibrarians = librarians.filter(lib => lib.isApproved === false);
        const availableBooks = books.filter(book => book.availabilityStatus === true);
        const unavailableBooks = books.filter(book => book.availabilityStatus === false);
        

    
        setStats({
          totalUsers: users.length,
          approvedLibrarians: approvedLibrarians.length,
          pendingLibrarians: pendingLibrarians.length,
          allLibrarians: librarians.length,
          allBooks: books.length,
          availableBooks: availableBooks.length,
          unavailableBooks: unavailableBooks.length,
          borrowedBooks: borrowedBooks.length,
        });
    
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };
    
    fetchData();
  }, []);

  const handleCardClick = (page) => {
    navigate(`/${page}`);
  };

  const chartData = [
    { name: 'Users', value: stats.totalUsers },
    { name: 'Approved Librarians', value: stats.approvedLibrarians },
    { name: 'All Books', value: stats.allBooks },
  ];

  const booksChartData = [
    { name: 'Unavailable Books', value: stats.unavailableBooks },
    { name: 'Available Books', value: stats.availableBooks },
    { name: 'Borrowed Books', value: stats.borrowedBooks },
    { name: 'All Books', value: stats.allBooks }
  ];

  const librariansChartData = [
    { name: 'Approved Librarians', value: stats.approvedLibrarians },
    { name: 'Pending Librarians', value: stats.pendingLibrarians },
    { name: 'All Librarians', value: stats.allLibrarians },
  ];
  
  

  return (
    <Box className="dashboard-container">
      <Typography variant="h4" gutterBottom className="dashboard-title">
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid>
          <Paper className="dashboard-card orange-card" onClick={() => handleCardClick('admin/users')}>
            <Typography variant="h5">{stats.totalUsers}</Typography>
            <Typography variant="subtitle1">Total Users</Typography>
          </Paper>
        </Grid>

        <Grid>
          <Paper className="dashboard-card green-card" onClick={() => handleCardClick('admin/librarians')}>
            <Typography variant="h5">{stats.approvedLibrarians}</Typography>
            <Typography variant="subtitle1">Librarians</Typography>
          </Paper>
        </Grid>

        <Grid>
          <Paper className="dashboard-card blue-card" onClick={() => handleCardClick('admin/books')}>
            <Typography variant="h5">{stats.allBooks}</Typography>
            <Typography variant="subtitle1">All Books</Typography>
          </Paper>
        </Grid>
      </Grid>
      

      <Grid container spacing={3} justifyContent="center" style={{ marginTop: '30px' }}>
        <Grid >
          <Paper className="chart-card">
            <Typography variant="h6" gutterBottom>
              Distribution Overview (Pie Chart)
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid >
          <Paper className="chart-card">
            <Typography variant="h6" gutterBottom>
              Stats Overview (Bar Chart)
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData} margin={{ bottom: 40, top: 20 }}>
  <XAxis dataKey="name" angle={-30} textAnchor="end" tick={{ fontSize: 11 }} />
  <YAxis />
  <Tooltip />
  <Legend />

  <Bar dataKey="value" label={{ position: "top", fontSize: 12 }}>
  {chartData.map((entry, index) => (
     <Cell key={`cell-${index}`} fill={COLORS[index]} label={{ position: "top", fontSize: 12 }} />
  ))}
</Bar>
</BarChart>

            </ResponsiveContainer>
          </Paper>
        </Grid>
        
      </Grid>

<Grid container spacing={3} style={{ marginTop: '50px' }}>
  <Grid>
    <Paper className="dashboard-card cyan-card">
      <Typography variant="h5">{stats.availableBooks}</Typography>
      <Typography variant="subtitle1">Available Books</Typography>
    </Paper>
  </Grid>

  <Grid>
    <Paper className="dashboard-card red-card">
      <Typography variant="h5">{stats.unavailableBooks}</Typography>
      <Typography variant="subtitle1">Unavailable Books</Typography>
    </Paper>
  </Grid>

  <Grid>
  <Paper className="dashboard-card purple-card">
    <Typography variant="h5">{stats.borrowedBooks}</Typography>
    <Typography variant="subtitle1">Borrowed Books</Typography>
  </Paper>
</Grid>
</Grid>


<Grid container spacing={3} justifyContent="center" style={{ marginTop: '30px' }}>
  <Grid>
    <Paper className="chart-card">
      <Typography variant="h6" gutterBottom>
        Books Availability (Bar Chart)
      </Typography>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={booksChartData} margin={{ bottom: 30, top: 20 }}>
          <XAxis dataKey="name" angle={-30} textAnchor="end" tick={{ fontSize: 11 }} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" label={{ position: "top", fontSize: 12 }}>
  {booksChartData.map((entry, index) => (
     <Cell key={`cell-${index}`} fill={booksColors[index]} />
  ))}
</Bar>
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  </Grid>

  <Grid >
    <Paper className="chart-card">
      <Typography variant="h6" gutterBottom>
        Books Distribution (Donut Chart)
      </Typography>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={booksChartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            label
            
          >
            {booksChartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={booksColors[index]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Paper>
  </Grid>
</Grid>


<Grid container spacing={3} style={{ marginTop: '50px' }}>

  <Grid>
    <Paper className="dashboard-card yellow-card">
      <Typography variant="h5">{stats.pendingLibrarians}</Typography>
      <Typography variant="subtitle1">Pending Librarians</Typography>
    </Paper>
  </Grid>

  <Grid>
    <Paper className="dashboard-card pink-card">
      <Typography variant="h5">{stats.allLibrarians}</Typography>
      <Typography variant="subtitle1">All Librarians</Typography>
    </Paper>
  </Grid>
</Grid>

<Grid container spacing={3} justifyContent="center" style={{ marginTop: '30px' }}>
  <Grid>
    <Paper className="chart-card">
      <Typography variant="h6" gutterBottom>
        Librarians Overview (Bar Chart)
      </Typography>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={librariansChartData}  margin={{ bottom: 20, top: 20 }}>
          <XAxis dataKey="name" angle={-20} textAnchor="end" tick={{ fontSize: 11 }} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" label={{ position: "top", fontSize: 12 }}>
            {librariansChartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={librariansColors[index]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  </Grid>

  <Grid >
    <Paper className="chart-card">
      <Typography variant="h6" gutterBottom>
        Librarians Distribution (Donut Chart)
      </Typography>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={librariansChartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            label
          >
            {librariansChartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={librariansColors[index]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Paper>
  </Grid>
</Grid>


    </Box>
  );
};

export default Dashboard;
