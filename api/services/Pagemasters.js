var schema = new Schema({
    page_url: {
        type: String,
    },
    message: {
        type: String,
    },
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Pagemasters', schema,'pagemaster');

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {
    getpageconfig: function (reqdata, callback) {
        var Model = this;
        //console.log(reqdata.category);
        Model.find({
            
        }).exec(function (err, data) {
            if (err) {
                //console.log(err);
                callback(err, null);
            } else {
                //console.log(data,"data");
               
                callback(err, data);
            }
        });
    },
    getallconfig: function (reqdata, callback) {
        var Model = this;
        var pageconfig = [];
        //console.log(reqdata.category);
        Model.find({
            
        }).exec(function (err1, data1) {
            if (err1) {
                //console.log(err);
                callback(err1, null);
            } else {
                //console.log(data,"data");
                var Thememaster = require("./Thememaster");
        
                Thememaster.findOne({
                    
                }).limit(1).exec(function (err2, data2) {
                    if (err2) {
                        //console.log(err);
                        callback(err2, null);
                    } else {
                        //console.log(data,"data");
                        // var Concurrentuser = require("./Concurrentuser");
        
                        // Concurrentuser.findOne({
                            
                        // }).limit(1).exec(function (err3, data3) {
                        //     if (err3) {
                        //         //console.log(err);
                        //         callback(err3, null);
                        //     } else {
                        //         //console.log(data,"data");
                        //         callback(null,{pageconfig:data1,themeconfig:data2,concurrentconfig:data3});
                                
                        //     }
                        // });
                        var Offlinemessage = require("./Offlinemessage");
        
                        Offlinemessage.findOne({
                            
                        }).limit(1).exec(function (err3, data3) {
                            if (err3) {
                                //console.log(err);
                                callback(err3, null);
                            } else {
                                //console.log(data,"data");
                                var Agentchat = require("./Agentchat");
                                Agentchat.findOne({
                                    'user1':reqdata.from_id,
                                    'disconnected': false
                                 }, 
                                 
                                function (err, chatfound) {
                                    if (err) {
                                        callback(err, null);
                                    } else {
                                        if (chatfound) {
                                            callback(null,{pageconfig:data1,themeconfig:data2,offlineconfig:data3,chat:chatfound});
                                
                                        } else {
                                            callback(null,{pageconfig:data1,themeconfig:data2,offlineconfig:data3,chat:{}});
                                        }
                                     
                                    }
                                });
                                
                            }
                        });
                        
                    }
                });
                // callback(err, data);
            }
        });
    },
};
module.exports = _.assign(module.exports, exports, model);