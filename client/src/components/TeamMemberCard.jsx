import { Mail, Briefcase } from 'lucide-react'

const TeamMemberCard = ({ member, isHead }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-slate-900">{member.name}</h3>
          {isHead && (
            <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
              Project Head
            </span>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="flex items-center gap-2 text-slate-600 text-sm mb-2">
        <Mail size={16} />
        <span className="truncate">{member.email}</span>
      </div>

      {/* Role */}
      <div className="flex items-center gap-2 text-slate-600 text-sm">
        <Briefcase size={16} />
        <span>{member.role || 'Student'}</span>
      </div>
    </div>
  )
}

export default TeamMemberCard