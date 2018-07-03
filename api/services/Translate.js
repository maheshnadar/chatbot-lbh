var schema = new Schema({
    
});

//schema.plugin(deepPopulate, {});
// schema.plugin(uniqueValidator);
// schema.plugin(timestamps);
//module.exports = mongoose.model('category', schema,'category');

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {
    translate: function (reqdata, callback) {
        const translate = require('google-translate-api');
        //console.log(reqdata);
        translate(reqdata.text, {from: 'en', to: reqdata.language}).then(res => {
            //console.log(res.text);
            callback(null, res.text);
            //=> Ik spreek Nederlands! 
            // console.log(res.from.text.autoCorrected);
            // //=> true 
            // console.log(res.from.text.value);
            // //=> I [speak] Dutch! 
            // console.log(res.from.text.didYouMean);
            // //=> false 
        }).catch(err => {
            //console.error(err);
        });
    },
    translatelink: function (reqdata, callback) {
        const translate = require('google-translate-api');
        //console.log(reqdata);
        var async = require('async');
        var linkdata= "";
        var key = 0;
        async.each(reqdata.items,
            // 2nd param is the function that each item is passed to
            function(item, eachCallback){
                // Call an asynchronous function, often a save() to DB
                    // Async call is done, alert via callback
                    if(reqdata.language == "en")
                    {
                        var dummy = "id='"+key+"' data-id='"+reqdata.arr_index+"' ng-click='pushPortalLink("+reqdata.arr_index+","+key+");'";
                        linkdata += "<p class='portalapp' "+dummy+">"+item+"</p>";
                        key++;
                        eachCallback();
                    }
                    else
                    {
                        translate(item, {from: 'en', to: reqdata.language}).then(res => {
                            //console.log(res.text);
                            var translated=res.text;
                            console.log(reqdata.language);
                                translated = translated.replace("<a href=\"#\"> IN", "<a href=\"#\"> ION", "g");
                                var dummy = "id='"+key+"' data-id='"+reqdata.arr_index+"' ng-click='pushPortalLink("+reqdata.arr_index+","+key+");'";
                                linkdata += "<p class='portalapp' "+dummy+">"+translated+"</p>";
                            key++;
                            eachCallback();
                            //console.log(linkdata);
                            //callback(null,{linkdata:linkdata,key:key});
                            //=> Ik spreek Nederlands! 
                            // console.log(res.from.text.autoCorrected);
                            // //=> true 
                            // console.log(res.from.text.value);
                            // //=> I [speak] Dutch! 
                            // console.log(res.from.text.didYouMean);
                            // //=> false 
                        }).catch(err => {
                            //console.error(err);
                        });
                    }
            },
            // 3rd param is the function to call when everything's done
            function(err){
                // All tasks are done now
                if(err) {}
                else
                    callback(null,{linkdata:linkdata,key:key});
            }
        );

        
    }
};
module.exports = _.assign(module.exports, exports, model);