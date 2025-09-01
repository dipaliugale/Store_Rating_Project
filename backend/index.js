// This file sets up the Express.js server and API routes for the backend.
// It uses Prisma Client to interact with the MySQL database.

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Initialize Prisma Client and Express app
const prisma = new PrismaClient();
const app = express();
const PORT = 3001;

// Middleware setup
app.use(cors());
app.use(bodyParser.json());

// Secret key for JWT. In a real app, this should be stored in an environment variable.
const JWT_SECRET = 'your-secret-key';

// --- API ROUTES ---

// Registration endpoint
app.post('/api/register', async (req, res) => {
  const { name, email, password, address, role } = req.body;

  // Simple validation for registration form
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  // Hash the password for security before storing it
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
        address,
        role: 'USER', // Set role to USER by default for all registrations
      },
    });

    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'An error occurred during registration.' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Create and sign a JWT token. In a real app, this would be more complex.
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

    // Respond with a complete user object
    res.status(200).json({ message: 'Login successful', token, user });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'An error occurred during login.' });
  }
});

// Endpoint to get all users (Admin only)
app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users.' });
  }
});

// Endpoint to get all stores
app.get('/api/stores', async (req, res) => {
  try {
    const stores = await prisma.store.findMany();
    res.status(200).json(stores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ message: 'Failed to fetch stores.' });
  }
});

// Endpoint to create a new store (Admin only)
app.post('/api/stores', async (req, res) => {
  // Authentication middleware would go here to check if the user is an admin.
  // For now, we'll assume the request is from an authorized user.
  const { name, address, description, ownerId, email } = req.body;

  try {
    const newStore = await prisma.store.create({
      data: {
        name,
        address,
        description,
        ownerId,
        email,
      },
    });
    res.status(201).json({ message: 'Store created successfully', store: newStore });
  } catch (error) {
    console.error('Error creating store:', error);
    res.status(500).json({ message: 'An error occurred while creating the store.' });
  }
});

// Endpoint to update a user's password
app.post('/api/update-password', async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ message: 'Email and new password are required.' });
  }

  // Implement the same password validation logic as in the frontend to be secure
  const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/;
  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({ message: 'Password does not meet the security requirements.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Failed to update password.' });
  }
});


// Start the server
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
