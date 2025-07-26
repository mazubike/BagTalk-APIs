const User = require('../../models/user.model');
const Wallet = require('../../models/wallet.model');
const { generateToken } = require('../../utils/jwt');


exports.auth = async (req, res, next) => {
    try {

        const { provider, provider_id, address, wallet_type, full_name = null } = req.body || {};

        let user;

        // Early validation
        if (!(provider && provider_id) && !(address && wallet_type)) {
            return res.status(422).json({ message: 'Missing Required Entries.' });
        }

        // Case 1: Social login/register
        if (provider && provider_id) {
            user = await User.query().findOne({ provider_id, provider }).withDeleted();
            
            if (user && user?.deleted_at) {
                return res.status(422).json({ error_type: 'email', message: 'Your account has not been created yet or may have been deleted. Kindly register first to log in.' });
            }

            if (user && !user?.is_active) {
                return res.status(422).json({ message: 'You have Blocked kindly contact support.' });
            }
            if (user) {
                const token = generateToken({ id: user.id, role: user?.role?.name || 1 });
                return res.status(200).json({
                    status: 200,
                    message: 'Login Successful!',
                    user: user.toJSON(),
                    token
                });
            }

            user = await User.query().insertAndFetch({
                provider,
                provider_id,
                full_name: full_name || null,
                is_completed: false,
                role_id: 1
            });

            // Optionally save wallet if provided
            // if (address && wallet_type) {
            //     await Wallet.query().insert({
            //         address,
            //         wallet_type,
            //         user_id: user.id
            //     });
            // }

        } else if (address && wallet_type) {
            // Case 2: Wallet login/register
            
            const existingWallet = await Wallet.query()
                .findOne({ address })
                .withGraphFetched('user').withDeleted();
            
            if (existingWallet && existingWallet.user && existingWallet?.user?.deleted_at) {
                return res.status(422).json({ error_type: 'email', message: 'Your account has not been created yet or may have been deleted. Kindly contact to support.' });
            }

            if (existingWallet && existingWallet.user && !existingWallet?.user?.is_active) {
                return res.status(422).json({ message: 'You have Blocked kindly contact to support.' });
            }
            if (existingWallet && existingWallet?.user) {
                user = existingWallet.user;

                const token = generateToken({ id: user.id, role: user?.role?.name || 1 });
                return res.status(200).json({
                    status: 200,
                    message: 'Login Successful!',
                    user: user.toJSON(),
                    token
                });
            }

            // Create new user and wallet
            user = await User.query().insertAndFetch({ full_name: full_name || null, is_completed: false, role_id: 1 });

            await Wallet.query().insert({
                address,
                wallet_type,
                user_id: user.id,
                is_primary: true
            });
        }

        const token = generateToken({ id: user.id, role: 'user' });
        const fullUser = await User.query().findById(user.id);

        res.status(200).json({
            status: 200,
            message: 'Register Successful!',
            user: fullUser.toJSON(),
            token
        });

    } catch (err) {
        next(err)
    }
}






