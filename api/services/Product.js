var schema = new Schema({
    name: {
        type: String,
    },
    image_name: {
        type: String,
    },
    details: {
        type: String,
    },
    URL: {
        type: String,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
    },
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Product', schema,'product');

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {
    getproductbycategory: function (reqdata, callback) {
        var Model = this;
        console.log(reqdata.category);
        Model.find({
            category:reqdata.category,
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