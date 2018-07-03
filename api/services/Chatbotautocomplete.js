var schema = new Schema({
    questions: {
        type: String,
    },
    answers: {
        type: String,
    },
    image_text: {
        type: String,
        default:"",
    },
    image_name: {
        type: String,
        default:"",
    },
    final: {
        type: String,
        default:"",
    },
    topic: {
        type: String,
        default:"",
    },
    nouns: {
        type: String,
        default:"",
    },
    verbs: {
        type: String,
        default:"",
    },
});

schema.plugin(deepPopulate, {
    
});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);

module.exports = mongoose.model('Chatbotautocomplete', schema,'chatbotautocomplete');

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
//new RegExp(searchstring)
//{ $regex: searchstring, $options: 'i' }
var model = {
    getautocomplete: function (data, callback) {
        searchstring=data.string;
        searchstring = "/"+searchstring+"/";
        Chatbotautocomplete.find({
            questions:{ $regex: '.*' + data.string + '.*',$options:"i" }
        }, { answers: 1, questions: 1 }).limit(4).exec(function (err, found) {
            if (err) {
                callback(err, null);
            } 
            else {
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