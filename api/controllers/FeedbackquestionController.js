module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
    getunans: function (req, res) {
        //console.log(req);
        if (req.body) {
            Feedbackquestion.getunans(req.body, res.callback);
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
    getfeedback: function (req, res) {
        //console.log(req);
        if (req.body) {
            Feedbackquestion.getfeedback(req.body, res.callback);
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
    readfeedbackcount: function (req, res) {
        //console.log(req);
        if (req.body) {
            Feedbackquestion.readfeedbackcount(req.body, res.callback);
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
    readfeedbackq:function (req, res) {
        //console.log(req);
        if (req.body) {
            Feedbackquestion.readfeedbackq(req.body, res.callback);
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