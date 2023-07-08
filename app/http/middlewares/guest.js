//This is made to restrict the logged in users to go to the register page or login page. Though we remove these buttons but one can go by typing in the url /login
function guest (req, res, next) {
    if(!req.isAuthenticated()) {
        return next()
    }
    return res.redirect('/')                //if the user is authenticated and tries to call the login or register, we redicrect them to main page
}                                           //We pass this guest function in web page

module.exports = guest