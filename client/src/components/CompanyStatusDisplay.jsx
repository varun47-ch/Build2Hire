import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { companyAPI } from '../services/api'
import { AlertCircle, CheckCircle, Clock, XCircle, Loader, RefreshCw } from 'lucide-react'

export default function CompanyStatusDisplay() {
  const navigate = useNavigate()
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [autoRefreshActive, setAutoRefreshActive] = useState(true)

  // Fetch company status
  const fetchCompanyStatus = async () => {
    try {
      setRefreshing(true)
      const response = await companyAPI.getMyCompany()
      if (response.data.success) {
        setCompany(response.data.data)
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setCompany(null)
      } else {
        setError(err.response?.data?.message || 'Failed to fetch company status')
      }
    } finally {
      setRefreshing(false)
    }
  }

  // Initial fetch on mount
  useEffect(() => {
    setLoading(true)
    fetchCompanyStatus().then(() => setLoading(false))
  }, [])

  // AUTO-REFRESH every 5 seconds while PENDING
  useEffect(() => {
    if (!company || company.status !== 'pending' || !autoRefreshActive) {
      return
    }

    const interval = setInterval(() => {
      console.log('Auto-checking company status...')
      fetchCompanyStatus()
    }, 5000) // Check every 5 seconds

    return () => clearInterval(interval)
  }, [company, autoRefreshActive])

  // Refresh when page comes back into focus
  useEffect(() => {
    const handleFocus = () => {
      console.log('Page focused - refreshing status')
      fetchCompanyStatus()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader size={48} className="text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-slate-600 font-medium">Loading company status...</p>
        </div>
      </div>
    )
  }

  // NO COMPANY REGISTERED
  if (!company) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="bg-white rounded-2xl shadow-xl p-12 max-w-2xl w-full text-center">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
              <AlertCircle size={56} className="text-blue-600" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-slate-900 mb-3">
            No Company Registered
          </h2>
          
          <p className="text-slate-600 text-lg mb-8">
            You need to register your company first before accessing HR features.
          </p>

          <button
            onClick={() => navigate('/register-company')}
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3 px-8 rounded-xl inline-block transition duration-200 shadow-lg hover:shadow-xl text-lg"
          >
            Register Company Now
          </button>
        </div>
      </div>
    )
  }

  // PENDING STATUS
  if (company.status === 'pending') {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto border-l-4 border-yellow-400">
        {/* Auto-refresh indicator */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw size={16} className={`text-blue-600 ${refreshing ? 'animate-spin' : ''}`} />
            <p className="text-sm text-blue-700 font-medium">
              {refreshing ? 'Checking status...' : 'Auto-checking every 5 seconds'}
            </p>
          </div>
          <button
            onClick={() => setAutoRefreshActive(!autoRefreshActive)}
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
          >
            {autoRefreshActive ? 'Pause' : 'Resume'}
          </button>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Pending Admin Approval ⏳
          </h2>
          <p className="text-slate-600 text-lg">
            Your company is currently under review by our admin team.
          </p>
        </div>

        {/* Company Details Box */}
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-yellow-900 mb-4 text-lg">Company Details:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div>
              <p className="text-xs font-bold text-yellow-700 uppercase tracking-wide mb-1">
                Company Name
              </p>
              <p className="text-slate-900 font-semibold text-lg">{company.companyName}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-yellow-700 uppercase tracking-wide mb-1">
                Website
              </p>
              <a 
                href={company.website} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:text-blue-700 font-semibold underline"
              >
                {company.website}
              </a>
            </div>
            {company.companyEmail && (
              <div>
                <p className="text-xs font-bold text-yellow-700 uppercase tracking-wide mb-1">
                  Email
                </p>
                <p className="text-slate-900 font-semibold">{company.companyEmail}</p>
              </div>
            )}
            {company.linkedin && (
              <div>
                <p className="text-xs font-bold text-yellow-700 uppercase tracking-wide mb-1">
                  LinkedIn
                </p>
                <a 
                  href={company.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:text-blue-700 font-semibold underline"
                >
                  View Profile
                </a>
              </div>
            )}
            <div>
              <p className="text-xs font-bold text-yellow-700 uppercase tracking-wide mb-1">
                Submitted
              </p>
              <p className="text-slate-900 font-semibold">{new Date(company.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6 mb-8 text-center">
          <p className="text-blue-900 font-bold text-lg mb-2">
            ⏱️ Expected Review Time: 24 hours
          </p>
          <p className="text-blue-700 text-sm">
            You'll receive an email notification once the admin reviews your company.
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={fetchCompanyStatus}
            disabled={refreshing}
            className="px-8 py-3 bg-slate-600 hover:bg-slate-700 active:bg-slate-800 disabled:bg-slate-400 text-white font-bold rounded-xl transition duration-200 shadow-md flex items-center gap-2"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh Status'}
          </button>
          <button
            onClick={() => navigate('/projects')}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl transition duration-200 shadow-md"
          >
            ← Back to Projects
          </button>
        </div>
      </div>
    )
  }

  if (company.status === 'approved') {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-2xl p-12 max-w-4xl mx-auto border-l-4 border-green-500">

        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
            <CheckCircle size={56} className="text-green-600" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-green-900 mb-3">
             Company Approved!
          </h2>
          <p className="text-green-700 text-lg font-semibold">
            Your company has been verified and approved by admin.
          </p>
        </div>

        {/* Company Details Box */}
        <div className="bg-green-50 border-2 border-green-400 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-green-900 mb-4 text-lg">Company Details:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div>
              <p className="text-xs font-bold text-green-700 uppercase tracking-wide mb-1">
                Company Name
              </p>
              <p className="text-slate-900 font-semibold text-lg">{company.companyName}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-green-700 uppercase tracking-wide mb-1">
                Website
              </p>
              <a 
                href={company.website} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:text-blue-700 font-semibold underline"
              >
                {company.website}
              </a>
            </div>
            {company.companyEmail && (
              <div>
                <p className="text-xs font-bold text-green-700 uppercase tracking-wide mb-1">
                  Email
                </p>
                <p className="text-slate-900 font-semibold">{company.companyEmail}</p>
              </div>
            )}
            {company.linkedin && (
              <div>
                <p className="text-xs font-bold text-green-700 uppercase tracking-wide mb-1">
                  LinkedIn
                </p>
                <a 
                  href={company.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:text-blue-700 font-semibold underline"
                >
                  View Profile
                </a>
              </div>
            )}
            <div>
              <p className="text-xs font-bold text-green-700 uppercase tracking-wide mb-1">
                Approved On
              </p>
              <p className="text-slate-900 font-semibold">{new Date(company.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-100 border-2 border-green-400 rounded-xl p-6 mb-8 text-center">
          <p className="text-green-900 font-bold text-xl mb-2">
            ✓ Full Access Granted!
          </p>
          <p className="text-green-800 text-sm">
            You now have complete access to all HR features and can start recruiting talent.
          </p>
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate('/hr-dashboard')}
            className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold py-4 px-12 rounded-xl transition duration-200 shadow-lg hover:shadow-xl text-lg inline-block"
          >
            Go to HR Dashboard →
          </button>
        </div>
      </div>
    )
  }

  //  REJECTED STATUS
  if (company.status === 'rejected') {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-12 max-w-4xl mx-auto border-l-4 border-red-400">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle size={48} className="text-red-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Company Rejected ❌
          </h2>
          <p className="text-slate-600 text-lg">
            Your company registration has been rejected by the admin.
          </p>
        </div>

        {/* Company Details Box */}
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-red-900 mb-4 text-lg">Company Details:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div>
              <p className="text-xs font-bold text-red-700 uppercase tracking-wide mb-1">
                Company Name
              </p>
              <p className="text-slate-900 font-semibold text-lg">{company.companyName}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-red-700 uppercase tracking-wide mb-1">
                Website
              </p>
              <p className="text-slate-900 font-semibold">{company.website}</p>
            </div>
            {company.companyEmail && (
              <div>
                <p className="text-xs font-bold text-red-700 uppercase tracking-wide mb-1">
                  Email
                </p>
                <p className="text-slate-900 font-semibold">{company.companyEmail}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-bold text-red-700 uppercase tracking-wide mb-1">
                Rejected On
              </p>
              <p className="text-slate-900 font-semibold">{new Date(company.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 mb-8 text-center">
          <p className="text-red-900 font-bold mb-2 text-lg">⚠️ Reason for Rejection</p>
          <p className="text-red-700 text-sm mb-4">
            Please contact admin support for more details about the rejection.
          </p>
          <p className="text-red-600 text-xs">
            You may re-register with updated company information after contacting admin.
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/projects')}
            className="px-8 py-3 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-xl transition duration-200"
          >
            Back to Projects
          </button>
        </div>
      </div>
    )
  }
}