import { createContext, useState, useEffect } from 'react'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken')
    const storedUser = localStorage.getItem('authUser')

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = (data) => {
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem('authToken', data.token)
    localStorage.setItem('authUser', JSON.stringify(data.user))
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuth: !!token }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}