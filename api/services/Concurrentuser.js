var schema = new Schema({
    count: {
        type:Number,
    }
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Concurrentuser', schema,'concurrentuser');

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {
    
};
module.exports = _.assign(module.exports, exports, model);