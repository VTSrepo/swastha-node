const { SendResponse } = require('../../common/app_utils');
const { PatientModule } = require('../modules/patient_module');
var debug = require('debug')('v2:patients:actions');

var patientModule = new PatientModule();
class PatientAction {

    CreatePatients(event, context) {      
        var body_data = event.body;
        var query = event.queryParameters;
        validate_data(event.body)       
        .then(function(_response) {
            debug("validate data ", _response);
            return patientModule.createPatient(body_data,  query)
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

    GetPatients(event, context) {      
        var branch_id = event.pathParameters.branch_id;
        var query = event.queryParameters;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return patientModule.getPatient(branch_id,  query)
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

    UpdatePatient(event, context) {      
        var body_data = event.body;
        var query = event.queryParameters;
        var patient_id = event.pathParameters.patient_id;
        validate_data(event.body)       
        .then(function(_response) {
            debug("validate data ", _response);
            return patientModule.updatePatient(body_data, patient_id, query)
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

    // Patient Schedule (Create/Update)

    CreateSchedule(event, context) {      
        var body_data = event.body;
        var query = event.queryParameters;
        validate_data(event.body)       
        .then(function(_response) {
            debug("validate data ", _response);
            return patientModule.createSchedule(body_data,  query)
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

    GetScheduleList(event, context) {      

        var org_id = event.pathParameters.org_id;       
        var branch_id = event.pathParameters.branch_id;
        var patient_id = event.pathParameters.patient_id;
        var query = event.queryParameters;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return patientModule.GetSchedulesList(org_id,branch_id, patient_id, query)
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


    getScheduleByMonth(event, context) {
        var query = event.queryParameters;
        var patient_id = event.pathParameters.patient_id;
        var branch_id = event.pathParameters.branch_id;
        var bu_id = query.filter.bu_id;
        var month = query.filter.month;
        var year = query.filter.year;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return patientModule.GetSchedulesListByMonth(branch_id,patient_id,bu_id,month,year, query)
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
    GetFileList(event, context) {      

        var org_id = event.pathParameters.org_id;       
        var branch_id = event.pathParameters.branch_id;
        var patient_id = event.pathParameters.patient_id;
        var query = event.queryParameters;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return patientModule.GetFileList(org_id,branch_id, patient_id, query)
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


    
    GetPatientReportList(event, context) {      

        var org_id = event.pathParameters.org_id;       
        var branch_id = event.pathParameters.branch_id;
        var patient_id = event.pathParameters.patient_id;
        var query = event.queryParameters;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return patientModule.GetPatientReportList(org_id,branch_id, patient_id, query)
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
    GetD0004PatientReportList(event, context) {      

        var org_id = event.pathParameters.org_id;       
        var branch_id = event.pathParameters.branch_id;
        var patient_id = event.pathParameters.patient_id;
        var query = event.queryParameters;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return patientModule.GetD0004PatientReportList(org_id,branch_id, patient_id, query)
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

    GetD0002PatientReportList(event, context) {      

        var org_id = event.pathParameters.org_id;       
        var branch_id = event.pathParameters.branch_id;
        var patient_id = event.pathParameters.patient_id;
        var query = event.queryParameters;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return patientModule.GetD0002PatientReportList(org_id,branch_id, patient_id, query)
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
    
    FetchPatientSchedule(event, context) {
        var query = event.queryParameters;
        var org_id = event.pathParameters.org_id;
        var branch_id = event.pathParameters.branch_id;

        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
           
            return patientModule.FetchPatientSchedule(org_id,branch_id, query)
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


function validate_data_create_patients(patiendata) {
    return new Promise((resolve, reject) => {
        debug("patiendata :", patiendata)
        if ((!patiendata.hasOwnProperty('patient_name'))) {
            var err_response = { status: 404, code: 4004, message: "Please Enter Patient Name.", developerMessage: 'Please Enter Patient Name.' };
            return reject(err_response);
        }
        /* else if ((!patiendata.hasOwnProperty('patient_photo'))) {
            var err_response = { status: 404, code: 4004, message: "Please Enter Patient Photo.", developerMessage: 'Please Enter Patient Photo.' };
            return reject(err_response);
        } 
        else if ((!patiendata.hasOwnProperty('dob'))) {
            var err_response = { status: 404, code: 4004, message: "Please Enter Patient DOB.", developerMessage: 'Please Enter Patient DOB..' };
            return reject(err_response);
        }*/
        else if ((!patiendata.hasOwnProperty('sex'))) {
            var err_response = { status: 404, code: 4004, message: "Please Enter Patient sex.", developerMessage: 'Please Enter Patient sex..' };
            return reject(err_response);
        }
        else if ((!patiendata.hasOwnProperty('mobile_no'))) {
            var err_response = { status: 404, code: 4004, message: "Please Enter Patient MobileNo.", developerMessage: 'Please Enter Patient MobileNo..' };
            return reject(err_response);
        }
        else if ((!patiendata.hasOwnProperty('address'))) {
            var err_response = { status: 404, code: 4004, message: "Please Enter Patient address.", developerMessage: 'Please Enter Patient address..' };
            return reject(err_response);
        }
        /* else if ((!patiendata.hasOwnProperty('email_id'))) {
            var err_response = { status: 404, code: 4004, message: "Please Enter Patient EmailId.", developerMessage: 'Please Enter Patient EmailId..' };
            return reject(err_response);
        }
        
        else if ((!patiendata.hasOwnProperty('communicate_address'))) {
            var err_response = { status: 404, code: 4004, message: "Please Enter Patient Communicate Address.", developerMessage: 'Please Enter Patient Communicate Address..' };
            return reject(err_response);
        }
        else if ((!patiendata.hasOwnProperty('first_visit_date'))) {
            var err_response = { status: 404, code: 4004, message: "Please Enter Patient First visit date.", developerMessage: 'Please Enter Patient First visit date..' };
            return reject(err_response);
        } */
        else if ((!patiendata.hasOwnProperty('user_id'))) {
            var err_response = { status: 404, code: 4004, message: "Please Enter user_id.", developerMessage: 'Please Enter user_id..' };
            return reject(err_response);
        }
        else if ((!patiendata.hasOwnProperty('branch_id'))) {
            var err_response = { status: 404, code: 4004, message: "Please Enter branch_id.", developerMessage: 'Please Enter branch_id..' };
            return reject(err_response);
        }
        else if ((!patiendata.hasOwnProperty('org_id'))) {
            var err_response = { status: 404, code: 4004, message: "Please Enter org_id.", developerMessage: 'Please Enter org_id..' };
            return reject(err_response);
        }
        else{
            return resolve(patiendata)
        }
    })
}

function validate_data_update_patient(patiendata) {
    return new Promise((resolve, reject) => {
        debug("patiendata :", patiendata)
        if ((!patiendata.hasOwnProperty('branch_id'))) {
            var err_response = { status: 404, code: 4004, message: "Please Enter branch_id.", developerMessage: 'Please Enter branch_id..' };
            return reject(err_response);
        }
        else if ((!patiendata.hasOwnProperty('org_id'))) {
            var err_response = { status: 404, code: 4004, message: "Please Enter org_id.", developerMessage: 'Please Enter org_id..' };
            return reject(err_response);
        }
        else{
            return resolve(patiendata)
        }
    })
}

function validate_data(data) {
    return new Promise((resolve, reject) => {
        return resolve(data);
    })
}
function validate_data_create_patient_scedule(patiendata) {
    return new Promise((resolve, reject) => {
        debug("patiendata :", patiendata)
        if ((!patiendata.hasOwnProperty('patient_name'))) {
            var err_response = { status: 404, code: 4004, message: "Please Enter Patient Name.", developerMessage: 'Please Enter Patient Name.' };
            return reject(err_response);
        }
        /* else if ((!patiendata.hasOwnProperty('patient_photo'))) {
            var err_response = { status: 404, code: 4004, message: "Please Enter Patient Photo.", developerMessage: 'Please Enter Patient Photo.' };
            return reject(err_response);
        } 
        else if ((!patiendata.hasOwnProperty('dob'))) {
            var err_response = { status: 404, code: 4004, message: "Please Enter Patient DOB.", developerMessage: 'Please Enter Patient DOB..' };
            return reject(err_response);
        }*/
        else if ((!patiendata.hasOwnProperty('sex'))) {
            var err_response = { status: 404, code: 4004, message: "Please Enter Patient sex.", developerMessage: 'Please Enter Patient sex..' };
            return reject(err_response);
        }
        else if ((!patiendata.hasOwnProperty('mobile_no'))) {
            var err_response = { status: 404, code: 4004, message: "Please Enter Patient MobileNo.", developerMessage: 'Please Enter Patient MobileNo..' };
            return reject(err_response);
        }
        else if ((!patiendata.hasOwnProperty('address'))) {
            var err_response = { status: 404, code: 4004, message: "Please Enter Patient address.", developerMessage: 'Please Enter Patient address..' };
            return reject(err_response);
        }
        /* else if ((!patiendata.hasOwnProperty('email_id'))) {
            var err_response = { status: 404, code: 4004, message: "Please Enter Patient EmailId.", developerMessage: 'Please Enter Patient EmailId..' };
            return reject(err_response);
        }
        
        else if ((!patiendata.hasOwnProperty('communicate_address'))) {
            var err_response = { status: 404, code: 4004, message: "Please Enter Patient Communicate Address.", developerMessage: 'Please Enter Patient Communicate Address..' };
            return reject(err_response);
        }
        else if ((!patiendata.hasOwnProperty('first_visit_date'))) {
            var err_response = { status: 404, code: 4004, message: "Please Enter Patient First visit date.", developerMessage: 'Please Enter Patient First visit date..' };
            return reject(err_response);
        } */
        else if ((!patiendata.hasOwnProperty('user_id'))) {
            var err_response = { status: 404, code: 4004, message: "Please Enter user_id.", developerMessage: 'Please Enter user_id..' };
            return reject(err_response);
        }
        else if ((!patiendata.hasOwnProperty('branch_id'))) {
            var err_response = { status: 404, code: 4004, message: "Please Enter branch_id.", developerMessage: 'Please Enter branch_id..' };
            return reject(err_response);
        }
        else if ((!patiendata.hasOwnProperty('org_id'))) {
            var err_response = { status: 404, code: 4004, message: "Please Enter org_id.", developerMessage: 'Please Enter org_id..' };
            return reject(err_response);
        }
        else{
            return resolve(patiendata)
        }
    })
}

function validate_data(data) {
    return new Promise((resolve, reject) => {
        return resolve(data);
    })
}
module.exports = {
    PatientAction,
}