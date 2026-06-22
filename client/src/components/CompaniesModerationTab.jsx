import { useState, useEffect } from 'react'
import { Eye, Check, X, Search } from 'lucide-react'
import { adminAPI } from '../services/api'

export default function CompaniesModerationTab() {
  const [companies, setCompanies] = useState([])
  const [filteredCompanies, setFilteredCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Modals
  const [viewModal, setViewModal] = useState({ isOpen: false, company: null })
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    companyId: null,
    companyName: null,
    currentStatus: null,
    newStatus: null
  })

  // Fetch companies
  const fetchCompanies = async (page = 1) => {
    try {
      setLoading(true)
      const params = {}
      if (statusFilter !== 'all') params.status = statusFilter
      params.page = page
      params.limit = 10

      const response = await adminAPI.getAllCompanies(params)
      setCompanies(response.data.data)
      setTotalPages(response.data.pagination.pages)
      setCurrentPage(page)
      filterCompanies(response.data.data, searchTerm)
    } catch (error) {
      console.error('Fetch companies error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter companies by search
  const filterCompanies = (companyList, search) => {
    const filtered = companyList.filter(company =>
      company.companyName.toLowerCase().includes(search.toLowerCase()) ||
      company.companyEmail?.toLowerCase().includes(search.toLowerCase()) ||
      company.registeredBy.email.toLowerCase().includes(search.toLowerCase())
    )
    setFilteredCompanies(filtered)
  }

  // Handle search
  const handleSearch = (e) => {
    const term = e.target.value
    setSearchTerm(term)
    setCurrentPage(1)
    filterCompanies(companies, term)
  }

  // Handle status filter
  const handleStatusFilterChange = (e) => {
    const status = e.target.value
    setStatusFilter(status)
    setCurrentPage(1)
    fetchCompanies(1)
  }

  // View company details
  const handleViewCompany = (company) => {
    setViewModal({ isOpen: true, company })
  }

  // Open status change modal
  const handleStatusChange = (company) => {
    setStatusModal({
      isOpen: true,
      companyId: company._id,
      companyName: company.companyName,
      currentStatus: company.status,
      newStatus: null
    })
  }

  // Confirm status change
  const handleConfirmStatusChange = async () => {
    if (!statusModal.newStatus) return

    try {
      await adminAPI.updateCompanyStatus(statusModal.companyId, {
        status: statusModal.newStatus
      })

      // Update local state
      setCompanies(companies.map(c =>
        c._id === statusModal.companyId ? { ...c, status: statusModal.newStatus } : c
      ))
      filterCompanies(
        companies.map(c =>
          c._id === statusModal.companyId ? { ...c, status: statusModal.newStatus } : c
        ),
        searchTerm
      )

      setStatusModal({ isOpen: false, companyId: null, companyName: null, currentStatus: null, newStatus: null })
    } catch (error) {
      console.error('Update company status error:', error)
      alert('Failed to update company status')
    }
  }

  // Initial load
  useEffect(() => {
    fetchCompanies()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by company name, email..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={handleStatusFilterChange}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : filteredCompanies.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No companies found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Company Name</th>
                <th className="px-4 py-3 text-left font-semibold">Registered By</th>
                <th className="px-4 py-3 text-left font-semibold">Email</th>
                <th className="px-4 py-3 text-left font-semibold">Website</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Created</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map(company => (
                <tr key={company._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{company.companyName}</td>
                  <td className="px-4 py-3">{company.registeredBy.name}</td>
                  <td className="px-4 py-3 text-xs break-all">{company.companyEmail || '-'}</td>
                  <td className="px-4 py-3">
                    {company.website ? (
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
                        Visit
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      company.status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : company.status === 'rejected'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {new Date(company.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => handleViewCompany(company)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                      title="View details"
                    >
                      <Eye size={18} />
                    </button>
                    {company.status === 'pending' && (
                      <>
                        <button
                          onClick={() => {
                            setStatusModal({
                              isOpen: true,
                              companyId: company._id,
                              companyName: company.companyName,
                              currentStatus: company.status,
                              newStatus: 'approved'
                            })
                          }}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition"
                          title="Approve"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setStatusModal({
                              isOpen: true,
                              companyId: company._id,
                              companyName: company.companyName,
                              currentStatus: company.status,
                              newStatus: 'rejected'
                            })
                          }}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                          title="Reject"
                        >
                          <X size={18} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => fetchCompanies(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => fetchCompanies(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* View Company Modal */}
      {viewModal.isOpen && viewModal.company && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
            <h3 className="text-xl font-bold">{viewModal.company.companyName}</h3>

            <div className="space-y-2 text-sm">
              <p>
                <strong>Registered By:</strong> {viewModal.company.registeredBy.name}
              </p>
              <p>
                <strong>HR Email:</strong> {viewModal.company.registeredBy.email}
              </p>
              <p>
                <strong>Company Email:</strong> {viewModal.company.companyEmail || '-'}
              </p>
              <p>
                <strong>Website:</strong>{' '}
                {viewModal.company.website ? (
                  <a href={viewModal.company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {viewModal.company.website}
                  </a>
                ) : (
                  '-'
                )}
              </p>
              <p>
                <strong>LinkedIn:</strong>{' '}
                {viewModal.company.linkedin ? (
                  <a href={viewModal.company.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Profile
                  </a>
                ) : (
                  '-'
                )}
              </p>
              <p>
                <strong>Status:</strong>{' '}
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  viewModal.company.status === 'approved'
                    ? 'bg-green-100 text-green-700'
                    : viewModal.company.status === 'rejected'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {viewModal.company.status.charAt(0).toUpperCase() + viewModal.company.status.slice(1)}
                </span>
              </p>
              <p>
                <strong>Registered On:</strong> {new Date(viewModal.company.createdAt).toLocaleString()}
              </p>
            </div>

            <button
              onClick={() => setViewModal({ isOpen: false, company: null })}
              className="w-full bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Status Change Confirmation Modal */}
      {statusModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold">
              {statusModal.newStatus === 'approved' ? 'Approve' : 'Reject'} Company?
            </h3>

            <p className="text-gray-600">
              Are you sure you want to{' '}
              <strong>
                {statusModal.newStatus === 'approved' ? 'approve' : 'reject'}
              </strong>{' '}
              <strong>{statusModal.companyName}</strong>?
            </p>

            {statusModal.newStatus === 'approved' && (
              <div className="bg-green-50 border border-green-200 p-3 rounded text-sm text-green-700">
                ✅ This company will get access to post job openings and contact students.
              </div>
            )}

            {statusModal.newStatus === 'rejected' && (
              <div className="bg-red-50 border border-red-200 p-3 rounded text-sm text-red-700">
                ❌ This company will be rejected and won't have access to the platform.
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() =>
                  setStatusModal({
                    isOpen: false,
                    companyId: null,
                    companyName: null,
                    currentStatus: null,
                    newStatus: null
                  })
                }
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStatusChange}
                className={`flex-1 text-white py-2 rounded-lg font-semibold transition ${
                  statusModal.newStatus === 'approved'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {statusModal.newStatus === 'approved' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}