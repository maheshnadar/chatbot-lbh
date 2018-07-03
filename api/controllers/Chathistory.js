var schema = new Schema({
    // Journey_Name: {
    //     type: String,
    // },
    chatlist: {
        type: Array,
    },
    user: {
        type: String,
    },
    session_id: {
       type:Number,
    },
    responsetype :{
        type: String,
    },
    dthyperlink: {
        type:Object
    },
    inputDate : {
        type:Date
    }, 
    outputDate: {
        type:Date
    },
    respdiff : {
        type:Number
    },
    like : {
        type:Number
    },
    dislike : {
        type:Number
    },
	livechat : {
        type:Number
    },
    unanswered:{
        type:Number
    },
    unshandled : {
        type:Number
    },
    conversation_id:{
        type:Number
    }
});

schema.plugin(deepPopulate, {
    
});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);

module.exports = mongoose.model('Chathistory', schema,'chathistory');

var exports = _.cloneDeep(require("sails-wohlig-service")(schema, "chathistory", "chathistory"));
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
    getdashboarddata: function (data, callback) {
        var resobj = {};
        var userfilter = {};
        
        var filterobj = {};
        var filter2 = {};
        if(data.user)
        {
            if(data.user != '')
            {
                userfilter = {
                    user: data.user
                };
            }
        }
        if(data.date_filter_type=="") {
            if(data.fromdata && data.todate) {
                if(data.fromdate != "" && data.todate != "")
                {
                    filterobj = {
                        "createdAt": {"$gte": new Date(data.fromdate), "$lt": new Date(data.todate)}
                    };
                }
            }
            else if(data.fromdate)
            {
                if(data.fromdate != "" )
                {
                    filterobj = {
                        "createdAt": {"$gte": new Date(data.fromdate)}
                    };
                }
            }   
            else if(data.todate)
            {
                if(data.todate != "" )
                {
                    filterobj = {
                        "createdAt": {"$lt": new Date(data.todate)}
                    };
                }
            }
        }
        else if(data.date_filter_type=="1")
        {
            filterobj = {
                "createdAt": {"$gte": new Date(data.date_filter)}
            };
        }
        else if(data.date_filter_type=="2")
        {
            filterobj = {
                "createdAt": {"$gte": new Date(data.date_filter2_fromdate), "$lt": new Date(data.date_filter2_todate)}
            };
        }
        var object3 = extend({}, userfilter, filterobj);
        console.log(object3);
        Chathistory.count(object3, function(err, c) {
            //console.log('Count is ' + c);
            Chathistory.aggregate([
                { "$match": object3 },
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
            ],function(err, results) {
                //console.log(results);
                
                Chathistory.aggregate([ 
                    { "$match": object3 },
                    {
                        "$group":  { "_id": "$chatlist.topic" }
                    },
                    {
                        $group: {
                            _id : "count",
                            total : {"$sum" : 1}
                        }
                    }
                ],
                function(err, results2) {
                    var ccount = c;
                    var icount = 0;
                    if(results.length > 0)
                        icount = results[0].count;
                    var tcount = 0;
                    if(results2.length > 0)
                        tcount = results2[0].total;
                    resobj ={c_count : ccount,i_count:icount,t_count:tcount};
                    //console.log(results2);
                    callback(null,resobj);
                }); 
                
            });
        });
    },
    savehistory: function (data, callback) {
        var dtobject = {};
        var livechat = 0;
        var unanswered=0;
        var unshandled=0;
        var unansview = -1;
		if(data.livechat)
			livechat = 1;
        if(data.responsetype=='DTHyperlink')
        {
            dtobject = {
                Dthlink:data.DTHlink,
                DTHstage:data.DTHstage
            };
        }
        if(data.unanswered)
        {
            unansview=0;
            unanswered=1;
        }
        Chathistory.findOne( {
            session_id:data.session_id,
            user:data.user,
            conversation_id:data.conversation_id
        },function(err,found){
            if (err) {
                callback(err, null);
            } 
            else {
                //console.log(found,"found obj");
                if (found) {
                    Chathistory.update(
                        { 
                            session_id:data.session_id,
                            user:data.user,
                            conversation_id:data.conversation_id
                        },
                        {
							$set:{
                                livechat:livechat,
                                unanswered:unanswered,
                                unshandled:unshandled
							}, 
							$push: { 
								chatlist:
                                {
                                    user_input:data.user_input,
                                    response:data.response,
                                    responsetype:data.responsetype,
                                    dthyperlink:dtobject,
                                    Journey_Name:data.Journey_Name,
                                    topic:data.topic,
                                    inputDate:new Date(data.inputDate),
                                    outputDate:new Date(data.outputDate),
                                    respdiff:data.respdiff,
                                    livechat:livechat,
                                    unanswered:unanswered,
                                    unshandled:unshandled,
                                    context_id:data.context_id,
                                    unansview:unansview
                                }
							} 
						}
                    ).exec(function (err2, updatefound) {
                        if (err2) {
                            callback(err2, null);
                        } 
                        else {
                            console.log(updatefound,"inside update");
                            if (updatefound) {
                                if(unanswered==1)
                                {
                                    var interaction_index=found.chatlist.length-1;
                                    
                                    var uns = require("./Unansweredquestion");
                                    var sessiondata = uns({interaction_index:interaction_index,handleview:0,user:data.user,handle:0,conversationid:found._id,old_question:data.user_input,new_question:"",session_id:data.session_id});
                                    sessiondata.save(function (unserr,unsresult) {

                                    });
                                }
                                callback(null, updatefound);
                            } else {
                                callback({
                                    message: "-1"
                                }, null);
                            }
                        }
                    });
                } else {
                    Chathistory.saveData({
                        // Journey_Name: data.Journey_Name,
                        session_id:data.session_id,
                        user:data.user,
                        livechat:livechat,
                        unanswered:unanswered,
                        unshandled:unshandled,
                        conversation_id:data.conversation_id,
                        chatlist:[
                            {
                                user_input:data.user_input,
                                response:data.response,
                                responsetype:data.responsetype,
                                dthyperlink:dtobject,
                                Journey_Name:data.Journey_Name,
                                topic:data.topic,
                                inputDate:new Date(data.inputDate),
                                outputDate:new Date(data.outputDate),
                                respdiff:data.respdiff,
                                livechat:livechat,
                                unanswered:unanswered,
                                unshandled:unshandled,
                                context_id:data.context_id,
                                unansview:unansview
                            }
                        ]
                    },function (err3, savefound) {
                        if (err3) {
                            callback(err3, null);
                        } 
                        else {
                            if (savefound) {
                                console.log(savefound,"inside save");
                                if(unanswered==1)
                                {
                                    var uns = require("./Unansweredquestion");
                                    var sessiondata = uns({interaction_index:0,handleview:0,user:data.user,handle:0,conversationid:savefound._id,old_question:data.user_input,new_question:"",session_id:data.session_id});
                                    sessiondata.save(function (unserr,unsresult) {

                                    });
                                }
                                callback(null, savefound);
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
    dislike: function (data, callback) {
        var updateobj = { dislike:1 };
        for(var i = 0; i < data.interactions.length ; i++)
        {
            var objstring = 'chatlist.'+parseInt(data.interactions[i])+'.dislike';
            var listobj={};
            var i_ind2 = parseInt(data.interactions[i]);
            var i_ind = 0;
            if(i_ind2 == 1)
                i_ind = i_ind2-1;
            else
                i_ind = i_ind2-2;
            listobj['chatlist.'+i_ind+'.dislike']=1;
            // listobj ={
            //     //objstring:1,
            //     feedback:data.feedback
            // };
            updateobj = extend({}, listobj, updateobj);
            listobj['chatlist.'+i_ind+'.feedback']=data.feedback;
            updateobj = extend({}, listobj, updateobj);
            listobj['chatlist.'+i_ind+'.handle']=0;
            updateobj = extend({}, listobj, updateobj);
            listobj['chatlist.'+i_ind+'.handleview']=0;
            updateobj = extend({}, listobj, updateobj);
        }
        //console.log(updateobj);
        Chathistory.update(
            { 
                session_id:data.session_id,
                user:data.user,
                conversation_id:data.conversation_id
            },
            { 
                $set: updateobj 
            }
        ).exec(function (err, updatefound) {
            if (err) {
                
                callback(err, null);
            } 
            else {
                //console.log(updatefound,"inside update");
                if (updatefound) {
                    Chathistory.findOne( {
                        session_id:data.session_id,
                        user:data.user,
                        conversation_id:data.conversation_id
                    },function(err,datafound){
                        var uns = require("./Feedbackquestion");
						console.log(datafound);
                        var chatlist = datafound.chatlist;
                        //console.log(updatefound);
                        for(var i = 0; i < data.interactions.length ; i++)
                        {
                            var userinput="";
                            var objstring = 'chatlist.'+parseInt(data.interactions[i])+'.dislike';
                            var listobj={};
                            var i_ind2 = parseInt(data.interactions[i]);
                            var i_ind = 0;
                            if(i_ind2 == 1)
                                i_ind = i_ind2-1;
                            else
                                i_ind = i_ind2-2;
                            
                            var dthyperlink = 0;
                            var interaction = chatlist[i_ind];
                            if(interaction.user_input!='')
                            {
                                mainquery=interaction.user_input;
                                userinput=interaction.user_input;
                            }
                            else if(interaction.dthyperlink)
                            {
                                dthyperlink = 1;
                                userinput=interaction.dthyperlink.Dthlink;
                                for(var j = chatlist.length-1; j>0 ;j--)
                                {
                                    if(chatlist[j].user_input !='')
                                        mainquery = chatlist[j].user_input;
                                }
                            }
                            var sessiondata = uns({interaction_index:i_ind,handleview:0,mainquery:mainquery,feedback:data.feedback,user:data.user,handle:0,conversationid:datafound._id,old_question:userinput,dthyperlink:dthyperlink,new_question:"",session_id:data.session_id});
                            sessiondata.save(function (unserr,unsresult) {

                            });
                        }
                        callback(null, updatefound);
                    });
                }
            }
        });
    },
    like: function (data, callback) {
        var updateobj = { like:1 };
        
        Chathistory.update(
            { 
                session_id:data.session_id,
                user:data.user,
                conversation_id:data.conversation_id
            },
            { 
                $set: updateobj 
            }
        ).exec(function (err, updatefound) {
            if (err) {
                callback(err, null);
            } 
            else {
                //console.log(updatefound,"inside update");
                if (updatefound) {
                    callback(null, updatefound);
                }
            }
        });
    },
    getunans: function (data, callback) {
        var updateobj = { like:1 };
        
        Chathistory.find(
            { 
                $and:[{user:data.user}],
                $or:[{
                    "chatlist.unansview":0,
                    "chatlist.unanswered":1
                }],
                $or:[{
                    //"chatlist.handle":0,
                    "chatlist.handleview":0,
                    "chatlist.dislike":1
                }],
            }
        ).sort({createdAt: -1}).exec(function (err, updatefound) {
            if (err) {
                callback(err, null);
            } 
            else {
                //console.log(updatefound,"inside update");
                if (updatefound) {
                    callback(null, updatefound);
                }
            }
        });
    },
    getfeedback: function (data, callback) {
        var updateobj = { dislike:1 };
        
        Chathistory.find(
            { 
                $and:[{user:data.user}],
                $or:[{
                    "chatlist.handle":0,
                    "chatlist.handleview":0,
                    "chatlist.dislike":1
                }],
            }
        ).sort({createdAt: -1}).exec(function (err, updatefound) {
            if (err) {
                callback(err, null);
            } 
            else {
                //console.log(updatefound,"inside update");
                if (updatefound) {
                    callback(null, updatefound);
                }
            }
        });
    },
};
module.exports = _.assign(module.exports, exports, model);