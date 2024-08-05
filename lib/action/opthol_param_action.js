const { SendResponse } = require('../../common/app_utils');
const { OptholParamModule } = require('../modules/opthol_param_module');
var debug = require('debug')('v2:optholparam:actions');

const optholParamModule = new OptholParamModule();

class OptholParamAction {
    CreateOptholParam(event, context) {
        var query = event.queryParameters;
        var data = event.body;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return optholParamModule.CreateOptholParam(data,  query)
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

    GetOptholParam(event, context) {
        var query = event.queryParameters;
        var org_id = event.pathParameters.org_id;
        var branch_id = event.pathParameters.branch_id;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return optholParamModule.GetOptholParamDetail(org_id, branch_id, query)
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

    CreateOptholSlitlamp(event, context) {
        var query = event.queryParameters;
        var data = event.body;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return optholParamModule.CreateOptholSlitlamp(data,  query)
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

    GetOptholSLitlamp(event, context) {
        var query = event.queryParameters;
        var org_id = event.pathParameters.org_id;
        var branch_id = event.pathParameters.branch_id;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return optholParamModule.GetOptholSlitlamp(org_id, branch_id, query)
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
    OptholParamAction
}