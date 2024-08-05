const mysql = require('../../common/db_utils');
var debug = require('debug')('v2:patients:dao');
const BaseDao = require('./base_dao');

class PatientDao extends BaseDao {

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

    getPatientEmail(connection, email_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT *,DATE_FORMAT(dob,'%Y-%m-%d') as dob,DATE_FORMAT(first_visit_date,'%Y-%m-%d') as first_visit_date,DATE_FORMAT(last_steril_date,'%Y-%m-%d') as last_steril_date,
                DATE_FORMAT(last_vaccinated_date,'%Y-%m-%d') as last_vaccinated_date FROM ${process.env.WRITE_DB_DATABASE}.Patient_Master WHERE email_id='${email_id}'`;
                debug("getPatienEmail", custQuery)
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
                debug('getPatienEmail Error :', error)
                return reject(err_code);
            }
        })
    }

    getPatientId(connection, patient_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT *,DATE_FORMAT(dob,'%Y-%m-%d') as dob,DATE_FORMAT(first_visit_date,'%Y-%m-%d') as first_visit_date,
                DATE_FORMAT(last_steril_date,'%Y-%m-%d') as last_steril_date,DATE_FORMAT(last_vaccinated_date,'%Y-%m-%d') as last_vaccinated_date,
                (SELECT ref_desc FROM ${process.env.WRITE_DB_DATABASE}.Swastha_Ref_Master where 
                ref_type='PATTYP' AND ref_code=Patient_Master.patient_type) as patient_type_name FROM 
                ${process.env.WRITE_DB_DATABASE}.Patient_Master WHERE patient_id='${patient_id}'`;
                debug("getPatientMobile", custQuery)
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
                debug('getPatientMobile Error :', error)
                return reject(err_code);
            }
        })
    }

    getPatientMobile(connection, mobile_no) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT *,DATE_FORMAT(dob,'%Y-%m-%d') as dob,DATE_FORMAT(first_visit_date,'%Y-%m-%d') as first_visit_date,
                 DATE_FORMAT(last_steril_date,'%Y-%m-%d') as last_steril_date,DATE_FORMAT(last_vaccinated_date,'%Y-%m-%d') as last_vaccinated_date 
                 FROM ${process.env.WRITE_DB_DATABASE}.Patient_Master WHERE mobile_no='${mobile_no}'`;
                debug("getPatientMobile", custQuery)
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
                debug('getPatientMobile Error :', error)
                return reject(err_code);
            }
        })
    }

    getPatientMobileByBranchId(connection, mobile_no, branch_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT a.*,DATE_FORMAT(a.dob,'%Y-%m-%d') as dob,DATE_FORMAT(a.first_visit_date,'%Y-%m-%d') as first_visit_date,
                DATE_FORMAT(a.last_steril_date,'%Y-%m-%d') as last_steril_date,DATE_FORMAT(a.last_vaccinated_date,'%Y-%m-%d') as last_vaccinated_date ,
                b.ref_desc as patient_type_name  FROM ${process.env.WRITE_DB_DATABASE}.Patient_Master a, 
                ${process.env.WRITE_DB_DATABASE}.Swastha_Ref_Master b  WHERE a.patient_type=b.ref_code and b.ref_type="PATTYP" and  a.mobile_no='${mobile_no}' AND a.branch_id='${branch_id}'`;
                debug("getPatientMobile", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, User Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry, Patient Not Found!.", developerMessage: "Sorry, Patient Not Found!." };
                    return resolve(error_code)
                }
                else{
                    return resolve(queryres)
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getPatientMobile Error :', error)
                return reject(err_code);
            }
        })
    }

    getPatientNameByBranchId(connection, patient_name, branch_id) {
        return new Promise(async(resolve, reject)=> {
            var pat_name='%'+patient_name+'%';
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT *,DATE_FORMAT(dob,'%Y-%m-%d') as dob,DATE_FORMAT(first_visit_date,'%Y-%m-%d') as first_visit_date,DATE_FORMAT(last_steril_date,'%Y-%m-%d') as last_steril_date,
                DATE_FORMAT(last_vaccinated_date,'%Y-%m-%d') as last_vaccinated_date FROM ${process.env.WRITE_DB_DATABASE}.Patient_Master WHERE patient_name LIKE '${pat_name}' AND branch_id='${branch_id}'`;
                debug("getPatientMobile", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, User Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry, Patient Not Found!.", developerMessage: "Sorry, Patient Not Found!." };
                    return resolve(error_code)
                }
                else{
                    return resolve(queryres)
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getPatientMobile Error :', error)
                return reject(err_code);
            }
        })
    }
    
    getPatientidByBranchId(connection, patient_id, branch_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT a.* ,b.ref_desc as patient_type_name  FROM ${process.env.WRITE_DB_DATABASE}.Patient_Master a, 
                ${process.env.WRITE_DB_DATABASE}.Swastha_Ref_Master b  WHERE a.patient_type=b.ref_code and b.ref_type="PATTYP" and  patient_id='${patient_id}' AND a.branch_id='${branch_id}'`;
               
               // var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Patient_Master WHERE patient_id='${patient_id}' AND branch_id='${branch_id}'`;
                debug("getPatientidByBranchId", custQuery)
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
                debug('getPatientidByBranchId error :', error)
                return reject(err_code);
            }
        })
    }

    getPatientidByPatientId(connection, patient_id, branch_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT a.*,DATE_FORMAT(a.dob,'%Y-%m-%d') as dob,DATE_FORMAT(a.first_visit_date,'%Y-%m-%d') as first_visit_date,DATE_FORMAT(a.last_steril_date,'%Y-%m-%d') as last_steril_date,
                DATE_FORMAT(a.last_vaccinated_date,'%Y-%m-%d') as last_vaccinated_date ,b.ref_desc as patient_type_name  FROM ${process.env.WRITE_DB_DATABASE}.Patient_Master a, 
                ${process.env.WRITE_DB_DATABASE}.Swastha_Ref_Master b  WHERE a.patient_type=b.ref_code and b.ref_type="PATTYP" and  patient_id='${patient_id}' `;
               
                
              //  var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Patient_Master WHERE patient_id='${patient_id}' AND branch_id='${branch_id}'`;
                debug("getPatientid", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, User Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry, Patient Not Found!.", developerMessage: "Sorry, Patient Not Found!." };
                    return resolve(error_code)
                }
                else{
                    return resolve(queryres)
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getPatientid error :', error)
                return reject(err_code);
            }
        })
    }

    getPatientbyBranchId(connection, branch_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT a.*,DATE_FORMAT(a.dob,'%Y-%m-%d') as dob,DATE_FORMAT(a.first_visit_date,'%Y-%m-%d') as first_visit_date,DATE_FORMAT(a.last_steril_date,'%Y-%m-%d') as last_steril_date,
                DATE_FORMAT(a.last_vaccinated_date,'%Y-%m-%d') as last_vaccinated_date ,b.ref_desc as patient_type_name  FROM ${process.env.WRITE_DB_DATABASE}.Patient_Master a, 
                ${process.env.WRITE_DB_DATABASE}.Swastha_Ref_Master b  WHERE a.patient_type=b.ref_code and b.ref_type="PATTYP"  AND a.branch_id='${branch_id}'`;
               
             //   var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Patient_Master WHERE branch_id='${branch_id}'`;
                debug("getPatientbyBranchId", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, User Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry, Patient Not Found!.", developerMessage: "Sorry, Patient Not Found!." };
                    return resolve(error_code)
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getPatientbyBranchId error :', error)
                return reject(err_code);
            }
        })
    }

    getCountPatientbyBranchId(connection, branch_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT COUNT(*) as count FROM ${process.env.WRITE_DB_DATABASE}.Patient_Master WHERE branch_id='${branch_id}'`;
                debug("getCountPatientbyBranchId", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, User Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry, Patient Not Found!.", developerMessage: "Sorry, Patient Not Found!." };
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

    createPatient(connection, patient_data) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`INSERT INTO ${process.env.WRITE_DB_DATABASE}.Patient_Master SET ?`, patient_data);
                debug('COMMIT at createPatient');
                return resolve(patient_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("create Customer Error :", err);
                return reject(err_code);
            }
        })
    }

    getPatientIdByPAT(connection, branch_id, seq_type) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }

                var custQuery = `SELECT concat(concat(seq_type,branch_id),LPAD(last_seq_no+1,5,'0')) as patient_id ,last_seq_no+1 as last_seq_no 
                FROM ${process.env.WRITE_DB_DATABASE}.Swastha_Seq_Generator WHERE branch_id='${branch_id}' AND seq_type='${seq_type}'`;
                debug("getPatientIdByPAT", custQuery)
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

                    var newpatientquery = `SELECT concat(concat(seq_type,branch_id),LPAD(0,5,'0')) as patient_id ,last_seq_no as last_seq_no 
                    FROM ${process.env.WRITE_DB_DATABASE}.Swastha_Seq_Generator WHERE branch_id='${branch_id}' AND seq_type='${seq_type}'`;

                    debug("getPatientIdByPAT", newpatientquery)
                    let queryres_newpatientquery = await connection.query(newpatientquery);
                    if(queryres.length == 0) {
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

                    
                    await connection.query(`UPDATE ${process.env.WRITE_DB_DATABASE}.Swastha_Seq_Generator SET last_seq_no=${response.last_seq_no} 
                    WHERE  branch_id='${branch_id}' AND seq_type='${seq_type}'`);
                    return resolve(response);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getPatientIdByPAT error :', error)
                return reject(err_code);
            }
        })
    }

    updatePatient(connection, update_patient_data, patient_id) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`UPDATE ${process.env.WRITE_DB_DATABASE}.Patient_Master SET ? WHERE patient_id='${patient_id}'`, update_patient_data);
                debug('COMMIT at createPatient');
                return resolve(update_patient_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("create Customer Error :", err);
                return reject(err_code);
            }
        })
    }

    updateAppointByphoneno(connection, phone_no, patient_id) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`UPDATE ${process.env.WRITE_DB_DATABASE}.Patient_Appt_Details SET patient_id='${patient_id}' WHERE patient_id is null and phone_no='${phone_no}'`);
                debug('COMMIT at updateAppointByphoneno');
                return resolve(phone_no);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("updateAppointByphoneno error :", err);
                return resolve(err_code);
            }
        })
    }


    //Create Schedule

    createSchedule(connection, schedule_data) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`INSERT INTO ${process.env.WRITE_DB_DATABASE}.Swastha_Patient_Schedule SET ?`, schedule_data);
                debug('COMMIT at createSchedule'+schedule_data);
                return resolve(schedule_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("create createSchedule Error :", err);
                return reject(err_code);
            }
        })
    }

    updateSchedule(connection, updateschedule_data, patient_id, bu_id, schedule_num) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`UPDATE ${process.env.WRITE_DB_DATABASE}.Swastha_Patient_Schedule SET ? WHERE patient_id='${patient_id}' 
                and bu_id='${bu_id}' and schedule_num='${schedule_num}'`, updateschedule_data);
                debug('COMMIT at updateSchedule');
                return resolve(updateschedule_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("updateScheduler Error :", err);
                return reject(err_code);
            }
        })
    }

    getSchedulbyNumber(connection,branch_id, patient_id, bu_id,schedule_num) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT d.org_id,d.branch_id,DATE_FORMAT(d.schedule_date,'%Y-%m-%d') as schedule_date,DATE_FORMAT(d.planned_date,'%Y-%m-%d') as planned_date,
                d.schedule_ver,d.schedule_num,d.bu_id,d.patient_id,DATE_FORMAT(d.actual_date,'%Y-%m-%d') as actual_date ,d.schedule_purpose,d.visit_flag,addl_remarks FROM ${process.env.WRITE_DB_DATABASE}.Swastha_Patient_Schedule d 
                WHERE d.branch_id='${branch_id}' and d.patient_id='${patient_id}' and d.bu_id='${bu_id}' and d.schedule_num=${schedule_num}`;
    
               
                debug("getSchedulNumber", custQuery)
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

    getSchedulbyNumberUpdate(connection,branch_id, patient_id, bu_id,schedule_num) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.Swastha_Patient_Schedule d 
                WHERE d.branch_id='${branch_id}' and d.patient_id='${patient_id}' and d.bu_id='${bu_id}' and d.schedule_num=${schedule_num}`;
    
               
                debug("getSchedulNumber", custQuery)
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

    
   


    getMaxScheduleNumber(connection,  org_id, branch_id, patient_id, bu_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT max(schedule_num) AS schedule_num FROM ${process.env.WRITE_DB_DATABASE}.Swastha_Patient_Schedule WHERE org_id='${org_id}' AND 
                branch_id='${branch_id}' and  patient_id='${patient_id}' AND bu_id='${bu_id}'`;
                
                debug("getMaxScheduleNumber", custQuery)
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
                debug('getMaxScheduleNumber Error :', error)
                return reject(err_code);
            }
        })
    }

    getScheduleList(connection,  org_id, branch_id, patient_id, bu_id) {
        return new Promise(async (resolve, reject) => {
            try {
                if (connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage: "DB Connection Failed!." };
                    return reject(err_code)
                }
                var custQuery = `SELECT d.org_id,d.branch_id,DATE_FORMAT(d.schedule_date,'%Y-%m-%d') as schedule_date,DATE_FORMAT(d.planned_date,'%Y-%m-%d') as planned_date,
                (SELECT ref_desc FROM swastha_hms.Swastha_Ref_Master where ref_type='SCHTYP' and ref_code=d.visit_flag) as visit_flag_name,
                d.schedule_ver,d.schedule_num,d.bu_id,d.patient_id,DATE_FORMAT(d.actual_date,'%Y-%m-%d') as actual_date ,d.schedule_purpose,d.visit_flag,addl_remarks FROM ${process.env.WRITE_DB_DATABASE}.Swastha_Patient_Schedule d 
                WHERE d.org_id='${org_id}' and d.branch_id='${branch_id}' and d.patient_id='${patient_id}' and d.bu_id='${bu_id}'`;
    
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


    getScheduleListByMonth(connection,  org_id, branch_id, patient_id, bu_id, month, year) {
        return new Promise(async (resolve, reject) => {
            try {
                if (connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage: "DB Connection Failed!." };
                    return reject(err_code)
                }
                var custQuery = `SELECT d.org_id,d.branch_id,DATE_FORMAT(d.schedule_date,'%Y-%m-%d') as schedule_date,DATE_FORMAT(d.planned_date,'%Y-%m-%d') as planned_date,
                (SELECT ref_desc FROM swastha_hms.Swastha_Ref_Master where ref_type='SCHTYP' and ref_code=d.visit_flag) as visit_flag_name,
                d.schedule_ver,d.schedule_num,d.bu_id,d.patient_id,DATE_FORMAT(d.actual_date,'%Y-%m-%d') as actual_date ,d.schedule_purpose,d.visit_flag,addl_remarks FROM ${process.env.WRITE_DB_DATABASE}.Swastha_Patient_Schedule d 
                WHERE d.org_id='${org_id}' and d.branch_id='${branch_id}' and d.patient_id='${patient_id}' and d.bu_id='${bu_id}' and month(d.schedule_date)=${month} and year(d.schedule_date)=${year} and visit_flag<>'C'`;
    
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

    GetPatientLastVisitDateCount(connection, org_id, branch_id, patient_id) {
        return new Promise(async (resolve, reject) => {
            try {
                if (connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage: "DB Connection Failed!." };
                    return reject(err_code)
                }
                var custQuery = `SELECT count(*) cnt, max(DATE_FORMAT(visit_date,'%Y-%m-%d')) visit_date FROM Patient_Consult_Header 
                where org_id='${org_id}' and branch_id='${branch_id}' and patient_id='${patient_id}'`;
                console.log(custQuery);
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    return resolve(null);
                }
                else{
                    var _res = JSON.parse(JSON.stringify(queryres));
                    var response = _res[0];
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

    GetPatientLastDialysisDateCount(connection, org_id, branch_id, patient_id) {
        return new Promise(async (resolve, reject) => {
            try {
                if (connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage: "DB Connection Failed!." };
                    return reject(err_code)
                }
                var custQuery = `select count(*) Dialy_cnt, max(DATE_FORMAT(actual_date,'%Y-%m-%d')) last_dialy_date from Swastha_Patient_Schedule 
                where org_id='${org_id}' and branch_id='${branch_id}' and patient_id='${patient_id}' and bu_id="DIALY"`;
                console.log(custQuery);
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    return resolve(null);
                }
                else{
                    var _res = JSON.parse(JSON.stringify(queryres));
                    var response = _res[0];
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

    GetMaxVisitNoPharmacyPrescriptionCount(connection, org_id, branch_id, patient_id) {
        return new Promise(async (resolve, reject) => {
            try {
                if (connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage: "DB Connection Failed!." };
                    return reject(err_code)
                }
                var custQuery = `select max(visit_no) last_visit_pharma from Patient_Consult_Pharma_Detail a 
                where org_id='${org_id}' and branch_id='${branch_id}' and patient_id='${patient_id}'`;
                console.log(custQuery);
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    return resolve(0);
                }
                else{
                    var _res = JSON.parse(JSON.stringify(queryres));
                    var response = _res[0].last_visit_pharma;
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

    GetLastVisitMedPrescribed(connection, org_id, branch_id, patient_id, visit_pharmacy) {
        return new Promise(async (resolve, reject) => {
            try {
                if (connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage: "DB Connection Failed!." };
                    return reject(err_code)
                }
                var custQuery = `select b.product_name, a.* from Patient_Consult_Pharma_Detail a, Product_Master b
                where  a.org_id='${org_id}' and a.branch_id='${branch_id}' and a.patient_id='${patient_id}' 
                and a.visit_no = ${visit_pharmacy} and a.org_id=b.org_id and a.medicine_id=b.product_id`;
                console.log(custQuery);
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    var empty_array = [];
                    return resolve(empty_array);
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
   
    GetMaxVisitNoTestCount(connection, org_id, branch_id, patient_id) {
        return new Promise(async (resolve, reject) => {
            try {
                if (connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage: "DB Connection Failed!." };
                    return reject(err_code)
                }
                var custQuery = `select max(visit_no) last_visit_test from Patient_Consult_Lab_Detail a
                where  a.org_id='${org_id}' and a.branch_id='${branch_id}' and a.patient_id='${patient_id}'`;
                console.log(custQuery);
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    return resolve(0);
                }
                else{
                    var _res = JSON.parse(JSON.stringify(queryres));
                    var response = _res[0].last_visit_test;
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

    GetLastVisitTestDetails(connection, org_id, branch_id, patient_id, last_visit_test_count) {
        return new Promise(async (resolve, reject) => {
            try {
                if (connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage: "DB Connection Failed!." };
                    return reject(err_code)
                }
                var custQuery = `select b.product_name, a.* from Patient_Consult_Lab_Detail a, Product_Master b
                where  a.org_id='${org_id}' and a.branch_id='${branch_id}' and a.patient_id='${patient_id}'
                and a.visit_no = ${last_visit_test_count} and a.org_id=b.org_id and a.test_id=b.product_id`;
                console.log(custQuery);
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    var empty_array = [];
                    return resolve(empty_array);
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

    GetMaxVisitHealthParamCount(connection, org_id, branch_id, patient_id) {
        return new Promise(async (resolve, reject) => {
            try {
                if (connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage: "DB Connection Failed!." };
                    return reject(err_code)
                }
                var custQuery = `select max(visit_no) last_visit_khi from Patient_Consult_Health_Param a
                where a.org_id='${org_id}' and a.branch_id='${branch_id}' and a.patient_id='${patient_id}'`;
                console.log(custQuery);
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    return resolve(0);
                }
                else{
                    var _res = JSON.parse(JSON.stringify(queryres));
                    var response = _res[0].last_visit_khi;
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

    GetMaxVisitHealthParamDetails(connection, org_id, branch_id, patient_id, last_visit_khi) {
        return new Promise(async (resolve, reject) => {
            try {
                if (connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage: "DB Connection Failed!." };
                    return reject(err_code)
                }
                var custQuery = `select b.khi_desc,a.* from Patient_Consult_Health_Param a, Patient_Key_Health_Param_Master b
                where a.org_id='${org_id}' and a.branch_id='${branch_id}' and a.patient_id='${patient_id}' 
                and a.visit_no = ${last_visit_khi} and a.khi_code=b.khi_code`;
                console.log(custQuery);
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    var empty_array = [];
                    return resolve(empty_array);
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
    FetchPatientSchedule(connection, org_id, branch_id, from_date,to_date, query) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
               /* var custQuery = `SELECT b.patient_name,a.* FROM ${process.env.WRITE_DB_DATABASE}.Swastha_Patient_Schedule a, ${process.env.WRITE_DB_DATABASE}.Patient_Master b 
                where a.org_Id='${org_id}'  and a.branch_id='${branch_id}' 
                and schedule_date between '${from_date}' and '${to_date}' 
                and a.patient_id=b.patient_id
                order by Patient_id,bu_id,schedule_num`;*/

                var custQuery = ` SELECT b.patient_id, b.patient_name,a.org_id,a.branch_id,a.bu_id,a.schedule_ver,a.schedule_num, DATE_FORMAT(a.schedule_date,'%Y-%m-%d') schedule_date,
                 DATE_FORMAT(a.planned_date,'%Y-%m-%d') planned_date, DATE_FORMAT(a.actual_date,'%Y-%m-%d') actual_date,a.visit_flag,a.schedule_purpose,a.addl_remarks,
                 a.created_by,a.created_date,a.updated_by,a.updated_date FROM ${process.env.WRITE_DB_DATABASE}.Swastha_Patient_Schedule a, ${process.env.WRITE_DB_DATABASE}.Patient_Master b 
                where a.org_Id='${org_id}'  and a.branch_id='${branch_id}'  
                and a.schedule_date between '${from_date}' and '${to_date}' 
                and a.patient_id=b.patient_id
                order by a.patient_id,bu_id,schedule_num`;
                

                debug("FetchPatientSchedule--->", custQuery)
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
                debug('invoiceproductreport error :', error)
                return reject(err_code);
            }
        })
    }

    //D0004 Patient- Report
    GetD0004Header(connection, org_id, branch_id, patient_id) {
        return new Promise(async (resolve, reject) => {
            try {
                if (connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage: "DB Connection Failed!." };
                    return reject(err_code)
                }
                var custQuery = `Select c.*,DATE_FORMAT(c.visit_date,'%Y-%m-%d') visit_date,DATE_FORMAT(c.prev_visit_date,'%Y-%m-%d') prev_visit_date
                ,h.attitude,h.restraint_dtl,h.concurrent_disease,h.concurrent_disease_dtl,h.lacrimation_left,h.lacrimation_right,h.blepharospasm_right,
                h.pain_right,h.pain_left,h.blepharospasm_left,h.photophobia_right,h.photophobia_left 
                from ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Header c LEFT JOIN ${process.env.WRITE_DB_DATABASE}.patient_pet_consultant_header 
                h ON h.org_id=c.org_id AND h.branch_id=c.branch_id AND h.patient_id=c.patient_id AND h.visit_no=c.visit_no
               where  c.org_id='${org_id}' and c.branch_id='${branch_id}' and c.patient_id='${patient_id}' 
               and c.visit_no =(select max(visit_no) Latest_visit_no from ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Header where org_id='${org_id}' and branch_id='${branch_id}' and patient_id='${patient_id}') `;
            
            
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    return resolve(null);
                }
                else{
                    var _res = JSON.parse(JSON.stringify(queryres));
                    var response = _res[0];
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

    GetD0004DiagnosticInput(connection, org_id, branch_id, patient_id) {
        return new Promise(async (resolve, reject) => {
            try {
                if (connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage: "DB Connection Failed!." };
                    return reject(err_code)
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.swastha_pet_diagnosis where org_id='${org_id}' and branch_id='${branch_id}'  and patient_id='${patient_id}'  
                 and visit_no=(SELECT max(visit_no) last_visit_no FROM ${process.env.WRITE_DB_DATABASE}.swastha_pet_diagnosis  
                WHERE org_id='${org_id}' and branch_id='${branch_id}'  and patient_id='${patient_id}') `;
               
            
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    var invoice_lists = [];
                    return resolve(invoice_lists);
                }
                else{
                   // var _res = JSON.parse(JSON.stringify(queryres));
                   // var response = _res[0];
                    return resolve(queryres); 
                }
            }
            catch (err) {
                console.log(err);
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage: "Sorry, Internal Server Error!." };
                debug("GetD0004DiagnosticInput :", err);
                return reject(err_code);
            }
        })
    }
       
 
    GetD0004TreatmentInput(connection, org_id, branch_id, patient_id) {
        return new Promise(async (resolve, reject) => {
            try {
                if (connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage: "DB Connection Failed!." };
                    return reject(err_code)
                }
                var custQuery = `SELECT * FROM ${process.env.WRITE_DB_DATABASE}.swastha_pet_treatment 
                where org_id='${org_id}' and branch_id='${branch_id}'  and patient_id='${patient_id}'  
                and visit_no=(SELECT max(visit_no) last_visit_no FROM ${process.env.WRITE_DB_DATABASE}.swastha_pet_treatment 
                where org_id='${org_id}' and branch_id='${branch_id}'  and patient_id='${patient_id}')`;
               
            
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    var invoice_lists = [];
                    return resolve(invoice_lists);
                }
                else{
                   // var _res = JSON.parse(JSON.stringify(queryres));
                   // var response = _res[0];
                    return resolve(queryres); 
                }
            }
            catch (err) {
                console.log(err);
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage: "Sorry, Internal Server Error!." };
                debug("GetD0004TreatmentInput :", err);
                return reject(err_code);
            }
        })
    }

    
    GetD0004MedicineLastvisit(connection, org_id, branch_id, patient_id) {
        return new Promise(async (resolve, reject) => {
            try {
                if (connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage: "DB Connection Failed!." };
                    return reject(err_code)
                }
                var custQuery = `select b.product_name, a.* from ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Pharma_Detail a, ${process.env.WRITE_DB_DATABASE}.Product_Master b 
                                 where  a.org_id='${org_id}' and a.branch_id='${branch_id}' 
                                and a.patient_id='${patient_id}' and a.medicine_id=b.product_id and a.org_id=b.org_id 
                                and a.visit_no =(select max(visit_no) last_visit_no from ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Pharma_Detail  
                                where  org_id='${org_id}' and branch_id='${branch_id}'   and patient_id='${patient_id}' )  `;
               
            
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    var invoice_lists = [];
                    return resolve(invoice_lists);
                }
                else{
                   // var _res = JSON.parse(JSON.stringify(queryres));
                   // var response = _res[0];
                    return resolve(queryres); 
                }
            }
            catch (err) {
                console.log(err);
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage: "Sorry, Internal Server Error!." };
                debug("GetD0004TreatmentInput :", err);
                return reject(err_code);
            }
        })
    }
    
    
    GetD0004TestLastvisit(connection, org_id, branch_id, patient_id) {
        return new Promise(async (resolve, reject) => {
            try {
                if (connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage: "DB Connection Failed!." };
                    return reject(err_code)
                }
                var custQuery = `select b.product_name, a.* from ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Lab_Detail a, ${process.env.WRITE_DB_DATABASE}.Product_Master b
                where  a.org_id='${org_id}' and a.branch_id='${branch_id}'  
                and a.patient_id='${patient_id}'  
                and a.visit_no = ( 
                select max(visit_no) last_visit_no from ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Lab_Detail a
                where  a.org_id='${org_id}' and a.branch_id='${branch_id}'  
                and a.patient_id='${patient_id}'  )
                and a.org_id=b.org_id and a.test_id=b.product_id`;
               
           
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    var invoice_lists = [];
                    return resolve(invoice_lists);
                }
                else{
                   // var _res = JSON.parse(JSON.stringify(queryres));
                   // var response = _res[0];
                    return resolve(queryres); 
                }
            }
            catch (err) {
                console.log(err);
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage: "Sorry, Internal Server Error!." };
                debug("GetD0004TestLastvisit :", err);
                return reject(err_code);
            }
        })
    }

    GetD0004HealthLastvisit(connection, org_id, branch_id, patient_id) {
        return new Promise(async (resolve, reject) => {
            try {
                if (connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage: "DB Connection Failed!." };
                    return reject(err_code)
                }

                var custQuery = `select b.khi_desc,a.* from ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Health_Param a, ${process.env.WRITE_DB_DATABASE}.Patient_Key_Health_Param_Master b
                where  a.org_id='${org_id}' and a.branch_id='${branch_id}' 
                and a.patient_id='${patient_id}' 
                and a.visit_no = (select max(visit_no) last_visit_no from ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Health_Param 
                where  org_id='${org_id}' and branch_id='${branch_id}' 
                and patient_id='${patient_id}'  )
                and a.khi_code=b.khi_code  `;
                debug("GetD0004HealthLastvisit :", custQuery);
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    var invoice_lists = [];
                    return resolve(invoice_lists);
                }
                else{
                   // var _res = JSON.parse(JSON.stringify(queryres));
                   // var response = _res[0];
                    return resolve(queryres); 
                }
            }
            catch (err) {
                console.log(err);
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage: "Sorry, Internal Server Error!." };
                debug("GetD0004HealthLastvisit :", err);
                return reject(err_code);
            }
        })
    }
    


    GetD0004MaxVisitNoPetConsultDtl(connection, org_id, branch_id, patient_id) {
        return new Promise(async (resolve, reject) => {
            try {
                if (connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage: "DB Connection Failed!." };
                    return reject(err_code)
                }
                var custQuery = `select  distinct heading, heading_seq_no, max(visit_no) last_visit_no from ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Health_Param a
                where a.org_id='${org_id}' and a.branch_id='${branch_id}' and a.patient_id='${patient_id}'`;
                console.log(custQuery);
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    return resolve(0);
                }
                else{
                    var _res = JSON.parse(JSON.stringify(queryres));
                    var response = _res[0].last_visit_khi;
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


    GetD0002HeaderDetails(connection,table_name, org_id, branch_id, patient_id) {
        return new Promise(async (resolve, reject) => {
            try {
                if (connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage: "DB Connection Failed!." };
                    return reject(err_code)
                }
                var custQuery = `select * from ${process.env.WRITE_DB_DATABASE}.${table_name}
                where org_id='${org_id}' and branch_id='${branch_id}' and patient_id='${patient_id}' and 
                visit_no=(select max(visit_no) from ${process.env.WRITE_DB_DATABASE}.${table_name}
                where org_id='${org_id}' and branch_id='${branch_id}' and patient_id='${patient_id}')`;
               
              
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    return resolve(0);

                }
                else{
                    var _res = JSON.parse(JSON.stringify(queryres));
                    var response = _res[0]
                    return resolve(response); 
                }
            }
            catch (err) {
                console.log(err);
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage: "Sorry, Internal Server Error!." };
                debug("GetD0002HeaderDetails :", err);
                return reject(err_code);
            }
        })
    }

    GetD0002Details(connection,table_name, org_id, branch_id, patient_id) {
        return new Promise(async (resolve, reject) => {
            try {
                if (connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage: "DB Connection Failed!." };
                    return reject(err_code)
                }
                var custQuery = `select * from ${process.env.WRITE_DB_DATABASE}.${table_name}
                where org_id='${org_id}' and branch_id='${branch_id}' and patient_id='${patient_id}' and 
                visit_no=(select max(visit_no) from ${process.env.WRITE_DB_DATABASE}.${table_name}
                where org_id='${org_id}' and branch_id='${branch_id}' and patient_id='${patient_id}')`;
               
              
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
                debug("GetD0002Details :", err);
                return reject(err_code);
            }
        })
    }

    GetD0002PatientLastvisitanddate(connection, org_id, branch_id, patient_id) {
        return new Promise(async (resolve, reject) => {
            try {
                if (connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage: "DB Connection Failed!." };
                    return reject(err_code)
                }
                var custQuery = `SELECT count(*) cnt, max(DATE_FORMAT(visit_date,'%Y-%m-%d')) visit_date FROM Patient_Consult_Header 
                                where  org_id='${org_id}' and branch_id='${branch_id}'   and patient_id='${patient_id}'  `;
               
            
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                   // var invoice_lists = [];
                    return resolve(null);
                }
                else{
                    var _res = JSON.parse(JSON.stringify(queryres));
                    var response = _res[0];
                    return resolve(response); 
                }
            }
            catch (err) {
                console.log(err);
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage: "Sorry, Internal Server Error!." };
                debug("GetD0002PatientLastvisitanddate :", err);
                return reject(err_code);
            }
        })
    }

    //Indepnent Tab start
    //360 Consulting header
    getConsultingheader(connection, org_id,branch_id, patient_id, query) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `Select c.*,DATE_FORMAT(c.visit_date,'%Y-%m-%d') visit_date,DATE_FORMAT(c.prev_visit_date,'%Y-%m-%d') prev_visit_date
                ,h.attitude,h.restraint_dtl,h.concurrent_disease,h.concurrent_disease_dtl,h.lacrimation_left,h.lacrimation_right,h.blepharospasm_right,h.pain_right,h.pain_left,h.blepharospasm_left,h.photophobia_right,h.photophobia_left 
                from ${process.env.WRITE_DB_DATABASE}.Patient_Consult_Header c LEFT JOIN ${process.env.WRITE_DB_DATABASE}.patient_pet_consultant_header 
                h ON h.org_id=c.org_id AND h.branch_id=c.branch_id AND h.patient_id=c.patient_id AND h.visit_no=c.visit_no
               where  c.org_id='${org_id}' and c.branch_id='${branch_id}' and c.patient_id='${patient_id}' 
               and c.visit_no= (SELECT  max(visit_no) last_visit_no FROM swastha_pet_consult_detail where org_id='${org_id}' and branch_id='${branch_id}' and patient_id='${patient_id}')  `; 
                
              
                debug("Shan1", custQuery)
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
                debug('getConsultingheader error :', error)
                return reject(err_code);
            }
        })
    }
 
               
// 360 getPetHeading (Independent -1)
    getPetGrpByHeading(connection, org_id, branch_id, patient_id,visit_no, query){
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
             
                var custQuery = ` SELECT  heading, heading_seq_no, max(visit_no) last_visit_no FROM swastha_pet_consult_detail where org_id='${org_id}' and branch_id='${branch_id}' and patient_id='${patient_id}'
                group by heading , heading_seq_no order by heading_seq_no`;
            
              /*  custQuery = `select a.* from ${process.env.WRITE_DB_DATABASE}.swastha_pet_consult_detail a,  ${process.env.WRITE_DB_DATABASE}.swastha_doctor_pet_consult_metadata b 
               
                where    a.visit_no=${visit_no}  and a.org_id='${org_id}' and a.branch_id='${branch_id}' and a.patient_id='${patient_id}' group by  a.heading  order by a.visit_no desc`;
               */
              
              
                debug("getPetGrpByHeading", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    var empty_array = [];
                    return resolve(empty_array)
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getPetGrpByHeading error :', error)
                return reject(err_code);
            }
        })
    }

     // 360 getPetHeading (Independent -2 )
     petconsultmetadatabyheading(connection, org_id, branch_id, patient_id,visit_no,heading, query) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = "";
          
               /* custQuery = `Select distinct(sub_heading) as sub_heading from  ${process.env.WRITE_DB_DATABASE}.swastha_pet_consult_detail 
                where  a.org_id='${org_id}' and a.branch_id='${branch_id}' and a.patient_id='${patient_id}' and a.visit_no=${visit_no} and  a.heading='${heading}' `;*/

                custQuery = `select distinct(a.sub_heading) as sub_heading,b.sub_heading_seq_no from swastha_pet_consult_detail a left join swastha_doctor_pet_consult_metadata b 
                on a.dept_id=b.dept_id and a.heading=b.heading and a.sub_heading=b.sub_heading
                and a.column_name_seq_no = b.column_name_seq_no where  a.org_id='${org_id}' and a.branch_id='${branch_id}' and a.patient_id='${patient_id}' and a.visit_no=${visit_no} and  a.heading='${heading}'
                order by b.sub_heading_seq_no `;
              
                debug("allvisitlabInformation", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    var empty_array = [];
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

       // 360 getPetHeading (Independent -2 )
    getPetConsultdetail(connection, org_id, branch_id, patient_id,visit_no,heading,sub_heading, query) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `select a.* from ${process.env.WRITE_DB_DATABASE}.swastha_pet_consult_detail a left join ${process.env.WRITE_DB_DATABASE}.swastha_doctor_pet_consult_metadata b 
                on a.dept_id=b.dept_id and a.heading=b.heading and a.sub_heading=b.sub_heading
                and a.column_name_seq_no = b.column_name_seq_no where a.org_id='${org_id}' and a.branch_id='${branch_id}' and a.patient_id='${patient_id}' and a.visit_no=${visit_no}  and a.heading='${heading}' and a.sub_heading='${sub_heading}' 
                order by a.patient_id, a.visit_no,b.heading_seq_no, b.sub_heading_seq_no, b.column_name_seq_no`

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
                debug('getPetConsultdetail error :', error)
                return reject(err_code);
            }
        })
    }

    
       

   
    // 360 getIndependent
    getIndependent(connection, org_id,branch_id, patient_id,visit_date,visit_no, query) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }

                    var custQuery = `select a.* from ${process.env.WRITE_DB_DATABASE}.swastha_pet_consult_detail a left join ${process.env.WRITE_DB_DATABASE}.swastha_doctor_pet_consult_metadata b 
                    on  a.dept_id=b.dept_id and a.heading=b.heading and a.sub_heading=b.sub_heading
                    and a.column_name_seq_no = b.column_name_seq_no where a.org_id='${org_id}' and a.branch_id='${branch_id}' and a.patient_id='${patient_id}' and a.visit_no=${visit_no}
                    order by a.patient_id, a.visit_no,b.heading_seq_no, b.sub_heading_seq_no, b.column_name_seq_no`;
                
                debug("getIndependent", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    var invoice_lists = "";
                    return resolve(invoice_lists);
                }
                else{
                    var _response = JSON.parse(JSON.stringify(queryres));
                    //var response = _response[0];
                    return resolve(_response);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getIndependent error :', error)
                return reject(err_code);
            }
        })
    }

    // Intepent tab stop
    petconsultmetadatagroupbyheading(connection) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = "";
            
                custQuery = `Select heading from  ${process.env.WRITE_DB_DATABASE}.swastha_doctor_pet_consult_metadata group by heading  `;

              
              
                debug("petconsultmetadatagroupbyheading", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Consult Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry, petconsultdetail Not Found!.", developerMessage: "Sorry,petconsultdetail Not Found!." };
                    return resolve(error_code)
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('petconsultmetadatagroupbyheading error :', error)
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

}

module.exports = {
    PatientDao
}