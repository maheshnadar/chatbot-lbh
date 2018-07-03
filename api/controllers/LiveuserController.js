module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
    sendchat: function (req, res) {
        if (req.body) {
            Liveuser.sendchat(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: {
                    message: "Invalid Request"
                }
            })
        }
    },
    sendmsg: function (req, res) {
        if (req.body) {
            Liveuser.sendmsg(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: {
                    message: "Invalid Request"
                }
            })
        }
    },
    getliveuser: function (req, res) {
        if (req.body) {
            Liveuser.getliveuser(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: {
                    message: "Invalid Request"
                }
            })
        }
    },
    removelive: function (req, res) {
        if (req.body) {
            Liveuser.removelive(req.body, res.callback);
        } else {
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