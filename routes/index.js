'use strict';
const express = require('express');
const router = express.Router();
const projectController = require('../controllers/pmo');
const indexController = require('../controllers/index');
const employeeController = require('../controllers/employee');
const marked = require('marked');

// Mutler config 
const multer = require('multer');
const MulterStorageConfig = require('../config/MulterStorageConfig');
const uploadTemplateStorage = new MulterStorageConfig().getStorage();
const uploadDocStorage = new MulterStorageConfig('uploads/docs').getStorage();
const uploadTemplate = multer({ storage: uploadTemplateStorage });
const uploadDoc = multer({ storage: uploadDocStorage });

// Homepage
router.get('/', indexController.homePage);

// PMO
// projects
router.get('/pmo', projectController.projectsList);
router.get('/pmo/add_project', projectController.addProject);
router.post('/pmo/add_project', projectController.createProject);
router.get('/pmo/project/:id', projectController.projectDetailed);
router.get('/pmo/add_project/:id', projectController.addProjectFromInitiative);
router.post('/pmo/add_project/:id', projectController.createProjectFromInitiative);
router.put('/pmo/project/:id/change_status', projectController.changeProjectStatus);
router.get('/pmo/project/:id/change_status', projectController.showProjectStatus);
router.get('/pmo/project/:id/update_desc', projectController.changeProjectDesc);
router.put('/pmo/project/:id/update_desc', projectController.updateProjectDesc);
router.get('/pmo/project/:id/reload_desc', projectController.reloadProjectDesc);
router.get('/pmo/program_list', projectController.portfolioProgramList);
router.post('/pmo', projectController.assignProjectLink);

// portfolios
router.get('/pmo/portfolios', projectController.portfolioList);
router.post('/pmo/portfolios', projectController.createPortfolio);
router.get('/pmo/portfolio/:id', projectController.portfolioDetails);
router.get('/pmo/portfolio/:id/edit', projectController.portfolioEdit);
router.post('/pmo/portfolio/:id/edit', projectController.portfolioUpdate);
router.delete('/pmo/portfolio/:id', projectController.deletePortfolio);

// issues, issue creation form is in projectDetailed
router.get('/pmo/issue/:id', projectController.issueDetailed);
router.post('/pmo/project/:id/add_issue', projectController.createIssue);
router.delete('/pmo/issue/:id', projectController.deleteIssue);
router.put('/pmo/issue/:id/change_status', projectController.changeIssueStatus);
router.get('/pmo/issue/:id/edit', projectController.issueEdit);
router.post('/pmo/issue/:id/edit', projectController.issueUpdate);
router.get('/pmo/risk_owner/:id', projectController.riskOwnerView);
router.get('/pmo/risk_owner/:id/edit', projectController.riskOwnerEdit);
router.put('/pmo/risk_owner/:id/edit', projectController.riskOwnerUpdate);

// statuses
router.post('/pmo/project/:id/add_status', projectController.createStatus);
router.delete('/pmo/status/:id', projectController.deleteStatus);
router.get('/pmo/status/:id', projectController.statusDetailed);
router.get('/pmo/status/:id/edit', projectController.statusEdit);
router.post('/pmo/status/:id/edit', projectController.statusUpdate);
router.get('/pmo/project/:id/load', projectController.loadAllStatuses);
router.get('/pmo/employee/search', projectController.searchMaillist);
router.post('/pmo/status/:id/add_maillist', projectController.addMaillist);
router.delete('/pmo/mailinglist/:id', projectController.deleteMailList);

// initiatives
router.get('/pmo/initiatives', projectController.initiativesList);
router.get('/pmo/add_initiative', projectController.addInitiative);
router.post('/pmo/add_initiative', projectController.createInitiative);
router.get('/pmo/initiative/:id', projectController.initiativeDetailed);
router.get('/pmo/initiative/:id/edit', projectController.initiativeEdit);
router.post('/pmo/initiative/:id/edit', projectController.initiativeUpdate);
router.delete('/pmo/initiative/:id', projectController.deleteInitiative);
router.get('/pmo/initiative/:id/change_status', projectController.changeInitiativeStatus);

// attachments
router.post('/pmo/:id/add_attachment', uploadDoc.single('file'), projectController.addAttachment);
router.delete('/pmo/:id/delete_attach', projectController.deleteAttachment);

// comments
router.post('/pmo/:id/add_comment', projectController.addComment);
router.delete('/pmo/:id/remove_comment', projectController.removeComment);

// PMO setup
router.get('/pmo/add_attach_setup', projectController.addAttachSetup);
router.post('/pmo/add_attach_setup', uploadTemplate.single('file'), projectController.createAttachSetup);
router.delete('/pmo/attach_setup/:id', projectController.deleteAttachSetup);

// Employees
router.get('/employee', employeeController.employeeList);
router.get('/employee/add_employee', employeeController.addEmployee);
router.post('/employee/add_employee', employeeController.createEmployee);
router.delete('/employee/:id', employeeController.deleteEmployee);

module.exports = router;
