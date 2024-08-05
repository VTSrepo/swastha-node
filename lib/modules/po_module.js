const { PoDao } = require('../dao/po_dao');
var debug = require('debug')('v2:po:module');
const { SupplierDao } = require('../dao/supplier_dao');
var moment = require('moment-timezone');
const { GetRandomPatientID } = require('../../common/app_utils');
const { SendEmailData } = require('../../common/email_utils');
const e = require('cors');

class PoModule {

    createPoData(data,  query) {
        return new Promise(async (resolve, reject) => {
            var poDao = new PoDao();
            var read_connection = null;
            var po_header_data, set_po_detail, user_po_header, eoddata;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            var eod_date;
            try {
                read_connection = await poDao.getReadConnection();
                eoddata = await poDao.getEOD(read_connection,data.org_id,data.branch_id);
                if(eoddata.length>=1) {
                    eod_date = eoddata[0].eod_date;
                }
                else{
                    eod_date = date;
                }
                debug(eod_date);
                if(data.hasOwnProperty('po_number')) {
                    var get_po_number_data = await poDao.getPoNumber(read_connection, data.po_number);
                    if(get_po_number_data.hasOwnProperty('status')) {
                        user_po_header = await categories_data_to_schema_po_header_data_to_create(read_connection, data, date, eod_date);
                        debug("EOD :", user_po_header);
                        po_header_data = await poDao.createPoHeader(read_connection, user_po_header);
                        set_po_detail = await InitPoDetail(read_connection, data, user_po_header, date);
                        if (read_connection) {
                            await poDao.releaseReadConnection(read_connection);
                        }
                        return resolve(po_header_data); 
                    }
                    else{
                        user_po_header = await categories_data_to_schema_po_header_data_to_update(data, get_po_number_data, date);
                        po_header_data = await poDao.updatePoHeader(read_connection, user_po_header, get_po_number_data.po_number);
                        var get_po_header_detail_data = await poDao.GetPoDetails(read_connection, data.org_id, data.branch_id, data.po_number);
                        if(get_po_header_detail_data == null) {
                            set_po_detail = await InitPoDetail(read_connection, data, user_po_header, date);
                            if (read_connection) {
                                await poDao.releaseReadConnection(read_connection);
                            }
                            return resolve(po_header_data); 
                        }
                        else{
                            set_po_detail = await UpdatePoDetail(read_connection, data, user_po_header, date, get_po_header_detail_data);
                            if (read_connection) {
                                await poDao.releaseReadConnection(read_connection);
                            }
                            return resolve(po_header_data);  
                        }
                    }
                }
                else{
                    user_po_header = await categories_data_to_schema_po_header_data_to_create(read_connection, data, date, eod_date);
                    debug("EOD this :", user_po_header);
                    po_header_data = await poDao.createPoHeader(read_connection, user_po_header);
                    set_po_detail = await InitPoDetail(read_connection, data, user_po_header, date);
                    if (read_connection) {
                        await poDao.releaseReadConnection(read_connection);
                    }
                    return resolve(po_header_data);
                }
            }
            catch (error) {
                debug("Error in error", error)
                if (read_connection) {
                    await poDao.releaseReadConnection(read_connection);
                }
                return reject(error)
            }
        })
    }


   poSubmission(data,  query) {
        return new Promise(async (resolve, reject) => {
            var poDao = new PoDao();
            var read_connection = null;
           var set_po_detail=null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            try {
                read_connection = await poDao.getReadConnection();                   
                       
                        set_po_detail = await InitPoSubmission(read_connection, data,  date);
                        if (read_connection) {
                            await poDao.releaseReadConnection(read_connection);
                        }
                        return resolve(set_po_detail); 
                   
              
            }
            catch (error) {
                debug("Error in error", error)
                if (read_connection) {
                    await poDao.releaseReadConnection(read_connection);
                }
                return reject(error)
            }
        })
    }

    GetPoListsByBranchId(branch_id,supplier_id, query) {
        return new Promise(async(resolve, reject) => {
            var poDao = new PoDao();
            var connection = null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD HH:mm:ss");
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
            var get_po, get_po_count;
            try {
                connection = await poDao.getReadConnection();
                debug("query.filter", query)
                if(query.filter.hasOwnProperty('po_status')) {
           
                    get_po = await poDao.GetPoListsByStatus(connection, branch_id,supplier_id,query.filter.po_status, query, strPagination);
                }else{
                 get_po = await poDao.GetPoListsByBranchId(connection, branch_id,supplier_id, query, strPagination);
                }
                if(get_po.hasOwnProperty('status') && get_po.status == 404) {
                    if (connection) {
                        await poDao.releaseReadConnection(connection);
                    }
                    return resolve(get_po);
                }
                else{
                    for(var i in get_po) {
                        var po_number = get_po[i].po_number;
                        var detail_list = await poDao.GetPoDetailList(connection, query, po_number);
                        if(detail_list == null) {
                            var empty_array = [];
                            get_po[i]["po_details"] = empty_array;
                        }
                        else{
                            get_po[i]["po_details"] = detail_list;
                        }
                    }
                   

                    var total_size = get_po.length;
                    var page_size = get_po.length//query.skip ? query.skip : total_size;
                    var result_size = get_po.length//strLimit;
                    // get_po_count = await poDao.getCountPoByBranchId(connection, branch_id, query);
                    // var total_size = get_po_count;
                    // var page_size = query.skip ? query.skip : get_po_count;
                    // var result_size = strLimit;
                    console.log("Totalsize :", total_size);
                    var summary = {
                        filteredsize: page_size, resultsize: result_size, totalsize: total_size
                    };
                    var res = {
                        summary, results: get_po
                    }
                    if (connection) {
                        await poDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                }
            }
            catch(error) {
                if (connection) {
                    await poDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }

    GetPoListsByOrgId(org_id, query) {
        return new Promise(async(resolve, reject) => {
            var poDao = new PoDao();
            var connection = null;
            var today = new Date();
            //var date = moment(today).utc().format("YYYY-MM-DD HH:mm:ss");
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
            var get_po, get_po_count;
            try {
                connection = await poDao.getReadConnection();
                debug("query.filter", query)
                get_po = await poDao.GetPoListsByOrgId(connection, org_id, query, strPagination);
                if(get_po.hasOwnProperty('status') && get_po.status == 404) {
                    if (connection) {
                        await poDao.releaseReadConnection(connection);
                    }
                    return resolve(get_po);
                }
                else{
                   // get_po_count = await poDao.getCountPoByOrgId(connection, org_id, query);
                    for(var i in get_po) {
                        var po_number = get_po[i].po_number;
                        var detail_list = await poDao.GetPoDetailList(connection, query, po_number);
                        if(detail_list == null) {
                            var empty_array = [];
                            get_po[i]["po_details"] = empty_array;
                        }
                        else{
                            get_po[i]["po_details"] = detail_list;
                        }
                    }
                   

                    var total_size = get_po.length;
                    var page_size = get_po.length//query.skip ? query.skip : total_size;
                    var result_size = get_po.length//strLimit;
                  //  var total_size = get_po_count;
                  //  var page_size = query.skip ? query.skip : get_po_count;
                   // var result_size = strLimit;
                    console.log("Totalsize :", total_size);
                    var summary = {
                        filteredsize: page_size, resultsize: result_size, totalsize: total_size
                    };
                    var res = {
                        summary, results: get_po
                    }
                    if (connection) {
                        await poDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                }
            }
            catch(error) {
                if (connection) {
                    await poDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }

    GetPoDetail(po_number, query) {
        return new Promise(async(resolve, reject) => {
            var poDao = new PoDao();
            var connection = null;
            var get_po;
            try {
                connection = await poDao.getReadConnection();
                get_po = await poDao.getPoNumber(connection, po_number);
                if(get_po.hasOwnProperty('status') && get_po.status == 404) {
                    if (connection) {
                        await poDao.releaseReadConnection(connection);
                    }
                    return resolve(get_po);
                }
                else{
                    debug("GetPoDetail", get_po)
                    var detail_list = await poDao.GetPoDetailList(connection, query, po_number);
                    if(detail_list == null) {
                        var empty_array = [];
                        get_po["po_details"] = empty_array;
                    }
                    else{
                        get_po["po_details"] = detail_list;
                    }
                    if (connection) {
                        await poDao.releaseReadConnection(connection);
                    }
                    return resolve(get_po)
                }
            }
            catch(error) {
                if (connection) {
                    await poDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }


    GetSupplierList(org_id,branch_id, query) {
        return new Promise(async(resolve, reject) => {
            var poDao = new PoDao();
            var connection = null;
            var get_supplier;
            try {
                connection = await poDao.getReadConnection();
                get_supplier = await poDao.getSupplierList(connection, org_id,branch_id);
                if(get_supplier.hasOwnProperty('status') && get_supplier.status == 404) {
                    if (connection) {
                        await poDao.releaseReadConnection(connection);
                    }
                    return resolve(get_supplier);
                }
                else{
                    var total_size = get_supplier.length;
                    var page_size = get_supplier.length//query.skip ? query.skip : total_size;
                    var result_size = get_supplier.length//strLimit;
                    console.log("Totalsize :", total_size);
                    var summary = {
                        filteredsize: page_size, resultsize: result_size, totalsize: total_size
                    };
                    var res = {
                        summary, results: get_supplier
                    }
                    debug("get_po", get_supplier)
                    if (connection) {
                        await poDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                }
            }
            catch(error) {
                if (connection) {
                    await poDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }

    GetSupplierProductList(branch_id,supplier_id, query) {
        return new Promise(async(resolve, reject) => {
            var poDao = new PoDao();
            var connection = null;
            var get_supplier_product;
            try {
                connection = await poDao.getReadConnection();
                get_supplier_product = await poDao.getSupplierProductList(connection, branch_id, supplier_id);
                if(get_supplier_product.hasOwnProperty('status') && get_supplier_product.status == 404) {
                    if (connection) {
                        await poDao.releaseReadConnection(connection);
                    }
                    return resolve(get_supplier_product);
                }
                else{
                    var total_size = get_supplier_product.length;
                    var page_size = get_supplier_product.length//query.skip ? query.skip : total_size;
                    var result_size = get_supplier_product.length//strLimit;
                    console.log("Totalsize :", total_size);
                    var summary = {
                        filteredsize: page_size, resultsize: result_size, totalsize: total_size
                    };
                    var res = {
                        summary, results: get_supplier_product
                    }
                    debug("get_po", get_supplier_product)
                    if (connection) {
                        await poDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                }
            }
            catch(error) {
                if (connection) {
                    await poDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }

    poGoodsReceipt(data,  query) {
        return new Promise(async (resolve, reject) => {
            var poDao = new PoDao();
            var read_connection = null;
            var set_po_goods=null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            try {
                read_connection = await poDao.getReadConnection();                   
                       
                set_po_goods = await InitPoGoods(read_connection, data,  date);
                if (read_connection) {
                    await poDao.releaseReadConnection(read_connection);
                }
                return resolve({po_goods_receipts: set_po_goods}); 
                   
              
            }
            catch (error) {
                debug("Error in error", error)
                if (read_connection) {
                    await poDao.releaseReadConnection(read_connection);
                }
                return reject(error)
            }
        })
    }

    GetGoodReceiptList(org_id,branch_id,supplier_id, query) {
        return new Promise(async(resolve, reject) => {
            var poDao = new PoDao();
            var connection = null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD HH:mm:ss");
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
            var get_po, get_po_count;
            try {
                connection = await poDao.getReadConnection();
                debug("query.filter", query)
               

                get_po = await poDao.getGoodreceiptList(connection, org_id,branch_id,supplier_id,query.filter.po_number,query.filter.item_code);
                // if(query.filter.hasOwnProperty('po_number')) {
           
                //     get_po = await poDao.GetPoListsByStatus(connection, branch_id,supplier_id,query.filter.po_number);
                // }else{
                //  get_po = await poDao.GetPoListsByBranchId(connection, branch_id,supplier_id);
                // }
                if(get_po.hasOwnProperty('status') && get_po.status == 404) {
                    if (connection) {
                        await poDao.releaseReadConnection(connection);
                    }
                    return resolve(get_po);
                }
                else{
                    
                   

                    var total_size = get_po.length;
                    var page_size = get_po.length//query.skip ? query.skip : total_size;
                    var result_size = get_po.length//strLimit;
                    // get_po_count = await poDao.getCountPoByBranchId(connection, branch_id, query);
                    // var total_size = get_po_count;
                    // var page_size = query.skip ? query.skip : get_po_count;
                    // var result_size = strLimit;
                    console.log("Totalsize :", total_size);
                    var summary = {
                        filteredsize: page_size, resultsize: result_size, totalsize: total_size
                    };
                    var res = {
                        summary, results: get_po
                    }
                    if (connection) {
                        await poDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                }
            }
            catch(error) {
                if (connection) {
                    await poDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }

    GetPoSupplierScheduleList(org_id,branch_id,supplier_id, query) {
        return new Promise(async(resolve, reject) => {
            var poDao = new PoDao();
            var connection = null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD HH:mm:ss");
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
            var get_po, get_po_count;
            try {
                connection = await poDao.getReadConnection();
                debug("query.filter", query)
                get_po = await poDao.GetPoSupplierScheduleList(connection, org_id,branch_id,supplier_id,query);
                if(get_po.hasOwnProperty('status') && get_po.status == 404) {
                    if (connection) {
                        await poDao.releaseReadConnection(connection);
                    }
                    return resolve(get_po);
                }
                else{
                    var total_size = get_po.length;
                    var page_size = get_po.length;
                    var result_size = get_po.length;
                    console.log("Totalsize :", total_size);
                    var summary = {
                        filteredsize: page_size, resultsize: result_size, totalsize: total_size
                    };
                    var res = {
                        summary, results: get_po
                    }
                    if (connection) {
                        await poDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                }
            }
            catch(error) {
                if (connection) {
                    await poDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }

    CreatePoSuppScheduleList(data,  query) {
        return new Promise(async (resolve, reject) => {
            var poDao = new PoDao();
            var read_connection = null;
            var create_po_supplier_payment=null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            try {
                read_connection = await poDao.getReadConnection();                   
                       
                create_po_supplier_payment = await InitPoSupplierPayment(read_connection, data,  date);
                if (read_connection) {
                    await poDao.releaseReadConnection(read_connection);
                }
                return resolve(create_po_supplier_payment);
            }
            catch (error) {
                debug("Error in error", error)
                if (read_connection) {
                    await poDao.releaseReadConnection(read_connection);
                }
                return reject(error)
            }
        })
    }

    CreateReceiptsPayments(data,  query) {
        return new Promise(async (resolve, reject) => {
            var poDao = new PoDao();
            var read_connection = null;
            var create_receipts_payments=null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            try {
                read_connection = await poDao.getReadConnection();                   
                       
                create_receipts_payments = await CreateReceiptspayments(read_connection, data,  date);
                if (read_connection) {
                    await poDao.releaseReadConnection(read_connection);
                }
                return resolve(create_receipts_payments);
            }
            catch (error) {
                debug("Error in CreateReceiptsPayments", error)
                if (read_connection) {
                    await poDao.releaseReadConnection(read_connection);
                }
                return reject(error)
            }
        })
    }
    GetReceiptsPayments(org_id,branch_id, query) {
        return new Promise(async(resolve, reject) => {
            var poDao = new PoDao();
            var connection = null;         
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
            var get_po, get_po_count;
            var from_date = moment(query.filter.from_date).utc().format("YYYY-MM-DD");
            var to_date = moment(query.filter.to_date).utc().format("YYYY-MM-DD");
            try {
                connection = await poDao.getReadConnection();
                debug("query.filter", query)
                get_po = await poDao.GetReceiptPayments(connection, org_id,branch_id,query.filter.account_type,from_date,to_date,query);
                if(get_po.hasOwnProperty('status') && get_po.status == 404) {
                    if (connection) {
                        await poDao.releaseReadConnection(connection);
                    }
                    return resolve(get_po);
                }
                else{
                    var total_size = get_po.length;
                    var page_size = get_po.length;
                    var result_size = get_po.length;
                    console.log("Totalsize :", total_size);
                    var summary = {
                        filteredsize: page_size, resultsize: result_size, totalsize: total_size
                    };
                    var res = {
                        summary, results: get_po
                    }
                    if (connection) {
                        await poDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                }
            }
            catch(error) {
                if (connection) {
                    await poDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }

    GetPoSupplierPayments(org_id,branch_id,supplier_id, query) {
        return new Promise(async(resolve, reject) => {
            var poDao = new PoDao();
            var connection = null;         
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
            var get_po, get_po_count;
          
            try {
                connection = await poDao.getReadConnection();
                debug("query.filter", query)
                get_po = await poDao.GetPoSupplierPayments(connection, org_id,branch_id,supplier_id,query.filter.po_number,query.filter.supp_inv_number,query);
                if(get_po.hasOwnProperty('status') && get_po.status == 404) {
                    if (connection) {
                        await poDao.releaseReadConnection(connection);
                    }
                    return resolve(get_po);
                }
                else{
                    var total_size = get_po.length;
                    var page_size = get_po.length;
                    var result_size = get_po.length;
                    console.log("Totalsize :", total_size);
                    var summary = {
                        filteredsize: page_size, resultsize: result_size, totalsize: total_size
                    };
                    var res = {
                        summary, results: get_po
                    }
                    if (connection) {
                        await poDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                }
            }
            catch(error) {
                if (connection) {
                    await poDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }


    GetGoodReceiptReportList(org_id,branch_id,query) {
        return new Promise(async(resolve, reject) => {
            var poDao = new PoDao();
            var connection = null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD HH:mm:ss");
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
            var get_po_goods_receipt_report, get_po_count;
            var from_date = moment(query.filter.from_date).utc().format("YYYY-MM-DD");
            var to_date = moment(query.filter.to_date).utc().format("YYYY-MM-DD")
            try {
                connection = await poDao.getReadConnection();
                debug("query.filter", query)
                get_po_goods_receipt_report = await poDao.GetGoodReceiptReportList(connection, org_id,branch_id,from_date, to_date);
                if(get_po_goods_receipt_report.hasOwnProperty('status') && get_po_goods_receipt_report.status == 404) {
                    if (connection) {
                        await poDao.releaseReadConnection(connection);
                    }
                    return resolve(get_po_goods_receipt_report);
                }
                else{
                    var total_size = get_po_goods_receipt_report.length;
                    var page_size = get_po_goods_receipt_report.length
                    var result_size = get_po_goods_receipt_report.length
                    console.log("Totalsize :", total_size);
                    var summary = {
                        filteredsize: page_size, resultsize: result_size, totalsize: total_size
                    };
                    var res = {
                        summary, results: get_po_goods_receipt_report
                    }
                    if (connection) {
                        await poDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                }
            }
            catch(error) {
                if (connection) {
                    await poDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }

    GetSupplierPaymentReportList(org_id,branch_id,query) {
        return new Promise(async(resolve, reject) => {
            var poDao = new PoDao();
            var connection = null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD HH:mm:ss");
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
            var get_supplier_payment_report;
            var from_date = moment(query.filter.from_date).utc().format("YYYY-MM-DD");
            var to_date = moment(query.filter.to_date).utc().format("YYYY-MM-DD")
            try {
                connection = await poDao.getReadConnection();
                debug("query.filter", query)
                get_supplier_payment_report = await poDao.GetSupplierPaymentReportList(connection, org_id,branch_id,from_date, to_date);
                if(get_supplier_payment_report.hasOwnProperty('status') && get_supplier_payment_report.status == 404) {
                    if (connection) {
                        await poDao.releaseReadConnection(connection);
                    }
                    return resolve(get_supplier_payment_report);
                }
                else{
                    var total_size = get_supplier_payment_report.length;
                    var page_size = get_supplier_payment_report.length
                    var result_size = get_supplier_payment_report.length
                    console.log("Totalsize :", total_size);
                    var summary = {
                        filteredsize: page_size, resultsize: result_size, totalsize: total_size
                    };
                    var res = {
                        summary, results: get_supplier_payment_report
                    }
                    if (connection) {
                        await poDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                }
            }
            catch(error) {
                if (connection) {
                    await poDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }

    GetPoInvoiceSummaryReportList(org_id,branch_id,query) {
        return new Promise(async(resolve, reject) => {
            var poDao = new PoDao();
            var connection = null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD HH:mm:ss");
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
            var get_po_summary_report;
            var from_date = moment(query.filter.from_date).utc().format("YYYY-MM-DD");
            var to_date = moment(query.filter.to_date).utc().format("YYYY-MM-DD")
            try {
                connection = await poDao.getReadConnection();
                debug("query.filter", query)
                get_po_summary_report = await poDao.GetPoInvoiceSummaryReportList(connection, org_id,branch_id,from_date,to_date);
                if(get_po_summary_report.hasOwnProperty('status') && get_po_summary_report.status == 404) {
                    if (connection) {
                        await poDao.releaseReadConnection(connection);
                    }
                    return resolve(get_po_summary_report);
                }
                else{
                 

                 for(var i in get_po_summary_report) {
                    var supplier_id = get_po_summary_report[i].supplier_id;
                    var   get_po_detail_report = await poDao.GetPoInvoiceDetailReportList(connection, org_id,branch_id,supplier_id,from_date,to_date);
                    if(get_po_detail_report == null) {
                        var empty_array = [];
                        get_po_summary_report[i]["details"] = empty_array;
                    }
                    else{
                        get_po_summary_report[i]["details"] = get_po_detail_report;
                    }
                }

                    var total_size = get_po_summary_report.length;
                    var page_size = get_po_summary_report.length
                    var result_size = get_po_summary_report.length
                    console.log("Totalsize :", total_size);
                    var summary = {
                        filteredsize: page_size, resultsize: result_size, totalsize: total_size
                    };
                    var res = {
                        summary, results: get_po_summary_report
                    }
                    if (connection) {
                        await poDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                }
            }
            catch(error) {
                if (connection) {
                    await poDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }
}

function generateId(connection, data, seq_type) {
    return new Promise(async(resolve, reject) => {
        var poDao = new PoDao();
        var po_invoice, po_number;
        
        try{
            po_invoice = await poDao.getInvoiceNo(connection,data.branch_id, seq_type);
            if(po_invoice != null) {
                po_number = po_invoice.invoice_no;
                return resolve(po_number);
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

function categories_data_to_schema_po_header_data_to_create(connection, data, date, eod_date){
    return new Promise(async(resolve, reject) => {
        try {
            var po_number;
            var seq_type = 'PO';
            po_number = await generateId(connection, data, seq_type)

            var po_data = {
                org_id: data.org_id, 
                branch_id: data.branch_id, 
                po_number: po_number, 
                po_date: eod_date, 
                supplier_id: data.supplier_id, 
                po_status: data.po_status, 
                //po_paid: 0, 
                goods_rcpt_status: data.goods_rcpt_status,  
                //supp_inv_amt: 0, 
                updated_by: data.user_id, 
                updated_date: date, 
                created_by: data.user_id, 
                created_date: date
            }
            return resolve(po_data)
        }
        catch (error) {
            return reject(error);    
        }
    })
}

function categories_data_to_schema_po_header_data_to_update(data, get_po_number_data, date) {
    return new Promise(async(resolve, reject) => {
        try {
            var po_data = {
                org_id: get_po_number_data.org_id, 
                branch_id: get_po_number_data.branch_id, 
                po_number: get_po_number_data.po_number, 
                po_date: data.po_date, 
                supplier_id: data.supplier_id, 
                po_status: "D", 
                po_paid: 0, 
                goods_rcpt_status: "P", 
                supp_inv_amt: data.supp_inv_amt, 
                updated_by: get_po_number_data.user_id, 
                updated_date: date, 
                created_by: get_po_number_data.user_id, 
                created_date: date
            }
            return resolve(po_data)
        }
        catch (error) {
            return reject(error);    
        }
    })
}

function InitPoDetail(connection, data, po_header_data, date) {
    return new Promise(async(resolve, reject) => {
        try {
            var poDao = new PoDao();
            var po_detail = []; 
            var net_value = 0, po_balance = 0;
         
           
            for(var i in data.po_details) {
                var po_details = data.po_details[i];
                var exp_del_date =null;
                if(po_details.hasOwnProperty('exp_del_date')) {
                    exp_del_date= moment(po_details.exp_del_date).utc().format("YYYY-MM-DD");
                }
                var po_detail_data = {
                    org_id: data.org_id, 
                    branch_id: data.branch_id, 
                    po_number: po_header_data.po_number, 
                    po_date: po_header_data.po_date, 
                    supplier_id: data.supplier_id, 
                    item_code: po_details.item_code, 
                    qty_ordered: po_details.qty_ordered, 
                    item_cost: po_details.item_cost, 
                  //  item_disc: po_details.item_disc, 
                    //item_other_charge: po_details.item_other_charge, 
                    net_value: po_details.net_value,
                   // qty_received: po_details.qty_received, 
                    qty_balance: po_details.qty_ordered, 
                    item_status:  po_details.item_status, 
                   // supp_inv_amt: 0,
                    exp_del_date: exp_del_date,
                    remarks: po_details.remarks,
                    del_branch_id: po_details.del_branch_id,
                    updated_by: data.user_id,
                    updated_date: date, 
                    created_by: data.user_id, 
                    created_date: date
                }
                var set_po_detail_data = await poDao.createPoDetail(connection, po_detail_data);
                po_detail.push(set_po_detail_data);
               // net_value += (po_details.qty_ordered * po_details.item_cost);
                net_value += po_details.net_value;
               // po_balance = net_value;
            }
            var update_po_header = {
                po_value: net_value
            }
            var update_po_data = await poDao.updatePoHeader(connection, update_po_header, po_header_data.po_number);
            debug("update_po_data", update_po_data);
            var return_data = {po_detail: po_detail, update_po_data: update_po_data}
            return resolve(return_data);
        }
        catch (error) {
            debug("Error in InitPoDetail", error);
            return reject(error);    
        }
    })
}


function InitPoSubmission(connection, data,  date) {
    return new Promise(async(resolve, reject) => {
        try {
            var poDao = new PoDao();
            var po_detail = []; 
            for(var i in data.po_headers) {
                var po_details = data.po_headers[i];               
                var update_po_header = {                   
                    updated_by: data.user_id,
                    updated_date: date,
                    po_status: po_details.po_status                 
                }
                var update_po_data = await poDao.updatePoHeader(connection, update_po_header, po_details.po_number);
                po_detail.push(update_po_data);
                var po_header_data = await poDao.GetPoData(connection, po_details.po_number)
                var send_email = await createPoEmailData(connection, po_header_data);
                debug("send_email", send_email)
            } 
            return resolve(data);
        }
        catch (error) {
            debug("Error in InitPoDetail", error);
            return reject(error);    
        }
    })
}

function generatePOGoodsNum(connection, data, item_code) {
    return new Promise(async(resolve, reject) => {
        var poDao = new PoDao();
        var po_invoice, po_number;
        
        try{
            po_invoice = await poDao.getMaxReceiptNumber(connection,data.org_id, data.branch_id,data.supplier_id,data.po_number, item_code);
            if(po_invoice != null) {
                po_number = po_invoice.receipt_num+1;
                
                return resolve(po_number);
            }
            else{
                po_number =1;
                return resolve(po_number);
            }
        }
        catch(error) {
            return reject(error)
        }
    })
}

function InitPoGoods(connection, data,  date) {
    return new Promise(async(resolve, reject) => {
        try {
            var poDao = new PoDao();
            var supplierDao = new SupplierDao();
            var po_goods_receipt = []; 
            var seq_type = 'POR';
            var qty_received = 0;
            var qty_balance = 0;
            var supp_inv_amt = 0;
            var header_supp_inv_amt = 0;
            var total_supp_inv_amt=0;
            var receipt_num = 0;
            var item_status, goods_rcpt_status, payment_date, po_status;
            var get_supplier_data = await supplierDao.getSupplierDetail(connection, data.org_id, data.branch_id, data.supplier_id);
            if(get_supplier_data == null) {
                payment_date = null;
            }
            else{
                if(get_supplier_data.credit_days != null && get_supplier_data.credit_days >0) {
                    var pay_date = new Date();
                    pay_date.setDate(pay_date.getDate() + get_supplier_data.credit_days);
                    payment_date = moment(pay_date).utc().format("YYYY-MM-DD");
                    console.log("payment_date", payment_date);
                }
                else{
                    payment_date = null;
                }
            }
            for(var j in data.po_goods) {
               
               
                var po_goods = data.po_goods[j];     
                var receipt_num = await generatePOGoodsNum(connection, data, po_goods.item_code)    
               
                var po_supplier_payment_schedule_data = {
                    org_id: data.org_id, 
                    branch_id: data.branch_id, 
                    po_number: data.po_number, 
                    po_date: data.po_date, 
                    supplier_id: data.supplier_id, 
                    item_code: po_goods.item_code, 
                    receipt_num: receipt_num, 
                    gr_qty_received: po_goods.gr_qty_received, 
                    receipt_date: po_goods.receipt_date, 
                    supp_inv_number: po_goods.supp_inv_number, 
                    gr_supp_inv_amt: po_goods.gr_supp_inv_amt, 
                    supp_inv_date: po_goods.supp_inv_date, 
                    updated_by: data.user_id, 
                    updated_date: date, 
                    created_by: data.user_id, 
                    created_date: date
                }
                var update_po_data = await poDao.createPoGoods(connection, po_supplier_payment_schedule_data);
                po_goods_receipt.push({po_goods_receipt:update_po_data});
                var po_detail = await poDao.GetPoDetail(connection, data.org_id, data.branch_id, data.po_number, data.supplier_id, po_goods.item_code)
                var podtl_qty_received = (po_detail.qty_received == null)?0:po_detail.qty_received;
                var podtl_qty_balance = (po_detail.qty_balance == null)?0:po_detail.qty_balance;
                var podtl_supp_inv_amt = (po_detail.supp_inv_amt == null)?0:po_detail.supp_inv_amt;
                qty_received = podtl_qty_received + po_goods.gr_qty_received;
                qty_balance = podtl_qty_balance - po_goods.gr_qty_received;
                supp_inv_amt = podtl_supp_inv_amt + po_goods.gr_supp_inv_amt;
              
                if(qty_balance == 0) {
                    item_status = "F";
                }
                else{
                    item_status = po_detail.item_status;
                }
                var update_po_detail = {                   
                    updated_by: data.user_id,
                    updated_date: date,
                    qty_balance: qty_balance,
                    qty_received: qty_received,
                    supp_inv_amt: supp_inv_amt,
                    item_status: item_status
                }
                var update_po_detail_data = await poDao.updatePoDetail(connection, update_po_detail, data.org_id, data.branch_id, data.po_number, data.supplier_id, po_goods.item_code);
               
                //Supplier insert/update
                //data.org_id, data.branch_id, data.supplier_id, data.po_number,inv_number
                console.log("Supplier-->",data.org_id, data.branch_id, data.supplier_id, data.po_number, po_goods.supp_inv_number);  
           var get_supplier_payment_data = await poDao.getSuppPaymentData(connection, data.org_id, data.branch_id, data.supplier_id, data.po_number, po_goods.supp_inv_number);
           console.log("Supplier-->",get_supplier_payment_data);      
           if(get_supplier_payment_data == null) {
                       var po_supplier_payment_schedule_data = {
                           org_id: data.org_id, 
                           branch_id: data.branch_id, 
                           po_number: data.po_number, 
                           po_date: data.po_date, 
                           supplier_id: data.supplier_id, 
                           supplier_invoice_num: po_goods.supp_inv_number,
                           supp_inv_amt:po_goods.gr_supp_inv_amt,
                           supp_inv_date: po_goods.supp_inv_date,
                          // supp_inv_amt_paid: supp_inv_amt, 
                           supp_inv_amt_bal: po_goods.gr_supp_inv_amt, 
                           Payment_status: "U", 
                           payment_date: payment_date,
                           updated_by: data.user_id, 
                           updated_date: date, 
                           created_by: data.user_id, 
                           created_date: date
                       }
                       var insert_payment_schedule = await poDao.createPoPaymentSchedule(connection, po_supplier_payment_schedule_data);
                       debug("insert_payment_schedule", insert_payment_schedule);
                   }
                   else{

                   // console.log("Update-->",get_supplier_payment_data,po_goods); 
                     //  var goods_supp_inv_amt = (get_supplier_payment_data.supp_inv_amt == null)?0:get_supplier_payment_data.supp_inv_amt;
                       var po_supplier_payment_schedule_update_data = {
                           supp_inv_amt:  get_supplier_payment_data.supp_inv_amt+po_goods.gr_supp_inv_amt,
                           supp_inv_amt_bal: get_supplier_payment_data.supp_inv_amt_bal+po_goods.gr_supp_inv_amt,
                           updated_date: date, 
                       }

                    //  console.log("Payment--->"+po_supplier_payment_schedule_update_data);
                       var update_payment_schedule = await poDao.updatePoPaymentSchedule(connection, po_supplier_payment_schedule_update_data, data, po_goods.supp_inv_number);
                       debug("update_payment_schedule", update_payment_schedule);
                   }
                
            }

         /*  var goodreceipt_list = await poDao.getGoodreceiptListGrpbyinvno(connection, data.org_id, data.branch_id, data.supplier_id, data.po_number);
            // List of record New record/update  (PO_Supplier_Payment_schedule by data.org_id, data.branch_id, data.supplier_id, data.po_number,supp_inv_number)
            if(goodreceipt_list.length > 0) {
               for(var j in goodreceipt_list) {
                   var goods_receipt_data = goodreceipt_list[j];
                   var get_supplier_payment_data = await poDao.getSuppPaymentData(connection, data.org_id, data.branch_id, data.supplier_id, data.po_number, goods_receipt_data.supp_inv_number);
                   if(get_supplier_payment_data == null) {
                       var po_supplier_payment_schedule_data = {
                           org_id: data.org_id, 
                           branch_id: data.branch_id, 
                           po_number: data.po_number, 
                           po_date: data.po_date, 
                           supplier_id: data.supplier_id, 
                           supplier_invoice_num: goods_receipt_data.supp_inv_number,
                           supp_inv_amt:goods_receipt_data.gr_supp_inv_amt,
                          // supp_inv_amt_paid: supp_inv_amt, 
                           supp_inv_amt_bal: goods_receipt_data.gr_supp_inv_amt, 
                           Payment_status: "U", 
                           payment_date: payment_date,
                           updated_by: data.user_id, 
                           updated_date: date, 
                           created_by: data.user_id, 
                           created_date: date
                       }
                       var insert_payment_schedule = await poDao.createPoPaymentSchedule(connection, po_supplier_payment_schedule_data);
                       debug("insert_payment_schedule", insert_payment_schedule);
                   }
                   else{
                     //  var goods_supp_inv_amt = (get_supplier_payment_data.supp_inv_amt == null)?0:get_supplier_payment_data.supp_inv_amt;
                       var po_supplier_payment_schedule_update_data = {
                           supp_inv_amt:  get_supplier_payment_data+goods_receipt_data.gr_supp_inv_amt,
                           supp_inv_amt_bal: get_supplier_payment_data+goods_receipt_data.gr_supp_inv_amt,
                           updated_date: date, 
                       }
                       var update_payment_schedule = await poDao.updatePoPaymentSchedule(connection, po_supplier_payment_schedule_update_data, data, goods_receipt_data);
                       debug("update_payment_schedule", update_payment_schedule);
                   }
               }
            } */
            var po_header = await poDao.GetPoHeaderData(connection, data.org_id, data.branch_id, data.supplier_id, data.po_number);
            var po_inv_amount = await poDao.GetDetailInvAmt(connection,data.supplier_id, data.po_number);
           // var poheader_supp_inv_amt = (po_header.supp_inv_amt == null)?0:po_header.supp_inv_amt;
           // header_supp_inv_amt = poheader_supp_inv_amt + po_goods.gr_supp_inv_amt;
            //validation for all details f /
            var po_header_count = await poDao.GetPoDetailPendingCount(connection, data.org_id, data.branch_id, data.supplier_id, data.po_number);
            if(po_header_count == null) {
                goods_rcpt_status = "F";
                po_status = "P";
            }   
            else{
                if(po_header_count == 0) {
                    goods_rcpt_status = "F";
                    po_status = "P";
                }else{   
                    goods_rcpt_status = po_header.goods_rcpt_status
                    po_status = po_header.po_status
                }
            }
            var update_po_header = {                   
                updated_by: data.user_id,
                updated_date: date,
                supp_inv_amt: po_inv_amount,
                goods_rcpt_status: goods_rcpt_status,
                po_status : po_status
            }

            var update_po_hedaer = await poDao.updatePoHeader(connection, update_po_header, data.po_number);
            
            return resolve(po_goods_receipt);
        }
        catch (error) {
            debug("Error in InitPoGoods", error);
            return reject(error);    
        }
    })
}

function UpdatePoDetail(connection, data, po_header_data, date, get_po_header_detail_data) {
    return new Promise(async(resolve, reject) => {
        try {
            var poDao = new PoDao();
            var po_detail = [];
         
            for(var i in get_po_header_detail_data) {
                var po_details = get_po_header_detail_data[i];
                var exp_del_date =null;
                if(po_details.hasOwnProperty('exp_del_date')) {
                    exp_del_date= moment(po_details.exp_del_date).utc().format("YYYY-MM-DD");
                }
                var po_detail_data = {
                    item_code: po_details.item_code, 
                    qty_ordered: po_details.qty_ordered, 
                    item_cost: po_details.item_cost, 
                  //  item_disc: po_details.item_disc, 
                    //item_other_charge: po_details.item_other_charge, 
                    net_value: po_details.net_value,
                   // qty_received: po_details.qty_received, 
                    qty_balance: po_details.qty_ordered, 
                    item_status:  po_details.item_status, 
                   // supp_inv_amt: 0,
                    exp_del_date: exp_del_date,
                    remarks: po_details.remarks,
                    del_branch_id: po_details.del_branch_id,
                    updated_date: date
                }
                var set_po_detail_data = await poDao.updatePoDetails(connection, po_detail_data, data.org_id, data.branch_id, po_header_data.po_number);
                po_detail.push(set_po_detail_data);
            }
            var return_data = {po_detail: po_detail}
            return resolve(return_data);
        }
        catch (error) {
            debug("Error in UpdatePoDetail", error);
            return reject(error);    
        }
    })
}

function generatePOSupplierPayNum(connection, data, item_code) {
    return new Promise(async(resolve, reject) => {
        var poDao = new PoDao();
        var po_invoice;
        
        try{
            po_invoice = await poDao.getMaxPoSupplierPayment(connection,data.supplier_id,data.po_number, data.supplier_invoice_num);
            return resolve(po_invoice)
        }
        catch(error) {
            return reject(error)
        }
    })
}

function InitPoSupplierPayment(connection, data,  date) {
    return new Promise(async(resolve, reject) => {
        try {
            var supp_inv_amt_paid = 0, supp_inv_amt_bal, payment_status, po_paid = 0, po_balance = 0, po_status, payment_num;
            var poDao = new PoDao();
            var create_po_supplier_payment, po_supplier_payment_data, get_po_pay_supplier, get_payment_value;
            var update_po_supplier_payment_schedule_data, update_supplier_pay_schedule, update_po_header; 
            var update_po_header_data, get_supp_inv_amt_paid, get_supp_inv_amt_bal, get_po_paid, get_po_balance, err_code;
            var payment_value = (data.hasOwnProperty('payment_value') && (data.payment_value == null || data.payment_value == ''))?0:data.payment_value;

            if(data.hasOwnProperty('payment_num') && data.payment_num != null && data.payment_num.length > 0) {
                get_po_pay_supplier = await poDao.getPoSupplierPayment(connection, data.org_id,data.branch_id,data.po_number, data.supplier_id,data.supplier_invoice_num, data.payment_num);
                if(get_po_pay_supplier != null) {
                    get_payment_value = (get_po_pay_supplier.payment_value != null)?get_po_pay_supplier.payment_value:0;

                    var get_supplier_payment_schedule_data = await poDao.GetPoSupplierSchedule(connection, data.org_id,data.branch_id,data.po_number, data.supplier_id,data.supplier_invoice_num);
                    if(get_supplier_payment_schedule_data != null) {
                        get_supp_inv_amt_paid = (get_supplier_payment_schedule_data.supp_inv_amt_paid != null)?get_supplier_payment_schedule_data.supp_inv_amt_paid:0;
                        get_supp_inv_amt_bal = (get_supplier_payment_schedule_data.supp_inv_amt_bal != null)?get_supplier_payment_schedule_data.supp_inv_amt_bal:0;
    
                        supp_inv_amt_paid = (get_supp_inv_amt_paid + payment_value - get_payment_value);
                        supp_inv_amt_bal = (get_supp_inv_amt_bal - payment_value + get_payment_value);
                        payment_status = (supp_inv_amt_bal == 0)?"P":get_supplier_payment_schedule_data.payment_status;
    
                        update_po_supplier_payment_schedule_data = {
                            supp_inv_amt_paid: supp_inv_amt_paid,
                            supp_inv_amt_bal: supp_inv_amt_bal,
                            payment_status: payment_status,
                            updated_date: date
                        }
                        update_supplier_pay_schedule = await poDao.updatePoPaySchedule(connection, update_po_supplier_payment_schedule_data, data);
                    }
                    else{
                        debug("payment Scheduler value not avaiable");
                        create_po_supplier_payment = { status: 500, code: 5001, message: "Sorry, Data Not Found!.", developerMessage: "Sorry, Data Not Found!." };
                    }
                    var get_po_data = await poDao.GetPoHeaderData(connection, data.org_id, data.branch_id,data.supplier_id, data.po_number);
                    if(get_po_data != null) {
                        get_po_paid = (get_po_data.po_paid != null)?get_po_data.po_paid:0;
                        get_po_balance = (get_po_data.po_balance != null)?get_po_data.po_balance:0;
                        var get_supplier_payment_schedule_count = await poDao.GetPoSupplierScheduleCount(connection, data.org_id,data.branch_id,data.po_number, data.supplier_id);
                        debug("get_supplier_payment_schedule_count", get_supplier_payment_schedule_count)
                        
                        po_paid = get_po_paid + payment_value - get_payment_value;
                        po_balance = get_po_balance - payment_value + get_payment_value;
                        po_status = (get_supplier_payment_schedule_count == 0)?"X":get_po_data.po_status;
    
                        update_po_header_data = {
                            po_paid: po_paid,
                            po_balance: po_balance,
                            po_status: po_status,
                            updated_date: date
                        }
                        update_po_header = await poDao.updatePoHeader(connection, update_po_header_data, data.po_number);
                    }
                    else{
                        debug("po value not avaiable");
                        create_po_supplier_payment = { status: 500, code: 5001, message: "Sorry, Data Not Found!.", developerMessage: "Sorry, Data Not Found!." };
                    }
                    var update_payment_supplier_data = {
                        payment_value: payment_value,
                        payment_date: data.payment_date,
                        payment_mode: data.payment_mode,
                        payment_desc: data.payment_desc,
                        updated_by: data.user_id, 
                        updated_date: date       
                    }
                    create_po_supplier_payment = await poDao.updatePoSupplierPayment(connection, update_payment_supplier_data,  data.org_id,data.branch_id,data.po_number, data.supplier_id,data.supplier_invoice_num, data.payment_num)
                    return resolve(create_po_supplier_payment)
                }
                else{
                    create_po_supplier_payment = { status: 500, code: 5001, message: "Sorry, Invalid Payment Number!.", developerMessage: "Sorry, Invalid Payment Number!." };
                    return reject(create_po_supplier_payment)
                }
            }
            else{
                var get_max_payment_num = await generatePOSupplierPayNum(connection, data);
                if(get_max_payment_num != null) {
                    payment_num = get_max_payment_num.payment_num + 1;
                }
                else{
                    payment_num =1;
                }
                /* Create po suppplier payment */
                po_supplier_payment_data = {
                    org_id: data.org_id, 
                    branch_id: data.branch_id, 
                    po_number: data.po_number,
                    supplier_id:data.supplier_id,
                    supplier_invoice_num: data.supplier_invoice_num,
                    payment_num: payment_num,
                    po_date: data.po_date, 
                    payment_value: payment_value,
                    payment_date: data.payment_date,
                    payment_mode: data.payment_mode,
                    payment_desc: data.payment_desc,
                    updated_by: data.user_id, 
                    updated_date: date, 
                    created_by: data.user_id, 
                    created_date: date                
                }
                create_po_supplier_payment = await poDao.createPoSupplierPayment(connection, po_supplier_payment_data);
                var get_supplier_payment_schedule_data = await poDao.GetPoSupplierSchedule(connection, data.org_id,data.branch_id,data.po_number, data.supplier_id,data.supplier_invoice_num);
                if(get_supplier_payment_schedule_data != null) {
                    get_supp_inv_amt_paid = (get_supplier_payment_schedule_data.supp_inv_amt_paid != null)?get_supplier_payment_schedule_data.supp_inv_amt_paid:0;
                    get_supp_inv_amt_bal = (get_supplier_payment_schedule_data.supp_inv_amt_bal != null)?get_supplier_payment_schedule_data.supp_inv_amt_bal:0;
                    
                    supp_inv_amt_paid = get_supp_inv_amt_paid + payment_value;
                    supp_inv_amt_bal = (get_supp_inv_amt_bal == 0)?(get_supplier_payment_schedule_data.supp_inv_amt - payment_value):(get_supp_inv_amt_bal - payment_value);
                    payment_status = (supp_inv_amt_bal == 0)?"P":get_supplier_payment_schedule_data.payment_status;

                    update_po_supplier_payment_schedule_data = {
                        supp_inv_amt_paid: supp_inv_amt_paid,
                        supp_inv_amt_bal: supp_inv_amt_bal,
                        payment_status: payment_status,
                        updated_date: date
                    }
                    update_supplier_pay_schedule = await poDao.updatePoPaySchedule(connection, update_po_supplier_payment_schedule_data, data);
                }
                else{
                    debug("payment Scheduler value not avaiable");
                    create_po_supplier_payment = { status: 500, code: 5001, message: "Sorry, Data Not Found!.", developerMessage: "Sorry, Data Not Found!." };
                }
                var get_po_data = await poDao.GetPoHeaderData(connection, data.org_id, data.branch_id,data.supplier_id, data.po_number);
                if(get_po_data != null) {
                    get_po_paid = (get_po_data.po_paid != null)?get_po_data.po_paid:0;
                    get_po_balance = (get_po_data.po_balance != null)?get_po_data.po_balance:0;
                    var get_supplier_payment_schedule_count = await poDao.GetPoSupplierScheduleCount(connection, data.org_id,data.branch_id,data.po_number, data.supplier_id);
                    debug("get_supplier_payment_schedule_count", get_supplier_payment_schedule_count)

                    po_paid = get_po_paid + payment_value;
                    po_balance = (get_po_balance == 0)?(get_po_data.po_value - payment_value):(get_po_balance - payment_value);
                    po_status = (get_supplier_payment_schedule_count == 0)?"F":get_po_data.po_status;

                    update_po_header_data = {
                        po_paid: po_paid,
                        po_balance: po_balance,
                        po_status: po_status,
                        updated_date: date
                    }
                    update_po_header = await poDao.updatePoHeader(connection, update_po_header_data, data.po_number);
                }
                else{
                    debug("po value not avaiable");
                    create_po_supplier_payment = { status: 500, code: 5001, message: "Sorry, Data Not Found!.", developerMessage: "Sorry, Data Not Found!." };
                }
                return resolve(create_po_supplier_payment) 
            }
        }
        catch (error) {
            debug("Error in InitPoGoods", error);
            return reject(error);    
        }
    })
}


function generateReceiptPaymentId(connection, data, seq_type) {
    return new Promise(async(resolve, reject) => {
        var poDao = new PoDao();
        var receipt_pay, transaction_id;
        
        try{
            receipt_pay = await poDao.getReceiptPaymentId(connection,data.branch_id, seq_type);
            if(receipt_pay != null) {
                transaction_id = receipt_pay.trans_id;
                return resolve(transaction_id);
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

function CreateReceiptspayments(connection, data,  date) {
    return new Promise(async(resolve, reject) => {
        try {
            var seq_type = 'RCPPAY';
            var get_receipt_payment, create_receipts_payment, trans_id;
            var poDao = new PoDao();
            if(data.hasOwnProperty('trans_id') && data.trans_id != null && data.trans_id.length > 0) {
                get_receipt_payment = await poDao.getReceiptPayData(connection, data.org_id,data.branch_id,data.trans_id);
                if(get_receipt_payment != null) {
                    var trans_date;
                    var voucher_date;
                    if(data.hasOwnProperty('trans_date') && data.trans_date!='') {                  
                        trans_date = moment(data.trans_date).utc().format("YYYY-MM-DD");
                    }
                    else{                        
                        if(get_receipt_payment.trans_date!=null){
                            trans_date = moment(get_receipt_payment.trans_date).utc().format("YYYY-MM-DD");
                            
                        }else{
                            trans_date=null;
                        }
                    }
                    if(data.hasOwnProperty('voucher_date') && data.voucher_date!='') {                  
                        voucher_date = moment(data.voucher_date).utc().format("YYYY-MM-DD");
                    }
                    else{                        
                        if(get_receipt_payment.voucher_date!=null){
                            voucher_date = moment(get_receipt_payment.voucher_date).utc().format("YYYY-MM-DD");
                            
                        }else{
                            voucher_date=null;
                        }
                    }
                    var update_receipt_payments_data = {
                        account_type: data.hasOwnProperty('account_type')?data.account_type:get_receipt_payment.account_type, 
                        account_code: data.hasOwnProperty('account_code')?data.account_code:get_receipt_payment.account_code, 
                        trans_date: trans_date, 
                        account_value: data.hasOwnProperty('account_value')?data.account_value:get_receipt_payment.account_value, 
                        trans_narration: data.hasOwnProperty('trans_narration')?data.trans_narration:get_receipt_payment.trans_narration, 
                        addl_remarks: data.hasOwnProperty('addl_remarks')?data.addl_remarks:get_receipt_payment.addl_remarks, 
                        voucher_num: data.hasOwnProperty('voucher_num')?data.voucher_num:get_receipt_payment.voucher_num, 
                        voucher_date: voucher_date, 
                        rp_for: data.hasOwnProperty('rp_for')?data.rp_for:get_receipt_payment.rp_for, 
                        rp_name_id: data.hasOwnProperty('rp_name_id')?data.rp_name_id:get_receipt_payment.rp_name_id, 
                        rp_name_other: data.hasOwnProperty('rp_name_other')?data.rp_name_other:get_receipt_payment.rp_name_other, 
                        payment_mode: data.hasOwnProperty('payment_mode')?data.payment_mode:get_receipt_payment.payment_mode, 
                        payment_ref: data.hasOwnProperty('payment_ref')?data.payment_ref:get_receipt_payment.payment_ref, 
                        updated_date: date
                    }
                    create_receipts_payment = await poDao.updateReceiptPayData(connection, update_receipt_payments_data, data.org_id,data.branch_id,data.trans_id);
                    return resolve(create_receipts_payment) 
                }
                else{
                    create_receipts_payment = { status: 500, code: 5001, message: "Sorry, Invalid TransactionId!.", developerMessage: "Sorry, Invalid TransactionId!." };
                    return reject(create_receipts_payment)
                }
            }
            else{
                var trans_id = await generateReceiptPaymentId(connection, data, seq_type);
                debug("get_max_payment_num", trans_id);
                var trans_date = new Date(data.trans_date);
                var voucher_date;
                if(data.hasOwnProperty('voucher_date') && data.voucher_date!='') {
                  
                    voucher_date = moment(data.voucher_date).utc().format("YYYY-MM-DD");
                }
                else{
                    voucher_date=null;
                    
                }
                debug("trans_date", trans_date);
                var eod_date = moment(trans_date).utc().format("MMMYYYY");
                eod_date = eod_date.toUpperCase();
                var receipt_pay = trans_id.replace(data.branch_id, '');
                trans_id = `${data.branch_id}${eod_date}${receipt_pay}`;
                debug("get_max_payment_num111", trans_id)
                var receipt_payments_data = {
                    org_id: data.org_id, 
                    branch_id: data.branch_id, 
                    trans_id: trans_id, 
                    account_type: data.account_type, 
                    account_code: data.account_code, 
                    trans_date: data.trans_date, 
                    account_value: data.account_value, 
                    trans_narration: data.trans_narration, 
                    addl_remarks: data.addl_remarks, 
                    voucher_num: data.voucher_num, 
                    voucher_date: voucher_date, 
                    rp_for: data.rp_for, 
                    rp_name_id: data.rp_name_id, 
                    rp_name_other: data.rp_name_other, 
                    payment_mode: data.payment_mode, 
                    payment_ref: data.payment_ref, 
                    updated_by: data.user_id, 
                    updated_date: date, 
                    created_by: data.user_id,
                    created_date: date
                }
                create_receipts_payment = await poDao.createReceiptPayData(connection, receipt_payments_data);
                return resolve(create_receipts_payment) 
            }
        }
        catch (error) {
            debug("Error in InitPoGoods", error);
            return reject(error);    
        }
    })
}

function createPoEmailData(read_connection, po_header_data) {
    return new Promise(async(resolve, reject) => {
        var poDao = new PoDao();
        var email_data = null;
        try {
                
            var org_id= po_header_data.org_id;
            var branch_id = po_header_data.branch_id;
            var supplier_id = po_header_data.supplier_id;
            var po_number = po_header_data.po_number;
            var get_from_email_data = await poDao.GetFromEmailData(read_connection, org_id, branch_id);
            var get_to_email_data = await poDao.GetToEmailData(read_connection, org_id, supplier_id);
            var get_po_data = await poDao.GetPoEmailData(read_connection, org_id, po_number);
            var po_body_data = await poDao.GetPoEmailBodyData(read_connection, org_id, po_number);
            var po_footer_data = await poDao.GetPoEmailFooterData(read_connection, org_id, po_number);
            if(get_from_email_data && get_to_email_data && get_po_data && po_body_data && po_footer_data) {
                var send_email_data = {
                    get_from_email_data: get_from_email_data,
                    get_to_email_data: get_to_email_data,
                    get_po_data: get_po_data,
                    po_body_data: po_body_data,
                    po_footer_data: po_footer_data
                }
                var email_data = await SendEmailData(send_email_data);
                return resolve(email_data);
            }
            else{
                return resolve(email_data);
            }
        } catch (error) {
            debug("Error in createPoEmailData", error);
            return reject(error);
        }
    })
}
module.exports = {
   PoModule,
   generateId
}
