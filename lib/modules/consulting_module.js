const { ConsultDao } = require('../dao/consulting_dao');
var debug = require('debug')('v2:consulting:module');
const {changeLog} = require('../../common/error_handling');
var moment = require('moment-timezone');
const { GetRandomPatientID } = require('../../common/app_utils');
const { PatientDao } = require('../dao/patient_dao');
//New upload image
//app.use(bodyParser.json({ limit: '100mb' }));
//clearapp.use(bodyParser.urlencoded({ limit: '100mb', extended: true, parameterLimit: 500000 }));
const path = require('path');
const mkdirp = require('mkdirp');
const fs = require('fs');
//end upload image
function generateParamString(query) {
    var key;
    var keys = new Array();
    var values = new Array();

    for (key in query.filter) {
        if (query.filter.hasOwnProperty(key)) {
            keys.push(key);
            values.push(query.filter[key])
        }
    }
    var strParams = '';

    for (i = 0; i < keys.length; i++) {
        var str = (keys.length - 1 != i) ? ' && ' : '';
        strParams += keys[i] + '=' + values[i] + str

    }
    // console.log('Parameters for query :',strParams)
    return strParams;
}

function generateSortOrder(query) {
    var key;
    var keys = new Array();
    var values = new Array();

    for (key in query.sort) {
        if (query.sort.hasOwnProperty(key)) {
            keys.push(key);
            values.push(query.sort[key])
        }
    }
    var strSortParams = ' ORDER BY ';

    for (i = 0; i < keys.length; i++) {
        var order = (values[i] == '-1') ? 'DESC' : 'ASC';
        var str = (keys.length - 1 != i) ? ', ' : '';
        strSortParams += keys[i] + ' ' + order + str
    }

    // console.log('Parameters for Sorting :',strSortParams)
    return strSortParams;
}

class ConsultingModule {

    CreateConsulting(data,  query) {
        return new Promise(async (resolve, reject) => {
            var consultDao = new ConsultDao();
            var read_connection = null;
            var get_consult, consulting_header_data, set_pat_consultheader_data;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            try {
                read_connection = await consultDao.getReadConnection();
                get_consult = await consultDao.getConsultingDialysis(read_connection, data.visit_no, data.patient_id);
                if(get_consult.hasOwnProperty('status') && get_consult.status == 404) {
                    set_pat_consultheader_data = await categories_data_to_schema_consult_header_data_to_create(read_connection, data, date);
                    consulting_header_data = await consultDao.createConsultingHeader(read_connection, set_pat_consultheader_data);  
                    await patientPetConsultHeader(read_connection, data, date, consulting_header_data);
                    if (read_connection) {
                        await consultDao.releaseReadConnection(read_connection);
                    }
                    return resolve(consulting_header_data);
                }
                else{
                    set_pat_consultheader_data = await categories_data_to_schema_consult_header_data_to_update(read_connection, data, date);
                    consulting_header_data = await consultDao.updateConsultingHeader(read_connection, set_pat_consultheader_data);         
                    await patientPetConsultHeader(read_connection, data, date, consulting_header_data);
                    if (read_connection) {
                        await consultDao.releaseReadConnection(read_connection);
                    }
                    return resolve(consulting_header_data);
                }

               
            }
            catch (error) {
                debug("error", error)
                if (read_connection) {
                    await consultDao.releaseReadConnection(read_connection);
                }
                return reject(error)
            }
        })
    }

    CreateDialysisConsulting(data,  query) {
        return new Promise(async (resolve, reject) => {
            var consultDao = new ConsultDao();
            var read_connection = null;
            var get_consult, consulting_dialysis_data, set_pat_dialysis_consult_data;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            try {
                read_connection = await consultDao.getReadConnection();
                get_consult = await consultDao.getConsultingDialysis(read_connection, data.visit_no, data.patient_id);
                if(get_consult.hasOwnProperty('status') && get_consult.status == 404) {
                    set_pat_dialysis_consult_data = await categories_data_to_schema_dialysis_consult_data_to_create(read_connection, data, date);
                    consulting_dialysis_data = await consultDao.createDialysisConsulting(read_connection, set_pat_dialysis_consult_data);
                    if (read_connection) {
                        await consultDao.releaseReadConnection(read_connection);
                    }
                    return resolve(consulting_dialysis_data);
                }
                else{
                    set_pat_dialysis_consult_data = await categories_data_to_schema_dialysis_consult_data_to_update(read_connection, data, date, get_consult);
                    consulting_dialysis_data = await consultDao.updateDialysisConsulting(read_connection, set_pat_dialysis_consult_data, get_consult);
                    if (read_connection) {
                        await consultDao.releaseReadConnection(read_connection);
                    }
                    return resolve(consulting_dialysis_data);
                }
            }
            catch (error) {
                debug("error", error)
                if (read_connection) {
                    await consultDao.releaseReadConnection(read_connection);
                }
                return reject(error)
            }
        })
    }

    CreateLabConsulting(data,  query) {
        return new Promise(async (resolve, reject) => {
            var consultDao = new ConsultDao();
            var read_connection = null;
            var get_consult, consulting_lab_data, set_pat_lab_consult_data;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            var succes_data = 'Y';
            var lab_results = [];
            try {
                read_connection = await consultDao.getReadConnection();
                for(var i in data.lab_lists) {
                    var lab_data = data.lab_lists[i];
                    get_consult = await consultDao.getConsultingLabPatient(read_connection, data.visit_no, data.patient_id, lab_data.test_id);
                    if(get_consult.hasOwnProperty('status') && get_consult.status == 404) {
                        debug("Get consult", get_consult);
                        set_pat_lab_consult_data = await categories_data_to_schema_lab_consult_data_to_create(read_connection, data, date, lab_data);
                        consulting_lab_data = await consultDao.createLabConsulting(read_connection, set_pat_lab_consult_data);
                        lab_results.push(set_pat_lab_consult_data);

                        // Push
                        set_pat_lab_consult_data = await categories_data_to_schema_lab_consultancy_billing_push_to_create(read_connection, data, date, lab_data);
                        consulting_lab_data = await consultDao.createPharmConsultingPush(read_connection, set_pat_lab_consult_data);

                    }
                    else{
                        debug("Get new consult", get_consult);
                        set_pat_lab_consult_data = await categories_data_to_schema_lab_consult_data_to_update(date, get_consult, lab_data);
                        consulting_lab_data = await consultDao.updateLabConsulting(read_connection, set_pat_lab_consult_data, get_consult);
                        lab_results.push(get_consult);
                    }
                }
                if (read_connection) {
                    await consultDao.releaseReadConnection(read_connection);
                }
                return resolve({results: lab_results})
            }
            catch (error) {
                debug("error", error)
                if (read_connection) {
                    await consultDao.releaseReadConnection(read_connection);
                }
                return reject(error)
            }
        })
    }

    CreateHealthConsulting(data,  query) {
        return new Promise(async (resolve, reject) => {
            var consultDao = new ConsultDao();
            var read_connection = null;
            var get_consult, consulting_health_data, set_pat_health_consult_data;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            var succes_data = 'Y';
            var health_results = [];
            try {
                read_connection = await consultDao.getReadConnection();
                for(var i in data.health_lists) {
                    var health_data = data.health_lists[i];
                    get_consult = await consultDao.getConsultingHealthPatient(read_connection, data.visit_no, data.patient_id, health_data.khi_code);
                    if(get_consult.hasOwnProperty('status') && get_consult.status == 404) {
                        debug("Get consult", get_consult);
                        set_pat_health_consult_data = await categories_data_to_schema_health_consult_data_to_create(read_connection, data, date, health_data);
                        consulting_health_data = await consultDao.createHealthConsulting(read_connection, set_pat_health_consult_data);
                        health_results.push(set_pat_health_consult_data);
                    }
                    else{
                        debug("Get new consult", get_consult);
                        set_pat_health_consult_data = await categories_data_to_schema_health_consult_data_to_update(date, get_consult, health_data);
                        consulting_health_data = await consultDao.updateHealthConsulting(read_connection, set_pat_health_consult_data, get_consult);
                        health_results.push(get_consult);
                    }
                }
                if (read_connection) {
                    await consultDao.releaseReadConnection(read_connection);
                }
                return resolve({results: health_results})
            }
            catch (error) {
                debug("error", error)
                if (read_connection) {
                    await consultDao.releaseReadConnection(read_connection);
                }
                return reject(error)
            }
        })
    }



    CreatePharmConsulting(data,  query) {
        return new Promise(async (resolve, reject) => {
            var consultDao = new ConsultDao();
            var read_connection = null;
            var get_consult, consulting_pharm_data,consulting_pharm_push_data, set_pat_pharm_consult_data, set_pat_pharm_consult_push;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            var succes_data = 'Y';
            var pharm_results = [];
            try {
                read_connection = await consultDao.getReadConnection();
                for(var i in data.pharm_lists) {
                    var pharm_data = data.pharm_lists[i];
                    get_consult = await consultDao.getConsultingPharmPatient(read_connection, data.visit_no, data.patient_id, pharm_data.medicine_id);
                    if(get_consult.hasOwnProperty('status') && get_consult.status == 404) {
                        debug("Get consult", get_consult);
                        set_pat_pharm_consult_data = await categories_data_to_schema_pharm_consult_data_to_create(read_connection, data, date, pharm_data);
                        consulting_pharm_data = await consultDao.createPharmConsulting(read_connection, set_pat_pharm_consult_data);
                        pharm_results.push(set_pat_pharm_consult_data);
                        // Push
                        set_pat_pharm_consult_push = await categories_data_to_schema_pharm_consultancy_billing_push_to_create(read_connection, data, date, pharm_data);
                        consulting_pharm_push_data = await consultDao.createPharmConsultingPush(read_connection, set_pat_pharm_consult_push);
                    }
                    else{
                        debug("Get new consult", get_consult);
                        set_pat_pharm_consult_data = await categories_data_to_schema_pharm_consult_data_to_update(date, get_consult, pharm_data);
                        consulting_pharm_data = await consultDao.updatePharmConsulting(read_connection, set_pat_pharm_consult_data, get_consult);
                        pharm_results.push(get_consult);
                    }
                }
                if (read_connection) {
                    await consultDao.releaseReadConnection(read_connection);
                }
                return resolve({results: pharm_results})
            }
            catch (error) {
                debug("error", error)
                if (read_connection) {
                    await consultDao.releaseReadConnection(read_connection);
                }
                return reject(error)
            }
        })
    }

    //Patient_Opthol_Visual_Acuity
    CreatePatientOptholVisualAcuity(data,  query) {
        return new Promise(async (resolve, reject) => {
            var consultDao = new ConsultDao();
            var read_connection = null;
            var get_consult, set_pat_opthol_visual_acuity_data;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            try {
                read_connection = await consultDao.getReadConnection();
                get_consult = await consultDao.getCreatePatientOptholVisualAcuity(read_connection, data.org_id, data.branch_id, data.visit_no, data.patient_id);
                if(get_consult.hasOwnProperty('status') && get_consult.status == 404) {
                    debug("Get consult", get_consult);
                    set_pat_opthol_visual_acuity_data = await categories_data_to_schema_create_patient_opthol_visual_acuity_data_to_create(read_connection, data, date);
                    await consultDao.createPatientOptholVisualAcuity(read_connection, set_pat_opthol_visual_acuity_data);
                    if (read_connection) {
                        await consultDao.releaseReadConnection(read_connection);
                    }
                    return resolve(data)
                }
                else{
                    debug("Get new consult", get_consult);
                    set_pat_opthol_visual_acuity_data = await categories_data_to_schema_create_patient_opthol_visual_acuity_data_to_update(date, get_consult, data);
                    await consultDao.updatePatientOptholVisualAcuity(read_connection, set_pat_opthol_visual_acuity_data, get_consult);                  
                    if (read_connection) {
                        await consultDao.releaseReadConnection(read_connection);
                    }
                    return resolve(data) 
                }
            }
            catch (error) {
                debug("error", error)
                if (read_connection) {
                    await consultDao.releaseReadConnection(read_connection);
                }
                return reject(error)
            }
        })
    }

    CreatePatientOptholPGP(data,  query) {
        return new Promise(async (resolve, reject) => {
            var consultDao = new ConsultDao();
            var read_connection = null;
            var get_consult, set_pat_opthol_pgp_data;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            try {
                read_connection = await consultDao.getReadConnection();
                get_consult = await consultDao.getCreatePatientOptholPGP(read_connection, data.org_id, data.branch_id, data.visit_no, data.patient_id);
                if(get_consult.hasOwnProperty('status') && get_consult.status == 404) {
                    debug("Get consult", get_consult);
                    set_pat_opthol_pgp_data = await categories_data_to_schema_create_patient_opthol_pgp_data_to_create(read_connection, data, date);
                    await consultDao.createPatientOptholPGP(read_connection, set_pat_opthol_pgp_data);
                    if (read_connection) {
                        await consultDao.releaseReadConnection(read_connection);
                    }
                    return resolve(data)
                }
                else{
                    debug("Get new consult", get_consult);
                    set_pat_opthol_pgp_data = await categories_data_to_schema_create_patient_opthol_pgp_data_to_update(date, get_consult, data);
                    await consultDao.updatePatientOptholPGP(read_connection, set_pat_opthol_pgp_data, get_consult);
                    if (read_connection) {
                        await consultDao.releaseReadConnection(read_connection);
                    }
                    return resolve(data)
                }
            }
            catch (error) {
                debug("error", error)
                if (read_connection) {
                    await consultDao.releaseReadConnection(read_connection);
                }
                return reject(error)
            }
        })
    }

    CreatePatientOptholObjrefraction(data,  query) {
        return new Promise(async (resolve, reject) => {
            var consultDao = new ConsultDao();
            var read_connection = null;
            var get_consult, set_pat_opthol_obj_refraction_data;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            try {
                read_connection = await consultDao.getReadConnection();
                get_consult = await consultDao.getCreatePatientOptholObjrefraction(read_connection, data.org_id, data.branch_id, data.visit_no, data.patient_id);
                if(get_consult.hasOwnProperty('status') && get_consult.status == 404) {
                    debug("Get consult", get_consult);
                    set_pat_opthol_obj_refraction_data = await categories_data_to_schema_create_patient_opthol_obj_refraction_data_to_create(read_connection, data, date);
                    await consultDao.createPatientOptholObjrefraction(read_connection, set_pat_opthol_obj_refraction_data);
                    if (read_connection) {
                        await consultDao.releaseReadConnection(read_connection);
                    }
                    return resolve(data)
                }
                else{
                    debug("Get new consult", get_consult);
                    set_pat_opthol_obj_refraction_data = await categories_data_to_schema_create_patient_opthol_obj_refraction_data_to_update(date, get_consult, data);
                    await consultDao.updatePatientOptholObjrefraction(read_connection, set_pat_opthol_obj_refraction_data, get_consult);
                    if (read_connection) {
                       await consultDao.releaseReadConnection(read_connection);
                    }
                    return resolve(data)
                }
            }
            catch (error) {
                debug("error", error)
                if (read_connection) {
                    await consultDao.releaseReadConnection(read_connection);
                }
                return reject(error)
            }
        })
    }

    CreatePatientOptholSubjAccept(data,  query) {
        return new Promise(async (resolve, reject) => {
            var consultDao = new ConsultDao();
            var read_connection = null;
            var get_consult, set_pat_opthol_sub_acct_data;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            try {
                read_connection = await consultDao.getReadConnection();
                get_consult = await consultDao.getCreatePatientOptholSubjAccept(read_connection, data.org_id, data.branch_id, data.visit_no, data.patient_id);
                if(get_consult.hasOwnProperty('status') && get_consult.status == 404) {
                    debug("Get consult", get_consult);
                    set_pat_opthol_sub_acct_data = await categories_data_to_schema_create_patient_opthol_sub_accept_data_to_create(read_connection, data, date);
                    await consultDao.createPatientOptholSubjAccept(read_connection, set_pat_opthol_sub_acct_data);
                    if (read_connection) {
                        await consultDao.releaseReadConnection(read_connection);
                    }
                    return resolve(data)
                }
                else{
                    debug("Get new consult", get_consult);
                    set_pat_opthol_sub_acct_data = await categories_data_to_schema_create_patient_opthol_sub_accept_data_to_update(date, get_consult, data);
                    await consultDao.updatePatientOptholSubjAccept(read_connection, set_pat_opthol_sub_acct_data, get_consult);
                    if (read_connection) {
                        await consultDao.releaseReadConnection(read_connection);
                    }
                    return resolve(data)
                }
            }
            catch (error) {
                debug("error", error)
                if (read_connection) {
                    await consultDao.releaseReadConnection(read_connection);
                }
                return reject(error)
            }
        })
    }

    CreatePatientOptholExamination(data,  query) {
        return new Promise(async (resolve, reject) => {
            var consultDao = new ConsultDao();
            var read_connection = null;
            var get_consult, set_pat_opthol_examination_data;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            try {
                read_connection = await consultDao.getReadConnection();
                get_consult = await consultDao.getPatientOptholExamination(read_connection, data.org_id, data.branch_id, data.visit_no, data.patient_id);
                if(get_consult.hasOwnProperty('status') && get_consult.status == 404) {
                    debug("Get consult", get_consult);
                    set_pat_opthol_examination_data = await categories_data_to_schema_create_patient_opthol_examination_data_to_create(read_connection, data, date);
                    await consultDao.createPatientOptholExamination(read_connection, set_pat_opthol_examination_data);
                    if (read_connection) {
                        await consultDao.releaseReadConnection(read_connection);
                    }
                    return resolve(data)
                }
                else{
                    debug("Get new consult", get_consult);
                    set_pat_opthol_examination_data = await categories_data_to_schema_create_patient_opthol__examination_data_to_update(date, get_consult, data);
                    await consultDao.updatePatientOptholExamination(read_connection, set_pat_opthol_examination_data, get_consult);
                    if (read_connection) {
                        await consultDao.releaseReadConnection(read_connection);
                    }
                    return resolve(data)
                }
            }
            catch (error) {
                debug("error", error)
                if (read_connection) {
                    await consultDao.releaseReadConnection(read_connection);
                }
                return reject(error)
            }
        })
    }

    CreatePatientOptholIntraocularpressure(reqdata,  query) {
        return new Promise(async (resolve, reject) => {
            var consultDao = new ConsultDao();
            var read_connection = null;
            var get_consult, set_pat_opthol_intraocularpressure_data;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            try {
                read_connection = await consultDao.getReadConnection();
                for(var i in reqdata.iop_data) {
                    var data = reqdata.iop_data[i];
                    get_consult = await consultDao.getPatientOptholIntraocularpressure(read_connection, data.org_id, data.branch_id, data.visit_no, data.patient_id,data.seq_no);
                    if(get_consult.hasOwnProperty('status') && get_consult.status == 404) {
                        debug("Get new consult", get_consult);
                        set_pat_opthol_intraocularpressure_data = await categories_data_to_schema_create_patient_opthol_intraocularpressure_data_to_create(read_connection, data, date);
                        await consultDao.createPatientOptholIntraocularpressure(read_connection, set_pat_opthol_intraocularpressure_data);
                    }
                    else{
                        debug("Get consult", get_consult);
                        set_pat_opthol_intraocularpressure_data = await categories_data_to_schema_create_patient_opthol_intraocularpressure_data_to_update(date, get_consult, data);
                        await consultDao.updatePatientOptholIntraocularpressure(read_connection, set_pat_opthol_intraocularpressure_data, get_consult);
                    }
                }
                if (read_connection) {
                    await consultDao.releaseReadConnection(read_connection);
                }
                return resolve(reqdata)
            }
            catch (error) {
                debug("error", error)
                if (read_connection) {
                    await consultDao.releaseReadConnection(read_connection);
                }
                return reject(error)
            }
        })
    }

    CreatePatientOptholDiagadvise(data,  query) {
        return new Promise(async (resolve, reject) => {
            var consultDao = new ConsultDao();
            var read_connection = null;
            var get_consult, set_pat_opthol_intraocularpressure_data;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            try {
                read_connection = await consultDao.getReadConnection();
                get_consult = await consultDao.getPatientOptholDiagadvise(read_connection, data.org_id, data.branch_id, data.visit_no, data.patient_id);
                if(get_consult.hasOwnProperty('status') && get_consult.status == 404) {
                    debug("Get consult", get_consult);
                    set_pat_opthol_intraocularpressure_data = await categories_data_to_schema_create_patient_opthol_diag_advise_data_to_create(read_connection, data, date);
                    await consultDao.createPatientOptholDiagadvise(read_connection, set_pat_opthol_intraocularpressure_data);
                    if (read_connection) {
                        await consultDao.releaseReadConnection(read_connection);
                    }
                    return resolve(data)
                }
                else{
                    debug("Get new consult", get_consult);
                    set_pat_opthol_intraocularpressure_data = await categories_data_to_schema_create_patient_opthol_diag_advise_data_to_update(date, get_consult, data);
                    await consultDao.updatePatientOptholDiagadvise(read_connection, set_pat_opthol_intraocularpressure_data, get_consult);
                    if (read_connection) {
                        await consultDao.releaseReadConnection(read_connection);
                    }
                    return resolve(data)
                }
            }
            catch (error) {
                debug("error", error)
                if (read_connection) {
                    await consultDao.releaseReadConnection(read_connection);
                }
                return reject(error)
            }
        })
    }

    CreatePatientOptholImagestorage(data,  query) {
        return new Promise(async (resolve, reject) => {
            var consultDao = new ConsultDao();
            var read_connection = null;
            var get_consult, set_pat_opthol_imagestorage_data;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            try {
                read_connection = await consultDao.getReadConnection();
                get_consult = await consultDao.getPatientOptholImagestorage(read_connection, data.org_id, data.branch_id, data.visit_no, data.patient_id);
                if(get_consult.hasOwnProperty('status') && get_consult.status == 404) {
                    debug("Get consult", get_consult);
                    set_pat_opthol_imagestorage_data = await categories_data_to_schema_create_patient_opthol_imagestorage_data_to_create(read_connection, data, date);
                    await consultDao.createPatientOptholImagestorage(read_connection, set_pat_opthol_imagestorage_data);
                    if (read_connection) {
                        await consultDao.releaseReadConnection(read_connection);
                    }
                    return resolve(data)
                }
                else{
                    debug("Get new consult", get_consult);
                    set_pat_opthol_imagestorage_data = await categories_data_to_schema_create_patient_opthol_imagestorage_data_to_update(date, get_consult, data);
                    await consultDao.updatePatientOptholImagestorage(read_connection, set_pat_opthol_imagestorage_data, get_consult);
                    if (read_connection) {
                        await consultDao.releaseReadConnection(read_connection);
                    }
                    return resolve(data)
                }
            }
            catch (error) {
                debug("error", error)
                if (read_connection) {
                    await consultDao.releaseReadConnection(read_connection);
                }
                return reject(error)
            }
        })
    }

    CreatePatientOptholGlassprescription(data,  query) {
        return new Promise(async (resolve, reject) => {
            var consultDao = new ConsultDao();
            var read_connection = null;
            var get_consult, set_pat_opthol_imagestorage_data;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            try {
                read_connection = await consultDao.getReadConnection();
                get_consult = await consultDao.getPatientOptholGlassprescription(read_connection, data.org_id, data.branch_id, data.visit_no, data.patient_id);
                if(get_consult.hasOwnProperty('status') && get_consult.status == 404) {
                    debug("Get consult", get_consult);
                    set_pat_opthol_imagestorage_data = await categories_data_to_schema_create_patient_opthol_glass_prescription_data_to_create(read_connection, data, date);
                    await consultDao.createPatientOptholGlassprescription(read_connection, set_pat_opthol_imagestorage_data);
                    if (read_connection) {
                        await consultDao.releaseReadConnection(read_connection);
                    }
                    return resolve(data)
                }
                else{
                    debug("Get new consult", get_consult);
                    set_pat_opthol_imagestorage_data = await categories_data_to_schema_create_patient_opthol_glass_prescription_data_to_update(date, get_consult, data);
                    await consultDao.updatePatientOptholGlassprescription(read_connection, set_pat_opthol_imagestorage_data, get_consult);
                    if (read_connection) {
                        await consultDao.releaseReadConnection(read_connection);
                    }
                    return resolve(data)
                }
            }
            catch (error) {
                debug("error", error)
                if (read_connection) {
                    await consultDao.releaseReadConnection(read_connection);
                }
                return reject(error)
            }
        })
    }
    


    UploadImagetoLocal(data, req, query) {
        return new Promise(async (resolve, reject) => {
            var consultDao = new ConsultDao();
            var read_connection = null;
            var get_consult, set_upload_image_data;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            try {
              var base_dir;
              var dir;
              var front_end_dir = './assets/consult-images';
              read_connection = await consultDao.getReadConnection();
              var org_data=await consultDao.getBasePath(read_connection,data.org_id);
              if(org_data.hasOwnProperty('status') && org_data.status == 404) {
              }else{              
                base_dir=org_data[0].base_dir_path;
                dir=base_dir+"/assets/consult-images";
                
              }
                //console.log(req.file)
                const imageData = req.file.buffer
                let folderName = `${req.body.patient_id}/`;
                //Designation folder /Users/apple/Desktop/ram/assets
                fs.exists(path.join(dir, folderName), exists => { 
                 
                  if(!exists) {
                    mkdirp.sync(path.join(dir, folderName), true); 
                  }
                });
                const localPath = path.join(`${dir}/${folderName}`, req.file.originalname);
                setTimeout(function(){
                fs.writeFile(localPath, imageData, async(err) => {
                  if (err) {
                    console.error('Error writing image to local file:', err);
                    if (read_connection) {
                        await consultDao.releaseReadConnection(read_connection);
                    }
                    return reject(err);
                  } else {
                                        
                  }
                });
            }, 1000);
  
            var filepath=`${front_end_dir}/${folderName}${req.file.originalname}`
           
            if(data.eye == 'R'){
                data["image_re_path"] = filepath;
            }else{
                data["image_le_path"] = filepath;
            }
            get_consult = await consultDao.getUploadImage(read_connection, data.org_id, data.branch_id, data.visit_no, data.patient_id, data.dept_id, data.column_name_seq_no, data.sub_heading_seq_no, data.heading_seq_no);
            if(get_consult.hasOwnProperty('status') && get_consult.status == 404) {
           
                 set_upload_image_data = await categories_data_to_schema_create_upload_image(read_connection, data);
                await consultDao.createUploadImage(read_connection, set_upload_image_data);
                if (read_connection) {
                    await consultDao.releaseReadConnection(read_connection);
                }
                return resolve(set_upload_image_data);
            }else{
                set_upload_image_data = await categories_data_to_schema_update_upload_image(date, get_consult, data,filepath);
                    await consultDao.updateUploadImage(read_connection, set_upload_image_data, get_consult);
                    if (read_connection) {
                        await consultDao.releaseReadConnection(read_connection);
                    }
                    return resolve(set_upload_image_data)
            }
                
            }
            catch (error) {
                debug("error", error)
                if (read_connection) {
                    await consultDao.releaseReadConnection(read_connection);
                }
                return reject(error)
            }
        })
    }

    GetConsultingDetail(visit_no, query) {
        return new Promise(async(resolve, reject) => {
            var consultDao = new ConsultDao();
            var connection = null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD HH:mm:ss");
            var get_consult;
            
            try {
                connection = await consultDao.getReadConnection();
                get_consult = await consultDao.getConsultingHead(connection, visit_no);
                if(get_consult.hasOwnProperty('status') && get_consult.status == 404) {
                    if (connection) {
                        await consultDao.releaseReadConnection(connection);
                    }
                    return resolve(get_consult);
                }
                else{
                    /* var get_dialysis_consult_data = await consultDao.getDialysisConsultData(connection, visit_no, get_consult.patient_id);
                    get_consult['dialysis_consult_data'] = get_dialysis_consult_data; */
                    if (connection) {
                        await consultDao.releaseReadConnection(connection);
                    }
                    return resolve(get_consult)
                }
            }
            catch(error) {
                if (connection) {
                    await consultDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }

    GetConsultingListsByBranchId(branch_id, query) {
        return new Promise(async(resolve, reject) => {
            var consultDao = new ConsultDao();
            var connection = null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD HH:mm:ss");
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
            var get_consults, get_consults_count;
            try {
                connection = await consultDao.getReadConnection();
                debug("query.filter", query)
                get_consults = await consultDao.GetConsultingListsByBranchId(connection, branch_id, query, strPagination);
                if(get_consults.hasOwnProperty('status') && get_consults.status == 404) {
                    if (connection) {
                        await consultDao.releaseReadConnection(connection);
                    }
                    return resolve(get_consults);
                }
                else{
                    get_consults_count = await consultDao.GetCountConsultingListsByBranchId(connection, branch_id, query);
                    var total_size = get_consults_count;
                    var page_size = query.skip ? query.skip : get_consults_count;
                    var result_size = strLimit;
                    console.log("Totalsize :", total_size);
                    var summary = {
                        filteredsize: page_size, resultsize: result_size, totalsize: total_size
                    };
                    var res = {
                        summary, results: get_consults
                    }
                    if (connection) {
                        await consultDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                }
            }
            catch(error) {
                if (connection) {
                    await consultDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }

    GetConsultingListsByOrgId(org_id, query) {
        return new Promise(async(resolve, reject) => {
            var consultDao = new ConsultDao();
            var connection = null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD HH:mm:ss");
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
            var get_consults, get_consults_count;
            try {
                connection = await consultDao.getReadConnection();
                debug("query.filter", query)
                get_consults = await consultDao.GetConsultingListsByOrgId(connection, org_id, query, strPagination);
                if(get_consults.hasOwnProperty('status') && get_consults.status == 404) {
                    if (connection) {
                        await consultDao.releaseReadConnection(connection);
                    }
                    return resolve(get_consults);
                }
                else{
                    get_consults_count = await consultDao.GetCountConsultingListsByOrgId(connection, org_id, query);
                    var total_size = get_consults_count;
                    var page_size = query.skip ? query.skip : get_consults_count;
                    var result_size = strLimit;
                    console.log("Totalsize :", total_size);
                    var summary = {
                        filteredsize: page_size, resultsize: result_size, totalsize: total_size
                    };
                    var res = {
                        summary, results: get_consults
                    }
                    if (connection) {
                        await consultDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                }
            }
            catch(error) {
                if (connection) {
                    await consultDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }

    getPatientDialysisLists(patient_id,  query) {
        return new Promise(async(resolve, reject) => {
            var consultDao = new ConsultDao();
            var connection = null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD HH:mm:ss");
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
            var get_consult_dialysis, get_consult_dialysis_count;
            try {
                connection = await consultDao.getReadConnection();
                debug("query.filter", query)
                get_consult_dialysis = await consultDao.GetPatientDailysisList(connection, patient_id, query, strPagination);
                if(get_consult_dialysis.hasOwnProperty('status') && get_consult_dialysis.status == 404) {
                    if (connection) {
                        await consultDao.releaseReadConnection(connection);
                    }
                    return resolve(get_consult_dialysis);
                }
                else{
                    get_consult_dialysis_count = await consultDao.GetCountPatientDailysisList(connection, patient_id, query);
                    var total_size = get_consult_dialysis_count;
                    var page_size = query.skip ? query.skip : get_consult_dialysis_count;
                    var result_size = strLimit;
                    console.log("Totalsize :", total_size);
                    var summary = {
                        filteredsize: page_size, resultsize: result_size, totalsize: total_size
                    };
                    var res = {
                        summary, results: get_consult_dialysis
                    }
                    if (connection) {
                        await consultDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                }
            }
            catch(error) {
                if (connection) {
                    await consultDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }

    getPatientLabLists(patient_id,  query) {
        return new Promise(async(resolve, reject) => {
            var consultDao = new ConsultDao();
            var connection = null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
            var get_consult_lab;
            try {
                connection = await consultDao.getReadConnection();
                debug("query.filter", query);
                var get_visit_no = await consultDao.getLatestLabLists(connection, patient_id);
                get_consult_lab = await consultDao.GetPatientLabList(connection, patient_id, query, get_visit_no, strPagination);
                if(get_consult_lab.hasOwnProperty('status') && get_consult_lab.status == 404) {
                    if (connection) {
                        await consultDao.releaseReadConnection(connection);
                    }
                    return resolve(get_consult_lab);;
                }
                else{
                  // var  get_consult_lab_count = await consultDao.GetCountPatientLabList(connection, patient_id, query, get_visit_no);
                    var total_size = get_consult_lab.length;
                    var page_size = get_consult_lab.length;
                    var result_size = get_consult_lab.length;
                    console.log("Totalsize :", total_size);
                    var summary = {
                        filteredsize: page_size, resultsize: result_size, totalsize: total_size
                    };
                    var res = {
                        summary, results: get_consult_lab
                    }
                    if (connection) {
                        await consultDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                }
            }
            catch(error) {
                if (connection) {
                    await consultDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }
//  optholvisualacuity 
    getoptholvisualacuityLists(patient_id,  query) {
        return new Promise(async(resolve, reject) => {
            var consultDao = new ConsultDao();
            var connection = null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
            var get_optholvisualacuity;
            try {
                connection = await consultDao.getReadConnection();
                debug("query.filter", query);
            //    var get_visit_no = await consultDao.getLatestOptholvisualacuityVisitno(connection, patient_id);
                get_optholvisualacuity = await consultDao.GetOptholvisualacuityList(connection, patient_id, query,  strPagination);
                if(get_optholvisualacuity.hasOwnProperty('status') && get_optholvisualacuity.status == 404) {
                    if (connection) {
                        await consultDao.releaseReadConnection(connection);
                    }
                    return resolve(get_optholvisualacuity);
                }
                else{
                // var  get_consult_lab_count = await consultDao.GetCountPatientLabList(connection, patient_id, query, get_visit_no);
                    var total_size = get_optholvisualacuity.length;
                    var page_size = get_optholvisualacuity.length;
                    var result_size = get_optholvisualacuity.length;
                    console.log("Totalsize :", total_size);
                    var summary = {
                        filteredsize: page_size, resultsize: result_size, totalsize: total_size
                    };
                    var res = {
                        summary, results: get_optholvisualacuity
                    }
                    if (connection) {
                        await consultDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                }
            }
            catch(error) {
                if (connection) {
                    await consultDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }
//getoptholpgpLists
    getoptholpgpLists(patient_id,  query) {
        return new Promise(async(resolve, reject) => {
            var consultDao = new ConsultDao();
            var connection = null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
            var get_optholvisualacuity;
            try {
                connection = await consultDao.getReadConnection();
                debug("query.filter", query);
                //var get_visit_no = await consultDao.getLatestoptholpgpVisitno(connection, patient_id);
                get_optholvisualacuity = await consultDao.GetoptholpgpList(connection, patient_id, query,  strPagination);
                if(get_optholvisualacuity.hasOwnProperty('status') && get_optholvisualacuity.status == 404) {
                    if (connection) {
                        await consultDao.releaseReadConnection(connection);
                    }
                    return resolve(get_optholvisualacuity);
                }
                else{
                // var  get_consult_lab_count = await consultDao.GetCountPatientLabList(connection, patient_id, query, get_visit_no);
                    var total_size = get_optholvisualacuity.length;
                    var page_size = get_optholvisualacuity.length;
                    var result_size = get_optholvisualacuity.length;
                    console.log("Totalsize :", total_size);
                    var summary = {
                        filteredsize: page_size, resultsize: result_size, totalsize: total_size
                    };
                    var res = {
                        summary, results: get_optholvisualacuity
                    }
                    if (connection) {
                        await consultDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                }
            }
            catch(error) {
                if (connection) {
                    await consultDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }
//end getoptholpgpLists

//getoptholobjrefractionLists
    getoptholobjrefractionLists(patient_id,  query) {
        return new Promise(async(resolve, reject) => {
            var consultDao = new ConsultDao();
            var connection = null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
            var get_optholvisualacuity;
            try {
                connection = await consultDao.getReadConnection();
                debug("query.filter", query);
               // var get_visit_no = await consultDao.getLatestoptholobjrefractionVisitno(connection, patient_id);
                get_optholvisualacuity = await consultDao.GetoptholobjrefractionList(connection, patient_id, query,  strPagination);
                if(get_optholvisualacuity.hasOwnProperty('status') && get_optholvisualacuity.status == 404) {
                    if (connection) {
                        await consultDao.releaseReadConnection(connection);
                    }
                    return resolve(get_optholvisualacuity);
                }
                else{
                // var  get_consult_lab_count = await consultDao.GetCountPatientLabList(connection, patient_id, query, get_visit_no);
                    var total_size = get_optholvisualacuity.length;
                    var page_size = get_optholvisualacuity.length;
                    var result_size = get_optholvisualacuity.length;
                    console.log("Totalsize :", total_size);
                    var summary = {
                        filteredsize: page_size, resultsize: result_size, totalsize: total_size
                    };
                    var res = {
                        summary, results: get_optholvisualacuity
                    }
                    if (connection) {
                        await consultDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                }
            }
            catch(error) {
                if (connection) {
                    await consultDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }
//end getoptholobjrefractionLists
    //Start getoptholsubacceptLists
    getoptholsubacceptLists(patient_id,  query) {
        return new Promise(async(resolve, reject) => {
            var consultDao = new ConsultDao();
            var connection = null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
            var get_optholvisualacuity;
            try {
                connection = await consultDao.getReadConnection();
                debug("query.filter", query);
               // var get_visit_no = await consultDao.getLatestoptholsubacceptVisitno(connection, patient_id);
                get_optholvisualacuity = await consultDao.GetoptholsubacceptList(connection, patient_id, query,  strPagination);
                if(get_optholvisualacuity.hasOwnProperty('status') && get_optholvisualacuity.status == 404) {
                    if (connection) {
                        await consultDao.releaseReadConnection(connection);
                    }
                    return resolve(get_optholvisualacuity);
                }
                else{
                // var  get_consult_lab_count = await consultDao.GetCountPatientLabList(connection, patient_id, query, get_visit_no);
                    var total_size = get_optholvisualacuity.length;
                    var page_size = get_optholvisualacuity.length;
                    var result_size = get_optholvisualacuity.length;
                    console.log("Totalsize :", total_size);
                    var summary = {
                        filteredsize: page_size, resultsize: result_size, totalsize: total_size
                    };
                    var res = {
                        summary, results: get_optholvisualacuity
                    }
                    if (connection) {
                        await consultDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                }
            }
            catch(error) {
                if (connection) {
                    await consultDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }
//end getoptholsubacceptLists

    //Start getoptholEaminationLists
    getoptholEaminationLists(patient_id,  query) {
        return new Promise(async(resolve, reject) => {
            var consultDao = new ConsultDao();
            var connection = null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
            var get_optholexamination;
            try {
                connection = await consultDao.getReadConnection();
                debug("query.filter", query);
                //var get_visit_no = await consultDao.getLatestoptholExaminationVisitno(connection, patient_id);
                get_optholexamination = await consultDao.GetoptholExaminationList(connection, patient_id, query,  strPagination);
                if(get_optholexamination.hasOwnProperty('status') && get_optholexamination.status == 404) {
                    if (connection) {
                        await consultDao.releaseReadConnection(connection);
                    }
                    return resolve(get_optholexamination);
                }
                else{
                // var  get_consult_lab_count = await consultDao.GetCountPatientLabList(connection, patient_id, query, get_visit_no);
                    var total_size = get_optholexamination.length;
                    var page_size = get_optholexamination.length;
                    var result_size = get_optholexamination.length;
                    console.log("Totalsize :", total_size);
                    var summary = {
                        filteredsize: page_size, resultsize: result_size, totalsize: total_size
                    };
                    var res = {
                        summary, results: get_optholexamination
                    }
                    if (connection) {
                        await consultDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                }
            }
            catch(error) {
                if (connection) {
                    await consultDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }
    
    getoptholexaminationLists(patient_id,  query) {
        return new Promise(async(resolve, reject) => {
            var consultDao = new ConsultDao();
            var connection = null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
            var get_optholvisualacuity;
            try {
                connection = await consultDao.getReadConnection();
                debug("query.filter", query);
               // var get_visit_no = await consultDao.getLatestoptholExaminationVisitno(connection, patient_id);
                get_optholvisualacuity = await consultDao.GetoptholExaminationList(connection, patient_id, query,  strPagination);
                if(get_optholvisualacuity.hasOwnProperty('status') && get_optholvisualacuity.status == 404) {
                    if (connection) {
                        await consultDao.releaseReadConnection(connection);
                    }
                    return resolve(get_optholvisualacuity);
                }
                else{
                // var  get_consult_lab_count = await consultDao.GetCountPatientLabList(connection, patient_id, query, get_visit_no);
                    var total_size = get_optholvisualacuity.length;
                    var page_size = get_optholvisualacuity.length;
                    var result_size = get_optholvisualacuity.length;
                    console.log("Totalsize :", total_size);
                    var summary = {
                        filteredsize: page_size, resultsize: result_size, totalsize: total_size
                    };
                    var res = {
                        summary, results: get_optholvisualacuity
                    }
                    if (connection) {
                        await consultDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                }
            }
            catch(error) {
                if (connection) {
                    await consultDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }
    getoptholintraocularpressureLists(patient_id,  query) {
        return new Promise(async(resolve, reject) => {
            var consultDao = new ConsultDao();
            var connection = null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
            var get_optholvisualacuity;
            try {
                connection = await consultDao.getReadConnection();
                debug("query.filter", query);
              //  var get_visit_no = await consultDao.getLatestoptholintraocularpressureVisitno(connection, patient_id);
                get_optholvisualacuity = await consultDao.GetoptholintraocularpressureList(connection, patient_id, query,  strPagination);
                if(get_optholvisualacuity.hasOwnProperty('status') && get_optholvisualacuity.status == 404) {
                    if (connection) {
                        await consultDao.releaseReadConnection(connection);
                    }
                    return resolve(get_optholvisualacuity);
                }
                else{
                // var  get_consult_lab_count = await consultDao.GetCountPatientLabList(connection, patient_id, query, get_visit_no);
                    var total_size = get_optholvisualacuity.length;
                    var page_size = get_optholvisualacuity.length;
                    var result_size = get_optholvisualacuity.length;
                    console.log("Totalsize :", total_size);
                    var summary = {
                        filteredsize: page_size, resultsize: result_size, totalsize: total_size
                    };
                    var res = {
                        summary, results: get_optholvisualacuity
                    }
                    if (connection) {
                        await consultDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                }
            }
            catch(error) {
                if (connection) {
                    await consultDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }

    getoptholdiagadviseLists(patient_id,  query) {
        return new Promise(async(resolve, reject) => {
            var consultDao = new ConsultDao();
            var connection = null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
            var get_optholvisualacuity;
            try {
                connection = await consultDao.getReadConnection();
                debug("query.filter", query);
                //var get_visit_no = await consultDao.getLatestoptholdiagadviseVisitno(connection, patient_id);
                get_optholvisualacuity = await consultDao.GetoptholdiagadviseList(connection, patient_id, query,  strPagination);
                if(get_optholvisualacuity.hasOwnProperty('status') && get_optholvisualacuity.status == 404) {
                    if (connection) {
                        await consultDao.releaseReadConnection(connection);
                    }
                    return resolve(get_optholvisualacuity);
                }
                else{
                // var  get_consult_lab_count = await consultDao.GetCountPatientLabList(connection, patient_id, query, get_visit_no);
                    var total_size = get_optholvisualacuity.length;
                    var page_size = get_optholvisualacuity.length;
                    var result_size = get_optholvisualacuity.length;
                    console.log("Totalsize :", total_size);
                    var summary = {
                        filteredsize: page_size, resultsize: result_size, totalsize: total_size
                    };
                    var res = {
                        summary, results: get_optholvisualacuity
                    }
                    if (connection) {
                        await consultDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                }
            }
            catch(error) {
                if (connection) {
                    await consultDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }

    getoptholimagestorageLists(patient_id,  query) {
        return new Promise(async(resolve, reject) => {
            var consultDao = new ConsultDao();
            var connection = null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
            var get_optholvisualacuity;
            try {
                connection = await consultDao.getReadConnection();
                debug("query.filter", query);
                var get_visit_no = await consultDao.getLatestoptholimagestorageVisitno(connection, patient_id);
                get_optholvisualacuity = await consultDao.GetoptholimagestorageList(connection, patient_id, query, get_visit_no, strPagination);
                if(get_optholvisualacuity.hasOwnProperty('status') && get_optholvisualacuity.status == 404) {
                    if (connection) {
                        await consultDao.releaseReadConnection(connection);
                    }
                    return resolve(get_optholvisualacuity);
                }
                else{
                // var  get_consult_lab_count = await consultDao.GetCountPatientLabList(connection, patient_id, query, get_visit_no);
                    var total_size = get_optholvisualacuity.length;
                    var page_size = get_optholvisualacuity.length;
                    var result_size = get_optholvisualacuity.length;
                    console.log("Totalsize :", total_size);
                    var summary = {
                        filteredsize: page_size, resultsize: result_size, totalsize: total_size
                    };
                    var res = {
                        summary, results: get_optholvisualacuity
                    }
                    if (connection) {
                        await consultDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                }
            }
            catch(error) {
                if (connection) {
                    await consultDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }


    getoptholglassprescriptionLists(patient_id,  query) {
        return new Promise(async(resolve, reject) => {
            var consultDao = new ConsultDao();
            var connection = null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
            var get_optholvisualacuity;
            try {
                connection = await consultDao.getReadConnection();
                debug("query.filter", query);
             //   var get_visit_no = await consultDao.getLatestoptholglassprescriptionVisitno(connection, patient_id);
                get_optholvisualacuity = await consultDao.GetoptholglassprescriptionList(connection, patient_id, query,  strPagination);
                if(get_optholvisualacuity.hasOwnProperty('status') && get_optholvisualacuity.status == 404) {
                    if (connection) {
                        await consultDao.releaseReadConnection(connection);
                    }
                    return resolve(get_optholvisualacuity);
                }
                else{
                // var  get_consult_lab_count = await consultDao.GetCountPatientLabList(connection, patient_id, query, get_visit_no);
                    var total_size = get_optholvisualacuity.length;
                    var page_size = get_optholvisualacuity.length;
                    var result_size = get_optholvisualacuity.length;
                    console.log("Totalsize :", total_size);
                    var summary = {
                        filteredsize: page_size, resultsize: result_size, totalsize: total_size
                    };
                    var res = {
                        summary, results: get_optholvisualacuity
                    }
                    if (connection) {
                        await consultDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                }
            }
            catch(error) {
                if (connection) {
                    await consultDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }

    getPatientPharmLists(patient_id,  query) {
        return new Promise(async(resolve, reject) => {
            var consultDao = new ConsultDao();
            var connection = null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
            var get_consult_pharm, get_consult_pharm_count;
            try {
                connection = await consultDao.getReadConnection();
                debug("query.filter", query);
                var get_lastest_pharm_list = await consultDao.getLatestPharmLists(connection, patient_id);
                get_consult_pharm = await consultDao.GetPatientPharmList(connection, patient_id, query, get_lastest_pharm_list, strPagination);
                if(get_consult_pharm.hasOwnProperty('status') && get_consult_pharm.status == 404) {
                    if (connection) {
                        await consultDao.releaseReadConnection(connection);
                    }
                    return resolve(get_consult_pharm);;
                }
                else{
                    get_consult_pharm_count = await consultDao.GetCountPatientPharmList(connection, patient_id, query, get_lastest_pharm_list);
                    var total_size = get_consult_pharm_count;
                    var page_size = query.skip ? query.skip : get_consult_pharm_count;
                    var result_size = strLimit;
                    console.log("Totalsize :", total_size);
                    var summary = {
                        filteredsize: page_size, resultsize: result_size, totalsize: total_size
                    };
                    var res = {
                        summary, results: get_consult_pharm
                    }
                    if (connection) {
                        await consultDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                }
            }
            catch(error) {
                if (connection) {
                    await consultDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }

    getPatientPharmaLists(patient_id,  query) {
        return new Promise(async(resolve, reject) => {
            var consultDao = new ConsultDao();
            var connection = null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
            var get_consult_pharm, get_consult_pharm_count;
            try {
                connection = await consultDao.getReadConnection();
                debug("query.filter", query);
                get_consult_pharm = await consultDao.GetPatientPharmaList(connection, patient_id, query, strPagination);
                if(get_consult_pharm.hasOwnProperty('status') && get_consult_pharm.status == 404) {
                    if (connection) {
                        await consultDao.releaseReadConnection(connection);
                    }
                    return resolve(get_consult_pharm);;
                }
                else{
                    get_consult_pharm_count = await consultDao.GetCountPatientPharmaList(connection, patient_id, query);
                    var total_size = get_consult_pharm_count;
                    var page_size = query.skip ? query.skip : get_consult_pharm_count;
                    var result_size = strLimit;
                    console.log("Totalsize :", total_size);
                    var summary = {
                        filteredsize: page_size, resultsize: result_size, totalsize: total_size
                    };
                    var res = {
                        summary, results: get_consult_pharm
                    }
                    if (connection) {
                        await consultDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                }
            }
            catch(error) {
                if (connection) {
                    await consultDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }

    getPatientHealthLists(patient_id,  query) {
        return new Promise(async(resolve, reject) => {
            var consultDao = new ConsultDao();
            var connection = null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
            var get_consult_health, get_consult_health_count;
            try {
                connection = await consultDao.getReadConnection();
                debug("query.filter", query);
                var get_lastest_health_list = await consultDao.getLatestHealthLists(connection, patient_id);
                get_consult_health = await consultDao.GetPatientHealthList(connection, patient_id, query, get_lastest_health_list, strPagination);
                if(get_consult_health.hasOwnProperty('status') && get_consult_health.status == 404) {
                    if (connection) {
                        await consultDao.releaseReadConnection(connection);
                    }
                    return resolve(get_consult_health);;
                }
                else{
                    get_consult_health_count = await consultDao.GetCountPatientHealthList(connection, patient_id, query, get_lastest_health_list);
                    var total_size = get_consult_health_count;
                    var page_size = query.skip ? query.skip : get_consult_health_count;
                    var result_size = strLimit;
                    console.log("Totalsize :", total_size);
                    var summary = {
                        filteredsize: page_size, resultsize: result_size, totalsize: total_size
                    };
                    var res = {
                        summary, results: get_consult_health
                    }
                    if (connection) {
                        await consultDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                }
            }
            catch(error) {
                if (connection) {
                    await consultDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }


    

    allvisithealthparamInformation(org_id, branch_id, patient_id,  query) {
        return new Promise(async(resolve, reject) => {
            var consultDao = new ConsultDao();
            var connection = null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
            var get_consult_pharm;
            try {
                connection = await consultDao.getReadConnection();
                debug("query.filter", query);
                get_consult_pharm = await consultDao.allvisithealthparamInformation(connection, org_id, branch_id, patient_id, query);
                if(get_consult_pharm.hasOwnProperty('status') && get_consult_pharm.status == 404) {
                    if (connection) {
                        await consultDao.releaseReadConnection(connection);
                    }
                    return resolve(get_consult_pharm);;
                }
                else{
                   
                    var total_size = get_consult_pharm.length;
                    var page_size = query.skip ? query.skip : get_consult_pharm.length;
                    var result_size = strLimit;
                    console.log("Totalsize :", total_size);
                    var summary = {
                        filteredsize: page_size, resultsize: result_size, totalsize: total_size
                    };
                    var res = {
                        summary, results: get_consult_pharm
                    }
                    if (connection) {
                        await consultDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                }
            }
            catch(error) {
                if (connection) {
                    await consultDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }

    allvisitlabInformation(org_id, branch_id,patient_id,  query) {
        return new Promise(async(resolve, reject) => {
            var consultDao = new ConsultDao();
            var connection = null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
            var get_consult_pharm;
            try {
                connection = await consultDao.getReadConnection();
                debug("query.filter", query);
                get_consult_pharm = await consultDao.allvisitlabInformation(connection, org_id, branch_id, patient_id, query);
                if(get_consult_pharm.hasOwnProperty('status') && get_consult_pharm.status == 404) {
                    if (connection) {
                        await consultDao.releaseReadConnection(connection);
                    }
                    return resolve(get_consult_pharm);;
                }
                else{
                   
                    var total_size = get_consult_pharm.length;
                    var page_size = query.skip ? query.skip : get_consult_pharm.length;
                    var result_size = strLimit;
                    console.log("Totalsize :", total_size);
                    var summary = {
                        filteredsize: page_size, resultsize: result_size, totalsize: total_size
                    };
                    var res = {
                        summary, results: get_consult_pharm
                    }
                    if (connection) {
                        await consultDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                }
            }
            catch(error) {
                if (connection) {
                    await consultDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }

    

    petconsultdetail(org_id, branch_id,patient_id,  query) {
        return new Promise(async(resolve, reject) => {
            var consultDao = new ConsultDao();
            var connection = null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
            var get_consult_pharm;
            
            var visit_no=query.filter.visit_no;
            var heading =query.filter.heading;
            var count=0;
            try {
                connection = await consultDao.getReadConnection();
                debug("query.filter", query);
                count= await consultDao.gePetHeaderCount(connection, org_id, branch_id, patient_id,visit_no,heading, query);
                debug('getTotalBillingDetailCount error :', count)
                if(count==0){
                    get_consult_pharm = await consultDao.petconsultmetadatabyheading(connection, org_id, branch_id, patient_id,visit_no,heading, query);
                }else{
                    get_consult_pharm = await consultDao.petconsultmetadatabyheading(connection, org_id, branch_id, patient_id,visit_no,heading, query);
                   // get_consult_pharm = await consultDao.petconsultdetail(connection, org_id, branch_id, patient_id,visit_no,heading, query);
                }
                if(get_consult_pharm.hasOwnProperty('status') && get_consult_pharm.status == 404) {
                    if (connection) {
                        await consultDao.releaseReadConnection(connection);
                    }
                    return resolve(get_consult_pharm);
                }
                else{
                    for(var i in get_consult_pharm) {
                        var sub_heading = get_consult_pharm[i].sub_heading;
                     
                        var get_sub_list=null;
                        if(count==0){
                            get_sub_list = await consultDao.petconsultmetadatabysubheading(connection, org_id, branch_id, patient_id,visit_no,heading,sub_heading, query);
                        }else{
                            get_sub_list = await consultDao.petconsultdetail(connection, org_id, branch_id, patient_id,visit_no,heading,sub_heading, query);
                        }
                        if(get_sub_list == null) {
                            var empty_array = [];
                            get_consult_pharm[i]["details"] = empty_array;
                        }
                        else{
                            get_consult_pharm[i]["details"] = get_sub_list;
                        }
                    }
                    var total_size = get_consult_pharm.length;
                    var page_size = query.skip ? query.skip : get_consult_pharm.length;
                    var result_size = strLimit;
                    console.log("Totalsize :", total_size);
                    var summary = {
                        filteredsize: page_size, resultsize: result_size, totalsize: total_size
                    };
                    var res = {
                        summary, results: get_consult_pharm
                    }
                    if (connection) {
                        await consultDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                }
            }
            catch(error) {
                if (connection) {
                    await consultDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }


    petlist(org_id, branch_id,patient_id,  query) {
        return new Promise(async(resolve, reject) => {
            var consultDao = new ConsultDao();
            var connection = null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
           
            var get_consult_list
          
            var heading =query.filter.heading;
          
            try {
                connection = await consultDao.getReadConnection();
                debug("query.filter", query);
                
                get_consult_list = await consultDao.getpetlist(connection, org_id, branch_id, patient_id,heading, query);
                if(get_consult_list.hasOwnProperty('status') && get_consult_list.status == 404) {
                    if (connection) {
                        await consultDao.releaseReadConnection(connection);
                    }
                    return resolve(get_consult_list);;
                }
                else{
                    for(var j in get_consult_list) {
                        var count=0;
                        var get_consult_pharm;
                        var visit_no = get_consult_list[j].visit_no;
                count= await consultDao.gePetHeaderCount(connection, org_id, branch_id, patient_id,visit_no,heading, query);
                debug('getTotalBillingDetailCount error :', count)
                if(count==0){
                    get_consult_pharm = await consultDao.petconsultmetadatabyheading(connection, org_id, branch_id, patient_id,visit_no,heading, query);
                }else{
                    get_consult_pharm = await consultDao.petconsultmetadatabyheading(connection, org_id, branch_id, patient_id,visit_no,heading, query);
                   // get_consult_pharm = await consultDao.petconsultdetail(connection, org_id, branch_id, patient_id,visit_no,heading, query);
                }
                if(get_consult_pharm.hasOwnProperty('status') && get_consult_pharm.status == 404) {
                    if (connection) {
                        await consultDao.releaseReadConnection(connection);
                    }
                    return resolve(get_consult_pharm);;
                }
                else{
                    for(var i in get_consult_pharm) {
                        var sub_heading = get_consult_pharm[i].sub_heading;
                     
                        var get_sub_list=null;
                        if(count==0){
                            get_sub_list = await consultDao.petconsultmetadatabysubheading(connection, org_id, branch_id, patient_id,visit_no,heading,sub_heading, query);
                        }else{
                            get_sub_list = await consultDao.petconsultdetail(connection, org_id, branch_id, patient_id,visit_no,heading,sub_heading, query);
                        }
                        if(get_sub_list == null) {
                            var empty_array = [];
                            get_consult_pharm[i]["details"] = empty_array;
                        }
                        else{
                            get_consult_pharm[i]["details"] = get_sub_list;
                        }
                    }

                    get_consult_list[j]["sub_headings"]=get_consult_pharm
                }
            }
                    var total_size = get_consult_list.length;
                    var page_size = query.skip ? query.skip : get_consult_list.length;
                    var result_size = strLimit;
                    console.log("Totalsize :", total_size);
                    var summary = {
                        filteredsize: page_size, resultsize: result_size, totalsize: total_size
                    };
                    var res = {
                        summary, results: get_consult_list
                    }
                    if (connection) {
                        await consultDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                
             
            }
            }
            catch(error) {
                if (connection) {
                    await consultDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }

    CreatepetConsulting(data,  query) {
        return new Promise(async (resolve, reject) => {
            var consultDao = new ConsultDao();
            var read_connection = null;
            var get_consult, consulting_pet_data, set_pat_pet_consult_data;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            var pet_results = [];
            try {
                read_connection = await consultDao.getReadConnection();
                for(var i in data.payloadList) {
                    var pet_data = data.payloadList[i];
                    get_consult = await consultDao.petconsultdetailcheck(read_connection, data.org_id, data.branch_id, data.patient_id,data.visit_no,pet_data.heading, data.dept_id,pet_data.sub_heading,pet_data.column_name_seq_no);
                    if(get_consult.hasOwnProperty('status') && get_consult.status == 404) {
                        debug("Get consult", get_consult);
                        set_pat_pet_consult_data = await categories_data_to_schema_pet_consult_data_to_create(read_connection, data, date, pet_data);
                        consulting_pet_data = await consultDao.createPetconsultdetail(read_connection, set_pat_pet_consult_data);
                        pet_results.push(set_pat_pet_consult_data);

                        
                    }
                    else{
                        debug("Get new consult", get_consult);
                        set_pat_pet_consult_data = await categories_data_to_schema_pet_data_to_update(date, get_consult, pet_data);
                        consulting_pet_data = await consultDao.updatePetconsultdetail(read_connection, set_pat_pet_consult_data, data.org_id, data.branch_id, data.patient_id,data.visit_no,pet_data.heading, data.dept_id,pet_data.sub_heading,pet_data.column_name_seq_no);
                        pet_results.push(get_consult);
                    }
                }
                if (read_connection) {
                    await consultDao.releaseReadConnection(read_connection);
                }
                return resolve({results: pet_results})
            }
            catch (error) {
                debug("error", error)
                if (read_connection) {
                    await consultDao.releaseReadConnection(read_connection);
                }
                return reject(error)
            }
        })
    }
    pettreatmentlist(org_id, branch_id,patient_id,  query) {
        return new Promise(async(resolve, reject) => {
            var consultDao = new ConsultDao();
            var connection = null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
            var get_consult_pharm;
            try {
                connection = await consultDao.getReadConnection();
                debug("query.filter", query);
                get_consult_pharm = await consultDao.GetPetTreatmentList(connection, org_id, branch_id, patient_id, query);
                if(get_consult_pharm.hasOwnProperty('status') && get_consult_pharm.status == 404) {
                    if (connection) {
                        await consultDao.releaseReadConnection(connection);
                    }
                    return resolve(get_consult_pharm);;
                }
                else{
                   
                    var total_size = get_consult_pharm.length;
                    var page_size = query.skip ? query.skip : get_consult_pharm.length;
                    var result_size = strLimit;
                    console.log("Totalsize :", total_size);
                    var summary = {
                        filteredsize: page_size, resultsize: result_size, totalsize: total_size
                    };
                    var res = {
                        summary, results: get_consult_pharm
                    }
                    if (connection) {
                        await consultDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                }
            }
            catch(error) {
                if (connection) {
                    await consultDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }

    petdiagnosislist(org_id, branch_id,patient_id,  query) {
        return new Promise(async(resolve, reject) => {
            var consultDao = new ConsultDao();
            var connection = null;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            var strSkip = (query.skip ? query.skip : 0);
            var strLimit = (query.limit ? query.limit : 2000);
            var strPagination = strSkip + ',' + strLimit;
            var get_consult_pharm;
            try {
                connection = await consultDao.getReadConnection();
                debug("query.filter", query);
                get_consult_pharm = await consultDao.GetPetDiagnosisList(connection, org_id, branch_id, patient_id, query);
                if(get_consult_pharm.hasOwnProperty('status') && get_consult_pharm.status == 404) {
                    if (connection) {
                        await consultDao.releaseReadConnection(connection);
                    }
                    return resolve(get_consult_pharm);;
                }
                else{
                   
                    var total_size = get_consult_pharm.length;
                    var page_size = query.skip ? query.skip : get_consult_pharm.length;
                    var result_size = strLimit;
                    console.log("Totalsize :", total_size);
                    var summary = {
                        filteredsize: page_size, resultsize: result_size, totalsize: total_size
                    };
                    var res = {
                        summary, results: get_consult_pharm
                    }
                    if (connection) {
                        await consultDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                }
            }
            catch(error) {
                if (connection) {
                    await consultDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }

     CreatepetDiagnosis(data,  query) {
        return new Promise(async (resolve, reject) => {
            var consultDao = new ConsultDao();
            var read_connection = null;
            var get_consult, consulting_pet_data, set_pat_pet_consult_data;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            var pet_results = [];
            try {
                read_connection = await consultDao.getReadConnection();
              
                    get_consult = await consultDao.petDiagnosisdetailcheck(read_connection, data.org_id, data.branch_id, data.patient_id,data.visit_no, data.dept_id);
                    if(get_consult.hasOwnProperty('status') && get_consult.status == 404) {
                        debug("Get consult", get_consult);
                        set_pat_pet_consult_data = await categories_data_to_schema_pet_diagnosis_data_to_create(read_connection, data, date, data);
                        consulting_pet_data = await consultDao.createPetDiagnosis(read_connection, set_pat_pet_consult_data);
                        pet_results.push(set_pat_pet_consult_data);

                        
                    }
                    else{
                        debug("Get new consult", get_consult);
                        set_pat_pet_consult_data = await categories_data_to_schema_pet_diagnosis_data_to_update(date, get_consult, data);
                        consulting_pet_data = await consultDao.updatePetDiagnosis(read_connection,set_pat_pet_consult_data, data);
                        pet_results.push(get_consult);
                    }
                
                if (read_connection) {
                    await consultDao.releaseReadConnection(read_connection);
                }
                return resolve({results: pet_results})
            }
            catch (error) {
                debug("error", error)
                if (read_connection) {
                    await consultDao.releaseReadConnection(read_connection);
                }
                return reject(error)
            }
        })
    }

    CreatepetTreatment(data,  query) {
        return new Promise(async (resolve, reject) => {
            var consultDao = new ConsultDao();
            var read_connection = null;
            var get_consult, consulting_pet_data, set_pat_pet_consult_data;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            var pet_results = [];
            try {
                read_connection = await consultDao.getReadConnection();
               
                    get_consult = await consultDao.petTreatmentdetailcheck(read_connection, data.org_id, data.branch_id, data.patient_id,data.visit_no, data.dept_id);
                    if(get_consult.hasOwnProperty('status') && get_consult.status == 404) {
                        debug("Get consult", get_consult);
                        set_pat_pet_consult_data = await categories_data_to_schema_pet_treatment_data_to_create(read_connection, data, date, data);
                        debug("set_pat_pet_consult_data", set_pat_pet_consult_data)
                        consulting_pet_data = await consultDao.createPetTreatment(read_connection, set_pat_pet_consult_data);
                        pet_results.push(set_pat_pet_consult_data);

                        
                    }
                    else{
                        debug("Get new consult", get_consult);
                        set_pat_pet_consult_data = await categories_data_to_schema_pet_treatment_data_to_update(date, get_consult, data);
                        consulting_pet_data = await consultDao.updatePetTreatment(read_connection,set_pat_pet_consult_data, data);
                        pet_results.push(get_consult);
                    }
                
                if (read_connection) {
                    await consultDao.releaseReadConnection(read_connection);
                }
                return resolve({results: pet_results})
            }
            catch (error) {
                debug("error", error)
                if (read_connection) {
                    await consultDao.releaseReadConnection(read_connection);
                }
                return reject(error)
            }
        })
    }
}




function generateId(connection, data, seq_type) {
    return new Promise(async(resolve, reject) => {
        var consultDao = new ConsultDao();
        var billing_invoice, invoice_no;
        
        try{
            billing_invoice = await consultDao.getInvoiceNo(connection,data.branch_id, seq_type);
            if(billing_invoice != null) {
                invoice_no = billing_invoice.invoice_no;
                return resolve(invoice_no);
            }
            else{
               return generateId(connection, data, seq_type)
            }
        }
        catch(error) {
            return reject(error)
        }
    })
}

function categories_data_to_schema_consult_header_data_to_create(connection, data, date){
    return new Promise(async(resolve, reject) => {
        try {
            debug("Data", data)
            var consultDao = new ConsultDao();
            var visit_no;
            var prev_visit_no;
            var prev_visit_date;
            var prev_notes;
            // var seq_type = 'INV';
            // invoice_no = await generateId(connection, data, seq_type)
            var get_consult_visit_no = await consultDao.getConsultVisitMaxNumber(connection, data);
            var get_consult_prev=await consultDao.getConsultingPrevDate(connection,data.patient_id);
            if(get_consult_visit_no != null) {
                debug("get_consult_visit_no", get_consult_visit_no)
                if(get_consult_visit_no.visit_no != null) {
                    prev_visit_no=get_consult_visit_no.visit_no;
                    visit_no = get_consult_visit_no.visit_no + 1;
                }
                else{
                    visit_no = 1;
                    prev_visit_no=0;
                }
            }
            else {
                visit_no = 1;
                prev_visit_no=0;
            }

            if(get_consult_prev != null) {
                
                prev_visit_date= moment(get_consult_prev.visit_date).utc().format("YYYY-MM-DD HH:mm:ss");
                prev_notes=get_consult_prev.doctor_notes;
            }else{
                prev_visit_date=null;
                prev_notes=null;
            }
            var consulting_header_data = {
                org_id: data.org_id, 
                branch_id: data.branch_id, 
                appoint_no: data.appoint_no,
                business_id: data.business_id, 
                doctor_id: data.doctor_id, 
                patient_id: data.patient_id, 
                visit_date: data.visit_date, 
                visit_no: visit_no, 
                prev_visit_no: prev_visit_no, 
                prev_visit_date: prev_visit_date, 
                prev_history: data.prev_notes, 
                doctor_notes: data.doctor_notes, 
                main_complaint: data.main_complaint,
                main_complaint_from: data.main_complaint_from,
                curr_complaint: data.curr_complaint,
                curr_complaint_from: data.curr_complaint_from,
                past_illness_systemic: data.past_illness_systemic,
                fam_history: data.fam_history,
                fam_history_dtl: data.fam_history_dtl,
                surg_laser: data.surg_laser,
                allergies: data.allergies,
                curr_treatment: data.curr_treatment,
                curr_treatment_dtl: data.curr_treatment_dtl,
                medication: data.medication,
                medication_dtl: data.medication_dtl,
        
               // consultation_fee: data.consultation_fee, 
                updated_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                updated_date: date, 
                created_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                created_date: date, 
             //   consultation_fee_paid: data.consultation_fee_paid, 
               // fee_payment_mode: data.fee_payment_mode, 
              //  fee_payment_desc: data.fee_payment_desc
            }
            return resolve(consulting_header_data)
        }
        catch (error) {
            return reject(error);    
        }
    })
}

function categories_data_to_schema_consult_header_data_to_update(connection, data, date){
    return new Promise(async(resolve, reject) => {
        try {
            debug("Data", data)
            var consultDao = new ConsultDao();
            var visit_no;
            var prev_visit_no;
            var prev_visit_date;
            var prev_notes;
            // var seq_type = 'INV';
            // invoice_no = await generateId(connection, data, seq_type)
           // var get_consult_visit_no = await consultDao.getConsultVisitMaxNumber(connection, data);
            var get_consult_prev=await consultDao.getConsultingPrevDate(connection,data.patient_id);
            if(get_consult_visit_no != null) {
                debug("get_consult_visit_no", get_consult_visit_no)
                if(get_consult_visit_no.visit_no != null) {
                    prev_visit_no=get_consult_visit_no.visit_no;
                    visit_no = get_consult_visit_no.visit_no + 1;
                }
                else{
                    visit_no = 1;
                    prev_visit_no=0;
                }
            }
            else {
                visit_no = 1;
                prev_visit_no=0;
            }

            if(get_consult_prev != null) {
                
                prev_visit_date= moment(get_consult_prev.visit_date).utc().format("YYYY-MM-DD HH:mm:ss");
                prev_notes=get_consult_prev.doctor_notes;
            }else{
                prev_visit_date=null;
                prev_notes=null;
            }
            var consulting_header_data = {              
                visit_date: data.visit_date, 
                appoint_no: data.appoint_no,
                business_id: data.business_id, 
                doctor_id: data.doctor_id,               
                prev_visit_no: prev_visit_no, 
                prev_visit_date: prev_visit_date, 
                prev_history: data.prev_notes, 
                doctor_notes: data.doctor_notes, 
                main_complaint: data.main_complaint,
                main_complaint_from: data.main_complaint_from,
                curr_complaint: data.curr_complaint,
                curr_complaint_from: data.curr_complaint_from,
                past_illness_systemic: data.past_illness_systemic,
                fam_history: data.fam_history,
                fam_history_dtl: data.fam_history_dtl,
                surg_laser: data.surg_laser,
                allergies: data.allergies,
                curr_treatment: data.curr_treatment,
                curr_treatment_dtl: data.curr_treatment_dtl,
                medication: data.medication,
                medication_dtl: data.medication_dtl,
        
               // consultation_fee: data.consultation_fee, 
                updated_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                updated_date: date
        
             //   consultation_fee_paid: data.consultation_fee_paid, 
               // fee_payment_mode: data.fee_payment_mode, 
              //  fee_payment_desc: data.fee_payment_desc
            }
            return resolve(consulting_header_data)
        }
        catch (error) {
            return reject(error);    
        }
    })
}

function categories_data_to_schema_dialysis_consult_data_to_create(connection, data, date) {
    return new Promise(async(resolve, reject) => {
        try {
            var consultDao = new ConsultDao();
            var dialysis_consulting_data = {
                org_id: data.org_id, 
                branch_id: data.branch_id, 
                business_id: data.business_id, 
                doctor_id: data.doctor_id, 
                patient_id: data.patient_id,
                visit_no: data.visit_no, 
                prescription_date: data.prescription_date, 
                dialysis_notes: data.dialysis_notes, 
                updated_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                updated_date: date, 
                created_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                created_date: date
            }
            return resolve(dialysis_consulting_data)
        }
        catch (error) {
            return reject(error);    
        }
    })
}

function categories_data_to_schema_dialysis_consult_data_to_update(connection, data, date, consult_header) {
    return new Promise(async(resolve, reject) => {
        try {
            var consultDao = new ConsultDao();
            var dialysis_consulting_data = {
                /* org_id: data.org_id, 
                branch_id: data.branch_id, 
                business_id: data.business_id, 
                doctor_id: data.doctor_id, 
                patient_id: data.patient_id,
                visit_no: data.visit_no,  */
                prescription_date: data.prescription_date, 
                dialysis_notes: data.dialysis_notes, 
                updated_by: (data.hasOwnProperty('user_id'))?data.user_id:consult_header.updated_by, 
                updated_date: date, 
            }
            return resolve(dialysis_consulting_data)
        }
        catch (error) {
            return reject(error);    
        }
    })
}

function categories_data_to_schema_lab_consult_data_to_create(connection, data, date, lab_data) {
    return new Promise(async(resolve, reject) => {
        try {
            var consultDao = new ConsultDao();
            var lab_consulting_data = {
                org_id: data.org_id, 
                branch_id: data.branch_id, 
                business_id: data.business_id, 
                doctor_id: data.doctor_id, 
                patient_id: data.patient_id,
                visit_no: data.visit_no, 
                prescription_date: date,
                test_id: lab_data.test_id, 
                test_notes: lab_data.test_notes, 
                test_date: lab_data.test_date,
                test_status: 'P', 
                remarks: (lab_data.hasOwnProperty('remarks'))?lab_data.remarks: null, 
                invoice_num: (lab_data.hasOwnProperty('invoice_num'))?lab_data.invoice_num: null, 
                result_delivery_mode: (lab_data.hasOwnProperty('result_delivery_mode'))?lab_data.result_delivery_mode: null, 
                test_delivered: (lab_data.hasOwnProperty('test_delivered'))?lab_data.test_delivered: null, 
                test_delivery_date: (lab_data.hasOwnProperty('test_delivery_date'))?lab_data.test_delivery_date: null,
                updated_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                updated_date: date, 
                created_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                created_date: date
            }
            return resolve(lab_consulting_data)
        }
        catch (error) {
            return reject(error);    
        }
    })
}

function categories_data_to_schema_lab_consult_data_to_update(date, get_consult, lab_data) {
    return new Promise(async(resolve, reject) => {
        try {
            var consultDao = new ConsultDao();
            var lab_consulting_data = {
                /* org_id: data.org_id, 
                branch_id: data.branch_id, 
                business_id: data.business_id, 
                doctor_id: data.doctor_id, 
                patient_id: data.patient_id,
                visit_no: data.visit_no, 
                prescription_date: date,
                test_id: lab_data.test_id,  */
                test_notes: lab_data.test_notes, 
                test_date: lab_data.test_date,
                test_status: 'P', 
                remarks: (lab_data.hasOwnProperty('remarks'))?lab_data.remarks: get_consult.remarks, 
                invoice_num: (lab_data.hasOwnProperty('invoice_num'))?lab_data.invoice_num: get_consult.invoice_num, 
                result_delivery_mode: (lab_data.hasOwnProperty('result_delivery_mode'))?lab_data.result_delivery_mode: get_consult.result_delivery_mode, 
                test_delivered: (lab_data.hasOwnProperty('test_delivered'))?lab_data.test_delivered: get_consult.test_delivered, 
                test_delivery_date: (lab_data.hasOwnProperty('test_delivery_date'))?lab_data.test_delivery_date: get_consult.test_delivery_date,
                updated_by: (lab_data.hasOwnProperty('user_id'))?lab_data.user_id:get_consult.updated_by, 
                updated_date: date
            }
            return resolve(lab_consulting_data)
        }
        catch (error) {
            return reject(error);    
        }
    })
}

function categories_data_to_schema_health_consult_data_to_create(connection, data, date, health_data) {
    return new Promise(async(resolve, reject) => {
        try {
            var consultDao = new ConsultDao();
            var health_consulting_data = {
                org_id: data.org_id, 
                branch_id: data.branch_id,
                doctor_id: data.doctor_id, 
                patient_id: data.patient_id,
                visit_no: data.visit_no, 
                khi_code: health_data.khi_code, 
                khi_value: health_data.khi_value, 
                khi_notes: health_data.khi_notes, 
                
                updated_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                updated_date: date, 
                created_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                created_date: date
            }
            return resolve(health_consulting_data)
        }
        catch (error) {
            return reject(error);    
        }
    })
}

function categories_data_to_schema_health_consult_data_to_update(date, get_consult, health_data) {
    return new Promise(async(resolve, reject) => {
        try {
            var consultDao = new ConsultDao();
            var health_consulting_data = {
                /* org_id: data.org_id, 
                branch_id: data.branch_id, 
                business_id: data.business_id, 
                doctor_id: data.doctor_id, 
                patient_id: data.patient_id,
                visit_no: data.visit_no,
                medicine_id: pharm_data.medicine_id, 
                prescription_date: date, */ 
                khi_value: (health_data.hasOwnProperty('khi_value'))?health_data.khi_value:get_consult.khi_value, 
                khi_notes: (health_data.hasOwnProperty('khi_notes'))?health_data.khi_notes:get_consult.khi_notes, 
                updated_by: (health_data.hasOwnProperty('user_id'))?health_data.user_id:get_consult.updated_by, 
                updated_date: date
            }
            return resolve(health_consulting_data)
        }
        catch (error) {
            return reject(error);    
        }
    })
}

//consultancy_billing_push(Pharm)
function categories_data_to_schema_pharm_consultancy_billing_push_to_create(connection, data, date, pharm_data) {
    return new Promise(async(resolve, reject) => {
        try {
             
                var morning_bf=pharm_data.morning_bf!=null?pharm_data.morning_bf:0;
                var morning_af=pharm_data.morning_af!=null?pharm_data.morning_af:0;
                var noon_bf=pharm_data.noon_bf!=null?pharm_data.noon_bf:0;
                var noon_af=pharm_data.noon_af!=null?pharm_data.noon_af:0;
                var evening_bf=pharm_data.evening_bf!=null?pharm_data.evening_bf:0;
                var evening_af=pharm_data.evening_bf!=null?pharm_data.evening_af:0;
                var night_bf=pharm_data.night_bf!=null?pharm_data.night_bf:0;
                var night_af=pharm_data.night_af!=null?pharm_data.night_af:0;
                var other_time_bf=pharm_data.other_time_bf!=null?pharm_data.other_time_bf:0;
                var other_time_af=pharm_data.other_time_af!=null?pharm_data.other_time_af:0;
                
                var product_qty= morning_bf+ morning_af+noon_bf+noon_af+evening_bf+evening_af+night_bf+night_af+other_time_bf+other_time_af;

                var no_of_days=pharm_data.no_of_days!=null?pharm_data.no_of_days:0;
                if(no_of_days  > 0 &&  product_qty  > 0) {
                    product_qty=product_qty * no_of_days;
                }
                //ven as > 0   then Qty =  Qty * # of Days   Else Qty..
                //var product_qty=
           
            var pharm_consulting_push = {
                org_id: data.org_id, 
                branch_id: data.branch_id,
                patient_id: data.patient_id,
                visit_no: data.visit_no, 
                bu_id: "PHARM",
                product_id: pharm_data.medicine_id, 
                product_qty: product_qty,
                push_status:"N" ,               
                updated_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                updated_date: date, 
                created_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                created_date: date
            }
            return resolve(pharm_consulting_push)
        }
        catch (error) {
            return reject(error);    
        }
    })
}


//consultancy_billing_push(Lab)
function categories_data_to_schema_lab_consultancy_billing_push_to_create(connection, data, date, lab_data) {
    return new Promise(async(resolve, reject) => {
        try {
             
                
         
            var lab_consulting_push = {
                org_id: data.org_id, 
                branch_id: data.branch_id,
                patient_id: data.patient_id,
                visit_no: data.visit_no, 
                bu_id: "LAB",
                product_id: lab_data.test_id,            
                push_status:"N",                
                updated_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                updated_date: date, 
                created_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                created_date: date
            }
            return resolve(lab_consulting_push)
        }
        catch (error) {
            return reject(error);    
        }
    })
}
function categories_data_to_schema_pharm_consult_data_to_create(connection, data, date, pharm_data) {
    return new Promise(async(resolve, reject) => {
        try {
            var consultDao = new ConsultDao();
            var pharm_consulting_data = {
                org_id: data.org_id, 
                branch_id: data.branch_id, 
                business_id: data.business_id, 
                doctor_id: data.doctor_id, 
                patient_id: data.patient_id,
                visit_no: data.visit_no, 
                prescription_date: date,
                medicine_id: pharm_data.medicine_id, 
                morning_bf: pharm_data.morning_bf, 
                morning_af: pharm_data.morning_af, 
                noon_bf: pharm_data.noon_bf, 
                noon_af: pharm_data.noon_af, 
                evening_bf: pharm_data.evening_bf, 
                evening_af: pharm_data.evening_af, 
                night_bf: pharm_data.night_bf, 
                night_af: pharm_data.night_af, 
                other_time_desc: pharm_data.other_time_desc, 
                other_time_bf: pharm_data.other_time_bf, 
                other_time_af: pharm_data.other_time_af, 
                no_of_days: pharm_data.no_of_days,  
                invoiced: pharm_data.invoiced, 
                remarks: pharm_data.remarks, 
                delivery_mode: pharm_data.delivery_mode, 
                invoice_num: pharm_data.invoice_num,
                updated_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                updated_date: date, 
                created_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                created_date: date
            }
            return resolve(pharm_consulting_data)
        }
        catch (error) {
            return reject(error);    
        }
    })
}

function categories_data_to_schema_pharm_consult_data_to_update(date, get_consult, pharm_data) {
    return new Promise(async(resolve, reject) => {
        try {
            var consultDao = new ConsultDao();
            var pharm_consulting_data = {
                /* org_id: data.org_id, 
                branch_id: data.branch_id, 
                business_id: data.business_id, 
                doctor_id: data.doctor_id, 
                patient_id: data.patient_id,
                visit_no: data.visit_no,
                medicine_id: pharm_data.medicine_id, 
                prescription_date: date, */ 
                morning_bf: (pharm_data.hasOwnProperty('morning_bf'))?pharm_data.morning_bf:get_consult.morning_bf, 
                morning_af: (pharm_data.hasOwnProperty('morning_af'))?pharm_data.morning_af:get_consult.morning_af, 
                noon_bf: (pharm_data.hasOwnProperty('noon_bf'))?pharm_data.noon_bf:get_consult.noon_bf, 
                noon_af: (pharm_data.hasOwnProperty('noon_af'))?pharm_data.noon_af:get_consult.noon_af, 
                evening_bf: (pharm_data.hasOwnProperty('evening_bf'))?pharm_data.evening_bf:get_consult.evening_bf, 
                evening_af: (pharm_data.hasOwnProperty('evening_af'))?pharm_data.evening_af:get_consult.evening_af, 
                night_bf: (pharm_data.hasOwnProperty('night_bf'))?pharm_data.night_bf:get_consult.night_bf, 
                night_af: (pharm_data.hasOwnProperty('night_af'))?pharm_data.night_af:get_consult.night_af, 
                other_time_desc: (pharm_data.hasOwnProperty('other_time_desc'))?pharm_data.other_time_desc:get_consult.other_time_desc, 
                other_time_bf: (pharm_data.hasOwnProperty('other_time_bf'))?pharm_data.other_time_bf:get_consult.other_time_bf, 
                other_time_af: (pharm_data.hasOwnProperty('other_time_af'))?pharm_data.other_time_af:get_consult.other_time_af, 
                no_of_days: (pharm_data.hasOwnProperty('no_of_days'))?pharm_data.no_of_days:get_consult.no_of_days,  
                invoiced: (pharm_data.hasOwnProperty('invoiced'))?pharm_data.invoiced:get_consult.invoiced, 
                remarks: (pharm_data.hasOwnProperty('remarks'))?pharm_data.remarks:get_consult.remarks, 
                delivery_mode: (pharm_data.hasOwnProperty('delivery_mode'))?pharm_data.delivery_mode:get_consult.delivery_mode, 
                invoice_num: (pharm_data.hasOwnProperty('invoice_num'))?pharm_data.invoice_num:get_consult.invoice_num,
                updated_by: (pharm_data.hasOwnProperty('user_id'))?pharm_data.user_id:get_consult.updated_by, 
                updated_date: date
            }
            return resolve(pharm_consulting_data)
        }
        catch (error) {
            return reject(error);    
        }
    })
}

function categories_data_to_schema_create_patient_opthol_visual_acuity_data_to_create(read_connection, data, date) {
    return new Promise((resolve, reject) => {
        try {
            var consultDao = new ConsultDao();
            var consulting_data = {
                org_id: data.org_id, 
                branch_id: data.branch_id, 
                patient_id: data.patient_id,
                visit_no: data.visit_no,
                units: data.units,
                unaided_distance_re: data.unaided_distance_re, 
                aided_distance_re: data.aided_distance_re, 
                pinhole_distance_re: data.pinhole_distance_re, 
                color_vision_distance_re: data.color_vision_distance_re, 
                neartype_re: data.neartype_re, 
                unaided_near_re: data.unaided_near_re, 
                aided_near_re: data.aided_near_re, 
                unaided_distance_le: data.unaided_distance_le, 
                aided_distance_le: data.aided_distance_le, 
                pinhole_distance_le: data.pinhole_distance_le, 
                color_vision_distance_le: data.color_vision_distance_le, 
                neartype_le: data.neartype_le, 
                unaided_near_le: data.unaided_near_le, 
                aided_near_le: data.aided_near_le, 
                visit_date: data.visit_date, 
                updated_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                updated_date: date, 
                created_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                created_date: date
            }
            return resolve(consulting_data)
        } catch (error) {
            return reject(error);
        }
    })
}

function categories_data_to_schema_create_patient_opthol_visual_acuity_data_to_update(date, get_consult, data) {
    return new Promise((resolve, reject) => {
        try {
            var consultDao = new ConsultDao();
            var consulting_data = {
                units: (data.hasOwnProperty('units'))?data.units:get_consult.units,
                unaided_distance_re: (data.hasOwnProperty('unaided_distance_re'))?data.unaided_distance_re:get_consult.unaided_distance_re, 
                aided_distance_re: (data.hasOwnProperty('aided_distance_re'))?data.aided_distance_re:get_consult.aided_distance_re, 
                pinhole_distance_re: (data.hasOwnProperty('pinhole_distance_re'))?data.pinhole_distance_re:get_consult.pinhole_distance_re, 
                color_vision_distance_re: (data.hasOwnProperty('color_vision_distance_re'))?data.color_vision_distance_re:get_consult.color_vision_distance_re, 
                neartype_re: (data.hasOwnProperty('neartype_re'))?data.neartype_re:get_consult.neartype_re, 
                unaided_near_re: (data.hasOwnProperty('unaided_near_re'))?data.unaided_near_re:get_consult.unaided_near_re, 
                aided_near_re: (data.hasOwnProperty('aided_near_re'))?data.aided_near_re:get_consult.aided_near_re, 
                unaided_distance_le: (data.hasOwnProperty('unaided_distance_le'))?data.unaided_distance_le:get_consult.unaided_distance_le, 
                aided_distance_le: (data.hasOwnProperty('aided_distance_le'))?data.aided_distance_le:get_consult.aided_distance_le, 
                pinhole_distance_le: (data.hasOwnProperty('pinhole_distance_le'))?data.pinhole_distance_le:get_consult.pinhole_distance_le, 
                color_vision_distance_le: (data.hasOwnProperty('color_vision_distance_le'))?data.color_vision_distance_le:get_consult.color_vision_distance_le, 
                neartype_le: (data.hasOwnProperty('neartype_le'))?data.neartype_le:get_consult.neartype_le, 
                unaided_near_le: (data.hasOwnProperty('unaided_near_le'))?data.unaided_near_le:get_consult.unaided_near_le, 
                aided_near_le: (data.hasOwnProperty('aided_near_le'))?data.aided_near_le:get_consult.aided_near_le, 
                visit_date: (data.hasOwnProperty('visit_date'))?data.visit_date:get_consult.visit_date, 
                updated_by: (data.hasOwnProperty('user_id'))?data.user_id:get_consult.user_id, 
                updated_date: date,
            }
            return resolve(consulting_data)
        } catch (error) {
            return reject(error);
        }
    })
}

function categories_data_to_schema_create_patient_opthol_pgp_data_to_create(read_connection, data, date) {
    return new Promise((resolve, reject) => {
        try {
            var consultDao = new ConsultDao();
            var consulting_data = {
                org_id: data.org_id, 
                branch_id: data.branch_id, 
                patient_id: data.patient_id,
                visit_no: data.visit_no,
                sph_distance_re: data.sph_distance_re, 
                cyl_distance_re: data.cyl_distance_re, 
                axis_distance_re: data.axis_distance_re, 
                sph_distance_le: data.sph_distance_le, 
                cyl_distance_le: data.cyl_distance_le, 
                axis_distance_le: data.axis_distance_le, 
                sph_add_re: data.sph_add_re, 
                sph_add_le: data.sph_add_le, 
                sph_near_re: data.sph_near_re, 
                cyl_near_re: data.cyl_near_re, 
                axis_near_re: data.axis_near_re, 
                sph_near_le: data.sph_near_le, 
                cyl_near_le: data.cyl_near_le, 
                axis_near_le: data.axis_near_le, 
                lens_material: data.lens_material, 
                lens_type: data.lens_type, 
                lens_coating: data.lens_coating, 
                visit_date: data.visit_date, 
                updated_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                updated_date: date, 
                created_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                created_date: date                
            }
            return resolve(consulting_data)
        } catch (error) {
            return reject(error);
        }
    })
}

function categories_data_to_schema_create_patient_opthol_pgp_data_to_update(date, get_consult, data) {
    return new Promise((resolve, reject) => {
        try {
            var consultDao = new ConsultDao();
            var consulting_data = {
                sph_distance_re: data.hasOwnProperty('sph_distance_re')?data.sph_distance_re:get_consult.sph_distance_re, 
                cyl_distance_re: data.hasOwnProperty('cyl_distance_re')?data.cyl_distance_re:get_consult.cyl_distance_re, 
                axis_distance_re: data.hasOwnProperty('axis_distance_re')?data.axis_distance_re:get_consult.axis_distance_re, 
                sph_distance_le: data.hasOwnProperty('sph_distance_le')?data.sph_distance_le:get_consult.sph_distance_le, 
                cyl_distance_le: data.hasOwnProperty('cyl_distance_le')?data.cyl_distance_le:get_consult.cyl_distance_le, 
                axis_distance_le: data.hasOwnProperty('axis_distance_le')?data.axis_distance_le:get_consult.axis_distance_le, 
                sph_add_re: data.hasOwnProperty('sph_add_re')?data.sph_add_re:get_consult.sph_add_re, 
                sph_add_le: data.hasOwnProperty('sph_add_le')?data.sph_add_le:get_consult.sph_add_le, 
                sph_near_re: data.hasOwnProperty('sph_near_re')?data.sph_near_re:get_consult.sph_near_re, 
                cyl_near_re: data.hasOwnProperty('cyl_near_re')?data.cyl_near_re:get_consult.cyl_near_re, 
                axis_near_re: data.hasOwnProperty('axis_near_re')?data.axis_near_re:get_consult.axis_near_re, 
                sph_near_le: data.hasOwnProperty('sph_near_le')?data.sph_near_le:get_consult.sph_near_le, 
                cyl_near_le: data.hasOwnProperty('cyl_near_le')?data.cyl_near_le:get_consult.cyl_near_le, 
                axis_near_le: data.hasOwnProperty('axis_near_le')?data.axis_near_le:get_consult.axis_near_le, 
                lens_material: data.hasOwnProperty('lens_material')?data.lens_material:get_consult.lens_material, 
                lens_type: data.hasOwnProperty('lens_type')?data.lens_type:get_consult.lens_type, 
                lens_coating: data.hasOwnProperty('lens_coating')?data.lens_coating:get_consult.lens_coating, 
                visit_date: data.hasOwnProperty('visit_date')?data.visit_date:get_consult.visit_date, 
                updated_by: (data.hasOwnProperty('user_id'))?data.user_id:get_consult.user_id, 
                updated_date: date
            }
            return resolve(consulting_data)
        } catch (error) {
            return reject(error);
        }
    })
}

function categories_data_to_schema_create_patient_opthol_obj_refraction_data_to_create(read_connection, data, date) {
    return new Promise((resolve, reject) => {
        try {
            var consultDao = new ConsultDao();
            var consulting_data = {
                org_id: data.org_id, 
                branch_id: data.branch_id, 
                patient_id: data.patient_id,
                visit_no: data.visit_no,
                obj_ref_type_re: data.obj_ref_type_re, 
                sph_re: data.sph_re, 
                cyl_re: data.cyl_re, 
                axis_re: data.axis_re, 
                obj_ref_type_le: data.obj_ref_type_le, 
                sph_le: data.sph_le, 
                cyl_le: data.cyl_le, 
                axis_le: data.axis_le, 
                refr_type: data.refr_type,  
                visit_date: data.visit_date, 
                updated_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                updated_date: date, 
                created_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                created_date: date
            }
            return resolve(consulting_data)
        } catch (error) {
            return reject(error);
        }
    })
}

function categories_data_to_schema_create_patient_opthol_obj_refraction_data_to_update(date, get_consult, data) {
    return new Promise((resolve, reject) => {
        try {
            var consultDao = new ConsultDao();
            var consulting_data = {
                obj_ref_type_re: data.hasOwnProperty('obj_ref_type_re')?data.obj_ref_type_re:get_consult.obj_ref_type_re, 
                sph_re: data.hasOwnProperty('sph_re')?data.sph_re:get_consult.sph_re, 
                cyl_re: data.hasOwnProperty('cyl_re')?data.cyl_re:get_consult.cyl_re, 
                axis_re: data.hasOwnProperty('axis_re')?data.axis_re:get_consult.axis_re, 
                obj_ref_type_le: data.hasOwnProperty('obj_ref_type_le')?data.obj_ref_type_le:get_consult.obj_ref_type_le, 
                sph_le: data.hasOwnProperty('sph_le')?data.sph_le:get_consult.sph_le, 
                cyl_le: data.hasOwnProperty('cyl_le')?data.cyl_le:get_consult.cyl_le, 
                axis_le: data.hasOwnProperty('axis_le')?data.axis_le:get_consult.axis_le, 
                refr_type: data.hasOwnProperty('refr_type')?data.refr_type:get_consult.refr_type,  
                visit_date: data.hasOwnProperty('visit_date')?data.visit_date:get_consult.visit_date, 
                updated_by: (data.hasOwnProperty('user_id'))?data.user_id:get_consult.user_id, 
                updated_date: date
            }
            return resolve(consulting_data)
        } catch (error) {
            return reject(error);
        }
    })
}

function categories_data_to_schema_create_patient_opthol_sub_accept_data_to_create(read_connection, data, date) {
    return new Promise((resolve, reject) => {
        try {
            var consultDao = new ConsultDao();
            var consulting_data = {
                org_id: data.org_id, 
                branch_id: data.branch_id, 
                patient_id: data.patient_id,
                visit_no: data.visit_no,
                units: data.units, 
                sph_distance_re: data.sph_distance_re, 
                cyl_distance_re: data.cyl_distance_re, 
                axis_distance_re: data.axis_distance_re, 
                va_distance_re: data.va_distance_re, 
                sph_distance_le: data.sph_distance_le, 
                cyl_distance_le: data.cyl_distance_le, 
                axis_distance_le: data.axis_distance_le, 
                va_distance_le: data.va_distance_le, 
                sph_add_re: data.sph_add_re, 
                sph_add_le: data.sph_add_le, 
                sph_near_re: data.sph_near_re, 
                cyl_near_re: data.cyl_near_re, 
                axis_near_re: data.axis_near_re, 
                va_near_re: data.va_near_re, 
                sph_near_le: data.sph_near_le, 
                cyl_near_le: data.cyl_near_le, 
                axis_near_le: data.axis_near_le, 
                va_near_le: data.va_near_le, 
                visit_date: data.visit_date, 
                updated_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                updated_date: date, 
                created_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                created_date: date
            }
            return resolve(consulting_data)
        } catch (error) {
            return reject(error);
        }
    })
}

function categories_data_to_schema_create_patient_opthol_sub_accept_data_to_update(date, get_consult, data) {
    return new Promise((resolve, reject) => {
        try {
            var consultDao = new ConsultDao();
            var consulting_data = {
                units: data.hasOwnProperty('units')?data.units:get_consult.units, 
                sph_distance_re: data.hasOwnProperty('sph_distance_re')?data.sph_distance_re:get_consult.sph_distance_re, 
                cyl_distance_re: data.hasOwnProperty('cyl_distance_re')?data.cyl_distance_re:get_consult.cyl_distance_re, 
                axis_distance_re: data.hasOwnProperty('axis_distance_re')?data.axis_distance_re:get_consult.axis_distance_re, 
                va_distance_re: data.hasOwnProperty('va_distance_re')?data.va_distance_re:get_consult.va_distance_re, 
                sph_distance_le: data.hasOwnProperty('sph_distance_le')?data.sph_distance_le:get_consult.sph_distance_le, 
                cyl_distance_le: data.hasOwnProperty('cyl_distance_le')?data.cyl_distance_le:get_consult.cyl_distance_le, 
                axis_distance_le: data.hasOwnProperty('axis_distance_le')?data.axis_distance_le:get_consult.axis_distance_le, 
                va_distance_le: data.hasOwnProperty('va_distance_le')?data.va_distance_le:get_consult.va_distance_le, 
                sph_add_re: data.hasOwnProperty('sph_add_re')?data.sph_add_re:get_consult.sph_add_re, 
                sph_add_le: data.hasOwnProperty('sph_add_le')?data.sph_add_le:get_consult.sph_add_le, 
                sph_near_re: data.hasOwnProperty('sph_near_re')?data.sph_near_re:get_consult.sph_near_re, 
                cyl_near_re: data.hasOwnProperty('cyl_near_re')?data.cyl_near_re:get_consult.cyl_near_re, 
                axis_near_re: data.hasOwnProperty('axis_near_re')?data.axis_near_re:get_consult.axis_near_re, 
                va_near_re: data.hasOwnProperty('va_near_re')?data.va_near_re:get_consult.va_near_re, 
                sph_near_le: data.hasOwnProperty('sph_near_le')?data.sph_near_le:get_consult.sph_near_le, 
                cyl_near_le: data.hasOwnProperty('cyl_near_le')?data.cyl_near_le:get_consult.cyl_near_le, 
                axis_near_le: data.hasOwnProperty('axis_near_le')?data.axis_near_le:get_consult.axis_near_le, 
                va_near_le: data.hasOwnProperty('va_near_le')?data.va_near_le:get_consult.va_near_le, 
                visit_date: data.hasOwnProperty('visit_date')?data.visit_date:get_consult.visit_date, 
                updated_by: (data.hasOwnProperty('user_id'))?data.user_id:get_consult.user_id, 
                updated_date: date
            }
            return resolve(consulting_data)
        } catch (error) {
            return reject(error);
        }
    })
}

function categories_data_to_schema_create_patient_opthol_examination_data_to_create(read_connection, data, date) {
    return new Promise((resolve, reject) => {
        try {
            var consultDao = new ConsultDao();
            var consulting_data = {
                org_id: data.org_id,
                branch_id: data.branch_id,
                patient_id: data.patient_id,
                visit_no: data.visit_no,
                ant_eyelids_re: data.ant_eyelids_re,
                ant_eyelashes_re: data.ant_eyelashes_re,
                ant_conjuctiva_re: data.ant_conjuctiva_re,
                ant_cornea_re: data.ant_cornea_re,
                ant_champer_depth_re: data.ant_champer_depth_re,
                ant_iris_re: data.ant_iris_re,
                ant_pupil_re: data.ant_pupil_re,
                ant_lens_re: data.ant_lens_re,
                ant_sclera_re: data.ant_sclera_re,
                ant_eyelids_le: data.ant_eyelids_le,
                ant_eyelashes_le: data.ant_eyelashes_le,
                ant_conjuctiva_le: data.ant_conjuctiva_le,
                ant_cornea_le: data.ant_cornea_le,
                ant_champer_depth_le: data.ant_champer_depth_le,
                ant_iris_le: data.ant_iris_le,
                ant_pupil_le: data.ant_pupil_le,
                ant_lens_le: data.ant_lens_le,
                ant_sclera_le: data.ant_sclera_le,
                ant_eyelids_remarks_re: data.ant_eyelids_remarks_re,
                ant_eyelashes_remarks_re: data.ant_eyelashes_remarks_re,
                ant_conjuctiva_remarks_re: data.ant_conjuctiva_remarks_re,
                ant_cornea_remarks_re: data.ant_cornea_remarks_re,
                ant_champer_depth_remarks_re: data.ant_champer_depth_remarks_re,
                ant_iris_remarks_re: data.ant_iris_remarks_re,
                ant_pupil_remarks_re: data.ant_pupil_remarks_re,
                ant_lens_remarks_re: data.ant_lens_remarks_re,
                ant_sclera_remarks_re: data.ant_sclera_remarks_re,
                ant_eyelids_remarks_le: data.ant_eyelids_remarks_le,
                ant_eyelashes_remarks_le: data.ant_eyelashes_remarks_le,
                ant_conjuctiva_remarks_le: data.ant_conjuctiva_remarks_le,
                ant_cornea_remarks_le: data.ant_cornea_remarks_le,
                ant_champer_depth_remarks_le: data.ant_champer_depth_remarks_le,
                ant_iris_remarks_le: data.ant_iris_remarks_le,
                ant_pupil_remarks_le: data.ant_pupil_remarks_le,
                ant_lens_remarks_le: data.ant_lens_remarks_le,
                ant_sclera_remarks_le: data.ant_sclera_remarks_le,
                post_vitreous_re: data.post_vitreous_re,
                post_media_re: data.post_media_re,
                post_opticdisc_re: data.post_opticdisc_re,
                post_bloodvessels_re: data.post_bloodvessels_re,
                post_macula_re: data.post_macula_re,
                post_fundus_re: data.post_fundus_re,
                post_cdr_re: data.post_cdr_re,
                post_others_re: data.post_others_re,
                post_vitreous_le: data.post_vitreous_le,
                post_media_le: data.post_media_le,
                post_opticdisc_le: data.post_opticdisc_le,
                post_bloodvessels_le: data.post_bloodvessels_le,
                post_macula_le: data.post_macula_le,
                post_fundus_le: data.post_fundus_le,
                post_cdr_le: data.post_cdr_le,
                post_others_le: data.post_others_le,
                post_vitreous_remarks_re: data.post_vitreous_remarks_re,
                post_media_remarks_re: data.post_media_remarks_re,
                post_opticdisc_remarks_re: data.post_opticdisc_remarks_re,
                post_bloodvessels_remarks_re: data.post_bloodvessels_remarks_re,
                post_macula_remarks_re: data.post_macula_remarks_re,
                post_fundus_remarks_re: data.post_fundus_remarks_re,
                post_cdr_remarks_re: data.post_cdr_remarks_re,
                post_others_remarks_re: data.post_others_remarks_re,
                post_vitreous_remarks_le: data.post_vitreous_remarks_le,
                post_media_remarks_le: data.post_media_remarks_le,
                post_opticdisc_remarks_le: data.post_opticdisc_remarks_le,
                post_bloodvessels_remarks_le: data.post_bloodvessels_remarks_le,
                post_macula_remarks_le: data.post_macula_remarks_le,
                post_fundus_remarks_le: data.post_fundus_remarks_le,
                post_cdr_remarks_le: data.post_cdr_remarks_le,
                post_others_remarks_le: data.post_others_remarks_le,
                external_face: data.external_face,
                ocular_alignment: data.ocular_alignment,
                ocular_mobility: data.ocular_mobility,
                addl_remarks: data.addl_remarks,
                visit_date: data.visit_date,
                schirmerf_test:data.schirmerf_test,
                contract_sensitivity:data.contract_sensitivity,
                field_of_vision:data.field_of_vision,
                syringing:data.syringing,
                cover_test:data.cover_test,
                updated_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                updated_date: date, 
                created_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                created_date: date
            }
            return resolve(consulting_data)
        } catch (error) {
            return reject(error);
        }
    })
}

function categories_data_to_schema_create_patient_opthol__examination_data_to_update(date, get_consult, data) {
    return new Promise((resolve, reject) => {
        try {
            var consultDao = new ConsultDao();
            var consulting_data = {
                ant_eyelids_re: data.hasOwnProperty('ant_eyelids_re')?data.ant_eyelids_re:get_consult.ant_eyelids_re,
                ant_eyelashes_re: data.hasOwnProperty('ant_eyelashes_re')?data.ant_eyelashes_re:get_consult.ant_eyelashes_re,
                ant_conjuctiva_re: data.hasOwnProperty('ant_conjuctiva_re')?data.ant_conjuctiva_re:get_consult.ant_conjuctiva_re,
                ant_cornea_re: data.hasOwnProperty('ant_cornea_re')?data.ant_cornea_re:get_consult.ant_cornea_re,
                ant_champer_depth_re: data.hasOwnProperty('ant_champer_depth_re')?data.ant_champer_depth_re:get_consult.ant_champer_depth_re,
                ant_iris_re: data.hasOwnProperty('ant_iris_re')?data.ant_iris_re:get_consult.ant_iris_re,
                ant_pupil_re: data.hasOwnProperty('ant_pupil_re')?data.ant_pupil_re:get_consult.ant_pupil_re,
                ant_lens_re: data.hasOwnProperty('ant_lens_re')?data.ant_lens_re:get_consult.ant_lens_re,
                ant_sclera_re: data.hasOwnProperty('ant_sclera_re')?data.ant_sclera_re:get_consult.ant_sclera_re,
                ant_eyelids_le: data.hasOwnProperty('ant_eyelids_le')?data.ant_eyelids_le:get_consult.ant_eyelids_le,
                ant_eyelashes_le: data.hasOwnProperty('ant_eyelashes_le')?data.ant_eyelashes_le:get_consult.ant_eyelashes_le,
                ant_conjuctiva_le: data.hasOwnProperty('ant_conjuctiva_le')?data.ant_conjuctiva_le:get_consult.ant_conjuctiva_le,
                ant_cornea_le: data.hasOwnProperty('ant_cornea_le')?data.ant_cornea_le:get_consult.ant_cornea_le,
                ant_champer_depth_le: data.hasOwnProperty('ant_champer_depth_le')?data.ant_champer_depth_le:get_consult.ant_champer_depth_le,
                ant_iris_le: data.hasOwnProperty('ant_iris_le')?data.ant_iris_le:get_consult.ant_iris_le,
                ant_pupil_le: data.hasOwnProperty('ant_pupil_le')?data.ant_pupil_le:get_consult.ant_pupil_le,
                ant_lens_le: data.hasOwnProperty('ant_lens_le')?data.ant_lens_le:get_consult.ant_lens_le,
                ant_sclera_le: data.hasOwnProperty('ant_sclera_le')?data.ant_sclera_le:get_consult.ant_sclera_le,
                ant_eyelids_remarks_re: data.hasOwnProperty('ant_eyelids_remarks_re')?data.ant_eyelids_remarks_re:get_consult.ant_eyelids_remarks_re,
                ant_eyelashes_remarks_re: data.hasOwnProperty('ant_eyelashes_remarks_re')?data.ant_eyelashes_remarks_re:get_consult.ant_eyelashes_remarks_re,
                ant_conjuctiva_remarks_re: data.hasOwnProperty('ant_conjuctiva_remarks_re')?data.ant_conjuctiva_remarks_re:get_consult.ant_conjuctiva_remarks_re,
                ant_cornea_remarks_re: data.hasOwnProperty('ant_cornea_remarks_re')?data.ant_cornea_remarks_re:get_consult.ant_cornea_remarks_re,
                ant_champer_depth_remarks_re: data.hasOwnProperty('ant_champer_depth_remarks_re')?data.ant_champer_depth_remarks_re:get_consult.ant_champer_depth_remarks_re,
                ant_iris_remarks_re: data.hasOwnProperty('ant_iris_remarks_re')?data.ant_iris_remarks_re:get_consult.ant_iris_remarks_re,
                ant_pupil_remarks_re: data.hasOwnProperty('ant_pupil_remarks_re')?data.ant_pupil_remarks_re:get_consult.ant_pupil_remarks_re,
                ant_lens_remarks_re: data.hasOwnProperty('ant_lens_remarks_re')?data.ant_lens_remarks_re:get_consult.ant_lens_remarks_re,
                ant_sclera_remarks_re: data.hasOwnProperty('ant_sclera_remarks_re')?data.ant_sclera_remarks_re:get_consult.ant_sclera_remarks_re,
                ant_eyelids_remarks_le: data.hasOwnProperty('ant_eyelids_remarks_le')?data.ant_eyelids_remarks_le:get_consult.ant_eyelids_remarks_le,
                ant_eyelashes_remarks_le: data.hasOwnProperty('ant_eyelashes_remarks_le')?data.ant_eyelashes_remarks_le:get_consult.ant_eyelashes_remarks_le,
                ant_conjuctiva_remarks_le: data.hasOwnProperty('ant_conjuctiva_remarks_le')?data.ant_conjuctiva_remarks_le:get_consult.ant_conjuctiva_remarks_le,
                ant_cornea_remarks_le: data.hasOwnProperty('ant_cornea_remarks_le')?data.ant_cornea_remarks_le:get_consult.ant_cornea_remarks_le,
                ant_champer_depth_remarks_le: data.hasOwnProperty('ant_champer_depth_remarks_le')?data.ant_champer_depth_remarks_le:get_consult.ant_champer_depth_remarks_le,
                ant_iris_remarks_le: data.hasOwnProperty('ant_iris_remarks_le')?data.ant_iris_remarks_le:get_consult.ant_iris_remarks_le,
                ant_pupil_remarks_le: data.hasOwnProperty('ant_pupil_remarks_le')?data.ant_pupil_remarks_le:get_consult.ant_pupil_remarks_le,
                ant_lens_remarks_le: data.hasOwnProperty('ant_lens_remarks_le')?data.ant_lens_remarks_le:get_consult.ant_lens_remarks_le,
                ant_sclera_remarks_le: data.hasOwnProperty('ant_sclera_remarks_le')?data.ant_sclera_remarks_le:get_consult.ant_sclera_remarks_le,
                post_vitreous_re: data.hasOwnProperty('post_vitreous_re')?data.post_vitreous_re:get_consult.post_vitreous_re,
                post_media_re: data.hasOwnProperty('post_media_re')?data.post_media_re:get_consult.post_media_re,
                post_opticdisc_re: data.hasOwnProperty('post_opticdisc_re')?data.post_opticdisc_re:get_consult.post_opticdisc_re,
                post_bloodvessels_re: data.hasOwnProperty('post_bloodvessels_re')?data.post_bloodvessels_re:get_consult.post_bloodvessels_re,
                post_macula_re: data.hasOwnProperty('post_macula_re')?data.post_macula_re:get_consult.post_macula_re,
                post_fundus_re: data.hasOwnProperty('post_fundus_re')?data.post_fundus_re:get_consult.post_fundus_re,
                post_cdr_re: data.hasOwnProperty('post_cdr_re')?data.post_cdr_re:get_consult.post_cdr_re,
                post_others_re: data.hasOwnProperty('post_others_re')?data.post_others_re:get_consult.post_others_re,
                post_vitreous_le: data.hasOwnProperty('post_vitreous_le')?data.post_vitreous_le:get_consult.post_vitreous_le,
                post_media_le: data.hasOwnProperty('post_media_le')?data.post_media_le:get_consult.post_media_le,
                post_opticdisc_le: data.hasOwnProperty('post_opticdisc_le')?data.post_opticdisc_le:get_consult.post_opticdisc_le,
                post_bloodvessels_le: data.hasOwnProperty('post_bloodvessels_le')?data.post_bloodvessels_le:get_consult.post_bloodvessels_le,
                post_macula_le: data.hasOwnProperty('post_macula_le')?data.post_macula_le:get_consult.post_macula_le,
                post_fundus_le: data.hasOwnProperty('post_fundus_le')?data.post_fundus_le:get_consult.post_fundus_le,
                post_cdr_le: data.hasOwnProperty('post_cdr_le')?data.post_cdr_le:get_consult.post_cdr_le,
                post_others_le: data.hasOwnProperty('post_others_le')?data.post_others_le:get_consult.post_others_le,
                post_vitreous_remarks_re: data.hasOwnProperty('post_vitreous_remarks_re')?data.post_vitreous_remarks_re:get_consult.post_vitreous_remarks_re,
                post_media_remarks_re: data.hasOwnProperty('post_media_remarks_re')?data.post_media_remarks_re:get_consult.post_media_remarks_re,
                post_opticdisc_remarks_re: data.hasOwnProperty('post_opticdisc_remarks_re')?data.post_opticdisc_remarks_re:get_consult.post_opticdisc_remarks_re,
                post_bloodvessels_remarks_re: data.hasOwnProperty('post_bloodvessels_remarks_re')?data.post_bloodvessels_remarks_re:get_consult.post_bloodvessels_remarks_re,
                post_macula_remarks_re: data.hasOwnProperty('post_macula_remarks_re')?data.post_macula_remarks_re:get_consult.post_macula_remarks_re,
                post_fundus_remarks_re: data.hasOwnProperty('post_fundus_remarks_re')?data.post_fundus_remarks_re:get_consult.post_fundus_remarks_re,
                post_cdr_remarks_re: data.hasOwnProperty('post_cdr_remarks_re')?data.post_cdr_remarks_re:get_consult.post_cdr_remarks_re,
                post_others_remarks_re: data.hasOwnProperty('post_others_remarks_re')?data.post_others_remarks_re:get_consult.post_others_remarks_re,
                post_vitreous_remarks_le: data.hasOwnProperty('post_vitreous_remarks_le')?data.post_vitreous_remarks_le:get_consult.post_vitreous_remarks_le,
                post_media_remarks_le: data.hasOwnProperty('post_media_remarks_le')?data.post_media_remarks_le:get_consult.post_media_remarks_le,
                post_opticdisc_remarks_le: data.hasOwnProperty('post_opticdisc_remarks_le')?data.post_opticdisc_remarks_le:get_consult.post_opticdisc_remarks_le,
                post_bloodvessels_remarks_le: data.hasOwnProperty('post_bloodvessels_remarks_le')?data.post_bloodvessels_remarks_le:get_consult.post_bloodvessels_remarks_le,
                post_macula_remarks_le: data.hasOwnProperty('post_macula_remarks_le')?data.post_macula_remarks_le:get_consult.post_macula_remarks_le,
                post_fundus_remarks_le: data.hasOwnProperty('post_fundus_remarks_le')?data.post_fundus_remarks_le:get_consult.post_fundus_remarks_le,
                post_cdr_remarks_le: data.hasOwnProperty('post_cdr_remarks_le')?data.post_cdr_remarks_le:get_consult.post_cdr_remarks_le,
                post_others_remarks_le: data.hasOwnProperty('post_others_remarks_le')?data.post_others_remarks_le:get_consult.post_others_remarks_le,
                external_face: data.hasOwnProperty('external_face')?data.external_face:get_consult.external_face,
                ocular_alignment: data.hasOwnProperty('ocular_alignment')?data.ocular_alignment:get_consult.ocular_alignment,
                ocular_mobility: data.hasOwnProperty('ocular_mobility')?data.ocular_mobility:get_consult.ocular_mobility,
                addl_remarks: data.hasOwnProperty('addl_remarks')?data.addl_remarks:get_consult.addl_remarks,
                visit_date: data.hasOwnProperty('visit_date')?data.visit_date:get_consult.visit_date,
                schirmerf_test:data.hasOwnProperty('schirmerf_test')?data.schirmerf_test:get_consult.schirmerf_test,
                contract_sensitivity:data.hasOwnProperty('contract_sensitivity')?data.contract_sensitivity:get_consult.contract_sensitivity,
                field_of_vision:data.hasOwnProperty('field_of_vision')?data.field_of_vision:get_consult.field_of_vision,
                syringing:data.hasOwnProperty('syringing')?data.syringing:get_consult.syringing,
                cover_test:data.hasOwnProperty('cover_test')?data.cover_test:get_consult.cover_test,
                updated_by: (data.hasOwnProperty('user_id'))?data.user_id:get_consult.user_id, 
                updated_date: date
            }
            return resolve(consulting_data)
        } catch (error) {
            return reject(error);
        }
    })
}

function categories_data_to_schema_create_patient_opthol_intraocularpressure_data_to_create(connection, data, date) {
    return new Promise(async(resolve, reject) => {
        try {
            var consultDao = new ConsultDao();
            var seq_no = 0;          
           var get_seq_no =await consultDao.getPatientOptholIntraocularpressureMaxSNo(connection, data.org_id, data.branch_id, data.visit_no, data.patient_id);
            if(get_seq_no != null) {

                if(get_seq_no.seq_no != null) {
                    
                    seq_no = get_seq_no.seq_no + 1;
                }
                else{
                    seq_no = 1;
                   
                }
            }
            else {
                seq_no = 1;
                
            }
                     
            var consulting_data = {
                org_id: data.org_id,
                branch_id: data.branch_id,
                patient_id: data.patient_id,
                visit_no: data.visit_no,
                seq_no: seq_no,
                iop_type: data.iop_type,
                pressure_re: data.pressure_re,
                pressure_le: data.pressure_le,
                timer: data.timer,
                remarks: data.remarks,
                visit_date: data.visit_date,
                updated_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                updated_date: date, 
                created_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                created_date: date                
            }
            return resolve(consulting_data)
        } catch (error) {
            return reject(error);
        }
    })
}

function categories_data_to_schema_create_patient_opthol_intraocularpressure_data_to_update(date, get_consult, data) {
    return new Promise((resolve, reject) => {
        try {
            var consultDao = new ConsultDao();
            var consulting_data = {
                seq_no: data.hasOwnProperty('seq_no')?data.seq_no:get_consult.seq_no,
                iop_type: data.hasOwnProperty('iop_type')?data.iop_type:get_consult.iop_type,
                pressure_re: data.hasOwnProperty('pressure_re')?data.pressure_re:get_consult.pressure_re,
                pressure_le: data.hasOwnProperty('pressure_le')?data.pressure_le:get_consult.pressure_le,
                timer: data.hasOwnProperty('timer')?data.timer:get_consult.timer,
                remarks: data.hasOwnProperty('remarks')?data.remarks:get_consult.remarks,
                visit_date: data.hasOwnProperty('visit_date')?data.visit_date:get_consult.visit_date, 
                updated_by: (data.hasOwnProperty('user_id'))?data.user_id:get_consult.user_id, 
                updated_date: date
            }
            return resolve(consulting_data)
        } catch (error) {
            return reject(error);
        }
    })
}

function categories_data_to_schema_create_patient_opthol_diag_advise_data_to_create(read_connection, data, date) {
    return new Promise((resolve, reject) => {
        try {
            var consultDao = new ConsultDao();
            var consulting_data = {
                org_id: data.org_id,
                branch_id: data.branch_id,
                patient_id: data.patient_id,
                visit_no: data.visit_no,
                diagnosis_re: data.diagnosis_re,
                diagnosis_le: data.diagnosis_le,
                others: data.others,
                syst_diag: data.syst_diag,
                advise: data.advise,
                followup_date: data.followup_date,
                followup_reason: data.followup_reason,
                visit_date: data.visit_date,
                updated_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                updated_date: date, 
                created_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                created_date: date                
            }
            return resolve(consulting_data)
        } catch (error) {
            return reject(error);
        }
    })
}

function categories_data_to_schema_create_patient_opthol_diag_advise_data_to_update(date, get_consult, data) {
    return new Promise((resolve, reject) => {
        try {
            var consultDao = new ConsultDao();
            var consulting_data = {
                diagnosis_re: data.hasOwnProperty('diagnosis_re')?data.diagnosis_re:get_consult.diagnosis_re,
                diagnosis_le: data.hasOwnProperty('diagnosis_le')?data.diagnosis_le:get_consult.diagnosis_le,
                others: data.hasOwnProperty('others')?data.others:get_consult.others,
                syst_diag: data.hasOwnProperty('syst_diag')?data.syst_diag:get_consult.syst_diag,
                advise: data.hasOwnProperty('advise')?data.advise:get_consult.advise,
                followup_date: data.hasOwnProperty('followup_date')?data.followup_date:get_consult.followup_date,
                followup_reason: data.hasOwnProperty('followup_reason')?data.followup_reason:get_consult.followup_reason,
                visit_date: data.hasOwnProperty('visit_date')?data.visit_date:get_consult.visit_date, 
                updated_by: (data.hasOwnProperty('user_id'))?data.user_id:get_consult.user_id, 
                updated_date: date
            }
            return resolve(consulting_data)
        } catch (error) {
            return reject(error);
        }
    })
}

function categories_data_to_schema_create_patient_opthol_imagestorage_data_to_create(read_connection, data, date) {
    return new Promise((resolve, reject) => {
        try {
            var consultDao = new ConsultDao();
            var consulting_data = {
                org_id: data.org_id,
                branch_id: data.branch_id,
                patient_id: data.patient_id,
                visit_no: data.visit_no,
                seq_no: data.seq_no,
                image_path: data.image_path,
                re_le: data.re_le,
                remarks: data.remarks,
                visit_date: data.visit_date,
                updated_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                updated_date: date, 
                created_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                created_date: date                
            }
            return resolve(consulting_data)
        } catch (error) {
            return reject(error);
        }
    })
}

function categories_data_to_schema_create_patient_opthol_imagestorage_data_to_update(date, get_consult, data) {
    return new Promise((resolve, reject) => {
        try {
            var consultDao = new ConsultDao();
            var consulting_data = {
                seq_no: data.hasOwnProperty('seq_no')?data.seq_no:get_consult.seq_no,
                image_path: data.hasOwnProperty('image_path')?data.image_path:get_consult.image_path,
                re_le: data.hasOwnProperty('re_le')?data.re_le:get_consult.re_le,
                remarks: data.hasOwnProperty('remarks')?data.remarks:get_consult.remarks,
                visit_date: data.hasOwnProperty('visit_date')?data.visit_date:get_consult.visit_date, 
                updated_by: (data.hasOwnProperty('user_id'))?data.user_id:get_consult.user_id, 
                updated_date: date
            }
            return resolve(consulting_data)
        } catch (error) {
            return reject(error);
        }
    })
}

function categories_data_to_schema_create_patient_opthol_glass_prescription_data_to_create(read_connection, data, date) {
    return new Promise((resolve, reject) => {
        try {
            var consultDao = new ConsultDao();
            var consulting_data = {
                org_id: data.org_id,
                branch_id: data.branch_id,
                patient_id: data.patient_id,
                visit_no: data.visit_no,
                sph_distance_re: data.sph_distance_re,
                cyl_distance_re: data.cyl_distance_re,
                axis_distance_re: data.axis_distance_re,
                va_distance_re: data.va_distance_re,
                sph_distance_le: data.sph_distance_le,
                cyl_distance_le: data.cyl_distance_le,
                axis_distance_le: data.axis_distance_le,
                va_distance_le: data.va_distance_le,
                sph_add_re: data.sph_add_re,
                sph_add_le: data.sph_add_le,
                sph_near_re: data.sph_near_re,
                cyl_near_re: data.cyl_near_re,
                axis_near_re: data.axis_near_re,
                va_near_re: data.va_near_re,
                sph_near_le: data.sph_near_le,
                cyl_near_le: data.cyl_near_le,
                axis_near_le: data.axis_near_le,
                va_near_le: data.va_near_le,
                typeof_lens: data.typeof_lens,
                lens_material: data.lens_material,
                contact_lens: data.contact_lens,
                remarks: data.remarks,
                visit_date: data.visit_date,
                updated_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                updated_date: date, 
                created_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                created_date: date                
            }
            return resolve(consulting_data)
        } catch (error) {
            return reject(error);
        }
    })
}

function categories_data_to_schema_create_patient_opthol_glass_prescription_data_to_update(date, get_consult, data) {
    return new Promise((resolve, reject) => {
        try {
            var consultDao = new ConsultDao();
            var consulting_data = {
                sph_distance_re: data.hasOwnProperty('sph_distance_re')?data.sph_distance_re:get_consult.sph_distance_re,
                cyl_distance_re: data.hasOwnProperty('cyl_distance_re')?data.cyl_distance_re:get_consult.cyl_distance_re,
                axis_distance_re: data.hasOwnProperty('axis_distance_re')?data.axis_distance_re:get_consult.axis_distance_re,
                va_distance_re: data.hasOwnProperty('va_distance_re')?data.va_distance_re:get_consult.va_distance_re,
                sph_distance_le: data.hasOwnProperty('sph_distance_le')?data.sph_distance_le:get_consult.sph_distance_le,
                cyl_distance_le: data.hasOwnProperty('cyl_distance_le')?data.cyl_distance_le:get_consult.cyl_distance_le,
                axis_distance_le: data.hasOwnProperty('axis_distance_le')?data.axis_distance_le:get_consult.axis_distance_le,
                va_distance_le: data.hasOwnProperty('va_distance_le')?data.va_distance_le:get_consult.va_distance_le,
                sph_add_re: data.hasOwnProperty('sph_add_re')?data.sph_add_re:get_consult.sph_add_re,
                sph_add_le: data.hasOwnProperty('sph_add_le')?data.sph_add_le:get_consult.sph_add_le,
                sph_near_re: data.hasOwnProperty('sph_near_re')?data.sph_near_re:get_consult.sph_near_re,
                cyl_near_re: data.hasOwnProperty('cyl_near_re')?data.cyl_near_re:get_consult.cyl_near_re,
                axis_near_re: data.hasOwnProperty('axis_near_re')?data.axis_near_re:get_consult.axis_near_re,
                va_near_re: data.hasOwnProperty('va_near_re')?data.va_near_re:get_consult.va_near_re,
                sph_near_le: data.hasOwnProperty('sph_near_le')?data.sph_near_le:get_consult.sph_near_le,
                cyl_near_le: data.hasOwnProperty('cyl_near_le')?data.cyl_near_le:get_consult.cyl_near_le,
                axis_near_le: data.hasOwnProperty('axis_near_le')?data.axis_near_le:get_consult.axis_near_le,
                va_near_le: data.hasOwnProperty('va_near_le')?data.va_near_le:get_consult.va_near_le,
                typeof_lens: data.hasOwnProperty('typeof_lens')?data.typeof_lens:get_consult.typeof_lens,
                lens_material: data.hasOwnProperty('lens_material')?data.lens_material:get_consult.lens_material,
                contact_lens: data.hasOwnProperty('contact_lens')?data.contact_lens:get_consult.contact_lens,
                remarks: data.hasOwnProperty('remarks')?data.remarks:get_consult.remarks,
                visit_date: data.hasOwnProperty('visit_date')?data.visit_date:get_consult.visit_date, 
                updated_by: (data.hasOwnProperty('user_id'))?data.user_id:get_consult.user_id, 
                updated_date: date
            }
            return resolve(consulting_data)
        } catch (error) {
            return reject(error);
        }
    })
}

function categories_data_to_schema_pet_consult_data_to_create(connection, data, date, pet_data) {
    return new Promise(async(resolve, reject) => {
        try {
            var consultDao = new ConsultDao();
            var pet_consulting_data = {
                org_id: data.org_id,
                branch_id: data.branch_id, 
                dept_id: data.dept_id, 
                patient_id: data.patient_id,
                visit_no: data.visit_no, 
                heading: pet_data.heading,
                sub_heading: pet_data.sub_heading, 
                column_name_seq_no: pet_data.column_name_seq_no, 
                column_name_prefix: pet_data.column_name_prefix,
                column_name_text: pet_data.column_name_text,
                column_name_le: pet_data.column_name_le,
                column_name_re: pet_data.column_name_re,
                column_name_rem_re: pet_data.column_name_rem_re,
                column_name_rem_le: pet_data.column_name_rem_le,
                image_re:pet_data.image_re,
                image_le:pet_data.image_le,
                heading_seq_no:pet_data.heading_seq_no,
                sub_heading_seq_no:pet_data.sub_heading_seq_no
               
            }
            return resolve(pet_consulting_data)
        }
        catch (error) {
            return reject(error);    
        }
    })
}

function categories_data_to_schema_pet_data_to_update(date, get_consult, data) {
    return new Promise((resolve, reject) => {
        try {
            var consultDao = new ConsultDao();
            var consulting_data = {
                column_name_prefix: data.hasOwnProperty('column_name_prefix')?data.column_name_prefix:get_consult.column_name_prefix,
                column_name_text: data.hasOwnProperty('column_name_text')?data.column_name_text:get_consult.column_name_text,
                column_name_le: data.hasOwnProperty('column_name_le')?data.column_name_le:get_consult.column_name_le,
                column_name_re: data.hasOwnProperty('column_name_re')?data.column_name_re:get_consult.column_name_re,
                column_name_rem_re: data.hasOwnProperty('column_name_rem_re')?data.column_name_rem_re:get_consult.column_name_rem_re,
                column_name_rem_le: data.hasOwnProperty('column_name_rem_le')?data.column_name_rem_le:get_consult.column_name_rem_le
            }
            return resolve(consulting_data)
        } catch (error) {
            return reject(error);
        }
    })
}

function patientPetConsultHeader(read_connection, data, date, patient_consulting_data) {
    return new Promise(async(resolve, reject) => {
        try {
            var consulting_header_data, get_consult, set_pat_consultheader_data;
            var consultDao = new ConsultDao();
            get_consult = await consultDao.getPetConsulting(read_connection, data, patient_consulting_data);
            if(get_consult.hasOwnProperty('status') && get_consult.status == 404) {
                set_pat_consultheader_data = await categories_data_to_schema_pet_consult_header_data_to_create(read_connection, data, date, patient_consulting_data);
                consulting_header_data = await consultDao.createPetConsultingHeader(read_connection, set_pat_consultheader_data);  
                return resolve(consulting_header_data);
            }
            else{
                set_pat_consultheader_data = await categories_data_to_schema_pet_consult_header_data_to_update(read_connection, data, date, get_consult);
                consulting_header_data = await consultDao.updatePetConsultingHeader(read_connection, set_pat_consultheader_data);         
                return resolve(consulting_header_data);
            } 
        } catch (error) {
            return reject(error)
        }
    })
}

function categories_data_to_schema_pet_consult_header_data_to_create(connection, data, date, patient_consulting_data){
    return new Promise(async(resolve, reject) => {
        try {
            debug("Data", data)
            var consultDao = new ConsultDao();
            var pet_consulting_header_data = {
                org_id: data.org_id, 
                branch_id: data.branch_id,
                patient_id: data.patient_id,
                visit_no: patient_consulting_data.visit_no, 
                updated_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                updated_date: date, 
                created_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                created_date: date,
                attitude: data.attitude, 
                restraint_dtl: data.restraint_dtl, 
                concurrent_disease: data.concurrent_disease, 
                concurrent_disease_dtl: data.concurrent_disease_dtl, 
                lacrimation_right: data.lacrimation_right, 
                lacrimation_left: data.lacrimation_left, 
                pain_right: data.pain_right, 
                pain_left: data.pain_left, 
                blepharospasm_right: data.blepharospasm_right, 
                blepharospasm_left: data.blepharospasm_left, 
                photophobia_right: data.photophobia_right, 
                photophobia_left: data.photophobia_left
            }
            return resolve(pet_consulting_header_data)
        }
        catch (error) {
            return reject(error);    
        }
    })
}

function categories_data_to_schema_pet_consult_header_data_to_update(connection, data, date, get_consult){
    return new Promise(async(resolve, reject) => {
        try {
            debug("Data", data)
            var consultDao = new ConsultDao();
            var pet_consulting_header_data = {
                updated_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                updated_date: date, 
                attitude: data.hasOwnProperty("attitude")?data.attitude:get_consult.attitude, 
                restraint_dtl: data.hasOwnProperty("restraint_dtl")?data.restraint_dtl:get_consult.restraint_dtl, 
                concurrent_disease: data.hasOwnProperty("concurrent_disease")?data.concurrent_disease:get_consult.concurrent_disease, 
                concurrent_disease_dtl: data.hasOwnProperty("concurrent_disease_dtl")?data.concurrent_disease_dtl:get_consult.concurrent_disease_dtl, 
                lacrimation_right: data.hasOwnProperty("lacrimation_right")?data.lacrimation_right:get_consult.lacrimation_right, 
                lacrimation_left: data.hasOwnProperty("lacrimation_left")?data.lacrimation_left:get_consult.lacrimation_left, 
                pain_right: data.hasOwnProperty("pain_right")?data.pain_right:get_consult.pain_right, 
                pain_left: data.hasOwnProperty("pain_left")?data.pain_left:get_consult.pain_left, 
                blepharospasm_right: data.hasOwnProperty("blepharospasm_right")?data.blepharospasm_right:get_consult.blepharospasm_right, 
                blepharospasm_left: data.hasOwnProperty("blepharospasm_left")?data.blepharospasm_left:get_consult.blepharospasm_left, 
                photophobia_right: data.hasOwnProperty("photophobia_right")?data.photophobia_right:get_consult.photophobia_right, 
                photophobia_left: data.hasOwnProperty("photophobia_left")?data.photophobia_left:get_consult.photophobia_left 
            }
            return resolve(pet_consulting_header_data)
        }
        catch (error) {
            return reject(error);    
        }
    })
}

function categories_data_to_schema_pet_diagnosis_data_to_create(read_connection, data, date, pet_data){
    return new Promise(async(resolve, reject) => {
        try {
            var consultDao = new ConsultDao();
            var pet_consulting_data = {
                org_id: data.org_id,
                branch_id: data.branch_id, 
                dept_id: data.dept_id, 
                patient_id: data.patient_id,
                visit_no: data.visit_no, 
                tentative_diag: pet_data.tentative_diag, 
                confirm_diag: pet_data.confirm_diag, 
                direct_opthol: pet_data.direct_opthol, 
                indirect_opthol: pet_data.indirect_opthol, 
                diagnostic_agent: pet_data.diagnostic_agent, 
                advise: pet_data.advise, 
                slit_lamp_biomicroscopy: pet_data.slit_lamp_biomicroscopy,
                gonioscopy:pet_data.gonioscopy,
                a_scan_ultra_sonography:pet_data.a_scan_ultra_sonography,
                b_scan_ultra_sonography:pet_data.b_scan_ultra_sonography,
                keratometry:pet_data.keratometry,
                desired_iol_power:pet_data.desired_iol_power,
                created_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                created_date: date,
                updated_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                updated_date: date, 
               
            }
            return resolve(pet_consulting_data)
        }
        catch (error) {
            return reject(error);    
        }
    })
}

function categories_data_to_schema_pet_diagnosis_data_to_update(date, get_consult, data) {
    return new Promise((resolve, reject) => {
        try {
            var consultDao = new ConsultDao();
            var consulting_data = {
                tentative_diag: data.hasOwnProperty('tentative_diag')?data.tentative_diag:get_consult.tentative_diag, 
                confirm_diag: data.hasOwnProperty('confirm_diag')?data.confirm_diag:get_consult.confirm_diag, 
                direct_opthol: data.hasOwnProperty('direct_opthol')?data.direct_opthol:get_consult.direct_opthol, 
                indirect_opthol: data.hasOwnProperty('indirect_opthol')?data.indirect_opthol:get_consult.indirect_opthol, 
                diagnostic_agent: data.hasOwnProperty('diagnostic_agent')?data.diagnostic_agent:get_consult.diagnostic_agent, 
                advise: data.hasOwnProperty('advise')?data.advise:get_consult.advise, 
                updated_by: (data.hasOwnProperty('user_id'))?data.user_id:get_consult.user_id, 
                updated_date: date
            }
            return resolve(consulting_data)
        } catch (error) {
            return reject(error);
        }
    })
}

function categories_data_to_schema_pet_treatment_data_to_create(read_connection, data, date, pet_data){
    return new Promise(async(resolve, reject) => {
        try {
            var consultDao = new ConsultDao();
            var pet_consulting_data = {
                org_id: data.org_id,
                branch_id: data.branch_id, 
                dept_id: data.dept_id, 
                patient_id: data.patient_id,
                visit_no: data.visit_no, 
                medical_reco: pet_data.medical_reco, 
                medi_review_on: pet_data.medi_review_on, 
                surgical: pet_data.surgical, 
                postop_medi: pet_data.postop_medi, 
                op_review_on: pet_data.op_review_on, 
                discharge_summary: pet_data.discharge_summary,
                procedure_recommended:pet_data.procedure_recommended,
                procedure_performed:pet_data.procedure_performed,
                anesthisia_protocol:pet_data.anesthisia_protocol,
                surgical_procedure:pet_data.surgical_procedure,
                created_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                created_date: date,
                updated_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                updated_date: date, 
               
            }
            return resolve(pet_consulting_data)
        }
        catch (error) {
            return reject(error);    
        }
    })
}

function categories_data_to_schema_pet_treatment_data_to_update(date, get_consult, data) {
    return new Promise((resolve, reject) => {
        try {
            var consultDao = new ConsultDao();
            var consulting_data = {
                medical_reco: data.hasOwnProperty('medical_reco')?data.medical_reco:get_consult.medical_reco, 
                medi_review_on: data.hasOwnProperty('medi_review_on')?data.medi_review_on:get_consult.medi_review_on, 
                surgical: data.hasOwnProperty('surgical')?data.surgical:get_consult.surgical, 
                postop_medi: data.hasOwnProperty('postop_medi')?data.postop_medi:get_consult.postop_medi, 
                op_review_on: data.hasOwnProperty('op_review_on')?data.op_review_on:get_consult.op_review_on, 
                discharge_summary: data.hasOwnProperty('discharge_summary')?data.discharge_summary:get_consult.discharge_summary,
                updated_by: (data.hasOwnProperty('user_id'))?data.user_id:get_consult.user_id, 
                updated_date: date
            }
            return resolve(consulting_data)
        } catch (error) {
            return reject(error);
        }
    })
}

function categories_data_to_schema_create_upload_image(read_connection,data) {
    return new Promise((resolve, reject) => {
        try {
            var consultDao = new ConsultDao();
            var consulting_data = {
                org_id: data.org_id,
                branch_id: data.branch_id,
                patient_id: data.patient_id,
                dept_id: data.dept_id,
                visit_no: data.visit_no,
                heading_seq_no: data.heading_seq_no,
                sub_heading_seq_no: data.sub_heading_seq_no,
                column_name_seq_no: data.column_name_seq_no,
                image_re_path: data.image_re_path,
                image_le_path: data.image_le_path,
                column_name: data.column_name,
                heading: data.heading,
                sub_heading: data.sub_heading
            }
            return resolve(consulting_data)
        } catch (error) {
            debug(error);
            return reject(error);
        }
    })
}

function categories_data_to_schema_update_upload_image(date,get_consult, data,filepath) {
    return new Promise((resolve, reject) => {
        try {
            var consultDao = new ConsultDao();
            var consulting_data;
            if(data.eye == 'R'){
            consulting_data= {
                image_re_path: filepath
            }

        }else{
            consulting_data= {
                image_le_path: filepath
                
            }

        }
            return resolve(consulting_data)
        } catch (error) {
            return reject(error);
        }
    })
}

module.exports = {
   ConsultingModule,
   generateId
}