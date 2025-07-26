const {BaseModel} = require('./base.model');

class Role extends BaseModel {
    static get tableName() {
        return 'roles';
    }

    static get idColumn() {
        return 'id';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['name'],

            properties: {
                id: { type: 'integer' },
                name: { type: 'string' }
            }
        };
    }

    static get relationMappings() {
        const User = require('./user.model');

        return {
            users: {
                relation: BaseModel.HasManyRelation,
                modelClass: User,
                join: {
                    from: 'roles.id',
                    to: 'users.role_id'
                }
            }
        };
    }
}

module.exports = Role;
