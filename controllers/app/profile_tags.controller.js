const ProfileTag = require('../../models/profile_tags.model')



exports.update = async (req, res, next) => {
    try {
        console.log(req?.body)
        const body = {
            ...req.body,
            added_by: parseInt(req.body.added_by) || null,
            is_active: req.body.is_active === 'true' || req.body.is_active === true
        }
        const { id } = req.params;
        const category = await Category.query().patchAndFetchById(id, body);
        res.json({ category, message: 'Category Updated Successfully!' });
    } catch (error) {
        next(error)
    }
};

exports.remove = async (req, res) => {
    try {
        const { id } = req.params;
        await Category.query().deleteById(id);
        res.json({ message: 'Category Deleted Sucessfully!' });
    } catch (errors) {
        console.log('Errors', errors)
        res.json({ errors: errors.message })
    }
}

exports.getSingle = async (req, res) => {
    try {
        const category = await Category.query()
            .findById(req.params.id);
        if (!category) {
            return res.status(422).json({ message: 'Not Found!' });
        }

        res.json({ category, message: 'Category Fetched Successfully!' });
    } catch (errors) {
        console.error(errors); // log to console
        res.status(422).json({ errors });
    }
};

exports.getCategoryDropdown = async (req, res) => {
    try {
        const { search, limit = 20 } = req.query;
        let query = Category.query().where('is_active', 1).limit(Number(limit));
        if (search) {
            query = query.where('name', 'like', `%${search}%`);
        }
        const categories = await query;
        res.json({
            categories,
            message: 'Categories Dropdown Fetched Successfully!'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(422).json({
            message: 'Server error',
            error: error.message || error
        });
    }
};

