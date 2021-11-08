const auth = require('./api/auth');
const savedata = require('./api/savedata');
const finddata = require('./api/finddata');

const page_routes = require('./page_routes/index')

module.exports = {
    auth,
    savedata,
    finddata,
    page_routes
};