const mysql = require('../../common/db_utils');
var debug = require('debug')('v2:po:dao');
const BaseDao = require('./base_dao');

class PoDao extends BaseDao {

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

    getPoNumber(connection, po_number) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT  d.org_id,d.branch_id,b.branch_name,d.po_number,d.supplier_id,d.po_status,(SELECT ref_desc FROM ${process.env.WRITE_DB_DATABASE}.Swastha_Ref_Master where ref_type='POSTA' and ref_code=d.po_status) as po_status_name
                ,d.po_value,d.po_paid,d.po_balance,d.goods_rcpt_status,(SELECT ref_desc FROM ${process.env.WRITE_DB_DATABASE}.Swastha_Ref_Master where ref_type='POSTA' and ref_code=d.goods_rcpt_status) as goods_rcpt_status_name,
                d.supp_inv_amt,DATE_FORMAT(d.po_date,'%Y-%m-%d') as po_date,d.updated_by,d.updated_date,d.created_by,d.created_date FROM ${process.env.WRITE_DB_DATABASE}.PO_Header d 
                INNER JOIN ${process.env.WRITE_DB_DATABASE}.Branch_Master b ON d.branch_id=b.branch_id WHERE d.po_number='${po_number}'`;
                debug("getPoNumber", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Data Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry,Data Not Available!.", developerMessage: "Sorry,Data Not Available!." };
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
                debug('getPoNumber error :', error)
                return reject(err_code);
            }
        })
    }
    createPoHeader(connection, po_header_data) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`INSERT INTO ${process.env.WRITE_DB_DATABASE}.PO_Header SET ?`, po_header_data);
                debug('COMMIT at createPoHeader');
                return resolve(po_header_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("create po error :", err);
                return reject(err_code);
            }
        })
    }

    createPoDetail(connection, set_po_detail) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`INSERT INTO ${process.env.WRITE_DB_DATABASE}.PO_Detail SET ?`, set_po_detail);
                debug('COMMIT at createPoDetail');
                return resolve(set_po_detail);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("create po detail error :", err);
                return reject(err_code);
            }
        })
    }

    updatePoHeader(connection, update_po_header, po_number) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`UPDATE ${process.env.WRITE_DB_DATABASE}.PO_Header SET ? WHERE po_number='${po_number}'`, update_po_header);
                
                debug('COMMIT at updatePo'+update_po_header);
                return resolve(update_po_header);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("updatePoHeader Error :", err);
                return reject(err_code);
            }
        })
    }

    GetPoListsByBranchId(connection, branch_id,supplier_id, query, strPagination) {
        return new Promise(async(resolve, reject)=> {
            try{
                var custQuery, inv_status;
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.PO_Header WHERE branch_id='${branch_id}' and supplier_id='${supplier_id}'`;
                debug("GetPoListsByBranchId", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Po Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry, Data Not Found!.", developerMessage: "Sorry, Data Not Found!." };
                    return resolve(error_code)
                }
                else{
                    return resolve(queryres)
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('GetPoListsByBranchId error :', error)
                return reject(err_code);
            }
        })
    }


    GetPoListsByStatus(connection, branch_id,supplier_id, po_status,query, strPagination) {
        return new Promise(async(resolve, reject)=> {
            try{
                var custQuery;
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
             
                custQuery = `SELECT  d.org_id,d.branch_id,b.branch_name,d.po_number,d.supplier_id,d.po_status,(SELECT ref_desc FROM ${process.env.WRITE_DB_DATABASE}.Swastha_Ref_Master where ref_type='POSTA' and ref_code=d.po_status) as po_status_name
                ,d.po_value,d.po_paid,d.po_balance,d.goods_rcpt_status,(SELECT ref_desc FROM ${process.env.WRITE_DB_DATABASE}.Swastha_Ref_Master where ref_type='POSTA' and ref_code=d.goods_rcpt_status) as goods_rcpt_status_name,
                d.supp_inv_amt,DATE_FORMAT(d.po_date,'%Y-%m-%d') as po_date,d.updated_by,d.updated_date,d.created_by,d.created_date FROM ${process.env.WRITE_DB_DATABASE}.PO_Header d 
                INNER JOIN ${process.env.WRITE_DB_DATABASE}.Branch_Master b ON d.branch_id=b.branch_id  WHERE d.branch_id='${branch_id}' and d.supplier_id='${supplier_id}' and d.po_status='${po_status}'`;
                debug("GetPoListsByStatus", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Po Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry, Data Not Found!.", developerMessage: "Sorry, Data Not Found!." };
                    return resolve(error_code)
                }
                else{
                    return resolve(queryres)
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('GetPoListsByStatus error :', error)
                return reject(err_code);
            }
        })
    }

    getCountPoByBranchId(connection, branch_id, query) {
        return new Promise(async(resolve, reject)=> {
            try{
                var custQuery, inv_status;
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                custQuery = `SELECT COUNT(*) as count FROM ${process.env.WRITE_DB_DATABASE}.PO_Header WHERE branch_id='${branch_id}'`;
                debug("getCountPoByBranchId", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Po Not Found!.', queryres);
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
                debug('getCountPoByBranchId error :', error)
                return reject(err_code);
            }
        })
    }

    GetPoListsByOrgId(connection, org_id, query, strPagination) {
        return new Promise(async(resolve, reject)=> {
            try{
                var custQuery, inv_status;
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.PO_Header WHERE org_id='${org_id}'`;
                debug("GetPoListsByOrgId", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Po Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry, Data Not Found!.", developerMessage: "Sorry, Data Not Found!." };
                    return resolve(error_code)
                }
                else{
                    return resolve(queryres)
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('GetPoListsByOrgId error :', error)
                return reject(err_code);
            }
        })
    }

    GetPoDetailList(connection, query, po_number) {
        return new Promise(async(resolve, reject)=> {
            try{
                var custQuery;
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
               // custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.PO_Detail INNER JOIN tbl_branch WHERE po_number='${po_number}'`;

               custQuery = `SELECT d.org_id,d.branch_id,b.branch_name,d.po_number,d.supplier_id,d.item_code,p.product_name,d.qty_ordered,d.item_cost, 
               DATE_FORMAT(d.po_date,'%Y-%m-%d') as po_date,d.item_disc,d.item_other_charge,d.net_value,(SELECT ref_desc FROM ${process.env.WRITE_DB_DATABASE}.Swastha_Ref_Master where ref_type='ITMSTA' and ref_code=d.item_status) as item_status_name,
               d.qty_received,d.qty_balance,d.item_status,d.supp_inv_amt,d.exp_del_date,d.remarks,d.del_branch_id,(SELECT branch_name FROM ${process.env.WRITE_DB_DATABASE}.Branch_Master where  branch_id=del_branch_id) as del_branch_name,
               d.updated_by,d.updated_date,d.created_by,d.created_date  FROM ${process.env.WRITE_DB_DATABASE}.PO_Detail d inner join 
               ${process.env.WRITE_DB_DATABASE}.Branch_Master b on d.branch_id=b.branch_id inner join ${process.env.WRITE_DB_DATABASE}.Product_Master p on d.item_code=p.product_id WHERE d.po_number='${po_number}'`;

                debug("GetPoDetailList", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Po Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry, Data Not Found!.", developerMessage: "Sorry, Data Not Found!." };
                    return resolve(error_code)
                }
                else{
                    return resolve(queryres)
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('GetPoListsByOrgId error :', error)
                return reject(err_code);
            }
        })
    }

    getCountPoByOrgId(connection, org_id, query) {
        return new Promise(async(resolve, reject)=> {
            try{
                var custQuery, inv_status;
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                custQuery = `SELECT COUNT(*) as count FROM ${process.env.WRITE_DB_DATABASE}.PO_Header WHERE org_id='${org_id}'`;
                debug("getCountPoByOrgId", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Po Not Found!.', queryres);
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
                debug('getCountPoByOrgId error :', error)
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

    getPoGoodReceipt(connection, branch_id, seq_type) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                //eceipt Num is continous number (1,2,3) for combination of Primary Key org_id,branch_id,supplier_id,po_number & item_code.  
                var custQuery = `SELECT concat(concat(seq_type,branch_id),LPAD(last_seq_no+1,4,'0')) as invoice_no ,last_seq_no+1 as last_seq_no 
                FROM ${process.env.WRITE_DB_DATABASE}.Swastha_Seq_Generator WHERE branch_id='${branch_id}' AND seq_type='${seq_type}'`;
                debug("getPoGoodReceipt", custQuery)
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

                    var newpatientquery = `SELECT concat(concat(seq_type,branch_id),LPAD(0,4,'0')) as invoice_no ,last_seq_no as last_seq_no 
                    FROM ${process.env.WRITE_DB_DATABASE}.Swastha_Seq_Generator WHERE branch_id='${branch_id}' AND seq_type='${seq_type}'`;

                    debug("getPoGoodReceipt", newpatientquery)
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
                debug('getPoGoodReceipt error :', error)
                return reject(err_code);
            }
        })
    }

    createPoGoods(connection, insert_po_goods_data) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`INSERT INTO ${process.env.WRITE_DB_DATABASE}.PO_Goods_Receipt SET ?`, insert_po_goods_data);
                debug('COMMIT at createPoDetail');
                return resolve(insert_po_goods_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("create po detail error :", err);
                return reject(err_code);
            }
        })
    }

    updatePoDetail(connection, update_po_detail, org_id, branch_id, po_num, supplier_id, item_code) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`UPDATE ${process.env.WRITE_DB_DATABASE}.PO_Detail SET ? WHERE po_number='${po_num}' 
                and org_id='${org_id}' AND branch_id='${branch_id}' AND po_number='${po_num}' 
                AND supplier_id='${supplier_id}' AND item_code='${item_code}'`, update_po_detail);
                debug('COMMIT at updatePoDetail');
                return resolve(update_po_detail);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("updatePoDetail Error :", err);
                return reject(err_code);
            }
        })
    }

    GetPoDetail(connection, org_id, branch_id, po_num, supplier_id, item_code) {
        return new Promise(async(resolve, reject)=> {
            try{
                var custQuery, inv_status;
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.PO_Detail WHERE org_id='${org_id}' AND branch_id='${branch_id}' AND po_number='${po_num}' 
                AND supplier_id='${supplier_id}' AND item_code='${item_code}'`;
                debug("GetPoDetail", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, GetPoDetail Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry, Data Not Found!.", developerMessage: "Sorry, Data Not Found!." };
                    return resolve(null)
                }
                else{
                    var respose = JSON.parse(JSON.stringify(queryres));
                    var response = respose[0];
                    return resolve(response)
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('GetPoDetail error :', error)
                return reject(err_code);
            }
        })
    }

    GetPoDetailPendingCount(connection, org_id, branch_id,supplier_id, po_number ) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT COUNT(*) as count FROM ${process.env.WRITE_DB_DATABASE}.PO_Detail WHERE org_id='${org_id}' AND branch_id='${branch_id}' AND po_number='${po_number}' and item_status='P' 
                AND supplier_id='${supplier_id}'`;
                debug("GetPoDetailPendingCount", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    var response = null;
                    return resolve(error_code)
                }
                else{
                    var res = JSON.parse(JSON.stringify(queryres))
                    var response = res[0].count;
                    return resolve(response)
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getCountPatientbyBranchId error :', error)
                return reject(err_code);
            }
        })
    }

    GetPoHeaderData(connection, org_id, branch_id,supplier_id, po_number) {
        return new Promise(async(resolve, reject)=> {
            try{
                var custQuery;
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.PO_Header WHERE org_id='${org_id}' AND branch_id='${branch_id}' 
                and supplier_id='${supplier_id}' and po_number='${po_number}'`;
                debug("GetPoHeaderData", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, GetPoHeaderData Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry, Data Not Found!.", developerMessage: "Sorry, Data Not Found!." };
                    return resolve(null)
                }
                else{
                    var respose = JSON.parse(JSON.stringify(queryres));
                    var response = respose[0];
                    return resolve(response)
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('GetPoHeaderData error :', error)
                return reject(err_code);
            }
        })
    }

    GetDetailInvAmt(connection, supplier_id, po_number) {
        return new Promise(async(resolve, reject)=> {
            try{
                var custQuery;
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                custQuery = `SELECT sum(supp_inv_amt) as count FROM ${process.env.WRITE_DB_DATABASE}.PO_Detail WHERE  supplier_id='${supplier_id}' and po_number='${po_number}'`;
                debug("GetSupplierInvAmt", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                  
                    return resolve(0)
                }
                else{
                    var respose = JSON.parse(JSON.stringify(queryres));
                    var response = respose[0].count;
                    return resolve(response)
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('GetSupplierInvAmt error :', error)
                return reject(err_code);
            }
        })
    }

    GetSupplierInvAmt(connection, po_number, supplier_id, supp_inv_number) {
        return new Promise(async(resolve, reject)=> {
            try{
                var custQuery;
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                custQuery = `SELECT sum(gr_supp_inv_amt) as count FROM ${process.env.WRITE_DB_DATABASE}.PO_Goods_Receipt WHERE supp_inv_number='${supp_inv_number}' 
                and supplier_id='${supplier_id}' and po_number='${po_number}'`;
                debug("GetSupplierInvAmt", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, GetSupplierInvAmt Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry, Data Not Found!.", developerMessage: "Sorry, Data Not Found!." };
                    return resolve(0)
                }
                else{
                    var respose = JSON.parse(JSON.stringify(queryres));
                    var response = respose[0].count;
                    return resolve(response)
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('GetSupplierInvAmt error :', error)
                return reject(err_code);
            }
        })
    }

    createPoPaymentSchedule(connection, po_supplier_payment_schedule_data) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`INSERT INTO ${process.env.WRITE_DB_DATABASE}.PO_Supplier_Payment_schedule SET ?`, po_supplier_payment_schedule_data);
                debug('COMMIT at createPoPaymentSchedule');
                return resolve(po_supplier_payment_schedule_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("create createPoPaymentSchedule error :", err);
                return reject(err_code);
            }
        })
    }


    getMaxReceiptNumber(connection,  org_id, branch_id, supplier_id, po_number,item_code) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT max(receipt_num) AS receipt_num FROM ${process.env.WRITE_DB_DATABASE}.PO_Goods_Receipt WHERE org_id='${org_id}' AND 
                branch_id='${branch_id}' and  supplier_id='${supplier_id}' AND po_number='${po_number}' AND item_code='${item_code}'`;
                
                debug("getMaxReceiptNumber", custQuery)
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

    getGoodreceiptListGrpbyinvno(connection,  org_id, branch_id, supplier_id, po_number) {
        return new Promise(async (resolve, reject) => {
            try {
                if (connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage: "DB Connection Failed!." };
                    return reject(err_code)
                }
                var custQuery = `SELECT supp_inv_number,sum(gr_supp_inv_amt) as gr_supp_inv_amt FROM ${process.env.WRITE_DB_DATABASE}.PO_Goods_Receipt
                  where org_id='${org_id}' and branch_id='${branch_id}' and supplier_id='${supplier_id}' and po_number='${po_number}' group by supp_inv_number `;

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

    getSuppPaymentData(connection, org_id, branch_id, supplier_id, po_number, supp_inv_number) {
        return new Promise(async(resolve, reject)=> {
            try{
                var custQuery;
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.PO_Supplier_Payment_schedule WHERE org_id='${org_id}' AND branch_id='${branch_id}' 
                and supplier_id='${supplier_id}' and po_number='${po_number}' AND supplier_invoice_num='${supp_inv_number}'`;
                debug("getSuppPaymentData", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, getSuppPaymentData Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry, Data Not Found!.", developerMessage: "Sorry, Data Not Found!." };
                    return resolve(null)
                }
                else{
                    var respose = JSON.parse(JSON.stringify(queryres));
                    var response = respose[0];
                    return resolve(response)
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getSuppPaymentData error :', error)
                return reject(err_code);
            }
        })
    }

    updatePoPaymentSchedule(connection, po_supplier_payment_schedule_update_data, data, supp_inv_number) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`UPDATE ${process.env.WRITE_DB_DATABASE}.PO_Supplier_Payment_schedule SET ? WHERE org_id='${data.org_id}' AND 
                branch_id='${data.branch_id}' and supplier_id='${data.supplier_id}' and po_number='${data.po_number}' AND 
                supplier_invoice_num='${supp_inv_number}'`, po_supplier_payment_schedule_update_data);
                debug('COMMIT at updatePoDetail--->',po_supplier_payment_schedule_update_data, data, supp_inv_number);
                return resolve(po_supplier_payment_schedule_update_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("updatePoDetail Error :", err);
                return reject(err_code);
            }
        })
    }

    GetPoDetails(connection, org_id, branch_id, po_num) {
        return new Promise(async(resolve, reject)=> {
            try{
                var custQuery, inv_status;
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.PO_Detail WHERE org_id='${org_id}' AND branch_id='${branch_id}' AND po_number='${po_num}'`;
                debug("GetPoDetail", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, GetPoDetail Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry, Data Not Found!.", developerMessage: "Sorry, Data Not Found!." };
                    return resolve(null)
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('GetPoDetail error :', error)
                return reject(err_code);
            }
        })
    }

    updatePoDetails(connection, update_po_detail, org_id, branch_id, po_num) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`UPDATE ${process.env.WRITE_DB_DATABASE}.PO_Detail SET ? WHERE 
                org_id='${org_id}' AND branch_id='${branch_id}' AND po_number='${po_num}'`, update_po_detail);
                debug('COMMIT at updatePoDetails');
                return resolve(update_po_detail);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("updatePoDetails Error :", err);
                return reject(err_code);
            }
        })
    }
    
    getGoodreceiptList(connection,  org_id, branch_id, supplier_id, po_number, item_code) {
        return new Promise(async (resolve, reject) => {
            try {
                if (connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage: "DB Connection Failed!." };
                    return reject(err_code)
                }
                var custQuery = `SELECT org_id,branch_id,supplier_id,po_number,DATE_FORMAT(po_date,'%Y-%m-%d') as po_date,item_code,receipt_num,gr_qty_received,
                DATE_FORMAT(receipt_date,'%Y-%m-%d') as receipt_date,supp_inv_number,gr_supp_inv_amt,DATE_FORMAT(supp_inv_date,'%Y-%m-%d') as  supp_inv_date FROM ${process.env.WRITE_DB_DATABASE}.PO_Goods_Receipt 
                where org_id='${org_id}' and branch_id='${branch_id}' and supplier_id='${supplier_id}' and po_number='${po_number}' and item_code='${item_code}' ORDER BY po_number,item_code,receipt_num `;

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

    GetPoSupplierScheduleList(connection, org_id,branch_id,supplier_id,query) {
        return new Promise(async (resolve, reject) => {
            try {
                var custQuery;
                if (connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage: "DB Connection Failed!." };
                    return reject(err_code)
                }
                if(query.filter.payment_status) {
                    custQuery = `SELECT *,DATE_FORMAT(po_date,'%Y-%m-%d') as po_date, DATE_FORMAT(payment_date,'%Y-%m-%d') as payment_date
                    FROM ${process.env.WRITE_DB_DATABASE}.PO_Supplier_Payment_schedule  WHERE org_id='${org_id}' and branch_id='${branch_id}' and 
                    supplier_id='${supplier_id}' and Payment_status='${query.filter.payment_status}' ORDER BY payment_date`;
                }
                else{
                    custQuery = `SELECT *,DATE_FORMAT(po_date,'%Y-%m-%d') as po_date, DATE_FORMAT(payment_date,'%Y-%m-%d') as payment_date
                    FROM ${process.env.WRITE_DB_DATABASE}.PO_Supplier_Payment_schedule  WHERE org_id='${org_id}' and branch_id='${branch_id}' and 
                    supplier_id='${supplier_id}'   ORDER BY payment_date`; 
                }

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

    getMaxPoSupplierPayment(connection, supplier_id, po_number, supplier_invoice_num) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT max(payment_num) AS payment_num FROM ${process.env.WRITE_DB_DATABASE}.PO_Supplier_Payment WHERE supplier_id='${supplier_id}' 
                AND po_number='${po_number}' AND supplier_invoice_num='${supplier_invoice_num}'`;
                
                debug("getMaxReceiptNumber", custQuery)
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

    createPoSupplierPayment(connection, po_supplier_payment_data) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`INSERT INTO ${process.env.WRITE_DB_DATABASE}.PO_Supplier_Payment SET ?`, po_supplier_payment_data);
                debug('COMMIT at createPoSupplierPayment');
                return resolve(po_supplier_payment_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("create createPoSupplierPayment error :", err);
                return reject(err_code);
            }
        })
    }

    GetPoSupplierSchedule(connection, org_id,branch_id,po_number, supplier_id,supplier_invoice_num) {
        return new Promise(async (resolve, reject) => {
            try {
                var custQuery;
                if (connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage: "DB Connection Failed!." };
                    return reject(err_code)
                }
                custQuery = `SELECT *,DATE_FORMAT(po_date,'%Y-%m-%d') as po_date, DATE_FORMAT(payment_date,'%Y-%m-%d') as payment_date
                    FROM ${process.env.WRITE_DB_DATABASE}.PO_Supplier_Payment_schedule  WHERE org_id='${org_id}' and branch_id='${branch_id}' and 
                    supplier_id='${supplier_id}' and po_number='${po_number}' AND supplier_invoice_num='${supplier_invoice_num}'`; 

                console.log(custQuery);
                
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
            catch (err) {
                console.log(err);
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage: "Sorry, Internal Server Error!." };
                debug("Fetch patient advance :", err);
                return reject(err_code);
            }
        })
    }

    updatePoPaySchedule(connection, update_po_supplier_payment_schedule_data, data) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`UPDATE ${process.env.WRITE_DB_DATABASE}.PO_Supplier_Payment_schedule SET ? WHERE org_id='${data.org_id}' AND 
                branch_id='${data.branch_id}' and supplier_id='${data.supplier_id}' and po_number='${data.po_number}' AND 
                supplier_invoice_num='${data.supplier_invoice_num}'`, update_po_supplier_payment_schedule_data);
                debug('COMMIT at updatePoDetail');
                return resolve(update_po_supplier_payment_schedule_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("updatePoDetail Error :", err);
                return reject(err_code);
            }
        })
    }

    getPoSupplierPayment(connection, org_id, branch_id, po_number, supplier_id, supplier_invoice_num, payment_num) {
        return new Promise(async (resolve, reject) => {
            try {
                var custQuery;
                if (connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage: "DB Connection Failed!." };
                    return reject(err_code)
                }
                custQuery = `SELECT *,DATE_FORMAT(po_date,'%Y-%m-%d') as po_date, DATE_FORMAT(payment_date,'%Y-%m-%d') as payment_date
                    FROM ${process.env.WRITE_DB_DATABASE}.PO_Supplier_Payment  WHERE org_id='${org_id}' and branch_id='${branch_id}' and 
                    supplier_id='${supplier_id}' and po_number='${po_number}' AND supplier_invoice_num='${supplier_invoice_num}' AND payment_num='${payment_num}'`; 

                console.log(custQuery);
                
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
            catch (err) {
                console.log(err);
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage: "Sorry, Internal Server Error!." };
                debug("Fetch patient advance :", err);
                return reject(err_code);
            }
        })
    }

    updatePoSupplierPayment(connection, po_supplier_payment_data, org_id, branch_id, po_number, supplier_id, supplier_invoice_num, payment_num) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`UPDATE ${process.env.WRITE_DB_DATABASE}.PO_Supplier_Payment SET ? WHERE org_id='${org_id}' and branch_id='${branch_id}' and 
                supplier_id='${supplier_id}' and po_number='${po_number}' AND supplier_invoice_num='${supplier_invoice_num}' AND payment_num='${payment_num}'`, po_supplier_payment_data);
                debug('COMMIT at updatePoSupplierPayment');
                return resolve(po_supplier_payment_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("create updatePoSupplierPayment error :", err);
                return reject(err_code);
            }
        })
    }

    GetPoSupplierScheduleCount(connection, org_id,branch_id,po_number, supplier_id) {
        return new Promise(async (resolve, reject) => {
            try {
                var custQuery;
                if (connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage: "DB Connection Failed!." };
                    return reject(err_code)
                }
                custQuery = `SELECT COUNT(*) as count
                    FROM ${process.env.WRITE_DB_DATABASE}.PO_Supplier_Payment_schedule  WHERE org_id='${org_id}' and branch_id='${branch_id}' and 
                    supplier_id='${supplier_id}' and po_number='${po_number}' AND payment_status <>'P'`; 

                console.log("GetPoSupplierScheduleCount",custQuery);
                
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    return resolve(null);
                }
                else{
                    var res = JSON.parse(JSON.stringify(queryres));
                    var response = res[0].count;
                    return resolve(response);
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

    getReceiptPayData(connection, org_id, branch_id, trans_id) {
        return new Promise(async (resolve, reject) => {
            try {
                var custQuery;
                if (connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage: "DB Connection Failed!." };
                    return reject(err_code)
                }
                custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Rcpt_Pay_Details  WHERE org_id='${org_id}' and branch_id='${branch_id}' 
                and trans_id='${trans_id}'`; 
                console.log(custQuery);
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
            catch (err) {
                console.log(err);
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage: "Sorry, Internal Server Error!." };
                debug("Error in getReceiptPayData:", err);
                return reject(err_code);
            }
        })
    }

    createReceiptPayData(connection, receipt_payments_data) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`INSERT INTO ${process.env.WRITE_DB_DATABASE}.Rcpt_Pay_Details SET ?`, receipt_payments_data);
                debug('COMMIT at createReceiptPayData');
                return resolve(receipt_payments_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("create createReceiptPayData error :", err);
                return reject(err_code);
            }
        })
    }

    updateReceiptPayData(connection, receipt_payments_data, org_id, branch_id, trans_id) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`UPDATE ${process.env.WRITE_DB_DATABASE}.Rcpt_Pay_Details SET ? WHERE org_id='${org_id}' and branch_id='${branch_id}' and 
                trans_id='${trans_id}'`, receipt_payments_data);
                debug('COMMIT at updateReceiptPayData');
                return resolve(receipt_payments_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("create updateReceiptPayData error :", err);
                return reject(err_code);
            }
        })
    }

    getReceiptPaymentId(connection, branch_id, seq_type) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }

                var custQuery = `SELECT concat(concat(branch_id),LPAD(last_seq_no+1,6,'0')) as trans_id ,last_seq_no+1 as last_seq_no 
                FROM ${process.env.WRITE_DB_DATABASE}.Swastha_Seq_Generator WHERE branch_id='${branch_id}' AND seq_type='${seq_type}'`;
                debug("getReceiptPaymentId", custQuery)
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

                    var newpatientquery = `SELECT concat(concat(branch_id),LPAD(1,5,'0')) as trans_id ,last_seq_no as last_seq_no 
                    FROM ${process.env.WRITE_DB_DATABASE}.Swastha_Seq_Generator WHERE branch_id='${branch_id}' AND seq_type='${seq_type}'`;

                    debug("getReceiptPaymentId", newpatientquery)
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
                debug('getReceiptPaymentId error :', error)
                return reject(err_code);
            }
        })
    }

    GetReceiptPayments(connection, org_id,branch_id,account_type,from_date,to_date,query) {
        return new Promise(async (resolve, reject) => {
            try {
                var custQuery;
                if (connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage: "DB Connection Failed!." };
                    return reject(err_code)
                }
                
                    custQuery = `SELECT *, DATE_FORMAT(trans_date,'%Y-%m-%d') as trans_date, DATE_FORMAT(voucher_date,'%Y-%m-%d') as voucher_date,
                    (select ref_desc from ${process.env.WRITE_DB_DATABASE}.Swastha_Ref_Master e  where e.ref_code=payment_mode and e.ref_type="PAYMOD") as payment_mode_name  
                    FROM ${process.env.WRITE_DB_DATABASE}.Rcpt_Pay_Details  WHERE org_id='${org_id}' and branch_id='${branch_id}' and 
                    account_type='${account_type}' and trans_date between '${from_date}' and '${to_date}'   ORDER BY trans_date`; 
                

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

    GetPoSupplierPayments(connection, org_id,branch_id,supplier_id,po_number,supplier_invoice_num,query) {
        return new Promise(async (resolve, reject) => {
            try {
                var custQuery;
                if (connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage: "DB Connection Failed!." };
                    return reject(err_code)
                }
                
                    custQuery = `SELECT *, DATE_FORMAT(po_date,'%Y-%m-%d') as po_date, DATE_FORMAT(payment_date,'%Y-%m-%d') as payment_date,
                    (select ref_desc from ${process.env.WRITE_DB_DATABASE}.Swastha_Ref_Master e  where e.ref_code=payment_mode and e.ref_type="PAYMOD") as payment_mode_name  
                    FROM ${process.env.WRITE_DB_DATABASE}.PO_Supplier_Payment  WHERE org_id='${org_id}' and branch_id='${branch_id}' and 
                    supplier_id='${supplier_id}' and po_number='${po_number}' and supplier_invoice_num='${supplier_invoice_num}'    ORDER BY payment_date`; 
                

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
    
     GetGoodReceiptReportList(connection, org_id,branch_id,from_date, to_date) {
        return new Promise(async (resolve, reject) => {
            try {
                if (connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage: "DB Connection Failed!." };
                    return reject(err_code)
                }
         
                var custQuery = `select d.supplier_name,a.po_number,a.po_date, c.supp_inv_number,c.supp_inv_date,e.product_name,
                b.qty_ordered,c.gr_qty_received,b.qty_balance,f.ref_desc item_status,g.ref_desc goods_rcpt_status
                from  ${process.env.WRITE_DB_DATABASE}.PO_Header a,  ${process.env.WRITE_DB_DATABASE}.PO_Detail b,  ${process.env.WRITE_DB_DATABASE}.PO_Goods_Receipt c,
                ${process.env.WRITE_DB_DATABASE}.Supplier_Master d,  ${process.env.WRITE_DB_DATABASE}.Product_Master e,  ${process.env.WRITE_DB_DATABASE}.Swastha_Ref_Master f,
                ${process.env.WRITE_DB_DATABASE}. Swastha_Ref_Master g
                where a.org_id='${org_id}' and a.branch_id='${branch_id}' and a.po_number=b.po_number and b.po_number=c.po_number and b.item_code=c.item_code
                and a.supplier_id=d.supplier_id and b.item_code=e.product_id and b.item_status=f.ref_code and f.ref_type="ITMSTA"
                and a.goods_rcpt_status=g.ref_code and g.ref_type="GRSTA" and a.po_date between '${from_date}' and '${to_date}'
                order by d.supplier_name,a.po_number,b.item_code,c.receipt_num`;
                
                debug("GetGoodReceiptReportList Query", custQuery);
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    var error_code = { status: 500, code: 5001, message: "Sorry, Data Not Available!.", developerMessage: "Sorry, Data Not Available!." };
                    debug("GetGoodReceiptReportList:", error_code);
                    return resolve(error_code);
                }
                else{
                    return resolve(queryres); 
                }
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage: "Sorry, Internal Server Error!." };
                debug("Error in GetGoodReceiptReportList:", err);
                return reject(err_code);
            }
        })
    }

    GetSupplierPaymentReportList(connection, org_id,branch_id,from_date, to_date) {
        return new Promise(async (resolve, reject) => {
            try {
                if (connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage: "DB Connection Failed!." };
                    return reject(err_code)
                }
                var custQuery = `Select c.supplier_name,a.po_number,a.po_date,b.supplier_invoice_num,b.supp_inv_date,e.payment_date,b.supp_inv_amt,b.supp_inv_amt_paid,
                b.supp_inv_amt_bal,d.ref_desc po_status,if(b.payment_status="U","Not Fully Paid","Fully Paid") payment_status,
                e.payment_value, f.ref_desc payment_mode, e.payment_desc FROM  ${process.env.WRITE_DB_DATABASE}.PO_Header a,  ${process.env.WRITE_DB_DATABASE}.PO_Supplier_Payment_schedule b,
                ${process.env.WRITE_DB_DATABASE}. Supplier_Master c,  ${process.env.WRITE_DB_DATABASE}.Swastha_Ref_Master d,
                ${process.env.WRITE_DB_DATABASE}.PO_Supplier_Payment e,  ${process.env.WRITE_DB_DATABASE}.Swastha_Ref_Master f 
                WHERE a.supplier_id=c.supplier_id and a.org_id=c.org_id and a.org_id='${org_id}' 
                and a.branch_id='${branch_id}' and a.po_number=b.po_number and a.po_status=d.ref_code and d.ref_type="POSTA"
                and b.po_number=e.po_number and b.supplier_invoice_num = e.supplier_invoice_num and b.supplier_id=e.supplier_id
                and e.payment_mode=f.ref_code and f.ref_type="PAYMOD" and a.po_date between '${from_date}' and '${to_date}'
                order by c.supplier_name, a.po_number, b.supplier_invoice_num, e.payment_num`;
                
                debug("GetSupplierPaymentReportList Query", custQuery);
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    var error_code = { status: 500, code: 5001, message: "Sorry, Data Not Available!.", developerMessage: "Sorry, Data Not Available!." };
                    debug("GetSupplierPaymentReportList:", error_code);
                    return resolve(error_code);
                }
                else{
                    return resolve(queryres); 
                }
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage: "Sorry, Internal Server Error!." };
                debug("Error in GetSupplierPaymentReportList:", err);
                return reject(err_code);
            }
        })
    }

    GetPoInvoiceSummaryReportList(connection, org_id,branch_id,from_date,to_date) {
        return new Promise(async (resolve, reject) => {
            try {
                if (connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage: "DB Connection Failed!." };
                    return reject(err_code)
                }
                // var custQuery = `Select c.supplier_id,c.supplier_name,sum(b.supp_inv_amt) supp_inv_amt ,sum(b.supp_inv_amt_paid) supp_inv_amt_paid,
                // sum(b.supp_inv_amt_bal) supp_inv_amt_bal from PO_Header a, PO_Supplier_Payment_schedule b, Supplier_Master c 
                // where a.supplier_id=c.supplier_id and  a.org_id=b.org_id  and                    
                // a.org_id=b.org_id and a.branch_id='${branch_id}' and a.po_number=b.po_number  and a.po_date between '${from_date}' and '${to_date}'  
                // group by c.supplier_name ,c.supplier_id  order by c.supplier_name`;  
                   
           
                var custQuery = ` Select c.supplier_id,c.supplier_name,sum(b.supp_inv_amt) supp_inv_amt ,sum(b.supp_inv_amt_paid) supp_inv_amt_paid,
                sum(b.supp_inv_amt_bal) supp_inv_amt_bal
                from ${process.env.WRITE_DB_DATABASE}.PO_Header a, ${process.env.WRITE_DB_DATABASE}.PO_Supplier_Payment_schedule b, ${process.env.WRITE_DB_DATABASE}.Supplier_Master c
                where a.supplier_id=c.supplier_id and a.org_id=c.org_id and a.org_id=b.org_id and a.branch_id=b.branch_id and
                a.po_number=b.po_number  and a.po_date between '${from_date}' and '${to_date}' and a.org_id='${org_id}' and a.branch_id='${branch_id}'
                group by c.supplier_name,c.supplier_id    
               order by c.supplier_name`;
                
                debug("GetPoSummaryReportList Query", custQuery);
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    var error_code = { status: 500, code: 5001, message: "Sorry, Data Not Available!.", developerMessage: "Sorry, Data Not Available!." };
                    debug("GetPoSummaryReportList:", error_code);
                    return resolve(error_code);
                }
                else{
                    return resolve(queryres); 
                }
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage: "Sorry, Internal Server Error!." };
                debug("Error in GetPoSummaryReportList:", err);
                return reject(err_code);
            }
        })
    }

    GetPoInvoiceDetailReportList(connection, org_id,branch_id,supplier_id,from_date,to_date) {
        return new Promise(async (resolve, reject) => {
            try {
                if (connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage: "DB Connection Failed!." };
                    return reject(err_code)
                }
              /*  var custQuery = `     Select c.supplier_name,a.po_number,a.po_date,b.supplier_invoice_num,b.payment_date,b.supp_inv_amt,b.supp_inv_amt_paid,
                b.supp_inv_amt_bal,d.ref_desc po_status,e.ref_desc goods_rcpt_status
                 ,if(b.payment_status="U","Not Fully Paid","Fully Paid") payment_status
                from PO_Header a, PO_Supplier_Payment_schedule b, Supplier_Master c, Swastha_Ref_Master d, Swastha_Ref_Master e
                where a.supplier_id='${supplier_id}' and a.org_id='${org_id}' and a.org_id=b.org_id and a.branch_id='${branch_id}' and a.po_number=b.po_number 
                and a.po_status=d.ref_code and d.ref_type="POSTA" and 
                a.goods_rcpt_status=e.ref_code and e.ref_type="GRSTA" and a.po_date between '${from_date}' and '${to_date}'
                order by c.supplier_name, a.po_number`;  */
                   

                var custQuery = `Select c.supplier_name,a.po_number,a.po_date,b.supplier_invoice_num,b.payment_date,b.supp_inv_amt,b.supp_inv_amt_paid,
                 b.supp_inv_amt_bal,d.ref_desc po_status,e.ref_desc goods_rcpt_status
                ,if(b.payment_status="U","Not Fully Paid","Fully Paid") payment_status
                from PO_Header a, PO_Supplier_Payment_schedule b, Supplier_Master c, Swastha_Ref_Master d, Swastha_Ref_Master e
   where a.supplier_id=c.supplier_id and 
       a.org_id=c.org_id and
       a.org_id=b.org_id and a.branch_id=b.branch_id  and a.po_number=b.po_number 
       and 
       a.po_status=d.ref_code and d.ref_type="POSTA" and
       a.po_date between '${from_date}' and '${to_date}' and 
       a.goods_rcpt_status=e.ref_code and e.ref_type="GRSTA"   and a.supplier_id='${supplier_id}'  and a.org_id='${org_id}' and a.branch_id='${branch_id}'
       order by c.supplier_name, a.po_number`;
                
                debug("GetPoSummaryReportList Query", custQuery);
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    var error_code = { status: 500, code: 5001, message: "Sorry, Data Not Available!.", developerMessage: "Sorry, Data Not Available!." };
                    debug("GetPoSummaryReportList:", error_code);
                    return resolve(error_code);
                }
                else{
                    return resolve(queryres); 
                }
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage: "Sorry, Internal Server Error!." };
                debug("Error in GetPoSummaryReportList:", err);
                return reject(err_code);
            }
        })
    }
   
    GetFromEmailData(connection, org_id, branch_id) {
        return new Promise(async (resolve, reject) => {
            try {
                if (connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage: "DB Connection Failed!." };
                    return reject(err_code)
                }
                var custQuery = `Select branch_name, branch_address, branch_contact_num, branch_email_id 
                from Branch_Master where org_id='${org_id}' and branch_id='${branch_id}'`;
                
                debug("GetFromEmailData Query", custQuery);
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
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage: "Sorry, Internal Server Error!." };
                debug("Error in GetFromEmailData:", err);
                return reject(err_code);
            }
        })
    }

    GetToEmailData(connection, org_id, supplier_id) {
        return new Promise(async (resolve, reject) => {
            try {
                if (connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage: "DB Connection Failed!." };
                    return reject(err_code)
                }
                var custQuery = `Select supplier_name, supplier_address,supplier_contact_num,supplier_email_id
                from Supplier_Master where org_id='${org_id}'  and supplier_id='${supplier_id}'`;
                
                debug("GetToEmailData Query", custQuery);
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
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage: "Sorry, Internal Server Error!." };
                debug("Error in GetToEmailData:", err);
                return reject(err_code);
            }
        })
    }

    GetPoData(connection, po_number) {
        return new Promise(async (resolve, reject) => {
            try {
                if (connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage: "DB Connection Failed!." };
                    return reject(err_code)
                }
                var custQuery = `Select *, DATE_FORMAT(po_date,'%Y-%m-%d') as po_date from PO_Header where po_number='${po_number}'`;
                
                debug("GetPoEmailData Query", custQuery);
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
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage: "Sorry, Internal Server Error!." };
                debug("Error in GetPoEmailData:", err);
                return reject(err_code);
            }
        })
    }

    GetPoEmailData(connection, org_id, po_number) {
        return new Promise(async (resolve, reject) => {
            try {
                if (connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage: "DB Connection Failed!." };
                    return reject(err_code)
                }
                var custQuery = `Select po_number, DATE_FORMAT(po_date,'%Y-%m-%d') as po_date from PO_Header where org_id='${org_id}' and po_number='${po_number}' and po_status="S"`;
                
                debug("GetPoEmailData Query", custQuery);
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
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage: "Sorry, Internal Server Error!." };
                debug("Error in GetPoEmailData:", err);
                return reject(err_code);
            }
        })
    }

    GetPoEmailBodyData(connection, org_id, po_number) {
        return new Promise(async (resolve, reject) => {
            try {
                if (connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage: "DB Connection Failed!." };
                    return reject(err_code)
                }
                var custQuery = `select  b.product_name, a.qty_ordered,DATE_FORMAT(exp_del_date,'%Y-%m-%d') as exp_del_date, remarks,c.branch_name, 
                'NA' AS 'unit_price', 'NA' AS 'amount' from PO_Detail a, Product_Master b, Branch_Master c, PO_Header d
                where a.org_id='${org_id}' and a.po_number ='${po_number}' and d.po_status="S" and a.po_number=d.po_number and a.org_id=d.org_id 
                and a.branch_id=d.branch_id and a.supplier_id=d.supplier_id and a.item_code=b.product_id  and a.del_branch_id=c.branch_id`;
                
                debug("GetPoEmailBodyData Query", custQuery);
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    return resolve(null);
                }
                else{
                    return resolve(queryres);
                }
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage: "Sorry, Internal Server Error!." };
                debug("Error in GetPoEmailBodyData:", err);
                return reject(err_code);
            }
        })
    }

    GetPoEmailFooterData(connection, org_id, po_number) {
        return new Promise(async (resolve, reject) => {
            try {
                if (connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage: "DB Connection Failed!." };
                    return reject(err_code)
                }
                var custQuery = `Select branch_name, branch_address, branch_contact_num, branch_email_id from Branch_Master where org_id='${org_id}' and branch_id in 
                ( select distinct  del_branch_id from PO_Detail a, PO_Header b where a.org_id='${org_id}' and a.po_number ='${po_number}' and b.po_status="S"
                     and a.po_number=b.po_number and a.org_id=b.org_id and a.branch_id=b.branch_id and a.supplier_id=b.supplier_id)`;
                
                debug("GetPoEmailFooterData Query", custQuery);
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    return resolve(null);
                }
                else{
                    return resolve(queryres);
                }
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage: "Sorry, Internal Server Error!." };
                debug("Error in GetPoEmailFooterData:", err);
                return reject(err_code);
            }
        })
    }
}

module.exports = {
    PoDao
}