'use strict';
const db  = require('../models');
const { Op, fn, col, literal } = require('sequelize');
const moment = require('moment');
const fs = require('fs');
const { marked } = require('marked');
const { JSDOM } = require('jsdom');
const DOMPurify = require('dompurify')(new JSDOM().window);

const getSuccessMessage = (message) => {
  const messageHtml = `
    <div class="alert success">
      <div class="closebtn" onclick="this.parentElement.style.display='none';">&times;</div>
        ${message}
      </div>
  `;
  return messageHtml;
}

const getProjectTypes = () => {
  return {
        project: 'Project',
        program: 'Program',
        task: 'Task'
      };
}

module.exports = {
  projectsList: async (req, res) => {
    try {
      let projects = await db.Project.findAll({
        include: [
          { model: db.User, as: 'Manager', attributes: ['firstName', 'lastName'] },
          { model: db.User, as: 'Sponsor', attributes: ['firstName', 'lastName'] },
          {
            model: db.Status,
            as: 'statuses',
            required: false,
            order: [['date', 'DESC']],
            limit: 1
          },
          { model: db.Portfolio, as: 'portfolio', attributes: ['id', 'year'], required: false},
          { model: db.Project, as: 'program', attributes: ['id', 'name'], required: false},
        ],
      });
      let title;
      const status = req.query.status;
      const type = req.query.type;
      const programs = await db.Project.findAll({where: {projectStatus: 'open', projectType: 'program'}, attributes: ['id', 'name'] });
      if (status === 'closed' || status === 'open') {
        projects = projects.filter(project => project.projectStatus === status);
      }
      if (type === 'program') {
        projects = projects.filter(project => project.projectType === type);
        title = 'List of programs';
      } else {
        projects = projects.filter(project => project.projectType !== 'program');
        title = 'List of tasks and projects';
      }
      res.render('projects', { title: title, projects, programs, status, type, moment, user: req.session.user, messages: req.flash() });
    } catch(error) {
      console.error('Error listing projects:', error);
    }
  },
  addProject: async (req, res) => {
    try {
      const users = await db.User.findAll({
        attributes: ['id', 'firstName', 'lastName'],
      });
      res.render('addProject', { title: 'Add Project', users, user: req.session.user });
    } catch(error) {
      console.error('Error displaying and add project form:', error);
      res.status(500).send({ message: 'I tried, but I failed to add project form' }); 
    }
  },
  addProjectFromInitiative: async (req, res) => {
    try {
      const users = await db.User.findAll({
        attributes: ['id', 'firstName', 'lastName'],
      });
      const initiative = await db.Initiative.findByPk(req.params.id, {
          include: [
          {
            model: db.User,
            as: 'initiator',
            attributes: ['firstName', 'lastName']
          },
          {
            model: db.Attachment,
            as: 'attachments',
            required: false,
            where: {
              source_type: 'initiative',
              source_id: req.params.id
            }
          },
        ]
      });
      initiative.full_desc = DOMPurify.sanitize(marked(initiative.full_desc));
      res.render('addProject', { title: 'Add Project', users, user: req.session.user, initiative });
    } catch(error) {
      console.error('Error converting an initiative to a project:', error);
      res.status(500).send({ message: 'I tried, but I failed to convert an initiative to a project' }); 
    }
  },
  createProject: async (req, res) => {
    try {
      const formData = req.body;
      formData.projectStatus = 'open';
      const newProject = await db.Project.create(formData);
      res.status(201).redirect('/pmo');
    } catch(error) {
      console.error('Error creating project:', error);
      res.status(500).send({ message: 'I tried, but I failed creating a project' }); 
    }
  },
  changeProjectDesc: async (req, res) => {
    try {
      const id = req.params.id;
      const project = await db.Project.findByPk(id, {
        include: [
          { model: db.User, as: 'Manager', attributes: ['firstName', 'lastName'] },
          { model: db.User, as: 'Sponsor', attributes: ['firstName', 'lastName'] },
        ]
      });
      const users = await db.User.findAll({
        attributes: ['id', 'firstName', 'lastName'],
      });
      res.status(200).render('partial_updateProjectDesc', { project, moment, users });
    } catch {
      console.error('Error retreiving info about the project', error);
      res.status(500).send({ message: 'I tried, but I failed retreiving info a project' }); 
    }
  },
  updateProjectDesc: async (req, res) => {
    try {
      const formData = req.body;
      const id = req.params.id;
      const projectTypes = getProjectTypes();
      const updProject = await db.Project.update(formData, { where: { id: id }});
      const project = await db.Project.findByPk(id, {
        include: [
          { model: db.User, as: 'Manager', attributes: ['firstName', 'lastName'] },
          { model: db.User, as: 'Sponsor', attributes: ['firstName', 'lastName'] },
        ]
      });
      const successMessageProjUpdate = getSuccessMessage('Project description was updated');
      project.description = DOMPurify.sanitize(marked(project.description));
      res.status(200).render('partial_projectDesc', { project, projectTypes, moment, successMessageProjUpdate } );
    } catch(error) {
      console.error('Error updating project:', error);
      res.status(500).send({ message: 'I tried, but I failed updating a project' }); 
    }
  },
  reloadProjectDesc: async (req, res) => {
    try {
      const id = req.params.id;
      const projectTypes = getProjectTypes();
      const project = await db.Project.findByPk(id, {
        include: [
          { model: db.User, as: 'Manager', attributes: ['firstName', 'lastName'] },
          { model: db.User, as: 'Sponsor', attributes: ['firstName', 'lastName'] },
        ]
      });
      const successMessageProjUpdate = getSuccessMessage('Project description was not changed');
      project.description = DOMPurify.sanitize(marked(project.description));
      res.status(200).render('partial_projectDesc', { project, projectTypes, moment, successMessageProjUpdate } );
    } catch(error) {
      console.error('Error reloading project info:', error);
      res.status(500).send({ message: 'I tried, but I failed reloading project info' }); 
    }
  },
  createProjectFromInitiative: async (req, res) => {
    try {
      const formData = req.body;
      formData.projectStatus = 'open';
      const newProject = await db.Project.create(formData);
      await db.Initiative.update({
          status: 'closed',
          project_link: newProject.id
        }, 
        { where: { id: req.params.id } });
      res.status(201).redirect('/pmo');
    } catch(error) {
      console.error('Error creating project:', error);
      res.status(500).send({ message: 'I tried, but I failed creating a project' }); 
    }
  },
  addAttachSetup: async (req, res) => {
    try {
      const items = await db.AttachmentSetup.findAll();
      res.render('projectSetup', { title: 'Attachment Setup', items, user: req.session.user });
    } catch(error) {
      console.error('Error displaying attachment setup:', error);
      res.status(500).send({ message: 'I tried, but I failed displaying attachment setup' }); 
    }
  },
  createAttachSetup: async (req, res) => {
    try {
      const formData = req.body;
      if (req.file) {
        formData.fileName = req.file.path;
      }
      
      for (const key of ['forProjects', 'forPrograms', 'forPortfolios']) {
        formData[key] = formData[key] === 'on';
      }
      const newRow = await db.AttachmentSetup.create(formData);
      res.render('partial_addProjectSetup', { newRow });
      // res.status(201).redirect('/pmo/add_attach_setup');
    } catch(error) {
      console.error('Error creating attachment setup:', error);
      res.status(500).send({ message: 'I tried, but I failed creating an attachment setup' }); 
    }
  },
  deleteAttachSetup: async (req, res) => {
    try {
      const id = req.params.id;
      // find the filename and delete the file
      const item = await db.AttachmentSetup.findByPk(id);
      if (item.fileName) {
        fs.unlink(item.fileName, (err => {
          if (err) console.log(err); }));
      }
      await db.AttachmentSetup.destroy({ where: { id: id } });
      res.status(200).send();
    } catch(error) {
      console.error('Error deleting attachment setup:', error);
      res.status(500).send({ message: 'Error deleting Project Setup row', error: error.message });
    }
  },
  projectDetailed: async (req, res) => {
    try {
      const id = req.params.id;
      const status_count = await db.Status.count({ where: { project: id } });
      const calculateAverageRisk = async (id) => {
        const averageRisk = await db.Issue.findOne({
          where: {
            projectId: projectId,
            status: 'open',
            type: 'risk',
          },
          attributes: [ [ fn('AVG', fn('*', col('risk_impact'), col('risk_probability'))), 'avgRisk' ] ]
        });
        return averageRisk;
      };
      const project = await db.Project.findByPk(id, {
        include: [
          { model: db.User, as: 'Manager', attributes: ['firstName', 'lastName'] },
          { model: db.User, as: 'Sponsor', attributes: ['firstName', 'lastName'] },
          { 
            model: db.Issue, 
            required: false, 
            as: 'Issues', 
            attributes: ['id', 'name', 'type', 'date_raised', 'status', 'priority', 'severity', 'risk_probability', 'risk_impact', 'owner'], 
            include: [
              { model: db.User, as: 'Owner', required: false, attributes: ['firstName', 'lastName'] },
            ]},
          {
            model: db.Attachment,
            as: 'project_docs',
            required: false,
            where: {
              source_type: 'project_docs',
              source_id: id
            }
          },
          {
            model: db.Attachment,
            as: 'project_result',
            required: false,
            where: {
              source_type: 'project_result',
              source_id: id
            }
          },
          { model: db.Comment,
            as: 'comment',
            required: false,
            where: 
            { 
              source_type: 'project', 
              source_id: id 
            },
            include: [ {
              model: db.User,
              as: 'CommentAuthor',
              attributes: ['firstName', 'lastName'],
              required: false
            }]
          },
          {
            model: db.Status,
            as: 'statuses',
            required: false,
            limit: 5,
            order: [['date', 'DESC']],
            include: [
              { 
                model: db.User, 
                as: 'status_author', 
                required: false, 
                attributes: ['firstName', 'lastName'],
              }
            ],
          },
        ],
      });
      if(project.projectType === 'program'){
        const projectBrief = await db.Project.findOne({
          include: [
            {
              model: db.Project,
              as: 'programProjects',
              required: false,
              attributes: [
                [fn('MIN', col('programProjects.startDate')), 'mStartDate'],
                [fn('MAX', col('programProjects.endDate')), 'mEndDate'],
              ],
  //            where: { projectType: 'project', link_source: 'program', link_id: id }, 
            }
          ],
          where: {id: id}
        })
        if (projectBrief && projectBrief.programProjects && projectBrief.programProjects.length > 0) {
          project.startDate = projectBrief.programProjects[0].dataValues.mStartDate;
          project.endDate = projectBrief.programProjects[0].dataValues.mEndDate;
        } 
      }
      async function getAvgRisk(projectId) {
        const project = await db.Project.findOne({
          where: { id: projectId },
          include: [
            {
              model: db.Issue,
              required: false,
              as: 'Issues',
              where: {
                type: 'risk',
                status: { [Op.not]: 'closed' }
              },
              //attributes: [],
            }
          ],
          attributes: [ [ fn('AVG', literal('Issues.risk_probability * Issues.risk_impact')), 'avgRisk' ] ],
          group: ['Project.id']
          });
          return project.dataValues.avgRisk;
      };
      project.avgRisk = await getAvgRisk(id);

      const projectTypes = getProjectTypes();
      const users = await db.User.findAll({
        attributes: ['id', 'firstName', 'lastName'],
      });
      const initiative = await db.Initiative.findOne({ where: { project_link: id }, attributes: ['name', 'id'] });
      let templates;
      templates = await db.AttachmentSetup.findAll({ where: { forProjects: true } }); switch(project?.projectType) { 
        case 'project': templates = await db.AttachmentSetup.findAll({ where: { forProjects: true } }); 
          break
        case 'task':
          templates = '';
          break
        case 'program':
          templates = await db.AttachmentSetup.findAll({ where: { forPrograms: true } });
          break
      }
      project.description = DOMPurify.sanitize(marked(project.description));
      res.render('projectDetails', { project, templates, initiative, users, user: req.session.user, projectTypes, moment, status_count, messages: req.flash() });
    } catch(error) {
      console.error('Error displaying project details:', error);
      res.status(500).send({ message: 'I tried, but I failed displaying project details' });
    }
  },
  changeProjectStatus: async (req, res) => {
    try {
      const id = req.params.id;
      const project = await db.Project.findByPk(id);
      const newStatus = project.projectStatus === 'open' ? 'closed' : 'open';
      await db.Project.update({ projectStatus: newStatus }, { where: { id: id } });
      const projectUpdated = {
        projectStatus: newStatus,
        id: id
      }
      res.render('partial_projectStatus', { project: projectUpdated });
    } catch(error) {
      console.error('Error changing project status:', error);
      res.status(500).send({ message: 'I tried, but I failed changing project status' }); 
    }
  },
  showProjectStatus: async (req, res) => {
    try {
      const project = await db.Project.findByPk(req.params.id, {attributes: ['projectStatus', 'id'] });
      res.render('partial_projectStatus', { project });
    } catch(error) {
      console.error('Error showing project status:', error);
      res.status(500).send({ message: 'I tried, but I failed showing project status' }); 
    }
  },
  initiativesList: async (req, res) => {
    try {
      let initiatives = await db.Initiative.findAll({
        include: [
          { model: db.User, as: 'initiator', attributes: ['firstName', 'lastName'] },
          { model: db.Project, as: 'project', attributes: ['name'], required: false }
        ],
      });
      const status = req.query.status;
      if (status === 'closed' || status === 'open') {
        initiatives = initiatives.filter(initiative => initiative.status === status);
      }
      res.render('initiatives', { title: 'List of Initiatives', initiatives, status, user: req.session.user });
    } catch(error) {
      console.error('Error listing initiatives:', error);
      res.status(500).send({ message: 'I tried, but I failed listing initiatives' }); 
    }
  },
  addInitiative: async (req, res) => {
    try {
      const users = await db.User.findAll({
        attributes: ['id', 'firstName', 'lastName'],
      });
      res.render('addInitiative', { title: 'Add initiative', users, user: req.session.user });
    } catch(error) {
      console.error('Error listing initiatives:', error);
      res.status(500).send({ message: 'I tried, but I failed listing initiatives' }); 
    }
  },
  createInitiative: async (req, res) => {
    try {
      const formData = req.body;
      formData.status = 'open';
      formData.projectLink = '';
      const newInitiative = await db.Initiative.create(formData);
      res.status(201).redirect('/pmo/initiatives');
    } catch(error) {
      console.error('Error creating initiative:', error);
      res.status(500).send({ message: 'I tried, but I failed creating an initiative' }); 
    }
  },
  deleteInitiative: async (req, res) => {
    try {
      const delInitiative = await db.Initiative.destroy({ where: { id: req.params.id } });
      res.status(200).send();
    } catch(error) {
      console.error('Error deleting initiative:', error);
      res.status(500).send({ message: 'I tried, but I failed deleting an initiative'});
    }
  },
  initiativeDetailed: async (req, res) => {
    try {
      const initiative = await db.Initiative.findByPk(req.params.id, {
        include: [ 
          { model: db.User, as: 'initiator', attributes: ['firstName', 'lastName'] },
          { model: db.Project, as: 'project', attributes: ['name'] },
          { model: db.Comment, as: 'comment', include: [ {
            model: db.User,
            as: 'CommentAuthor',
            attributes: ['firstName', 'lastName'],
            required: false
          } ],
          order: [['date', 'ASC']],
          required: false,
          where: { source_type: 'initiative', source_id: req.params.id },
          },
          {
            model: db.Attachment,
            as: 'attachments',
            required: false,
            where: {
              source_type: 'initiative',
              source_id: req.params.id
            }}
        ]
      });
      initiative.full_desc = DOMPurify.sanitize(marked(initiative.full_desc));
      res.render('initiativeDetails', { title: 'Initiative Details', initiative, user: req.session.user, moment });
    } catch(error) {
      console.error('Error displaying details of initiative:', error);
      res.status(500).send({ message: 'I tried, but I failed displaying details of initiative'});
    }
  },
  initiativeEdit: async (req, res) => {
    try {
      const initiative = await db.Initiative.findByPk(req.params.id);
      const users = await db.User.findAll({
        attributes: ['id', 'firstName', 'lastName'],
      });
      res.render('editInitiative', { title: 'Edit Initiative', initiative, users, user: req.session.user });
    } catch(error) {
      console.error('Error editing initiative:', error);
      res.status(500).send({ message: 'I tried, but I failed editing an initiative'});
    }
  },
  initiativeUpdate: async (req, res) => {
    try {
      const id = req.params.id;
      const formData = req.body;
      await db.Initiative.update({
        name: formData.name,
        author: formData.author,
        brief_desc: formData.brief_desc,
        full_desc: formData.full_desc,
        }, 
        { where: { id: id } });
      res.redirect('/pmo/initiative/' + id);
    } catch(error) {
      console.error('Error displaying details of initiative:', error);
      res.status(500).send({ message: 'I tried, but I failed displaying details of initiative'});
    }
  },
  changeInitiativeStatus: async (req, res) => {
    try {
      const id = req.params.id;
      const initiative = await db.Initiative.findByPk(id);
      const newStatus = initiative.status === 'open' ? 'closed' : 'open';
      await db.Initiative.update({ status: newStatus }, { where: { id: id } });
      res.redirect('/pmo/initiatives');
    } catch(error) {
      console.error('Error changing initiative status:', error);
      res.status(500).send({ message: 'I tried, but I failed '});
    } },
  addAttachment: async (req, res) => {
    try {
      const formData = req.body;
      if (req.file) {
        formData.link = req.file.path;
        formData.source_type = req.query.type;
        formData.source_id = req.params.id;
        const newRow = await db.Attachment.create(formData);
      }
      const attachments = await db.Attachment.findAll({
        as: formData.source_type,
        where: {
          source_type: formData.source_type,
          source_id: formData.source_id
        }
      });
      const itemType = `attach-${formData.source_type}`;
      const successMessageAttach = getSuccessMessage('Attachment was added');
      res.status(200).render('partial_attachmentList', { attachments, itemType, successMessageAttach } );
    } catch(error) {
      console.error('Error adding attachment:', error);
      res.status(500).send({ message: 'I tried, but I failed adding an attachment' }); 
    }
  },
  deleteAttachment: async (req, res) => {
    try {
      const id = req.params.id;
      const attach = await db.Attachment.findByPk(id);
      fs.unlink(attach.link, (err => {
        if (err) console.log(err); }));
      await db.Attachment.destroy({ where: { id: id } });
      res.status(200).send();
    } catch(error) {
      console.error('Error deleting attachment:', error);
      res.status(500).send({ message: 'Error deleting attachment', error: error.message });
    }
  },
  addComment: async (req, res) => {
    try {
      const formData = req.body;
      formData.author = req.session.user.id;
      formData.date = new Date().toISOString();
      formData.source_type = req.query.from;
      formData.source_id = req.params.id;
      const newComment = await db.Comment.create(formData);
      const issue = await db.Comment.findByPk(newComment.id, {
        include: [
          {
            model: db.User,
            as: 'CommentAuthor',
            attributes: ['firstName', 'lastName']
          }
        ],
      }); 
      req.flash('success', 'Comment was added');
      res.render('partial_addComment', { issue, messages: req.flash(), moment });
    } catch(error) {
      console.error('Error adding comment:', error);
      res.status(500).send({ message: 'Error adding comment' });
    }
  },
  removeComment: async (req, res) => {
    try {
      await db.Comment.destroy({ where: { id: req.params.id } });
      req.flash('success', 'Comment was removed');
      res.status(200).send();
    } catch(error) {
      console.error('Error removing comment:', error);
      res.status(500).send({ message: 'Error removing comment' });
    }
  },
  createIssue: async (req, res) => {
    try {
      const formData = req.body;
      formData.status = 'requested'; // for all new issues
      const formDetails = { issueType: req.query.type };
      if (req.query.type !== 'issue') {
        formData.type = req.query.type; // for issue it's in the form already
      } 
      formData.author = req.session.user.id;
      formData.project = req.params.id;

      const newIssue = await db.Issue.create(formData);
      const issues = await db.Issue.findAll({
        where: {project: req.params.id}, 
        include: [
          { model: db.User, as: 'Owner', required: false, attributes: ['firstName', 'lastName'] },
        ]});
      const project = {
            id: req.params.id, 
            Issues: issues
      };
      const successMessageIssue = getSuccessMessage('Issue was added');
      res.status(200).render('partial_issueTable', { project, formDetails, moment, successMessageIssue } );
    } catch(error) {
      console.error('Error creating issue:', error);
      res.status(500).send({ message: 'I tried, but I failed creating an issue' }); 
    }
  },
  deleteIssue: async (req, res) => {
    try {
    const delIssue = await db.Issue.destroy({ where: { id: req.params.id } });
    res.status(200).send();
    } catch(error) {
      console.error('Error deleting an issue:', error);
      res.status(500).send({ message: 'I tried, but I failed deleting an issue' }); 
    }
  },
  changeIssueStatus: async (req, res) => { 
    try {
      const id = req.params.id;
      const issue = await db.Issue.findByPk(id);
      const statusTransitions = {
        requested: { forward: 'approved' },
        approved: { forward: 'closed', back: 'requested' },
        closed: { back: 'approved' }
      };
      const newStatus = statusTransitions[issue.status]?.[req.query.direction];
      if (!newStatus) {
        throw new Error('Invalid status transition');
      }
      await db.Issue.update({ status: newStatus }, { where: { id } });
      const updatedIssue = await db.Issue.findByPk(id);
      let formDetails;
      if (updatedIssue.type === 'concern' || updatedIssue.type === 'off-specification') {
        formDetails = { issueType: 'issue' };
      }
      else {
        formDetails = { issueType: updatedIssue.type };
      }
      res.render('partial_issueTableRows', { issue: updatedIssue, formDetails, moment });
    } catch(error) {
      console.error('Error changing issue status:', error);
      res.status(500).send({ message: 'I tried, but I failed changing issue status' }); 
    }
  },
  issueEdit: async (req, res) => {
    try {
      const issue = await db.Issue.findByPk(req.params.id);
      const users = await db.User.findAll({
        attributes: ['id', 'firstName', 'lastName'],
      });
      res.render('editIssue', { title: 'Edit Issue', issue, users, moment });
    } catch(error) {
      console.error('Error changing issue:', error);
      res.status(500).send({ message: 'I tried, but I failed changing issue' }); 
    }
  },
  issueUpdate: async (req, res) => {
    try {
      const id = req.params.id;
      const issue = await db.Issue.findByPk(id);
      const formData = req.body;
      const updateData = {};
      updateData.name = formData.name;
      updateData.date_raised = formData.date_raised;
      updateData.author = formData.author;
      updateData.type = formData.type;
      updateData.description = formData.description;
      if (issue.type !== 'risk') {
        updateData.priority = formData.priority;
        updateData.severity = formData.severity;
      }
      else {
        updateData.risk_probability = formData.risk_probability;
        updateData.risk_impact = formData.risk_impact;
      }

      await issue.update(updateData);
      res.redirect('/pmo/project/' + issue.project);
    } catch(error) {
      console.error('Error updating an issue:', error);
      res.status(500).send({ message: 'I tried, but I failed updating an issue' }); 
    }
  },
  issueDetailed: async (req, res) => {
    try {
      const issue = await db.Issue.findByPk(req.params.id, {
        include: [ 
          { model: db.User, as: 'Author', attributes: ['firstName', 'lastName'] },
          { model: db.User, as: 'Owner', required: false, attributes: ['firstName', 'lastName'] },
          { model: db.Project, as: 'Project', attributes: ['id', 'name'] },
          {
            model: db.Attachment,
            as: 'Attachments',
            required: false,
            where: {
              source_type: 'issue',
              source_id: req.params.id
            }
          },
          { model: db.Comment, as: 'comment', include: [ {
              model: db.User,
              as: 'CommentAuthor',
              attributes: ['firstName', 'lastName'],
              required: false
              } ],
            required: false,
            where: {
              source_type: 'issue',
              source_id: req.params.id
            }
          }
        ]
      });
      issue.description = DOMPurify.sanitize(marked(issue.description));
      res.render('issueDetails', { title: 'Issue Details', issue, user: req.session.user, moment });
    } catch(error) {
      console.error('Error displaying issue details:', error);
      res.status(500).send({ message: 'I tried, but I failed displaying issue details' }); 
    }
  },
  riskOwnerEdit: async (req, res) => {
    try {
      const users = await db.User.findAll({
        attributes: ['id', 'firstName', 'lastName'],
      });
      const issue = await db.Issue.findByPk(req.params.id);
      res.render('partial_editRiskOwner', { users, issue });
    } catch(error) {
      console.error('Error editing risk owner:', error);
      res.status(500).send({ message: 'I tried, but I failed editing risk owner' }); 
    }
  },
  riskOwnerUpdate: async (req, res) => {
    try {
      const users = await db.User.findAll({
        attributes: ['id', 'firstName', 'lastName'],
      });
      const issueUpdated = await db.Issue.update({
        owner: req.body.owner,
        }, 
        { where: { id: req.params.id } }
      );
      const issue = await db.Issue.findByPk(req.params.id, {
        include: [
          { model: db.User, as: 'Owner', required: false, attributes: ['firstName', 'lastName'] },
        ]
      });
      res.render('partial_riskOwner', { issue });
    } catch(error) {
      console.error('Error updating risk owner:', error);
      res.status(500).send({ message: 'I tried, but I failed updating risk owner' }); 
    }
  },
  riskOwnerView: async (req, res) => {
    try {
      const issue = await db.Issue.findByPk(req.params.id, {
        include: [
          { model: db.User, as: 'Owner', required: false, attributes: ['firstName', 'lastName'] },
        ]
      });
      res.render('partial_riskOwner', { issue });
    } catch(error) {
      console.error('Error editing risk owner:', error);
      res.status(500).send({ message: 'I tried, but I failed editing risk owner' }); 
    }
  },
  createStatus: async (req, res) => {
    try {
      const id = req.params.id;
      const formData = req.body;
      formData.project = id;
      const newStatus = await db.Status.create(formData);
      const statuses = await db.Status.findAll({ 
        where: {project: id}, 
        limit: 5,
        order: [['date', 'DESC']],
        include: [
          { 
            model: db.User, 
            as: 'status_author', 
            required: false, 
            attributes: ['firstName', 'lastName'],
          }
        ],});
      const project = {
            id: id,
            statuses: statuses
      };
      const successMessageStatus = getSuccessMessage('Status was added');
      res.status(200).render('partial_statusList', { project, moment, successMessageStatus } );
    } catch(error) {
      console.error('Error creating status:', error);
      res.status(500).send({ message: 'I tried, but I failed creating a status' }); 
    }
  },
  deleteStatus: async (req, res) => {
    try {
      const delStatus = await db.Status.destroy({ where: { id: req.params.id } });
      res.status(200).send();
    } catch(error) {
      console.error('Error deleting status:', error);
      res.status(500).send({ message: 'I tried, but I failed deleting a status' });
    }
  },
  statusDetailed: async (req, res) => {
    try {
      const id = req.params.id;
      const projectTypes = getProjectTypes();
      const status = await db.Status.findByPk(id, {
        include: [ 
          { model: db.User, as: 'status_author', attributes: ['firstName', 'lastName'] },
          { model: db.Project, as: 'project_status', attributes: ['name', 'projectType', 'id'] },
          {
            model: db.Attachment,
            as: 'statusAttach',
            required: false,
            where: {
              source_type: 'status',
              source_id: id
            }
          },
          { model: db.Comment,
            as: 'comment',
            required: false,
            where: { source_type: 'status', source_id: id },
            include: [{
              model: db.User,
              as: 'CommentAuthor',
              attributes: ['firstName', 'lastName'],
              required: false
            }]
          },
          { model: db.MailingList,
            as: 'statusML',
            required: false,
            where: { status: id },
            include: [{
              model: db.User,
              as: 'statusParticipant',
              attributes: ['firstName', 'lastName'],
              required: false
            }]
          }
        ]
      });
      const allUsers = await db.User.findAll({ attributes: ['id', 'firstName', 'lastName'] });
      status.message = DOMPurify.sanitize(marked(status.message));
      res.render('statusDetailed', { status, user: req.session.user, moment, projectTypes, allUsers });
    } catch(error) {
      console.error('Error displaying detailed status:', error);
      res.status(500).send({ message: 'I tried, but I failed displaying detailed status' }); 
    }
  },
  statusEdit: async (req, res) => {
    try {
      const status = await db.Status.findByPk(req.params.id);
      const users = await db.User.findAll({
        attributes: ['id', 'firstName', 'lastName'],
      });
      res.render('editStatus', { title: 'Edit status', status, users, moment });
    } catch(error) {
      console.error('Error editing status:', error);
      res.status(500).send({ message: 'I tried, but I failed editing status' }); 
    }
  },
  statusUpdate: async (req, res) => {
    try {
      const id = req.params.id;
      const formData = req.body;
      await db.Status.update({
        date: formData.date,
        author: formData.author,
        mesage: formData.message,
        status: formData.status,
        }, 
        { where: { id: id } });
      res.redirect('/pmo/status/' + id);
    } catch(error) {
      console.error('Error editing updating status:', error);
      res.status(500).send({ message: 'I tried, but I failed updating status' }); 
    }
  },
  loadAllStatuses: async (req, res) => {
    try {
      const statuses = await db.Status.findAll(
        {
          where: {project: req.params.id},
          include: [{
            model: db.User,
            as: 'status_author',
            attributes: ['firstName', 'lastName'],
            required: false
          }],
          offset: 5
        }
      );
      res.render('partial_viewStatuses', { statuses, moment });
    } catch(error) {
      console.error('Error loading all statuses:', error);
      res.status(500).send({ message: 'I tried, but I failed loading all statuses' }); 
    }
  },
  searchMaillist: async (req, res) => {
    try {
      const users = await db.User.findAll({ attributes: ['id', 'firstName', 'lastName'] });
      const searchTerm = (req.query.q || '').toString();
      let employees = [];
      if(searchTerm !== '') {
        employees = users.filter(user => 
          user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.lastName.toLowerCase().includes(searchTerm.toLowerCase())
        );
      } else { 
        employees = users;
      }
      res.send(employees.map(employee => `<option value="${employee.id}">${employee.firstName} ${employee.lastName}</option>`).join(''));
    } catch(error) {
      console.error('Error searching mailing list:', error);
      res.status(500).send({ message: 'I tried, but I failed searching mailing list' }); 
    }
  },
  addMaillist: async (req, res) => {
    try {
      const id = req.params.id;
      const selectedItems = req.body.selectedItems;
      const itemsToAdd = Array.isArray(selectedItems) ? selectedItems : [selectedItems];
      const results = await Promise.all(itemsToAdd.map(async (user) => {
        return await db.MailingList.create({
          user: user,
          status: id
        });
      }));
      res.redirect('/pmo/status/' + id);
    } catch(error) {
      console.error('Error adding employees to a maillist:', error);
      res.status(500).send({ message: 'I tried, but I failed adding employees to a maillist' }); 
    }
  },
  deleteMailList: async (req, res) => {
    try {
      const delML = await db.MailingList.destroy({ where: { id: req.params.id } });
      res.status(200).send();
    } catch(error) {
      console.error('Error deleting mailing list:', error);
      res.status(500).send({ message: 'I tried, but I failed deleting mailing list' }); 
    }
  },
  portfolioList: async (req, res) => {
    try {
      const portfolios = await db.Portfolio.findAll({
        include: [
          { model: db.User, as: 'portfolioOwner', attributes: ['firstName', 'lastName'] },
          { model: db.User, as: 'portfolioSponsor', attributes: ['firstName', 'lastName'] },
        ],
        order: [['year', 'DESC']],
      });
      const users = await db.User.findAll({ attributes: ['id', 'firstName', 'lastName'] });
      res.render('portfolios', { title: 'Portfolios', portfolios, users, user: req.session.user });
    } catch(error) {
      console.error('Error listing portfolios:', error);
      res.status(500).send({ message: 'I tried, but I failed listing portfolios' }); 
    }
  },
  createPortfolio: async (req, res) => {
    try {
      const formData = req.body;
      const newPortfolio = await db.Portfolio.create(formData);
      res.status(201).redirect('/pmo/portfolios');
    } catch(error) {
      console.error('Error creating portfolio:', error);
      res.status(500).send({ message: 'I tried, but I failed creating a portfolio' }); 
    }
  },
  portfolioDetails: async (req, res) => {
    try {
      const portfolio = await db.Portfolio.findByPk(req.params.id, {
        include: [
          { model: db.User, as: 'portfolioOwner', attributes: ['firstName', 'lastName'] },
          { model: db.User, as: 'portfolioSponsor', attributes: ['firstName', 'lastName'] },
          {
            model: db.Attachment,
            as: 'portfolioAttach',
            required: false,
            where: {
              source_type: 'portfolio',
              source_id: req.params.id
            }}
        ]
      });
      res.render('portfolioDetails', { title: 'Portfolio Details', portfolio });
    } catch(error) {
      console.error('Error displaying portfolio details:', error);
      res.status(500).send({ message: 'I tried, but I failed displaying portfolio details' }); 
    }
  },
  portfolioEdit: async (req, res) => {
    try {
      const portfolio = await db.Portfolio.findByPk(req.params.id);
      const users = await db.User.findAll({
        attributes: ['id', 'firstName', 'lastName'],
      });
      res.render('editPortfolio', { title: 'Edit portfolio', portfolio, users });
    } catch(error) {
      console.error('Error editing portfolio:', error);
      res.status(500).send({ message: 'I tried, but I failed editing portfolio' }); 
    }
  },
  portfolioUpdate: async (req, res) => {
    try {
      const id = req.params.id;
      const formData = req.body;
      await db.Portfolio.update({
        owner: formData.owner,
        sponsor: formData.sponsor,
        year: formData.year
        }, 
        { where: { id: id } });
      res.redirect('/pmo/portfolio/' + id);
    } catch(error) {
      console.error('Error editing updating portfolio:', error);
      res.status(500).send({ message: 'I tried, but I failed updating portfolio' }); 
    }
  },
  deletePortfolio: async (req, res) => {
    try {
      const delP = await db.Portfolio.destroy({ where: { id: req.params.id } });
      res.status(200).send();
    } catch(error) {
      console.error('Error deleting portfolio:', error);
      res.status(500).send({ message: 'I tried, but I failed deleting portfolio' }); 
    }
  },
  portfolioProgramList: async (req, res) => {
    try {
      const link_source = req.query.link_source;
      if(link_source === 'portfolio') {
        const issues = await db.Portfolio.findAll({ attributes: ['id', 'year'], order: [['year', 'ASC']]});
        const options = issues.map(issue => {
          return `<option value="${issue.id}">${issue.year}</option>`;
        }).join('');
        res.send(options);
      } else if(link_source === 'program') {
        const issues = await db.Project.findAll( { attributes: ['id', 'name'], where: {projectType: 'program', projectStatus: 'open'} });
        const options = issues.map(issue => {
          return `<option value="${issue.id}">${issue.name}</option>`;
        }).join('');
        res.send(options);
      } else {
        throw 'Wrong source type';
        res.status(500).send({ message: 'Error selecting the source', error: error.message });
      }
    } catch(error) {
      console.error('Error editing listing programs from portfolio:', error);
      res.status(500).send({ message: 'I tried, but I failed listing programs from portfolio' });
    }
  },
  assignProjectLink: async (req, res) => {
    try {
      const formData = req.body;
      await db.Project.update({
        link_source: formData.link_source,
        link_id: formData.link_id
        }, 
        { where: { id: formData.project_id } });
      res.redirect('/pmo?status=open');
    } catch(error) {
      console.error('Error assigning a link to a project:', error);
      res.status(500).send({ message: 'I tried, but I failed assigning a link to a project' }); 
    }
  },
}
