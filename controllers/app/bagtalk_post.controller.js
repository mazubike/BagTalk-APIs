const Post = require('./../../models/bagtalk_post.model');
const path = require('path');
const updateImage = require('../../utils/updateFile')
const cleanupUploadedFiles = require('../../utils/deleteFiles')
const mediaDir = path.join(__dirname, '..', '..', 'public', 'media', 'posts');

exports.addBagtalk = async (req, res, next) => {
    console.log('Post Body:', req.body)
    console.log('Post Files:', req.file)
    try {
        
        const user_id = req.user.id;
        const { title, description, tags = [] } = req.body;
        if (!title || !description) {
            return res.status(400).json({ error: 'Missing required fields title or description' });
        }

        const existingData = {}; // For a new post, there's nothing to delete yet
        const updateData = {
            user_id,
            title,
            description,
            tags,
            post_type: 'simple'
        };
        
        updateImage({
            req,
            existingData,
            fields: 'image',
            updateData,
            mediaDir
        });
        
        const post = await Post.query().insert(updateData);
        const addedPost = await Post.query().withFlags(user_id).findById(post.id)

        return res.status(200).json({
            status: 200,
            message: 'Bagtalk post created successfully',
            post: addedPost
        });

    } catch (error) {
        cleanupUploadedFiles(req, mediaDir)
        next(error);
    }
};

exports.getSingleBagtalk = async (req, res, next) => {
    try {
        const postId = req.params.id;
        const userId = req.user.id;

        const post = await Post.query().withFlags(userId).findById(postId);

        // if (!post || post.user_id !== userId) {
        //     return res.status(403).json({ error: 'Access denied or post not found' });
        // }

        return res.status(200).json({
            status: 200,
            message: 'Bagtalk post fetched successfully',
            post
        });
    } catch (error) {
        next(error);
    }
};

exports.getAllBagtalk = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || parseInt(process.env.ITEMS_LIMIT) || 10;
        const pageIndex = page - 1;
        
        const user_id = Number(req.query.user_id) || req.user.id;
        if (!user_id) {
            return res.status(200).json({
                status: 200,
                message: 'user id not found.',
            })
        }
        const result = await Post.query().withFlags(user_id).where('posts.user_id', user_id).orderBy('posts.created_at', 'desc').page(pageIndex, limit);
        return res.status(200).json({
            status: 200,
            message: 'Bagtalk all user posts fetched successfully',
            pagination: {
                total_results: result.total,
                total_pages: Math.ceil(result.total / limit),
                current_page: page,
                limit
            },
            posts: result.results
        });
    } catch (error) {
        next(error);
    }
};

exports.updateBagtalk = async (req, res, next) => {
    console.log('Update Body:', req.body);
    console.log('Update Files:', req.file);
    try {
        const postId = req.params.id;
        const userId = req.user.id;
        const { title, description, tags = [] } = req.body;
        
        const post = await Post.query().findById(postId);

        if (!post || post.user_id !== userId) {
            cleanupUploadedFiles(req, mediaDir)
            return res.status(403).json({ error: 'Post not found or Access denied' });
        }

        const updateData = { title, description, tags };

        updateImage({
            req,
            existingData: post,
            fields: 'image',
            updateData,
            mediaDir
        });
        await Post.query().context({ skipJoins: true }).patchAndFetchById(postId, updateData);
        const afterUpdatePost = await Post.query().withFlags().findById(postId);
        return res.status(200).json({
            status: 200,
            message: 'Bagtalk post updated successfully',
            post: afterUpdatePost
        });

    } catch (error) {
        cleanupUploadedFiles(req, mediaDir);
        next(error);
    }
};

exports.deleteBagtalk = async (req, res, next) => {
    try {
        const postId = req.params.id;
        const userId = req.user.id;

        const post = await Post.query().findById(postId);


        if (!post || post.user_id !== userId) {
            return res.status(403).json({ error: 'Post not found or Access denied' });
        }

        cleanupUploadedFiles(req, mediaDir); // optional, if you handle media cleanup

        await Post.query().context({ skipJoins: true }).deleteById(postId);

        return res.status(200).json({
            status: 200,
            message: 'Bagtalk post deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};










