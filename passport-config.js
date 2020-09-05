var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');

function initialize(passport, getUserByEmail, getUserById)
{
    const authenticateUser = async(email, password, done) => {
        const user = getUserByEmail(email);
        if(user == null)
        {
            return done(null, false, {message: 'No user with that email'});
        }

        try{
            if(await bcrypt.compare(password, user.password))
            {
                return done(null, user, {message: 'Authentication successful'});
            }
            else
            {
                return done(null, false, {message: 'Password did not match'});
            }
        }
        catch(e){
            done(e)
        }
    }

    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => {
        return done(null, getUserById(id));
    });
}

module.exports = initialize;