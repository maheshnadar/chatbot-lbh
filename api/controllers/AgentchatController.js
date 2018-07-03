module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
    disconnectbyuser: function (req, res) {
        if (req.body) {
            Agentchat.disconnectbyuser(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: {
                    message: "Invalid Request"
                }
            })
        }
    },
    getchats: function (req, res) {
        if (req.body) {
            Agentchat.getchats(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: {
                    message: "Invalid Request"
                }
            })
        }
    },
    savechat: function (req, res) {
        if (req.body) {
            Agentchat.savechat(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: {
                    message: "Invalid Request"
                }
            })
        }
    },
    getchat: function (req, res) {
        if (req.body) {
            Agentchat.getchat(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: {
                    message: "Invalid Request"
                }
            })
        }
    },
    transferchat: function (req, res) {
        if (req.body) {
            Agentchat.transferchat(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: {
                    message: "Invalid Request"
                }
            })
        }
    },
    savefeedback: function (req, res) {
        if (req.body) {
            Agentchat.savefeedback(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: {
                    message: "Invalid Request"
                }
            })
        }
    },
    savelike: function (req, res) {
        if (req.body) {
            Agentchat.savelike(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: {
                    message: "Invalid Request"
                }
            })
        }
    },
    getdashboarddata: function (req, res) {
        if (req.body) {
            Agentchat.getdashboarddata(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: {
                    message: "Invalid Request"
                }
            })
        }
    },

    disconnectuser: function (req, res) {
        if (req.body) {
            Agentchat.disconnectuser(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: {
                    message: "Invalid Request"
                }
            })
        }
    },
    setdisconnectsocket: function (req, res) {
        if (req.body) {
            Agentchat.setdisconnectsocket(req.body, res.callback);
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