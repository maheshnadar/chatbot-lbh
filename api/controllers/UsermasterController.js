module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
    login: function (req, res) {
        if (req.body) {
            Usermaster.login(req.body, res.callback);
        }
        else {
            res.json({
                value: false,
                data: {
                    message: "Invalid Request"
                }
            })
        }
    },
    changepassword: function (req, res) {
        //console.log(req);
        if (req.body) {
            Usermaster.changepassword(req.body, res.callback);
        }
        else {
            res.json({
                value: false,
                data: {
                    message: "Invalid Request"
                }
            })
        }
},
};
module.exports = _.assign(module.exports, controller);