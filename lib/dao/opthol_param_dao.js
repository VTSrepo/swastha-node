const BaseDao = require("./base_dao");
var debug = require('debug')('v2:opthol:dao');

class OptholParamDao extends BaseDao {
    getOptholParamDetailData(connection, data) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Swastha_Opthol_Visit_Detail WHERE visit_no='${data.visit_no}' 
                AND org_id='${data.org_id}' AND branch_id='${data.branch_id}' AND patient_id='${data.patient_id}' AND 
                param_code='${data.param_code}'`;
                debug("getOptholParamDetailData", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry,getOptholParamDetailData!.', queryres);
                    return resolve(null)
                }
                else{
                    var res = JSON.parse(JSON.stringify(queryres))
                    var response = res[0];
                    return resolve(response)
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getOptholParamDetailData Error :', error)
                return reject(err_code);
            }
        })
    }

/*     getOpotholParamVisitNo(connection,branch_id, seq_type) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }

                var custQuery = `SELECT concat(concat(seq_type,branch_id),LPAD(last_seq_no+1,10,'0')) as visit_no ,last_seq_no+1 as last_seq_no 
                FROM ${process.env.WRITE_DB_DATABASE}.Swastha_Seq_Generator WHERE branch_id='${branch_id}' AND seq_type='${seq_type}'`;
                debug("getOpotholParamVisitNo", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug("Firtst time");
                    var new_opthol_param_data = {
                        seq_type: seq_type,
                        branch_id: branch_id,
                        last_seq_no: 0,
                        branch_pad: 'Y'
                    }
                    await connection.query(`INSERT INTO ${process.env.WRITE_DB_DATABASE}.Swastha_Seq_Generator SET ?`, new_opthol_param_data);

                    var newpatientquery = `SELECT concat(concat(seq_type,branch_id),LPAD(0,10,'0')) as visit_no ,last_seq_no as last_seq_no 
                    FROM ${process.env.WRITE_DB_DATABASE}.Swastha_Seq_Generator WHERE branch_id='${branch_id}' AND seq_type='${seq_type}'`;

                    debug("getOpotholParamVisitNo", newpatientquery)
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
                debug('getOpotholParamVisitNo error :', error)
                return reject(err_code);
            }
        })
    } */

    getOpotholParamVisitNo(connection, data, seq_type, db_name) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT max(visit_no) AS visit_no FROM ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Header WHERE org_id='${data.org_id}' 
                AND branch_id='${data.branch_id}' AND patient_id='${data.patient_id}'`;
                
                debug("getOpotholParamVisitNo", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Data Not Found!.', queryres);
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
                debug('getOpotholParamVisitNo Error :', error)
                return reject(err_code);
            }
        })
    }

    createOptholParamData(connection, set_opthol_data, db_name) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`INSERT INTO ${process.env.WRITE_DB_DATABASE}.${db_name} SET ?`, set_opthol_data);
                debug('COMMIT at createOptholParamData', set_opthol_data);
                return resolve(set_opthol_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("createOptholParamData error :", err);
                return reject(err_code);
            }
        })
    }

    updateOptholParamData(connection, update_opthol_param_data, data) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`UPDATE ${process.env.WRITE_DB_DATABASE}.Swastha_Opthol_Visit_Detail SET ? WHERE visit_no='${data.visit_no}' 
                AND org_id='${data.org_id}' AND branch_id='${data.branch_id}' AND patient_id='${data.patient_id}' AND 
                param_code='${data.param_code}'`, update_opthol_param_data);
               
                return resolve(update_opthol_param_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("updateOptholParamData Error :", err);
                return reject(err_code);
            }
        })
    }

    getOptholParamDetail(connection, org_id, branch_id, query, db_name) {
        return new Promise(async(resolve, reject)=> {
            try{
                var custQuery;
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                if(query.filter.visit_no && query.filter.patient_id) {
                    custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.${db_name} WHERE org_id='${org_id}' 
                    AND branch_id='${branch_id}' AND visit_no='${query.filter.visit_no}' AND patient_id='${query.filter.patient_id}' ORDER BY visit_no DESC`;
                }
                else if(query.filter.patient_id) {
                    custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.${db_name} WHERE org_id='${org_id}' 
                    AND branch_id='${branch_id}' AND patient_id='${query.filter.patient_id}' ORDER BY visit_no DESC`;
                }
                else if(query.filter.visit_no) {
                    custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.${db_name} WHERE org_id='${org_id}' 
                AND branch_id='${branch_id}' AND visit_no='${query.filter.visit_no}' ORDER BY visit_no DESC`;
                }
                else{
                    custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.${db_name} WHERE org_id='${org_id}' AND branch_id='${branch_id}' ORDER BY visit_no DESC`;
                }
                debug("getOptholParamDetailData", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry,getOptholParamDetailData!.', queryres);
                    var errcode = { status: 404, code: 4001, message: "Sorry, Data Not Available!.", developerMessage:"Sorry, Data Not Available!." };
                    return resolve(errcode)
                }
                else{
                    debug("Opthol param detail", queryres);
                    return resolve(queryres)
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getOptholParamDetailData Error :', error)
                return reject(err_code);
            }
        })
    }

    getOptholSlitlampData(connection, data) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Swastha_Slit_Lamp_Exam_Visit_Detail WHERE visit_no='${data.visit_no}' 
                AND org_id='${data.org_id}' AND branch_id='${data.branch_id}' AND patient_id='${data.patient_id}'`;
                debug("getOptholSlitlampData", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry,getOptholSlitlampData!.', queryres);
                    return resolve(null)
                }
                else{
                    var res = JSON.parse(JSON.stringify(queryres))
                    var response = res[0];
                    return resolve(response)
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getOptholSlitlampData Error :', error)
                return reject(err_code);
            }
        })
    }

    updateOptholSlitlampData(connection, update_opthol_param_data, data) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`UPDATE ${process.env.WRITE_DB_DATABASE}.Swastha_Slit_Lamp_Exam_Visit_Detail SET ? WHERE visit_no='${data.visit_no}' 
                AND org_id='${data.org_id}' AND branch_id='${data.branch_id}' AND patient_id='${data.patient_id}'`, update_opthol_param_data);
               
                return resolve(update_opthol_param_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("updateOptholSlitlampData Error :", err);
                return reject(err_code);
            }
        })
    }
}

module.exports = {
    OptholParamDao
}