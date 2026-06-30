const Task = require('./task.model');

async function createTask({ title, description, userId }) {
    const task = await Task.create({
        title,
        description,
        userId
    });
    return task;
}

async function getTasks(userId) {
    return await Task.findAll({
        where: { userId }
    });
}

async function getTaskById(id, userId) {
    const task = await Task.findOne({
        where: { id, userId }
    });
    if (!task) {
        throw new Error('Task not found');
    }

    return task;
}

async function updateTask(id, userId, data) {
    const task = await Task.findOne({
        where: { id, userId }
    });

    if (!task) {
        throw new Error('Task not found');
    }

    const updatedTask = await task.update(data);

    return updatedTask;
}

async function deleteTask(id, userId) {
    const task = await Task.findOne({
        where: { id, userId }
    });

    if (!task) {
        throw new Error('Task not found');
    }

    await task.destroy();

    return true;
}

module.exports = {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask
};
