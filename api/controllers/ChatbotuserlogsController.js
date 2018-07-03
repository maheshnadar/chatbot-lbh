module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
    logoutuser: function (req, res) {
        //console.log(req);
        if (req.body) {
            Chatbotuserlogs.logoutuser(req.body, res.callback);
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
