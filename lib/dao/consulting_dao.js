const mysql = require('../../common/db_utils');
var debug = require('debug')('v2:consulting:dao');
const BaseDao = require('./base_dao');

class ConsultDao extends BaseDao {

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

    createConsultingHeader(connection, consulting_header_data) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`INSERT INTO ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Header SET ?`, consulting_header_data);
                debug('COMMIT at createBilling');
                return resolve(consulting_header_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("create Billing error :", err);
                return reject(err_code);
            }
        })
    }

    createDialysisConsulting(connection, dialysis_consult_data) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`INSERT INTO ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Dialysis_Detail SET ?`, dialysis_consult_data);
                debug('COMMIT at createBilling');
                return resolve(dialysis_consult_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("create Billing error :", err);
                return reject(err_code);
            }
        })
    }

    updateDialysisConsulting(connection, set_pat_dialysis_consult_data, get_consult) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`UPDATE ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Dialysis_Detail SET ? WHERE visit_no='${get_consult.visit_no}' AND patient_id='${get_consult.patient_id}'`, set_pat_dialysis_consult_data);
                debug('COMMIT at updateDialysisConsulting');
                return resolve(set_pat_dialysis_consult_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("updateDialysisConsulting Error :", err);
                return reject(err_code);
            }
        })
    }

    getConsultVisitMaxNumber(connection, data) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT max(visit_no) AS visit_no FROM ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Header  WHERE patient_id='${data.patient_id}'`;
                
                debug("getConsultVisitMaxNumber", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Visit NO Not Found!.', queryres);
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
                debug('getConsultVisitMaxNumber Error :', error)
                return reject(err_code);
            }
        })
    }
    
    getConsultingPrevDate(connection, patient_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Header WHERE patient_id='${patient_id}' ORDER BY visit_no DESC Limit 0,1`;
                debug("getConsultingHead", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry,Consult Data Not Available!.", developerMessage: "Sorry,Consult Data Not Available!." };
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
                debug('getConsultingHead error :', error)
                return reject(err_code);
            }
        })
    }

    getConsultingHead(connection, visit_no) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Header WHERE visit_no='${visit_no}'`;
                debug("getConsultingHead", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry,Consult Data Not Available!.", developerMessage: "Sorry,Consult Data Not Available!." };
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
                debug('getConsultingHead error :', error)
                return reject(err_code);
            }
        })
    }

    getConsultingPatientHead(connection, visit_no, patient_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Header WHERE visit_no='${visit_no}' AND patient_id='${patient_id}'`;
                debug("getConsultingPatientHead", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry,Consult Data Not Available!.", developerMessage: "Sorry,Consult Data Not Available!." };
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
                debug('getConsultingPatientHead error :', error)
                return reject(err_code);
            }
        })
    }
    
    getConsultingDialysis(connection, visit_no, patient_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Dialysis_Detail WHERE visit_no='${visit_no}' AND patient_id='${patient_id}'`;
                debug("getConsultingPatientHead", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry,Consult Data Not Available!.", developerMessage: "Sorry,Consult Data Not Available!." };
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
                debug('getConsultingPatientHead error :', error)
                return reject(err_code);
            }
        })
    }

    GetConsultingListsByBranchId(connection, branch_id, query, strPagination) {
        return new Promise(async(resolve, reject)=> {
            try{
                var custQuery;
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                if(query.filter.patient_id) {
                    custQuery = `SELECT c.*,DATE_FORMAT(c.visit_date,'%Y-%m-%d') visit_date,DATE_FORMAT(c.prev_visit_date,'%Y-%m-%d') prev_visit_date,h.attitude,h.restraint_dtl,h.concurrent_disease,h.concurrent_disease_dtl,h.lacrimation_left,h.lacrimation_right,h.blepharospasm_right,h.pain_right,h.pain_left,h.blepharospasm_left,h.photophobia_right,h.photophobia_left FROM ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Header 
                    c,${process.env.WRITE_DB_DATABASE}.patient_pet_consultant_header h WHERE c.org_id=h.org_id and c.patient_id=h.patient_id and h.branch_id=c.branch_id and h.visit_no=c.visit_no   and c.branch_id='${branch_id}' AND 
                    c.patient_id='${query.filter.patient_id}' LIMIT ${strPagination}`;
                }
                else if(query.filter.doctor_id) {
                    custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Header WHERE branch_id='${branch_id}' AND 
                    doctor_id='${query.filter.doctor_id}' LIMIT ${strPagination}`;
                }
                else{
                    custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Header WHERE branch_id='${branch_id}' LIMIT ${strPagination}`;
                }
                debug("GetConsultingListsByBranchId", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Data Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry, Consult Data Not Found!.", developerMessage: "Sorry, Consult Data Not Found!." };
                    return resolve(error_code)
                }
                else{
                    return resolve(queryres)
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('GetConsultingListsByBranchId Error :', error)
                return reject(err_code);
            }
        })
    }

    GetCountConsultingListsByBranchId(connection, branch_id, query) {
        return new Promise(async(resolve, reject)=> {
            try{
                var custQuery;
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                if(query.filter.patient_id) {
                    custQuery = `SELECT COUNT(*) as count FROM ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Header WHERE branch_id='${branch_id}' AND patient_id='${query.filter.patient_id}'`;
                }
                else if(query.filter.doctor_id) {
                    custQuery = `SELECT COUNT(*) as count FROM ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Header WHERE branch_id='${branch_id}' AND doctor_id='${query.filter.doctor_id}'`;
                }
                else{
                    custQuery = `SELECT COUNT(*) as count FROM ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Header WHERE branch_id='${branch_id}'`;
                }
                debug("GetCountConsultingListsByBranchId", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
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
                debug('GetCountConsultingListsByBranchId Error :', error)
                return reject(err_code);
            }
        })
    }

    GetConsultingListsByOrgId(connection, org_id, query, strPagination) {
        return new Promise(async(resolve, reject)=> {
            try{
                var custQuery;
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                if(query.filter.patient_id) {
                    custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Header WHERE org_id='${org_id}' AND 
                    patient_id='${query.filter.patient_id}' LIMIT ${strPagination}`;
                }
                else if(query.filter.doctor_id) {
                    custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Header WHERE org_id='${org_id}' AND 
                    doctor_id='${query.filter.doctor_id}' LIMIT ${strPagination}`;
                }
                else if(query.filter.branch_id) {
                    custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Header WHERE org_id='${org_id}' AND 
                    branch_id='${query.filter.branch_id}' LIMIT ${strPagination}`;
                }
                else{
                    custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Header WHERE org_id='${org_id}'`;
                }
                debug("GetConsultingListsByOrgId", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Data Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry, Consult Data Not Found!.", developerMessage: "Sorry, Consult Data Not Found!." };
                    return resolve(error_code)
                }
                else{
                    return resolve(queryres)
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('GetConsultingListsByOrgId Error :', error)
                return reject(err_code);
            }
        })
    }

    GetCountConsultingListsByOrgId(connection, org_id, query) {
        return new Promise(async(resolve, reject)=> {
            try{
                var custQuery;
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                if(query.filter.patient_id) {
                    custQuery = `SELECT COUNT(*) as count FROM ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Header WHERE org_id='${org_id}' AND patient_id='${query.filter.patient_id}'`;
                }
                else if(query.filter.doctor_id) {
                    custQuery = `SELECT COUNT(*) as count FROM ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Header WHERE org_id='${org_id}' AND doctor_id='${query.filter.doctor_id}'`;
                }
                else if(query.filter.branch_id) {
                    custQuery = `SELECT COUNT(*) as count FROM ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Header WHERE org_id='${org_id}' AND branch_id='${query.filter.branch_id}'`;
                }
                else{
                    custQuery = `SELECT COUNT(*) as count FROM ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Header WHERE org_id='${org_id}'`;
                }
                debug("GetCountConsultingListsByOrgId", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
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
                debug('GetCountConsultingListsByOrgId Error :', error)
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

    getDialysisConsultData(connection, visit_no, patient_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Dialysis_Detail WHERE visit_no='${visit_no}' AND patient_id='${patient_id}'`;
                debug("getConsultingHead", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    return resolve(null)
                }
                else{
                    var res = JSON.parse(JSON.stringify(queryres));
                    var response = res[0];
                    return resolve(response);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getConsultingHead error :', error)
                return reject(err_code);
            }
        })
    }

    GetPatientDailysisList(connection, patient_id, query, strPagination) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Dialysis_Detail WHERE patient_id='${patient_id}' LIMIT ${strPagination}`;
                debug("getConsultingHead", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry, Consult Dialysis Data Not Found!.", developerMessage: "Sorry, Consult Dialysis Data Not Found!." };
                    return resolve(error_code)
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getConsultingHead error :', error)
                return reject(err_code);
            }
        })
    }

    GetCountPatientDailysisList(connection, patient_id, query) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT COUNT(*) AS count FROM ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Dialysis_Detail WHERE patient_id='${patient_id}'`;
                debug("GetCountPatientDailysisList", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
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
                debug('GetCountPatientDailysisList error :', error)
                return reject(err_code);
            }
        })
    }

    getConsultingLabPatient(connection, visit_no, patient_id, test_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Lab_Detail WHERE visit_no='${visit_no}' AND 
                patient_id='${patient_id}' AND test_id='${test_id}'`;
                debug("getConsultingLabPatient", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry,Consult Data Not Available!.", developerMessage: "Sorry,Consult Data Not Available!." };
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
                debug('getConsultingLabPatient error :', error)
                return reject(err_code);
            }
        })
    }

    createLabConsulting(connection, lab_consult_data) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`INSERT INTO ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Lab_Detail SET ?`, lab_consult_data);
                debug('COMMIT at createLabConsulting');
                return resolve(lab_consult_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("createLabConsulting error :", err);
                return reject(err_code);
            }
        })
    }

    updateLabConsulting(connection, set_pat_lab_consult_data, get_consult) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`UPDATE ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Lab_Detail SET ? WHERE visit_no='${get_consult.visit_no}' 
                AND patient_id='${get_consult.patient_id}' AND test_id='${get_consult.test_id}'`, set_pat_lab_consult_data);
                debug('COMMIT at updateLabConsulting');
                return resolve(set_pat_lab_consult_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("updateLabConsulting Error :", err);
                return reject(err_code);
            }
        })
    }

    getLatestLabLists(connection, patient_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT max(visit_no) AS visit_no FROM ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Lab_Detail WHERE patient_id='${patient_id}'`;
                debug("GetPatientLabList", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    return resolve(0);
                }
                else{
                    var _response = JSON.parse(JSON.stringify(queryres));
                    var response = _response[0].visit_no;
                    return resolve(response);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('GetPatientLabList error :', error)
                return reject(err_code);
            }
        })
    }

    GetPatientLabList(connection, patient_id, query, visit_no, strPagination) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Lab_Detail WHERE patient_id='${patient_id}' AND visit_no='${visit_no}' LIMIT ${strPagination}`;
                debug("GetPatientLabList", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry, Consult Lab Data Not Found!.", developerMessage: "Sorry, Consult Lab Data Not Found!." };
                    return resolve(error_code)
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('GetPatientLabList error :', error)
                return reject(err_code);
            }
        })
    }
    // Start optholvisualacuity

    getLatestOptholvisualacuityVisitno(connection, patient_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT max(visit_no) AS visit_no FROM ${process.env.WRITE_DB_DATABASE}.Patient_Opthol_Visual_Acuity WHERE patient_id='${patient_id}'`;
                debug("GetPatientLabList", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    return resolve(0);
                }
                else{
                    var _response = JSON.parse(JSON.stringify(queryres));
                    var response = _response[0].visit_no;
                    return resolve(response);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('GetPatientLabList error :', error)
                return reject(err_code);
            }
        })
    }

    GetOptholvisualacuityList(connection, patient_id, query,  strPagination) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Patient_Opthol_Visual_Acuity WHERE patient_id='${patient_id}' ORDER BY visit_no DESC `;
                debug("GetOptholvisualacuityList", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry,GetOptholvisualacuityLista Not Found!.", developerMessage: "Sorry, GetOptholvisualacuityList Not Found!." };
                    return resolve(error_code)
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('GetOptholvisualacuityList error :', error)
                return reject(err_code);
            }
        })
    }


    // end optholvisualacuity


    //Start getoptholpgpLists
    getLatestoptholpgpVisitno(connection, patient_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT max(visit_no) AS visit_no FROM ${process.env.WRITE_DB_DATABASE}.Patient_Opthol_PGP WHERE patient_id='${patient_id}'`;
                debug("GetPatientLabList", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    return resolve(0);
                }
                else{
                    var _response = JSON.parse(JSON.stringify(queryres));
                    var response = _response[0].visit_no;
                    return resolve(response);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('GetPatientLabList error :', error)
                return reject(err_code);
            }
        })
    }

    GetoptholpgpList(connection, patient_id, query,strPagination) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Patient_Opthol_PGP WHERE patient_id='${patient_id}' ORDER BY visit_no DESC `;
                debug("GetoptholpgpList", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry,GetoptholpgpList Not Found!.", developerMessage: "Sorry, GetOptholvisualacuityList Not Found!." };
                    return resolve(error_code)
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('GetoptholpgpList error :', error)
                return reject(err_code);
            }
        })
    }

    //end getoptholpgpLists

    //Start optholobjrefraction
    getLatestoptholobjrefractionVisitno(connection, patient_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT max(visit_no) AS visit_no FROM ${process.env.WRITE_DB_DATABASE}.Patient_Opthol_obj_refraction WHERE patient_id='${patient_id}'`;
                debug("GetPatientLabList", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    return resolve(0);
                }
                else{
                    var _response = JSON.parse(JSON.stringify(queryres));
                    var response = _response[0].visit_no;
                    return resolve(response);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('GetPatientLabList error :', error)
                return reject(err_code);
            }
        })
    }

    GetoptholobjrefractionList(connection, patient_id, query, visit_no, strPagination) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Patient_Opthol_obj_refraction WHERE patient_id='${patient_id}' AND visit_no='${visit_no}' LIMIT ${strPagination}`;
                debug("GetOptholvisualacuityList", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry,GetOptholvisualacuityLista Not Found!.", developerMessage: "Sorry, GetOptholvisualacuityList Not Found!." };
                    return resolve(error_code)
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('GetOptholvisualacuityList error :', error)
                return reject(err_code);
            }
        })
    }
    GetoptholobjrefractionList(connection, patient_id, query,  strPagination) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Patient_Opthol_obj_refraction WHERE patient_id='${patient_id}'  ORDER BY visit_no DESC `;
                debug("GetOptholvisualacuityList", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry,GetOptholvisualacuityLista Not Found!.", developerMessage: "Sorry, GetOptholvisualacuityList Not Found!." };
                    return resolve(error_code)
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('GetOptholvisualacuityList error :', error)
                return reject(err_code);
            }
        })
    }
    //end optholobjrefraction

    //Start optholsubaccept
    getLatestoptholsubacceptVisitno(connection, patient_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT max(visit_no) AS visit_no FROM ${process.env.WRITE_DB_DATABASE}.Patient_Opthol_subj_accept WHERE patient_id='${patient_id}'`;
                debug("GetPatientLabList", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    return resolve(0);
                }
                else{
                    var _response = JSON.parse(JSON.stringify(queryres));
                    var response = _response[0].visit_no;
                    return resolve(response);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('GetPatientLabList error :', error)
                return reject(err_code);
            }
        })
    }

  


    GetoptholsubacceptList(connection, patient_id, query,  strPagination) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Patient_Opthol_subj_accept WHERE patient_id='${patient_id}'  ORDER BY visit_no DESC`;
                debug("GetoptholsubacceptList", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry,GetoptholsubacceptList Not Found!.", developerMessage: "Sorry, GetOptholvisualacuityList Not Found!." };
                    return resolve(error_code)
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('GetoptholsubacceptList error :', error)
                return reject(err_code);
            }
        })
    }



    getLatestoptholExaminationVisitno(connection, patient_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT max(visit_no) AS visit_no FROM ${process.env.WRITE_DB_DATABASE}.Patient_Opthol_examination WHERE patient_id='${patient_id}'`;
                debug("getLatestoptholExaminationVisitno", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    return resolve(0);
                }
                else{
                    var _response = JSON.parse(JSON.stringify(queryres));
                    var response = _response[0].visit_no;
                    return resolve(response);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getLatestoptholExaminationVisitno error :', error)
                return reject(err_code);
            }
        })
    }

    GetoptholExaminationList(connection, patient_id, query,  strPagination) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Patient_Opthol_examination WHERE patient_id='${patient_id}' ORDER BY visit_no DESC`;
                debug("GetOptholvisualacuityList", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry,GetOptholvisualacuityLista Not Found!.", developerMessage: "Sorry, GetOptholvisualacuityList Not Found!." };
                    return resolve(error_code)
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('GetOptholvisualacuityList error :', error)
                return reject(err_code);
            }
        })
    }


    getLatestoptholintraocularpressureVisitno(connection, patient_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT max(visit_no) AS visit_no FROM ${process.env.WRITE_DB_DATABASE}.Patient_Opthol_intra_ocular_pressure WHERE patient_id='${patient_id}'`;
                debug("getLatestoptholintraocularpressureVisitno", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    return resolve(0);
                }
                else{
                    var _response = JSON.parse(JSON.stringify(queryres));
                    var response = _response[0].visit_no;
                    return resolve(response);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getLatestoptholintraocularpressureVisitno error :', error)
                return reject(err_code);
            }
        })
    }

    GetoptholintraocularpressureList(connection, patient_id, query,  strPagination) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Patient_Opthol_intra_ocular_pressure WHERE patient_id='${patient_id}' ORDER BY visit_no DESC`;
                debug("GetoptholintraocularpressureList", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry,GetoptholintraocularpressureList Not Found!.", developerMessage: "Sorry, GetoptholExaminationList Not Found!." };
                    return resolve(error_code)
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('GetoptholintraocularpressureList error :', error)
                return reject(err_code);
            }
        })
    }

    getLatestoptholdiagadviseVisitno(connection, patient_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT max(visit_no) AS visit_no FROM ${process.env.WRITE_DB_DATABASE}.Patient_Opthol_diag_advise WHERE patient_id='${patient_id}'`;
                debug("getLatestoptholintraocularpressureVisitno", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    return resolve(0);
                }
                else{
                    var _response = JSON.parse(JSON.stringify(queryres));
                    var response = _response[0].visit_no;
                    return resolve(response);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getLatestoptholintraocularpressureVisitno error :', error)
                return reject(err_code);
            }
        })
    }

    GetoptholdiagadviseList(connection, patient_id, query,  strPagination) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Patient_Opthol_diag_advise WHERE patient_id='${patient_id}' ORDER BY visit_no DESC `;
                debug("GetoptholintraocularpressureList", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry,GetoptholintraocularpressureList Not Found!.", developerMessage: "Sorry, GetoptholExaminationList Not Found!." };
                    return resolve(error_code)
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('GetoptholintraocularpressureList error :', error)
                return reject(err_code);
            }
        })
    }

    getLatestoptholimagestorageVisitno(connection, patient_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT max(visit_no) AS visit_no FROM ${process.env.WRITE_DB_DATABASE}.Patient_Opthol_image_storage WHERE patient_id='${patient_id}'`;
                debug("getLatestoptholintraocularpressureVisitno", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    return resolve(0);
                }
                else{
                    var _response = JSON.parse(JSON.stringify(queryres));
                    var response = _response[0].visit_no;
                    return resolve(response);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getLatestoptholintraocularpressureVisitno error :', error)
                return reject(err_code);
            }
        })
    }

    GetoptholimagestorageList(connection, patient_id, query, visit_no, strPagination) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Patient_Opthol_image_storage WHERE patient_id='${patient_id}' AND visit_no='${visit_no}' LIMIT ${strPagination}`;
                debug("GetoptholintraocularpressureList", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry,GetoptholintraocularpressureList Not Found!.", developerMessage: "Sorry, GetoptholExaminationList Not Found!." };
                    return resolve(error_code)
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('GetoptholintraocularpressureList error :', error)
                return reject(err_code);
            }
        })
    }

    getLatestoptholglassprescriptionVisitno(connection, patient_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT max(visit_no) AS visit_no FROM ${process.env.WRITE_DB_DATABASE}.Patient_Opthol_glass_prescription WHERE patient_id='${patient_id}'`;
                debug("getLatestoptholintraocularpressureVisitno", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    return resolve(0);
                }
                else{
                    var _response = JSON.parse(JSON.stringify(queryres));
                    var response = _response[0].visit_no;
                    return resolve(response);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getLatestoptholintraocularpressureVisitno error :', error)
                return reject(err_code);
            }
        })
    }

    GetoptholglassprescriptionList(connection, patient_id, query,  strPagination) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Patient_Opthol_glass_prescription WHERE patient_id='${patient_id}' ORDER BY visit_no  DESC`;
                debug("GetoptholglassprescriptionList", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry,GetoptholglassprescriptionList Not Found!.", developerMessage: "Sorry, GetoptholglassprescriptionList Not Found!." };
                    return resolve(error_code)
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('GetoptholglassprescriptionList error :', error)
                return reject(err_code);
            }
        })
    }
    GetCountPatientLabList(connection, patient_id, query, visit_no) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT COUNT(*) AS count FROM ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Lab_Detail WHERE patient_id='${patient_id}' AND visit_no='${visit_no}'`;
                debug("GetCountPatientLabList", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
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
                debug('GetCountPatientLabList error :', error)
                return reject(err_code);
            }
        })
    }
    
    getConsultingHealthPatient(connection, visit_no, patient_id, khi_code) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Health_Param WHERE visit_no='${visit_no}' AND 
                patient_id='${patient_id}' AND khi_code='${khi_code}'`;
                debug("getConsultingHealthPatient", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry,Consult Data Not Available!.", developerMessage: "Sorry,Consult Data Not Available!." };
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
                debug('getConsultingPharmPatient error :', error)
                return reject(err_code);
            }
        })
    }
    
    createHealthConsulting(connection, pharm_consult_data) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`INSERT INTO ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Health_Param SET ?`, pharm_consult_data);
                debug('COMMIT at createLabConsulting');
                return resolve(pharm_consult_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("createLabConsulting error :", err);
                return reject(err_code);
            }
        })
    }

    updateHealthConsulting(connection, set_pat_pharm_consult_data, get_consult) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`UPDATE ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Health_Param SET ? WHERE visit_no='${get_consult.visit_no}' 
                AND patient_id='${get_consult.patient_id}' AND khi_code='${get_consult.khi_code}'`, set_pat_pharm_consult_data);
                debug('COMMIT at updateLabConsulting');
                return resolve(set_pat_pharm_consult_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("updateLabConsulting Error :", err);
                return reject(err_code);
            }
        })
    }

    getConsultingPharmPatient(connection, visit_no, patient_id, medicine_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Pharma_Detail WHERE visit_no='${visit_no}' AND 
                patient_id='${patient_id}' AND medicine_id='${medicine_id}'`;
                debug("getConsultingPharmPatient", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry,Consult Data Not Available!.", developerMessage: "Sorry,Consult Data Not Available!." };
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
                debug('getConsultingPharmPatient error :', error)
                return reject(err_code);
            }
        })
    }

    createPharmConsulting(connection, pharm_consult_data) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`INSERT INTO ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Pharma_Detail SET ?`, pharm_consult_data);
                debug('COMMIT at createLabConsulting');
                return resolve(pharm_consult_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("createLabConsulting error :", err);
                return reject(err_code);
            }
        })
    }

    createPharmConsultingPush(connection, pharm_consult_push) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`INSERT INTO ${process.env.WRITE_DB_DATABASE}.consultancy_billing_push SET ?`, pharm_consult_push);
                debug('COMMIT at createPharmConsultingPush');
                return resolve(pharm_consult_push);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("createPharmConsultingPush error :", err);
                return reject(err_code);
            }
        })
    }

    updatePharmConsulting(connection, set_pat_pharm_consult_data, get_consult) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`UPDATE ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Pharma_Detail SET ? WHERE visit_no='${get_consult.visit_no}' 
                AND patient_id='${get_consult.patient_id}' AND medicine_id='${get_consult.medicine_id}'`, set_pat_pharm_consult_data);
                debug('COMMIT at updateLabConsulting');
                return resolve(set_pat_pharm_consult_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("updateLabConsulting Error :", err);
                return reject(err_code);
            }
        })
    }

    
// New 

    getCreatePatientOptholVisualAcuity(connection, org_id, branch_id, visit_no, patient_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Patient_Opthol_Visual_Acuity WHERE visit_no='${visit_no}' AND 
                patient_id='${patient_id}' AND org_id='${org_id}' AND branch_id='${branch_id}'`;
                debug("getCreatePatientOptholVisualAcuity", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
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
                debug('getCreatePatientOptholVisualAcuity error :', error)
                return reject(err_code);
            }
        })
    }

    createPatientOptholVisualAcuity(connection, opthol_consult_data) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`INSERT INTO ${process.env.WRITE_DB_DATABASE}.Patient_Opthol_Visual_Acuity SET ?`, opthol_consult_data);
                debug('COMMIT at createPatientOptholVisualAcuity');
                return resolve(opthol_consult_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("createePatientOptholVisualAcuity error :", err);
                return reject(err_code);
            }
        })
    }

    updatePatientOptholVisualAcuity(connection, opthol_consult_data, data) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`UPDATE ${process.env.WRITE_DB_DATABASE}.Patient_Opthol_Visual_Acuity SET ? WHERE visit_no='${data.visit_no}' 
                AND patient_id='${data.patient_id}' AND org_id='${data.org_id}' AND branch_id='${data.branch_id}'`, opthol_consult_data);
                debug('COMMIT at updatePatientOptholVisualAcuity');
                return resolve(opthol_consult_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("updatePatientOptholVisualAcuity Error :", err);
                return reject(err_code);
            }
        })
    }

    getCreatePatientOptholPGP(connection, org_id, branch_id, visit_no, patient_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Patient_Opthol_PGP WHERE visit_no='${visit_no}' AND 
                patient_id='${patient_id}' AND org_id='${org_id}' AND branch_id='${branch_id}'`;
                debug("getCreatePatientOptholPGP", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
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
                debug('getCreatePatientOptholPGP error :', error)
                return reject(err_code);
            }
        })
    }

    createPatientOptholPGP(connection, opthol_consult_data) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`INSERT INTO ${process.env.WRITE_DB_DATABASE}.Patient_Opthol_PGP SET ?`, opthol_consult_data);
                debug('COMMIT at createPatientOptholPGP');
                return resolve(opthol_consult_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("createPatientOptholPGP error :", err);
                return reject(err_code);
            }
        })
    }

    updatePatientOptholPGP(connection, opthol_consult_data, data) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`UPDATE ${process.env.WRITE_DB_DATABASE}.Patient_Opthol_PGP SET ? WHERE visit_no='${data.visit_no}' 
                AND patient_id='${data.patient_id}' AND org_id='${data.org_id}' AND branch_id='${data.branch_id}'`, opthol_consult_data);
                debug('COMMIT at updatePatientOptholPGP');
                return resolve(opthol_consult_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("updatePatientOptholPGP Error :", err);
                return reject(err_code);
            }
        })
    }

    getCreatePatientOptholObjrefraction(connection, org_id, branch_id, visit_no, patient_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Patient_Opthol_obj_refraction WHERE visit_no='${visit_no}' AND 
                patient_id='${patient_id}' AND org_id='${org_id}' AND branch_id='${branch_id}'`;
                debug("getCreatePatientOptholObjrefraction", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
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
                debug('getCreatePatientOptholObjrefraction error :', error)
                return reject(err_code);
            }
        })
    }

    createPatientOptholObjrefraction(connection, opthol_consult_data) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`INSERT INTO ${process.env.WRITE_DB_DATABASE}.Patient_Opthol_obj_refraction SET ?`, opthol_consult_data);
                debug('COMMIT at createPatientOptholObjrefraction');
                return resolve(opthol_consult_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("createPatientOptholObjrefraction error :", err);
                return reject(err_code);
            }
        })
    }

    updatePatientOptholObjrefraction(connection, opthol_consult_data, data) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`UPDATE ${process.env.WRITE_DB_DATABASE}.Patient_Opthol_obj_refraction SET ? WHERE visit_no='${data.visit_no}' 
                AND patient_id='${data.patient_id}' AND org_id='${data.org_id}' AND branch_id='${data.branch_id}'`, opthol_consult_data);
                debug('COMMIT at updatePatientOptholObjrefraction');
                return resolve(opthol_consult_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("updatePatientOptholObjrefraction Error :", err);
                return reject(err_code);
            }
        })
    }

    getCreatePatientOptholSubjAccept(connection, org_id, branch_id, visit_no, patient_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Patient_Opthol_subj_accept WHERE visit_no='${visit_no}' AND 
                patient_id='${patient_id}' AND org_id='${org_id}' AND branch_id='${branch_id}'`;
                debug("getCreatePatientOptholSubjAccept", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
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
                debug('getCreatePatientOptholSubjAccept error :', error)
                return reject(err_code);
            }
        })
    }

    createPatientOptholSubjAccept(connection, opthol_consult_data) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`INSERT INTO ${process.env.WRITE_DB_DATABASE}.Patient_Opthol_subj_accept SET ?`, opthol_consult_data);
                debug('COMMIT at createPatientOptholSubjAccept');
                return resolve(opthol_consult_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("createPatientOptholSubjAccept error :", err);
                return reject(err_code);
            }
        })
    }

    updatePatientOptholSubjAccept(connection, opthol_consult_data, data) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`UPDATE ${process.env.WRITE_DB_DATABASE}.Patient_Opthol_subj_accept SET ? WHERE visit_no='${data.visit_no}' 
                AND patient_id='${data.patient_id}' AND org_id='${data.org_id}' AND branch_id='${data.branch_id}'`, opthol_consult_data);
                debug('COMMIT at updatePatientOptholSubjAccept');
                return resolve(opthol_consult_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("updatePatientOptholSubjAccept Error :", err);
                return reject(err_code);
            }
        })
    }

    getPatientOptholExamination(connection, org_id, branch_id, visit_no, patient_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Patient_Opthol_examination WHERE visit_no='${visit_no}' AND 
                patient_id='${patient_id}' AND org_id='${org_id}' AND branch_id='${branch_id}'`;
                debug("getCreatePatientOptholExamination", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
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
                debug('getCreatePatientOptholExamination error :', error)
                return reject(err_code);
            }
        })
    }

    createPatientOptholExamination(connection, opthol_consult_data) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`INSERT INTO ${process.env.WRITE_DB_DATABASE}.Patient_Opthol_examination SET ?`, opthol_consult_data);
                debug('COMMIT at createPatientOptholExamination');
                return resolve(opthol_consult_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("createPatientOptholExamination error :", err);
                return reject(err_code);
            }
        })
    }

    updatePatientOptholExamination(connection, opthol_consult_data, data) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`UPDATE ${process.env.WRITE_DB_DATABASE}.Patient_Opthol_examination SET ? WHERE visit_no='${data.visit_no}' 
                AND patient_id='${data.patient_id}' AND org_id='${data.org_id}' AND branch_id='${data.branch_id}'`, opthol_consult_data);
                debug('COMMIT at updatePatientOptholExamination');
                return resolve(opthol_consult_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("updatePatientOptholExamination Error :", err);
                return reject(err_code);
            }
        })
    }

    getPatientOptholIntraocularpressure(connection, org_id, branch_id, visit_no, patient_id,seq_no) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Patient_Opthol_intra_ocular_pressure WHERE visit_no='${visit_no}' AND 
                seq_no='${seq_no}' and patient_id='${patient_id}' AND org_id='${org_id}' AND branch_id='${branch_id}'`;
                debug("getPatientOptholIntraocularpressure", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
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
                debug('createPatientOptholIntraocularpressure error :', error)
                return reject(err_code);
            }
        })
    }

    
    getPatientOptholIntraocularpressureMaxSNo(connection, org_id, branch_id, visit_no, patient_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT max(seq_no) AS seq_no  FROM ${process.env.WRITE_DB_DATABASE}.Patient_Opthol_intra_ocular_pressure WHERE visit_no='${visit_no}' AND 
                patient_id='${patient_id}' AND org_id='${org_id}' AND branch_id='${branch_id}'`;
                debug("getPatientOptholIntraocularpressure", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    return resolve(null)

                }
                else{
                    var res = JSON.parse(JSON.stringify(queryres));
                    var response = res[0];
                    return resolve(response);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('createPatientOptholIntraocularpressure error :', error)
                return reject(err_code);
            }
        })
    }

    createPatientOptholIntraocularpressure(connection, opthol_consult_data) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`INSERT INTO ${process.env.WRITE_DB_DATABASE}.Patient_Opthol_intra_ocular_pressure SET ?`, opthol_consult_data);
                debug('COMMIT at createPatientOptholIntraocularpressure');
                return resolve(opthol_consult_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("createPatientOptholIntraocularpressure error :", err);
                return reject(err_code);
            }
        })
    }

    updatePatientOptholIntraocularpressure(connection, opthol_consult_data, data) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`UPDATE ${process.env.WRITE_DB_DATABASE}.Patient_Opthol_intra_ocular_pressure SET ? WHERE visit_no='${data.visit_no}' 
                AND patient_id='${data.patient_id}' AND org_id='${data.org_id}'  AND branch_id='${data.branch_id}' AND seq_no='${data.seq_no}'`, opthol_consult_data);
                debug('COMMIT at updatePatientOptholIntraocularpressure');
                return resolve(opthol_consult_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("updatePatientOptholIntraocularpressure Error :", err);
                return reject(err_code);
            }
        })
    }

    getPatientOptholDiagadvise(connection, org_id, branch_id, visit_no, patient_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Patient_Opthol_diag_advise WHERE visit_no='${visit_no}' AND 
                patient_id='${patient_id}' AND org_id='${org_id}' AND branch_id='${branch_id}'`;
                debug("getPatientOptholDiagadvise", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
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
                debug('getPatientOptholDiagadvise error :', error)
                return reject(err_code);
            }
        })
    }

    createPatientOptholDiagadvise(connection, opthol_consult_data) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`INSERT INTO ${process.env.WRITE_DB_DATABASE}.Patient_Opthol_diag_advise SET ?`, opthol_consult_data);
                debug('COMMIT at createPatientOptholDiagadvise');
                return resolve(opthol_consult_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("createPatientOptholDiagadvise error :", err);
                return reject(err_code);
            }
        })
    }

    updatePatientOptholDiagadvise(connection, opthol_consult_data, data) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`UPDATE ${process.env.WRITE_DB_DATABASE}.Patient_Opthol_diag_advise SET ? WHERE visit_no='${data.visit_no}' 
                AND patient_id='${data.patient_id}' AND org_id='${data.org_id}' AND branch_id='${data.branch_id}'`, opthol_consult_data);
                debug('COMMIT at updatePatientOptholDiagadvise');
                return resolve(opthol_consult_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("updatePatientOptholDiagadvise Error :", err);
                return reject(err_code);
            }
        })
    }

    getPatientOptholImagestorage(connection, org_id, branch_id, visit_no, patient_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Patient_Opthol_image_storage WHERE visit_no='${visit_no}' AND 
                patient_id='${patient_id}' AND org_id='${org_id}' AND branch_id='${branch_id}'`;
                debug("getPatientOptholImagestorage", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
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
                debug('getPatientOptholImagestorage error :', error)
                return reject(err_code);
            }
        })
    }

    createPatientOptholImagestorage(connection, opthol_consult_data) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`INSERT INTO ${process.env.WRITE_DB_DATABASE}.Patient_Opthol_image_storage SET ?`, opthol_consult_data);
                debug('COMMIT at createPatientOptholImagestorage');
                return resolve(opthol_consult_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("createPatientOptholImagestorage error :", err);
                return reject(err_code);
            }
        })
    }

    updatePatientOptholImagestorage(connection, opthol_consult_data, data) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`UPDATE ${process.env.WRITE_DB_DATABASE}.Patient_Opthol_image_storage SET ? WHERE visit_no='${data.visit_no}' 
                AND patient_id='${data.patient_id}' AND org_id='${data.org_id}' AND branch_id='${data.branch_id}'`, opthol_consult_data);
                debug('COMMIT at updatePatientOptholImagestorage');
                return resolve(opthol_consult_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("updatePatientOptholImagestorage Error :", err);
                return reject(err_code);
            }
        })
    }

    getPatientOptholGlassprescription(connection, org_id, branch_id, visit_no, patient_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Patient_Opthol_glass_prescription WHERE visit_no='${visit_no}' AND 
                patient_id='${patient_id}' AND org_id='${org_id}' AND branch_id='${branch_id}'`;
                debug("getPatientOptholGlassprescription", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
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
                debug('getPatientOptholGlassprescription error :', error)
                return reject(err_code);
            }
        })
    }

    createPatientOptholGlassprescription(connection, opthol_consult_data) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`INSERT INTO ${process.env.WRITE_DB_DATABASE}.Patient_Opthol_glass_prescription SET ?`, opthol_consult_data);
                debug('COMMIT at createPatientOptholGlassprescription');
                return resolve(opthol_consult_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("createPatientOptholGlassprescription error :", err);
                return reject(err_code);
            }
        })
    }

    getUploadImage(connection, org_id, branch_id, visit_no, patient_id,dept_id,column_name_seq_no,sub_heading_seq_no,heading_seq_no) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.swastha_pet_consult_image_detail WHERE visit_no='${visit_no}' AND 
                patient_id='${patient_id}' AND org_id='${org_id}' AND branch_id='${branch_id}'  AND dept_id='${dept_id}'  AND column_name_seq_no=${column_name_seq_no} 
                AND sub_heading_seq_no=${sub_heading_seq_no} AND heading_seq_no=${heading_seq_no} `;
                debug("getUploadImage", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
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
                debug('getUploadImage error :', error)
                return reject(err_code);
            }
        })
    }

    createUploadImage(connection, upload_image_data) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`INSERT INTO ${process.env.WRITE_DB_DATABASE}.swastha_pet_consult_image_detail SET ?`, upload_image_data);
                debug('COMMIT at createUploadImage');
                return resolve(upload_image_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("createUploadImage error :", err);
                return reject(err_code);
            }
        })
    }

    updateUploadImage(connection, opthol_consult_data, data) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`UPDATE ${process.env.WRITE_DB_DATABASE}.swastha_pet_consult_image_detail SET ? WHERE visit_no='${data.visit_no}' 
                AND patient_id='${data.patient_id}' AND org_id='${data.org_id}' AND branch_id='${data.branch_id}'  AND dept_id='${data.dept_id}'  AND column_name_seq_no=${data.column_name_seq_no} 
                AND sub_heading_seq_no=${data.sub_heading_seq_no} AND heading_seq_no=${data.heading_seq_no}  `, opthol_consult_data);
                debug('COMMIT at updateUploadImage');
                return resolve(opthol_consult_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("updateUploadImage Error :", err);
                return reject(err_code);
            }
        })
    }

    updatePatientOptholGlassprescription(connection, opthol_consult_data, data) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`UPDATE ${process.env.WRITE_DB_DATABASE}.Patient_Opthol_glass_prescription SET ? WHERE visit_no='${data.visit_no}' 
                AND patient_id='${data.patient_id}' AND org_id='${data.org_id}' AND branch_id='${data.branch_id}'`, opthol_consult_data);
                debug('COMMIT at updatePatientOptholGlassprescription');
                return resolve(opthol_consult_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("updatePatientOptholGlassprescription Error :", err);
                return reject(err_code);
            }
        })
    }
    
    // End New

    getLatestPharmLists(connection, patient_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT max(visit_no) AS visit_no FROM ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Pharma_Detail WHERE patient_id='${patient_id}'`;
                debug("getLatestPharmLists", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    return resolve(0);
                }
                else{
                    var _response = JSON.parse(JSON.stringify(queryres));
                    var response = _response[0].visit_no;
                    return resolve(response);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getLatestPharmLists error :', error)
                return reject(err_code);
            }
        })
    }

    GetPatientPharmList(connection, patient_id, query, visit_no, strPagination) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Pharma_Detail WHERE patient_id='${patient_id}' AND visit_no='${visit_no}' LIMIT ${strPagination}`;
                debug("GetPatientPharmList", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry, Consult Pharm Data Not Found!.", developerMessage: "Sorry, Consult Pharm Data Not Found!." };
                    return resolve(error_code)
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('GetPatientPharmList error :', error)
                return reject(err_code);
            }
        })
    }

    GetCountPatientPharmList(connection, patient_id, query, visit_no) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT COUNT(*) AS count FROM ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Pharma_Detail WHERE patient_id='${patient_id}' AND visit_no='${visit_no}'`;
                debug("GetCountPatientPharmList", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
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
                debug('GetCountPatientPharmList error :', error)
                return reject(err_code);
            }
        })
    }

    getLatestHealthLists(connection, patient_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT max(visit_no) AS visit_no FROM ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Health_Param WHERE patient_id='${patient_id}'`;
                debug("getLatestHealthLists", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    return resolve(0);
                }
                else{
                    var _response = JSON.parse(JSON.stringify(queryres));
                    var response = _response[0].visit_no;
                    return resolve(response);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getLatestHealthLists error :', error)
                return reject(err_code);
            }
        })
    }

    GetPatientHealthList(connection, patient_id, query, visit_no, strPagination) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Health_Param WHERE patient_id='${patient_id}' AND visit_no='${visit_no}' LIMIT ${strPagination}`;
                debug("GetPatientHealthList", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry, Consult Health Data Not Found!.", developerMessage: "Sorry, Consult Health Data Not Found!." };
                    return resolve(error_code)
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('GetPatientHealthList error :', error)
                return reject(err_code);
            }
        })
    }

    GetCountPatientHealthList(connection, patient_id, query, visit_no) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT COUNT(*) AS count FROM ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Health_Param WHERE patient_id='${patient_id}' AND visit_no='${visit_no}'`;
                debug("GetCountPatientHealthList", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
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
                debug('GetCountPatientHealthList error :', error)
                return reject(err_code);
            }
        })
    }
   
    GetPetDiagnosisList(connection, org_id, branch_id, patient_id, query) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.swastha_pet_diagnosis WHERE  org_id='${org_id}' AND branch_id='${branch_id}' AND patient_id='${patient_id}' ORDER BY visit_no DESC `;
                debug("GetPetDiagnosisList", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry, Consult Pharm Data Not Found!.", developerMessage: "Sorry, Consult Pharm Data Not Found!." };
                    return resolve(error_code)
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('GetPetDiagnosisList error :', error)
                return reject(err_code);
            }
        })
    }

    GetPetTreatmentList(connection,org_id, branch_id, patient_id, query)  {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.swastha_pet_treatment WHERE  org_id='${org_id}' AND branch_id='${branch_id}' AND patient_id='${patient_id}' ORDER BY visit_no DESC `;
                debug("GetPetTreatmentList", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry, Consult Pharm Data Not Found!.", developerMessage: "Sorry, Consult Pharm Data Not Found!." };
                    return resolve(error_code)
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('GetPetTreatmentList error :', error)
                return reject(err_code);
            }
        })
    }


    GetPatientPharmaList(connection, patient_id, query, strPagination) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Pharma_Detail WHERE patient_id='${patient_id}' ORDER BY visit_no DESC LIMIT ${strPagination}`;
                debug("GetPatientPharmaList", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry, Consult Pharm Data Not Found!.", developerMessage: "Sorry, Consult Pharm Data Not Found!." };
                    return resolve(error_code)
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('GetPatientPharmaList error :', error)
                return reject(err_code);
            }
        })
    }

    allvisithealthparamInformation(connection,org_id, branch_id,  patient_id, query) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `Select a.visit_no,a.khi_code,a.khi_value,a.khi_notes,DATE_FORMAT(b.visit_date,'%Y-%m-%d') visit_date from ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Health_Param a, 
                ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Header b 
                where a.org_id=b.org_id and a.branch_id=b.branch_id and a.patient_id=b.patient_id and a.visit_no =b.visit_no  and a.org_id='${org_id}' and a.branch_id='${branch_id}' 
                and a.patient_id='${patient_id}'  order by a.visit_no desc`;
                debug("allvisithealthparamInformation", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry, Consult Pharm Data Not Found!.", developerMessage: "Sorry, Consult Pharm Data Not Found!." };
                    return resolve(error_code)
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('allvisithealthparamInformation error :', error)
                return reject(err_code);
            }
        })
    }
    allvisitlabInformation(connection, org_id, branch_id, patient_id, query) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `Select a.visit_no, c.product_name, DATE_FORMAT(a.test_date,'%Y-%m-%d') test_date,a.remarks,DATE_FORMAT(a.prescription_date,'%Y-%m-%d') prescription_date,a.test_notes,DATE_FORMAT(b.visit_date,'%Y-%m-%d') visit_date from ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Lab_Detail a, 
                ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Header b , ${process.env.WRITE_DB_DATABASE}.Product_Master c 
                where a.org_id=b.org_id and a.branch_id=b.branch_id and a.patient_id=b.patient_id and a.visit_no =b.visit_no
                and a.patient_id='${patient_id}'   
                and a.org_id=c.org_id and a.test_id=c.product_id  and a.org_id='${org_id}' and a.branch_id='${branch_id}' 
                order by  a.visit_no desc`;
                debug("allvisitlabInformation", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry, Consult Pharm Data Not Found!.", developerMessage: "Sorry, Consult Pharm Data Not Found!." };
                    return resolve(error_code)
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('allvisitlabInformation error :', error)
                return reject(err_code);
            }
        })
    }

 
    

    GetCountPatientPharmaList(connection, patient_id, query) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT COUNT(*) AS count FROM ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Pharma_Detail WHERE patient_id='${patient_id}' ORDER BY visit_no DESC`;
                debug("GetCountPatientPharmaList", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
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
                debug('GetCountPatientPharmaList error :', error)
                return reject(err_code);
            }
        })
    }



    petconsultmetadatabysubheading(connection, org_id, branch_id, patient_id,visit_no,heading,sub_heading, query) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
              
                var custQuery = `Select * from  ${process.env.WRITE_DB_DATABASE}.swastha_doctor_pet_consult_metadata a
                where   a.heading='${heading}' and a.sub_heading='${sub_heading}'   order by column_name_seq_no`;
                debug("allvisitlabInformation", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry, Cpetconsultdetail Not Found!.", developerMessage: "Sorry,petconsultdetail Not Found!." };
                    return resolve(error_code)
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('allvisitlabInformation error :', error)
                return reject(err_code);
            }
        })
    }
  

    petconsultmetadatabyheading(connection, org_id, branch_id, patient_id,visit_no,heading, query) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = "";
              if(visit_no ==0){
                 custQuery = `Select distinct(sub_heading) as sub_heading,sub_heading_seq_no from  ${process.env.WRITE_DB_DATABASE}.swastha_doctor_pet_consult_metadata 
                where   heading='${heading}' order by sub_heading_seq_no `;

              }else{
                custQuery = `Select distinct(sub_heading) as sub_heading from  ${process.env.WRITE_DB_DATABASE}.swastha_pet_consult_detail 
                where   heading='${heading}' `;

              }
              
                debug("allvisitlabInformation", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry, Cpetconsultdetail Not Found!.", developerMessage: "Sorry,petconsultdetail Not Found!." };
                    return resolve(error_code)
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('allvisitlabInformation error :', error)
                return reject(err_code);
            }
        })
    }


    getpetlist(connection, org_id, branch_id, patient_id,heading, query){
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
             
                var custQuery = "";
            
                custQuery = ` Select a.org_id,a.branch_id,a.patient_id,a.dept_id,a.visit_no, a.heading from ${process.env.WRITE_DB_DATABASE}.swastha_pet_consult_detail a 
                where    a.heading='${heading}'  and a.org_id='${org_id}' and a.branch_id='${branch_id}' and a.patient_id='${patient_id}' group by a.org_id,a.branch_id,a.patient_id,a.dept_id,a.visit_no, a.heading  order by a.visit_no desc`;
               
              
              
                debug("getpetlist", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry, Consult record Not Found!.", developerMessage: "Sorry,petconsultdetail Not Found!." };
                    return resolve(error_code)
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('allvisitlabInformation error :', error)
                return reject(err_code);
            }
        })
    }
    
  
    petconsultmetadatabyheading(connection, org_id, branch_id, patient_id,visit_no,heading, query) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
              
                var custQuery = `Select distinct(sub_heading) as sub_heading,sub_heading_seq_no from  ${process.env.WRITE_DB_DATABASE}.swastha_doctor_pet_consult_metadata 
                where   heading='${heading}' order by sub_heading_seq_no  `;
                debug("allvisitlabInformation", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry, Cpetconsultdetail Not Found!.", developerMessage: "Sorry,petconsultdetail Not Found!." };
                    return resolve(error_code)
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('allvisitlabInformation error :', error)
                return reject(err_code);
            }
        })
    }
    gePetHeaderCount(connection, org_id, branch_id, patient_id,visit_no,heading) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT COUNT(*) AS count FROM ${process.env.WRITE_DB_DATABASE}.swastha_pet_consult_detail a WHERE  a.heading='${heading}' and a.visit_no='${visit_no}' and a.org_id='${org_id}' and a.branch_id='${branch_id}' and a.patient_id='${patient_id}'`;
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


    getBasePath(connection, org_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Organization_Master WHERE org_id='${org_id}'`;
                debug("getBasePath", custQuery)
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
                debug('getBasePath error :', error)
                return reject(err_code);
            }
        })
    }

    petconsultdetail(connection, org_id, branch_id, patient_id,visit_no,heading,sub_heading, query) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
              
                var custQuery = `Select a.*, b.image_re_path, b.image_le_path from   ${process.env.WRITE_DB_DATABASE}.swastha_pet_consult_detail a left join ${process.env.WRITE_DB_DATABASE}.swastha_pet_consult_image_detail b
                on a.org_id=b.org_id and a.branch_id=b.branch_id and a.patient_id=b.patient_id 
                and a.visit_no=b.visit_no and a.heading_seq_no=b.heading_seq_no and a.sub_heading_seq_no =b.sub_heading_seq_no
                and a.column_name_seq_no=b.column_name_seq_no
                where   a.heading='${heading}' and a.visit_no='${visit_no}' and a.org_id='${org_id}' and a.branch_id='${branch_id}' and a.patient_id='${patient_id}'   and a.sub_heading='${sub_heading}'   order by column_name_seq_no`;
                debug("petconsultdetail", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    var empty_array = [];
                   
                   // debug('Sorry, Consult Not Found!.', queryres);
                    //var error_code = { status: 404, code: 4001, message: "Sorry, petconsultdetail Not Found!.", developerMessage: "Sorry,petconsultdetail Not Found!." };
                    return resolve(empty_array)
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('allvisitlabInformation error :', error)
                return reject(err_code);
            }
        })
    }


    petconsultdetailcheck(connection, org_id, branch_id, patient_id,visit_no,heading, dept_id,sub_heading,column_name_seq_no, query) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
              
                var custQuery = `Select * from  ${process.env.WRITE_DB_DATABASE}.swastha_pet_consult_detail a where   a.heading='${heading}' and a.visit_no='${visit_no}' 
                and a.org_id='${org_id}' and a.branch_id='${branch_id}' and a.patient_id='${patient_id}' and a.dept_id='${dept_id}' and a.sub_heading='${sub_heading}' and a.column_name_seq_no='${column_name_seq_no}'    `;
                debug("allvisitlabInformation", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry, Cpetconsultdetail Not Found!.", developerMessage: "Sorry,petconsultdetail Not Found!." };
                    return resolve(error_code)
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('allvisitlabInformation error :', error)
                return reject(err_code);
            }
        })
    }
    createPetconsultdetail(connection, set_pet_detail) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`INSERT INTO ${process.env.WRITE_DB_DATABASE}.swastha_pet_consult_detail SET ?`, set_pet_detail);
                debug('COMMIT at createPetconsultdetail');
                return resolve(set_pet_detail);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("createPetconsultdetail  error :", err);
                return reject(err_code);
            }
        })
    }

    updatePetconsultdetail(connection, update_pet_detail, org_id, branch_id, patient_id,visit_no,heading, dept_id,sub_heading,column_name_seq_no) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`UPDATE ${process.env.WRITE_DB_DATABASE}.swastha_pet_consult_detail a SET ? WHERE a.heading='${heading}' and a.visit_no='${visit_no}' 
                and a.org_id='${org_id}' and a.branch_id='${branch_id}' and a.patient_id='${patient_id}' and a.dept_id='${dept_id}' and a.sub_heading='${sub_heading}' and a.column_name_seq_no='${column_name_seq_no}'`, update_pet_detail);
                
                debug('COMMIT at updatePetconsultdetail'+update_pet_detail);
                return resolve(update_pet_detail);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("updatePoHeader Error :", err);
                return reject(err_code);
            }
        })
    }

    getPetConsulting(connection, data, patient_consulting_data) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.patient_pet_consultant_header WHERE org_id='${data.org_id}' AND branch_id='${data.branch_id}'
                AND visit_no='${patient_consulting_data.visit_no}' AND patient_id='${patient_consulting_data.patient_id}'`;
                debug("getPetConsulting", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry,Consult Data Not Available!.", developerMessage: "Sorry,Consult Data Not Available!." };
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
                debug('getPetConsulting error :', error)
                return reject(err_code);
            }
        })
    }

    createPetConsultingHeader(connection, pet_consulting_header_data) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`INSERT INTO ${process.env.WRITE_DB_DATABASE}.patient_pet_consultant_header SET ?`, pet_consulting_header_data);
                debug('COMMIT at createConsultingHeader');
                return resolve(pet_consulting_header_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("createConsultingHeader error :", err);
                return reject(err_code);
            }
        })
    }

    updatePetConsultingHeader(connection, opthol_pet_consult_data, data) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`UPDATE ${process.env.WRITE_DB_DATABASE}.patient_pet_consultant_header SET ? WHERE org_id='${data.org_id}' AND branch_id='${data.branch_id}'
                AND visit_no='${data.visit_no}' AND patient_id='${data.patient_id}'`, opthol_pet_consult_data);
                debug('COMMIT at updatePetConsultingHeader');
                return resolve(opthol_pet_consult_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("updatePetConsultingHeader Error :", err);
                return reject(err_code);
            }
        })
    }

    petDiagnosisdetailcheck(connection, org_id, branch_id, patient_id,visit_no, dept_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
              
                var custQuery = `select * from  ${process.env.WRITE_DB_DATABASE}.swastha_pet_diagnosis a where a.visit_no='${visit_no}' 
                and a.org_id='${org_id}' and a.branch_id='${branch_id}' and a.patient_id='${patient_id}' and a.dept_id='${dept_id}'`;
                debug("petDiagnosisdetailcheck", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry, Data Not Found!.", developerMessage: "Sorry,Data Not Found!." };
                    return resolve(error_code)
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('petDiagnosisdetailcheck error :', error)
                return reject(err_code);
            }
        })
    }

    createPetDiagnosis(connection, opthol_pet_diagnosis_data) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`INSERT INTO ${process.env.WRITE_DB_DATABASE}.swastha_pet_diagnosis SET ?`, opthol_pet_diagnosis_data);
                debug('COMMIT at createPetDiagnosis');
                return resolve(opthol_pet_diagnosis_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("createPetDiagnosis error :", err);
                return reject(err_code);
            }
        })
    }

    updatePetDiagnosis(connection, opthol_pet_diagnosis_data, data) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`UPDATE ${process.env.WRITE_DB_DATABASE}.swastha_pet_diagnosis SET ? WHERE org_id='${data.org_id}' AND branch_id='${data.branch_id}'
                AND visit_no='${data.visit_no}' AND patient_id='${data.patient_id}' and dept_id='${data.dept_id}'`, opthol_pet_diagnosis_data);
                debug('COMMIT at updatePetDiagnosis');
                return resolve(opthol_pet_diagnosis_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("updatePetDiagnosis Error :", err);
                return reject(err_code);
            }
        })
    }

    petTreatmentdetailcheck(connection, org_id, branch_id, patient_id,visit_no, dept_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
              
                var custQuery = `select * from  ${process.env.WRITE_DB_DATABASE}.swastha_pet_treatment a where a.visit_no='${visit_no}' 
                and a.org_id='${org_id}' and a.branch_id='${branch_id}' and a.patient_id='${patient_id}' and a.dept_id='${dept_id}'`;
                debug("petTreatmentdetailcheck", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry, Data Not Found!.", developerMessage: "Sorry,Data Not Found!." };
                    return resolve(error_code)
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('petTreatmentdetailcheck error :', error)
                return reject(err_code);
            }
        })
    }

    createPetTreatment(connection, opthol_pet_treatment_data) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`INSERT INTO ${process.env.WRITE_DB_DATABASE}.swastha_pet_treatment SET ?`, opthol_pet_treatment_data);
                debug('COMMIT at createPetTreatment');
                return resolve(opthol_pet_treatment_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("createPetTreatment error :", err);
                return reject(err_code);
            }
        })
    }

    updatePetTreatment(connection, opthol_pet_treatment_data, data) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`UPDATE ${process.env.WRITE_DB_DATABASE}.swastha_pet_treatment SET ? WHERE org_id='${data.org_id}' AND branch_id='${data.branch_id}'
                AND visit_no='${data.visit_no}' AND patient_id='${data.patient_id}' and dept_id='${data.dept_id}'`, opthol_pet_treatment_data);
                debug('COMMIT at updatePetTreatment');
                return resolve(opthol_pet_treatment_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("updatePetTreatment Error :", err);
                return reject(err_code);
            }
        })
    }
}

module.exports = {
    ConsultDao
}