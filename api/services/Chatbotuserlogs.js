var schema = new Schema({
    id: {
        type: Number,
    },
    user: {
        type: Object,
        required: true,
    },
    login_date: {
        type: Date,
    },
    logout_date: {
        type: Date,
    },
    ip_address: {
        type: String,
    }
});


schema.plugin(deepPopulate, {
    /*populate: {
        'user': {
            select: 'fname _id'
        }
    }*/
});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Chatbotuserlogs', schema,'chatbot_user_logs');

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {
    logoutuser:function (data, callback) {
        
        Chatbotuserlogs.findOneAndUpdate({
            _id: data.sessionid,
            //user:data.user
        },{$set : {logout_date: (new Date())}}).exec(function (err, found) {
            if (err) {
                console.log("err",err);
                callback(err, null);
            } 
            else {
                if (found) {
                    var Liveuser = require("./Liveuser");
                    Liveuser.remove({
                        email: data.email,
                    }).exec(function (err222, found222) {
                        if (err222) {
                            //callback(err, null);
                        } 
                        else {
                            if (found222) {
                                //callback(null, found);
                            } else {
                                // callback({
                                //     message: "-1"
                                // }, null);
                            }
                            var Agentchat = require("./Agentchat");
                            Agentchat.update({
                                disconnected:false,
                                user2:data.email
                            },{  disconnected: true }, {multi: true},function (err111, found111) {
                                if (err111) {
                                    // callback(err, null);
                                } 
                                else {
                                    if (found111) {
                                        // callback(null, found);
                                    } else {
                                        // callback({
                                        //     message: "-1"
                                        // }, null);
                                    }
                                }

                            });
                            callback(null, found.logout_date);
                        }

                    });
                    
                } else {
                    callback({
                        message: "-1"
                    }, null);
                }
            }

        });
    },
};
module.exports = _.assign(module.exports, exports, model);