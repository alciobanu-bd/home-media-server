/**
 * Google OAuth2 authentication routes
 */

/**
 * Initiates the Google OAuth2 authentication flow
 * GET /api/auth/google/init
 */
const googleAuthInitHandler = async (request, reply) => {
    // Google OAuth2 parameters
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = `${process.env.SERVER_URL}/api/auth/google/callback`;
  
    if (!clientId) {
        return reply.code(500).send({ 
            error: 'Server configuration error', 
            details: 'Google OAuth credentials not configured' 
        });
    }
  
    // Set up OAuth2 parameters
    const scope = 'profile email';
    const responseType = 'code';
    const accessType = 'offline';
  
    // Construct the Google OAuth2 URL
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.append('client_id', clientId);
    googleAuthUrl.searchParams.append('redirect_uri', redirectUri);
    googleAuthUrl.searchParams.append('response_type', responseType);
    googleAuthUrl.searchParams.append('scope', scope);
    googleAuthUrl.searchParams.append('access_type', accessType);
  
    // Optional: Add state parameter for security (prevents CSRF)
    const state = Math.random().toString(36).substring(2);
    googleAuthUrl.searchParams.append('state', state);
  
    // Store state in session/cookie for verification when callback is received
    reply.setCookie('oauth_state', state, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 600, // 10 minutes
        sameSite: 'lax'
    });
  
    // Redirect to Google's OAuth2 server
    return reply.redirect(googleAuthUrl.toString());
};

module.exports = function(fastify, opts, done) {
    fastify.get('/auth/google/init', googleAuthInitHandler);
    done();
}; 