const { Model } = require('objection');

class ProfileTag extends Model {
    static get tableName() {
        return 'profile_tags';
    }

    static get idColumn() {
        return 'id';
    }

}

module.exports = ProfileTag;
