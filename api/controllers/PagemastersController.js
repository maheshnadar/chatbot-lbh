module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
    getpageconfig: function (req, res) {
        if (req.body) {
            Pagemasters.getpageconfig(req.body, res.callback);
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
    getallconfig: function (req, res) {
        if (req.body) {
            Pagemasters.getallconfig(req.body, res.callback);
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