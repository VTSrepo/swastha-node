const { SendResponse } = require('../../common/app_utils');
const { BillingModule } = require('../modules/billing_module');
var debug = require('debug')('v2:billing:actions');

var billingModule = new BillingModule();
class BillingAction {

    CreateBilling(event, context) {      
        var body_data = event.body;
        var query = event.queryParameters;
        validate_data_for_create_billing(event.body)       
        .then(function(_response) {
            debug("validate data ", _response);
            return billingModule.createBilling(body_data,  query)
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

    UpdateBilling(event, context) {      
        var body_data = event.body;
        var query = event.queryParameters;
        validate_data_update_billing(event.body)       
        .then(function(_response) {
            debug("validate data ", _response);
            return billingModule.updateBilling(body_data,body_data.invoice_no, query)
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

    UpdateBillingdtl(event, context) {      
        var body_data = event.body;
        var query = event.queryParameters;
        validate_data_update_billing(event.body)       
        .then(function(_response) {
            debug("validate data ", _response);
            return billingModule.updateBillingDtl(body_data, query)
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

    GetBillingListsByBranchId(event, context) {      
        var branch_id = event.pathParameters.branch_id;
        var query = event.queryParameters;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            if(query.filter.hasOwnProperty('inv_status')){
                debug("inv_status in query");
            }else{
                query.filter.inv_status="P";
            }
            return billingModule.GetBillingListsByBranchId(branch_id,  query)
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

    GetBillingListsByOrgId(event, context) {      
        var org_id = event.pathParameters.org_id;
        var query = event.queryParameters;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return billingModule.GetBillingListsByOrgId(org_id,  query)
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

    GetBillingBUDetail(event, context) {      
        var invoice_no = event.pathParameters.invoice_no;
        var query = event.queryParameters;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return billingModule.GetBillingBUDetail(invoice_no,  query)
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

    GetBillingDetail(event, context) {      
        var invoice_no = event.pathParameters.invoice_no;
        var query = event.queryParameters;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return billingModule.GetBillingDetail(invoice_no,  query)
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

    

    GetPatientHeaderDetail(event, context) {
        var query = event.queryParameters;
        var patient_id = event.pathParameters.patient_id;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return billingModule.GetPatientHeaderDetail(patient_id, query)
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

    CreatePaymentsDetail(event, context) {      
        var body_data = event.body;
        var query = event.queryParameters;
        validate_data_for_create_billing_payment_detail(event.body)       
        .then(function(_response) {
            debug("validate data ", _response);
            return billingModule.createBillingPaymentDetail(body_data,  query)
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

    getPatientInvoiceDetail(event, context) {
        var query = event.queryParameters;
        var patient_id = event.pathParameters.patient_id;
        var invoice_no = event.pathParameters.invoice_no;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return billingModule.getPatientInvoiceDetail(invoice_no,patient_id, query)
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

 
    patient360report(event, context) {
        var query = event.queryParameters;
        var patient_id = event.pathParameters.patient_id;
        var org_id = event.pathParameters.org_id;
        var branch_id = event.pathParameters.branch_id;
        var visit_date = query.filter.visit_date;
        var visit_no = query.filter.visit_no;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return billingModule.patient360report(org_id,branch_id,patient_id,visit_date,visit_no, query)
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
    getPatientInvoiceEstimateDetail(event, context) {
        var query = event.queryParameters;
        var patient_id = event.pathParameters.patient_id;
        var invoice_no = event.pathParameters.invoice_no;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return billingModule.getPatientInvoiceEstimateDetail(invoice_no,patient_id, query)
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
    
    getInvoiceByMonth(event, context) {
        var query = event.queryParameters;
        var patient_id = event.pathParameters.patient_id;
        var inv_month = query.filter.inv_month;
        var inv_year = query.filter.inv_year;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return billingModule.getInvoiceMonth(inv_month,inv_year,patient_id, query)
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
// A1 : Report Doctor Summary by org_id,brach_id,from_date,to_date
    getReportDoctorSummary(event, context) {
        var query = event.queryParameters;
        var org_id = event.pathParameters.org_id;
        var branch_id = event.pathParameters.branch_id;
        var from_date = query.filter.from_date;
        var to_date = query.filter.to_date;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return billingModule.getReportDoctorSummary(org_id,branch_id,from_date,to_date, query)
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
    // Report Patient Type Wise
    getReportPatientTypewise(event, context) {
        var query = event.queryParameters;
        var org_id = event.pathParameters.org_id;
        var branch_id = event.pathParameters.branch_id;
        var from_date = query.filter.from_date;
        var to_date = query.filter.to_date;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return billingModule.getReportPatientTypeWiseList(org_id,branch_id,from_date,to_date, query)
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

      // Report Invoice Product (Billing info)
      invoiceproductreport(event, context) {
        var query = event.queryParameters;
        var org_id = event.pathParameters.org_id;
        var branch_id = event.pathParameters.branch_id;
        var from_date = query.filter.from_date;
        var to_date = query.filter.to_date;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return billingModule.invoiceproductreport(org_id,branch_id,from_date,to_date, query)
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


          // Report Invoice Payment (Billing info)
          invoicepaymentreport(event, context) {
            var query = event.queryParameters;
            var org_id = event.pathParameters.org_id;
            var branch_id = event.pathParameters.branch_id;
            var from_date = query.filter.from_date;
            var to_date = query.filter.to_date;
            validate_data(event)       
            .then(function(_response) {
                debug("validate data ", _response);
                return billingModule.invoicepaymentreport(org_id,branch_id,from_date,to_date, query)
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
        // Report Patient Outstanding Report
        getReportPatientOutstanding(event, context) {
            var query = event.queryParameters;
            var org_id = event.pathParameters.org_id;
            var branch_id = event.pathParameters.branch_id;
            var from_date = query.filter.from_date;
            var to_date = query.filter.to_date;
            validate_data(event)       
            .then(function(_response) {
                debug("validate data ", _response);
                return billingModule.getReportPatientOutstandingList(org_id,branch_id,from_date,to_date, query)
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

        

        // Report Invoice Outstanding Report
        getReportInvoiceOutstanding(event, context) {
           var query = event.queryParameters;
           var org_id = event.pathParameters.org_id;
           var branch_id = event.pathParameters.branch_id;
           var from_date = query.filter.from_date;
           var to_date = query.filter.to_date;
           validate_data(event)       
           .then(function(_response) {
               debug("validate data ", _response);
               return billingModule.getReportInvoiceOutstandingList(org_id,branch_id,from_date,to_date, query)
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
        
        getCollectionWiseReport(event, context) {
            var query = event.queryParameters;
            var org_id = event.pathParameters.org_id;
            var branch_id = event.pathParameters.branch_id;
            var from_date = query.filter.from_date;
            var to_date = query.filter.to_date;
            validate_data(event)       
            .then(function(_response) {
                debug("validate data ", _response);
                return billingModule.getCollectionWiseReportList(org_id,branch_id,from_date,to_date, query)
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

        getKRCCollectionWiseReport(event, context) {
            var query = event.queryParameters;
            var org_id = event.pathParameters.org_id;
            var branch_id = event.pathParameters.branch_id;
            var from_date = query.filter.from_date;
            var to_date = query.filter.to_date;
            validate_data(event)       
            .then(function(_response) {
                debug("validate data ", _response);
                return billingModule.getKRCCollectionWiseReportList(org_id,branch_id,from_date,to_date, query)
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

        getPaymentWiseReport(event, context) {
            var query = event.queryParameters;
            var org_id = event.pathParameters.org_id;
            var branch_id = event.pathParameters.branch_id;
            var from_date = query.filter.from_date;
            var to_date = query.filter.to_date;
            validate_data(event)       
            .then(function(_response) {
                debug("validate data ", _response);
                return billingModule.getPaymentWiseReportList(org_id,branch_id,from_date,to_date, query)
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


        getReceiptPaymentReport(event, context) {
            var query = event.queryParameters;
            var org_id = event.pathParameters.org_id;
            var branch_id = event.pathParameters.branch_id;
            var from_date = query.filter.from_date;
            var to_date = query.filter.to_date;
            validate_data(event)       
            .then(function(_response) {
                debug("validate data ", _response);
                return billingModule.getReceiptPaymentReportList(org_id,branch_id,from_date,to_date, query)
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


        getStockRegisterReport(event, context) {
            var query = event.queryParameters;
            var org_id = event.pathParameters.org_id;
            var branch_id = event.pathParameters.branch_id;
            var from_date = query.filter.from_date;
            var to_date = query.filter.to_date;
            validate_data(event)       
            .then(function(_response) {
                debug("validate data ", _response);
                return billingModule.getStockRegisterReportList(org_id,branch_id,from_date,to_date, query)
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

function validate_data_for_create_billing(appointment_data) {
    return new Promise((resolve, reject) => {
        /* {
    "org_id": "KRC",
    "branch_id": "KRC001",
    "patient_id": "PATKRC00100010",
    "doctor_id": "DOC0001",
    "user_id": "KRC000001",
    "invoice_details": [
        {
            "bu_id": "DIALY",
            "product_id": "PRD00001",
            "product_qty": "1",
            "product_cost": 1500,
            "product_value": 3000,
            "other_charge1": 10,
            "other_charge_remark1": "DAILY",
            "other_charge2": 50,
            "other_charge_remark2": "BILL",
            "other_charge3": 50,
            "other_charge_remark3": "ROOM",
            "gross_inv_amount": 5000,
            "discount1": 500,
            "discount_remark1": "DAILY",
            "discount2": 500,
            "discount_remark2": "BILL",
            "discount3": 100,
            "discount_remark3": "ROOM",
            "gross_discount": 1100,
            "net_amount": 3900,
            "net_paid": 3500,
            "net_balance": 3500
        }
    ]
} */
        return resolve(appointment_data)
    })
}

function validate_data_update_billing(appointment_data) {
    return new Promise((resolve, reject) => {
        debug("appointment_data :", appointment_data)
        return resolve(appointment_data);
    })
}

function validate_data(data) {
    return new Promise((resolve, reject) => {
        return resolve(data);
    })
}

function validate_data_for_create_billing_payment_detail(data) {
    return new Promise((resolve, reject) => {
        return resolve(data);
    })
}
module.exports = {
    BillingAction,
}