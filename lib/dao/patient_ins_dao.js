const mysql = require('../../common/db_utils');
var debug = require('debug')('v2:patientins:dao');
const BaseDao = require('./base_dao');

class PatientInsDao extends BaseDao {

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

    getPatientInsHeader(connection, data) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Patient_Ins_Input_Hdr WHERE org_id='${data.org_id}' AND branch_id='${data.branch_id}' AND patient_id='${data.patient_id}'`;
                debug("getPatientInsHeader", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Data Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry,Data Data Not Available!.", developerMessage: "Sorry,Data Data Not Available!." };
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
                debug('getPatientInsHeader error :', error)
                return reject(err_code);
            }
        })
    }

    createPatientInsHeader(connection, lab_consult_data) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`INSERT INTO ${process.env.WRITE_DB_DATABASE}.Patient_Ins_Input_Hdr SET ?`, lab_consult_data);
                debug('COMMIT at createPatientInsHeader');
                return resolve(lab_consult_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("createPatientInsHeader error :", err);
                return reject(err_code);
            }
        })
    }

    updatePatientInsHeader(connection, set_pat_ins_header_data, get_patient_ins) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`UPDATE ${process.env.WRITE_DB_DATABASE}.Patient_Ins_Input_Hdr SET ? WHERE org_id='${get_patient_ins.org_id}' AND branch_id='${get_patient_ins.branch_id}' AND patient_id='${get_patient_ins.patient_id}'`, set_pat_ins_header_data);
                debug('COMMIT at updatePatientInsHeader');
                return resolve(set_pat_ins_header_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("updatePatientInsHeader Error :", err);
                return reject(err_code);
            }
        })
    }

    getPatientInsDetail(connection, data,pat_ins_detail) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT *, DATE_FORMAT(dialysis_date,'%Y-%m-%d') AS dialysis_date, DATE_FORMAT(invoice_date,'%Y-%m-%d') AS invoice_date,
                DATE_FORMAT(hd_start_time,'%Y-%m-%d') AS hd_start_time, DATE_FORMAT(hd_end_time,'%Y-%m-%d') AS hd_end_time  FROM ${process.env.WRITE_DB_DATABASE}.Patient_Ins_Input_Det WHERE org_id='${data.org_id}' AND branch_id='${data.branch_id}' AND patient_id='${data.patient_id}' AND invoice_num='${pat_ins_detail.invoice_num}'`;
                debug("getPatientInsDetail", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Data Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry,Data Data Not Available!.", developerMessage: "Sorry,Data Data Not Available!." };
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
                debug('getPatientInsDetail error :', error)
                return reject(err_code);
            }
        })
    }

    createPatientInsDetail(connection, lab_consult_data) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`INSERT INTO ${process.env.WRITE_DB_DATABASE}.Patient_Ins_Input_Det SET ?`, lab_consult_data);
                debug('COMMIT at createPatientInsDetail');
                return resolve(lab_consult_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("createPatientInsDetail error :", err);
                return reject(err_code);
            }
        })
    }

    updatePatientInsDetail(connection, set_pat_ins_header_data, get_patient_ins,invoice_num) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`UPDATE ${process.env.WRITE_DB_DATABASE}.Patient_Ins_Input_Det SET ? WHERE org_id='${get_patient_ins.org_id}' AND branch_id='${get_patient_ins.branch_id}' AND patient_id='${get_patient_ins.patient_id}' AND  invoice_num='${get_patient_ins.invoice_num}'`, set_pat_ins_header_data);
                debug('COMMIT at updatePatientInsDetail');
                return resolve(set_pat_ins_header_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("updatePatientInsDetail Error :", err);
                return reject(err_code);
            }
        })
    }

    getPatientInsHeaderList(connection, query, strPagination) {
        return new Promise(async(resolve, reject)=> {
            try{
                var custQuery;
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                if(query.filter.patient_id) {
                    custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Patient_Ins_Input_Hdr WHERE patient_id='${query.filter.patient_id}' LIMIT ${strPagination}`;
                }
                else if(query.filter.org_id && query.filter.branch_id) {
                    custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Patient_Ins_Input_Hdr WHERE org_id='${query.filter.org_id}' AND branch_id='${query.filter.branch_id}' LIMIT ${strPagination}`;
                }
                else if(query.filter.org_id) {
                    custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Patient_Ins_Input_Hdr WHERE org_id='${query.filter.org_id}' LIMIT ${strPagination}`;
                }
                else if(query.filter.branch_id) {
                    custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Patient_Ins_Input_Hdr WHERE branch_id='${query.filter.branch_id}' LIMIT ${strPagination}`;
                }
                else{
                    custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Patient_Ins_Input_Hdr LIMIT ${strPagination}`;
                }
                debug("GetPatientLabList", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry, Data Not Found!.", developerMessage: "Sorry, Data Not Found!." };
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

    getCountPatientInsHeaderList(connection, query) {
        return new Promise(async(resolve, reject)=> {
            try{
                var custQuery;
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                if(query.filter.patient_id) {
                    custQuery = `SELECT COUNT(*) AS count FROM ${process.env.WRITE_DB_DATABASE}.Patient_Ins_Input_Hdr WHERE patient_id='${query.filter.patient_id}'`;
                }
                else if(query.filter.org_id && query.filter.branch_id) {
                    custQuery = `SELECT COUNT(*) AS count FROM ${process.env.WRITE_DB_DATABASE}.Patient_Ins_Input_Hdr WHERE org_id='${query.filter.org_id}' AND branch_id='${query.filter.branch_id}'`;
                }
                else if(query.filter.org_id) {
                    custQuery = `SELECT COUNT(*) AS count FROM ${process.env.WRITE_DB_DATABASE}.Patient_Ins_Input_Hdr WHERE org_id='${query.filter.org_id}'`;
                }
                else if(query.filter.branch_id) {
                    custQuery = `SELECT COUNT(*) AS count FROM ${process.env.WRITE_DB_DATABASE}.Patient_Ins_Input_Hdr WHERE branch_id='${query.filter.branch_id}'`;
                }
                else{
                    custQuery = `SELECT COUNT(*) AS count FROM ${process.env.WRITE_DB_DATABASE}.Patient_Ins_Input_Hdr`;
                }
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

    getPatientInsuranceReportList(connection, data, invoice_no,query) {
        return new Promise(async(resolve, reject)=> {
            try{
                var custQuery;
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
           
                    custQuery = `Select a.patient_name, a.age, a.sex, a.address, a.patient_id, e.ref_desc,
                    d.doctor_name,c.dialysis_date, b.header_remarks1,b.header_remarks2,b.footer_remarks,
                    c.hd_start_time,c.hd_end_time,c.hd_duration,c.pre_wt,c.pre_bp,c.pre_pulse,c.pre_temp,
                    c.post_wt,c.post_bp,c.post_pulse,c.post_temp,c.curr_flow,c.fluid_removal,c.complication,
                    c.drugs 
                    from  ${process.env.WRITE_DB_DATABASE}.Patient_Master a,  ${process.env.WRITE_DB_DATABASE}.Patient_Ins_Input_Hdr b,
                    ${process.env.WRITE_DB_DATABASE}.Patient_Ins_Input_Det c, 
                    ${process.env.WRITE_DB_DATABASE}.Doctor_Master d ,  ${process.env.WRITE_DB_DATABASE}.Swastha_Ref_Master e 
                    where a.org_id=b.org_id and a.branch_id=b.branch_id and a.patient_id=b.patient_id
                    and   b.org_id=c.org_id and b.branch_id=c.branch_id and b.patient_id =c.patient_id 
                    and   b.doctor_id=d.doctor_id and a.patient_type=e.ref_code and e.ref_type="PATTYP"
                    and   b.org_id='${data.org_id}' 
                    and   b.branch_id='${data.branch_id}'
                    and   b.patient_id='${data.patient_id}'
                    and   c.invoice_num in ${invoice_no}`;
              
             
                debug("getPatientInsuranceReportList", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry, Data Not Found!.", developerMessage: "Sorry, Data Not Found!." };
                    return resolve(error_code)
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getPatientInsuranceReportList error :', error)
                return reject(err_code);
            }
        })
    }    
    getPatientInsDetailList(connection, inv_month, inv_year, patient_id,query) {
        return new Promise(async(resolve, reject)=> {
            try{
                var custQuery;
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
           
                    custQuery = `SELECT *, DATE_FORMAT(dialysis_date,'%Y-%m-%d') AS dialysis_date, DATE_FORMAT(invoice_date,'%Y-%m-%d') AS invoice_date,
                    DATE_FORMAT(hd_start_time,'%Y-%m-%d %H:%m:%s') AS hd_start_time, DATE_FORMAT(hd_end_time,'%Y-%m-%d %H:%m:%s') AS hd_end_time 
                    FROM ${process.env.WRITE_DB_DATABASE}.Patient_Ins_Input_Det WHERE patient_id='${patient_id}'  and month(invoice_date)=${inv_month} and year(invoice_date)=${inv_year}`;
              
              /*  if(query.filter.patient_id) {
                    custQuery = `SELECT *, DATE_FORMAT(dialysis_date,'%Y-%m-%d') AS dialysis_date, DATE_FORMAT(invoice_date,'%Y-%m-%d') AS invoice_date,
                    DATE_FORMAT(hd_start_time,'%Y-%m-%d') AS hd_start_time, DATE_FORMAT(hd_end_time,'%Y-%m-%d') AS hd_end_time  FROM ${process.env.WRITE_DB_DATABASE}.Patient_Ins_Input_Det WHERE patient_id='${patient_id}'  and month(dialysis_date)=${inv_month} and year(dialysis_date)=${inv_year}`;
                }
                else if(query.filter.org_id && query.filter.branch_id) {
                    custQuery = `SELECT *, DATE_FORMAT(dialysis_date,'%Y-%m-%d') AS dialysis_date, DATE_FORMAT(invoice_date,'%Y-%m-%d') AS invoice_date,
                    DATE_FORMAT(hd_start_time,'%Y-%m-%d') AS hd_start_time, DATE_FORMAT(hd_end_time,'%Y-%m-%d') AS hd_end_time  FROM ${process.env.WRITE_DB_DATABASE}.Patient_Ins_Input_Det WHERE org_id='${query.filter.org_id}' AND branch_id='${query.filter.branch_id}' LIMIT ${strPagination}`;
                }
                else if(query.filter.org_id) {
                    custQuery = `SELECT *, DATE_FORMAT(dialysis_date,'%Y-%m-%d') AS dialysis_date, DATE_FORMAT(invoice_date,'%Y-%m-%d') AS invoice_date,
                    DATE_FORMAT(hd_start_time,'%Y-%m-%d') AS hd_start_time, DATE_FORMAT(hd_end_time,'%Y-%m-%d') AS hd_end_time  FROM ${process.env.WRITE_DB_DATABASE}.Patient_Ins_Input_Det WHERE org_id='${query.filter.org_id}' LIMIT ${strPagination}`;
                }
                else if(query.filter.branch_id) {
                    custQuery = `SELECT *, DATE_FORMAT(dialysis_date,'%Y-%m-%d') AS dialysis_date, DATE_FORMAT(invoice_date,'%Y-%m-%d') AS invoice_date,
                    DATE_FORMAT(hd_start_time,'%Y-%m-%d') AS hd_start_time, DATE_FORMAT(hd_end_time,'%Y-%m-%d') AS hd_end_time  FROM ${process.env.WRITE_DB_DATABASE}.Patient_Ins_Input_Det WHERE branch_id='${query.filter.branch_id}' LIMIT ${strPagination}`;
                }
                else{
                    custQuery = `SELECT *, DATE_FORMAT(dialysis_date,'%Y-%m-%d') AS dialysis_date, DATE_FORMAT(invoice_date,'%Y-%m-%d') AS invoice_date,
                    DATE_FORMAT(hd_start_time,'%Y-%m-%d') AS hd_start_time, DATE_FORMAT(hd_end_time,'%Y-%m-%d') AS hd_end_time  FROM ${process.env.WRITE_DB_DATABASE}.Patient_Ins_Input_Det LIMIT ${strPagination}`;
                }*/
                debug("GetPatientLabList", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry, Data Not Found!.", developerMessage: "Sorry, Data Not Found!." };
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

    
  getInsentrystatus(connection, inv_month, inv_year,query) {
        return new Promise(async(resolve, reject)=> {
            try{
                var custQuery;
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }

                custQuery = `select distinct ref_desc from ${process.env.WRITE_DB_DATABASE}.Patient_Ins_Input_Det a, ${process.env.WRITE_DB_DATABASE}.Patient_Master b , ${process.env.WRITE_DB_DATABASE}.Swastha_Ref_Master d
                where a.patient_id=b.patient_id and b.patient_type = d.ref_code and d.ref_type="PATTYP" and 
                month(a.invoice_date)=${inv_month} and year(a.invoice_date)=${inv_year} and b.patient_type <>"N" order by ref_desc `;
           
                debug("getInsentrystatus", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry, Data Not Found!.", developerMessage: "Sorry, Data Not Found!." };
                    return resolve(error_code)
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getInsentrystatus error :', error)
                return reject(err_code);
            }
        })
    }

    getInsentrystatusdetails(connection, inv_month, inv_year,ref_desc,query) {
        return new Promise(async(resolve, reject)=> {
            try{
                var custQuery;
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
            
                 custQuery = `select patient_id,patient_name,sum(completed) completed, sum(not_completed) not_completed from
                 ( select d.ref_desc,b.patient_type,a.patient_id,b.patient_name,
                (case when a.active_flag="Y" then 1 else 0 end ) completed,
                (case when a.active_flag is null or active_flag not in ("Y") then 1 else 0 end ) not_completed 
                 from ${process.env.WRITE_DB_DATABASE}.Patient_Ins_Input_Det a, ${process.env.WRITE_DB_DATABASE}.Patient_Master b , ${process.env.WRITE_DB_DATABASE}.Swastha_Ref_Master d
                 where a.patient_id=b.patient_id and b.patient_type = d.ref_code and d.ref_type="PATTYP" and 
                 month(a.invoice_date)=${inv_month} and year(a.invoice_date)=${inv_year} and b.patient_type <>"N" and d.ref_desc='${ref_desc}' ) c
                 group by patient_id,patient_name  order by patient_name`;
           
                debug("getInsentrystatusdetails", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry, Data Not Found!.", developerMessage: "Sorry, Data Not Found!." };
                    return resolve(error_code)
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getInsentrystatusdetails error :', error)
                return reject(err_code);
            }
        })
    }


    getCountPatientInsDetailList(connection, query) {
        return new Promise(async(resolve, reject)=> {
            try{
                var custQuery;
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                if(query.filter.dialysis_date) {
                    custQuery = `SELECT COUNT(*) AS count FROM ${process.env.WRITE_DB_DATABASE}.Patient_Ins_Input_Det WHERE dialysis_date='${query.filter.dialysis_date}'`;
                }
                if(query.filter.patient_id) {
                    custQuery = `SELECT COUNT(*) AS count FROM ${process.env.WRITE_DB_DATABASE}.Patient_Ins_Input_Det WHERE patient_id='${query.filter.patient_id}'`;
                }
                else if(query.filter.org_id && query.filter.branch_id) {
                    custQuery = `SELECT COUNT(*) AS count FROM ${process.env.WRITE_DB_DATABASE}.Patient_Ins_Input_Det WHERE org_id='${query.filter.org_id}' AND branch_id='${query.filter.branch_id}'`;
                }
                else if(query.filter.org_id) {
                    custQuery = `SELECT COUNT(*) AS count FROM ${process.env.WRITE_DB_DATABASE}.Patient_Ins_Input_Det WHERE org_id='${query.filter.org_id}'`;
                }
                else if(query.filter.branch_id) {
                    custQuery = `SELECT COUNT(*) AS count FROM ${process.env.WRITE_DB_DATABASE}.Patient_Ins_Input_Det WHERE branch_id='${query.filter.branch_id}'`;
                }
                else{
                    custQuery = `SELECT COUNT(*) AS count FROM ${process.env.WRITE_DB_DATABASE}.Patient_Ins_Input_Det`;
                }
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
}

module.exports = {
    PatientInsDao
}