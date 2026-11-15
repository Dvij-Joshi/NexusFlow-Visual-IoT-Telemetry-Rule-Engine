const Workflow = require('../models/Workflow');
const streamCompiler = require('../compiler/streamCompiler');

/**
 * Create a new visual workflow and compile its pipeline
 */
const createWorkflow = async (req, res) => {
  try {
    const { name, description, nodes, edges, isActive = true } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Workflow name is required' });
    }

    const workflow = await Workflow.create({
      name,
      description,
      nodes: nodes || [],
      edges: edges || [],
      isActive,
    });

    if (workflow.isActive && workflow.nodes.length > 0) {
      streamCompiler.compileWorkflow(workflow);
    }

    return res.status(201).json({
      success: true,
      message: 'Workflow created and compiled successfully',
      data: workflow,
    });
  } catch (error) {
    console.error('[WorkflowController] Create Error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Get all workflows
 */
const getAllWorkflows = async (req, res) => {
  try {
    const workflows = await Workflow.find().sort({ updatedAt: -1 });
    return res.status(200).json({
      success: true,
      count: workflows.length,
      data: workflows,
    });
  } catch (error) {
    console.error('[WorkflowController] Get All Error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Get single workflow by ID
 */
const getWorkflowById = async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    return res.status(200).json({
      success: true,
      data: workflow,
    });
  } catch (error) {
    console.error('[WorkflowController] Get By ID Error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Update an existing workflow and recompile
 */
const updateWorkflow = async (req, res) => {
  try {
    const { name, description, nodes, edges, isActive } = req.body;

    const workflow = await Workflow.findByIdAndUpdate(
      req.params.id,
      { name, description, nodes, edges, isActive },
      { new: true, runValidators: true }
    );

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    if (workflow.isActive) {
      streamCompiler.compileWorkflow(workflow);
    } else {
      streamCompiler.stopWorkflow(workflow._id.toString());
    }

    return res.status(200).json({
      success: true,
      message: 'Workflow updated and recompiled',
      data: workflow,
    });
  } catch (error) {
    console.error('[WorkflowController] Update Error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Delete a workflow
 */
const deleteWorkflow = async (req, res) => {
  try {
    const workflow = await Workflow.findByIdAndDelete(req.params.id);
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    streamCompiler.stopWorkflow(workflow._id.toString());

    return res.status(200).json({
      success: true,
      message: 'Workflow deleted successfully',
    });
  } catch (error) {
    console.error('[WorkflowController] Delete Error:', error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createWorkflow,
  getAllWorkflows,
  getWorkflowById,
  updateWorkflow,
  deleteWorkflow,
};
