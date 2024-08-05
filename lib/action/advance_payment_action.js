const { SendResponse } = require('../../common/app_utils');
const { AdvancePaymentModule } = require('../modules/advance_payment_module');
var debug = require('debug')('v2:consulting:actions');

var advancePaymentModule = new AdvancePaymentModule();
class AdvancePaymentAction {

    CreateAdvancePayment(event, context) {      
        var body_data = event.body;
        var query = event.queryParameters;
        validate_data_for_create_adv_payment(event.body)       
        .then(function(_response) {
            debug("validate data ", _response);
            return advancePaymentModule.CreateAdvancePayment(body_data,  query)
        })
        .then(function(response){
            if(response.hasOwnProperty('status') && (response.status == 404))
            context.done(null, SendResponse(401, response))
            else
            context.done(null, SendResponse(200, response));
        })
        .catch(function(err){
            context.done(null, SendResponse(500, err));
        })
    }

   
    
}

function validate_data_for_create_adv_payment(adv_payment_data) {
    return new Promise((resolve, reject) => {
        return resolve(adv_payment_data)
    })
}



module.exports = {
    AdvancePaymentAction
}