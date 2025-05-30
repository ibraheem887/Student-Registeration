const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Proxy routes to respective services
app.use('/api/auth', createProxyMiddleware({ 
  target: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
  changeOrigin: true,
  pathRewrite: {'^/api/auth': ''}
}));

app.use('/api/student', createProxyMiddleware({ 
  target: process.env.STUDENT_SERVICE_URL || 'http://student-service:3002',
  changeOrigin: true,
  pathRewrite: {'^/api/student': ''}
}));

app.use('/api/admin', createProxyMiddleware({ 
  target: process.env.ADMIN_SERVICE_URL || 'http://admin-service:3003',
  changeOrigin: true,
  pathRewrite: {'^/api/admin': ''}
}));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});