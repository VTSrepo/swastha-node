const { AdvancePaymentDAO } = require('../dao/advance_payment_dao');
var debug = require('debug')('v2:consulting:module');
const { changeLog } = require('../../common/error_handling');
var moment = require('moment-timezone');


class AdvancePaymentModule {

    CreateAdvancePayment(data, query) {
        return new Promise(async (resolve, reject) => {
            var advPaymentDAO = new AdvancePaymentDAO();
            var read_connection = null;
            var adv_payment_data, set_pat_adv_payment_data;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            try {
                read_connection = await advPaymentDAO.getReadConnection();                
                set_pat_adv_payment_data = await categories_data_to_schema_advance_payment_data_to_create(read_connection, data, date);
                if (read_connection) {
                    await advPaymentDAO.releaseReadConnection(read_connection);
                }
                return resolve(set_pat_adv_payment_data);
            }
            catch (error) {
                debug("error", error)
                if (read_connection) {
                    await advPaymentDAO.releaseReadConnection(read_connection);
                }
                return reject(error)
            }
        })
    }

}

function categories_data_to_schema_advance_payment_data_to_create(connection, data, date) {
    return new Promise(async (resolve, reject) => {
        try {
            debug("Data", data)
            var advancePaymentDao = new AdvancePaymentDAO();           
            var advance_payment_data = {
                org_id: data.org_id,
                branch_id: data.branch_id,
                patient_id: data.patient_id,
                adv_payment_date: date,
                payment_mode: data.payment_mode,
                payment_amount: data.payment_amount,
                payment_remark: data.payment_remark,
                updated_by: (data.hasOwnProperty('user_id')) ? data.user_id : null,
                updated_date: date,
                created_by: (data.hasOwnProperty('user_id')) ? data.user_id : null,
                created_date: date
            }
           var  adv_payment_data = await advancePaymentDao.createAdvancePayment(connection, advance_payment_data);
           
            var get_adv_payment_data = await advancePaymentDao.getPatientAdvance(connection, data.patient_id);
          
            let advance_amount = get_adv_payment_data.advance_amount_balance + data.payment_amount;
            let adv_payload = { advance_amount_balance: advance_amount };
          
            set_adv_payment_data = await advancePaymentDao.updateAdvancePayment(connection, data.patient_id, adv_payload)
           
            return resolve(adv_payment_data)
        }
        catch (error) {
            return reject(error);
        }
    })
}


module.exports = {
    AdvancePaymentModule
}