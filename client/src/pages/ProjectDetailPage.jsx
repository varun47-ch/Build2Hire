import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { projectAPI, companyAPI } from '../services/api'
import {
  ArrowLeft,
  Calendar,
  Users,
  Code2,
  AlertCircle,
  Loader,
  MessageCircle,
  Clock,
  CheckCircle2,
  Edit2,
  Trash2,
  X,
  Code,
  Briefcase,
  Lock
} from 'lucide-react'
import JoinRequestModal from '../components/JoinRequestModal'

const ProjectDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuth } = useAuth()

  const [state, setState] = useState({
    project: null,
    loading: true,
    error: null,
    hasCompany: false,
    checkingCompany: true,
    statusLoading: false,
    statusError: null,
    successMessage: null,
    joined: false,
    showJoinModal: false,
    deleteModal: { isOpen: false, isDeleting: false }
  })

  useEffect(() => {
    if (isAuth && user?.role === 'Hr') {
      verifyCompanyRegistration()
    } else {
      setState(prev => ({ ...prev, checkingCompany: false }))
    }
  }, [isAuth, user])

  useEffect(() => {
    if (!state.checkingCompany) {
      loadProjectDetails()
    }
  }, [id, state.checkingCompany])

  const verifyCompanyRegistration = useCallback(async () => {
    try {
      const { data } = await companyAPI.getMyCompany()
      setState(prev => ({
        ...prev,
        hasCompany: data.success && !!data.data,
        checkingCompany: false
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        hasCompany: false,
        checkingCompany: false
      }))
    }
  }, [])

  const loadProjectDetails = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const { data } = await projectAPI.getById(id)

      if (data.success) {
        const isMember = isAuth && user
          ? data.data.members.some(m => m._id === user._id || m === user._id)
          : false

        setState(prev => ({
          ...prev,
          project: data.data,
          joined: isMember,
          loading: false
        }))
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.response?.data?.message || 'Failed to load project',
        loading: false
      }))
    }
  }, [isAuth, user, id])

  const updateProjectStatus = useCallback(async (newStatus) => {
    setState(prev => ({ ...prev, statusLoading: true, statusError: null }))

    try {
      const { data } = await projectAPI.updateStatus(id, { status: newStatus })

      if (data.success) {
        setState(prev => ({
          ...prev,
          project: { ...prev.project, status: newStatus },
          successMessage: `✓ Project marked as ${newStatus}`,
          statusLoading: false
        }))

        setTimeout(() => {
          setState(prev => ({ ...prev, successMessage: null }))
        }, 3000)
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        statusError: error.response?.data?.message || 'Status update failed',
        statusLoading: false
      }))
    }
  }, [id])

  const deleteProject = useCallback(async () => {
    setState(prev => ({
      ...prev,
      deleteModal: { ...prev.deleteModal, isDeleting: true }
    }))

    try {
      const { data } = await projectAPI.delete(id)

      if (data.success) {
        setState(prev => ({
          ...prev,
          successMessage: '✓ Project deleted successfully'
        }))
        setTimeout(() => navigate('/student-dashboard'), 1500)
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        statusError: error.response?.data?.message || 'Deletion failed',
        deleteModal: { ...prev.deleteModal, isDeleting: false }
      }))
    }
  }, [id, navigate])

  const toggleDeleteModal = useCallback((isOpen) => {
    setState(prev => ({
      ...prev,
      deleteModal: { isOpen, isDeleting: false }
    }))
  }, [])

  const toggleJoinModal = useCallback((show) => {
    setState(prev => ({ ...prev, showJoinModal: show }))
  }, [])

  const handleJoinSuccess = useCallback(() => {
    setState(prev => ({ ...prev, joined: true }))
    loadProjectDetails()
  }, [loadProjectDetails])

  if (state.checkingCompany) {
    return <LoadingState message="Checking access..." />
  }

  if (isAuth && user?.role === 'Hr' && !state.hasCompany) {
    return <CompanyRegistrationRequired onNavigate={navigate} />
  }

  if (state.loading) {
    return <LoadingState message="Loading project details..." />
  }

  if (state.error || !state.project) {
    return <ErrorState error={state.error} onNavigate={navigate} />
  }

  const isProjectHead = isAuth && user && state.project.createdBy && state.project.createdBy._id === user._id
  const canJoin = isAuth && !state.joined && !isProjectHead

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <NavButton onClick={() => navigate('/projects')} />

        <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
          <ProjectHeader project={state.project} />

          <div className="p-8 space-y-8">
            {state.successMessage && (
              <SuccessMessage message={state.successMessage} />
            )}

            <ProjectMetrics project={state.project} />
            <SkillsSection skills={state.project.skills} />
            <RolesSection roles={state.project.rolesNeeded} />
            <RepositorySection url={state.project.githubUrl} />

            {state.project.groupLink && (
              <GroupCommunicationSection
                project={state.project}
                user={user}
                joined={state.joined}
                isProjectHead={isProjectHead}
                onJoinClick={() => toggleJoinModal(true)}
              />
            )}

            {isProjectHead && (
              <StatusManagement
                project={state.project}
                loading={state.statusLoading}
                error={state.statusError}
                onStatusChange={updateProjectStatus}
              />
            )}

            <TeamSection
              project={state.project}
              isProjectHead={isProjectHead}
              onViewRequests={() => navigate(`/projects/${state.project._id}/requests`)}
            />

            {state.project.status === 'recruiting' && !isProjectHead && (
              <RecruitingNotice />
            )}
          </div>

          <ProjectFooter
            isProjectHead={isProjectHead}
            joined={state.joined}
            isAuth={isAuth}
            canJoin={canJoin}
            project={state.project}
            onEdit={() => navigate(`/edit-project/${state.project._id}`)}
            onDelete={() => toggleDeleteModal(true)}
            onJoin={() => toggleJoinModal(true)}
          />
        </div>
      </div>

      {state.deleteModal.isOpen && (
        <DeleteConfirmationModal
          project={state.project}
          isDeleting={state.deleteModal.isDeleting}
          onConfirm={deleteProject}
          onCancel={() => toggleDeleteModal(false)}
        />
      )}

      {state.showJoinModal && (
        <JoinRequestModal
          projectId={state.project._id}
          onClose={() => toggleJoinModal(false)}
          onSuccess={handleJoinSuccess}
        />
      )}
    </div>
  )
}

const LoadingState = ({ message }) => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="text-center">
      <Loader size={40} className="text-blue-600 animate-spin mx-auto mb-4" />
      <p className="text-slate-600">{message}</p>
    </div>
  </div>
)

const ErrorState = ({ error, onNavigate }) => (
  <div className="min-h-screen bg-slate-50 px-4 py-12">
    <div className="max-w-3xl mx-auto">
      <NavButton onClick={() => onNavigate('/projects')} />
      <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
        <AlertCircle size={40} className="text-red-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Project Not Found</h1>
        <p className="text-slate-600 mb-6">{error || 'This project does not exist'}</p>
        <button
          onClick={() => onNavigate('/projects')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          Return to Projects
        </button>
      </div>
    </div>
  </div>
)

const CompanyRegistrationRequired = ({ onNavigate }) => (
  <div className="min-h-screen bg-slate-50 px-4 py-12">
    <div className="max-w-3xl mx-auto">
      <NavButton onClick={() => onNavigate('/projects')} />
      <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
        <div className="min-h-96 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={48} className="text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">No Company Registered</h1>
            <p className="text-slate-600 text-lg mb-8">
              Register your company to access HR features
            </p>
            <button
              onClick={() => onNavigate('/register-company')}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-lg"
            >
              Register Company Now
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const NavButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 font-medium"
  >
    <ArrowLeft size={20} />
    Back to Projects
  </button>
)

const SuccessMessage = ({ message }) => (
  <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
    <CheckCircle2 size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
    <p className="text-sm text-green-800 font-medium">{message}</p>
  </div>
)

const ProjectHeader = ({ project }) => (
  <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-12 text-white">
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <h1 className="text-4xl font-bold mb-2">{project.title}</h1>
        <p className="text-blue-100">{project.description}</p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <Badge>{project.projectType}</Badge>
        <StatusBadge status={project.status} />
      </div>
    </div>
  </div>
)

const Badge = ({ children }) => (
  <span className="px-4 py-2 bg-slate-500 bg-opacity-20 rounded-full text-sm font-semibold">
    {children}
  </span>
)

const StatusBadge = ({ status }) => {
  const colors = {
    recruiting: 'bg-green-500 bg-opacity-20',
    'in-progress': 'bg-yellow-500 bg-opacity-20',
    completed: 'bg-slate-500 bg-opacity-20'
  }
  return <Badge>{status}</Badge>
}

const ProjectMetrics = ({ project }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <MetricCard icon={Calendar} label="Created" value={new Date(project.createdAt).toLocaleDateString()} />
    <MetricCard icon={Users} label="Team Size" value={`${project.members.length + 1} members`} />
    <MetricCard icon={Code2} label="Tech Stack" value={`${project.skills.length} technologies`} />
  </div>
)

const MetricCard = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <Icon className="text-blue-600 flex-shrink-0 mt-1" size={20} />
    <div>
      <p className="text-sm font-medium text-slate-700">{label}</p>
      <p className="text-slate-900 font-semibold">{value}</p>
    </div>
  </div>
)

const SkillsSection = ({ skills }) => (
  <div className="border-t border-slate-200 pt-8">
    <h2 className="text-2xl font-bold text-slate-900 mb-4">Skills Required</h2>
    <div className="flex flex-wrap gap-3">
      {skills.map(skill => (
        <span key={skill} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium text-sm">
          {skill}
        </span>
      ))}
    </div>
  </div>
)

const RolesSection = ({ roles }) => {
  if (!roles?.length) return null

  const getRoleColor = (role) => {
    const colors = {
      frontend: 'bg-blue-100 text-blue-700',
      backend: 'bg-purple-100 text-purple-700',
      ml: 'bg-orange-100 text-orange-700',
      designer: 'bg-pink-100 text-pink-700',
      devops: 'bg-red-100 text-red-700',
      other: 'bg-slate-100 text-slate-700'
    }
    return colors[role] || colors.other
  }

  return (
    <div className="border-t border-slate-200 pt-8">
      <div className="flex items-center gap-3 mb-6">
        <Briefcase size={24} className="text-purple-600" />
        <h2 className="text-2xl font-bold text-slate-900">Roles Needed</h2>
      </div>
      <div className="flex flex-wrap gap-3">
        {roles.map(role => (
          <span key={role} className={`px-4 py-2 rounded-lg font-medium text-sm capitalize ${getRoleColor(role)}`}>
            {role}
          </span>
        ))}
      </div>
    </div>
  )
}

const RepositorySection = ({ url }) => {
  if (!url) return null

  return (
    <div className="border-t border-slate-200 pt-8">
      <div className="flex items-center gap-3 mb-6">
        <Code size={24} className="text-slate-900" />
        <h2 className="text-2xl font-bold text-slate-900">Repository</h2>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-3 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition"
      >
        <Code size={18} />
        View on GitHub
      </a>
      <p className="text-slate-600 text-sm mt-3">{url}</p>
    </div>
  )
}

const GroupCommunicationSection = ({ project, user, joined, isProjectHead, onJoinClick }) => {
  const canAccessGroup = joined || isProjectHead || user?.role === 'Hr' || user?.role === 'Admin'

  if (canAccessGroup) {
    return (
      <div className="border-t border-slate-200 pt-8">
        <div className="flex items-center gap-3 mb-6">
          <MessageCircle size={24} className="text-slate-900" />
          <h2 className="text-2xl font-bold text-slate-900">Team Communication</h2>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-white rounded-xl border border-green-200 p-6">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600 mb-2">
                Connected on <span className="capitalize font-semibold text-slate-900">
                  {project.groupType || 'WhatsApp'}
                </span>
              </p>
              <p className="text-slate-600 text-sm mb-4">
                Join the team group to discuss project details and collaborate with team members
              </p>
            </div>

            <a
              href={project.groupLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-sm whitespace-nowrap flex items-center gap-2"
            >
              <MessageCircle size={18} />
              Open Group
            </a>
          </div>

          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-xs text-green-700">
              ✅ You can access the team communication group
              {user?.role === 'Hr' && ' (HR Access)'}
              {user?.role === 'Admin' && ' (Admin Access)'}
            </p>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="border-t border-slate-200 pt-8">
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Lock size={18} className="text-slate-600" />
              <p className="text-sm font-semibold text-slate-900">
                Team Communication Group (Locked)
              </p>
            </div>
            <p className="text-slate-600 text-sm mb-4">
              The project head has set up a <span className="font-semibold capitalize">{project.groupType}</span> group for team communication. Send a join request and wait for approval to access the group link.
            </p>
          </div>
        </div>

        <button
          onClick={onJoinClick}
          className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
        >
          Send Join Request to Access
        </button>
      </div>
    </div>
  )
}

const StatusManagement = ({ project, loading, error, onStatusChange }) => (
  <div className="border-t border-slate-200 pt-8">
    <div className="p-6 bg-gradient-to-r from-blue-50 to-slate-50 rounded-xl border border-blue-200">
      <h3 className="text-lg font-bold text-slate-900 mb-4">
        Project Status
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="mb-4">
        <StatusIndicator status={project.status} />
      </div>

      <div className="space-y-2">
        {project.status === 'recruiting' && (
          <StatusButton
            loading={loading}
            onClick={() => onStatusChange('in-progress')}
            icon={Clock}
            label="Mark as In Progress"
            className="bg-blue-600 hover:bg-blue-700"
          />
        )}
        {project.status === 'in-progress' && (
          <StatusButton
            loading={loading}
            onClick={() => onStatusChange('completed')}
            icon={CheckCircle2}
            label="Mark as Completed"
            className="bg-green-600 hover:bg-green-700"
          />
        )}
        {project.status === 'completed' && (
          <StatusButton
            loading={loading}
            onClick={() => onStatusChange('in-progress')}
            icon={Clock}
            label="Reopen Project"
            className="bg-blue-600 hover:bg-blue-700"
          />
        )}
      </div>

      <p className="text-xs text-slate-600 mt-4">
         Only project head can change status. Changes are permanent.
      </p>
    </div>
  </div>
)

const StatusIndicator = ({ status }) => {
  const styles = {
    recruiting: 'bg-green-100 text-green-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    completed: 'bg-slate-100 text-slate-700'
  }
  const icons = {
    recruiting: Clock,
    'in-progress': Clock,
    completed: CheckCircle2
  }
  const Icon = icons[status] || Clock

  return (
    <div className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 w-fit ${styles[status]}`}>
      <Icon size={16} />
      Current: {status}
    </div>
  )
}

const StatusButton = ({ loading, onClick, icon: Icon, label, className }) => (
  <button
    onClick={onClick}
    disabled={loading}
    className={`w-full sm:w-auto px-6 py-2 text-white rounded-lg transition font-semibold text-sm disabled:opacity-50 flex items-center gap-2 ${className}`}
  >
    {loading ? <Loader size={16} className="animate-spin" /> : <Icon size={16} />}
    {label}
  </button>
)

const TeamSection = ({ project, isProjectHead, onViewRequests }) => (
  <div className="border-t border-slate-200 pt-8">
    <h2 className="text-2xl font-bold text-slate-900 mb-6">
      Team Members
    </h2>

    <div className="mb-6">
      <p className="text-sm font-semibold text-slate-700 mb-3">
        Project Head
      </p>
      {project.createdBy ? (
        <div className="bg-gradient-to-r from-blue-50 to-slate-50 rounded-xl border border-blue-200 p-4">
          <h3 className="font-semibold text-slate-900">
            {project.createdBy.name}
          </h3>
          <p className="text-slate-600 text-sm">
            {project.createdBy.email}
          </p>
          <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
            Project Head
          </span>
        </div>
      ) : (
        <div className="text-slate-600">Loading...</div>
      )}
    </div>

    {isProjectHead && (
      <div className="mb-6">
        <button
          onClick={onViewRequests}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
        >
          <MessageCircle size={18} />
          View Join Requests
        </button>
      </div>
    )}

    {project.members.length > 0 && (
      <div>
        <p className="text-sm font-semibold text-slate-700 mb-3">
          Team Members ({project.members.length})
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {project.members.map((member) => (
            <div
              key={member._id || member}
              className="bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200 p-4"
            >
              <h3 className="font-semibold text-slate-900">
                {typeof member === 'string'
                  ? 'Member'
                  : member.name || 'Loading...'}
              </h3>
              {typeof member !== 'string' && (
                <p className="text-slate-600 text-sm">
                  {member.email}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    )}

    {project.members.length === 0 && (
      <p className="text-slate-600">
        No team members yet. Be the first to join!
      </p>
    )}
  </div>
)

const RecruitingNotice = () => (
  <div className="border-t border-slate-200 pt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
    <p className="text-slate-700 mb-4">
      This project is actively recruiting. Send a join request to
      express your interest!
    </p>
  </div>
)

const ProjectFooter = ({ isProjectHead, joined, isAuth, canJoin, project, onEdit, onDelete, onJoin }) => (
  <div className="border-t border-slate-200 px-8 py-6 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
    <div>
      {isProjectHead && (
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-blue-600">
            You are the project head
          </span>
        </p>
      )}
      {joined && !isProjectHead && (
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-green-600">
            ✓ You are a team member
          </span>
        </p>
      )}
    </div>

    <div className="flex flex-wrap gap-3 w-full sm:w-auto">
      {isProjectHead && (
        <>
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
          >
            <Edit2 size={16} />
            Edit
          </button>
          <button
            onClick={onDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold text-sm"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </>
      )}

      {canJoin && project.status === 'recruiting' && (
        <button
          onClick={onJoin}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-sm"
        >
          <MessageCircle size={16} />
          Send Request
        </button>
      )}

      {!isAuth && (
        <Link
          to="/login"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
        >
          Login to Join
        </Link>
      )}
    </div>
  </div>
)

const DeleteConfirmationModal = ({ project, isDeleting, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-xl shadow-xl max-w-sm w-full">
      <div className="flex items-center justify-between p-6 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900">Delete Project</h2>
        <button
          onClick={onCancel}
          disabled={isDeleting}
          className="p-1 hover:bg-slate-100 rounded-lg transition disabled:opacity-50"
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-6">
        <p className="text-slate-700 mb-4">
          Are you sure you want to delete <span className="font-bold">"{project.title}"</span>?
        </p>
        <p className="text-sm text-slate-600 mb-6">
          This action cannot be undone. All project data, team members, and requests will be permanently deleted.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 transition font-semibold disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader size={16} className="animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
)

export default ProjectDetailPage