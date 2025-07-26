const { Model, QueryBuilder } = require('objection');
const moment = require('moment');

function getSQLDateTime() {
    return moment().format('YYYY-MM-DD HH:mm:ss');
}

class CustomQueryBuilder extends QueryBuilder {
    delete() {
        return this.patch({ deleted_at: getSQLDateTime() });
    }

    hardDelete() {
        return super.delete();
    }

    whereNotDeleted() {
        return this.whereNull('deleted_at');
    }

    withDeleted() {
        this.context({ includeDeleted: true });
        return this;
    }

    execute() {
        if (!this.context().includeDeleted) {
            const tableRef = this.modelClass().tableName;
            this.whereNull(`${tableRef}.deleted_at`);
        }
        return super.execute();
    }
}

class BaseModel extends Model {
    static get QueryBuilder() {
        return CustomQueryBuilder;
    }

    async $beforeInsert() {
        const now = getSQLDateTime();
        this.created_at = now;
        this.updated_at = now;
        this.deleted_at = null;
    }

    async $beforeUpdate() {
        this.updated_at = getSQLDateTime();
    }

    async restore() {
        await this.$query().patch({ deleted_at: null });
    }

    static get jsonSchema() {
        return {
            type: 'object',
            properties: {
                created_at: { type: 'string', format: 'date-time' },
                updated_at: { type: 'string', format: 'date-time' },
                deleted_at: { type: ['string', 'null'], format: 'date-time' },
            },
        };
    }
}

module.exports = { BaseModel, CustomQueryBuilder };
