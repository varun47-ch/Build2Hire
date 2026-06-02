import Project from '../models/Project.js'
import nodemailer from 'nodemailer'

// @desc    Contact HR about a project team
// @route   POST /api/projects/:id/contact
// @access  Private (HR)
export const contactAboutProject = async (req, res) => {
  try {
    const { message } = req.body
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      })
    }
    
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email')
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      })
    }
    
    // Create email content
    const teamMembers = [
      { name: project.createdBy.name, email: project.createdBy.email }
    ].concat(
      project.members.map(member => ({ name: member.name, email: member.email }))
    )
    
    const emailContent = `
      <h2>Interest in Your Project: ${project.title}</h2>
      <p><strong>From HR:</strong> ${req.user.name} (${req.user.email})</p>
      <p><strong>Project:</strong> ${project.title}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
      <hr>
      <p><strong>Project Details:</strong></p>
      <ul>
        <li><strong>Type:</strong> ${project.projectType}</li>
        <li><strong>Status:</strong> ${project.status}</li>
        <li><strong>GitHub:</strong> <a href="${project.githubUrl}">${project.githubUrl}</a></li>
      </ul>
      <p><strong>Team:</strong></p>
      <ul>
        ${teamMembers.map(member => `<li>${member.name} (${member.email})</li>`).join('')}
      </ul>
    `
    
    // Send email to all team members
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD
      }
    })
    
    const mailOptions = {
      from: process.env.NODEMAILER_EMAIL,
      to: teamMembers.map(m => m.email).join(','),
      subject: `Company Interest: ${project.title}`,
      html: emailContent
    }
    
    await transporter.sendMail(mailOptions)
    
    res.status(200).json({
      success: true,
      message: 'Contact message sent to team members successfully',
      data: {
        projectId: project._id,
        projectTitle: project.title,
        recipientCount: teamMembers.length,
        sentAt: new Date()
      }
    })
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}