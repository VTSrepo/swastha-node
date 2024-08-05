const { DoctorDao } = require('../dao/doctor_dao');
var debug = require('debug')('v2:doctors:module');
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

class DoctorModule {

    CreateDoctor(data,  query) {
        return new Promise(async (resolve, reject) => {
            var doctorDao = new DoctorDao();
            var read_connection = null;
            var doctor_data, set_doctor_data, user_doctor;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            try {
                read_connection = await doctorDao.getReadConnection();

              
                if(data.hasOwnProperty('doctor_id')) {
                    var get_doctor_data = await doctorDao.getDoctorDetail(read_connection, data.doctor_id);
                    if(get_doctor_data.hasOwnProperty('status')) {
                        set_doctor_data = await categories_data_to_schema_doctor_to_create(read_connection, data, date);
                        debug("set_doctor_data", set_doctor_data)
                        doctor_data = await doctorDao.createDoctor(read_connection, set_doctor_data);
                        if (read_connection) {
                            await doctorDao.releaseReadConnection(read_connection);
                        }
                        return resolve(doctor_data); 
                    }
                    else{
                        user_doctor = await categories_data_to_schema_doctor_to_update(data, get_doctor_data, date);
                        doctor_data = await doctorDao.updateDoctor(read_connection, user_doctor, data.doctor_id);
                        if (read_connection) {
                            await doctorDao.releaseReadConnection(read_connection);
                        }
                        return resolve(doctor_data); 
                    }
                }
                else{
                    set_doctor_data = await categories_data_to_schema_doctor_to_create(read_connection, data, date);
                    debug("set_doctor_data", set_doctor_data)
                    doctor_data = await doctorDao.createDoctor(read_connection, set_doctor_data);
                    if (read_connection) {
                        await doctorDao.releaseReadConnection(read_connection);
                    }
                    return resolve(doctor_data);
                }
            }
            catch (error) {
                debug("error", error)
                if (read_connection) {
                    await doctorDao.releaseReadConnection(read_connection);
                }
                return reject(error)
            }
        })
    }
    GetDoctorDetail(doctor_id, query) {
        return new Promise(async(resolve, reject) => {
            var doctorDao = new DoctorDao();
            var connection = null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD HH:mm:ss");
            
            try {
                connection = await doctorDao.getReadConnection();
                debug("query.filter", query)
            
                var get_doctor = await doctorDao.getDoctorDetail(connection, doctor_id);
                if(get_doctor.hasOwnProperty('status') && get_doctor.status == 404) {
                    if (connection) {
                        await doctorDao.releaseReadConnection(connection);
                    }
                    return resolve(get_doctor);
                }
                else{
                    if (connection) {
                        await doctorDao.releaseReadConnection(connection);
                    }
                    return resolve(get_doctor)
                }
            }
            catch(error) {
                if (connection) {
                    await doctorDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }

    getDoctor(branch_id, query) {
        return new Promise(async(resolve, reject) => {
            var doctorDao = new DoctorDao();
            var connection = null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD HH:mm:ss");
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
            var get_doctor, get_doctor_count, results;
            
            try {
                connection = await doctorDao.getReadConnection();
                debug("query.filter", query)
             if(query.filter.hasOwnProperty('doctor_id')) {
                    get_doctor = await doctorDao.getDoctorById(connection, query.filter.doctor_id, branch_id);
                    if(get_doctor.hasOwnProperty('status') && get_doctor.status == 404) {
                        if (connection) {
                            await doctorDao.releaseReadConnection(connection);
                        }
                        return resolve(get_doctor);
                    }
                    else{
                        var total_size = 1;
                        var page_size = 1;
                        var result_size = 1;
                        console.log("Totalsize :", total_size);
                        var summary = {
                            filteredsize: page_size, resultsize: result_size, totalsize: total_size
                        };
                        var res = {
                            summary, results: get_doctor
                        }
                        if (connection) {
                            await doctorDao.releaseReadConnection(connection);
                        }
                        return resolve(res)
                    }
                }
                else{
                    get_doctor = await doctorDao.getDoctorsByBranchId(connection, branch_id);
                    if(get_doctor.hasOwnProperty('status') && get_doctor.status == 404) {
                        if (connection) {
                            await doctorDao.releaseReadConnection(connection);
                        }
                        return resolve(get_doctor);
                    }
                    else{
                        get_doctor_count = await doctorDao.getCountDoctorByBranchId(connection, branch_id);

                        var total_size = get_doctor_count;
                        var page_size = query.skip ? query.skip : get_doctor_count;
                        var result_size = strLimit;
                        console.log("Totalsize :", total_size);
                        var summary = {
                            filteredsize: page_size, resultsize: result_size, totalsize: total_size
                        };
                        var res = {
                            summary, results: get_doctor
                        }
                        if (connection) {
                            await doctorDao.releaseReadConnection(connection);
                        }
                        return resolve(res)
                    }
                }
            }
            catch(error) {
                if (connection) {
                    await doctorDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }
    FetchBranchDept(org_id,branch_id, query) {
        return new Promise(async(resolve, reject) => {
            var doctorDao = new DoctorDao();
            var connection = null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD HH:mm:ss");
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
            var patient_types, get_doctor_count, results;
            
            try {
                connection = await doctorDao.getReadConnection();
                debug("query.filter", query)
             
            
                patient_types = await doctorDao.FetchBranchDept(connection, org_id, branch_id);
                    if(patient_types.hasOwnProperty('status') && patient_types.status == 404) {
                        if (connection) {
                            await doctorDao.releaseReadConnection(connection);
                        }
                        return resolve(patient_types);
                    }
                    else{
                        var total_size = patient_types.length;
                        var page_size = patient_types.length//query.skip ? query.skip : total_size;
                        var result_size = patient_types.length//strLimit;
                        console.log("Totalsize :", total_size);
                        var summary = {
                            filteredsize: page_size, resultsize: result_size, totalsize: total_size
                        };
                        var res = {
                            summary, results: patient_types
                        }
                        if (connection) {
                            await doctorDao.releaseReadConnection(connection);
                        }
                        return resolve(res)
                      
                    }
                }
            catch(error) {
                if (connection) {
                    await doctorDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }
    FetchDeptDoctor(org_id,branch_id,dept_id, query) {
        return new Promise(async(resolve, reject) => {
            var doctorDao = new DoctorDao();
            var connection = null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD HH:mm:ss");
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
            var patient_types, get_doctor_count, results;
            
            try {
                connection = await doctorDao.getReadConnection();
                debug("query.filter", query)
             
            
                patient_types = await doctorDao.FetchDeptDoctor(connection, org_id, branch_id,dept_id);
                    if(patient_types.hasOwnProperty('status') && patient_types.status == 404) {
                        if (connection) {
                            await doctorDao.releaseReadConnection(connection);
                        }
                        return resolve(patient_types);
                    }
                    else{
                        var total_size = patient_types.length;
                        var page_size = patient_types.length//query.skip ? query.skip : total_size;
                        var result_size = patient_types.length//strLimit;
                        console.log("Totalsize :", total_size);
                        var summary = {
                            filteredsize: page_size, resultsize: result_size, totalsize: total_size
                        };
                        var res = {
                            summary, results: patient_types
                        }
                        if (connection) {
                            await doctorDao.releaseReadConnection(connection);
                        }
                        return resolve(res)
                      
                    }
                }
            catch(error) {
                if (connection) {
                    await doctorDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }
}


function categories_data_to_schema_doctor_to_create(connection, data,  date){
    return new Promise(async(resolve, reject) => {
        try {

            var doctor_id;
            var seq_type = 'DOC';
            doctor_id = await generateId(connection, data, seq_type)
            var doc_data = {
                doctor_id : doctor_id ,
                org_id :  data.org_id ,
                branch_id :  data.branch_id ,
                doctor_status :  data.doctor_status ,
                doctor_name :  data.doctor_name ,
                doctor_contact_no :  data.doctor_contact_no ,
                doctor_email_id :  data.doctor_email_id ,
                doctor_assistant_name :  data.doctor_assistant_name ,
                doctor_assistant_contact_no :  data.doctor_assistant_contact_no ,
                doctor_asst_emailid:  data.doctor_asst_emailid,                
                updated_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                updated_date: date, 
                created_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                created_date: date
            }
            return resolve(doc_data)
        }
        catch (error) {
            return reject(error);    
        }
    })
}


function generateId(connection, data, seq_type) {
    return new Promise(async(resolve, reject) => {
        var doctorDao = new DoctorDao();
        var user, doctor_id;
        
        try{
            user = await doctorDao.getGenerateDoctorId(connection,data.branch_id, seq_type);
            if(user != null) {
                doctor_id = user.doctor_id;
                return resolve(doctor_id);
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

function categories_data_to_schema_doctor_to_update( data,get_doctor_data,  date){
    return new Promise(async(resolve, reject) => {
        try {

         
            var doc_data = {            
                doctor_status :  data.hasOwnProperty('doctor_status')?data.doctor_status:get_doctor_data.doctor_status, 
                doctor_name :  data.hasOwnProperty('doctor_name')?data.doctor_name:get_doctor_data.doctor_name, 
                doctor_contact_no :  data.hasOwnProperty('doctor_contact_no')?data.doctor_contact_no:get_doctor_data.doctor_contact_no ,
                doctor_email_id :  data.hasOwnProperty('doctor_email_id')?data.doctor_email_id:get_doctor_data.doctor_email_id, 
                doctor_assistant_name :  data.hasOwnProperty('doctor_assistant_name')?data.doctor_assistant_name:get_doctor_data.doctor_assistant_name ,
                doctor_assistant_contact_no :  data.hasOwnProperty('doctor_assistant_contact_no')?data.doctor_assistant_contact_no:get_doctor_data.doctor_assistant_contact_no ,
                doctor_asst_emailid:  data.hasOwnProperty('doctor_asst_emailid')?data.doctor_asst_emailid:get_doctor_data.doctor_asst_emailid,
                updated_by : (data.hasOwnProperty('user_id'))?data.user_id:null,  
                updated_date: date
                
            }
            return resolve(doc_data)
        }
        catch (error) {
            return reject(error);    
        }
    })
}

module.exports = {
   DoctorModule
}
