// components/AdminSignup.jsx
import React, { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { ref, set, get } from 'firebase/database'
import { auth, database } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

const AdminSignup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'admin',
    department: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
const { currentUser } = useAuth()

  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('First name is required')
      return false
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required')
      return false
    }
    if (!formData.email.trim()) {
      setError('Email is required')
      return false
    }
    if (!formData.password) {
      setError('Password is required')
      return false
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      )
      
      const user = userCredential.user

      // Prepare admin data
      const adminData = {
        uid: user.uid,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        department: formData.department.trim(),
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.uid || 'system',
        status: 'active'
      }

      // Store admin data in Realtime Database
      const adminRef = ref(database, `admins/${user.uid}`)
      await set(adminRef, adminData)

      setSuccess('Admin account created successfully!')
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        role: 'admin',
        department: ''
      })

      // Redirect to admin dashboard after 2 seconds
      setTimeout(() => {
        navigate('/admin')
      }, 2000)

    } catch (error) {
      console.error('Error creating admin account:', error)
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('This email is already registered. Please use a different email.')
          break
        case 'auth/invalid-email':
          setError('Invalid email address format.')
          break
        case 'auth/weak-password':
          setError('Password is too weak. Please use a stronger password.')
          break
        case 'auth/operation-not-allowed':
          setError('Email/password accounts are not enabled. Please contact support.')
          break
        default:
          setError('Failed to create admin account: ' + error.message)
      }
    } finally {
      setLoading(false)
    }
  }

return (
  <div
    className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-6"
    style={{
      backgroundImage: "url('../../public/images/signup.jpg')", // <-- change to your background image
    }}
  >
    <div className="backdrop-blur-md bg-white/20 shadow-2xl rounded-2xl p-10 max-w-3xl w-full border border-white/30">

      {/* Header */}
      <div className="text-center mb-8">
        <img
          src="../../public/images/LOGO1.png"
          alt="School Logo"
          className="mx-auto h-20 w-20 drop-shadow-lg mb-4"
        />
        <h2 className="text-3xl font-extrabold text-white tracking-wide drop-shadow-lg">
          Admin Registration
        </h2>
        <p className="text-blue-50 mt-1 text-sm">
          Create a new administrator account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Error */}
        {error && (
          <div className="bg-red-500/20 border border-red-400 text-red-100 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="bg-green-500/20 border border-green-400 text-green-100 px-4 py-3 rounded-lg text-sm">
            {success}
          </div>
        )}

        {/* 2-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-white font-medium text-sm">First Name *</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 rounded-lg bg-white/80 text-gray-900 shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="text-white font-medium text-sm">Last Name *</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 rounded-lg bg-white/80 text-gray-900 shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="text-white font-medium text-sm">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 w-full px-4 py-2 rounded-lg bg-white/80 text-gray-900 shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        {/* Passwords */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-white font-medium text-sm">Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 rounded-lg bg-white/80 text-gray-900 shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="text-white font-medium text-sm">Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 rounded-lg bg-white/80 text-gray-900 shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
        </div>

        {/* Phone + Department */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-white font-medium text-sm">Phone *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 rounded-lg bg-white/80 text-gray-900 shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="text-white font-medium text-sm">Department</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 rounded-lg bg-white/80 text-gray-900 shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select Department</option>
              <option value="admissions">Admissions</option>
              <option value="academics">Academics</option>
              <option value="administration">Administration</option>
              <option value="finance">Finance</option>
              <option value="student_affairs">Student Affairs</option>
              <option value="it">IT Department</option>
            </select>
          </div>
        </div>

        {/* Role */}
        <div>
          <label className="text-white font-medium text-sm">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="mt-1 w-full px-4 py-2 rounded-lg bg-white/80 text-gray-900 shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="admin">Administrator</option>
            <option value="super_admin">Super Administrator</option>
            <option value="admissions_officer">Admissions Officer</option>
            <option value="academic_officer">Academic Officer</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-4">
          <Link
            to="/login"
            className="px-5 py-2 bg-white/40 border border-white/50 rounded-lg text-white backdrop-blur-md hover:bg-white/60 transition shadow"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold shadow-lg hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {loading ? "Creating..." : "Create Admin"}
          </button>
        </div>
      </form>

      {/* Info Box */}
      <div className="mt-6 bg-white/20 border border-white/30 p-4 rounded-lg text-white text-sm backdrop-blur-md">
        <h3 className="font-semibold mb-2">Admin Access Rules</h3>
        <ul className="space-y-1">
          <li>• Admins have full access to the management system</li>
          <li>• Must use a unique email address</li>
          <li>• Password must be at least 6 characters</li>
          <li>• Department helps organize responsibilities</li>
        </ul>
      </div>

    </div>
  </div>
)

}

export default AdminSignup