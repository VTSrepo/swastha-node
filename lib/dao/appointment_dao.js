const mysql = require('../../common/db_utils');
var debug = require('debug')('v2:appoint:dao');
const BaseDao = require('./base_dao');

class AppointmentDao extends BaseDao {

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

    createPatientAppointment(connection, user_data_appointment) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`INSERT INTO ${process.env.WRITE_DB_DATABASE}.Patient_Appt_Details SET ?`, user_data_appointment);
                debug('COMMIT at createPatientAppointment');
                return resolve(user_data_appointment);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("create PatientAppointment error :", err);
                return reject(err_code);
            }
        })
    }


    getAppointmentMobileByBranchId(connection, mobile_no, branch_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT A.*, DATE_FORMAT(A.appoint_date,'%Y-%m-%d') AS appoint_date,D.doctor_name,DM.dept_name FROM ${process.env.WRITE_DB_DATABASE}.Patient_Appt_Details  A LEFT JOIN ${process.env.WRITE_DB_DATABASE}.Doctor_Master D on D.doctor_id=A.doctor_id LEFT JOIN ${process.env.WRITE_DB_DATABASE}.Department_Master DM on DM.dept_id=A.dept_id WHERE A.phone_no='${mobile_no}' AND A.branch_id='${branch_id}'`;
                debug("getAppointmentMobileByBranchId", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Appointment Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry, Appointment Not Found!.", developerMessage: "Sorry, Appointment Not Found!." };
                    return resolve(error_code)
                }
                else{
                    return resolve(queryres)
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getAppointmentMobileByBranchId Error :', error)
                return reject(err_code);
            }
        })
    }

    getCountAppointmentMobileByBranchId(connection, mobile_no, branch_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT COUNT(*) as count FROM ${process.env.WRITE_DB_DATABASE}.Patient_Appt_Details WHERE phone_no='${mobile_no}' AND branch_id='${branch_id}'`;
                debug("getCountAppointmentMobileByBranchId", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Appointment Not Found!.', queryres);
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
                debug('getCountAppointmentMobileByBranchId Error :', error)
                return reject(err_code);
            }
        })
    }

    getAppointmentPatientByBranchId(connection, patient_id, branch_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT A.*, DATE_FORMAT(A.appoint_date,'%Y-%m-%d') AS appoint_date,D.doctor_name,DM.dept_name FROM ${process.env.WRITE_DB_DATABASE}.Patient_Appt_Details  A LEFT JOIN ${process.env.WRITE_DB_DATABASE}.Doctor_Master D on D.doctor_id=A.doctor_id 
                LEFT JOIN ${process.env.WRITE_DB_DATABASE}.Department_Master DM on DM.dept_id=A.dept_id WHERE A.patient_id='${patient_id}' AND A.branch_id='${branch_id}'`;
                debug("getAppointmentPatientByBranchId", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Appointment Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry, Appointment Not Found!.", developerMessage: "Sorry, Appointment Not Found!." };
                    return resolve(error_code)
                }
                else{
                    return resolve(queryres)
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getAppointmentPatientByBranchId Error :', error)
                return reject(err_code);
            }
        })
    }

    getCountAppointmentPatientByBranchId(connection, patient_id, branch_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT COUNT(*) as count FROM ${process.env.WRITE_DB_DATABASE}.Patient_Appt_Details WHERE patient_id='${patient_id}' AND branch_id='${branch_id}'`;
                debug("getCountAppointmentPatientByBranchId", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, User Not Found!.', queryres);
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
                debug('getCountAppointmentPatientByBranchId error :', error)
                return reject(err_code);
            }
        })
    }

    getAppointmentDoctorByBranchId(connection, doctor_id, branch_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT A.*, DATE_FORMAT(A.appoint_date,'%Y-%m-%d') AS appoint_date ,D.doctor_name,DM.dept_name FROM ${process.env.WRITE_DB_DATABASE}.Patient_Appt_Details  A LEFT JOIN ${process.env.WRITE_DB_DATABASE}.Doctor_Master D on D.doctor_id=A.doctor_id 
                LEFT JOIN ${process.env.WRITE_DB_DATABASE}.Department_Master DM on DM.dept_id=A.dept_id WHERE A.doctor_id='${doctor_id}' AND A.branch_id='${branch_id}'`;
                debug("getAppointmentDoctorByBranchId", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Appointment Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry, Appointment Not Found!.", developerMessage: "Sorry, Appointment Not Found!." };
                    return resolve(error_code)
                }
                else{
                    return resolve(queryres)
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getAppointmentDoctorByBranchId Error :', error)
                return reject(err_code);
            }
        })
    }

    getCountAppointmentDoctorByBranchId(connection, doctor_id, branch_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT COUNT(*) as count FROM ${process.env.WRITE_DB_DATABASE}.Patient_Appt_Details WHERE doctor_id='${doctor_id}' 
                AND branch_id='${branch_id}'`;
                debug("getCountAppointmentDoctorByBranchId", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, User Not Found!.', queryres);
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
                debug('getCountAppointmentDoctorByBranchId error :', error)
                return reject(err_code);
            }
        })
    }

    getAppointmentAppointDateByBranchId(connection, appoint_date, branch_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT A.*, DATE_FORMAT(A.appoint_date,'%Y-%m-%d') AS appoint_date,D.doctor_name,DM.dept_name FROM ${process.env.WRITE_DB_DATABASE}.Patient_Appt_Details  A LEFT JOIN ${process.env.WRITE_DB_DATABASE}.Doctor_Master D on D.doctor_id=A.doctor_id  
                LEFT JOIN ${process.env.WRITE_DB_DATABASE}.Department_Master DM on DM.dept_id=A.dept_id WHERE A.appoint_date='${appoint_date}' AND A.branch_id='${branch_id}'`;
                debug("getAppointmentAppointDateByBranchId", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Appointment Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry, Appointment Not Found!.", developerMessage: "Sorry, Appointment Not Found!." };
                    return resolve(error_code)
                }
                else{
                    return resolve(queryres)
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getAppointmentAppointDateByBranchId Error :', error)
                return reject(err_code);
            }
        })
    }

    getCountAppointmentAppointDateByBranchId(connection, appoint_date, branch_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT COUNT(*) as count FROM ${process.env.WRITE_DB_DATABASE}.Patient_Appt_Details WHERE appoint_date='${appoint_date}' AND branch_id='${branch_id}'`;
                debug("getCountAppointmentAppointDateByBranchId", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, User Not Found!.', queryres);
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
                debug('getCountAppointmentAppointDateByBranchId error :', error)
                return reject(err_code);
            }
        })
    }
    
    getAppointmentListbyBranchId(connection, branch_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT A.*, DATE_FORMAT(A.appoint_date,'%Y-%m-%d') AS appoint_date ,D.doctor_name,DM.dept_name FROM ${process.env.WRITE_DB_DATABASE}.Patient_Appt_Details  A LEFT JOIN ${process.env.WRITE_DB_DATABASE}.Doctor_Master D on D.doctor_id=A.doctor_id  
                LEFT JOIN ${process.env.WRITE_DB_DATABASE}.Department_Master DM on DM.dept_id=A.dept_id WHERE A.branch_id='${branch_id}'`;
                debug("getAppointmentListbyBranchId", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Appointment Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry, Appointment Not Found!.", developerMessage: "Sorry, Appointment Not Found!." };
                    return resolve(error_code)
                }
                else{
                    return resolve(queryres);
                }
            }
            catch(error) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug('getAppointmentListbyBranchId error :', error)
                return reject(err_code);
            }
        })
    }

    getCountAppointmentbyBranchId(connection, branch_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }
                var custQuery = `SELECT COUNT(*) as count FROM ${process.env.WRITE_DB_DATABASE}.Patient_Appt_Details WHERE branch_id='${branch_id}'`;
                debug("getCountAppointmentbyBranchId", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, User Not Found!.', queryres);
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
                debug('getCountAppointmentbyBranchId error :', error)
                return reject(err_code);
            }
        })
    }

    getAppointmentDetailById(connection, appointment_id) {
        return new Promise(async(resolve, reject)=> {
            try{
                if(connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!", developerMessage:"DB Connection Failed!"};
                    return reject(err_code);
                }

                var custQuery = `SELECT A.*,D.doctor_name,DM.dept_name FROM ${process.env.WRITE_DB_DATABASE}.Patient_Appt_Details A LEFT JOIN ${process.env.WRITE_DB_DATABASE}.Doctor_Master D on D.doctor_id=A.doctor_id 
                LEFT JOIN ${process.env.WRITE_DB_DATABASE}.Department_Master DM on DM.dept_id=A.dept_id WHERE A.appoint_no='${appointment_id}'`;
                debug("getAppointmentDetailById", custQuery)
                let queryres = await connection.query(custQuery);
                if(queryres.length == 0) {
                    debug('Sorry, Appointment Not Found!.', queryres);
                    var error_code = { status: 404, code: 4001, message: "Sorry,Appointment Data Not Available!.", developerMessage: "Sorry,Appointment Data Not Available!." };
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
                debug('getAppointmentDetailById error :', error)
                return reject(err_code);
            }
        })
    }

    updatePatientAppointment(connection, update_appointment, appoint_no) {
        return new Promise(async(resolve, reject) => {
            try {
                if(connection == null ) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage:"DB Connection Failed!." };
                    return reject (err_code)
                }
                await connection.query(`UPDATE ${process.env.WRITE_DB_DATABASE}.Patient_Appt_Details SET ? WHERE appoint_no='${appoint_no}'`, update_appointment);
                debug('COMMIT at updatePatientAppointment');
                return resolve(update_appointment);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage:"Sorry, Internal Server Error!." };
                debug("updatePatientAppointment Error :", err);
                return reject(err_code);
            }
        })
    }
}

module.exports = {
    AppointmentDao
}