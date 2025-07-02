require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');

// Set JWT_SECRET directly if not found in environment variables
process.env.JWT_SECRET = 'Vijay@0178';
// hiii

console.log('JWT_SECRET:', process.env.JWT_SECRET);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
// mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/CRM5', {
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://infotechgautam544:eBEnOcS6Bo0HgAbt@cluster0.v4evidm.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB')) 
.catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes); 
app.use('/api/users', userRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

// Root route for Vercel
app.get('/', (req, res) => {
    res.send('Backend is running!');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 