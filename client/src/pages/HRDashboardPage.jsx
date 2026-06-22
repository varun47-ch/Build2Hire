import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { projectAPI, companyAPI } from '../services/api'
import CompanyStatusDisplay from '../components/CompanyStatusDisplay'
import {
  AlertCircle,
  Loader,
  Users,
  Briefcase,
  Code2,
  Search,
  Filter,
  Mail,
  Eye,
  TrendingUp,
  X
} from 'lucide-react'

const HRDashboardPage = () => {
  const navigate = useNavigate()
  const { user, isAuth } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [company, setCompany] = useState(null)
  const [companyLoading, setCompanyLoading] = useState(true)

  const [allProjects, setAllProjects] = useState([])
  const [allStudents, setAllStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])

  const [skillFilter, setSkillFilter] = useState('')
  const [projectSearchFilter, setProjectSearchFilter] = useState('')
  const [studentSearchFilter, setStudentSearchFilter] = useState('')

  const [activeTab, setActiveTab] = useState('overview')

  // Contact Modal
  const [contactModal, setContactModal] = useState({
    isOpen: false,
    type: null,
    recipient: null
  })

  useEffect(() => {
    if (!isAuth || user?.role !== 'Hr') {
      navigate('/login')
      return
    }
    fetchCompanyStatus()
  }, [isAuth, user, navigate])

  const fetchCompanyStatus = async () => {
    try {
      setCompanyLoading(true)
      const response = await companyAPI.getMyCompany()
      if (response.data.success) {
        setCompany(response.data.data)
        // Only fetch projects if company is approved
        if (response.data.data.status === 'approved') {
          fetchData()
        } else {
          setLoading(false)
        }
      }
    } catch (err) {
      // No company registered yet
      if (err.response?.status === 404) {
        setCompany(null)
      } else {
        setError(err.response?.data?.message || 'Failed to fetch company status')
      }
      setLoading(false)
    } finally {
      setCompanyLoading(false)
    }
  }

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      const projectsRes = await projectAPI.getAll({ limit: 1000 })

      if (projectsRes.data.success) {
        setAllProjects(projectsRes.data.data)

        const studentsMap = new Map()

        projectsRes.data.data.forEach(project => {
          if (project.createdBy) {
            studentsMap.set(project.createdBy._id, {
              ...project.createdBy,
              projects: [
                ...(studentsMap.get(project.createdBy._id)?.projects || []),
                project
              ],
              skills: project.skills
            })
          }

          project.members.forEach(member => {
            if (member._id && !studentsMap.has(member._id)) {
              studentsMap.set(member._id, {
                ...member,
                projects: [project],
                skills: project.skills
              })
            } else if (member._id) {
              const existing = studentsMap.get(member._id)
              studentsMap.set(member._id, {
                ...existing,
                projects: [...existing.projects, project]
              })
            }
          })
        })

        const students = Array.from(studentsMap.values())
        setAllStudents(students)
        setFilteredStudents(students)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data')
      console.error('Fetch data error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let filtered = allStudents

    if (skillFilter) {
      filtered = filtered.filter(student =>
        student.skills?.some(skill =>
          skill.toLowerCase().includes(skillFilter.toLowerCase())
        )
      )
    }

    if (studentSearchFilter) {
      filtered = filtered.filter(student =>
        student.name?.toLowerCase().includes(studentSearchFilter.toLowerCase()) ||
        student.email?.toLowerCase().includes(studentSearchFilter.toLowerCase())
      )
    }

    setFilteredStudents(filtered)
  }, [skillFilter, studentSearchFilter, allStudents])

  const filteredProjects = allProjects.filter(project =>
    project.title?.toLowerCase().includes(projectSearchFilter.toLowerCase())
  )

  const totalStudents = allStudents.length
  const totalProjects = allProjects.length
  const topSkills = Array.from(
    new Map(
      allProjects
        .flatMap(p => p.skills)
        .map(skill => [skill, (allProjects.flatMap(p => p.skills).filter(s => s === skill).length)])
    ).entries()
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const handleContact = (type, recipient) => {
    setContactModal({
      isOpen: true,
      type,
      recipient
    })
  }

  const handleQuickEmail = () => {
    let emails = []
    let subject = ''

    if (contactModal.type === 'project') {
      const projectHead = contactModal.recipient?.createdBy?.email
      const teamEmails = contactModal.recipient?.members?.map(m => m.email) || []
      emails = [projectHead, ...teamEmails].filter(Boolean)
      subject = `Recruitment Opportunity - ${contactModal.recipient?.title}`
    } else if (contactModal.type === 'student') {
      emails = [contactModal.recipient?.email]
      subject = 'Recruitment Opportunity'
    }

    if (emails.length === 0) {
      alert('No email addresses found')
      return
    }

    const messageTemplate = `Hi,

We are impressed by your impressive work and would like to discuss potential collaboration opportunities.

Looking forward to hearing from you.

Best regards,
${user?.name || 'Recruiter'}
${user?.email || ''}`

    const recipientEmails = emails.join(',')

    const gmailLink = `https://mail.google.com/mail/?ui=2&fs=1&to=${encodeURIComponent(
      recipientEmails
    )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(messageTemplate)}`

    console.log('Opening Gmail compose...')

    window.open(gmailLink, '_blank', 'width=800,height=600')

    setContactModal({
      isOpen: false,
      type: null,
      recipient: null
    })
  }

  if (companyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader size={40} className="text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading HR dashboard...</p>
        </div>
      </div>
    )
  }

  if (!company || company.status !== 'approved') {
    return (
      <div className="min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto">
          <CompanyStatusDisplay />
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader size={40} className="text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading talent data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">Error loading dashboard</p>
              <p className="text-sm text-red-800">{error}</p>
              <button
                onClick={fetchData}
                className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
            Talent Discovery
          </h1>
          <p className="text-slate-600 text-sm sm:text-base">
            Find and recruit top talent from our student projects
          </p>
        </div>

        <div className="flex gap-4 mb-8 border-b border-slate-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-4 px-4 font-semibold transition whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <TrendingUp size={18} />
              Overview
            </div>
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`pb-4 px-4 font-semibold transition whitespace-nowrap ${
              activeTab === 'students'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users size={18} />
              Talent Pool
            </div>
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`pb-4 px-4 font-semibold transition whitespace-nowrap ${
              activeTab === 'projects'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Briefcase size={18} />
              Projects
            </div>
          </button>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">
                      Total Students
                    </p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">
                      {totalStudents}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users size={24} className="text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">
                      Active Projects
                    </p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">
                      {totalProjects}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Briefcase size={24} className="text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">
                      Top Skills
                    </p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">
                      {topSkills.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Code2 size={24} className="text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Top Skills */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4">
                Top Skills in Talent Pool
              </h3>
              <div className="space-y-3">
                {topSkills.map(([skill, count]) => (
                  <div key={skill} className="flex items-center justify-between">
                    <span className="text-slate-700 font-medium">{skill}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(count / Math.max(...topSkills.map(s => s[1]))) * 100}%`
                          }}
                        />
                      </div>
                      <span className="text-sm text-slate-600 font-medium w-8 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Action */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-2">Ready to Recruit?</h3>
              <p className="text-blue-100 mb-6">
                Browse our talent pool and find the perfect candidates for your team
              </p>
              <button
                onClick={() => setActiveTab('students')}
                className="px-6 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold"
              >
                Browse Talent
              </button>
            </div>
          </div>
        )}

        {/* STUDENTS TAB */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Search Student
                  </label>
                  <div className="relative">
                    <Search size={18} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={studentSearchFilter}
                      onChange={(e) => setStudentSearchFilter(e.target.value)}
                      placeholder="Name or email..."
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Filter by Skill
                  </label>
                  <div className="relative">
                    <Filter size={18} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={skillFilter}
                      onChange={(e) => setSkillFilter(e.target.value)}
                      placeholder="e.g., React, Python..."
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Students List */}
            {filteredStudents.length > 0 ? (
              <div className="space-y-4">
                {filteredStudents.map(student => (
                  <div
                    key={student._id}
                    className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900">
                          {student.name}
                        </h3>
                        <p className="text-slate-600 text-sm">
                          {student.email}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                        {student.projects?.length || 0} projects
                      </span>
                    </div>

                    {/* Skills */}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-slate-700 mb-2">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {student.skills?.slice(0, 5).map(skill => (
                          <span
                            key={skill}
                            className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                        {student.skills?.length > 5 && (
                          <span className="text-xs text-slate-600">
                            +{student.skills.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Projects */}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-slate-700 mb-2">
                        Recent Projects
                      </p>
                      <div className="space-y-1">
                        {student.projects?.slice(0, 2).map(project => (
                          <p key={project._id} className="text-sm text-slate-600">
                            • {project.title}
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-slate-200">
                      <button
                        onClick={() => navigate(`/projects/${student.projects?.[0]?._id}`)}
                        className="flex-1 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition font-semibold text-sm flex items-center justify-center gap-1"
                      >
                        <Eye size={16} />
                        View Profile
                      </button>
                      <button
                        onClick={() => handleContact('student', student)}
                        className="flex-1 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition font-semibold text-sm flex items-center justify-center gap-1"
                      >
                        <Mail size={16} />
                        Contact
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                <Users size={48} className="text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">
                  No students found matching your filters
                </p>
              </div>
            )}
          </div>
        )}

        {/* PROJECTS TAB */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={projectSearchFilter}
                  onChange={(e) => setProjectSearchFilter(e.target.value)}
                  placeholder="Search projects..."
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Projects Grid */}
            {filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map(project => (
                  <div
                    key={project._id}
                    className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition flex flex-col"
                  >
                    <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">
                      {project.title}
                    </h3>
                    <p className="text-slate-600 text-sm mb-3 line-clamp-2 flex-1">
                      {project.description}
                    </p>

                    <div className="mb-3 space-y-1">
                      <p className="text-xs text-slate-600">
                        <span className="font-semibold">Head:</span> {project.createdBy?.name}
                      </p>
                      <p className="text-xs text-slate-600">
                        <span className="font-semibold">Team:</span> {project.members?.length + 1} members
                      </p>
                    </div>

                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {project.skills?.slice(0, 3).map(skill => (
                          <span
                            key={skill}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-slate-200 mt-auto">
                      <button
                        onClick={() => navigate(`/projects/${project._id}`)}
                        className="flex-1 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition font-semibold text-sm flex items-center justify-center gap-1"
                      >
                        <Eye size={16} />
                        View
                      </button>
                      <button
                        onClick={() => handleContact('project', project)}
                        className="flex-1 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition font-semibold text-sm flex items-center justify-center gap-1"
                      >
                        <Mail size={16} />
                        Contact
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                <Briefcase size={48} className="text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">
                  No projects found
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Contact Modal - Simplified */}
      {contactModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">
                {contactModal.type === 'project' ? 'Project Team' : 'Student Info'}
              </h2>
              <button
                onClick={() =>
                  setContactModal({
                    isOpen: false,
                    type: null,
                    recipient: null
                  })
                }
                className="p-1 hover:bg-slate-100 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                {contactModal.type === 'project' ? (
                  <>
                    <div>
                      <p className="text-xs font-semibold text-blue-600 mb-1">
                        PROJECT
                      </p>
                      <p className="text-slate-900 font-bold">
                        {contactModal.recipient?.title}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-blue-600 mb-1">
                        PROJECT HEAD
                      </p>
                      <p className="text-slate-900 font-bold">
                        {contactModal.recipient?.createdBy?.name}
                      </p>
                      <p className="text-sm text-slate-600">
                        {contactModal.recipient?.createdBy?.email}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-blue-600 mb-1">
                        TEAM MEMBERS
                      </p>
                      <p className="text-slate-900 font-bold">
                        {(contactModal.recipient?.members?.length || 0) + 1} members
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-blue-600 mb-1">
                        TECHNOLOGIES
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {contactModal.recipient?.skills?.slice(0, 5).map(skill => (
                          <span
                            key={skill}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-xs font-semibold text-blue-600 mb-1">
                        NAME
                      </p>
                      <p className="text-slate-900 font-bold">
                        {contactModal.recipient?.name}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-blue-600 mb-1">
                        EMAIL
                      </p>
                      <p className="text-slate-900 font-bold">
                        {contactModal.recipient?.email}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-blue-600 mb-1">
                        PROJECTS
                      </p>
                      <div className="space-y-1">
                        {contactModal.recipient?.projects?.slice(0, 3).map(proj => (
                          <p key={proj._id} className="text-sm text-slate-600">
                            • {proj.title}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-blue-600 mb-1">
                        SKILLS
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {contactModal.recipient?.skills?.slice(0, 5).map(skill => (
                          <span
                            key={skill}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() =>
                    setContactModal({
                      isOpen: false,
                      type: null,
                      recipient: null
                    })
                  }
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 transition font-semibold text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleQuickEmail}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2 text-sm"
                >
                  <Mail size={16} />
                  Open Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HRDashboardPage