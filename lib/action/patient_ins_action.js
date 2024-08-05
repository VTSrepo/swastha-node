const { SendResponse } = require('../../common/app_utils');
const { PatientInsModule } = require('../modules/patient_ins_module');
var debug = require('debug')('v2:patientins:actions');

var patientinsModule = new PatientInsModule();
class PatientInsAction {

    createPatientInsHeader(event, context) {      
        var body_data = event.body;
        var query = event.queryParameters;
        validate_data_for_create_patient_ins_header(event.body)       
        .then(function(_response) {
            debug("validate data ", _response);
            return patientinsModule.CreatePatientInsHeader(body_data,  query)
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
    
    createPatientInsDetail(event, context) {      
        var body_data = event.body;
        var query = event.queryParameters;
        validate_data_for_create_patient_ins_detail(event.body)       
        .then(function(_response) {
            debug("validate data ", _response);
            return patientinsModule.CreatePatientInsDetail(body_data,  query)
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

    getPatientInsHeaderList(event, context) {
        var query = event.queryParameters;
        // var patient_id = event.pathParameters.patient_id;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return patientinsModule.getPatientInsHeaderList(query)
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

    getPatientInsDetailList(event, context) {
        var query = event.queryParameters;
        var patient_id = event.pathParameters.patient_id;
        var inv_month = query.filter.inv_month;
        var inv_year = query.filter.inv_year;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return patientinsModule.getPatientInsDetailList(inv_month,inv_year,patient_id,query)
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

    getInsentrystatus(event, context) {
        var query = event.queryParameters;
        
        var inv_month = query.filter.inv_month;
        var inv_year = query.filter.inv_year;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return patientinsModule.getInsentrystatus(inv_month,inv_year,query)
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

    getPatientInsurancereport(event, context) {
        var query = event.queryParameters;
        var body_data = event.body;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return patientinsModule.getPatientInsuranceReportList(body_data,query)
        })
        .then(function(response){
            if(response.hasOwnProperty('status') && (response.status == 404))
            context.done(null, SendResponse(404, response))
            else
            context.done(null, SendResponse(200, response));
        })
        .catch(function(err){
            context.done(null, SendResponse(500, err));
        })
    }
}

function validate_data_for_create_patient_ins_header(consulting_data) {
    return new Promise((resolve, reject) => {
        return resolve(consulting_data)
    })
}

function validate_data_for_create_patient_ins_detail(dialysis_consulting_data) {
    return new Promise((resolve, reject) => {
        return resolve(dialysis_consulting_data)
    })
}

function validate_data(data) {
    return new Promise((resolve, reject) => {
        return resolve(data);
    })
}

module.exports = {
    PatientInsAction,
}