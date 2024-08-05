const { SendResponse } = require('../../common/app_utils');
const { DoctorModule } = require('../modules/doctor_module');
var debug = require('debug')('v2:doctors:actions');

var doctorModule = new DoctorModule();
class DoctorAction {


    createDoctor(event, context) {      
        var body_data = event.body;
        var query = event.queryParameters;
        validate_data_for_create_doctor_data(event.body)       
        .then(function(_response) {
            debug("validate data ", _response);
            return doctorModule.CreateDoctor(body_data,  query)
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
    GetDoctors(event, context) {      
        var branch_id = event.pathParameters.branch_id;
        var query = event.queryParameters;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return doctorModule.getDoctor(branch_id,  query)
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

    GetDoctorDetail(event, context) {      
        var doctor_id = event.pathParameters.doctor_id;
        var query = event.queryParameters;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return doctorModule.GetDoctorDetail(doctor_id,  query)
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
    FetchBranchDept(event, context) {      
        var org_id = event.pathParameters.org_id;
        var branch_id = event.pathParameters.branch_id;

        var query = event.queryParameters;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return doctorModule.FetchBranchDept(org_id, branch_id, query)
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
    FetchDeptDoctor(event, context) {      
        var org_id = event.pathParameters.org_id;
        var branch_id = event.pathParameters.branch_id;
        var dept_id = event.pathParameters.dept_id;

        var query = event.queryParameters;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return doctorModule.FetchDeptDoctor(org_id, branch_id, dept_id, query)
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
function validate_data_for_create_doctor_data(doctor_data) {
    return new Promise((resolve, reject) => {
        return resolve(doctor_data)
    })
}

function validate_data(data) {
    return new Promise((resolve, reject) => {
        return resolve(data);
    })
}
module.exports = {
    DoctorAction,
}