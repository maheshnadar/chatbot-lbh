var schema = new Schema({
    user_name: {
        type: String,

    },
    user_id: {
        type: String,
        //validate: validators.isEmail(),
        //unique: true
    },
    chatlimit: {
        type: Number
    },
    password: {
        type: String,
        required: true,
    },
    forgotPassword: {
        type: String,
        default: ""
    },
    user_status: {
        type: Boolean,
    },
    accessToken: {
        type: [String],
        index: true
    },
    accessLevel: {
        type: String,
    },
    expirydate: {
        type: Date,
    },
    resetpasswordtoken: {
        type: String,
    },
    user_lastlog: {
        type: Date
    },
    role: {
        type: String
    }
});

schema.plugin(deepPopulate, {

});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);

module.exports = mongoose.model('Usermaster', schema, 'usermaster');

var exports = _.cloneDeep(require("sails-wohlig-service")(schema, "usermaster", "usermaster"));
//new RegExp(searchstring)
//{ $regex: searchstring, $options: 'i' }
function extend(target) {
    var sources = [].slice.call(arguments, 1);
    sources.forEach(function (source) {
        for (var prop in source) {
            target[prop] = source[prop];
        }
    });
    return target;
}
var model = {
    login: function (data, callback) {
        // console.log("data", data)
        Usermaster.findOne({
            user_id: data.username,
            password: data.password,
            user_status: true,
            role: "agent"
        }, {
            chatlimit: 1,
            user_name: 1,
            user_id: 1,
            _id: 1
        }).limit(1).exec(function (err, found) {
			
            if (err) {
                callback(err, null);
            } else {
                if (found) {
                    var ip = require('ip');
                    var ip_address = ip.address("public", "ipv4");
                    var userLogs = require("./Chatbotuserlogs");
                    var sessiondata = userLogs({
                        user: found._id,
                        login_date: (new Date()),
                        ip_address: ip_address,
                        logout_date: new Date()
                    });
                    sessiondata.save(function (err, result) {
                        if (err) {
                            return err;
                        } else {
                            // found2 = {};
							console.log(found);
                            // found2 = found;
                            // found2.sessionid = result._id;
                            var Liveuser = require("./Liveuser");
                            Liveuser.remove({
                                email: data.username,
                            }).exec(function (err222, found222) {
                                if (err222) {
                                    //callback(err, null);
                                } else {
                                    if (found222) {
                                        //callback(null, found);
                                    } else {
                                        // callback({
                                        //     message: "-1"
                                        // }, null);
                                    }
                                }
								Liveuser.saveData({
									email: data.username,
									chatlimit: found.chatlimit,
									activecon: 0,
									livechat: "1",
									name:found.user_name
								}, function (err3, savefound1) {
									if (err3) {
										// callback(err3, null);
									} else {
										if (savefound1) {
											//console.log(savefound,"inside update");
											// callback(null, savefound);
										} else {
											// callback({
											//     message: "-1"
											// }, null);
										}
									}

								});
                            });
                            
                            var Agentchat = require("./Agentchat");
                            Agentchat.update({
                                disconnected: false,
                                user2: data.username
                            }, {
                                disconnected: true
                            }, {
                                multi: true
                            }, function (err111, found111) {
                                if (err111) {
                                    // callback(err, null);
                                } else {
                                    if (found111) {
                                        // callback(null, found);
                                    } else {
                                        // callback({
                                        //     message: "-1"
                                        // }, null);
                                    }
                                }

                            });
                            found = found.toObject();
                            var r = result.toObject();
                            found.sessionid = r._id;
                            found.curtime = Date.now();
                            // var jwt = require("jsonwebtoken");
                            // var token = jwt.sign(found.toJSON, "ExPo", {
                            //     expiresIn: '8h'
                            // });
                            //found.token=token;
                            Usermaster.update({
                                user_id: data.username,
                            }, {
                                $set: {
                                    user_lastlog: new Date(),
                                },

                            }).exec(function (err2, updatefound) {

                                callback(null, found);
                            });

                            // PythonShell.run(pythonpath+'my_script.py', { mode: 'json ',args:[data]}, function (err, results) { 
                            //     //found.set('sessionid', result._id)



                            // });
                            //callback(null, found);
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
    changepassword: function (data, callback) {
        Usermaster.findOneAndUpdate({
            _id: data.userid,
            password: data.oldpassword,
        }, {
            $set: {
                password: data.newpassword
            }
        }).exec(function (err, found) {
            if (err) {
                callback(err, null);
            } else {
                if (found) {
                    callback(null, found);
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