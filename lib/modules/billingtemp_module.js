const { BillingDao } = require('../dao/billingtemp_dao');
var debug = require('debug')('v2:billing:module');
const {changeLog} = require('../../common/error_handling');
var moment = require('moment-timezone');
const { GetRandomPatientID } = require('../../common/app_utils');
const { PatientDao } = require('../dao/patient_dao');
const { PatientInsDao } = require('../dao/patient_ins_dao');

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

class BillingTempModule {

    createBilling(data,  query) {
        return new Promise(async (resolve, reject) => {
            var billingDao = new BillingDao();
            var read_connection = null;
            var billing_header_data, set_billing_detail, user_billing_header, eoddata;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            var eod_date;
            try {
                read_connection = await billingDao.getReadConnection();
                eoddata = await billingDao.getEOD(read_connection,data.org_id,data.branch_id);
                if(eoddata.length>=1) {
                    eod_date = eoddata[0].eod_date;
                }
                else{
                    eod_date = date;
                }
                user_billing_header = await categories_data_to_schema_billing_header_data_to_create(read_connection, data, date, eod_date);
                billing_header_data = await billingDao.createBillingHeader(read_connection, user_billing_header);
                set_billing_detail = await InitBillingDetail(read_connection, data, user_billing_header, date);
                if (read_connection) {
                    await billingDao.releaseReadConnection(read_connection);
                }
                return resolve(billing_header_data);
            }
            catch (error) {
                if (read_connection) {
                    await billingDao.releaseReadConnection(read_connection);
                }
                return reject(error)
            }
        })
    }

    GetBillingDetail(invoice_no, query) {
        return new Promise(async(resolve, reject) => {
            var billingDao = new BillingDao();
            var connection = null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD HH:mm:ss");
            var get_billing;
            
            try {
                connection = await billingDao.getReadConnection();
                get_billing = await billingDao.getBillingHead(connection, invoice_no);
                if(get_billing.hasOwnProperty('status') && get_billing.status == 404) {
                    if (connection) {
                        await billingDao.releaseReadConnection(connection);
                    }
                    return resolve(get_billing);
                }
                else{
                    var get_billing_detail = await billingDao.getBillingDetail(connection, invoice_no);
                    get_billing['invoice_details'] = get_billing_detail;
                    if (connection) {
                        await billingDao.releaseReadConnection(connection);
                    }
                    return resolve(get_billing)
                }
            }
            catch(error) {
                if (connection) {
                    await billingDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }

    GetBillingBUDetail(invoice_no, query) {
        return new Promise(async(resolve, reject) => {
            var billingDao = new BillingDao();
            var connection = null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD HH:mm:ss");
            var get_billing;
            
            try {
                connection = await billingDao.getReadConnection();
                get_billing = await billingDao.getBillingHead(connection, invoice_no);
                if(get_billing.hasOwnProperty('status') && get_billing.status == 404) {
                    if (connection) {
                        await billingDao.releaseReadConnection(connection);
                    }
                    return resolve(get_billing);
                }
                else{
                    var get_billing_detail = await billingDao.getBillingBUDetail(connection, invoice_no);
                    if(get_billing_detail == null) {
                        var empty_array = [];
                        get_billing['invoice_details'] = empty_array;
                    }
                    else{
                        get_billing['invoice_details'] = get_billing_detail;
                    }
                   
                    if (connection) {
                        await billingDao.releaseReadConnection(connection);
                    }
                    return resolve(get_billing)
                }
            }
            catch(error) {
                if (connection) {
                    await billingDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }

    GetBillingListsByBranchId(branch_id, query) {
        return new Promise(async(resolve, reject) => {
            var billingDao = new BillingDao();
            var connection = null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD HH:mm:ss");
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
            var get_billings, get_billings_count;
            try {
                connection = await billingDao.getReadConnection();
                debug("query.filter", query)
                get_billings = await billingDao.getBillingByBranchId(connection, branch_id, query);
                if(get_billings.hasOwnProperty('status') && get_billings.status == 404) {
                    if (connection) {
                        await billingDao.releaseReadConnection(connection);
                    }
                    return resolve(get_billings);
                }
                else{
                    /* for(var i in get_billings) {
                        var get_billing_detail = await billingDao.getBillingDetail(connection, get_billings[i].invoice_no);
                        if(get_billing_detail.hasOwnProperty('status') && get_billing_detail.status == 404) {
                            var empty_array = [];
                            get_billings[i]['invoice_details'] = empty_array;
                        }
                        else{
                            // billing_detail.push(get_billing_detail);
                            get_billings[i]['invoice_details'] = get_billing_detail;
                        }
                    } */
                    get_billings_count = await billingDao.getCountBillingByBranchId(connection, branch_id, query);
                    var total_size = get_billings_count;
                    var page_size = query.skip ? query.skip : get_billings_count;
                    var result_size = strLimit;
                    console.log("Totalsize :", total_size);
                    var summary = {
                        filteredsize: page_size, resultsize: result_size, totalsize: total_size
                    };
                    var res = {
                        summary, results: get_billings
                    }
                    if (connection) {
                        await billingDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                }
            }
            catch(error) {
                if (connection) {
                    await billingDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }

    GetBillingListsByOrgId(org_id, query) {
        return new Promise(async(resolve, reject) => {
            var billingDao = new BillingDao();
            var connection = null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD HH:mm:ss");
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
            var get_billings, get_billings_count;
            try {
                connection = await billingDao.getReadConnection();
                debug("query.filter", query)
                get_billings = await billingDao.getBillingByOrgId(connection, org_id, query, strPagination);
                if(get_billings.hasOwnProperty('status') && get_billings.status == 404) {
                    if (connection) {
                        await billingDao.releaseReadConnection(connection);
                    }
                    return resolve(get_billings);
                }
                else{
                    /* for(var i in get_billings) {
                        var get_billing_detail = await billingDao.getBillingDetail(connection, get_billings[i].invoice_no);
                        if(get_billing_detail.hasOwnProperty('status') && get_billing_detail.status == 404) {
                            var empty_array = [];
                            get_billings[i]['invoice_details'] = empty_array;
                        }
                        else{
                            // billing_detail.push(get_billing_detail);
                            get_billings[i]['invoice_details'] = get_billing_detail;
                        }
                    } */
                    get_billings_count = await billingDao.getCountBillingByOrgId(connection, org_id, query);
                    var total_size = get_billings_count;
                    var page_size = query.skip ? query.skip : get_billings_count;
                    var result_size = strLimit;
                    console.log("Totalsize :", total_size);
                    var summary = {
                        filteredsize: page_size, resultsize: result_size, totalsize: total_size
                    };
                    var res = {
                        summary, results: get_billings
                    }
                    if (connection) {
                        await billingDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                }
            }
            catch(error) {
                if (connection) {
                    await billingDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }

    GetPatientHeaderDetail(patient_id, query) {
        return new Promise(async(resolve, reject) => {
            var billingDao = new BillingDao();
            var patientDao = new PatientDao();
            var connection = null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD HH:mm:ss");
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
            var get_billings, patient_data;
            try {
                connection = await billingDao.getReadConnection();
                var get_patient_data = await patientDao.getPatientId(connection, patient_id);
                if(get_patient_data.hasOwnProperty('status') && get_patient_data.status == 404) {
                    if (connection) {
                        await billingDao.releaseReadConnection(connection);
                    }
                    return resolve(get_patient_data);
                }
                else{
                    patient_data = {
                        org_id: get_patient_data.org_id, 
                        branch_id: get_patient_data.branch_id, 
                        patient_id: get_patient_data.patient_id, 
                        patient_name: get_patient_data.patient_name, 
                        age: get_patient_data.age,
                        sex: get_patient_data.sex, 
                        mobile_no: get_patient_data.mobile_no,
                        patient_type: get_patient_data.patient_type,
                        patient_type_name: get_patient_data.patient_type_name,  
                        dob: get_patient_data.dob, 
                        advance_amount_paid:  (get_patient_data.advance_amount_paid != null)?get_patient_data.advance_amount_paid:0, 
                        advance_amount_balance: (get_patient_data.advance_amount_balance != null)?get_patient_data.advance_amount_balance:0
                    }
                    get_billings = await billingDao.getPatientBillingData(connection, get_patient_data, patient_id);
                    debug("get_billings", get_billings);
                    if(get_billings == null) {
                        patient_data['net_inv_amount'] = 0;
                        patient_data['net_inv_paid'] = 0;
                        patient_data['net_inv_balance'] = 0;
                        debug("patient_data", patient_data)
                        if (connection) {
                            await billingDao.releaseReadConnection(connection);
                        }
                        return resolve(patient_data)
                    }
                    else{
                        patient_data['net_inv_amount'] = (get_billings.net_inv_amount != null)?get_billings.net_inv_amount:0;
                        patient_data['net_inv_paid'] = (get_billings.net_inv_paid != null)?get_billings.net_inv_paid:0;
                        patient_data['net_inv_balance'] = (get_billings.net_inv_balance != null)?get_billings.net_inv_balance:0;
                        debug("patient_data", patient_data)
                        if (connection) {
                            await billingDao.releaseReadConnection(connection);
                        }
                        return resolve(patient_data)
                    }
                }
            }
            catch(error) {
                if (connection) {
                    await billingDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }

    updateBilling(data, invoice_no, query) {
        return new Promise(async (resolve, reject) => {
            var billingDao = new BillingDao();
            var read_connection = null;
            var update_billing_data, get_billing, update_billing, cancel_billing_data, eoddata;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            var eod_date;

            try {
                read_connection = await billingDao.getReadConnection();
                eoddata = await billingDao.getEOD(read_connection,data.org_id,data.branch_id);
                if(eoddata.length>=1) {
                    eod_date = eoddata[0].eod_date;
                }
                else{
                    eod_date = date;
                }
                get_billing = await billingDao.getBillingHead(read_connection, invoice_no);
                if(get_billing.hasOwnProperty('status') && get_billing.status == 404) {
                    if (read_connection) {
                        await billingDao.releaseReadConnection(read_connection);
                    }
                    return resolve(get_billing);
                }
                else{
                    //update_billing = await categories_data_to_schema_update_billing_data(data, date, get_billing);
                  

                    var update_billing = {
                    
                        inv_status: data.inv_status,
                        updated_date: date
                    }
                    update_billing_data = await billingDao.updateBillingHeader(read_connection, update_billing, invoice_no);
                    var create_cancel_billing = {
                        org_id: data.org_id, 
                        branch_id: data.branch_id, 
                        invoice_no: invoice_no, 
                        cancel_date: eod_date, 
                       
                        cancel_remarks: data.cancel_remarks, 
                        
                        updated_by: (data.hasOwnProperty('user_id'))?data.user_id: null, 
                        updated_date: date, 
                        created_by: (data.hasOwnProperty('user_id'))?data.user_id: null, 
                        created_date: date
                     
                    }  
                    cancel_billing_data = await billingDao.createCancelBilling(read_connection, create_cancel_billing);
                    
                   
                    if (read_connection) {
                        await billingDao.releaseReadConnection(read_connection);
                    }
                    return resolve(create_cancel_billing);
                }
            }
            catch (error) {
                if (read_connection) {
                    await billingDao.releaseReadConnection(read_connection);
                }
                return reject(error)
            }
        })
    }

    createBillingPaymentDetail(data,  query) {
        return new Promise(async (resolve, reject) => {
            var billingDao = new BillingDao();
            var read_connection = null;
            var set_payment_data, eoddata;;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            var eod_date;
            try {
                read_connection = await billingDao.getReadConnection();
                eoddata = await billingDao.getEOD(read_connection,data.org_id,data.branch_id);
                if(eoddata.length>=1) {
                    eod_date = eoddata[0].eod_date;
                }
                else{
                    eod_date = date;
                }
                var get_billing_head = await billingDao.getBillingHead(read_connection, data.invoice_no);
                debug("get_patient_data", get_billing_head);
                if(get_billing_head.hasOwnProperty('status') && get_billing_data.status == 404) {
                    var error_code = { status: 404, code: 4001, message: "Invalid Invoice No!.", developerMessage: "Invalid Invoice No!." };
                    if (read_connection) {
                        await billingDao.releaseReadConnection(read_connection);
                    }
                    return resolve(error_code);
                }
                else{
                    var get_payment_data = await billingDao.getPaymentMaxNumber(read_connection, data);
                    debug("get_patient_data", get_payment_data);
                  //  var get_billing_data = await billingDao.getBillingDtl(read_connection, data.invoice_no, data.inv_srl_no);                  
                    var get_billing_data = await billingDao.getBillingBUDtl(read_connection, data.invoice_no, data.inv_srl_no);
                    set_payment_data = await categories_data_to_schema_billing_payment_data_create(read_connection, data, get_payment_data, get_billing_data, get_billing_head, date,eod_date);
                    if (read_connection) {
                        await billingDao.releaseReadConnection(read_connection);
                    }
                    return resolve(set_payment_data);
                }
            }
            catch (error) {
                if (read_connection) {
                    await billingDao.releaseReadConnection(read_connection);
                }
                return reject(error)
            }
        })
    }

    getPatientInvoiceDetail(invoice_no,patient_id, query) {
        return new Promise(async(resolve, reject) => {
            var billingDao = new BillingDao();
            var connection = null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD HH:mm:ss");
            var invoice_header;
            //var bu_id='("DIALY","LAB")';
           var bu_id='("PHARM")';
            try {
                connection = await billingDao.getReadConnection();
                invoice_header = await billingDao.getPatientInvoiceDetail(connection, invoice_no, patient_id, query);
                if(invoice_header.hasOwnProperty('status') && invoice_header.status == 404) {
                    if (connection) {
                        await billingDao.releaseReadConnection(connection);
                    }
                    return resolve(invoice_header);
                }
                else{
                   
                    var invoice_lists = await billingDao.getPatientInvoiceLists(connection, invoice_no, bu_id, patient_id, invoice_header, query);
                    invoice_header['invoice_lists'] = invoice_lists;
                    

                    var invoice_summary = await billingDao.getPatientInvoiceSummary(connection, invoice_no, bu_id, patient_id, invoice_header, query);
                    invoice_header ['invoice_summary']= invoice_summary;
                    
                    var invoice_estimate_summary = await billingDao.getPatientInvoiceEstimateSummary(connection, invoice_no, bu_id, patient_id, invoice_header, query);
                    invoice_header ['estimate_summary']= invoice_estimate_summary;
                    
                    var estmate_lists = await billingDao.getPatientInvoicePharmLists(connection, invoice_no, bu_id, patient_id, invoice_header, query);
                    invoice_header['estimate_lists'] = estmate_lists;
                    
                
                    var invoice_payments = await billingDao.getPatientInvoicePaymentList(connection, invoice_no, bu_id, patient_id, invoice_header, query);
                    invoice_header ['invoice_payments']= invoice_payments;
                    
                    if (connection) {
                        await billingDao.releaseReadConnection(connection);
                    }
                    return resolve(invoice_header)
                }
            }
            catch(error) {
                if (connection) {
                    await billingDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }

    getInvoiceMonth(inv_month,inv_year,patient_id, query) {
        return new Promise(async(resolve, reject) => {
            var billingDao = new BillingDao();
            var connection = null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD HH:mm:ss");
            var invoice_header;
            var bu_id='("PHARM")';
            try {
                connection = await billingDao.getReadConnection();
                invoice_header = await billingDao.getInvoiceByMonth(connection, inv_month,inv_year, patient_id, query);
                if(invoice_header.hasOwnProperty('status') && invoice_header.status == 404) {
                    if (connection) {
                        await billingDao.releaseReadConnection(connection);
                    }
                    return resolve(invoice_header);
                }
                else{
                   
                    if (connection) {
                        await billingDao.releaseReadConnection(connection);
                    }
                    return resolve(invoice_header)
                }
            }
            catch(error) {
                if (connection) {
                    await billingDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }

    //Report
    getReportPatientTypeWiseList(org_id,branch_id,start_date,end_date, query) {
        return new Promise(async(resolve, reject) => {
            var billingDao = new BillingDao();
            var connection = null;
            debug("start_date", start_date, "end_date", end_date)
            var from_date = moment(start_date).format("YYYY-MM-DD");
            var to_date = moment(end_date).format("YYYY-MM-DD");
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
            var patient_types;
            debug("from_date ", from_date);
            debug("to_date ", to_date);
            try {
                connection = await billingDao.getReadConnection();
                patient_types = await billingDao.getRPTPatientTypeWiseList(connection, org_id, branch_id, from_date, to_date, query);
                if(patient_types.hasOwnProperty('status') && patient_types.status == 404) {
                    if (connection) {
                        await billingDao.releaseReadConnection(connection);
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
                        await billingDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                  
                }
            }
            catch(error) {
                if (connection) {
                    await billingDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }

      //Report
      getReportPatientOutstandingList(org_id,branch_id,start_date,end_date, query) {
        return new Promise(async(resolve, reject) => {
            var billingDao = new BillingDao();
            var connection = null;
            var from_date = moment(start_date).format("YYYY-MM-DD");
            var to_date = moment(end_date).format("YYYY-MM-DD");
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
            var outstandinglist;
            debug("from_date ", from_date);
            debug("to_date ", to_date);
            try {
                connection = await billingDao.getReadConnection();
                outstandinglist = await billingDao.getRPTPatientOutstandingSummaryList(connection, org_id, branch_id, from_date, to_date, query);
                if(outstandinglist.hasOwnProperty('status') && outstandinglist.status == 404) {
                    if (connection) {
                        await billingDao.releaseReadConnection(connection);
                    }
                    return resolve(outstandinglist);
                }
                else{
                    for(var i in outstandinglist) {
                      //  var invoice_date = outstandinglist[i].inv_date;
                        var patient_id = outstandinglist[i].patient_id;
                      //  debug("Inv DATE ", invoice_date);
                        var collectionwise_txn = await billingDao.getRPTPatientOutstandingTransactionList(connection, org_id, branch_id, query, from_date, to_date,patient_id);
                        if(collectionwise_txn == null) {
                            var empty_array = [];
                            outstandinglist[i]["details"] = empty_array;
                        }
                        else{
                            outstandinglist[i]["details"] = collectionwise_txn;
                        }
                    }
                    var total_size = outstandinglist.length;
                    var page_size = outstandinglist.length//query.skip ? query.skip : total_size;
                    var result_size = outstandinglist.length//strLimit;
                    console.log("Totalsize :", total_size);
                    var summary = {
                        filteredsize: page_size, resultsize: result_size, totalsize: total_size
                    };
                    var res = {
                        summary, results: outstandinglist
                    }
                    if (connection) {
                        await billingDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                  
                }
            }
            catch(error) {
                if (connection) {
                    await billingDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }

    getReportInvoiceOutstandingList(org_id,branch_id,start_date,end_date, query) {
        return new Promise(async(resolve, reject) => {
            var billingDao = new BillingDao();
            var connection = null;
            var from_date = moment(start_date).format("YYYY-MM-DD");
            var to_date = moment(end_date).format("YYYY-MM-DD");
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
            var outstandinglist;
            debug("from_date ", from_date);
            debug("to_date ", to_date);
            try {
                connection = await billingDao.getReadConnection();
                outstandinglist = await billingDao.getRPTInvoiceOutstandingSummarryList(connection, org_id, branch_id, from_date, to_date, query);
                if(outstandinglist.hasOwnProperty('status') && outstandinglist.status == 404) {
                    if (connection) {
                        await billingDao.releaseReadConnection(connection);
                    }
                    return resolve(outstandinglist);
                }
                else{
                    debug("LIst ", outstandinglist);
                    for(var i in outstandinglist) {
                        var invoice_date = outstandinglist[i].inv_date;
                        debug("Inv DATE ", invoice_date);
                        var collectionwise_txn = await billingDao.getRPTInvoiceOutstandingTransactionList(connection, org_id, branch_id, query, invoice_date);
                        if(collectionwise_txn == null) {
                            var empty_array = [];
                            outstandinglist[i]["details"] = empty_array;
                        }
                        else{
                            outstandinglist[i]["details"] = collectionwise_txn;
                        }
                    }
                    var total_size = outstandinglist.length;
                    var page_size = outstandinglist.length//query.skip ? query.skip : total_size;
                    var result_size = outstandinglist.length//strLimit;
                    console.log("Totalsize :", total_size);
                    var summary = {
                        filteredsize: page_size, resultsize: result_size, totalsize: total_size
                    };
                    var res = {
                        summary, results: outstandinglist
                    }
                    if (connection) {
                        await billingDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                  
                }
            }
            catch(error) {
                if (connection) {
                    await billingDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }

    getCollectionWiseReportList(org_id,branch_id,start_date,end_date, query) {
        return new Promise(async(resolve, reject) => {
            var billingDao = new BillingDao();
            var connection = null;
            var from_date = moment(start_date).format("YYYY-MM-DD");
            var to_date = moment(end_date).format("YYYY-MM-DD");
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
            var collectionwiserpt;
            debug("from_date ", from_date);
            debug("to_date ", to_date);
            try {
                connection = await billingDao.getReadConnection();
                collectionwiserpt = await billingDao.getRPTCollectionWiseSummaryList(connection, org_id, branch_id, from_date, to_date, query);
                if(collectionwiserpt.hasOwnProperty('status') && collectionwiserpt.status == 404) {
                    if (connection) {
                        await billingDao.releaseReadConnection(connection);
                    }
                    return resolve(collectionwiserpt);
                }
                else{
                    for(var i in collectionwiserpt) {
                        var invoice_date = collectionwiserpt[i].inv_date;
                        var collectionwise_txn = await billingDao.getRPTCollectionWiseTransactionList(connection, org_id, branch_id, query, invoice_date);
                        if(collectionwise_txn == null) {
                            var empty_array = [];
                            collectionwiserpt[i]["details"] = empty_array;
                        }
                        else{
                            collectionwiserpt[i]["details"] = collectionwise_txn;
                        }
                    }
                    var total_size = collectionwiserpt.length;
                    var page_size = collectionwiserpt.length//query.skip ? query.skip : total_size;
                    var result_size = collectionwiserpt.length//strLimit;
                    console.log("Totalsize :", total_size);
                    var summary = {
                        filteredsize: page_size, resultsize: result_size, totalsize: total_size
                    };
                    var res = {
                        summary, results: collectionwiserpt
                    }
                    if (connection) {
                        await billingDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                  
                }
            }
            catch(error) {
                if (connection) {
                    await billingDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }

    getPaymentWiseReportList(org_id,branch_id,start_date,end_date, query) {
        return new Promise(async(resolve, reject) => {
            var billingDao = new BillingDao();
            var connection = null;
            var from_date = moment(start_date).format("YYYY-MM-DD");
            var to_date = moment(end_date).format("YYYY-MM-DD");
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
            var paymentwiserpt;
            debug("from_date ", from_date);
            debug("to_date ", to_date);
            try {
                connection = await billingDao.getReadConnection();
                paymentwiserpt = await billingDao.getRPTPaymentWiseSummaryList(connection, org_id, branch_id, from_date, to_date, query);
                if(paymentwiserpt.hasOwnProperty('status') && paymentwiserpt.status == 404) {
                    if (connection) {
                        await billingDao.releaseReadConnection(connection);
                    }
                    return resolve(paymentwiserpt);
                }
                else{
                    for(var i in paymentwiserpt) {
                        var invoice_date = paymentwiserpt[i].inv_date;
                        var paymentwise_txn = await billingDao.getRPTPaymentWiseTransactionList(connection, org_id, branch_id, query, invoice_date);
                        if(paymentwise_txn == null) {
                            var empty_array = [];
                            paymentwiserpt[i]["details"] = empty_array;
                        }
                        else{
                            paymentwiserpt[i]["details"] = paymentwise_txn;
                        }
                    }
                    debug("paymentwiserpt", paymentwiserpt)
                    var total_size = paymentwiserpt.length;
                    var page_size = paymentwiserpt.length//query.skip ? query.skip : total_size;
                    var result_size = paymentwiserpt.length//strLimit;
                    console.log("Totalsize :", total_size);
                    var summary = {
                        filteredsize: page_size, resultsize: result_size, totalsize: total_size
                    };
                    var res = {
                        summary, results: paymentwiserpt
                    }
                    if (connection) {
                        await billingDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                  
                }
            }
            catch(error) {
                if (connection) {
                    await billingDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }
    
    getReceiptPaymentReportList(org_id,branch_id,start_date,end_date, query) {
        return new Promise(async(resolve, reject) => {
            var billingDao = new BillingDao();
            var connection = null;
            debug("start_date", start_date, "end_date", end_date)
            var from_date = moment(start_date).format("YYYY-MM-DD");
            var to_date = moment(end_date).format("YYYY-MM-DD");
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
            var patient_types;
            debug("from_date ", from_date);
            debug("to_date ", to_date);
            try {
                connection = await billingDao.getReadConnection();
                
                patient_types = await billingDao.getReceiptPaymentList(connection, org_id, branch_id, from_date, to_date, query);
                if(patient_types.hasOwnProperty('status') && patient_types.status == 404) {
                    if (connection) {
                        await billingDao.releaseReadConnection(connection);
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
                        await billingDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                  
                }
            }
            catch(error) {
                if (connection) {
                    await billingDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }

    getStockRegisterReportList(org_id,branch_id,start_date,end_date, query) {
        return new Promise(async(resolve, reject) => {
            var billingDao = new BillingDao();
            var connection = null;
            debug("start_date", start_date, "end_date", end_date)
            var from_date = moment(start_date).format("YYYY-MM-DD");
            var to_date = moment(end_date).format("YYYY-MM-DD");
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
            var patient_types;
            debug("from_date ", from_date);
            debug("to_date ", to_date);
            try {
                connection = await billingDao.getReadConnection();
                
                patient_types = await billingDao.getStockRegisterReportList(connection, org_id, branch_id, from_date, to_date, query);
                if(patient_types.hasOwnProperty('status') && patient_types.status == 404) {
                    if (connection) {
                        await billingDao.releaseReadConnection(connection);
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
                        await billingDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                  
                }
            }
            catch(error) {
                if (connection) {
                    await billingDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }

    getReportPatientTypeWiseList(org_id,branch_id,start_date,end_date, query) {
        return new Promise(async(resolve, reject) => {
            var billingDao = new BillingDao();
            var connection = null;
            debug("start_date", start_date, "end_date", end_date)
            var from_date = moment(start_date).format("YYYY-MM-DD");
            var to_date = moment(end_date).format("YYYY-MM-DD");
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
            var patient_types;
            debug("from_date ", from_date);
            debug("to_date ", to_date);
            try {
                connection = await billingDao.getReadConnection();
                patient_types = await billingDao.getRPTPatientTypeWiseList(connection, org_id, branch_id, from_date, to_date, query);
                if(patient_types.hasOwnProperty('status') && patient_types.status == 404) {
                    if (connection) {
                        await billingDao.releaseReadConnection(connection);
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
                        await billingDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                  
                }
            }
            catch(error) {
                if (connection) {
                    await billingDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }


}

function generateId(connection, data, seq_type) {
    return new Promise(async(resolve, reject) => {
        var billingDao = new BillingDao();
        var billing_invoice, invoice_no;
        
        try{
            billing_invoice = await billingDao.getInvoiceNo(connection,data.branch_id, seq_type);
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

function categories_data_to_schema_billing_header_data_to_create(connection, data, date, eod_date){
    return new Promise(async(resolve, reject) => {
        try {
            var invoice_no;
            var seq_type = 'INV';
            invoice_no = await generateId(connection, data, seq_type)
            var billing_data = {
                org_id: data.org_id, 
                branch_id: data.branch_id, 
                invoice_no: invoice_no, 
                inv_date: eod_date, 
                doctor_id: data.doctor_id, 
                patient_id: data.patient_id,
                net_inv_paid: (data.hasOwnProperty('net_inv_paid'))?data.net_inv_paid:0, 
                net_inv_balance: (data.hasOwnProperty('net_inv_balance'))?data.net_inv_balance:0,
                net_balance: (data.hasOwnProperty('net_inv_balance'))?data.net_inv_balance:0,
                inv_status: 'P',
                updated_by: data.user_id, 
                updated_date: date, 
                created_by: data.user_id, 
                created_date: date
            }
            return resolve(billing_data)
        }
        catch (error) {
            return reject(error);    
        }
    })
}

function InitBillingDetail(connection, data, billing_header_data, date) {
    return new Promise(async(resolve, reject) => {
        try {
            var billingDao = new BillingDao();
            var patientDao = new PatientDao();
            var patientinsDao = new PatientInsDao();
            var billing_detail = []; 
            var product_value, product_cost, product_qty, other_charge1, other_charge2, other_charge3, discount1, discount2, discount3;
            var gross_inv_amount = 0;
            var gross_discount = 0;
            var net_amount = 0;
            var net_inv_amount = 0;
            var net_patient_inv_amount = 0, net_insurance_amount = 0, net_doctor_amount = 0;
            var count = 0;
            var bu_count = 0;
            var total_base_amt = 0, total_charges = 0, total_discounts = 0;
            var get_patient_data = await patientDao.getPatientId(connection, data.patient_id);
            for(var i in data.invoice_details) {
                var invoice_details = data.invoice_details[i];
                count = count + 1;
               /*  if(invoice_details.hasOwnProperty('other_charge1')) {
                    if(invoice_details.other_charge1 != null || invoice_details.other_charge1 != '') {
                        other_charge1 = invoice_details.other_charge1;
                    }
                    else{
                        other_charge1 = 0;
                    }
                }
                else{
                    other_charge1 = 0;
                }
                if(invoice_details.hasOwnProperty('other_charge2')) {
                    if(invoice_details.other_charge2 != null || invoice_details.other_charge2 != '') {
                        other_charge2 = invoice_details.other_charge2;
                    }
                    else{
                        other_charge2 = 0;
                    }
                }
                else{
                    other_charge2 = 0;
                }
                if(invoice_details.hasOwnProperty('other_charge3')) {
                    if(invoice_details.other_charge3 != null || invoice_details.other_charge3 != '') {
                        other_charge3 = invoice_details.other_charge3;
                    }
                    else{
                        other_charge3 = 0;
                    }
                }
                else{
                    other_charge3 = 0;
                }
                if(invoice_details.hasOwnProperty('discount1')) {
                    if(invoice_details.discount1 != null || invoice_details.discount1 != '') {
                        discount1 = invoice_details.discount1;
                    }
                    else{
                        discount1 = 0;
                    }
                }
                else{
                    discount1 = 0;
                }
                if(invoice_details.hasOwnProperty('discount2')) {
                    if(invoice_details.discount2 != null || invoice_details.discount2 != '') {
                        discount2 = invoice_details.discount2;
                    }
                    else{
                        discount2 = 0;
                    }
                }
                else{
                    discount2 = 0;
                }
                if(invoice_details.hasOwnProperty('discount3')) {
                    if(invoice_details.discount3 != null || invoice_details.discount3 != '') {
                        discount3 = invoice_details.discount3;
                    }
                    else{
                        discount3 = 0;
                    }
                }
                else{
                    discount3 = 0;
                }
                if(invoice_details.hasOwnProperty('product_cost')) {
                    if(invoice_details.product_cost != null || invoice_details.product_cost != '') {
                        product_cost = invoice_details.product_cost;
                    }
                    else{
                        product_cost = 0;
                    }
                }
                else{
                    product_cost = 0;
                }
                if(invoice_details.hasOwnProperty('product_qty')) {
                    if(invoice_details.product_qty != null || invoice_details.product_qty != '') {
                        product_qty = invoice_details.product_qty;
                    }
                    else{
                        product_qty = 0;
                    }
                }
                else{
                    product_qty = 0;
                }
    
                product_value = (product_qty * product_cost);
                gross_inv_amount = (product_value + other_charge1 + other_charge2 + other_charge3);
                gross_discount = (discount1 + discount2 + discount3);
                net_amount = (gross_inv_amount - gross_discount); */
    
                net_inv_amount = net_inv_amount + invoice_details.net_amount;
                net_patient_inv_amount = net_patient_inv_amount +  invoice_details.net_patient_amount
                net_insurance_amount = net_insurance_amount + invoice_details.insurance_inv_value;
                net_doctor_amount = net_doctor_amount + invoice_details.doctor_inv_value;
                //debug("invoice_details.patient_inv_value + invoice_details.gross_inv_amount - invoice_details.gross_discount", invoice_details.patient_inv_value, invoice_details.gross_inv_amount, invoice_details.gross_discount)
                var billing_detail_data = {
                    org_id: data.org_id, 
                    branch_id: data.branch_id, 
                    invoice_no: billing_header_data.invoice_no, 
                    inv_srl_no: count, 
                    bu_id: invoice_details.bu_id, 
                    product_id: invoice_details.product_id, 
                    product_qty: invoice_details.product_qty, 
                    product_cost: invoice_details.product_cost, 
                    product_value: invoice_details.product_value, 
                    other_charge1: invoice_details.other_charge1, 
                    other_charge_remark1: invoice_details.other_charge_remark1, 
                    other_charge2: invoice_details.other_charge2, 
                    other_charge_remark2: invoice_details.other_charge_remark2, 
                    other_charge3: invoice_details.other_charge3, 
                    other_charge_remark3: invoice_details.other_charge_remark3, 
                    gross_inv_amount: invoice_details.gross_inv_amount, 
                    discount1: invoice_details.discount1, 
                    discount_remark1: invoice_details.discount_remark1, 
                    discount2: invoice_details.discount2, 
                    discount_remark2: invoice_details.discount_remark2, 
                    discount3: invoice_details.discount3, 
                    discount_remark3: invoice_details.discount_remark3, 
                    gross_discount: invoice_details.gross_discount, 
                    net_amount: invoice_details.net_amount, 
                    net_paid: invoice_details.net_paid, 
                    net_balance: invoice_details.net_amount, 
                    updated_by: data.user_id,
                    inv_status: (invoice_details.net_amount == 0)?"F":"P",
                    updated_date: date, 
                    created_by: data.user_id, 
                    created_date: date,
                    patient_inv_value: invoice_details.patient_inv_value,
                    insurance_inv_value: invoice_details.insurance_inv_value,
                    doctor_inv_value: invoice_details.doctor_inv_value,
                    patient_base_price:invoice_details.patient_base_price,
                    patient_inv_gross_amt: invoice_details.patient_inv_gross_amt, 
                    net_patient_amount:invoice_details.net_patient_amount
                   
                    //net_patient_amount: (invoice_details.patient_inv_value + invoice_details.gross_inv_amount - invoice_details.gross_discount),

                    //20230119
                    // patient_inv_value double 
                    //insurance_inv_value double 
                    //doctor_inv_value double

                    //net_patient_amount=patient_inv_value+gross_inv_amount-gross_discount
                    //
                }
                var set_billing_detail_data = await billingDao.createBillingDetail(connection, billing_detail_data);
                billing_detail.push(set_billing_detail_data);
                total_base_amt += (invoice_details.product_cost * invoice_details.product_qty)
                total_charges += (invoice_details.other_charge1 + invoice_details.other_charge2 + invoice_details.other_charge3);
                total_discounts += invoice_details.gross_discount;
            }
            debug("get_patient_data", get_patient_data);
            if(get_patient_data.patient_type != 'N') {
                var set_pat_ins_detail_data = await categories_data_to_schema_patient_ins_detail_data_to_create(data, date, billing_header_data);
                debug("set_pat_ins_detail_data", set_pat_ins_detail_data)
                var patient_ins_detail_data = await patientinsDao.createPatientInsDetail(connection, set_pat_ins_detail_data);
                debug("patient_ins_detail_data", patient_ins_detail_data)
               
            }
            else{
                debug("Patient type is N")
            }

             //BU ID Ins
             var bu_detail_data = await billingDao.getBillingDetailbyGroupBU(connection, data.org_id,data.branch_id, billing_header_data.invoice_no);
             for(var i in bu_detail_data) {
                bu_count = bu_count + 1;
                var billing_bu_detail_data = {
                    org_id: data.org_id, 
                    branch_id: data.branch_id, 
                    invoice_no: billing_header_data.invoice_no, 
                    inv_srl_no: bu_count, 
                    bu_id: bu_detail_data[i].bu_id, 
                    base_cost: bu_detail_data[i].base_cost, 
                    other_charge1: bu_detail_data[i].other_charge1, 
                    other_charge2: bu_detail_data[i].other_charge2, 
                    other_charge3: bu_detail_data[i].other_charge3, 
                    gross_inv_amount: bu_detail_data[i].gross_inv_amount, 
                    discount1: bu_detail_data[i].discount1, 
                    discount2: bu_detail_data[i].discount2, 
                    discount3: bu_detail_data[i].discount3, 
                    gross_discount: bu_detail_data[i].gross_discount, 
                    net_amount: bu_detail_data[i].net_amount, 
                    net_paid: 0, 
                    net_balance: bu_detail_data[i].net_amount,                    
                    updated_by: data.user_id,
                    inv_status: (bu_detail_data[i].net_amount == 0)?"F":"P",                    
                    updated_date: date, 
                    created_by: data.user_id, 
                    created_date: date,
                    bu_patient_amt: bu_detail_data[i].bu_patient_amt, 
                    bu_insurance_amt: bu_detail_data[i].bu_insurance_amt, 
                    bu_doctor_amt: bu_detail_data[i].bu_doctor_amt, 
                    bu_patient_inv_status: "P", 
                    bu_insurance_status: "P", 
                    bu_patient_amt_paid: 0, 
                    bu_patient_amt_bal: bu_detail_data[i].bu_patient_amt


                    //bu_patient_amt double 
                    //bu_insurance_amt double 
                    //bu_doctor_amt double   
                    
                   // bu_patient_amt_paid double 0
                    //bu_patient_amt_bal   = bu_patient_amt
                   // bu_patient_inv_status varchar(1)  "P"
                    //bu_insurance_status    "P"
                }

                var set_billing_detail_data = await billingDao.createBillingBUDetail(connection, billing_bu_detail_data);
             }
            var update_billing_header = {
                net_inv_amount : net_inv_amount,
                net_inv_balance : net_inv_amount,
                total_base_amt: total_base_amt,
                total_charges: total_charges,
                total_discounts: total_discounts,
                net_patient_inv_amount: net_patient_inv_amount, 
                net_patient_inv_paid: 0, 
                net_patient_inv_balance: net_patient_inv_amount, 
                net_insurance_amount: net_insurance_amount, 
                net_insurance_paid: 0, 
                net_insurance_balance: net_insurance_amount, 
                net_doctor_amount: net_doctor_amount, 
                patient_inv_status: "P", 
                insurance_status: "P", 
                inv_status: (net_inv_amount == 0)?"F":"P",
                
                
                
                /*net_patient_inv_amount double 
                net_patient_inv_paid double  0 
                net_patient_inv_balance double  =net_patient_inv_amount
                net_insurance_amount double 
                net_insurance_paid double  0
                net_insurance_balance double  net_insurance_amount
                net_doctor_amount double
                patient_inv_status varchar(1)  "P"
                insurance_status varchar(1)  "P"*/
            }
            var update_billing_data = await billingDao.updateBillingHeader(connection, update_billing_header, billing_header_data.invoice_no);
            debug("update_billing_data", update_billing_data);
            var return_data = {billing_detail: billing_detail, update_billing_data: update_billing_data}
            return resolve(return_data);
        }
        catch (error) {
            debug("Error in initbillingdetail", error);
            return reject(error);    
        }
    })
}

function categories_data_to_schema_update_billing_data(data, date, get_billing){
    return new Promise(async(resolve, reject) => {
        try {
            var apptdate, appt_date, appttime, appt_time;
            debug("data", data, "get_billing", get_billing)
            if(data.hasOwnProperty('appoint_date')) {
                apptdate = new Date(data.appoint_date);
                appt_date = moment(apptdate).format("YYYY-MM-DD");
            }
            else{
                appt_date = get_billing.appoint_date;
            }
            if(!data.hasOwnProperty('appoint_time')) {
                appt_time = get_billing.appoint_time;
              }
              else{
                appt_time = data.appoint_time;
              }

            var patient_appointment_data = { 
                org_id: (data.hasOwnProperty('org_id'))?data.org_id:get_billing.org_id, 
                branch_id: (data.hasOwnProperty('branch_id'))?data.branch_id:get_billing.branch_id, 
                phone_no: (data.hasOwnProperty('phone_no'))?data.phone_no:get_billing.phone_no,
                patient_name: (data.hasOwnProperty('patient_name'))?data.patient_name:get_billing.patient_name, 
                doctor_id: (data.hasOwnProperty('doctor_id'))?data.doctor_id:get_billing.doctor_id,
                ailment: (data.hasOwnProperty('ailment'))?data.ailment:get_billing.ailment,
                appoint_date: appt_date,
                appoint_time: appt_time,
                appoint_status: (data.hasOwnProperty('appointment_status'))?data.appointment_status:get_billing.appoint_status,
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

function categories_data_to_schema_billing_payment_data_create(connection, data, get_payment_data, get_billing_data, get_billing_head, date,eod_date) {
    return new Promise(async(resolve, reject) => {
        try {
            var billingDao = new BillingDao();
            var patientDao = new PatientDao();
            var payment_num, inv_status;
            var net_paid = 0;
            var net_balance = 0;
            var net_inv_paid = 0;
            var net_inv_balance = 0;
            if(get_payment_data != null) {
                debug("get_payment_data", get_payment_data)
                if(get_payment_data.payment_num != null) {
                    payment_num = get_payment_data.payment_num + 1;
                }
                else{
                    payment_num = 1;
                }
            }
            else {
                payment_num = 1;
            }
            var billing_payment_data = {
                org_id: data.org_id, 
                branch_id: data.branch_id, 
                invoice_no: data.invoice_no, 
                inv_srl_no: data.inv_srl_no, 
                payment_num: payment_num, 
                payment_date: eod_date, 
                payment_mode: data.payment_mode, 
                payment_remark: data.payment_remark, 
                payment_amount: data.payment_amount, 
                updated_by: (data.hasOwnProperty('user_id'))?data.user_id: null, 
                updated_date: date, 
                created_by: (data.hasOwnProperty('user_id'))?data.user_id: null, 
                created_date: date
            }
            var set_billing_payment_data = await billingDao.createBillingPaymentDetail(connection, billing_payment_data);
            
            net_paid = get_billing_data.net_paid + data.payment_amount;
            net_balance = get_billing_data.net_amount - net_paid;
            if(get_billing_data.net_amount == net_paid) {
                inv_status = 'F';
            }
            else{
                inv_status = 'P';
            }
            var update_billing_bu_detail = {
                net_paid: net_paid,
                net_balance: net_balance,
                inv_status: inv_status,
                updated_date: date
            }
            var update_billing_data = await billingDao.updateBillingBUDetail(connection, update_billing_bu_detail, data.invoice_no, data.inv_srl_no);
            debug("update_billing_data", update_billing_data);

            net_inv_paid = get_billing_head.net_inv_paid + data.payment_amount;
            net_inv_balance =  get_billing_head.net_inv_balance - data.payment_amount;
            if(get_billing_head.net_inv_amount == net_inv_paid) {
                inv_status = 'F';
            }
            else{
                inv_status = 'P';
            }
            var update_billing_head = {
                net_inv_paid: net_inv_paid,
                net_inv_balance: net_inv_balance,
                inv_status: inv_status,
                updated_date: date
            }
            var update_billing_data = await billingDao.updateBillingHeader(connection, update_billing_head, data.invoice_no);
            debug("update_billing_data", update_billing_data);
                
            if(data.payment_mode == 'A'){
                var patient_data=await patientDao.getPatientId(connection,get_billing_head.patient_id);
                var update_patient_data = {
                    advance_amount_paid: (patient_data.advance_amount_paid != null)?(patient_data.advance_amount_paid+ data.payment_amount):data.payment_amount, 
                    advance_amount_balance: (patient_data.advance_amount_balance != null)?(patient_data.advance_amount_balance - data.payment_amount):data.payment_amount, 
                    updated_date: date
                }
                
                var update_patient_data = await patientDao.updatePatient(connection, update_patient_data, get_billing_head.patient_id) ;
            }
            return resolve(set_billing_payment_data);
        }
        catch (error) {
            debug("error in payment create data", error) 
            return reject(error);
        }
    })
}

function categories_data_to_schema_update_billingdtl_head_data(data, date, get_billing, get_billing_detail, get_total_billing_detail){
    return new Promise(async(resolve, reject) => {
        try {
            var update_billing_header_data;
            var net_inv_amount = get_billing.net_inv_amount - get_billing_detail.net_amount;
            var net_inv_balance = get_billing.net_inv_balance - get_billing_detail.net_amount;
            if(get_total_billing_detail > 1) {
                update_billing_header_data = {
                    net_inv_amount: net_inv_amount,
                    net_inv_balance: net_inv_balance,
                    updated_date: date
                }
            }
            else{
                update_billing_header_data = {
                    net_inv_amount: net_inv_amount,
                    inv_status: "C",
                    updated_date: date
                }
            }
            debug("update_billing_header_data", update_billing_header_data)
            return resolve(update_billing_header_data)
        }
        catch (error) {
            return reject(error);    
        }
    })
}

function categories_data_to_schema_patient_ins_detail_data_to_create(data, date, billing_header_data) {
    return new Promise(async(resolve, reject) => {
        try {
            var pat_ins_detail_data = {
                org_id: data.org_id, 
                branch_id: data.branch_id,
                patient_id: data.patient_id,
                dialysis_date: billing_header_data.inv_date,
                invoice_num: billing_header_data.invoice_no, 
                invoice_date: billing_header_data.inv_date, 
                hd_start_time: null, 
                hd_end_time: null, 
                hd_duration: null,
                pre_wt: null,
                pre_bp: null,
                pre_pulse: null,
                pre_temp: null,
                post_wt: null,
                post_bp: null,
                post_pulse: null,
                post_temp: null,
                curr_flow: null, 
                fluid_removal: null, 
                complication: null, 
                drugs: null, 
                remarks: null, 
                active_flag: null, 
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

module.exports = {
    BillingTempModule,
   generateId
}