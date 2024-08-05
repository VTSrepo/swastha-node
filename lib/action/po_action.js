const { SendResponse } = require('../../common/app_utils');
const { PoModule } = require('../modules/po_module');
var debug = require('debug')('v2:billing:actions');

var poModule = new PoModule();
class PoAction {

    createPo(event, context) {      
        var body_data = event.body;
        var query = event.queryParameters;
        validate_data_for_create_po_data(event.body)       
        .then(function(_response) {
            debug("validate data ", _response);
            return poModule.createPoData(body_data,  query)
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


poSubmission(event, context) {      
        var body_data = event.body;
        var query = event.queryParameters;
        validate_data_for_create_po_data(event.body)       
        .then(function(_response) {
            debug("validate data ", _response);
            return poModule.poSubmission(body_data,  query)
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

    GetPoListsByOrgId(event, context) {      
        var org_id = event.pathParameters.org_id;
        var query = event.queryParameters;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return poModule.GetPoListsByOrgId(org_id,  query)
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

    GetPoListsByBranchId(event, context) {      
        var supplier_id = event.pathParameters.supplier_id;
        var branch_id = event.pathParameters.branch_id;
        var query = event.queryParameters;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return poModule.GetPoListsByBranchId(branch_id, supplier_id, query)
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

    GetPoDetail(event, context) {      
        var po_number = event.pathParameters.po_number;
        var query = event.queryParameters;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return poModule.GetPoDetail(po_number,  query)
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
            return poModule.GetSupplierList(org_id, branch_id, query)
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
            return poModule.GetSupplierProductList(branch_id, supplier_id, query)
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

    GetGoodReceiptList(event, context) {      

        var org_id = event.pathParameters.org_id;       
        var branch_id = event.pathParameters.branch_id;
        var supplier_id = event.pathParameters.supplier_id;
        var query = event.queryParameters;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return poModule.GetGoodReceiptList(org_id,branch_id, supplier_id, query)
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

    poGoodsReceipt(event, context) {      
        var body_data = event.body;
        var query = event.queryParameters;
        validate_data_for_create_po_data(event.body)       
        .then(function(_response) {
            debug("validate data ", _response);
            return poModule.poGoodsReceipt(body_data,  query)
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

    GetPoSuppScheduleList(event, context) {      
        var org_id = event.pathParameters.org_id;       
        var branch_id = event.pathParameters.branch_id;
        var supplier_id = event.pathParameters.supplier_id;
        var query = event.queryParameters;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return poModule.GetPoSupplierScheduleList(org_id,branch_id, supplier_id, query)
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

    CreatePoSuppScheduleList(event, context) {      
        var body_data = event.body;
        var query = event.queryParameters;
        validate_data_for_create_po_data(event.body)       
        .then(function(_response) {
            debug("validate data ", _response);
            return poModule.CreatePoSuppScheduleList(body_data,  query)
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

    CreateReceiptsPayments(event, context) {      
        var body_data = event.body;
        var query = event.queryParameters;
        validate_data_for_create_po_data(event.body)       
        .then(function(_response) {
            debug("validate data ", _response);
            return poModule.CreateReceiptsPayments(body_data,  query)
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


    GetReceiptsPayments(event, context) {      
        var org_id = event.pathParameters.org_id;       
        var branch_id = event.pathParameters.branch_id;

        var query = event.queryParameters;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return poModule.GetReceiptsPayments(org_id,branch_id, query)
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


    GetPoSupplierPayments(event, context) {      
        var org_id = event.pathParameters.org_id;       
        var branch_id = event.pathParameters.branch_id;
        var supplier_id = event.pathParameters.supplier_id;
        var query = event.queryParameters;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return poModule.GetPoSupplierPayments(org_id,branch_id,supplier_id, query)
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
    
        GetGoodReceiptReportList(event, context) {
        var org_id = event.pathParameters.org_id;       
        var branch_id = event.pathParameters.branch_id;
        var query = event.queryParameters;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return poModule.GetGoodReceiptReportList(org_id,branch_id, query)
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

    GetSupplierPaymentReportList(event, context) {
        var org_id = event.pathParameters.org_id;       
        var branch_id = event.pathParameters.branch_id;
        var query = event.queryParameters;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return poModule.GetSupplierPaymentReportList(org_id,branch_id, query)
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

    GetPoInvoiceSummaryReportList(event, context) {
        var org_id = event.pathParameters.org_id;       
        var branch_id = event.pathParameters.branch_id;
        var query = event.queryParameters;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return poModule.GetPoInvoiceSummaryReportList(org_id,branch_id, query)
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

function validate_data_for_create_po_data(appointment_data) {
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
    PoAction,
}