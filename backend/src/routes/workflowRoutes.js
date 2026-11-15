const express = require('express');
const router = express.Router();
const {
  createWorkflow,
  getAllWorkflows,
  getWorkflowById,
  updateWorkflow,
  deleteWorkflow,
} = require('../controllers/workflowController');

router.get('/', getAllWorkflows);
router.post('/', createWorkflow);
router.get('/:id', getWorkflowById);
router.put('/:id', updateWorkflow);
router.delete('/:id', deleteWorkflow);

module.exports = router;
