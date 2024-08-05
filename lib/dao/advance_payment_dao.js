const mysql = require('../../common/db_utils');
var debug = require('debug')('v2:consulting:dao');
const BaseDao = require('./base_dao');

class AdvancePaymentDAO extends BaseDao {
    createAdvancePayment(connection, advance_payment_data) {
        return new Promise(async (resolve, reject) => {
            try {
                if (connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage: "DB Connection Failed!." };
                    return reject(err_code)
                }
                await connection.query(`INSERT INTO ${process.env.WRITE_DB_DATABASE}.Billing_Adv_Payment_Detail SET ?`, advance_payment_data);
                debug('COMMIT at createAdvancePayment');
                return resolve(advance_payment_data);
            }
            catch (err) {
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage: "Sorry, Internal Server Error!." };
                debug("create Advance payment error :", err);
                return reject(err_code);
            }
        })
    }
    getPatientAdvance(connection, patient_id) {
        return new Promise(async (resolve, reject) => {
            try {
                if (connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage: "DB Connection Failed!." };
                    return reject(err_code)
                }
                console.log('in dao', patient_id);
                var custQuery = `SELECT advance_amount_balance FROM ${process.env.WRITE_DB_DATABASE}.Patient_Master WHERE patient_id='${patient_id}'`;
                let queryres = await connection.query(custQuery);
                if (queryres.length == 0) {
                    debug('Sorry, Details Not Found!.', queryres);
                    return resolve(null)
                }
                else {
                    var _response = JSON.parse(JSON.stringify(queryres));
                    var response = _response[0];
                    console.log(response);
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

    updateAdvancePayment(connection, advance_payment_data, advance_payment_payload) {
        return new Promise(async (resolve, reject) => {
            try {
                if (connection == null) {
                    var err_code = { status: 500, code: 5001, message: "DB Connection Failed!.", developerMessage: "DB Connection Failed!." };
                    return reject(err_code)
                }
                await connection.query(`UPDATE ${process.env.WRITE_DB_DATABASE}.Patient_Master SET ? WHERE patient_id='${advance_payment_data}'`, advance_payment_payload);

                debug('COMMIT at updateAdvancePayment');
                return resolve(advance_payment_data);
            }
            catch (err) {
                console.log(err);
                var err_code = { status: 500, code: 5001, message: "Sorry, Internal Server Error!.", developerMessage: "Sorry, Internal Server Error!." };
                debug("create Advance payment error :", err);
                return reject(err_code);
            }
        })
    }
}

module.exports = {
    AdvancePaymentDAO
}