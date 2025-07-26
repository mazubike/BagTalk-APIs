const { BaseModel } = require('./base.model');

class Wallet extends BaseModel {
    static get tableName() {
        return 'wallets';
    }

    static get idColumn() {
        return 'id';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['user_id', 'address', 'wallet_type'],

            properties: {
                id: { type: 'integer' },
                user_id: { type: 'integer' },
                address: { type: 'string' },
                wallet_type: { type: 'string' },
                is_primary: { type: 'boolean' },
                total_assets: { type: 'boolean' },
                risk_analysis: { type: 'boolean' },
                statistics: { type: 'boolean' },
                ai_analysis: { type: 'boolean' },
            }
        };
    }

    static get relationMappings() {
        const User = require('./user.model');

        return {
            user: {
                relation: BaseModel.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: 'wallets.user_id',
                    to: 'users.id'
                }
            }
        };
    }
}

module.exports = Wallet;
