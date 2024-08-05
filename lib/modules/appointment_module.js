const { AppointmentDao } = require('../dao/appointment_dao');
const { PatientDao } = require('../dao/patient_dao');
var debug = require('debug')('v2:appoint:module');
const {changeLog} = require('../../common/error_handling');
var moment = require('moment-timezone');
const { GetRandomPatientID } = require('../../common/app_utils');

function generateParamString(query) {
    var key;
    var keys = new Array();
    var values = new Array();

    for (key in query.filter) {
        if (query.filter.hasOwnProperty(key)) {
            keys.push(key);
            values.push(query.filter[key])
        }
    }
    var strParams = '';

    for (i = 0; i < keys.length; i++) {
        var str = (keys.length - 1 != i) ? ' && ' : '';
        strParams += keys[i] + '=' + values[i] + str

    }
    // console.log('Parameters for query :',strParams)
    return strParams;
}

function generateSortOrder(query) {
    var key;
    var keys = new Array();
    var values = new Array();

    for (key in query.sort) {
        if (query.sort.hasOwnProperty(key)) {
            keys.push(key);
            values.push(query.sort[key])
        }
    }
    var strSortParams = ' ORDER BY ';

    for (i = 0; i < keys.length; i++) {
        var order = (values[i] == '-1') ? 'DESC' : 'ASC';
        var str = (keys.length - 1 != i) ? ', ' : '';
        strSortParams += keys[i] + ' ' + order + str
    }

    // console.log('Parameters for Sorting :',strSortParams)
    return strSortParams;
}

class AppointmentModule {

    appointmentBooking(data,  query) {
        return new Promise(async (resolve, reject) => {
            var appointmentDao = new AppointmentDao();
            var patientDao = new PatientDao();
            var read_connection = null;
            var set_patient_appointment, get_patient, error_code, user_data_appointment, response;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD HH:mm:ss");
            try {
                read_connection = await appointmentDao.getReadConnection();
                if(data.hasOwnProperty('patient_id') && data.patient_id !='') {
                    get_patient = await patientDao.getPatientId(read_connection, data.patient_id);
                    if(get_patient.hasOwnProperty('status') && get_patient.status == 404) {
                        error_code = { status: 404, code: 4001, message: "Sorry, Patient Not Found!.", developerMessage: "Sorry, Patient Not Found!." };
                        if (read_connection) {
                            await appointmentDao.releaseReadConnection(read_connection);
                        }
                        return resolve(error_code)
                    }  else{ 
                        user_data_appointment = await categories_data_to_schema_patient_appointment_data(read_connection, data, date);
                        set_patient_appointment = await appointmentDao.createPatientAppointment(read_connection, user_data_appointment);
                        response = { patient: user_data_appointment };
                        if (read_connection) {
                            await appointmentDao.releaseReadConnection(read_connection);
                        }
                        return resolve(response);
                    }
                }
                else {
                    data.patient_id=null;
                    user_data_appointment = await categories_data_to_schema_patient_appointment_data(read_connection, data, date);
                    set_patient_appointment = await appointmentDao.createPatientAppointment(read_connection, user_data_appointment);
                    response = { appoint: user_data_appointment };
                    if (read_connection) {
                        await appointmentDao.releaseReadConnection(read_connection);
                    }
                    return resolve(response);
                }
            }
            catch (error) {
                if (read_connection) {
                    await appointmentDao.releaseReadConnection(read_connection);
                }
                return reject(error)
            }
        })
    }

    getAppointment(appointment_id, query) {
        return new Promise(async(resolve, reject) => {
            var appointmentDao = new AppointmentDao();
            var connection = null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD HH:mm:ss");
            var get_appointment;
            
            try {
                connection = await appointmentDao.getReadConnection();
                get_appointment = await appointmentDao.getAppointmentDetailById(connection, appointment_id);
                if(get_appointment.hasOwnProperty('status') && get_appointment.status == 404) {
                    if (connection) {
                        await appointmentDao.releaseReadConnection(connection);
                    }
                    return resolve(get_appointment);
                }
                else{
                    if (connection) {
                        await appointmentDao.releaseReadConnection(connection);
                    }
                    return resolve(get_appointment)
                }
            }
            catch(error) {
                if (connection) {
                    await appointmentDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }

    getAppoitments(branch_id, query) {
        return new Promise(async(resolve, reject) => {
            var appointmentDao = new AppointmentDao();
            var connection = null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD HH:mm:ss");
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
            var get_patient, get_patient_count, results;
            try {
                connection = await appointmentDao.getReadConnection();
                debug("query.filter", query)
                if(query.filter.hasOwnProperty('phone_no')) {
                    get_patient = await appointmentDao.getAppointmentMobileByBranchId(connection, query.filter.phone_no, branch_id);
                    if(get_patient.hasOwnProperty('status') && get_patient.status == 404) {
                        if (connection) {
                            await appointmentDao.releaseReadConnection(connection);
                        }
                        return resolve(get_patient);
                    }
                    else{
                        get_patient_count = await appointmentDao.getCountAppointmentMobileByBranchId(connection, query.filter.phone_no, branch_id);

                        var total_size = get_patient_count;
                        var page_size = query.skip ? query.skip : get_patient_count;
                        var result_size = strLimit;
                        console.log("Totalsize :", total_size);
                        var summary = {
                            filteredsize: page_size, resultsize: result_size, totalsize: total_size
                        };
                        var res = {
                            summary, results: get_patient
                        }
                        if (connection) {
                            await appointmentDao.releaseReadConnection(connection);
                        }
                        return resolve(res)
                    }
                }
                else if(query.filter.hasOwnProperty('patient_id')) {
                    get_patient = await appointmentDao.getAppointmentPatientByBranchId(connection, query.filter.patient_id, branch_id);
                    if(get_patient.hasOwnProperty('status') && get_patient.status == 404) {
                        if (connection) {
                            await appointmentDao.releaseReadConnection(connection);
                        }
                        return resolve(get_patient);
                    }
                    else{
                        get_patient_count = await appointmentDao.getCountAppointmentPatientByBranchId(connection, query.filter.patient_id, branch_id);

                        var total_size = get_patient_count;
                        var page_size = query.skip ? query.skip : get_patient_count;
                        var result_size = strLimit;
                        console.log("Totalsize :", total_size);
                        var summary = {
                            filteredsize: page_size, resultsize: result_size, totalsize: total_size
                        };
                        var res = {
                            summary, results: get_patient
                        }
                        if (connection) {
                            await appointmentDao.releaseReadConnection(connection);
                        }
                        return resolve(res)
                    }
                }
                else if(query.filter.hasOwnProperty('doctor_id')) {
                    get_patient = await appointmentDao.getAppointmentDoctorByBranchId(connection, query.filter.doctor_id, branch_id);
                    if(get_patient.hasOwnProperty('status') && get_patient.status == 404) {
                        if (connection) {
                            await appointmentDao.releaseReadConnection(connection);
                        }
                        return resolve(get_patient);
                    }
                    else{
                        get_patient_count = await appointmentDao.getCountAppointmentDoctorByBranchId(connection, query.filter.doctor_id, branch_id);

                        var total_size = get_patient_count;
                        var page_size = query.skip ? query.skip : get_patient_count;
                        var result_size = strLimit;
                        console.log("Totalsize :", total_size);
                        var summary = {
                            filteredsize: page_size, resultsize: result_size, totalsize: total_size
                        };
                        var res = {
                            summary, results: get_patient
                        }
                        if (connection) {
                            await appointmentDao.releaseReadConnection(connection);
                        }
                        return resolve(res)
                    }
                }
                else if(query.filter.hasOwnProperty('appoint_date')) {
                    var appoint_date = moment(query.filter.appoint_date).utc().format("YYYY-MM-DD");
                    get_patient = await appointmentDao.getAppointmentAppointDateByBranchId(connection, appoint_date, branch_id);
                    if(get_patient.hasOwnProperty('status') && get_patient.status == 404) {
                        if (connection) {
                            await appointmentDao.releaseReadConnection(connection);
                        }
                        return resolve(get_patient);
                    }
                    else{
                        get_patient_count = await appointmentDao.getCountAppointmentAppointDateByBranchId(connection, appoint_date, branch_id);

                        var total_size = get_patient_count;
                        var page_size = query.skip ? query.skip : get_patient_count;
                        var result_size = strLimit;
                        console.log("Totalsize :", total_size);
                        var summary = {
                            filteredsize: page_size, resultsize: result_size, totalsize: total_size
                        };
                        var res = {
                            summary, results: get_patient
                        }
                        if (connection) {
                            await appointmentDao.releaseReadConnection(connection);
                        }
                        return resolve(res)
                    }
                }
                else{
                    get_patient = await appointmentDao.getAppointmentListbyBranchId(connection, branch_id);
                    if(get_patient.hasOwnProperty('status') && get_patient.status == 404) {
                        if (connection) {
                            await appointmentDao.releaseReadConnection(connection);
                        }
                        return resolve(get_patient);
                    }
                    else{
                        get_patient_count = await appointmentDao.getCountAppointmentbyBranchId(connection, branch_id);

                        var total_size = get_patient_count;
                        var page_size = query.skip ? query.skip : get_patient_count;
                        var result_size = strLimit;
                        console.log("Totalsize :", total_size);
                        var summary = {
                            filteredsize: page_size, resultsize: result_size, totalsize: total_size
                        };
                        var res = {
                            summary, results: get_patient
                        }
                        if (connection) {
                            await appointmentDao.releaseReadConnection(connection);
                        }
                        return resolve(res)
                    }
                }
            }
            catch(error) {
                if (connection) {
                    await appointmentDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }

    UpdateAppointment(data, appoint_id, query) {
        return new Promise(async (resolve, reject) => {
            var appointmentDao = new AppointmentDao();
            var read_connection = null;
            var update_patient_appointment, get_appoint, update_appointment, response;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD HH:mm:ss");
            try {
                read_connection = await appointmentDao.getReadConnection();
                get_appoint = await appointmentDao.getAppointmentDetailById(read_connection, appoint_id);
                if(get_appoint.hasOwnProperty('status') && get_appoint.status == 404) {
                    if (read_connection) {
                        await appointmentDao.releaseReadConnection(read_connection);
                    }
                    return resolve(get_appoint);
                }
                else{
                    update_appointment = await categories_data_to_schema_update_patient_appointment_data(data, date, get_appoint);
                    update_patient_appointment = await appointmentDao.updatePatientAppointment(read_connection, update_appointment, appoint_id);
                    response = { appoint: update_appointment };
                    if (read_connection) {
                        await appointmentDao.releaseReadConnection(read_connection);
                    }
                    return resolve(response);
                }
            }
            catch (error) {
                if (read_connection) {
                    await appointmentDao.releaseReadConnection(read_connection);
                }
                return reject(error)
            }
        })
    }
}

function generateId(connection, data, seq_type) {
    return new Promise(async(resolve, reject) => {
        var appointmentDao = new AppointmentDao();
        var patientDao = new PatientDao();
        var get_patient_id, patient_id;
        
        try{
            get_patient_id = await patientDao.getPatientIdByPAT(connection,data.branch_id, seq_type);
            if(get_patient_id != null) {
                patient_id = get_patient_id.patient_id;
                return resolve(patient_id);
            }
            else{
               return generateId(connection, data, seq_type)
            }
        }
        catch(error) {
            return reject(error)
        }
    })
}

function categories_data_to_schema_patient_appointment_data(connection, data, date){
    return new Promise(async(resolve, reject) => {
        try {
            var appoint_no, apptdate, appt_date, appttime, appt_time;
            var seq_type='APT';
            debug("data.appoint_date", data.appoint_date, "data.appoint_time", data.appointment_time)
            if(data.hasOwnProperty('appoint_date')) {
                apptdate = new Date(data.appoint_date);
                appt_date = moment(apptdate).utc().format("YYYY-MM-DD");
            }
            else{  
                appt_date = null;
            }
            if(data.hasOwnProperty('appoint_time')) {
                console.log("Not having");
                appt_time = data.appointment_time
              }
              else{
                appt_time = null;
              }

            appoint_no = await generateId(connection, data, seq_type)
            var status="B";
            var patient_appointment_data = { 
                patient_id: (data.hasOwnProperty('patient_id'))?data.patient_id:null,
                org_id: data.org_id, 
                branch_id: data.branch_id, 
                dept_id:data.dept_id,
                phone_no: data.phone_no,
                patient_name: data.patient_name, 
                doctor_id: data.doctor_id,
                ailment: data.ailment,
                appoint_date: appt_date,
                appoint_time: appt_time,
                appoint_status: status,
                appoint_no: appoint_no,
                created_by: data.user_id,
                created_on: date,
                updated_by: data.user_id, 
                updated_on: date
            }
            return resolve(patient_appointment_data)
        }
        catch (error) {
            return reject(error);    
        }
    })
}

function categories_data_to_schema_update_patient_appointment_data(data, date, get_appoint){
    return new Promise(async(resolve, reject) => {
        try {
            var apptdate, appt_date, appttime, appt_time;
            debug("data", data, "get_appoint", get_appoint)
            if(data.hasOwnProperty('appoint_date')) {
                apptdate = new Date(data.appoint_date);
                appt_date = moment(apptdate).format("YYYY-MM-DD");
            }
            else{
                appt_date = get_appoint.appoint_date;
            }
            if(!data.hasOwnProperty('appoint_time')) {
                appt_time = get_appoint.appoint_time;
              }
              else{
                appt_time = data.appoint_time;
              }

            var patient_appointment_data = { 
                org_id: (data.hasOwnProperty('org_id'))?data.org_id:get_appoint.org_id, 
                branch_id: (data.hasOwnProperty('branch_id'))?data.branch_id:get_appoint.branch_id, 
                phone_no: (data.hasOwnProperty('phone_no'))?data.phone_no:get_appoint.phone_no,
                patient_name: (data.hasOwnProperty('patient_name'))?data.patient_name:get_appoint.patient_name, 
                doctor_id: (data.hasOwnProperty('doctor_id'))?data.doctor_id:get_appoint.doctor_id,
                dept_id: (data.hasOwnProperty('dept_id'))?data.dept_id:get_appoint.dept_id,
                ailment: (data.hasOwnProperty('ailment'))?data.ailment:get_appoint.ailment,
                appoint_date: appt_date,
                appoint_time: appt_time,
                appoint_status: (data.hasOwnProperty('appoint_status'))?data.appoint_status:get_appoint.appoint_status,
                updated_on: date
            }
            debug("patient_appointment_data", patient_appointment_data)
            return resolve(patient_appointment_data)
        }
        catch (error) {
            return reject(error);    
        }
    })
}

module.exports = {
   AppointmentModule,
   generateId
}