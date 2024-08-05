const mysql = require('../../common/db_utils');
var debug = require('debug')('v2:billing:dao');
const BaseDao = require('./base_dao');

class BillingDao extends BaseDao {

    generateSplitResults(connection, table_name) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                var sql_query  = `SHOW COLUMNS FROM ${process.env.WRITE_DB_DATABASE}.${table_name}`;
                debug("generateSplitResults :", sql_query);
                let queryres = await connection.query(sql_query);
                return resolve(queryres);
            } catch (err) {
                debug('getCouponDetail :', err)
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getCouponDetail DB Error ', err)
                return reject(err_code);
            }  
        })
    }

    getEOD(connection,org_id,branch_id) {
        return new Promise(async (resolve, reject) => {
            try {
                if (connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage: "DB Connection Failed!." };
                    return reject(err_code)
                }
                console.log('in dao');
                var custQuery = `SELECT DATE_FORMAT(eod_date,'%Y-%m-%d') as eod_date, org_id, branch_id, active_flag FROM 
                ${process.env.WRITE_DB_DATABASE}.Swastha_EOD_OPS where active_flag='Y' and org_id='${org_id}' AND  branch_id='${branch_id}'`;
                console.log(custQuery);
                
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    var invoice_lists = [];
                    return resolve(invoice_lists);
                }
                else{
                    return resolve(queryres);
                }
            }
            catch (err) {
                console.log(err);
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage: "Sorry, Internal Server Error!." };
                debug("Fetch patient advance :", err);
                return reject(err_code);
            }
        })
    }

    createBillingHeader(connection, billing_header_data) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`INSERT INTO ${process.env.WRITE_DB_DATABASE}.Billing_Header SET ?`, billing_header_data);
                debug('COMMIT at createBilling');
                return resolve(billing_header_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("create Billing error :", err);
                return reject(err_code);
            }
        })
    }

    createCancelBilling(connection, billing_cancel_data) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`INSERT INTO ${process.env.WRITE_DB_DATABASE}.Billing_Cancel_Dtl SET ?`, billing_cancel_data);
                debug('COMMIT at billing_cancel_data');
                return resolve(billing_cancel_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("billing_cancel_data error :", err);
                return reject(err_code);
            }
        })
    }


    createBillingDetail(connection, set_billing_detail) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`INSERT INTO ${process.env.WRITE_DB_DATABASE}.Billing_Detail SET ?`, set_billing_detail);
                debug('COMMIT at createBilling');
                return resolve(set_billing_detail);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("create Billing error :", err);
                return reject(err_code);
            }
        })
    }

    createBillingBUDetail(connection, set_billing_detail) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`INSERT INTO ${process.env.WRITE_DB_DATABASE}.Billing_BU_Detail SET ?`, set_billing_detail);
                debug('COMMIT at createBillingBUDetail--->  ',set_billing_detail);
                return resolve(set_billing_detail);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("createBillingBUDetail error :", err);
                return reject(err_code);
            }
        })
    }

    updateBillingHeader(connection, update_billing_header, invoice_no) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`UPDATE ${process.env.WRITE_DB_DATABASE}.Billing_Header SET ? WHERE invoice_no='${invoice_no}'`, update_billing_header);
                debug('COMMIT at updateBilling');
                return resolve(update_billing_header);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("updateBillingHeader Error :", err);
                return reject(err_code);
            }
        })
    }

    getBillingByBranchId(connection, branch_id, query) {
        return new Promise(async(resolve, reject)=> {
            try{
                var custQuery, inv_status;
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                if(query.filter.inv_status.toUpperCase() == 'A') {
                    if(query.filter.patient_id) {
                        custQuery = `SELECT *,(total_base_amt+total_charges) as gross_amt FROM ${process.env.WRITE_DB_DATABASE}.Billing_Header WHERE branch_id='${branch_id}' AND patient_id='${query.filter.patient_id}'`;
                    }
                    else if(query.filter.doctor_id) {
                        custQuery = `SELECT *,(total_base_amt+total_charges) as gross_amt FROM ${process.env.WRITE_DB_DATABASE}.Billing_Header WHERE branch_id='${branch_id}' AND doctor_id='${query.filter.doctor_id}'`;
                    }
                    else{
                        custQuery = `SELECT *,(total_base_amt+total_charges) as gross_amt FROM ${process.env.WRITE_DB_DATABASE}.Billing_Header WHERE branch_id='${branch_id}'`;
                    }
                }
                else{
                    if(query.filter.inv_status.toUpperCase() == 'P' || query.filter.inv_status.toUpperCase() == 'F' || query.filter.inv_status.toUpperCase() == 'C') {
                        inv_status = query.filter.inv_status;
                    }
                    else{
                        inv_status = 'P';
                    }
                    if(query.filter.patient_id) {
                        custQuery = `SELECT *,(total_base_amt+total_charges) as gross_amt FROM ${process.env.WRITE_DB_DATABASE}.Billing_Header WHERE branch_id='${branch_id}' AND patient_id='${query.filter.patient_id}' AND inv_status='${inv_status}'`;
                    }
                    else if(query.filter.doctor_id) {
                        custQuery = `SELECT *,(total_base_amt+total_charges) as gross_amt FROM ${process.env.WRITE_DB_DATABASE}.Billing_Header WHERE branch_id='${branch_id}' AND doctor_id='${query.filter.doctor_id}' AND inv_status='${inv_status}'`;
                    }
                    else{
                        custQuery = `SELECT *,(total_base_amt+total_charges) as gross_amt FROM ${process.env.WRITE_DB_DATABASE}.Billing_Header WHERE branch_id='${branch_id}' AND inv_status='${inv_status}'`;
                    }
                }
                debug("getBillingByBranchId", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Billing Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry, Billing Not Found!.", developerMessage: "Sorry, Billing Not Found!." };
                    return resolve(error_code)
                }
                else{
                    return resolve(queryres)
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getBillingByBranchId Error :', error)
                return reject(err_code);
            }
        })
    }

    getCountBillingByBranchId(connection, branch_id, query) {
        return new Promise(async(resolve, reject)=> {
            try{
                var custQuery, inv_status;
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                if(query.filter.inv_status.toUpperCase() == 'A') {
                    if(query.filter.patient_id) {
                        custQuery = `SELECT COUNT(*) as count FROM ${process.env.WRITE_DB_DATABASE}.Billing_Header WHERE branch_id='${branch_id}' AND patient_id='${query.filter.patient_id}'`;
                    }
                    else if(query.filter.doctor_id) {
                        custQuery = `SELECT COUNT(*) as count FROM ${process.env.WRITE_DB_DATABASE}.Billing_Header WHERE branch_id='${branch_id}' AND doctor_id='${query.filter.doctor_id}'`;
                    }
                    else{
                        custQuery = `SELECT COUNT(*) as count FROM ${process.env.WRITE_DB_DATABASE}.Billing_Header WHERE branch_id='${branch_id}'`;
                    }
                }
                else{
                    if(query.filter.inv_status.toUpperCase() == 'P' || query.filter.inv_status.toUpperCase() == 'F' || query.filter.inv_status.toUpperCase() == 'C') {
                        inv_status = query.filter.inv_status;
                    }
                    else{
                        inv_status = 'P';
                    }
                    if(query.filter.patient_id) {
                        custQuery = `SELECT COUNT(*) as count FROM ${process.env.WRITE_DB_DATABASE}.Billing_Header WHERE branch_id='${branch_id}' AND patient_id='${query.filter.patient_id}' AND inv_status='${inv_status}'`;
                    }
                    else if(query.filter.doctor_id) {
                        custQuery = `SELECT COUNT(*) as count FROM ${process.env.WRITE_DB_DATABASE}.Billing_Header WHERE branch_id='${branch_id}' AND doctor_id='${query.filter.doctor_id}' AND inv_status='${inv_status}'`;
                    }
                    else{
                        custQuery = `SELECT COUNT(*) as count FROM ${process.env.WRITE_DB_DATABASE}.Billing_Header WHERE branch_id='${branch_id}' AND inv_status='${inv_status}'`;
                    }
                }
                debug("getCountBillingByBranchId", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Billing Not Found!.', queryres);
                    return resolve(0)
                }
                else{
                    var res = JSON.parse(JSON.stringify(queryres))
                    var response = res[0].count;
                    return resolve(response)
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getCountBillingByBranchId Error :', error)
                return reject(err_code);
            }
        })
    }

    getBillingHead(connection, invoice_no) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Billing_Header WHERE invoice_no='${invoice_no}'`;
                debug("getBillingHead", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Billing Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry,Billing Data Not Available!.", developerMessage: "Sorry,Billing Data Not Available!." };
                    return resolve(error_code)
                }
                else{
                    var res = JSON.parse(JSON.stringify(queryres));
                    var response = res[0];
                    return resolve(response);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getBillingHead error :', error)
                return reject(err_code);
            }
        })
    }

    getBillingDetail(connection, invoice_no) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT d.*,p.product_name FROM ${process.env.WRITE_DB_DATABASE}.Billing_Detail d inner join ${process.env.WRITE_DB_DATABASE}.Product_Master p on p.product_id=d.product_id WHERE d.invoice_no='${invoice_no}'`;
                debug("getBillingDetail", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Billing Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry,Billing Data Not Available!.", developerMessage: "Sorry,Billing Data Not Available!." };
                    return resolve(error_code);
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getBillingDetail error :', error)
                return reject(err_code);
            }
        })
    }
    getBillingDetailbyGroupBU(connection,org_id, branch_id, invoice_no) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `Select org_id,branch_id,invoice_no,bu_id, sum(product_cost * product_qty) base_cost, 
                            Sum(other_charge1) other_charge1 ,sum(other_charge2) other_charge2,sum(other_charge3) other_charge3, sum(gross_inv_amount) gross_inv_amount,
                            Sum(discount1) discount1 ,sum(discount2) discount2,sum(discount3) discount3,sum(gross_discount) gross_discount,sum(net_amount) net_amount,
                            sum(net_patient_amount) bu_patient_amt, sum(insurance_inv_value) bu_insurance_amt, sum(doctor_inv_value) bu_doctor_amt
                            from ${process.env.WRITE_DB_DATABASE}.Billing_Detail where org_id='${org_id}' and branch_id='${branch_id}'  
                            and invoice_no='${invoice_no}' group by org_id,branch_id,invoice_no,bu_id`;
                debug("getBillingDetailbyGroupBU", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    return resolve(null);
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getBillingDetailbyGroupBU error :', error)
                return reject(err_code);
            }
        })
    }

    getBillingBUDetail(connection, invoice_no) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Billing_BU_Detail WHERE invoice_no='${invoice_no}'`;
                debug("getBillingBUDetail", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    return resolve(null);
                }
                else{
                    return resolve(queryres);
                }

                
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getBillingBUDetail error :', error)
                return reject(err_code);
            }
        })
    }

    getBillingByOrgId(connection, org_id, query, strPagination) {
        return new Promise(async(resolve, reject)=> {
            try{
                var custQuery, inv_status;
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                if(query.filter.inv_status.toUpperCase() == 'A') {
                    if(query.filter.patient_id) {
                        custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Billing_Header WHERE org_id='${org_id}' AND patient_id='${query.filter.patient_id}'`;
                    }
                    else if(query.filter.doctor_id) {
                        custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Billing_Header WHERE org_id='${org_id}' AND doctor_id='${query.filter.doctor_id}'`;
                    }
                    else if(query.filter.branch_id) {
                        custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Billing_Header WHERE org_id='${org_id}' AND branch_id='${query.filter.branch_id}'`;
                    }
                    else{
                        custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Billing_Header WHERE org_id='${org_id}'`;
                    }
                }
                else{
                    if(query.filter.inv_status.toUpperCase() == 'P' || query.filter.inv_status.toUpperCase() == 'F' || query.filter.inv_status.toUpperCase() == 'C') {
                        inv_status = query.filter.inv_status;
                    }
                    else{
                        inv_status = 'P';
                    }
                    if(query.filter.patient_id) {
                        custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Billing_Header WHERE org_id='${org_id}' AND patient_id='${query.filter.patient_id}' AND inv_status='${inv_status}'`;
                    }
                    else if(query.filter.doctor_id) {
                        custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Billing_Header WHERE org_id='${org_id}' AND doctor_id='${query.filter.doctor_id}' AND inv_status='${inv_status}'`;
                    }
                    else if(query.filter.branch_id) {
                        custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Billing_Header WHERE org_id='${org_id}' AND branch_id='${query.filter.branch_id}' AND inv_status='${inv_status}'`;
                    }
                    else{
                        custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Billing_Header WHERE org_id='${org_id}' AND inv_status='${inv_status}'`;
                    }
                }
                debug("getBillingByBranchId", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Billing Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry, Billing Not Found!.", developerMessage: "Sorry, Billing Not Found!." };
                    return resolve(error_code)
                }
                else{
                    return resolve(queryres)
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getBillingByBranchId Error :', error)
                return reject(err_code);
            }
        })
    }

    getCountBillingByOrgId(connection, org_id, query) {
        return new Promise(async(resolve, reject)=> {
            try{
                var custQuery, inv_status;
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                if(query.filter.inv_status.toUpperCase() == 'A') {
                    if(query.filter.patient_id) {
                        custQuery = `SELECT COUNT(*) as count FROM ${process.env.WRITE_DB_DATABASE}.Billing_Header WHERE org_id='${org_id}' AND patient_id='${query.filter.patient_id}'`;
                    }
                    else if(query.filter.doctor_id) {
                        custQuery = `SELECT COUNT(*) as count FROM ${process.env.WRITE_DB_DATABASE}.Billing_Header WHERE org_id='${org_id}' AND doctor_id='${query.filter.doctor_id}'`;
                    }
                    else if(query.filter.branch_id) {
                        custQuery = `SELECT COUNT(*) as count FROM ${process.env.WRITE_DB_DATABASE}.Billing_Header WHERE org_id='${org_id}' AND branch_id='${query.filter.branch_id}'`;
                    }
                    else{
                        custQuery = `SELECT COUNT(*) as count FROM ${process.env.WRITE_DB_DATABASE}.Billing_Header WHERE org_id='${org_id}'`;
                    }
                }
                else{
                    if(query.filter.inv_status.toUpperCase() == 'P' || query.filter.inv_status.toUpperCase() == 'F' || query.filter.inv_status.toUpperCase() == 'C') {
                        inv_status = query.filter.inv_status;
                    }
                    else{
                        inv_status = 'P';
                    }
                    if(query.filter.patient_id) {
                        custQuery = `SELECT COUNT(*) as count FROM ${process.env.WRITE_DB_DATABASE}.Billing_Header WHERE org_id='${org_id}' AND patient_id='${query.filter.patient_id}' AND inv_status='${inv_status}'`;
                    }
                    else if(query.filter.doctor_id) {
                        custQuery = `SELECT COUNT(*) as count FROM ${process.env.WRITE_DB_DATABASE}.Billing_Header WHERE org_id='${org_id}' AND doctor_id='${query.filter.doctor_id}' AND inv_status='${inv_status}'`;
                    }
                    else if(query.filter.branch_id) {
                        custQuery = `SELECT COUNT(*) as count FROM ${process.env.WRITE_DB_DATABASE}.Billing_Header WHERE org_id='${org_id}' AND branch_id='${query.filter.branch_id}' AND inv_status='${inv_status}'`;
                    }
                    else{
                        custQuery = `SELECT COUNT(*) as count FROM ${process.env.WRITE_DB_DATABASE}.Billing_Header WHERE org_id='${org_id}' AND inv_status='${inv_status}'`;
                    }
                }
                debug("getCountBillingByBranchId", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Billing Not Found!.', queryres);
                    return resolve(0)
                }
                else{
                    var res = JSON.parse(JSON.stringify(queryres))
                    var response = res[0].count;
                    return resolve(response)
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getCountBillingByBranchId Error :', error)
                return reject(err_code);
            }
        })
    }

    getInvoiceNo(connection, branch_id, seq_type) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }

                var custQuery = `SELECT concat(concat(seq_type,branch_id),LPAD(last_seq_no+1,10,'0')) as invoice_no ,last_seq_no+1 as last_seq_no 
                FROM ${process.env.WRITE_DB_DATABASE}.Swastha_Seq_Generator WHERE branch_id='${branch_id}' AND seq_type='${seq_type}'`;
                debug("getInvoiceNo", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug("Firtst time");
                    var new_patient_data = {
                        seq_type: seq_type,
                        branch_id: branch_id,
                        last_seq_no: 0,
                        branch_pad: 'Y'
                    }
                    await connection.query(`INSERT INTO ${process.env.WRITE_DB_DATABASE}.Swastha_Seq_Generator SET ?`, new_patient_data);

                    var newpatientquery = `SELECT concat(concat(seq_type,branch_id),LPAD(0,10,'0')) as invoice_no ,last_seq_no as last_seq_no 
                    FROM ${process.env.WRITE_DB_DATABASE}.Swastha_Seq_Generator WHERE branch_id='${branch_id}' AND seq_type='${seq_type}'`;

                    debug("getInvoiceNo", newpatientquery)
                    let queryres_newpatientquery = await connection.query(newpatientquery);
                    if(queryres_newpatientquery.length == 0) {
                        return resolve(null);
                    }
                    else{
                        var _response = JSON.parse(JSON.stringify(queryres_newpatientquery));
                        var newpat_response = _response[0];
                        return resolve(newpat_response);
                    } 
                }
                else{
                    debug("Already Have")
                    var _res = JSON.parse(JSON.stringify(queryres));
                    var response = _res[0];
                    debug("Already Have Response", response)
                    await connection.query(`UPDATE ${process.env.WRITE_DB_DATABASE}.Swastha_Seq_Generator SET last_seq_no=${response.last_seq_no} 
                    WHERE  branch_id='${branch_id}' AND seq_type='${seq_type}'`);
                    return resolve(response);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getInvoiceNo error :', error)
                return reject(err_code);
            }
        })
    }

    getPatientBillingData(connection, get_patient_data, patient_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT sum(net_inv_amount) AS net_inv_amount,sum(net_inv_paid) AS net_inv_paid, sum(net_inv_balance) AS net_inv_balance 
                FROM ${process.env.WRITE_DB_DATABASE}.Billing_Header WHERE org_id='${get_patient_data.org_id}' AND  branch_id='${get_patient_data.branch_id}' 
                AND patient_id='${patient_id}' AND inv_status='P' group by patient_id`;
                
                debug("getBillingByBranchId", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Billing Not Found!.', queryres);
                    return resolve(null)
                }
                else{
                    var _response = JSON.parse(JSON.stringify(queryres));
                    var response = _response[0];
                    return resolve(response);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getBillingByBranchId Error :', error)
                return reject(err_code);
            }
        })
    }

    getPaymentMaxNumber(connection, data) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT max(payment_num) AS payment_num FROM ${process.env.WRITE_DB_DATABASE}.Billing_Payment_Detail WHERE org_id='${data.org_id}' AND 
                branch_id='${data.branch_id}' AND invoice_no='${data.invoice_no}' AND inv_srl_no='${data.inv_srl_no}'`;
                
                debug("getBillingByBranchId", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Billing Not Found!.', queryres);
                    return resolve(null)
                }
                else{
                    var _response = JSON.parse(JSON.stringify(queryres));
                    var response = _response[0];
                    return resolve(response);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getBillingByBranchId Error :', error)
                return reject(err_code);
            }
        })
    }

    getBillingDtl(connection, invoice_no, inv_srl_no) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Billing_Detail WHERE invoice_no='${invoice_no}' AND inv_srl_no='${inv_srl_no}'`;
                debug("getBillingDtl", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Billing Not Found!.', queryres);
                    return resolve(null);
                }
                else{
                    var _response = JSON.parse(JSON.stringify(queryres));
                    var response = _response[0];
                    return resolve(response);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getBillingDtl error :', error)
                return reject(err_code);
            }
        })
    }

    getBillingBUDtl(connection, invoice_no, inv_srl_no) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Billing_BU_Detail WHERE invoice_no='${invoice_no}' AND inv_srl_no='${inv_srl_no}'`;
                debug("getBillingDtl", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Billing Not Found!.', queryres);
                    return resolve(null);
                }
                else{
                    var _response = JSON.parse(JSON.stringify(queryres));
                    var response = _response[0];
                    return resolve(response);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getBillingDtl error :', error)
                return reject(err_code);
            }
        })
    }

    

    createBillingPaymentDetail(connection, billing_payment_data) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`INSERT INTO ${process.env.WRITE_DB_DATABASE}.Billing_Payment_Detail SET ?`, billing_payment_data);
                debug('COMMIT at createBilling');
                return resolve(billing_payment_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("create Billing error :", err);
                return reject(err_code);
            }
        })
    }

    updateBillingDetail(connection, update_billing_detail, invoice_no, inv_srl_no) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`UPDATE ${process.env.WRITE_DB_DATABASE}.Billing_Detail SET ? WHERE invoice_no='${invoice_no}' AND inv_srl_no='${inv_srl_no}'`, update_billing_detail);
                debug('COMMIT at updateBillingDetail');
                return resolve(update_billing_detail);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("updateBillingDetail Error :", err);
                return reject(err_code);
            }
        })
    }
    updateBillingBUDetail(connection, update_billing_detail, invoice_no, inv_srl_no) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`UPDATE ${process.env.WRITE_DB_DATABASE}.Billing_BU_Detail SET ? WHERE invoice_no='${invoice_no}' AND inv_srl_no='${inv_srl_no}'`, update_billing_detail);
                debug('COMMIT at updateBillingDetail');
                return resolve(update_billing_detail);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("updateBillingDetail Error :", err);
                return reject(err_code);
            }
        })
    }

    updateBillingDtl(connection, update_billing_detail, invoice_no) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`UPDATE ${process.env.WRITE_DB_DATABASE}.Billing_Detail SET ? WHERE invoice_no='${invoice_no}'`, update_billing_detail);
                debug('COMMIT at updateBillingDetail');
                return resolve(update_billing_detail);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("updateBillingDetail Error :", err);
                return reject(err_code);
            }
        })
    }

    getTotalBillingDetailCount(connection, invoice_no) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT COUNT(*) AS count FROM ${process.env.WRITE_DB_DATABASE}.Billing_Detail WHERE invoice_no='${invoice_no}'`;
                debug("getTotalBillingDetailCount", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Billing Not Found!.', queryres);
                    return resolve(0);
                }
                else{
                    var _response = JSON.parse(JSON.stringify(queryres));
                    var response = _response[0].count;
                    return resolve(response);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getTotalBillingDetailCount error :', error)
                return reject(err_code);
            }
        })
    }

    getPatientInvoiceDetail(connection, invoice_no, patient_id, query) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT b.branch_name,  b.branch_address,b.branch_contact_num,b.branch_cont_pers_phone,p.patient_id, p.patient_name, p.sex, p.age ,h.inv_status
                FROM ${process.env.WRITE_DB_DATABASE}.Billing_Header h INNER JOIN ${process.env.WRITE_DB_DATABASE}.Patient_Master p ON p.patient_id=h.patient_id 
                INNER JOIN ${process.env.WRITE_DB_DATABASE}.Branch_Master b ON b.branch_id=h.branch_id WHERE h.patient_id='${patient_id}' AND 
                h.invoice_no='${invoice_no}'`;
                
                debug("getPatientInvoiceDetail", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Billing Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry, No Invoice Detail Available!.", developerMessage: "Sorry, No Invoice Detail Available!." };
                    return resolve(error_code);
                }
                else{
                    var _response = JSON.parse(JSON.stringify(queryres));
                    var response = _response[0];
                    return resolve(response);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getPatientInvoiceDetail error :', error)
                return reject(err_code);
            }
        })
    }

    getPatientInvoiceEstimateSummary(connection, invoice_no, bu_id, patient_id, invoice_header, query) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `select sum(a.product_cost*a.product_qty) sum_prod_amt,
                sum((a.other_charge1+a.other_charge2+a.other_charge3)) sum_tot_other_charge,
                 sum(a.gross_inv_amount) sum_gross_inv_amt,  sum(a.gross_discount) sum_gross_disc, 
                 sum(a.net_amount) sum_net_amt
                from  ${process.env.WRITE_DB_DATABASE}.Product_Master c,${process.env.WRITE_DB_DATABASE}.Billing_Detail a 
                where a.invoice_no='${invoice_no}' and a.product_id=c.product_id and a.bu_id  in ${bu_id}`;
                
               debug("getPatientInvoiceEstimateSummary", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    var invoice_lists = "";
                    return resolve(invoice_lists);
                }
                else{
                    var _response = JSON.parse(JSON.stringify(queryres));
                    var response = _response[0];
                    return resolve(response);
                   
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getPatientInvoiceEstimateSummary error :', error)
                return reject(err_code);
            }
        })
    }

    getPatientInvoiceSummary(connection, invoice_no, bu_id, patient_id, invoice_header, query) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }

                var custQuery = `select sum(a.product_cost*a.product_qty) sum_prod_amt,
                sum((a.other_charge1+a.other_charge2+a.other_charge3)) sum_tot_other_charge,
                 sum(a.gross_inv_amount) sum_gross_inv_amt,  sum(a.gross_discount) sum_gross_disc, 
                 sum(a.net_amount) sum_net_amt
                from  ${process.env.WRITE_DB_DATABASE}.Product_Master c,${process.env.WRITE_DB_DATABASE}.Billing_Detail a 
                where a.invoice_no='${invoice_no}' and a.product_id=c.product_id and a.bu_id not in ${bu_id}`;
     
                debug("getPatientInvoiceSummary", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    var invoice_lists = "";
                    return resolve(invoice_lists);
                }
                else{
                    var _response = JSON.parse(JSON.stringify(queryres));
                    var response = _response[0];
                    return resolve(response);
                   
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getPatientInvoiceLists error :', error)
                return reject(err_code);
            }
        })
    }

    getPatientInvoiceLists(connection, invoice_no, bu_id, patient_id, invoice_header, query) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `select c.product_name,a.product_cost, a.product_qty,a.product_cost*a.product_qty prod_amt,(a.other_charge1+a.other_charge2+a.other_charge3) tot_other_charge,
        a.gross_inv_amount,  a.gross_discount, a.net_amount 
        from   ${process.env.WRITE_DB_DATABASE}.Product_Master c, ${process.env.WRITE_DB_DATABASE}.Billing_Detail a 
       where a.invoice_no='${invoice_no}'  and a.product_id=c.product_id and a.bu_id not in ${bu_id}`;
                
                // var custQuery = `select c.product_name,a.product_cost, a.product_qty,a.gross_inv_amount,  a.gross_discount, a.net_amount,a.net_paid,a.net_balance ,
                // b.payment_mode, b.payment_date,b.payment_amount 
                // from   ${process.env.WRITE_DB_DATABASE}.Product_Master c, ${process.env.WRITE_DB_DATABASE}.Billing_Detail a 
                // left outer join ${process.env.WRITE_DB_DATABASE}.Billing_Payment_Detail b on a.org_id=b.org_id and a.branch_id=b.branch_id 
                // and a.invoice_no=b.invoice_no and a.inv_srl_no=b.inv_srl_no 
                // where a.invoice_no='${invoice_no}'  and a.org_id=c.org_id and a.branch_id=c.branch_id  and a.product_id=c.product_id and a.bu_id in ${bu_id}`;

            
                debug("getPatientInvoiceLists", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    var invoice_lists = [];
                    return resolve(invoice_lists);
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getPatientInvoiceLists error :', error)
                return reject(err_code);
            }
        })
    }

    getPatientInvoicePharmLists(connection, invoice_no, bu_id, patient_id, invoice_header, query) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `select c.product_name,a.product_cost, a.product_qty,a.product_cost*a.product_qty prod_amt,(a.other_charge1+a.other_charge2+a.other_charge3) tot_other_charge,
        a.gross_inv_amount,  a.gross_discount, a.net_amount 
        from   ${process.env.WRITE_DB_DATABASE}.Product_Master c, ${process.env.WRITE_DB_DATABASE}.Billing_Detail a 
       where a.invoice_no='${invoice_no}'  and a.product_id=c.product_id and a.bu_id in ${bu_id}`;
                
                // var custQuery = `select c.product_name,a.product_cost, a.product_qty,a.gross_inv_amount,  a.gross_discount, a.net_amount,a.net_paid,a.net_balance ,
                // b.payment_mode, b.payment_date,b.payment_amount 
                // from   ${process.env.WRITE_DB_DATABASE}.Product_Master c, ${process.env.WRITE_DB_DATABASE}.Billing_Detail a 
                // left outer join ${process.env.WRITE_DB_DATABASE}.Billing_Payment_Detail b on a.org_id=b.org_id and a.branch_id=b.branch_id 
                // and a.invoice_no=b.invoice_no and a.inv_srl_no=b.inv_srl_no 
                // where a.invoice_no='${invoice_no}'  and a.org_id=c.org_id and a.branch_id=c.branch_id  and a.product_id=c.product_id and a.bu_id in ${bu_id}`;

            
                debug("getPatientInvoiceLists", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    var invoice_lists = [];
                    return resolve(invoice_lists);
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getPatientInvoiceLists error :', error)
                return reject(err_code);
            }
        })
    }

    getPatientInvoicePaymentList(connection, invoice_no, bu_id, patient_id, invoice_header, query) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                } 
                var custQuery = `select if(payment_num=1,bu_id," ") bu_id, if(payment_num=1,net_amount," ") net_amount,
                if(payment_num=1,net_paid," ") net_paid, if(payment_num=1,net_balance," ") net_balance,
                payment_amount,payment_date, ref_desc payment_mode from 
                (select a.bu_id,a.net_amount,a.net_paid,a.net_balance,b.payment_amount,b.payment_date,c.ref_desc ,b.payment_num 
                from  ${process.env.WRITE_DB_DATABASE}.Swastha_Ref_Master c,${process.env.WRITE_DB_DATABASE}.Billing_BU_Detail a 
                left outer join ${process.env.WRITE_DB_DATABASE}.Billing_Payment_Detail b on a.org_id=b.org_id and a.branch_id=b.branch_id 
                and a.invoice_no=b.invoice_no and a.inv_srl_no=b.inv_srl_no 
                where a.invoice_no='${invoice_no}' and b.payment_mode=c.ref_code and 
                c.ref_type="PAYMOD" and a.bu_id NOT in ${bu_id} order by b.payment_num) e `;
                
              

            
                debug("getPatientInvoicePaymentList", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    var invoice_lists = [];
                    return resolve(invoice_lists);
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getPatientInvoiceLists error :', error)
                return reject(err_code);
            }
        })
    }


    getInvoiceByDate(connection, inv_month, patient_id, query) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }

             /*   var custQuery = `SELECT A.inv_srl_no, B.product_name, A.product_cost, A.product_qty,A.product_value, A.gross_discount, A.net_amount,A.net_paid,A.net_balance, 
                (SELECT sum(payment_amount) as received FROM ${process.env.WRITE_DB_DATABASE}.Billing_Payment_Detail p WHERE p.invoice_no='${invoice_no}' AND 
                p.inv_srl_no=A.inv_srl_no) as received FROM ${process.env.WRITE_DB_DATABASE}.Billing_Detail A INNER JOIN ${process.env.WRITE_DB_DATABASE}.Product_Master B
                ON A.product_id=B.product_id WHERE A.invoice_no='${invoice_no}' AND A.bu_id IN ${bu_id}`;
               */
                var custQuery = `select b.product_name, a.product_cost, a.product_qty,a.gross_inv_amount,  a.gross_discount, a.net_amount,a.net_paid,c.payment_mode, c.payment_date,c.payment_amount,  a.net_balance 
                from ${process.env.WRITE_DB_DATABASE}.Billing_Detail a, ${process.env.WRITE_DB_DATABASE}.Product_Master b, ${process.env.WRITE_DB_DATABASE}.Billing_Payment_Detail c where a.org_id=c.org_id and a.branch_id=c.branch_id and a.invoice_no=c.invoice_no and 
                a.inv_srl_no = c.inv_srl_no and  a.invoice_no ='${invoice_no}' and   a.product_id=b.product_id and a.org_id=b.org_id and   
                a.branch_id=b.branch_id and b.bu_id IN ${bu_id}`;
                debug("getPatientInvoiceLists", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    var invoice_lists = [];
                    return resolve(invoice_lists);
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getPatientInvoiceLists error :', error)
                return reject(err_code);
            }
        })
    }


    getInvoiceByMonth(connection, inv_month, inv_year, patient_id, query) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT invoice_num,DATE_FORMAT(invoice_date,'%Y-%m-%d') as invoice_date,month(invoice_date), year(invoice_date) FROM ${process.env.WRITE_DB_DATABASE}.Patient_Ins_Input_Det
                   where patient_id='${patient_id}'  and month(invoice_date)=${inv_month} and year(invoice_date)=${inv_year}`;

    
                debug("getInvoiceByMonth", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    var invoice_lists = [];
                    return resolve(invoice_lists);
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getPatientInvoiceLists error :', error)
                return reject(err_code);
            }
        })
    }
// Report Patient Type wise
    getRPTPatientTypeWiseList(connection, org_id, branch_id, from_date,to_date, query) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
 
                var custQuery = `Select DATE_FORMAT(inv_date,'%Y-%m-%d') inv_date,ifnull(sum(normal_inv_cnt),0) normal_inv_cnt, ifnull(sum(normal_amt),0) normal_amt,ifnull(sum(normal_recd),0) normal_recd, ifnull(sum(normal_os),0) normal_os,
                ifnull(sum(cmcare_inv_cnt),0) cmcare_inv_cnt, ifnull(sum(cmcare_amt),0) cmcare_amt, ifnull(sum(cmcare_recd),0) cmcare_recd, ifnull(sum(cmcare_os),0) cmcare_os,
                ifnull(sum(work_inv_cnt),0) work_inv_cnt, ifnull(sum(work_amt),0) work_amt, ifnull(sum(work_recd),0) work_recd, ifnull(sum(work_os),0) work_os,
                ifnull(sum(pens_inv_cnt),0) pens_inv_cnt, ifnull(sum(pens_amt),0) pens_amt, ifnull(sum(pens_recd),0) pens_recd, ifnull(sum(pens_os),0) pens_os,
                ifnull(sum(corp_inv_cnt),0) corp_inv_cnt, ifnull(sum(corp_amt),0) corp_amt, ifnull(sum(corp_recd),0) corp_recd, ifnull(sum(corp_os),0) corp_os,
                ifnull(sum(ckh_inv_cnt),0) ckh_inv_cnt, ifnull(sum(ckh_amt),0) ckh_amt,ifnull(sum(ckh_recd),0) ckh_recd,ifnull(sum(ckh_os),0) ckh_os,
                ifnull(sum(tot_inv_cnt),0) tot_inv_cnt,
                ifnull(sum(normal_amt+cmcare_amt+work_amt+pens_amt+corp_amt+ckh_amt),0) tot_inv_amt,
                ifnull(sum(normal_recd+cmcare_recd+work_recd+pens_recd+corp_recd+ckh_recd),0) tot_recd,
                ifnull(sum(normal_os+cmcare_os+work_os+pens_os+corp_os+ckh_os),0) tot_os
                 from (
                Select a.inv_date,  c.patient_type, 
                (case when c.patient_type="N" then count(a.invoice_no) else 0 end) "normal_inv_cnt",
                (case when c.patient_type="N" then sum(b.net_amount) else 0 end) "normal_amt",
                (case when c.patient_type="N" then sum(b.net_paid) else 0 end) "normal_recd",
                (case when c.patient_type="N" then sum(b.net_balance) else 0 end) "normal_os",
                (case when c.patient_type="C" then count(a.invoice_no) else 0 end) "cmcare_inv_cnt",
                (case when c.patient_type="C" then sum(b.net_amount) else 0 end) "cmcare_amt",
                (case when c.patient_type="C" then sum(b.net_paid) else 0 end) "cmcare_recd",
                (case when c.patient_type="C" then sum(b.net_balance) else 0 end) "cmcare_os",
                (case when c.patient_type="W" then count(a.invoice_no) else 0 end) "work_inv_cnt",
                (case when c.patient_type="W" then sum(b.net_amount) else 0 end) "work_amt",
                (case when c.patient_type="W" then sum(b.net_paid) else 0 end) "work_recd",
                (case when c.patient_type="W" then sum(b.net_balance) else 0 end) "work_os",
                (case when c.patient_type="P" then count(a.invoice_no) else 0 end) "pens_inv_cnt",
                (case when c.patient_type="P" then sum(b.net_amount) else 0 end) "pens_amt",
                (case when c.patient_type="P" then sum(b.net_paid) else 0 end) "pens_recd",
                (case when c.patient_type="P" then sum(b.net_balance) else 0 end) "pens_os",
                (case when c.patient_type="R" then count(a.invoice_no) else 0 end) "corp_inv_cnt",
                (case when c.patient_type="R" then sum(b.net_amount) else 0 end) "corp_amt",
                (case when c.patient_type="R" then sum(b.net_paid) else 0 end) "corp_recd",
                (case when c.patient_type="R" then sum(b.net_balance) else 0 end) "corp_os",
                (case when c.patient_type="H" then count(a.invoice_no) else 0 end) "ckh_inv_cnt",
                (case when c.patient_type="H" then sum(b.net_amount) else 0 end) "ckh_amt",
                (case when c.patient_type="H" then sum(b.net_paid) else 0 end) "ckh_recd",
                (case when c.patient_type="H" then sum(b.net_balance) else 0 end) "ckh_os",
                sum(if(b.inv_srl_no=1,1,0)) tot_inv_cnt
                from ${process.env.WRITE_DB_DATABASE}.Billing_Header a, ${process.env.WRITE_DB_DATABASE}.Billing_BU_Detail b, ${process.env.WRITE_DB_DATABASE}.Patient_Master c 
                where a.org_id='${org_id}' and a.branch_id='${branch_id}' and
                a.org_id=b.org_id and b.org_id=c.org_id and
                a.branch_id=b.branch_id and b.branch_id=c.branch_id and
                 a.invoice_no = b.invoice_no and a.patient_id = c.patient_id and
                a.inv_date between '${from_date}' and '${to_date}'
                group by a.inv_date,b.bu_id,c.patient_type ) d
                group by inv_date order by inv_date`;



                debug("getPatientTypeWiseList", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    var invoice_lists = [];
                    return resolve(invoice_lists);
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getRPTPatientTypeWiseList error :', error)
                return reject(err_code);
            }
        })
    }

    getRPTPatientOutstandingSummaryList(connection, org_id, branch_id, from_date,to_date, query) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
              
                var custQuery = `select patient_id,patient_name,ifnull(sum(net_inv_amount),0) net_inv_amt, ifnull(sum(net_inv_paid),0) net_inv_paid, ifnull(sum(net_inv_balance),0) net_inv_bal from
                (Select a.inv_date, b.patient_id, b.patient_name, b.patient_type, a.invoice_no, a.net_inv_amount, a.net_inv_paid, a.net_inv_balance 
                from ${process.env.WRITE_DB_DATABASE}.Billing_Header a,  ${process.env.WRITE_DB_DATABASE}.Patient_Master b
                where a.org_id='${org_id}' and a.branch_id='${branch_id}'  and
                a.org_id=b.org_id and 
                a.branch_id=b.branch_id and 
                a.patient_id = b.patient_id and a.inv_status ='P' and 
                a.inv_date between '${from_date}' and '${to_date}') a
                group by patient_name,patient_id order by patient_name`;


               
                

                debug("getRPTPatientOutstandingList", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    var invoice_lists = [];
                    return resolve(invoice_lists);
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getRPTPatientOutstandingList error :', error)
                return reject(err_code);
            }
        })
    }
// Outstanding Patient wise Transaction
    getRPTPatientOutstandingTransactionList(connection, org_id, branch_id,  query, from_date,to_date,patient_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }

                var custQuery = `Select b.patient_name,a.invoice_no,DATE_FORMAT(a.inv_date,'%Y-%m-%d') inv_date,   c.ref_desc,  ifnull(a.net_inv_amount,0) net_inv_amount, ifnull(a.net_inv_paid,0) net_inv_paid,
                ifnull(a.net_inv_balance,0) net_inv_balance
                from swastha_hms.Billing_Header a,  swastha_hms.Patient_Master b, swastha_hms.Swastha_Ref_Master c
                where a.org_id='${org_id}' and a.branch_id='${branch_id}' and
                a.org_id=b.org_id and 
                a.branch_id=b.branch_id and 
                a.patient_id = '${patient_id}' and a.inv_status ='P' and 
                b.patient_type=c.ref_code and c.ref_type="PATTYP" and
                a.inv_date between '${from_date}' and '${to_date}' and b.patient_id='${patient_id}' 
                order by patient_name,Inv_date`;
               /* var custQuery = `Select b.patient_name,a.invoice_no,a.inv_date,   c.ref_desc,  ifnull(a.net_inv_amount,0) net_inv_amount, ifnull(a.net_inv_paid,0) net_inv_paid,
                ifnull(a.net_inv_balance,0) net_inv_balance
                from ${process.env.WRITE_DB_DATABASE}.Billing_Header a,  ${process.env.WRITE_DB_DATABASE}.Patient_Master b, ${process.env.WRITE_DB_DATABASE}.Swastha_Ref_Master c
                where a.org_id='${org_id}' and a.branch_id='${branch_id}' and
                a.org_id=b.org_id and 
                a.branch_id=b.branch_id and 
                a.patient_id = '${patient_id}' and a.inv_status ='P' and 
                b.patient_type=c.ref_code and c.ref_type="PATTYP" and
                a.inv_date ='${invoice_date}'
                order by patient_name,Inv_date`; */


                debug("getRPTPatientOutstandingList", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    var invoice_lists = [];
                    return resolve(invoice_lists);
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getRPTPatientOutstandingList error :', error)
                return reject(err_code);
            }
        })
    }
    // Invoice Wise Summary (Outstanding)
    getRPTInvoiceOutstandingSummarryList(connection, org_id, branch_id, from_date,to_date, query) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `select DATE_FORMAT(inv_date,'%Y-%m-%d') inv_date,ifnull(sum(net_inv_amount),0) net_inv_amt, ifnull(sum(net_inv_paid),0) net_inv_paid, ifnull(sum(net_inv_balance),0) net_inv_bal from
                (Select a.inv_date,  b.patient_name, b.patient_type, a.invoice_no, a.net_inv_amount, a.net_inv_paid, a.net_inv_balance 
                from  ${process.env.WRITE_DB_DATABASE}.Billing_Header a,  ${process.env.WRITE_DB_DATABASE}.Patient_Master b
                where a.org_id='${org_id}' and a.branch_id='${branch_id}' and
                a.org_id=b.org_id and 
                a.branch_id=b.branch_id and 
                a.patient_id = b.patient_id and a.inv_status ='P' and 
                a.inv_date between '${from_date}' and '${to_date}') a
                group by inv_date order by inv_date`;
               

                debug("getRPTInvoiceOutstandingSummarryList", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    var invoice_lists = [];
                    return resolve(invoice_lists);
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getRPTInvoiceOutstandingList error :', error)
                return reject(err_code);
            }
        })
    }

     // Invoice Wise Transactiom (Outstanding)
    getRPTInvoiceOutstandingTransactionList(connection, org_id, branch_id,  query,invoice_date) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `Select a.invoice_no,DATE_FORMAT(a.inv_date,'%Y-%m-%d') inv_date,b.patient_name,  c.ref_desc,  ifnull(a.net_inv_amount,0) net_inv_amount, ifnull(a.net_inv_paid,0) net_inv_paid,
                ifnull(a.net_inv_balance,0) net_inv_balance
                from swastha_hms.Billing_Header a,  swastha_hms.Patient_Master b, swastha_hms.Swastha_Ref_Master c
                where a.org_id='${org_id}' and a.branch_id='${branch_id}' and
                a.org_id=b.org_id and 
                a.branch_id=b.branch_id and 
                a.patient_id = b.patient_id and a.inv_status ='P' and 
                b.patient_type=c.ref_code and c.ref_type="PATTYP" and
                a.inv_date ='${invoice_date}'
                order by Inv_date,patient_name`;
               
               
                debug("getRPTInvoiceOutstandingList", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    var invoice_lists = [];
                    return resolve(invoice_lists);
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getRPTInvoiceOutstandingList error :', error)
                return reject(err_code);
            }
        })
    }
//Collection Wise Summary
    getRPTCollectionWiseSummaryList(connection, org_id, branch_id, from_date, to_date, query) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }

                var custQuery = `Select DATE_FORMAT(inv_date,'%Y-%m-%d') inv_date,
                ifnull(sum(Dialysis),0) dialysis, ifnull(sum(Pharmacy),0) pharmacy,
                ifnull(sum(Lab),0) lab, ifnull(sum(Others),0) others,
                ifnull(sum(Other_charge),0) other_charge, ifnull(sum(gross_discount),0) gross_discount,
                ifnull(sum(net_amount),0) net_amount, ifnull(sum(net_paid),0) net_paid ,
                ifnull(sum(net_balance),0) net_balance from 
                (Select a.inv_date,a.invoice_no,c.patient_name,c.patient_type,b.bu_id, 
                (CASE WHEN b.bu_id="DIALY" THEN b.net_amount  ELSE 0 END) "Dialysis",
                (CASE WHEN b.bu_id="LAB" THEN b.net_amount  ELSE 0 END) "Lab",
                (CASE WHEN b.bu_id="PHARM" THEN b.net_amount  ELSE 0 END) "Pharmacy",
                (CASE WHEN b.bu_id NOT IN ("PHARM","DIALY","LAB") THEN b.net_amount  ELSE 0 END) "Others",
                (b.other_charge1+b.other_charge2+b.other_charge3) Other_charge, b.gross_discount, 
                b.net_amount, ifnull(b.net_paid,0) net_paid, ifnull(b.net_balance,0) net_balance
                from ${process.env.WRITE_DB_DATABASE}.Billing_Header a, ${process.env.WRITE_DB_DATABASE}.Billing_BU_Detail b, ${process.env.WRITE_DB_DATABASE}.Patient_Master c
                where  a.org_id='${org_id}'  and a.branch_id='${branch_id}' and  a.org_id = b.org_id and a.org_id = c.org_id 
                and a.branch_id=b.branch_id and a.branch_id = c.branch_id
                and a.invoice_no=b.invoice_no
                and a.patient_id = c.patient_id
                and a.inv_date between '${from_date}' and '${to_date}') d, ${process.env.WRITE_DB_DATABASE}.Swastha_Ref_Master e
                where d.patient_type=e.ref_code and e.ref_type="PATTYP"
                group by inv_date order by inv_date`;
                

                debug("getRPTCollectionWiseSummaryList", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    var invoice_lists = [];
                    return resolve(invoice_lists);
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getRPTCollectionWiseSummaryList error :', error)
                return reject(err_code);
            }
        })
    }
    // CollectionWise Transaction by Invoice Date
    getRPTCollectionWiseTransactionList(connection, org_id, branch_id, query, invoice_date) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `Select DATE_FORMAT(inv_date,'%Y-%m-%d') inv_date, invoice_no,patient_name,e.ref_desc,
                ifnull(sum(Dialysis),0) dialysis, ifnull(sum(Pharmacy),0) pharmacy,
                ifnull(sum(Lab),0) lab, ifnull(sum(Others),0) others,
                ifnull(sum(Other_charge),0) other_charge, ifnull(sum(gross_discount),0) gross_discount,
                ifnull(sum(net_amount),0) net_amount, ifnull(sum(net_paid),0) net_paid ,
                ifnull(sum(net_balance),0) net_balance from 
                (Select a.inv_date,a.invoice_no,c.patient_name,c.patient_type,b.bu_id, 
                (CASE WHEN b.bu_id="DIALY" THEN b.net_amount  ELSE 0 END) "Dialysis",
                (CASE WHEN b.bu_id="LAB" THEN b.net_amount  ELSE 0 END) "Lab",
                (CASE WHEN b.bu_id="PHARM" THEN b.net_amount  ELSE 0 END) "Pharmacy",
                (CASE WHEN b.bu_id NOT IN ("PHARM","DIALY","LAB") THEN b.net_amount  ELSE 0 END) "Others",
                (b.other_charge1+b.other_charge2+b.other_charge3) Other_charge, b.gross_discount, 
                b.net_amount, ifnull(b.net_paid,0) net_paid, ifnull(b.net_balance,0) net_balance
                from ${process.env.WRITE_DB_DATABASE}.Billing_Header a, ${process.env.WRITE_DB_DATABASE}.Billing_BU_Detail b, ${process.env.WRITE_DB_DATABASE}.Patient_Master c
                where a.org_id='${org_id}' and a.branch_id='${branch_id}' and a.org_id = b.org_id and a.org_id = c.org_id 
                and a.branch_id=b.branch_id and a.branch_id = c.branch_id
                and a.invoice_no=b.invoice_no
                and a.patient_id = c.patient_id
                and a.inv_date ='${invoice_date}') d, ${process.env.WRITE_DB_DATABASE}.Swastha_Ref_Master e
                where d.patient_type=e.ref_code and e.ref_type="PATTYP"
                group by inv_date, invoice_no,patient_name,e.ref_desc  order by inv_date,invoice_no`;

           

                debug("getRPTCollectionWiseTransactionList", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    return resolve(null);
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getRPTCollectionWiseTransactionList error :', error)
                return reject(err_code);
            }
        })
    }
    // Payment wise Summary
    getRPTPaymentWiseSummaryList(connection, org_id, branch_id, from_date, to_date, query) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
               /* var custQuery = `select DATE_FORMAT(inv_date,'%Y-%m-%d') inv_date, ifnull(sum(cash_inv_cnt),0) cash_inv_cnt, ifnull(sum(cash_amt),0) cash_amt,
                ifnull(sum(card_inv_cnt),0) card_inv_cnt, ifnull(sum(card_amt),0) card_amt,
                ifnull(sum(debit_card_inv_cnt),0) debit_card_inv_cnt, ifnull(sum(debit_card_amt),0) debit_card_amt,
                ifnull(sum(chq_inv_cnt),0) chq_inv_cnt, ifnull(sum(chq_amt),0) chq_amt, ifnull(sum(upi_inv_cnt),0) upi_inv_cnt, ifnull(sum(upi_amt),0) upi_amt,
                ifnull(sum(adv_adjusted_inv_cnt),0) adv_adj_inv_cnt, ifnull(sum(adv_adjusted_amt),0) adv_adj_amt ,
                ifnull(sum(os_cnt),0) os_cnt, ifnull(sum(os_amt),0) os_amt,
                ifnull(sum(tot_inv_cnt),0) tot_inv_cnt, ifnull(sum(cash_amt+card_amt+chq_amt+upi_amt+adv_adjusted_amt+os_amt),0) total_inv_amt from 
                (
                Select a.inv_date,  b.bu_id, c.payment_mode,
                (case when c.payment_mode="S" then if( c.payment_num=1,1,0) else 0 end) "cash_inv_cnt", 
                (case when c.payment_mode="S" then if (c.payment_num=1,b.net_amount,0) else 0 end) "cash_amt",
                (case when c.payment_mode="C" then if( c.payment_num=1,1,0) else 0 end) "card_inv_cnt", 
                (case when c.payment_mode="C" then if (c.payment_num=1,b.net_amount,0) else 0 end) "card_amt",
                (case when c.payment_mode="D" then if( c.payment_num=1,1,0) else 0 end) "debit_card_inv_cnt", 
                (case when c.payment_mode="D" then if (c.payment_num=1,b.net_amount,0) else 0 end) "debit_card_amt",
                (case when c.payment_mode="Q" then if( c.payment_num=1,1,0) else 0 end) "chq_inv_cnt", 
                (case when c.payment_mode="Q" then if (c.payment_num=1,b.net_amount,0) else 0 end) "chq_amt",
                (case when c.payment_mode="U" then if( c.payment_num=1,1,0) else 0 end) "upi_inv_cnt", 
                (case when c.payment_mode="U" then if (c.payment_num=1,b.net_amount,0) else 0 end) "upi_amt",
                (case when c.payment_mode="A" then if( c.payment_num=1,1,0) else 0 end) "adv_adjusted_inv_cnt", 
                (case when c.payment_mode="A" then if (c.payment_num=1,b.net_amount,0) else 0 end) "adv_adjusted_amt",
                0 os_cnt,0 os_amt,
                if (b.inv_srl_no=1 and c.payment_num=1,1,0) tot_inv_cnt
                from ${process.env.WRITE_DB_DATABASE}.Billing_Header a, ${process.env.WRITE_DB_DATABASE}.Billing_BU_Detail b, 
                ${process.env.WRITE_DB_DATABASE}.Billing_Payment_Detail c 
                where  a.org_id='${org_id}'  and a.branch_id='${branch_id}'  and  a.org_id=b.org_id and  b.org_id=c.org_id and
                a.branch_id=b.branch_id and b.branch_id=c.branch_id and
                a.invoice_no = b.invoice_no and b.invoice_no = c.invoice_no and
                b.inv_srl_no=c.inv_srl_no and  
                a.inv_date between  '${from_date}' and '${to_date}'
                union all
                select a.inv_date, b.bu_id,"Outstanding" payment_mode, 0 cash_inv_cnt,0 cash_amt,
                0 card_inv_cnt, 0 card_amt,0 debit_card_inv_cnt, 0 debit_card_amt,
                0 chq_inv_cnt, 0 chq_amt , 0 upi_inv_cnt , 0 upi_inv_cnt, 0 adv_adjusted_inv_cnt,
                0 adv_adjusted_amt, if (b.inv_srl_no=1,1,0) os_cnt,
                ifnull(b.net_amount,0) os_amt ,if (b.inv_srl_no=1,1,0) tot_inv_cnt from 
                ${process.env.WRITE_DB_DATABASE}.Billing_Header a,${process.env.WRITE_DB_DATABASE}.Billing_BU_Detail b 
                where a.invoice_no = b.invoice_no and a.inv_date between  '${from_date}' and '${to_date}'
                and not exists ( select 1 from ${process.env.WRITE_DB_DATABASE}.Billing_Payment_Detail c
                where b.invoice_no = c.invoice_no and b.inv_srl_no=c.inv_srl_no  )  ) e
                group by inv_date order by inv_date `; */
                                
                var custQuery = `select DATE_FORMAT(inv_date,'%Y-%m-%d') inv_date, ifnull(sum(cash_inv_cnt),0) cash_inv_cnt, ifnull(sum(cash_amt),0) cash_amt,
                ifnull(sum(card_inv_cnt),0) card_inv_cnt, ifnull(sum(card_amt),0) card_amt,
         ifnull(sum(debit_card_inv_cnt),0) debit_card_inv_cnt, ifnull(sum(debit_card_amt),0) debit_card_amt,
         ifnull(sum(chq_inv_cnt),0) chq_inv_cnt, ifnull(sum(chq_amt),0) chq_amt, ifnull(sum(upi_inv_cnt),0) upi_inv_cnt, ifnull(sum(upi_amt),0) upi_amt,
         ifnull(sum(adv_adjusted_inv_cnt),0) adv_adj_inv_cnt, ifnull(sum(adv_adjusted_amt),0) adv_adj_amt ,
         ifnull(sum(os_cnt),0) os_cnt, ifnull(sum(os_amt),0) os_amt,
         ifnull(sum(tot_inv_cnt),0) tot_inv_cnt, ifnull(sum(cash_amt+card_amt+chq_amt+upi_amt+adv_adjusted_amt+os_amt),0) total_inv_amt from 
         (
         Select a.inv_date,  b.bu_id, c.payment_mode,
         (case when c.payment_mode="S" then if( c.payment_num=1,1,0) else 0 end) "cash_inv_cnt", 
         (case when c.payment_mode="S" then if (c.payment_num=1,c.payment_amount,0) else 0 end) "cash_amt",
         (case when c.payment_mode="C" then if( c.payment_num=1,1,0) else 0 end) "card_inv_cnt", 
         (case when c.payment_mode="C" then if (c.payment_num=1,c.payment_amount,0) else 0 end) "card_amt",
         (case when c.payment_mode="D" then if( c.payment_num=1,1,0) else 0 end) "debit_card_inv_cnt", 
         (case when c.payment_mode="D" then if (c.payment_num=1,c.payment_amount,0) else 0 end) "debit_card_amt",
         (case when c.payment_mode="Q" then if( c.payment_num=1,1,0) else 0 end) "chq_inv_cnt", 
         (case when c.payment_mode="Q" then if (c.payment_num=1,c.payment_amount,0) else 0 end) "chq_amt",
         (case when c.payment_mode="U" then if( c.payment_num=1,1,0) else 0 end) "upi_inv_cnt", 
         (case when c.payment_mode="U" then if (c.payment_num=1,c.payment_amount,0) else 0 end) "upi_amt",
         (case when c.payment_mode="A" then if( c.payment_num=1,1,0) else 0 end) "adv_adjusted_inv_cnt", 
         (case when c.payment_mode="A" then if (c.payment_num=1,c.payment_amount,0) else 0 end) "adv_adjusted_amt",
         0 os_cnt,if (ifnull(c.payment_num,0) in (0,1),b.net_balance,0) os_amt,
         if (b.inv_srl_no=1 and c.payment_num=1,1,0) tot_inv_cnt
         from ${process.env.WRITE_DB_DATABASE}.Billing_BU_Detail b left join ${process.env.WRITE_DB_DATABASE}.Billing_Payment_Detail c on b.branch_id=c.branch_id and b.invoice_no = c.invoice_no and b.inv_srl_no=c.inv_srl_no
          inner join ${process.env.WRITE_DB_DATABASE}.Billing_Header a on  a.org_id='${org_id}'  and a.branch_id='${branch_id}' and  a.org_id=b.org_id and  a.org_id=b.org_id and
         a.branch_id=b.branch_id and a.invoice_no = b.invoice_no  and 
          a.inv_date between  '${from_date}' and '${to_date}') e
         group by inv_date order by inv_date`;
              
                debug("getRPTPaymentWiseSummaryList", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    var invoice_lists = [];
                    return resolve(invoice_lists);
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getRPTPaymentWiseSummaryList error :', error)
                return reject(err_code);
            }
        })
    }
// Payment wise Transaction 
    getRPTPaymentWiseTransactionList(connection, org_id, branch_id, query, invoice_date) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                // var custQuery = `select DATE_FORMAT(inv_date,'%Y-%m-%d') inv_date,bu_id, ifnull(sum(cash_inv_cnt),0) cash_inv_cnt, ifnull(sum(cash_amt),0) cash_amt,
                // ifnull(sum(card_inv_cnt),0) card_inv_cnt, ifnull(sum(card_amt),0) card_amt,
                // ifnull(sum(debit_card_inv_cnt),0) debit_card_inv_cnt, ifnull(sum(debit_card_amt),0) debit_card_amt,
                // ifnull(sum(chq_inv_cnt),0) chq_inv_cnt, ifnull(sum(chq_amt),0) chq_amt, ifnull(sum(upi_inv_cnt),0) upi_inv_cnt, ifnull(sum(upi_amt),0) upi_amt,
                // ifnull(sum(adv_adjusted_inv_cnt),0) adv_adj_inv_cnt, ifnull(sum(adv_adjusted_amt),0) adv_adj_amt ,
                // ifnull(sum(os_cnt),0) os_cnt, ifnull(sum(os_amt),0) os_amt,
                // ifnull(sum(tot_inv_cnt),0) tot_inv_cnt, ifnull(sum(cash_amt+card_amt+chq_amt+upi_amt+adv_adjusted_amt+os_amt),0) total_inv_amt from 
                // (
                // Select a.inv_date,  b.bu_id, c.payment_mode,
                // (case when c.payment_mode="S" then if( c.payment_num=1,1,0) else 0 end) "cash_inv_cnt", 
                // (case when c.payment_mode="S" then if (c.payment_num=1,b.net_amount,0) else 0 end) "cash_amt",
                // (case when c.payment_mode="C" then if( c.payment_num=1,1,0) else 0 end) "card_inv_cnt", 
                // (case when c.payment_mode="C" then if (c.payment_num=1,b.net_amount,0) else 0 end) "card_amt",
                // (case when c.payment_mode="D" then if( c.payment_num=1,1,0) else 0 end) "debit_card_inv_cnt", 
                // (case when c.payment_mode="D" then if (c.payment_num=1,b.net_amount,0) else 0 end) "debit_card_amt",
                // (case when c.payment_mode="Q" then if( c.payment_num=1,1,0) else 0 end) "chq_inv_cnt", 
                // (case when c.payment_mode="Q" then if (c.payment_num=1,b.net_amount,0) else 0 end) "chq_amt",
                // (case when c.payment_mode="U" then if( c.payment_num=1,1,0) else 0 end) "upi_inv_cnt", 
                // (case when c.payment_mode="U" then if (c.payment_num=1,b.net_amount,0) else 0 end) "upi_amt",
                // (case when c.payment_mode="A" then if( c.payment_num=1,1,0) else 0 end) "adv_adjusted_inv_cnt", 
                // (case when c.payment_mode="A" then if (c.payment_num=1,b.net_amount,0) else 0 end) "adv_adjusted_amt",
                // 0 os_cnt,0 os_amt,
                // if (b.inv_srl_no=1 and c.payment_num=1,1,0) tot_inv_cnt
                // from ${process.env.WRITE_DB_DATABASE}.Billing_Header a, ${process.env.WRITE_DB_DATABASE}.Billing_BU_Detail b, 
                // ${process.env.WRITE_DB_DATABASE}.Billing_Payment_Detail c 
                // where  a.org_id='${org_id}'  and a.branch_id='${branch_id}' and  a.org_id=b.org_id and  b.org_id=c.org_id and
                // a.branch_id=b.branch_id and b.branch_id=c.branch_id and
                // a.invoice_no = b.invoice_no and b.invoice_no = c.invoice_no and
                // b.inv_srl_no=c.inv_srl_no and  
                // a.inv_date ='${invoice_date}'
                // union all
                // select a.inv_date, b.bu_id,"Outstanding" payment_mode, 0 cash_inv_cnt,0 cash_amt,
                // 0 card_inv_cnt, 0 card_amt, 0 debit_card_inv_cnt, 0 debit_card_amt,
                // 0 chq_inv_cnt, 0 chq_amt , 0 upi_inv_cnt , 0 upi_inv_cnt, 0 adv_adjusted_inv_cnt,
                // 0 adv_adjusted_amt, if (b.inv_srl_no=1,1,0) os_cnt,
                // ifnull(b.net_amount,0) os_amt ,if (b.inv_srl_no=1,1,0) tot_inv_cnt from 
                // ${process.env.WRITE_DB_DATABASE}.Billing_Header a, ${process.env.WRITE_DB_DATABASE}.Billing_BU_Detail b 
                // where a.invoice_no = b.invoice_no and a.inv_date ='${invoice_date}'
                // and not exists ( select 1 from ${process.env.WRITE_DB_DATABASE}.Billing_Payment_Detail c
                // where b.invoice_no = c.invoice_no and b.inv_srl_no=c.inv_srl_no  )  ) e
                // group by inv_date,bu_id order by inv_date`; 

                var custQuery = `select DATE_FORMAT(inv_date,'%Y-%m-%d') inv_date,bu_id, ifnull(sum(cash_inv_cnt),0) cash_inv_cnt, ifnull(sum(cash_amt),0) cash_amt,
       ifnull(sum(card_inv_cnt),0) card_inv_cnt, ifnull(sum(card_amt),0) card_amt,
ifnull(sum(debit_card_inv_cnt),0) debit_card_inv_cnt, ifnull(sum(debit_card_amt),0) debit_card_amt,
ifnull(sum(chq_inv_cnt),0) chq_inv_cnt, ifnull(sum(chq_amt),0) chq_amt, ifnull(sum(upi_inv_cnt),0) upi_inv_cnt, ifnull(sum(upi_amt),0) upi_amt,
ifnull(sum(adv_adjusted_inv_cnt),0) adv_adj_inv_cnt, ifnull(sum(adv_adjusted_amt),0) adv_adj_amt ,
ifnull(sum(os_cnt),0) os_cnt, ifnull(sum(os_amt),0) os_amt,
ifnull(sum(tot_inv_cnt),0) tot_inv_cnt, ifnull(sum(cash_amt+card_amt+chq_amt+upi_amt+adv_adjusted_amt+os_amt),0) total_inv_amt from 
(
Select a.inv_date,  b.bu_id, c.payment_mode,
(case when c.payment_mode="S" then if( c.payment_num=1,1,0) else 0 end) "cash_inv_cnt", 
(case when c.payment_mode="S" then if (c.payment_num=1,c.payment_amount,0) else 0 end) "cash_amt",
(case when c.payment_mode="C" then if( c.payment_num=1,1,0) else 0 end) "card_inv_cnt", 
(case when c.payment_mode="C" then if (c.payment_num=1,c.payment_amount,0) else 0 end) "card_amt",
(case when c.payment_mode="D" then if( c.payment_num=1,1,0) else 0 end) "debit_card_inv_cnt", 
(case when c.payment_mode="D" then if (c.payment_num=1,c.payment_amount,0) else 0 end) "debit_card_amt",
(case when c.payment_mode="Q" then if( c.payment_num=1,1,0) else 0 end) "chq_inv_cnt", 
(case when c.payment_mode="Q" then if (c.payment_num=1,c.payment_amount,0) else 0 end) "chq_amt",
(case when c.payment_mode="U" then if( c.payment_num=1,1,0) else 0 end) "upi_inv_cnt", 
(case when c.payment_mode="U" then if (c.payment_num=1,c.payment_amount,0) else 0 end) "upi_amt",
(case when c.payment_mode="A" then if( c.payment_num=1,1,0) else 0 end) "adv_adjusted_inv_cnt", 
(case when c.payment_mode="A" then if (c.payment_num=1,c.payment_amount,0) else 0 end) "adv_adjusted_amt",
0 os_cnt,if (ifnull(c.payment_num,0) in (0,1),b.net_balance,0) os_amt,
if (b.inv_srl_no=1 and c.payment_num=1,1,0) tot_inv_cnt
from ${process.env.WRITE_DB_DATABASE}.Billing_BU_Detail b left join ${process.env.WRITE_DB_DATABASE}.Billing_Payment_Detail c on b.branch_id=c.branch_id and b.invoice_no = c.invoice_no and b.inv_srl_no=c.inv_srl_no
 inner join ${process.env.WRITE_DB_DATABASE}.Billing_Header a on  a.org_id='${org_id}'  and a.branch_id='${branch_id}' and  a.org_id=b.org_id and  a.org_id=b.org_id and
a.branch_id=b.branch_id and a.invoice_no = b.invoice_no  and 
 a.inv_date='${invoice_date}') e
group by inv_date,bu_id order by inv_date`;

               
                debug("getRPTPaymentWiseTransactionList", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    return resolve(null);
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getRPTPaymentWiseTransactionList error :', error)
                return reject(err_code);
            }
        })
    }

    // Report Receipt Payment List
    getReceiptPaymentList(connection, org_id, branch_id, from_date,to_date, query) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }               

                var custQuery = `select a.trans_date, a.account_type, a.account_code, a.trans_Id,  b.account_desc, a.account_value, 
                a.trans_narration, a.addl_remarks, a.voucher_num, a.voucher_date,c.ref_desc as subledger_type,a.rp_name_other ,
                d.ref_desc as payment_mode,a.payment_ref
                from ${process.env.WRITE_DB_DATABASE}.Rcpt_Pay_Details a, ${process.env.WRITE_DB_DATABASE}.Account_Master b,
                ${process.env.WRITE_DB_DATABASE}.Swastha_Ref_Master c, ${process.env.WRITE_DB_DATABASE}.Swastha_Ref_Master d 
                where a.org_id='${org_id}'  and a.branch_id='${branch_id}' 
                and a.account_code=b.account_code  and a.rp_for=c.ref_code and c.ref_type="RPFOR" 
                and a.payment_mode=d.ref_code and d.ref_type="PAYMOD" and a.trans_date between  '${from_date}' and '${to_date}'
                order by trans_date,account_type,account_code,trans_id`;

                debug("getReceiptPaymentList", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    var invoice_lists = [];
                    return resolve(invoice_lists);
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getRPTPatientTypeWiseList error :', error)
                return reject(err_code);
            }
        })
    }
    

     // Report Stock Register List
     getStockRegisterReportList(connection, org_id, branch_id, from_date,to_date, query) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }               

                var custQuery = `select b.product_name,a.trans_date,a.open_stock,a.received_stock,a.sold_stock,a.close_stock
                from Swastha_Daily_inventory a, Product_Master b 
                where a.org_id='${org_id}'  and a.branch_id='${branch_id}'  
                  and a.org_id=b.org_id and a.product_id=b.product_id 
                  and a.trans_date between '${from_date}' and '${to_date}'  order by b.product_name,a.trans_date`;

                debug("getReceiptPaymentList", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    var invoice_lists = [];
                    return resolve(invoice_lists);
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getRPTPatientTypeWiseList error :', error)
                return reject(err_code);
            }
        })
    }
}

module.exports = {
    BillingDao
}