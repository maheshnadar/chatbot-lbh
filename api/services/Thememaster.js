var schema = new Schema({
    themecolor: {
        type: String,
    },
    bubblebg: {
        type: String,
    },
    bubbletextcolor: {
        type: String,
    },
    botimg:{
        type: String,
    },
    userimg:{
        type: String,
    }
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Thememaster', schema,'thememasters');

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {
    getthemeconfig: function (reqdata, callback) {
        var Model = this;
        //console.log(reqdata.category);
        Model.findOne({
            
        }).limit(1).exec(function (err, data) {
            if (err) {
                //console.log(err);
                callback(err, null);
            } else {
                //console.log(data,"data");
               
                callback(err, data);
            }
        });
    }
};
module.exports = _.assign(module.exports, exports, model);