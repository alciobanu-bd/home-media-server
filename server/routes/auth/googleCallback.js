const axios = require('axios');
const jwt = require('jsonwebtoken');
const { getDb, getCollection } = require('../utils/db');

/**
 * Google OAuth2 callback handler
 * GET /api/auth/google/callback
 */
const googleCallbackHandler = async (request, reply) => {
    const { code, state } = request.query;
    const storedState = request.cookies.oauth_state;
  
    // Verify the state parameter to prevent CSRF attacks
    if (!state || !storedState || state !== storedState) {
        return reply.redirect(`${process.env.CLIENT_URL}/login?error=auth_state_mismatch`);
    }
  
    // Clear the state cookie
    reply.clearCookie('oauth_state');
  
    if (!code) {
        return reply.redirect(`${process.env.CLIENT_URL}/login?error=no_code`);
    }
  
    try {
    // Exchange the authorization code for tokens
        const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: `${process.env.SERVER_URL}/api/auth/google/callback`,
            grant_type: 'authorization_code'
        });
    
        const { access_token, id_token } = tokenResponse.data;
    
        // Get user info using the access token
        const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${access_token}` }
        });
    
        const userInfo = userInfoResponse.data;
    
        // Find or create the user in the database
        const db = getDb();
        const usersCollection = getCollection(db, 'users');
    
        let user = await usersCollection.findOne({ googleId: userInfo.sub });
    
        if (user) {
            // Update existing user
            await usersCollection.updateOne(
                { googleId: userInfo.sub },
                { 
                    $set: {
                        name: userInfo.name,
                        email: userInfo.email,
                        picture: userInfo.picture,
                        lastLogin: new Date()
                    }
                }
            );
        } else {
            // Create new user
            user = {
                googleId: userInfo.sub,
                name: userInfo.name,
                email: userInfo.email,
                picture: userInfo.picture,
                createdAt: new Date(),
                lastLogin: new Date()
            };
      
            await usersCollection.insertOne(user);
        }
    
        // Get the latest user data
        user = await usersCollection.findOne({ googleId: userInfo.sub });
    
        // Create a JWT token
        const token = jwt.sign(
            { 
                userId: user._id.toString(),
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
    
        // Set the token as a cookie
        reply.setCookie('auth_token', token, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        });
    
        // Redirect to the client app
        return reply.redirect(process.env.CLIENT_URL);
    
    } catch (error) {
        console.error('Google OAuth callback error:', error.message);
        return reply.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
    }
};

module.exports = function(fastify, opts, done) {
    fastify.get('/auth/google/callback', googleCallbackHandler);
    done();
}; 