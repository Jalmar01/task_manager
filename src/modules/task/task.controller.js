const taskService = require('./task.service');

async function createTask(req, res) {
    try{
        const task = await taskService.createTask({
            title: req.body.title,
            description: req.body.description,
            userId: req.user.id
        });

        res.status(201).json({
            message: 'Task created',
            data: task
        });
    }catch(error){
        res.status(400).json({
            message:error.message
        });
    };
    
};

async function getTasks(req, res) {
    try{
        const tasks = await taskService.getTasks(req.user.id);

         res.status(200).json({
            message: 'Tasks fetched',
            data: tasks
         });

    }catch(error){
        res.status(500).json({
            message: error.message
        });
    };
};

async function getTaskById(req, res) {
    try{
        const task = await taskService.getTaskById(
            req.params.id,
            req.user.id
        );

        res.status(200).json({
            message:'Task fetched',
            data: task
        });

    }catch(error){
        res.status(404).json({
            message: error.message
        });
    };
};

async function updateTask(req, res) {
    try{
        const task = await taskService.updateTask(
            req.params.id,
            req.user.id,
            req.body
        );

        res.status(200).json({
            message:'Task updated',
            data:task
        });

    }catch(error){
        res.status(400).json({
            message: error.message
        });
    };  
};

async function deleteTask(req, res) {
    try{
        const task = await taskService.deleteTask(
            req.params.id,
            req.user.id
        );

        res.status(200).json({
            message:'Task deleted successfully',
        });

    }catch(error){
        res.status(400).json({
            message: error.message
        });
    };
};

module.exports = {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask
};