var schema = new Schema({
    chatlist: [
        // type: Array,
        {
            date: {
                type: Date,
                default: Date.now
            },
            //Schema.Types.ObjectId
            from_id: {
                type: String
            },
            to_id: {
                type: String
            },
            fromid: {
                type: Number,
            },
            toid: {
                type: Number,
            },
            fromname: {
                type: String,
            },
            toname: {
                type: String,
            },
            msg: {
                type: String,
            },
            from_socketid: {
                type: String,
            },
            to_socketid: {
                type: String,
            },
        }
    ],
    user1: {
        //type:Schema.Types.ObjectId,
        type: String
    },
    user2: {
        //type:Schema.Types.ObjectId,
        type: String
    },
    socketid1: {
        type: String
    },
    socketid2: {
        type: String
    },
    disconnected: {
        type: Boolean
    },
    disconnectby: {
        type: String
    },
    session_id: {
        type: Number
    },
    username1: {
        type: String
    },
    username2: {
        type: String
    },
    conversation_id: {
        type: Number
    },
    context_id: {
        type: Number
    },
    contexts: {
        type: Array
    },
    like: {
        type: Number
    },
    dislike: {
        type: Number
    },
    feedback: {
        type: String
    },
    transferto: {
        type: String
    },
    transfer: {
        type: Number
    }
});

function extend(target) {
    var sources = [].slice.call(arguments, 1);
    sources.forEach(function (source) {
        for (var prop in source) {
            target[prop] = source[prop];
        }
    });
    return target;
}
schema.plugin(deepPopulate, {
    /*populate: {
        'user': {
            select: 'fname _id'
        }
    }*/
});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
//userlogschema.plugin(uniqueValidator);
//userlogschema.plugin(timestamps);
//userlogschema = require('userlogschema');

module.exports = mongoose.model('agentchat', schema, 'agentchat');
//var chatbot_user_logs = mongoose.model('chatbot_user_logs', userlogschema,"chatbot_user_logs");
var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {
    setdisconnectsocket: function (data, callback) {
        Agentchat.update({
            $and: [{
                $or: [{
                    'user1': data.from_id
                }, {
                    'user2': data.from_id
                }]
            }, ],
            disconnected: false
        }, {
            disconnected: true
        }, {
            multi: true
        }, function (err, found) {
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
    disconnectbyuser: function (data, callback) {
        var Liveuser = require("./Liveuser");
        // Liveuser.findOne({


        // }).sort({
        //     idleid: -1
        // }).limit(1).exec(function (err, found) {
        //     if (err) {
        //         callback(err, null);
        //     } else {
        //         var idleid = found.idleid + 1;
        //         Liveuser.update({

        //             email: data.to_id
        //         }, {
        //             $set: {
        //                 idleid: idleid
        //             }
        //         }, function (err111, found111) {
        //             if (err111) {
        //                 //callback(err, null);

        //             } else {
        //                 if (found111) {

        //                 }
        //             }
        //         });
        //         Liveuser.update({

        //             email: data.to_id
        //         }, {
        //             $inc: {
        //                 activecon: -1
        //             }
        //         }, function (err111, found111) {
        //             if (err111) {
        //                 //callback(err, null);

        //             } else {
        //                 if (found111) {

        //                 }
        //             }
        //         });
        //     }
        // });
		Liveuser.update({

             email: data.to_id
        }, {
            $inc: {
                activecon: -1
            }
        }, function (err111, found111) {
            if (err111) {
                 //callback(err, null);

            } else {
                if (found111) {

                }
            }
        });
        Agentchat.findOneAndUpdate({
            user1: data.email,
            disconnected: false
        }, {
            $set: {
                disconnected: true,
                disconnectby: data.email
            }
        }).exec(function (err, found) {
            if (err) {
                callback(err, null);
            } else {
                if (found) {
                    Liveuser.update({

                        email: found.email
                    }, {
                        $inc: {
                            activecon: -1
                        }
                    }, function (err111, found111) {
                        if (err111) {
                            //callback(err, null);

                        } else {
                            if (found111) {

                            }
                        }
                    });
                    callback(null, found);

                    //sails.sockets.blast(data.name + "_" + data.email, data);
                } else {
                    callback({
                        message: "-1"
                    }, null);
                }
            }

        });
    },
    disconnectuser: function (data, callback) {
        var Liveuser = require("./Liveuser");
        Liveuser.findOne({


        }).sort({
            idleid: -1
        }).limit(1).exec(function (err, found) {
            if (err) {
                callback(err, null);
            } else {
                var idleid = found.idleid + 1;
                Liveuser.update({

                    email: data.to_id
                }, {
                    $set: {
                        idleid: idleid
                    }
                }, function (err111, found111) {
                    if (err111) {
                        //callback(err, null);

                    } else {
                        if (found111) {

                        }
                    }
                });
                Liveuser.update({

                    email: data.to_id
                }, {
                    $inc: {
                        activecon: -1
                    }
                }, function (err111, found111) {
                    if (err111) {
                        //callback(err, null);

                    } else {
                        if (found111) {

                        }
                    }
                });
            }
        });

        Agentchat.findOneAndUpdate({
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
            // $and: [{
            //         // $or: [{
            //         //     'socketid1': data.socketid
            //         // }, {
            //         //     'socketid2': data.socketid
            //         // }]
            //         $or: [{
            //             'user1':data.from_id,
            //         },
            //         {
            //             'user2':data.from_id,
            //         }
            //         ]

            //     },
            //     // { $or:[ {'socketid2':data.socketid}, {'socketid2':data.socketid}] },
            // ],
            disconnected: false
        }, {
            $set: {
                disconnected: true,
                disconnectby: data.disconnectby
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
    getchats: function (data, callback) {
        var Liveuser = require("./Liveuser");

        Agentchat.find({
			'user2': data.email,
			'disconnected': false
		},

		function (err, found) {
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
    // savechat:function (data, callback) {
    //     var Liveuser = require("./Liveuser");
    //     Agentchat.findOne( {
    //         $and : [
    //             { $or:[ {'socketid1':data.from_socketid}, {'socketid1':data.to_socketid}] },
    //             { $or:[ {'socketid2':data.from_socketid}, {'socketid2':data.to_socketid}] },
    //         ]
    //     },function(err,found){
    //         if (err) {
    //             callback(err, null);
    //         } 
    //         else {
    //             //console.log(found,"found obj");
    //             if (found) {
    //                 Agentchat.update(
    //                     { 
    //                         $and : [
    //                             { $or:[ {'socketid1':data.from_socketid}, {'socketid1':data.to_socketid}] },
    //                             { $or:[ {'socketid2':data.from_socketid}, {'socketid2':data.to_socketid}] },
    //                         ]
    //                     },
    //                     { $push: { 
    //                         chatlist:
    //                             {
    //                                 from_id:data.from_id,
    //                                 to_id:data.to_id,
    //                                 fromid:data.fromid,
    //                                 toid:data.toid,
    //                                 fromname:data.fromname,
    //                                 toname:data.toname,
    //                                 msg:data.msg,
    //                                 from_socketid:data.from_socketid,
    //                                 to_socketid:data.to_socketid,
    //                             }

    //                     } }
    //                 ).exec(function (err2, updatefound) {
    //                     if (err2) {
    //                         callback(err2, null);
    //                     } 
    //                     else {
    //                         //console.log(updatefound,"inside update");
    //                         if (updatefound) {
    //                             callback(null, updatefound);
    //                         } else {
    //                             callback({
    //                                 message: "-1"
    //                             }, null);
    //                         }
    //                     }
    //                 });
    //             } else {

    //                 Agentchat.saveData({
    //                     socketid1: data.from_socketid,
    //                     socketid2: data.to_socketid,
    //                     disconnected:false,
    //                     user1:data.from_id,
    //                     user2:data.to_id,
    //                     session_id:data.session_id,
    //                     conversation_id:data.conversation_id,
    //                     context_id:data.context_id,
    //                     contexts:data.chatlist,
    //                     chatlist:[
    //                         {
    //                             from_id:data.from_id,
    //                             to_id:data.to_id,
    //                             fromid:data.fromid,
    //                             toid:data.toid,
    //                             fromname:data.fromname,
    //                             toname:data.toname,
    //                             msg:data.msg,
    //                             from_socketid:data.from_socketid,
    //                             to_socketid:data.to_socketid,
    //                         }
    //                     ]
    //                 },function (err3, savefound) {
    //                     if (err3) {
    //                         callback(err3, null);
    //                     } 
    //                     else {
    //                         if (savefound) {
    //                             //console.log(savefound,"inside update");
    //                             Liveuser.update({

    //                                 email:data.to_id
    //                             },{ $inc: { activecon: 1  }},function (err111, found111) {
    //                                 if (err111) {
    //                                     //callback(err, null);
    //                                     console.log("err incr");
    //                                     callback(null, savefound);
    //                                 } 
    //                                 else {
    //                                     if (found111) {
    //                                         console.log("update done");
    //                                         callback(null, savefound);
    //                                     }
    //                                 }
    //                             });

    //                         } else {
    //                             callback({
    //                                 message: "-1"
    //                             }, null);
    //                         }
    //                     }

    //                 });
    //             }
    //         }
    //     });
    // },
    savechat: function (data, callback) {
        var Liveuser = require("./Liveuser");
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
                //console.log(found,"found obj");
                if (found) {
                    Agentchat.update({
                        // 'user1':data.from_id,
                        // 'user2':data.to_id,
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
                                fromid: data.fromid,
                                toid: data.toid,
                                fromname: data.fromname,
                                toname: data.toname,
                                msg: data.msg,
                                from_socketid: data.from_socketid,
                                to_socketid: data.to_socketid,
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
                } else {

                    Agentchat.saveData({
                        socketid1: data.from_socketid,
                        socketid2: data.to_socketid,
                        disconnected: false,
                        user1: data.from_id,
                        user2: data.to_id,
                        session_id: data.session_id,
                        conversation_id: data.conversation_id,
                        context_id: data.context_id,
                        contexts: data.chatlist,
                        chatlist: [{
                            from_id: data.from_id,
                            to_id: data.to_id,
                            fromid: data.fromid,
                            toid: data.toid,
                            fromname: data.fromname,
                            toname: data.toname,
                            msg: data.msg,
                            from_socketid: data.from_socketid,
                            to_socketid: data.to_socketid,
                        }]
                    }, function (err3, savefound) {
                        if (err3) {
                            callback(err3, null);
                        } else {
                            if (savefound) {
                                //console.log(savefound,"inside update");
                                Liveuser.findOne({
                                    livechat: 1
                                }).sort({
                                    idleid: -1
                                }).limit(1).exec(function (iderr, idfound) {
                                    if (iderr) {
                                        callback(iderr, null);
                                    } else {
                                        if (idfound) {
                                            console.log(idfound.idleid, "max id");
                                            Liveuser.update({
                                                email: data.to_id
                                            }, {
                                                $set: {

                                                    idleid: parseInt(idfound.idleid) + 1,
                                                },
                                                $inc: {
                                                    activecon: 1
                                                }
                                            }, function (err111, found111) {
                                                if (err111) {

                                                    callback(null, savefound);
                                                } else {
                                                    if (found111) {
                                                        callback(null, savefound);
                                                    }
                                                }
                                            });
                                        } else {
                                            callback({
                                                message: "-1"
                                            }, null);
                                        }

                                    }
                                });

                            } else {
                                callback({
                                    message: "-1"
                                }, null);
                            }
                        }

                    });
                }
            }
        });
    },
    getchat: function (data, callback) {
        var Liveuser = require("./Liveuser");

        Agentchat.findOne({
                'user1': data.from_id,
                'disconnected': false
            },

            function (err, found) {
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
    transferchat: function (data, callback) {
        Agentchat.findOne({
            $and: [{
                    $or: [{
                        'socketid1': data.from_socketid
                    }, {
                        'socketid1': data.to_socketid
                    }]
                },
                {
                    $or: [{
                        'socketid2': data.from_socketid
                    }, {
                        'socketid2': data.to_socketid
                    }]
                },
            ]
        }, function (err, found) {
            if (err) {
                callback(err, null);
            } else {
                //console.log(found,"found obj");
                if (found) {
                    Agentchat.update({
                        $and: [{
                                $or: [{
                                    'socketid1': data.from_socketid
                                }, {
                                    'socketid1': data.to_socketid
                                }]
                            },
                            {
                                $or: [{
                                    'socketid2': data.from_socketid
                                }, {
                                    'socketid2': data.to_socketid
                                }]
                            },
                        ]
                    }, {
                        $set: {
                            transfer: 1,
                            transferto: data.to_id
                        }
                    }).exec(function (err2, updatefound) {
                        if (err2) {
                            callback(err2, null);
                        } else {
                            //console.log(updatefound,"inside update");
                            if (updatefound) {
                                callback(null, found);
                            } else {
                                callback({
                                    message: "-1"
                                }, null);
                            }
                        }
                    });
                }
            }
        });
    },

    savefeedback: function (data, callback) {
        Agentchat.findOne({
            // $and: [{
            //         $or: [{
            //             'socketid1': data.from_socketid
            //         }, {
            //             'socketid1': data.to_socketid
            //         }]
            //     },
            //     {
            //         $or: [{
            //             'socketid2': data.from_socketid
            //         }, {
            //             'socketid2': data.to_socketid
            //         }]
            //     },
            // ]
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
                //console.log(found,"found obj");
                if (found) {
                    Agentchat.update({
                        // $and: [{
                        //         $or: [{
                        //             'socketid1': data.from_socketid
                        //         }, {
                        //             'socketid1': data.to_socketid
                        //         }]
                        //     },
                        //     {
                        //         $or: [{
                        //             'socketid2': data.from_socketid
                        //         }, {
                        //             'socketid2': data.to_socketid
                        //         }]
                        //     },
                        // ]
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
                        $set: {
                            dislike: 1,
                            feedback: data.suggestion
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
                // else {
                //     Agentchat.saveData({
                //         socketid1: data.from_socketid,
                //         socketid2: data.to_socketid,
                //         disconnected:false,
                //         user1:data.from_id,
                //         user2:data.to_id,
                //         session_id:data.session_id,
                //         conversation_id:data.conversation_id,
                //         context_id:data.context_id,
                //         contexts:data.chatlist,
                //         chatlist:[
                //             {
                //                 from_id:data.from_id,
                //                 to_id:data.to_id,
                //                 fromid:data.fromid,
                //                 toid:data.toid,
                //                 fromname:data.fromname,
                //                 toname:data.toname,
                //                 msg:data.msg,
                //                 from_socketid:data.from_socketid,
                //                 to_socketid:data.to_socketid,
                //             }
                //         ]
                //     },function (err3, savefound) {
                //         if (err3) {
                //             callback(err3, null);
                //         } 
                //         else {
                //             if (savefound) {
                //                 //console.log(savefound,"inside update");
                //                 callback(null, savefound);
                //             } else {
                //                 callback({
                //                     message: "-1"
                //                 }, null);
                //             }
                //         }

                //     });
                // }
            }
        });
    },
    savelike: function (data, callback) {
        Agentchat.findOne({
            // $and: [{
            //         $or: [{
            //             'socketid1': data.from_socketid
            //         }, {
            //             'socketid1': data.to_socketid
            //         }]
            //     },
            //     {
            //         $or: [{
            //             'socketid2': data.from_socketid
            //         }, {
            //             'socketid2': data.to_socketid
            //         }]
            //     },
            // ]
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
                //console.log(found,"found obj");
                if (found) {
                    Agentchat.update({
                        // $and: [{
                        //         $or: [{
                        //             'socketid1': data.from_socketid
                        //         }, {
                        //             'socketid1': data.to_socketid
                        //         }]
                        //     },
                        //     {
                        //         $or: [{
                        //             'socketid2': data.from_socketid
                        //         }, {
                        //             'socketid2': data.to_socketid
                        //         }]
                        //     },
                        // ]
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
                        $set: {
                            like: 1,

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


            }
        });
    },
    getdashboarddata: function (data, callback) {
        var resobj = {};
        var userfilter = {};

        var filterobj = {};
        var filter2 = {};
        if (data.user) {
            if (data.user != '') {
                userfilter = {
                    user2: data.user
                };
            }
        }
        if (data.fromdate != '') {
            filterobj = {
                "createdAt": {
                    "$gte": new Date(data.fromdate)
                }
            };
        }
        // if(data.date_filter_type=="") {
        //     if(data.fromdata && data.todate) {
        //         if(data.fromdate != "" && data.todate != "")
        //         {
        //             filterobj = {
        //                 "createdAt": {"$gte": new Date(data.fromdate), "$lt": new Date(data.todate)}
        //             };
        //         }
        //     }
        //     else if(data.fromdate)
        //     {
        //         if(data.fromdate != "" )
        //         {
        //             filterobj = {
        //                 "createdAt": {"$gte": new Date(data.fromdate)}
        //             };
        //         }
        //     }   
        //     else if(data.todate)
        //     {
        //         if(data.todate != "" )
        //         {
        //             filterobj = {
        //                 "createdAt": {"$lt": new Date(data.todate)}
        //             };
        //         }
        //     }
        // }
        // else if(data.date_filter_type=="1")
        // {
        //     filterobj = {
        //         "createdAt": {"$gte": new Date(data.date_filter)}
        //     };
        // }
        // else if(data.date_filter_type=="2")
        // {
        //     filterobj = {
        //         "createdAt": {"$gte": new Date(data.date_filter2_fromdate), "$lt": new Date(data.date_filter2_todate)}
        //     };
        // }
        var object3 = extend({}, userfilter, filterobj);
        console.log(object3);
        Agentchat.count(object3, function (err, c) {
            //console.log('Count is ' + c);
            Agentchat.aggregate([{
                    "$match": object3
                },
                {
                    "$project": {
                        "ticketsCount": {
                            "$size": '$chatlist'
                        }
                    }
                },
                {
                    "$group": {
                        "_id": null,
                        "count": {
                            "$sum": "$ticketsCount"
                        }
                    }
                }
            ], function (err, results) {

                //console.log(results);

                Agentchat.aggregate([{
                            "$match": object3
                        },
                        // {
                        //     "$group":  { "_id": "$chatlist.topic" }
                        // },
                        // {
                        //     $group: {
                        //         _id : "count",
                        //         total : {"$sum" : 1}
                        //     }
                        // }
                    ],
                    function (err, results2) {
                        var ccount = c;
                        var icount = 0;
                        if (results.length > 0)
                            icount = results[0].count;
                        var tcount = 0;

                        resobj = {
                            c_count: ccount,
                            i_count: icount,
                            userlist: results2
                        };
                        //console.log(results2);
                        callback(null, resobj);
                    });

            });
        });
    },
    saveofflinefeedback: function (data, callback) {
        var resobj = {};
        var userfilter = {};

        var filterobj = {};
        var filter2 = {};
        if (data.user) {
            if (data.user != '') {
                userfilter = {
                    user2: data.user
                };
            }
        }
        if (data.date_filter_type == "") {
            if (data.fromdata && data.todate) {
                if (data.fromdate != "" && data.todate != "") {
                    filterobj = {
                        "createdAt": {
                            "$gte": new Date(data.fromdate),
                            "$lt": new Date(data.todate)
                        }
                    };
                }
            } else if (data.fromdate) {
                if (data.fromdate != "") {
                    filterobj = {
                        "createdAt": {
                            "$gte": new Date(data.fromdate)
                        }
                    };
                }
            } else if (data.todate) {
                if (data.todate != "") {
                    filterobj = {
                        "createdAt": {
                            "$lt": new Date(data.todate)
                        }
                    };
                }
            }
        } else if (data.date_filter_type == "1") {
            filterobj = {
                "createdAt": {
                    "$gte": new Date(data.date_filter)
                }
            };
        } else if (data.date_filter_type == "2") {
            filterobj = {
                "createdAt": {
                    "$gte": new Date(data.date_filter2_fromdate),
                    "$lt": new Date(data.date_filter2_todate)
                }
            };
        }
        var object3 = extend({}, userfilter, filterobj);
        console.log(object3);
        Agentchat.count(object3, function (err, c) {
            //console.log('Count is ' + c);
            Agentchat.aggregate([{
                    "$match": object3
                },
                {
                    "$project": {
                        "ticketsCount": {
                            "$size": '$chatlist'
                        }
                    }
                },
                {
                    "$group": {
                        "_id": null,
                        "count": {
                            "$sum": "$ticketsCount"
                        }
                    }
                }
            ], function (err, results) {
                var ccount = c;
                var icount = 0;
                if (results.length > 0)
                    icount = results[0].count;
                var tcount = 0;

                resobj = {
                    c_count: ccount,
                    i_count: icount
                };
                //console.log(results2);
                callback(null, resobj);
                //console.log(results);


            });
        });
    },
};
module.exports = _.assign(module.exports, exports, model);