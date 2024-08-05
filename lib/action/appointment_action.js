const { SendResponse } = require('../../common/app_utils');
const { AppointmentModule } = require('../modules/appointment_module');
var debug = require('debug')('v2:appoint:actions');

var apointmentModule = new AppointmentModule();
class AppointmentAction {

    BookAppointments(event, context) {      
        var body_data = event.body;
        var query = event.queryParameters;
        validate_data_appointment_booking(event.body)       
        .then(function(_response) {
            debug("validate data ", _response);
            return apointmentModule.appointmentBooking(body_data,  query)
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

    UpdateAppointment(event, context) {      
        var body_data = event.body;
        var appoint_id = event.pathParameters.appoint_id;
        var query = event.queryParameters;
        validate_data_update_appointment_booking(event.body)       
        .then(function(_response) {
            debug("validate data ", _response);
            return apointmentModule.UpdateAppointment(body_data, appoint_id, query)
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

    GetAppointments(event, context) {      
        var branch_id = event.pathParameters.branch_id;
        var query = event.queryParameters;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return apointmentModule.getAppoitments(branch_id,  query)
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

    GetAppointment(event, context) {      
        var appointment_id = event.pathParameters.appointment_id;
        var query = event.queryParameters;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return apointmentModule.getAppointment(appointment_id,  query)
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

function validate_data_appointment_booking(appointment_data) {
    return new Promise((resolve, reject) => {
        debug("appointment_data :", appointment_data)
        if ((!appointment_data.hasOwnProperty('phone_no'))) {
            var err_response = { status: 404, code: 4004, message: "Please Enter Patient  Phone No.", developerMessage: 'Please Enter Patient Phone No..' };
            return reject(err_response);
        }
        // else if ((!appointment_data.hasOwnProperty('doctor_id'))) {
        //     var err_response = { status: 404, code: 4004, message: "Please Select Doctor Id.", developerMessage: 'Please Select Doctor Id.' };
        //     return reject(err_response);
        // }
       /* else if ((!appointment_data.hasOwnProperty('ailment'))) {
            var err_response = { status: 404, code: 4004, message: "Please Enter the Name of the Diseases.", developerMessage: 'Please Enter the Name of the Diseases.' };
            return reject(err_response);
        }*/
        else if ((!appointment_data.hasOwnProperty('appoint_date'))) {
            var err_response = { status: 404, code: 4004, message: "Please Enter the Appointment Date.", developerMessage: 'Please Enter the Appointment Date..' };
            return reject(err_response);
        }
        else if ((!appointment_data.hasOwnProperty('branch_id'))) {
            var err_response = { status: 404, code: 4004, message: "Please Enter branch_id.", developerMessage: 'Please Enter branch_id..' };
            return reject(err_response);
        }
        else if ((!appointment_data.hasOwnProperty('org_id'))) {
            var err_response = { status: 404, code: 4004, message: "Please Enter org_id.", developerMessage: 'Please Enter org_id..' };
            return reject(err_response);
        }
        else if ((!appointment_data.hasOwnProperty('patient_name'))) {
            var err_response = { status: 404, code: 4004, message: "Please Enter patient_name.", developerMessage: 'Please Enter patient_name..' };
            return reject(err_response);
        }
        else{
            return resolve(appointment_data)
        }
    })
}

function validate_data_update_appointment_booking(appointment_data) {
    return new Promise((resolve, reject) => {
        debug("appointment_data :", appointment_data)
       
        //  if ((!appointment_data.hasOwnProperty('patient_id'))) {
        //     var err_response = { status: 404, code: 4004, message: "Please Select Patient Id.", developerMessage: 'Please Select Patient Id.' };
        //     return reject(err_response);
        // }
        //  if ((!appointment_data.hasOwnProperty('branch_id'))) {
        //     var err_response = { status: 404, code: 4004, message: "Please Enter branch_id.", developerMessage: 'Please Enter branch_id..' };
        //     return reject(err_response);
        // }
        // else{
            return resolve(appointment_data)
       // }
    })
}

function validate_data(data) {
    return new Promise((resolve, reject) => {
        return resolve(data);
    })
}
module.exports = {
    AppointmentAction,
}