import { Link } from 'react-router-dom'
import { Users, Code2, TrendingUp } from 'lucide-react'

const ProjectCard = ({ project }) => {
  return (
    <Link to={`/projects/${project._id}`}>
      <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:border-blue-300 transition cursor-pointer h-full">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">
            {project.title}
          </h3>
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              {project.projectType}
            </span>
            <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
              {project.status}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-slate-600 text-sm mb-4 line-clamp-2">
          {project.description}
        </p>

        {/* Skills */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-700 mb-2">Skills Required:</p>
          <div className="flex flex-wrap gap-2">
            {project.skills.slice(0, 3).map((skill) => (
              <span key={skill} className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">
                {skill}
              </span>
            ))}
            {project.skills.length > 3 && (
              <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">
                +{project.skills.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2 text-slate-600 text-sm">
            <Users size={16} />
            <span>{project.members.length + 1} in team</span>
          </div>
          <div className="flex items-center gap-1 text-slate-600 text-sm">
            <Code2 size={16} />
            <span>Details</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ProjectCard