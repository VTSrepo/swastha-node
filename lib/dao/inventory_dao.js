const mysql = require('../../common/db_utils');
var debug = require('debug')('v2:inventory:dao');
const BaseDao = require('./base_dao');

class InventoryDao extends BaseDao {

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

    getInventoryConfigDetail(connection, product_id, org_id, branch_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Swastha_Inventory_Config WHERE product_id='${product_id}' AND org_id='${org_id}'
                AND branch_id='${branch_id}'`;
                debug("getInventoryConfigDetail", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Inventory Config Not Available!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry, Inventory Config Not Available!.", developerMessage: "Sorry, Inventory Config Not Available!." };
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
                debug('getInventoryConfigDetail Error :', error)
                return reject(err_code);
            }
        })
    }

    createInventoryConfig(connection, inventory_config_data) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`INSERT INTO ${process.env.WRITE_DB_DATABASE}.Swastha_Inventory_Config SET ?`, inventory_config_data);
                debug('COMMIT at createInventoryConfig', inventory_config_data);
                return resolve(inventory_config_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("createInventoryConfig error :", err);
                return reject(err_code);
            }
        })
    }

    updateInventoryConfig(connection, update_inventory_config_data, product_id, org_id, branch_id) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`UPDATE ${process.env.WRITE_DB_DATABASE}.Swastha_Inventory_Config SET ? WHERE product_id='${product_id}' AND org_id='${org_id}'
                AND branch_id='${branch_id}'`, update_inventory_config_data);
               
                return resolve(update_inventory_config_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("updateInventoryConfig Error :", err);
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

                var custQuery = `SELECT concat(concat(seq_type,branch_id),LPAD(last_seq_no+1,6,'0')) as invoice_no ,last_seq_no+1 as last_seq_no 
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

                    var newpatientquery = `SELECT concat(concat(seq_type,branch_id),LPAD(0,6,'0')) as invoice_no ,last_seq_no as last_seq_no 
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

    getInventoryProductMapDetail(connection, source_product_id, target_product_id, org_id, branch_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Swastha_Inventory_Product_Map WHERE source_product_id='${source_product_id}' 
                AND target_product_id='${target_product_id}' AND org_id='${org_id}' AND branch_id='${branch_id}'`;
                debug("getInventoryProductMapDetail", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Inventory Product Map Not Available!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry, Inventory Product Map Not Available!.", developerMessage: "Sorry, Inventory Product Map Not Available!." };
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
                debug('getInventoryProductMapDetail Error :', error)
                return reject(err_code);
            }
        })
    }

    createInventoryProductMap(connection, inventory_product_map_data) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`INSERT INTO ${process.env.WRITE_DB_DATABASE}.Swastha_Inventory_Product_Map SET ?`, inventory_product_map_data);
                debug('COMMIT at createInventoryProductMap', inventory_product_map_data);
                return resolve(inventory_product_map_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("createInventoryProductMap error :", err);
                return reject(err_code);
            }
        })
    }

    updateInventoryProductMap(connection, update_inventory_product_map_data, source_product_id, target_product_id, org_id, branch_id) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`UPDATE ${process.env.WRITE_DB_DATABASE}.Swastha_Inventory_Product_Map SET ? WHERE source_product_id='${source_product_id}' 
                AND target_product_id='${target_product_id}' AND org_id='${org_id}' AND branch_id='${branch_id}'`, update_inventory_product_map_data);
               
                return resolve(update_inventory_product_map_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("updateInventoryProductMap Error :", err);
                return reject(err_code);
            }
        })
    }


    getInventoryProductList(connection, branch_id, source_product_id,query) {
        return new Promise(async(resolve, reject)=> {
            try{
                var custQuery;
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                custQuery = `SELECT sp.*,p.product_name as target_product_name,p.bu_id as target_bu_id 
                FROM ${process.env.WRITE_DB_DATABASE}.Swastha_Inventory_Product_Map sp , ${process.env.WRITE_DB_DATABASE}.Product_Master p 
                WHERE sp.target_product_id=p.product_id and sp.org_id=p.org_id and sp.branch_id=p.branch_id 
                and sp.source_product_id='${source_product_id}' AND  sp.branch_id='${branch_id}'`;


   
                debug("getInventoryProductList", custQuery)
            
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
                debug('getInventoryProductList error :', error)
                return reject(err_code);
            }
        })
    }

    getInventoryConfigList(connection, branch_id,query) {
        return new Promise(async(resolve, reject)=> {
            try{
                var custQuery;
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
              
                custQuery = ` SELECT sp.*,p.product_name,p.bu_id FROM ${process.env.WRITE_DB_DATABASE}.Swastha_Inventory_Config sp inner join 
                swastha_hms.Product_Master p on p.product_id=sp.product_id  where sp.branch_id='${branch_id}'`;

   
                debug("getInventoryProductList", custQuery)
            
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
                debug('getInventoryProductList error :', error)
                return reject(err_code);
            }
        })
    }

    

}

module.exports = {
    InventoryDao
}