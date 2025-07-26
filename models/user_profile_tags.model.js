const { Model } = require('objection');

class UserProfileTag extends Model {
    static get tableName() {
        return 'user_profile_tags';
    }

    static get idColumn() {
        return 'id';
    }

}

module.exports = UserProfileTag;
