let initialized = false;


function setupAssociations () {
    if(initialized) return;


    const Task = require('../src/modules/task/task.model');
    const User = require('../src/modules/users/user.model');
    // 👤 USER → TASKS (1 a muchos)
    User.hasMany(Task,{foreignKey:'userId',as:'tasks'});
    // 📌 TASK → USER (muchos a 1)
    Task.belongsTo(User, {foreignKey:'userId',as:'user'});

    initialized = true;
};

module.exports = setupAssociations;