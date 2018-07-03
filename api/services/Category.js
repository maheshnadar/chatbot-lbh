var schema = new Schema({
    name: {
        type: String,
    },
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Category', schema,'category');

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {
    getallcategory: function (reqdata, callback) {
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
    }
};
module.exports = _.assign(module.exports, exports, model);