const { SendResponse } = require('../../common/app_utils');
const { ConsultingModule } = require('../modules/consulting_module');
var debug = require('debug')('v2:consulting:actions');
const path = require('path');
const fs = require('fs');
var consultModule = new ConsultingModule();
class ConsultAction {

    CreateConsulting(event, context) {      
        var body_data = event.body;
        var query = event.queryParameters;
        validate_data_for_create_consulting(event.body)       
        .then(function(_response) {
            debug("validate data ", _response);
            return consultModule.CreateConsulting(body_data,  query)
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

    CreateDialysisConsulting(event, context) {      
        var body_data = event.body;
        var query = event.queryParameters;
        validate_data_for_create_dialysis_consulting(event.body)       
        .then(function(_response) {
            debug("validate data ", _response);
            return consultModule.CreateDialysisConsulting(body_data,  query)
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

    CreateLabConsulting(event, context) {      
        var body_data = event.body;
        var query = event.queryParameters;
        validate_data_for_create_lab_consulting(event.body)       
        .then(function(_response) {
            debug("validate data ", _response);
            return consultModule.CreateLabConsulting(body_data,  query)
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

    CreatePharmConsulting(event, context) {      
        var body_data = event.body;
        var query = event.queryParameters;
        validate_data_for_create_pharm_consulting(event.body)       
        .then(function(_response) {
            debug("validate data ", _response);
            return consultModule.CreatePharmConsulting(body_data,  query)
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
    
    CreateHealthConsulting(event, context) {      
        var body_data = event.body;
        var query = event.queryParameters;
        validate_data_for_create_health_consulting(event.body)       
        .then(function(_response) {
            debug("validate data ", _response);
            return consultModule.CreateHealthConsulting(body_data,  query)
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

    CreatePatientOptholVisualAcuity(event, context) {      
        var body_data = event.body;
        var query = event.queryParameters;
        validate_data_for_create_pharm_consulting(event.body)       
        .then(function(_response) {
            debug("validate data ", _response);
            return consultModule.CreatePatientOptholVisualAcuity(body_data,  query)
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

    CreatePatientOptholPGP(event, context) {      
        var body_data = event.body;
        var query = event.queryParameters;
        validate_data_for_create_pharm_consulting(event.body)       
        .then(function(_response) {
            debug("validate data ", _response);
            return consultModule.CreatePatientOptholPGP(body_data,  query)
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

    CreatePatientOptholObjrefraction(event, context) {      
        var body_data = event.body;
        var query = event.queryParameters;
        validate_data_for_create_pharm_consulting(event.body)       
        .then(function(_response) {
            debug("validate data ", _response);
            return consultModule.CreatePatientOptholObjrefraction(body_data,  query)
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

    CreatePatientOptholSubjAccept(event, context) {      
        var body_data = event.body;
        var query = event.queryParameters;
        validate_data_for_create_pharm_consulting(event.body)       
        .then(function(_response) {
            debug("validate data ", _response);
            return consultModule.CreatePatientOptholSubjAccept(body_data,  query)
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
    
    CreatePatientOptholExamination(event, context) {      
        var body_data = event.body;
        var query = event.queryParameters;
        validate_data_for_create_pharm_consulting(event.body)       
        .then(function(_response) {
            debug("validate data ", _response);
            return consultModule.CreatePatientOptholExamination(body_data,  query)
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
    
    CreatePatientIntraocularpressure(event, context) {      
        var body_data = event.body;
        var query = event.queryParameters;
        validate_data_for_create_pharm_consulting(event.body)       
        .then(function(_response) {
            debug("validate data ", _response);
            return consultModule.CreatePatientOptholIntraocularpressure(body_data,  query)
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
    CreatePatientDiagadvise(event, context) {      
        var body_data = event.body;
        var query = event.queryParameters;
        validate_data_for_create_pharm_consulting(event.body)       
        .then(function(_response) {
            debug("validate data ", _response);
            return consultModule.CreatePatientOptholDiagadvise(body_data,  query)
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

    CreatePatientImagestorage(event, context) {      
        var body_data = event.body;
        var query = event.queryParameters;
        validate_data_for_create_pharm_consulting(event.body)       
        .then(function(_response) {
            debug("validate data ", _response);
            return consultModule.CreatePatientOptholImagestorage(body_data,  query)
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
    

    CreatePatientGlassprescription(event, context) {      
        var body_data = event.body;
        var query = event.queryParameters;
        validate_data_for_create_pharm_consulting(event.body)       
        .then(function(_response) {
            debug("validate data ", _response);
            return consultModule.CreatePatientOptholGlassprescription(body_data,  query)
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


    UploadImagetoLocal(event,req, context) {      
        var body_data = event.body;
        var query = event.queryParameters;
        //console.log("req.file", req.body.org_id, req.body.branch_id, req.body.patient_id)
     
        validate_data_for_create_pharm_consulting(event.body,req)       
        .then(function(_response) {
            debug("validate data ", _response);
            return consultModule.UploadImagetoLocal(body_data,req,  query)
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



    
    

    GetConsultingListsByBranchId(event, context) {      
        var branch_id = event.pathParameters.branch_id;
        var query = event.queryParameters;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return consultModule.GetConsultingListsByBranchId(branch_id,  query)
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

    GetConsultingListsByOrgId(event, context) {      
        var org_id = event.pathParameters.org_id;
        var query = event.queryParameters;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return consultModule.GetConsultingListsByOrgId(org_id,  query)
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

    GetConsultingDetail(event, context) {      
        var visit_no = event.pathParameters.visit_no;
        var query = event.queryParameters;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return consultModule.GetConsultingDetail(visit_no,  query)
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

    getPatientDialysisList(event, context) {
        var query = event.queryParameters;
        var patient_id = event.pathParameters.patient_id;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return consultModule.getPatientDialysisLists(patient_id,  query)
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

    getPatientLabLists(event, context) {
        var query = event.queryParameters;
        var patient_id = event.pathParameters.patient_id;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return consultModule.getPatientLabLists(patient_id,  query)
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

    
    getoptholvisualacuityLists(event, context) {
        var query = event.queryParameters;
        var patient_id = event.pathParameters.patient_id;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return consultModule.getoptholvisualacuityLists(patient_id,  query)
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
    getoptholpgpLists(event, context) {
        var query = event.queryParameters;
        var patient_id = event.pathParameters.patient_id;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return consultModule.getoptholpgpLists(patient_id,  query)
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
    
    getoptholobjrefractionLists(event, context) {
        var query = event.queryParameters;
        var patient_id = event.pathParameters.patient_id;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return consultModule.getoptholobjrefractionLists(patient_id,  query)
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
    getoptholsubacceptLists(event, context) {
        var query = event.queryParameters;
        var patient_id = event.pathParameters.patient_id;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return consultModule.getoptholsubacceptLists(patient_id,  query)
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
    

    getoptholexaminationLists(event, context) {
        var query = event.queryParameters;
        var patient_id = event.pathParameters.patient_id;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return consultModule.getoptholexaminationLists(patient_id,  query)
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

    getoptholintraocularpressureLists(event, context) {
        var query = event.queryParameters;
        var patient_id = event.pathParameters.patient_id;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return consultModule.getoptholintraocularpressureLists(patient_id,  query)
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
    getoptholdiagadviseLists(event, context) {
        var query = event.queryParameters;
        var patient_id = event.pathParameters.patient_id;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return consultModule.getoptholdiagadviseLists(patient_id,  query)
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
    getoptholimagestorageLists(event, context) {
        var query = event.queryParameters;
        var patient_id = event.pathParameters.patient_id;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return consultModule.getoptholimagestorageLists(patient_id,  query)
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

    getoptholglassprescriptionLists(event, context) {
        var query = event.queryParameters;
        var patient_id = event.pathParameters.patient_id;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return consultModule.getoptholglassprescriptionLists(patient_id,  query)
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

    getPatientPharmLists(event, context) {
        var query = event.queryParameters;
        var patient_id = event.pathParameters.patient_id;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return consultModule.getPatientPharmLists(patient_id,  query)
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

    getPatientPharmaLists(event, context) {
        var query = event.queryParameters;
        var patient_id = event.pathParameters.patient_id;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return consultModule.getPatientPharmaLists(patient_id,  query)
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
    
    getPatientHealthLists(event, context) {
        var query = event.queryParameters;
        var patient_id = event.pathParameters.patient_id;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return consultModule.getPatientHealthLists(patient_id,  query)
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

    
    allvisithealthparamInformation(event, context) {
        var query = event.queryParameters;
        var org_id = event.pathParameters.org_id;
        var branch_id = event.pathParameters.branch_id;       
        var patient_id = event.pathParameters.patient_id;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return consultModule.allvisithealthparamInformation(org_id, branch_id,patient_id,  query)
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

    allvisitlabInformation(event, context) {
        var query = event.queryParameters;
        var org_id = event.pathParameters.org_id;
        var branch_id = event.pathParameters.branch_id;       
        var patient_id = event.pathParameters.patient_id;
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return consultModule.allvisitlabInformation(org_id, branch_id,patient_id,  query)
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
    


    petconsultdetail(event, context) {
        var query = event.queryParameters;
        var org_id = event.pathParameters.org_id;
        var branch_id = event.pathParameters.branch_id;       
        var patient_id = event.pathParameters.patient_id;
        
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return consultModule.petconsultdetail(org_id, branch_id,patient_id,  query)
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

    petlist(event, context) {
        var query = event.queryParameters;
        var org_id = event.pathParameters.org_id;
        var branch_id = event.pathParameters.branch_id;       
        var patient_id = event.pathParameters.patient_id;
        
        validate_data(event)       
        .then(function(_response) {
            debug("validate data ", _response);
            return consultModule.petlist(org_id, branch_id,patient_id,  query)
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

    CreatepetConsulting(event, context) {      
        var body_data = event.body;
        var query = event.queryParameters;
        validate_data(event.body)       
        .then(function(_response) {
            debug("validate data ", _response);
            return consultModule.CreatepetConsulting(body_data,  query)
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




pettreatmentlist(event, context) {
    var query = event.queryParameters;
    var org_id = event.pathParameters.org_id;
    var branch_id = event.pathParameters.branch_id;       
    var patient_id = event.pathParameters.patient_id;
    
    validate_data(event)       
    .then(function(_response) {
        debug("validate data ", _response);
        return consultModule.pettreatmentlist(org_id, branch_id,patient_id,  query)
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
petdiagnosislist(event, context) {
    var query = event.queryParameters;
    var org_id = event.pathParameters.org_id;
    var branch_id = event.pathParameters.branch_id;       
    var patient_id = event.pathParameters.patient_id;
    
    validate_data(event)       
    .then(function(_response) {
        debug("validate data ", _response);
        return consultModule.petdiagnosislist(org_id, branch_id,patient_id,  query)
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

CreatepetDiagnosis(event, context) {      
        var body_data = event.body;
        var query = event.queryParameters;
        validate_data(event.body)       
        .then(function(_response) {
            debug("validate data ", _response);
            return consultModule.CreatepetDiagnosis(body_data,  query)
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

    CreatepetTreatment(event, context) {      
        var body_data = event.body;
        var query = event.queryParameters;
        validate_data(event.body)       
        .then(function(_response) {
            debug("validate data ", _response);
            return consultModule.CreatepetTreatment(body_data,  query)
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

   async getUploadImage(event, context) {
        var query = event.queryParameters;
      
        var patient_id = event.pathParameters.patient_id;
        
        await image_require(patient_id,query.filter.file_name)       
        
        .then(function(response){
            
            context.done(null, SendResponse(200, response));
        })
        .catch(function(err){
            context.done(null, SendResponse(500, err));
        })
    }


  
}


function validate_data_for_create_consulting(consulting_data) {
    return new Promise((resolve, reject) => {
        return resolve(consulting_data)
    })
}

function validate_data_for_create_dialysis_consulting(dialysis_consulting_data) {
    return new Promise((resolve, reject) => {
        return resolve(dialysis_consulting_data)
    })
}

function validate_data_for_create_lab_consulting(lab_consulting_data) {
    return new Promise((resolve, reject) => {
        return resolve(lab_consulting_data)
    })
}

function validate_data_for_create_pharm_consulting(pharm_consulting_data) {
    return new Promise((resolve, reject) => {
        return resolve(pharm_consulting_data)
    })
}

function validate_data_for_create_health_consulting(health_consulting_data) {
    return new Promise((resolve, reject) => {
        return resolve(health_consulting_data)
    })
}

function validate_data(data) {
    return new Promise((resolve, reject) => {
        return resolve(data);
    })
}


function image_require(patient_id,file_name) {
    return new Promise(async(resolve, reject) => {
        var return_value={image_url:null};
        var dir=process.env.LOCAL_DIR;
        let folderName = `${patient_id}/${file_name}`;    
        let image_url=dir+"/"+folderName;
        debug("image_require data ", dir);    
        await fs.exists(path.join(dir, folderName), exists => { 
            console.log("Exists", exists)
            if(!exists) {
                debug("Not Exist ", dir);   
              return resolve(return_value)
            }else{
                return_value={image_url:image_url};
                //return_value["iamge_url"]=`${image_url}`
                    
                debug("Exist ", return_value);   
              return resolve(return_value)
            }
          });
       
    })
}
module.exports = {
    ConsultAction,
}

