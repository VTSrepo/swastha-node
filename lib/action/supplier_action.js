const { SendResponse } = require('../../common/app_utils');
const { SupplierModule } = require('../modules/supplier_module');
var debug = require('debug')('v2:billing:actions');

var supplierModule = new SupplierModule();
class SupplierAction {

    createSupplier(event, context) {      
        var body_data = event.body;
        var query = event.queryParameters;
        validate_data_for_create_supplier_data(event.body)       
        .then(function(_response) {
            debug("validate data ", _response);
            return supplierModule.CreateSupplier(body_data,  query)
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

    GetSupplierListByBranchId(event, context) {      
        var org_id = event.pathParameters.org_id;
        var branch_id = event.pathParameters.branch_id;
        var query = event.queryParameters;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return supplierModule.GetSupplierList(org_id, branch_id, query)
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

    GetSupplierProductList(event, context) {      
        var supplier_id = event.pathParameters.supplier_id;
        var branch_id = event.pathParameters.branch_id;
        var query = event.queryParameters;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return supplierModule.GetSupplierProductList(branch_id, supplier_id, query)
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

    GetSupplierProductpriceByProductId(event, context) {      
        var product_id = event.pathParameters.product_id;
        
        var query = event.queryParameters;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return supplierModule.GetSupplierProductpriceByProductId(product_id, query)
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

    supplierwiseProduct(event, context) {      
        var org_id = event.pathParameters.org_id;
        var branch_id = event.pathParameters.branch_id;

        var query = event.queryParameters;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return supplierModule.supplierwiseProduct(org_id,branch_id, query)
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

    createSupplierProd(event, context) {      
        var body_data = event.body;
        var query = event.queryParameters;
        validate_data_for_create_supplier_data(event.body)       
        .then(function(_response) {
            debug("validate data ", _response);
            return supplierModule.CreateSupplierProducts(body_data,  query)
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

function validate_data_for_create_supplier_data(appointment_data) {
    return new Promise((resolve, reject) => {
        return resolve(appointment_data)
    })
}

function validate_data(data) {
    return new Promise((resolve, reject) => {
        return resolve(data);
    })
}

module.exports = {
    SupplierAction,
}