let initialized = false;


function setupAssociations () {
    if(initialized) return;


    const Task = require('../src/modules/task/task.model');
    const User = require('../src/modules/users/user.model');
    const RefreshToken = require('../src/modules/auth/refresh-token.model');
    // 👤 USER → TASKS (1 a muchos)
    User.hasMany(Task,{foreignKey:'userId',as:'tasks'});
    // 📌 TASK → USER (muchos a 1)
    Task.belongsTo(User, {foreignKey:'userId',as:'user'});
    // 🔄 USER → REFRESH TOKENS (1 a muchos)
    User.hasMany(RefreshToken, { foreignKey: 'userId', onDelete: 'CASCADE' });
    RefreshToken.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });

    initialized = true;
};

module.exports = setupAssociations;