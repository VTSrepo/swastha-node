const { SupplierDao } = require('../dao/supplier_dao');
var debug = require('debug')('v2:consulting:module');
const {changeLog} = require('../../common/error_handling');
var moment = require('moment-timezone');
const { GetRandomPatientID } = require('../../common/app_utils');

class SupplierModule {

    CreateSupplier(data,  query) {
        return new Promise(async (resolve, reject) => {
            var supplierDao = new SupplierDao();
            var read_connection = null;
            var supplier_data, set_supplier_data, user_supplier;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            try {
                read_connection = await supplierDao.getReadConnection();

                if(data.hasOwnProperty('credit_days')){
                    if(data.credit_days == ""){
                    data.credit_days=0;
                    }
                }else{
                    data.credit_days=0;
                }
                if(data.hasOwnProperty('supplier_id')) {
                    var get_supplier_data = await supplierDao.geSupplierId(read_connection, data.supplier_id);
                    if(get_supplier_data.hasOwnProperty('status')) {
                        set_supplier_data = await categories_data_to_schema_supplier_data_to_create(read_connection, data, date);
                        debug("set_supplier_data", set_supplier_data)
                        supplier_data = await supplierDao.createSupplier(read_connection, set_supplier_data);
                        if (read_connection) {
                            await supplierDao.releaseReadConnection(read_connection);
                        }
                        return resolve(supplier_data); 
                    }
                    else{
                        user_supplier = await categories_data_to_schema_supplier_data_to_update(data, get_supplier_data, date);
                        supplier_data = await supplierDao.updateSupplier(read_connection, user_supplier, data.supplier_id);
                        if (read_connection) {
                            await supplierDao.releaseReadConnection(read_connection);
                        }
                        return resolve(supplier_data); 
                    }
                }
                else{
                    set_supplier_data = await categories_data_to_schema_supplier_data_to_create(read_connection, data, date);
                    debug("set_supplier_data", set_supplier_data)
                    supplier_data = await supplierDao.createSupplier(read_connection, set_supplier_data);
                    if (read_connection) {
                        await supplierDao.releaseReadConnection(read_connection);
                    }
                    return resolve(supplier_data);
                }
            }
            catch (error) {
                debug("error", error)
                if (read_connection) {
                    await supplierDao.releaseReadConnection(read_connection);
                }
                return reject(error)
            }
        })
    }

    GetSupplierList(org_id,branch_id, query) {
        return new Promise(async(resolve, reject) => {
            var supplierDao = new SupplierDao();
            var connection = null;
            var get_suppliers;
            try {
                connection = await supplierDao.getReadConnection();
                if(query.filter.hasOwnProperty('supplier_id')) {
                    get_suppliers = await supplierDao.geSupplierId(connection, query.filter.supplier_id);
                }else{
                    get_suppliers = await supplierDao.getSupplierList(connection, org_id,branch_id);
                }
                
                if(get_suppliers.hasOwnProperty('status') && get_suppliers.status == 404) {
                    if (connection) {
                        await supplierDao.releaseReadConnection(connection);
                    }
                    return resolve(get_suppliers);
                }
                else{
                    var total_size = get_suppliers.length;
                    var page_size = get_suppliers.length//query.skip ? query.skip : total_size;
                    var result_size = get_suppliers.length//strLimit;
                    console.log("Totalsize :", total_size);
                    var summary = {
                        filteredsize: page_size, resultsize: result_size, totalsize: total_size
                    };
                    var res = {
                        summary, results: get_suppliers
                    }
                    debug("GetSupplierList", get_suppliers)
                    if (connection) {
                        await supplierDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                }
            }
            catch(error) {
                if (connection) {
                    await supplierDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }

   GetSupplierProductpriceByProductId(product_id, query) {
        return new Promise(async(resolve, reject) => {
            var supplierDao = new SupplierDao();
            var connection = null;
            var get_supplier_product;
            try {
                connection = await supplierDao.getReadConnection();
                get_supplier_product = await supplierDao.getSupplierProductpriceByProductId(connection,product_id);
                if(get_supplier_product.hasOwnProperty('status') && get_supplier_product.status == 404) {
                    if (connection) {
                        await supplierDao.releaseReadConnection(connection);
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
                    debug("GetSupplierProductList", get_supplier_product)
                    if (connection) {
                        await supplierDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                }
            }
            catch(error) {
                if (connection) {
                    await supplierDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }

    GetSupplierProductList(branch_id,supplier_id, query) {
        return new Promise(async(resolve, reject) => {
            var supplierDao = new SupplierDao();
            var connection = null;
            var get_supplier_product;
            var eod_date; 
            if(query.filter.hasOwnProperty('eod_date')) {
             eod_date = moment(query.filter.eod_date).format("YYYY-MM-DD");
            }
            try {
                connection = await supplierDao.getReadConnection();
                get_supplier_product = await supplierDao.getSupplierProductList(connection, branch_id, supplier_id,eod_date,query);
                if(get_supplier_product.hasOwnProperty('status') && get_supplier_product.status == 404) {
                    if (connection) {
                        await supplierDao.releaseReadConnection(connection);
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
                    debug("GetSupplierProductList", get_supplier_product)
                    if (connection) {
                        await supplierDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                }
            }
            catch(error) {
                if (connection) {
                    await supplierDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }


    //flag =S (similar) with eod date
    // flag = F (Full)

    supplierwiseProduct(org_id,branch_id, query) {
        return new Promise(async(resolve, reject) => {
            var supplierDao = new SupplierDao();
            var connection = null;
            var get_supplier_product;
            var eod_date; 
            var flag= query.filter.flag;
            if(flag =='S'){
                if(query.filter.hasOwnProperty('eod_date')) {
                    eod_date = moment(query.filter.eod_date).format("YYYY-MM-DD");
                }else{
                    eod_date = moment(today).format("YYYY-MM-DD");
                    
                }
            }
            try {
                connection = await supplierDao.getReadConnection();
                get_supplier_product = await supplierDao.supplierwiseProduct(connection, org_id, branch_id, eod_date,flag);
                if(get_supplier_product.hasOwnProperty('status') && get_supplier_product.status == 404) {
                    if (connection) {
                        await supplierDao.releaseReadConnection(connection);
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
                    debug("supplierwiseProduct", get_supplier_product)
                    if (connection) {
                        await supplierDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                }
            }
            catch(error) {
                if (connection) {
                    await supplierDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }

    GetSupplierProductListByBranch(org_id,branch_id, query) {
        return new Promise(async(resolve, reject) => {
            var supplierDao = new SupplierDao();
            var connection = null;
            var get_supplier_product;
            var eod_date; 
            if(query.filter.eod_date =='L'){
                if(query.filter.hasOwnProperty('eod_date')) {
                eod_date = moment(query.filter.eod_date).format("YYYY-MM-DD");
                }
            }
            try {
                connection = await supplierDao.getReadConnection();
                get_supplier_product = await supplierDao.getSupplierProductList(connection, branch_id, supplier_id,eod_date,query);
                if(get_supplier_product.hasOwnProperty('status') && get_supplier_product.status == 404) {
                    if (connection) {
                        await supplierDao.releaseReadConnection(connection);
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
                    debug("GetSupplierProductList", get_supplier_product)
                    if (connection) {
                        await supplierDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                }
            }
            catch(error) {
                if (connection) {
                    await supplierDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }
    CreateSupplierProducts(data,  query) {
        return new Promise(async (resolve, reject) => {
            var supplierDao = new SupplierDao();
            var read_connection = null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            var success_flag = "N";
            var supp_prods_data = [];
            var new_from_date;
            try {
                read_connection = await supplierDao.getReadConnection();
                for(var i in data.supp_prods) {
                    if(data.supp_prods[i].eff_from && data.supp_prods[i].eff_from != null && data.supp_prods[i].eff_from.length == 10 ) {
                        success_flag = "Y"
                    }
                    else{}
                }
                if(success_flag == "Y") {
                    for(var j in data.supp_prods) {
                        var old_previous_date = data.supp_prods[j].eff_from;
                        old_previous_date = new Date(old_previous_date);
                        old_previous_date.setDate(old_previous_date.getDate() - 1);
                        old_previous_date = moment(old_previous_date).format("YYYY-MM-DD");
                        console.log("old_previous_date", old_previous_date);

                        if(data.hasOwnProperty('supplier_id') && data.supp_prods[i].hasOwnProperty('product_id')) {
                            var check_supplier_product_count = await supplierDao.GetSupplierProductCount(read_connection, data.org_id, data.branch_id, data.supplier_id, data.supp_prods[j].product_id, old_previous_date);
                            if(check_supplier_product_count == 0) {
                                new_from_date = moment(data.supp_prods[j].eff_from).format("YYYY-MM-DD");
                                var set_supp_prods_data = await categories_data_to_schema_supplier_prod_data_to_create(read_connection, data, data.supp_prods[j], new_from_date, date);
                                var insert_supp_prods_data = await supplierDao.createSupplierProducts(read_connection, set_supp_prods_data);
                                supp_prods_data.push(insert_supp_prods_data);
                            }
                            else {
                                new_from_date = moment(data.supp_prods[j].eff_from).format("YYYY-MM-DD");
                                var set_update_supp_prods_data = await categories_data_to_schema_supplier_prod_data_to_update(read_connection, data, old_previous_date, date);
                                var update_supp_prods_data = await supplierDao.updateSupplierProducts(read_connection, set_update_supp_prods_data, data.org_id, data.branch_id, data.supplier_id, data.supp_prods[j].product_id, old_previous_date)
                                
                                var set_supp_prods_data = await categories_data_to_schema_supplier_prod_data_to_create(read_connection, data, data.supp_prods[j], new_from_date, date);
                                var insert_supp_prods_data = await supplierDao.createSupplierProducts(read_connection, set_supp_prods_data);
                                supp_prods_data.push(insert_supp_prods_data);
                            }
                        }
                        else{
                            new_from_date = moment(data.supp_prods[j].eff_from).format("YYYY-MM-DD");
                            var set_supp_prods_data = await categories_data_to_schema_supplier_prod_data_to_create(read_connection, data, data.supp_prods[j], new_from_date, date);
                            var insert_supp_prods_data = await supplierDao.createSupplierProducts(read_connection, set_supp_prods_data);
                            supp_prods_data.push(insert_supp_prods_data); 
                        }
                    }
                    if (read_connection) {
                        await supplierDao.releaseReadConnection(read_connection);
                    }
                    return reject(supp_prods_data)
                }
                else{
                    var err_code = { status: 402, code: 4001, message: "Invalid Data!.", developerMessage:"Invalid Data!." };
                    if (read_connection) {
                        await supplierDao.releaseReadConnection(read_connection);
                    }
                    return reject(err_code)
                }
            }
            catch (error) {
                debug("error", error)
                if (read_connection) {
                    await supplierDao.releaseReadConnection(read_connection);
                }
                return reject(error)
            }
        })
    }
}

function generateId(connection, data, seq_type) {
    return new Promise(async(resolve, reject) => {
        var supplierDao = new SupplierDao();
        var supplier, supplier_id;
        
        try{
            supplier = await supplierDao.getGenerateSupplierId(connection,data.branch_id, seq_type);
            if(supplier != null) {
                supplier_id = supplier.supplier_id;
                return resolve(supplier_id);
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

function categories_data_to_schema_supplier_data_to_create(connection, data, date){
    return new Promise(async(resolve, reject) => {
        try {
           
            var supplier_id;
            var seq_type = 'SUPP';
            supplier_id = await generateId(connection, data, seq_type)
            debug("supplier_id", supplier_id)
            var po_data = {
                org_id: data.org_id, 
                branch_id: data.branch_id, 
                supplier_id:supplier_id, 
                supplier_name: data.supplier_name, 
                supplier_opendate: data.supplier_opendate, 
                supplier_address: data.supplier_address, 
                supplier_contact_num: data.supplier_contact_num, 
                supplier_email_id: data.supplier_email_id, 
                supplier_cont_pers: data.supplier_cont_pers, 
                supplier_cont_pers_phone: data.supplier_cont_pers_phone, 
                supplier_cont_pers_email: data.supplier_cont_pers_email, 
                supplier_website: data.supplier_website, 
                supplier_gst_num: data.supplier_gst_num, 
                supplier_localgst_num: data.supplier_localgst_num, 
                supplier_cst_num: data.supplier_cst_num,
                credit_days: data.credit_days,
                pan_no: data.pan_no,
                dl_no: data.dl_no,
                bank_name: data.bank_name,
                account_no: data.account_no,
                ifsc_no: data.ifsc_no,                
                chq_name: data.chq_name,
                comm_address: data.comm_address,
                pin_code: data.pin_code,
                bank_branch: data.bank_branch,
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

function categories_data_to_schema_supplier_data_to_update(data, get_po_number_data, date) {
    return new Promise(async(resolve, reject) => {
        try {
            var po_data = {
               
                supplier_name: data.hasOwnProperty('supplier_name')?data.supplier_name:get_po_number_data.supplier_name, 
                supplier_opendate: data.hasOwnProperty('supplier_opendate')?data.supplier_opendate:get_po_number_data.supplier_opendate, 
                supplier_address: data.hasOwnProperty('supplier_address')?data.supplier_address:get_po_number_data.supplier_address, 
                supplier_contact_num: data.hasOwnProperty('supplier_contact_num')?data.supplier_contact_num:get_po_number_data.supplier_contact_num, 
                supplier_email_id: data.hasOwnProperty('supplier_email_id')?data.supplier_email_id:get_po_number_data.supplier_email_id, 
                supplier_cont_pers: data.hasOwnProperty('supplier_cont_pers')?data.supplier_cont_pers:get_po_number_data.supplier_cont_pers, 
                supplier_cont_pers_phone: data.hasOwnProperty('supplier_cont_pers_phone')?data.supplier_cont_pers_phone:get_po_number_data.supplier_cont_pers_phone, 
                supplier_cont_pers_email: data.hasOwnProperty('supplier_cont_pers_email')?data.supplier_cont_pers_email:get_po_number_data.supplier_cont_pers_email, 
                supplier_website: data.hasOwnProperty('supplier_website')?data.supplier_website:get_po_number_data.supplier_website, 
                supplier_gst_num: data.hasOwnProperty('supplier_gst_num')?data.supplier_gst_num:get_po_number_data.supplier_gst_num, 
                supplier_localgst_num: data.hasOwnProperty('supplier_localgst_num')?data.supplier_localgst_num:get_po_number_data.supplier_localgst_num, 
                supplier_cst_num: data.hasOwnProperty('supplier_cst_num')?data.supplier_cst_num:get_po_number_data.supplier_cst_num,
                credit_days: data.hasOwnProperty('credit_days')?data.credit_days:get_po_number_data.credit_days,
                pan_no: data.hasOwnProperty('pan_no')?data.pan_no:get_po_number_data.pan_no,
                dl_no: data.hasOwnProperty('dl_no')?data.dl_no:get_po_number_data.dl_no,
                bank_name: data.hasOwnProperty('bank_name')?data.bank_name:get_po_number_data.bank_name,
                account_no: data.hasOwnProperty('account_no')?data.account_no:get_po_number_data.account_no,
                ifsc_no: data.hasOwnProperty('ifsc_no')?data.ifsc_no:get_po_number_data.ifsc_no,
                chq_name: data.hasOwnProperty('chq_name')?data.chq_name:get_po_number_data.chq_name,
                comm_address: data.hasOwnProperty('comm_address')?data.comm_address:get_po_number_data.comm_address,
                pin_code: data.hasOwnProperty('pin_code')?data.pin_code:get_po_number_data.pin_code,
                bank_branch: data.hasOwnProperty('bank_branch')?data.bank_branch:get_po_number_data.bank_branch,
                updated_by: data.hasOwnProperty('user_id')?data.user_id:get_po_number_data.updated_by, 
                updated_date: date
            }
            return resolve(po_data)
        }
        catch (error) {
            return reject(error);    
        }
    })
}

function categories_data_to_schema_supplier_prod_data_to_create(connection, data, supp_prods, old_previous_date, date){
    return new Promise(async(resolve, reject) => {
        try {
            var prod_data = {
                org_id: data.org_id, 
                branch_id: data.branch_id, 
                supplier_id: data.supplier_id, 
                product_id: supp_prods.product_id, 
                purchase_price: supp_prods.purchase_price, 
                eff_from: old_previous_date,
                eff_to: (supp_prods.hasOwnProperty('eff_to'))?supp_prods.eff_to:null,
                credit_days: supp_prods.credit_days, 
                active_flag: "Y",
                updated_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                updated_date: date, 
                created_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                created_date: date
            }
            return resolve(prod_data)
        }
        catch (error) {
            return reject(error);    
        }
    })
}

function categories_data_to_schema_supplier_prod_data_to_update(connection, data, old_previous_date, date) {
    return new Promise(async(resolve, reject) => {
        try {
            var normal_data = {
                eff_to: old_previous_date,
                updated_by: data.user_id,
                updated_date: date
            }
            return resolve(normal_data)
        }
        catch (error) {
            return reject(error);    
        }
    })
}

module.exports = {
    SupplierModule,
   generateId
}