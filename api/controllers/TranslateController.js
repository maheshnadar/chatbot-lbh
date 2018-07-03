module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
    translate: function (req, res) {
        if (req.body) {
            Translate.translate(req.body, res.callback);
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
    translatelink: function (req, res) {
        if (req.body) {
            Translate.translatelink(req.body, res.callback);
        }
        else {
            res.json({
                value: false,
                data: {
                    message: "Invalid Request"
                }
            })
        }
    }
};
module.exports = _.assign(module.exports, controller);