var schema = new Schema({
    conversationid: {
        type: Schema.Types.ObjectId,
    },
    user: {
        type: String,
    },
    old_question: {
        type: String,
    },
    new_question: {
        type: String,
    },
    ip_address: {
        type: String,
    },
    conversation_id:{
        type:Number
    },
    session_id:{
        type:Number
    },
    handle: {
        type:Number
    },
    dthyperlink:{
        type:Number
    },
    feedback:{
        type:String
    },
    mainquery:{
        type:String
    },
    byuser:{
        type:String
    },
    handleview:{
        type:Number
    },
    interaction_index:{
        type:Number
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
function extend(target) {
    var sources = [].slice.call(arguments, 1);
    sources.forEach(function (source) {
        for (var prop in source) {
            target[prop] = source[prop];
        }
    });
    return target;
}
module.exports = mongoose.model('Feedbackquestion', schema,'Feedbackquestion');

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {
    getfeedback: function (data, callback) {
        var updateobj = { like:1 };
        
        Feedbackquestion.find(
            { 
                user:data.user,
                handleview:0
                // handle:0
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
    readfeedbackcount: function (data, callback) {
        
        Feedbackquestion.count({
            user:data.user,
            handleview:1
        }, function(err, found)  {
            if (err) {
                callback(err, null);
            } 
            else {
                found2 = found;
                //var Journey_Data = JSON.parse(found.Journey_Data);
                callback(null,{count: found});
                
            }

        });
    },
    readfeedbackq:function (data, callback) {
        
        Feedbackquestion.update(
            { 
                _id:data.id,
            },
            {
                $set:{
                    handleview:1
                }, 
            }
        ).exec(function (err, found)  {
            if (err) {
                callback(err, null);
            } 
            else {
                found2 = found;
                var uns = require("./Chathistory");
                
                var listobj ={};
                listobj['chatlist.'+data.interaction_index+'.handleview']=1;
                var updateobj ={};
                updateobj = extend({}, listobj, updateobj);
                
                uns.update({_id:data.convid},{ $set:updateobj},{ multi: false },function (unserr,unsresult) {
                  
                    callback(null,found);
                });
                
                
            }

        });
    },
};
module.exports = _.assign(module.exports, exports, model);