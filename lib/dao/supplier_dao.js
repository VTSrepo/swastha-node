const mysql = require('../../common/db_utils');
var debug = require('debug')('v2:supplier:dao');
const BaseDao = require('./base_dao');

class SupplierDao extends BaseDao {

    createSupplier(connection, supplier_data) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`INSERT INTO ${process.env.WRITE_DB_DATABASE}.Supplier_Master SET ?`, supplier_data);
                debug('COMMIT at createSupplier', supplier_data);
                return resolve(supplier_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("create supplier error :", err);
                return reject(err_code);
            }
        })
    }

    updateSupplier(connection, set_supplier_data, supplier_id) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`UPDATE ${process.env.WRITE_DB_DATABASE}.Supplier_Master SET ? WHERE supplier_id='${supplier_id}' `, set_supplier_data);
                debug('COMMIT at updateSupplier', `UPDATE ${process.env.WRITE_DB_DATABASE}.Supplier_Master SET ? WHERE supplier_id='${supplier_id}' `, set_supplier_data);
                return resolve(set_supplier_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("updateSupplier Error :", err);
                return reject(err_code);
            }
        })
    }

    getSupplierList(connection, org_id,branch_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT org_id,branch_id,supplier_id,supplier_name,DATE_FORMAT(supplier_opendate,'%Y-%m-%d') AS supplier_opendate,supplier_address,supplier_contact_num,supplier_email_id,supplier_cont_pers,supplier_cont_pers_phone,supplier_cont_pers_email,
                supplier_website,supplier_gst_num,supplier_localgst_num,supplier_cst_num,credit_days,pan_no,dl_no,bank_name
                  ,account_no,ifsc_no,chq_name,comm_address,pin_code,bank_branch,created_date,created_by,updated_by,updated_date FROM ${process.env.WRITE_DB_DATABASE}.Supplier_Master WHERE org_id='${org_id}' AND  branch_id='${branch_id}'`;
                debug("getSupplierList", custQuery)
            
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
                debug('getSupplierList error :', error)
                return reject(err_code);
            }
        })
    }

    geSupplierId(connection, supplier_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT org_id,branch_id,supplier_id,supplier_name,DATE_FORMAT(supplier_opendate,'%Y-%m-%d') AS supplier_opendate,supplier_address,supplier_contact_num,supplier_email_id,supplier_cont_pers,supplier_cont_pers_phone,supplier_cont_pers_email,
                supplier_website,supplier_gst_num,supplier_localgst_num,supplier_cst_num,credit_days,pan_no,dl_no,bank_name
                  ,account_no,ifsc_no,chq_name,comm_address,pin_code,bank_branch,created_date,created_by,updated_by,updated_date FROM ${process.env.WRITE_DB_DATABASE}.Supplier_Master WHERE supplier_id='${supplier_id}'`;
                debug("geSupplierId", custQuery)
               
                
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, User Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry, Patient Not Found!.", developerMessage: "Sorry, Patient Not Found!." };
                    return resolve(error_code)
                }
                else{
                    var res = JSON.parse(JSON.stringify(queryres))
                    var response = res[0];
                    return resolve(response)
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('geSupplierId Error :', error)
                return reject(err_code);
            }
        })
    }


    getSupplierList(connection, org_id,branch_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Supplier_Master WHERE org_id='${org_id}' AND  branch_id='${branch_id}'`;
                debug("getPoNumber", custQuery)
            
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
                debug('getPoNumber error :', error)
                return reject(err_code);
            }
        })
    }

    getSupplierProductList(connection, branch_id, supplier_id,eod_date,query) {
        return new Promise(async(resolve, reject)=> {
            try{
                var custQuery;
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                if(query.filter.hasOwnProperty('eod_date')) {
                    custQuery = `SELECT sp.*, p.product_name,p.bu_id FROM ${process.env.WRITE_DB_DATABASE}.Supp_Prod_Price_Master sp INNER JOIN  ${process.env.WRITE_DB_DATABASE}.Product_Master p on p.product_id=sp.product_id  WHERE sp.supplier_id='${supplier_id}' AND  sp.branch_id='${branch_id}' 
                    and '${eod_date}' >= sp.eff_from and '${eod_date}' <=if(isnull(sp.eff_to),curdate(),sp.eff_to) `;
               
                }else{
                    custQuery = `SELECT sp.*, p.product_name,p.bu_id FROM ${process.env.WRITE_DB_DATABASE}.Supp_Prod_Price_Master sp INNER JOIN  ${process.env.WRITE_DB_DATABASE}.Product_Master p on p.product_id=sp.product_id  WHERE sp.supplier_id='${supplier_id}' AND  sp.branch_id='${branch_id}'`;

                }
   
                debug("getPoNumber", custQuery)
            
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
                debug('getPoNumber error :', error)
                return reject(err_code);
            }
        })
    }
    supplierwiseProduct(connection,org_id, branch_id, eod_date,flag) {
        return new Promise(async(resolve, reject)=> {
            try{
                var custQuery;
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                if(flag =='S') {
                    
                    custQuery = `select b.supplier_name,c.product_name,  a.* from  ${process.env.WRITE_DB_DATABASE}.Supp_Prod_Price_Master a,
                      ${process.env.WRITE_DB_DATABASE}.Supplier_Master b ,  ${process.env.WRITE_DB_DATABASE}.Product_Master c
                    where a.org_id=b.org_id and a.branch_id=b.branch_id and a.supplier_id=b.supplier_id
                    and a.org_id=c.org_id and a.product_id=c.product_id and a.org_id='${org_id}' 
                    and '${eod_date}' >= eff_from and '${eod_date}' <=if(isnull(eff_to),curdate(),eff_to)
                    order by b.supplier_name, c.product_name,eff_from`;
               
                }else{
                 
                    custQuery = `select b.supplier_name,c.product_name,  a.* from ${process.env.WRITE_DB_DATABASE}.Supp_Prod_Price_Master a,
                     ${process.env.WRITE_DB_DATABASE}.Supplier_Master b , ${process.env.WRITE_DB_DATABASE}.Product_Master c
                    where a.org_id=b.org_id and a.branch_id=b.branch_id and a.supplier_id=b.supplier_id and a.org_id='${org_id}' 
                    and a.org_id=c.org_id and a.product_id=c.product_id
                    order by b.supplier_name, c.product_name,eff_from`;

                }
   
                debug("supplierwiseProduct", custQuery)
            
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
                debug('supplierwiseProduct error :', error)
                return reject(err_code);
            }
        })
    }
    



    getSupplierProductpriceByProductId(connection,  product_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT sp.*, p.product_name,p.bu_id,s.supplier_name FROM ${process.env.WRITE_DB_DATABASE}.Supp_Prod_Price_Master sp INNER JOIN  ${process.env.WRITE_DB_DATABASE}.Product_Master p on p.product_id=sp.product_id                 
                INNER JOIN  ${process.env.WRITE_DB_DATABASE}.Supplier_Master s on s.supplier_id=sp.supplier_id WHERE sp.product_id='${product_id}' `;
                debug("getPoNumber", custQuery)
            
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
                debug('getPoNumber error :', error)
                return reject(err_code);
            }
        })
    }

    getGenerateSupplierId(connection, branch_id, seq_type) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT concat(concat(seq_type,branch_id),LPAD(last_seq_no+1,4,'0')) as supplier_id ,last_seq_no+1 as last_seq_no 
                FROM ${process.env.WRITE_DB_DATABASE}.Swastha_Seq_Generator WHERE branch_id='${branch_id}' AND seq_type='${seq_type}'`;
                debug("getGenerateSupplierId", custQuery)
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

                    var newpatientquery = `SELECT concat(concat(branch_id,seq_type),LPAD(0,4,'0')) as supplier_id ,last_seq_no as last_seq_no 
                    FROM ${process.env.WRITE_DB_DATABASE}.Swastha_Seq_Generator WHERE branch_id='${branch_id}' AND seq_type='${seq_type}'`;

                    debug("getGenerateSupplierId", newpatientquery)
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

    geSupplierProdId(connection, supplier_id, product_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT sp.org_id,sp.branch_id,sp.supplier_id,sp.product_id,sp.purchase_price,DATE_FORMAT(sp.eff_from,'%Y-%m-%d') AS eff_from,DATE_FORMAT(sp.eff_to,'%Y-%m-%d') AS eff_to,
                credit_days,active_flag,sp.updated_by,sp.updated_date,sp.created_by,sp.created_date FROM ${process.env.WRITE_DB_DATABASE}.Supp_Prod_Price_Master sp WHERE sp.supplier_id='${supplier_id}' AND sp.product_id='${product_id}'`;
                debug("geSupplierProdId", custQuery)
               
                
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
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
                debug('geSupplierId Error :', error)
                return reject(err_code);
            }
        })
    }

    getSupplierDetail(connection, org_id,branch_id, supplier_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Supplier_Master WHERE org_id='${org_id}' AND  branch_id='${branch_id}' AND supplier_id='${supplier_id}'`;
                debug("getSupplierDetail", custQuery)
            
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    return resolve(null);
                }
                else{
                    var res = JSON.parse(JSON.stringify(queryres));
                    var response = res[0];
                    return resolve(response);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getSupplierDetail error :', error)
                return reject(err_code);
            }
        })
    }

    GetSupplierProductCount(connection, org_id, branch_id, supplier_id, product_id, previous_date) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT COUNT(*) AS count FROM ${process.env.WRITE_DB_DATABASE}.Supp_Prod_Price_Master WHERE supplier_id='${supplier_id}' 
                AND product_id='${product_id}' AND org_id='${org_id}' AND branch_id='${branch_id}' AND eff_from<='${previous_date}' AND eff_to IS NULL`;
                debug("GetSupplierProductCount", custQuery)
               
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    return resolve(null);
                }
                else{
                    var _response = JSON.parse(JSON.stringify(queryres));
                    var response = _response[0].count;
                    return resolve(response);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('geSupplierId Error :', error)
                return reject(err_code);
            }
        })
    }

    createSupplierProducts(connection, supplier_prod_data) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`INSERT INTO ${process.env.WRITE_DB_DATABASE}.Supp_Prod_Price_Master SET ?`, supplier_prod_data);
                debug('COMMIT at createSupplier', supplier_prod_data);
                return resolve(supplier_prod_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("create supplier error :", err);
                return reject(err_code);
            }
        })
    }

    updateSupplierProducts(connection, set_update_supp_prods_data, org_id, branch_id, supplier_id, product_id, previous_date) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`UPDATE ${process.env.WRITE_DB_DATABASE}.Supp_Prod_Price_Master SET ? WHERE org_id='${org_id}' AND 
                branch_id='${branch_id}' AND supplier_id='${supplier_id}' AND product_id='${product_id}' AND eff_from<='${previous_date}' AND 
                eff_to IS NULL `, set_update_supp_prods_data);
                return resolve(set_update_supp_prods_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("updateSupplierProducts Error :", err);
                return reject(err_code);
            }
        })
    }
}

module.exports = {
    SupplierDao
}