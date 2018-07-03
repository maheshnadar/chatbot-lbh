var schema = new Schema({
    id: {
        type: Number,
    },
    idleid: {
        type: Number,
    },
    activecon: {
        type: Number,
        default: 0
    },
    sname: {
        type: String,
    },
    access_role: {
        type: String,
        default: "",
    },
    livechat: {
        type: String,
        default: "",
    },
	chatlimit:{
        type: Number,
    },
    // final: {
    //     type: String,
    //     default:"",
    // },
    socketId: {
        type: String,
        default: "",
    },
    sid: {
        type: String,
        default: "",
    },
    session: {
        type: Object
    },
    email: {
        type: String
    },
	name: {
        type: String
    },
});

schema.plugin(deepPopulate, {

});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
// mongoose.Promise = global.Promise;
// mongoose.connect('mongodb://localhost:27017/lbh', {
//     useMongoClient: true,
// }, function (err) {
//     if (err) {
//         console.log(err);
//     }
// });
module.exports = mongoose.model('Liveuser', schema, 'Liveuser');

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
//new RegExp(searchstring)
//{ $regex: searchstring, $options: 'i' }
var model = {
    saveuser: function (data, callback) {
        Liveuser.saveData({
            socketId: data.socketId,
            access_role: data.access_role,
            sid: data.sid,
            sname: data.sname,
            livechat: data.livechat,
            //id:data.id,
            session: data.session
        }, function (err3, savefound) {
            if (err3) {
                //                callback(err, null);
                //console.log(err3);
                return null;
            } else {
                if (savefound) {
                    //callback(null, savefound);
                    //console.log(savefound);
                    return savefound;
                } else {
                    /*callback({
                        message: "-1"
                    }, null);*/
                    return -1;
                }
            }

        });
    },
    removelive: function (data, callback) {
        Liveuser.remove({
            email: data.from_id,
        }).exec(function (err222, found222) {
            if (err222) {
                callback(err, null);
            } else {
                if (found222) {
                    var Agentchat = require("./Agentchat");
                    Agentchat.update({
                        disconnected: false,
                        user2: data.from_id
                    }, {
                        disconnected: true
                    }, {
                        multi: true
                    }, function (err111, found111) {
                        if (err111) {
                            callback(err, null);
                        } else {
                            if (found111) {
                                callback(null, found222);
                                // callback(null, found);
                            } else {
                                // callback({
                                //     message: "-1"
                                // }, null);
                            }
                        }

                    });

                } else {
                    // callback({
                    //     message: "-1"
                    // }, null);
                }
            }

        });

    },
    sendmsg: function (data, callback) {
        Agentchat.findOne({
            // 'user1':data.from_id,
            // 'user2':data.to_id,

            $and: [{
                    $or: [{
                        'user1': data.from_id
                    }, {
                        'user1': data.to_id
                    }]
                },
                {
                    $or: [{
                        'user2': data.from_id
                    }, {
                        'user2': data.to_id
                    }]
                },
            ],

            'disconnected': false
        }, function (err, found) {
            if (err) {
                callback(err, null);
            } else {
                if (found.user1 == data.from_id)
                    sails.sockets.blast(found.username1 + "_" + data.from_id, data);
                else
                    sails.sockets.blast(found.username1 + "_" + data.to_id, data);
                Agentchat.update({
                    // 'user1': data.from_id,
                    // 'user2': data.to_id,
                    // 'disconnected':false

                    $and: [{
                            $or: [{
                                'user1': data.from_id
                            }, {
                                'user1': data.to_id
                            }]
                        },
                        {
                            $or: [{
                                'user2': data.from_id
                            }, {
                                'user2': data.to_id
                            }]
                        },
                    ],

                    'disconnected': false
                }, {
                    $push: {
                        chatlist: {
                            from_id: data.from_id,
                            to_id: data.to_id,
                            // fromid: data.fromid,
                            // toid: data.toid,
                            fromname: data.fromname,
                            toname: data.toname,
                            msg: data.msg,
                            // from_socketid: data.from_socketid,
                            // to_socketid: data.to_socketid,
                        }

                    }
                }).exec(function (err2, updatefound) {
                    if (err2) {
                        callback(err2, null);
                    } else {
                        //console.log(updatefound,"inside update");
                        if (updatefound) {
                            callback(null, updatefound);
                        } else {
                            callback({
                                message: "-1"
                            }, null);
                        }
                    }
                });
            }
        });
    },
    sendchat: function (data, callback) {
        Liveuser.findOne({

            livechat: "1",
            $where: "this.chatlimit>this.activecon"

        }).sort({
            updatedAt: 1
        }).exec(function (err3, savefound) {
            if (err3)
                callback(err3, null);
            else {
                if (savefound) {

                    if (savefound) {
                        
                        Agentchat.findOne({
                            // 'user1':data.from_id,
                            // 'user2':data.to_id,

                            $and: [{
                                    $or: [{
                                        'user1': data.email
                                    }, {
                                        'user1': savefound.email
                                    }]
                                },
                                {
                                    $or: [{
                                        'user2': data.email
                                    }, {
                                        'user2': savefound.email
                                    }]
                                },
                            ],

                            'disconnected': false
                        }, function (err, found) {
                            if (err) {
                                callback(err, null);
                            } else {
                                //console.log(found,"found obj");
                                if (found) {
                                    Agentchat.update({
                                        // 'user1':data.from_id,
                                        // 'user2':data.to_id,
                                        // 'disconnected':false

                                        $and: [{
                                                $or: [{
                                                    'user1': data.email
                                                }, {
                                                    'user1': savefound.email
                                                }]
                                            },
                                            {
                                                $or: [{
                                                    'user2': data.email
                                                }, {
                                                    'user2': savefound.email
                                                }]
                                            },
                                        ],

                                        'disconnected': false
                                    }, {
                                        $push: {
                                            chatlist: {
                                                from_id: data.email,
                                                to_id: savefound.email,
                                                // fromid: data.fromid,
                                                // toid: data.toid,
                                                fromname: data.name,
                                                toname: savefound.name,
                                                msg: data.msg,
                                                // from_socketid: data.from_socketid,
                                                // to_socketid: data.to_socketid,
                                            }

                                        }
                                    }).exec(function (err2, updatefound) {
                                        if (err2) {
                                            callback(err2, null);
                                        } else {
                                            //console.log(updatefound,"inside update");
                                            if (updatefound) {
                                                // callback(null, updatefound);
                                            } else {
                                                // callback({
                                                //     message: "-1"
                                                // }, null);
                                            }
                                        }
                                    });
                                } else {
									sails.sockets.blast(data.name + "_" + data.email, data);
									callback(null, savefound);
                                    Agentchat.saveData({
                                        // socketid1: data.from_socketid,
                                        // socketid2: data.to_socketid,
                                        disconnected: false,
                                        user1: data.email,
                                        user2: savefound.email,
                                        username1: data.name,
                                        username2: savefound.name,
                                        // session_id: data.session_id,
                                        // conversation_id: data.conversation_id,
                                        // context_id: data.context_id,
                                        // contexts: data.chatlist,
                                        chatlist: [{
                                            from_id: data.email,
                                            to_id: savefound.email,
                                            // fromid: data.fromid,
                                            // toid: data.toid,
                                            fromname: data.name,
                                            toname: savefound.name,
                                            msg: data.msg,
                                            // from_socketid: data.from_socketid,
                                            // to_socketid: data.to_socketid,
                                        }]
                                    }, function (err3, savefound1) {
                                        if (err3) {
                                            // callback(err3, null);
                                        } else {
                                            if (savefound1) {
                                                console.log(savefound,"inside update");

                                                Liveuser.update({
                                                    email: savefound.email
                                                }, {
                                                    $inc: {
                                                        activecon: 1
                                                    }
                                                }, function (err111, found111) {
                                                    if (err111) {

                                                        // callback(null, savefound);
                                                    } else {
                                                        if (found111) {
                                                            // callback(null, savefound);
                                                        }
                                                    }
                                                });


                                            } else {
                                                // callback({
                                                //     message: "-1"
                                                // }, null);
                                            }
                                        }

                                    });
                                }
                            }
                        });
                    } else {
                        callback({
                            message: "-1"
                        }, null);
                    }
                }
            }
        });
    },
    getliveuser: function (data, callback) {
        var today = new Date();
        var finalres = new Array();
        today.setHours(0);
        today.setMinutes(0);
        today.setSeconds(0);
        Liveuser.find({

            livechat: "1",
            $where: "this.chatlimit>this.activecon"

        }).sort({
            idleid: 1
        }).exec(function (err3, savefound) {
            if (err3)
                callback(err3, null);
            else {
                if (savefound) {
                    callback(null, savefound);


                } else {
                    callback({
                        message: "-1"
                    }, null);
                }
            }
        });
        // Liveuser.find({

        //   livechat:"1",

        // }).exec(function (err3, savefound) {
        //     if (err3) {
        //         callback(err, null);

        //     } 
        //     else {
        //         // finalres=savefound;
        //         if (savefound) {
        //             var async = require('async');
        //             var Agentchat = require("./Agentchat");
        //             var i = 0;
        //             async.each(savefound,
        //                 // 2nd param is the function that each item is passed to
        //                 function(item, eachCallback){
        //                     var agentdata = item;
        //                     Agentchat.find({

        //                         user2:item.email,
        //                         disconnected:false
        //                     }).exec(function (err4, agfound) {
        //                         if(err4)
        //                         {
        //                             console.log("inside err",i);
        //                             agentdata.livechats=[];
        //                             // var obj = {key1: "value1", key2: "value2"};
        //                             var obj2 = {livechats:[]};
        //                             _.merge(agentdata, obj2);
        //                             finalres.push(agentdata);
        //                             // savefound[i].livechats=[];
        //                             // finalres[i]['livechats']=new Array();
        //                             i++;
        //                             eachCallback();
        //                         }
        //                         else {
        //                             if(agfound)
        //                             {    
        //                                 //agentdata.livechats=agfound;
        //                                 var obj2 = {lc:agfound};
        //                                 _.merge(agentdata, obj2);
        //                                 finalres.push(agentdata);
        //                                 // savefound[i].livechats=agfound;
        //                                 // finalres[i]['livechats']=agfound;
        //                                 console.log("inside got data",agentdata);
        //                                 i++;
        //                                 eachCallback();
        //                             }
        //                             else {
        //                                 console.log("inside empty cghat");

        //                                 agentdata.livechats=[];
        //                                 agentdata.livechats=agfound;
        //                                 var obj2 = {livechats:[]};
        //                                 finalres.push(agentdata);
        //                                 // savefound[i].livechats=[];
        //                                 // finalres[i]['livechats']=new Array();
        //                                 i++;
        //                                 eachCallback();
        //                             }
        //                         }
        //                     });


        //                 }, function(err) {
        //                     // if any of the file processing produced an error, err would equal that error
        //                     if( err ) {
        //                     // One of the iterations produced an error.
        //                     // All processing will now stop.
        //                         console.log('A file failed to process');
        //                     } else {
        //                         console.log("final res",finalres);
        //                         callback(null, finalres);
        //                     }
        //                 }
        //             );    



        //         } else {
        //             callback({
        //                 message: "-1"
        //             }, null);
        //         }
        //     }

        // });

        // Liveuser.aggregate(

        //     // Pipeline
        //     //[
        //         // Stage 1
        //         {
        //             $lookup: // Equality Match
        //             {
        //                 from: "agentchat",
        //                 localField: "email",
        //                 foreignField: "user2",
        //                 as: "livechats"
        //             }

        //             // Uncorrelated Subqueries
        //             // (supported as of MongoDB 3.6)
        //             // {
        //             //    from: "<collection to join>",
        //             //    let: { <var_1>: <expression>, …, <var_n>: <expression> },
        //             //    pipeline: [ <pipeline to execute on the collection to join> ],
        //             //    as: "<output array field>"
        //             // }
        //         },

        //         // Stage 2
        //         {
        //             $match: {
        //                 //'livechats.user2':{'$exists':True}
        //                 livechat:'1',

        //                 // createdAt:{"$gte": today},
        //                 // 'livechats.createdAt':{"$gte": today}
        //             }
        //         },
        //         function( err, savefound ) {

        //             if ( err )
        //                 callback(err, null);
        //             else {
        //                 if (savefound) {
        //                     callback(null, savefound);


        //                 } else {
        //                     callback({
        //                         message: "-1"
        //                     }, null);
        //                 }
        //             }
        //             //console.log( JSON.stringify( data, undefined, 2 ) );

        //         }
        //     //]

        //     // Created with Studio 3T, the IDE for MongoDB - https://studio3t.com/

        // );
    },
};
module.exports = _.assign(module.exports, exports, model);