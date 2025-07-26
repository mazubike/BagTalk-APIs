const User = require('../../models/user.model');
const UserProfileTag = require('../../models/user_profile_tags.model');
const ProfileTag = require('../../models/profile_tags.model');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const updateImage = require('../../utils/updateFile')
const cleanupUploadedFiles = require('../../utils/deleteFiles')
const mediaDir = path.join(__dirname, '..', '..', 'public', 'media', 'profiles');

exports.updateProfile = async (req, res, next) => {

    const id = req.user?.id;

    if (!id) {
        return res.status(422).json({ message: 'Missing ID' });
    }

    const { user_name, full_name } = req.body;

    if (!user_name || !full_name) {
        return res.status(422).json({
            message: 'Both user_name and full_name are required',
        });
    }

    // Parse social_links if present
    if (req.body.social_links) {
        try {
            req.body.social_links = JSON.parse(req.body.social_links);
        } catch (err) {
            return res.status(422).json({ message: 'Invalid JSON in social_links' });
        }
    }
    if (req.body?.profile_tags && !Array.isArray(req.body?.profile_tags)) {
        return res.status(422).json({ message: 'Should be list in profile_tags' });
    }
    const { profile_tags: incomingTags, is_active, role_id, deleted_at, provider, provider_id, ...restBody } = req.body;
    const updateData = { ...restBody, is_completed: true };
    const userName = await User.query().findOne({ user_name: user_name });

    if (userName && userName.id != req.user.id) {
        return res.status(404).json({ message: 'This User name Already Exist' });
    }
    try {
        // Start transaction for atomic update
        await User.transaction(async trx => {
            const existingProfile = await User.query(trx).findById(id);


            if (!existingProfile) {
                cleanupUploadedFiles(req, mediaDir)
                return res.status(404).json({ message: 'Profile not found' });
            }

            if (existingProfile.user_name && existingProfile.user_name != user_name) {
                return res.status(404).json({ message: 'You cannot change your user_name' });
            }
            
            updateImage({
                req,
                existingData: existingProfile,
                fields: ['profile_image'],
                updateData,
                mediaDir
            });


            // Update user profile
            await User.query(trx).patchAndFetchById(id, updateData);

            // Update profile tags if provided
            if (Array.isArray(incomingTags)) {
                await UserProfileTag.query(trx).delete().where({ user_id: id });

                const tagEntries = incomingTags.map(tagId => ({
                    user_id: id,
                    tag_id: tagId,
                }));

                for (const slot of tagEntries) {
                    await UserProfileTag.query(trx).insert(slot);
                }
            }
        });

        // Fetch updated user with relations
        const updatedUser = await User.query().findById(id).withGraphFetched('[profile_tags, wallets]');

        return res.status(200).json({
            status: 200,
            message: 'Profile updated successfully!',
            user: updatedUser,
        });

    } catch (error) {
        cleanupUploadedFiles(req, mediaDir)
        next(error)
    }
};

exports.getProfile = async (req, res) => {

    const id = req.user?.id;

    if (!id) {
        return res.status(422).json({ message: 'Please login to get profile' });
    }
    try {
        const user = await User.query().findById(id).withGraphFetched('[profile_tags, wallets]');
        if (!user) {
            return res.status(422).json({
                status: 422,
                message: 'User Not Available or Deleted!',
                user
            });
        }
        return res.status(200).json({
            status: 200,
            message: 'Profile fetched successfully!',
            user
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        return res.status(422).json({
            message: 'Failed to update profile',
            error: error.message,
        });
    }
};


// Helper function to generate a random string
const generateRandomString = (length = 5) => {
    return crypto.randomBytes(length).toString('hex').slice(0, length); // Generates a random string of 5 characters
};

// Function to check if the username is unique and return suggestions
exports.checkUniqueUserName = async (req, res, next) => {
    const { user_name } = req.body;

    if (!user_name) {
        return res.status(422).json({ message: 'Username is required' });
    }

    try {
        // Check if the provided user_name already exists in the database
        const existingUser = await User.query().findOne({ user_name });

        if (!existingUser) {
            // If the user_name is available, respond with success
            return res.status(200).json({
                message: 'Username is available',
                user_name: user_name,
            });
        }

        // If the user_name is already taken, generate suggestions
        const suggestions = [];
        let attempts = 0;

        while (suggestions.length < 5 && attempts < 10) {
            attempts++;
            const randomSuffix = generateRandomString();
            const suggestedUserName = `${user_name}${randomSuffix}`;

            // Check if the suggested user_name already exists in the database
            const existingSuggestion = await User.query().findOne({ user_name: suggestedUserName });

            if (!existingSuggestion) {
                suggestions.push(suggestedUserName);
            }
        }

        if (suggestions.length === 0) {
            return res.status(500).json({
                message: 'Unable to generate unique suggestions at the moment, please try again later.',
            });
        }

        return res.status(200).json({
            message: 'The username is taken. Here are some suggestions:',
            suggestions,
        });

    } catch (error) {
        next(error)
    }
};

exports.getProfileTags = async (req, res, next) => {
    try {
        const { search, limit = 20 } = req.query;
        let query = ProfileTag.query().limit(Number(limit));
        if (search) {
            query = query.where('name', 'like', `%${search}%`);
        }
        const tags = await query;
        res.json({
            status: 200,
            message: 'Profile tags fetched Successfully!',
            tags,

        });
    } catch (error) {
        next(error)
    }
};

exports.addTag = async (req, res, next) => {
    try {
        const body = {
            ...req.body
        }
        console.log(body)
        const tag = await ProfileTag.query().insertAndFetch(body);
        res.json({ tag, message: 'Tag Added Successfully!' });
    } catch (error) {
        next(error)
    }
};


exports.deleteTag = async (req, res, next) => {
    try {
        const { id } = req.params;
        await ProfileTag.query().deleteById(id);
        res.json({ message: 'Tag Deleted Sucessfully!' });
    } catch (error) {
        next(error)
    }
}





