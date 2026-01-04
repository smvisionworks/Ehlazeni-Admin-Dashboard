// contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react'
import { auth, database } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { ref, get } from 'firebase/database'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminData, setAdminData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user)
        
        // Check if user is admin
        try {
          const adminRef = ref(database, `admins/${user.uid}`)
          const snapshot = await get(adminRef)
          
          if (snapshot.exists()) {
            setIsAdmin(true)
            setAdminData(snapshot.val())
          } else {
            setIsAdmin(false)
            setAdminData(null)
          }
        } catch (error) {
          console.error('Error checking admin status:', error)
          setIsAdmin(false)
          setAdminData(null)
        }
      } else {
        setCurrentUser(null)
        setIsAdmin(false)
        setAdminData(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    isAdmin,
    adminData,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}