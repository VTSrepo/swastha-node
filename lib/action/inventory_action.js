const { SendResponse } = require('../../common/app_utils');
const { InventoryModule } = require('../modules/inventory_module');
var debug = require('debug')('v2:users:actions');

var inventoryModule = new InventoryModule();
class InventoryAction {

    createInventoryConfig(event, context) {      
        var body_data = event.body;
        var query = event.queryParameters;
        validate_data(event.body)       
        .then(function(_response) {
            debug("validate data ", _response);
            return inventoryModule.createInventoryConfig(body_data,  query)
        })
        .then(function(response){
            if(response.hasOwnProperty('status') && (response.status == 404))
            context.done(null, SendResponse(401, response))
            else
            context.done(null, SendResponse(200, response));
        })
        .catch(function(err){
            context.done(null, SendResponse(500, err));
        })
    }

    createInventoryProduct(event, context) {      
        var body_data = event.body;
        var query = event.queryParameters;
        validate_data(event.body)       
        .then(function(_response) {
            debug("validate data ", _response);
            return inventoryModule.createInventoryProduct(body_data,  query)
        })
        .then(function(response){
            if(response.hasOwnProperty('status') && (response.status == 404))
            context.done(null, SendResponse(401, response))
            else
            context.done(null, SendResponse(200, response));
        })
        .catch(function(err){
            context.done(null, SendResponse(500, err));
        })
    }

   GetInventoryProducts(event, context) {      
        var source_product_id = event.pathParameters.source_product_id;
        var branch_id = event.pathParameters.branch_id;
        var query = event.queryParameters;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return inventoryModule.GetInventoryProductList(branch_id, source_product_id, query)
        })
        .then(function(response){
            if(response.hasOwnProperty('status') && (response.status == 404))
            context.done(null, SendResponse(401, response))
            else
            context.done(null, SendResponse(200, response));
        })
        .catch(function(err){
            context.done(null, SendResponse(500, err));
        })
    }


    GetInventoryConfigs(event, context) {      
     
        var branch_id = event.pathParameters.branch_id;
        var query = event.queryParameters;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return inventoryModule.GetInventoryConfigList(branch_id, query)
        })
        .then(function(response){
            if(response.hasOwnProperty('status') && (response.status == 404))
            context.done(null, SendResponse(401, response))
            else
            context.done(null, SendResponse(200, response));
        })
        .catch(function(err){
            context.done(null, SendResponse(500, err));
        })
    }
    
}

function validate_data(data) {
    
    return new Promise((resolve, reject) => {
        return resolve(data)
    })
}

module.exports = {
    InventoryAction
}