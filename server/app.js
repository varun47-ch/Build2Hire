import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes.js'
import projectRoutes from './routes/projectRoutes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

//  Middleware 
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// DB Connection 
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB error:', err))

//  Health Check 
app.get('/api/health', (req, res) => {
  res.json({ status: 'Build2Hire API is running' })
})

//  Routes
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes) 

// Global Error Handler 
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  })
})

// Start Server 
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app