const { PatientInsDao } = require('../dao/patient_ins_dao');
var debug = require('debug')('v2:patientins:module');
const {changeLog} = require('../../common/error_handling');
var moment = require('moment-timezone');
const { GetRandomPatientID } = require('../../common/app_utils');
const { PatientDao } = require('../dao/patient_dao');

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

class PatientInsModule {

    CreatePatientInsHeader(data,  query) {
        return new Promise(async (resolve, reject) => {
            var patientinsDao = new PatientInsDao();
            var read_connection = null;
            var get_patient_ins, patient_ins_header_data, set_pat_ins_header_data;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            var succes_data = 'Y';
            var lab_results = [];
            try {
                read_connection = await patientinsDao.getReadConnection();
                get_patient_ins = await patientinsDao.getPatientInsHeader(read_connection, data);
                if(get_patient_ins.hasOwnProperty('status') && get_patient_ins.status == 404) {
                    debug("Get consult", get_patient_ins);
                    set_pat_ins_header_data = await categories_data_to_schema_patient_ins_header_data_to_create(read_connection, data, date);
                    patient_ins_header_data = await patientinsDao.createPatientInsHeader(read_connection, set_pat_ins_header_data);
                    get_patient_ins = await patientinsDao.getPatientInsHeader(read_connection, data);
                    if (read_connection) {
                        await patientinsDao.releaseReadConnection(read_connection);
                    }
                    return resolve(get_patient_ins)
                }
                else{
                    debug("Get new consult", get_patient_ins);
                    set_pat_ins_header_data = await categories_data_to_schema_patient_ins_header_data_to_update(date, get_patient_ins, data);
                    patient_ins_header_data = await patientinsDao.updatePatientInsHeader(read_connection, set_pat_ins_header_data, get_patient_ins);
                    get_patient_ins = await patientinsDao.getPatientInsHeader(read_connection, data);
                    if (read_connection) {
                        await patientinsDao.releaseReadConnection(read_connection);
                    }
                    return resolve(get_patient_ins)
                }
            }
            catch (error) {
                debug("error", error)
                if (read_connection) {
                    await patientinsDao.releaseReadConnection(read_connection);
                }
                return reject(error)
            }
        })
    }

    CreatePatientInsDetail(data,  query) {
        return new Promise(async (resolve, reject) => {
            var patientinsDao = new PatientInsDao();
            var read_connection = null;
            var get_patient_ins, patient_ins_detail_data, set_pat_ins_detail_data;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            var succes_data = 'Y';
            var ins_detail = [];
            try {
                read_connection = await patientinsDao.getReadConnection();
                for(var i in data.pat_ins_detail) {
                    var pat_ins_detail = data.pat_ins_detail[i]
                    get_patient_ins = await patientinsDao.getPatientInsDetail(read_connection, data,  pat_ins_detail);
                    if(get_patient_ins.hasOwnProperty('status') && get_patient_ins.status == 404) {
                        debug("Get consult", get_patient_ins);
                        set_pat_ins_detail_data = await categories_data_to_schema_patient_ins_detail_data_to_create(read_connection, data, date, pat_ins_detail);
                        patient_ins_detail_data = await patientinsDao.createPatientInsDetail(read_connection, set_pat_ins_detail_data);
                        get_patient_ins = await patientinsDao.getPatientInsDetail(read_connection, data, pat_ins_detail);
                        ins_detail.push(get_patient_ins);
                    }
                    else{
                        debug("Get new consult", get_patient_ins);
                        set_pat_ins_detail_data = await categories_data_to_schema_patient_ins_detail_data_to_update(date, get_patient_ins, pat_ins_detail);
                        patient_ins_detail_data = await patientinsDao.updatePatientInsDetail(read_connection, set_pat_ins_detail_data, get_patient_ins, pat_ins_detail.invoice_num);
                        get_patient_ins = await patientinsDao.getPatientInsDetail(read_connection, data, pat_ins_detail);
                        ins_detail.push(get_patient_ins);
                    } 
                }
                if (read_connection) {
                    await patientinsDao.releaseReadConnection(read_connection);
                }
                return resolve({results: ins_detail})
            }
            catch (error) {
                debug("error", error)
                if (read_connection) {
                    await patientinsDao.releaseReadConnection(read_connection);
                }
                return reject(error)
            }
        })
    }

    getPatientInsHeaderList(query) {
        return new Promise(async(resolve, reject) => {
            var patientinsDao = new PatientInsDao();
            var connection = null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
            var get_patient_ins_header, get_patient_ins_header_count;
            try {
                connection = await patientinsDao.getReadConnection();
                debug("query.filter", query);
                get_patient_ins_header = await patientinsDao.getPatientInsHeaderList(connection, query, strPagination);
                if(get_patient_ins_header.hasOwnProperty('status') && get_patient_ins_header.status == 404) {
                    if (connection) {
                        await patientinsDao.releaseReadConnection(connection);
                    }
                    return resolve(get_patient_ins_header);;
                }
                else{
                    get_patient_ins_header_count = await patientinsDao.getCountPatientInsHeaderList(connection, query);
                    var total_size = get_patient_ins_header_count;
                    var page_size = query.skip ? query.skip : get_patient_ins_header_count;
                    var result_size = strLimit;
                    console.log("Totalsize :", total_size);
                    var summary = {
                        filteredsize: page_size, resultsize: result_size, totalsize: total_size
                    };
                    var res = {
                        summary, results: get_patient_ins_header
                    }
                    if (connection) {
                        await patientinsDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                }
            }
            catch(error) {
                if (connection) {
                    await patientinsDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }

    getPatientInsDetailList(inv_month, inv_year, patient_id, query) {
        return new Promise(async(resolve, reject) => {
            var patientinsDao = new PatientInsDao();
          
            var connection = null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
            var get_patient_ins_detail, get_patient_ins_header_count;
            try {
                connection = await patientinsDao.getReadConnection();
                debug("query.filter", query);
               
                get_patient_ins_detail = await patientinsDao.getPatientInsDetailList(connection,inv_month, inv_year, patient_id, query);
                if(get_patient_ins_detail.hasOwnProperty('status') && get_patient_ins_detail.status == 404) {
                    if (connection) {
                        await patientinsDao.releaseReadConnection(connection);
                    }
                    return resolve(get_patient_ins_detail);;
                }
                else{
                   // get_patient_ins_header_count = await patientinsDao.getCountPatientInsDetailList(connection, query);
                   var total_size = get_patient_ins_detail.length;
                    var page_size = get_patient_ins_detail.length//query.skip ? query.skip : total_size;
                    var result_size = get_patient_ins_detail.length//strLimit;
                    console.log("Totalsize :", total_size);
                    var summary = {
                        filteredsize: page_size, resultsize: result_size, totalsize: total_size
                    };
                    var res = {
                        summary, results: get_patient_ins_detail
                    }
                    if (connection) {
                        await patientinsDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                }
            }
            catch(error) {
                if (connection) {
                    await patientinsDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }

    getInsentrystatus(inv_month, inv_year,query) {
        return new Promise(async(resolve, reject) => {
            var patientinsDao = new PatientInsDao();
          
            var connection = null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
            var get_patient_ins_detail, get_patient_ins_header_count;
            try {
                connection = await patientinsDao.getReadConnection();
                debug("query.filter", query);
               
                get_patient_ins_detail = await patientinsDao.getInsentrystatus(connection,inv_month, inv_year, query);
                if(get_patient_ins_detail.hasOwnProperty('status') && get_patient_ins_detail.status == 404) {
                    if (connection) {
                        await patientinsDao.releaseReadConnection(connection);
                    }
                    return resolve(get_patient_ins_detail);;
                }
                else{

                    
                    for(var i in get_patient_ins_detail) {
                        var ref_desc = get_patient_ins_detail[i].ref_desc;
                        var detail_list = await patientinsDao.getInsentrystatusdetails(connection,inv_month, inv_year,ref_desc, query);
                        if(detail_list == null) {
                            var empty_array = [];
                            get_patient_ins_detail[i]["details"] = empty_array;
                        }
                        else{
                            get_patient_ins_detail[i]["details"] = detail_list;
                        }
                    }
                   // get_patient_ins_header_count = await patientinsDao.getCountPatientInsDetailList(connection, query);
                   var total_size = get_patient_ins_detail.length;
                    var page_size = get_patient_ins_detail.length//query.skip ? query.skip : total_size;
                    var result_size = get_patient_ins_detail.length//strLimit;
                    console.log("Totalsize :", total_size);
                    var summary = {
                        filteredsize: page_size, resultsize: result_size, totalsize: total_size
                    };
                    var res = {
                        summary, results: get_patient_ins_detail
                    }
                    if (connection) {
                        await patientinsDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                }
            }
            catch(error) {
                if (connection) {
                    await patientinsDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }

    getPatientInsuranceReportList(data,  query) {
        return new Promise(async(resolve, reject) => {
            var patientinsDao = new PatientInsDao();
          
            var connection = null;
            var today = new Date();
          
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
            var get_patient_ins_detail, get_patient_ins_header_count;
            var invoice_no = '';
            try {
                connection = await patientinsDao.getReadConnection();
                debug("query.filter", query);
                for(var i in data.invoice_no) {
                  var str = (data.invoice_no.length -1 != i)?', ':'';
                  invoice_no +=  `'${data.invoice_no[i]}' ${str}`;
                }
                invoice_no = `(${invoice_no})`;

                get_patient_ins_detail = await patientinsDao.getPatientInsuranceReportList(connection,data, invoice_no, query);
                if(get_patient_ins_detail.hasOwnProperty('status') && get_patient_ins_detail.status == 404) {
                    if (connection) {
                        await patientinsDao.releaseReadConnection(connection);
                    }
                    return resolve(get_patient_ins_detail);;
                }
                else{
                   // get_patient_ins_header_count = await patientinsDao.getCountPatientInsDetailList(connection, query);
                   var total_size = get_patient_ins_detail.length;
                    var page_size = get_patient_ins_detail.length//query.skip ? query.skip : total_size;
                    var result_size = get_patient_ins_detail.length//strLimit;
                    console.log("Totalsize :", total_size);
                    var summary = {
                        filteredsize: page_size, resultsize: result_size, totalsize: total_size
                    };
                    var res = {
                        summary, results: get_patient_ins_detail
                    }
                    if (connection) {
                        await patientinsDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                }
            }
            catch(error) {
                if (connection) {
                    await patientinsDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }
}

function generateId(connection, data, seq_type) {
    return new Promise(async(resolve, reject) => {
        var patientinsDao = new PatientInsDao();
        var billing_invoice, invoice_no;
        
        try{
            billing_invoice = await patientinsDao.getInvoiceNo(connection,data.branch_id, seq_type);
            if(billing_invoice != null) {
                invoice_no = billing_invoice.invoice_no;
                return resolve(invoice_no);
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

function categories_data_to_schema_patient_ins_header_data_to_create(connection, data, date) {
    return new Promise(async(resolve, reject) => {
        try {
            var patientinsDao = new PatientInsDao();
            var patient_ins_header_data = {
                org_id: data.org_id, 
                branch_id: data.branch_id, 
                patient_id: data.patient_id,
                bu_id: data.bu_id,
                doctor_id: data.doctor_id,
                header_remarks1: (data.hasOwnProperty('header_remarks1'))?data.header_remarks1: null, 
                header_remarks2:(data.hasOwnProperty('header_remarks2'))?data.header_remarks2: null, 
                footer_remarks: (data.hasOwnProperty('footer_remarks'))?data.footer_remarks: null,
                updated_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                updated_date: date, 
                created_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                created_date: date
            }
            return resolve(patient_ins_header_data)
        }
        catch (error) {
            return reject(error);    
        }
    })
}

function categories_data_to_schema_patient_ins_header_data_to_update(date, get_patient_ins, data) {
    return new Promise(async(resolve, reject) => {
        try {
            var patientinsDao = new PatientInsDao();
            var patient_ins_header_data = {
                /* org_id: data.org_id, 
                branch_id: data.branch_id, 
                bu_id: data.bu_id, 
                patient_id: data.patient_id,  */
                doctor_id: (data.hasOwnProperty('doctor_id'))?data.doctor_id: get_patient_ins.doctor_id, 
                header_remarks1: (data.hasOwnProperty('header_remarks1'))?data.header_remarks1: get_patient_ins.header_remarks1, 
                header_remarks2: (data.hasOwnProperty('header_remarks2'))?data.header_remarks2: get_patient_ins.header_remarks2, 
                footer_remarks: (data.hasOwnProperty('footer_remarks'))?data.footer_remarks: get_patient_ins.footer_remarks, 
                updated_by: (data.hasOwnProperty('user_id'))?data.user_id:get_patient_ins.updated_by, 
                updated_date: date
            }
            return resolve(patient_ins_header_data)
        }
        catch (error) {
            return reject(error);    
        }
    })
}

function categories_data_to_schema_patient_ins_detail_data_to_create(connection, data, date, pat_ins_detail) {
    return new Promise(async(resolve, reject) => {
        try {
            var patientinsDao = new PatientInsDao();

            var pat_ins_detail_data = {
                org_id: data.org_id, 
                branch_id: data.branch_id,
                patient_id: data.patient_id,
                dialysis_date: pat_ins_detail.dialysis_date,
                invoice_num: pat_ins_detail.invoice_num, 
                invoice_date: pat_ins_detail.invoice_date, 
                hd_start_time: pat_ins_detail.hd_start_time, 
                hd_end_time: pat_ins_detail.hd_end_time, 
                hd_duration: pat_ins_detail.hd_duration,
                pre_wt: pat_ins_detail.pre_wt,
                pre_bp: pat_ins_detail.pre_bp,
                pre_pulse: pat_ins_detail.pre_pulse,
                pre_temp: pat_ins_detail.pre_temp,
                post_wt: pat_ins_detail.post_wt,
                post_bp: pat_ins_detail.post_bp,
                post_pulse: pat_ins_detail.post_pulse,
                post_temp: pat_ins_detail.post_temp,
                curr_flow: pat_ins_detail.curr_flow, 
                fluid_removal: pat_ins_detail.fluid_removal, 
                complication: pat_ins_detail.complication, 
                drugs: pat_ins_detail.drugs, 
                remarks: pat_ins_detail.remarks, 
                active_flag: pat_ins_detail.active_flag, 
                updated_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                updated_date: date, 
                created_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                created_date: date
            }
            return resolve(pat_ins_detail_data)
        }
        catch (error) {
            return reject(error);    
        }
    })
}

function categories_data_to_schema_patient_ins_detail_data_to_update(date, data, pat_ins_detail) {
    return new Promise(async(resolve, reject) => {
        try {
            var patientinsDao = new PatientInsDao();
            var pat_ins_detail_data = {
                /* org_id: data.org_id, 
                branch_id: data.branch_id,
                patient_id: data.patient_id,            
                invoice_num: pat_ins_detail.invoice_num, 
                invoice_date: pat_ins_detail.invoice_date, */
                dialysis_date: data.dialysis_date, 
                hd_start_time: pat_ins_detail.hd_start_time, 
                hd_end_time: pat_ins_detail.hd_end_time, 
                hd_duration: pat_ins_detail.hd_duration,
                pre_wt: pat_ins_detail.pre_wt,
                pre_bp: pat_ins_detail.pre_bp,
                pre_pulse: pat_ins_detail.pre_pulse,
                pre_temp: pat_ins_detail.pre_temp,
                post_wt: pat_ins_detail.post_wt,
                post_bp: pat_ins_detail.post_bp,
                post_pulse: pat_ins_detail.post_pulse,
                post_temp: pat_ins_detail.post_temp,
                curr_flow: pat_ins_detail.curr_flow, 
                fluid_removal: pat_ins_detail.fluid_removal, 
                complication: pat_ins_detail.complication, 
                drugs: pat_ins_detail.drugs, 
                remarks: pat_ins_detail.remarks, 
                active_flag: pat_ins_detail.active_flag, 
                updated_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                updated_date: date, 
                updated_by: (pat_ins_detail.hasOwnProperty('user_id'))?pat_ins_detail.user_id:data.updated_by, 
                updated_date: date
            }
            return resolve(pat_ins_detail_data)
        }
        catch (error) {
            return reject(error);    
        }
    })
}

module.exports = {
   PatientInsModule,
   generateId
}