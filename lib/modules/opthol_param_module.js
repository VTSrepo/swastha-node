const { OptholParamDao } = require('../dao/opthol_param_dao');
var debug = require('debug')('v2:optholparam:module');
var moment = require('moment-timezone');


class OptholParamModule {
    CreateOptholParam(data,  query) {
        return new Promise(async (resolve, reject) => {
            var optholParamDao = new OptholParamDao();
            var read_connection = null;
            var opthol_data, set_opthol_data;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            try {
                read_connection = await optholParamDao.getReadConnection();
/* 
                if(data.hasOwnProperty('visit_no') && (data.visit_no != null && data.visit_no.length >5)) {
                    var get_opthol_param_data = await optholParamDao.getOptholParamDetailData(read_connection, data);
                    if(get_opthol_param_data == null) {
                        set_opthol_data = await categories_data_to_schema_opthol_param_detail_data_to_create(read_connection, data, date);
                        debug("set_opthol_data", set_opthol_data)
                        opthol_data = await optholParamDao.createOptholParamData(read_connection, set_opthol_data);
                        if (read_connection) {
                            await optholParamDao.releaseReadConnection(read_connection);
                        }
                        return resolve(opthol_data); 
                    }
                    else{
                        var update_opthol_param_data = await categories_data_to_schema_opthol_param_detail_to_update(data, get_opthol_param_data, date);
                        opthol_data = await optholParamDao.updateOptholParamData(read_connection, update_opthol_param_data, data);
                        if (read_connection) {
                            await optholParamDao.releaseReadConnection(read_connection);
                        }
                        return resolve(opthol_data); 
                    }
                }
                else{ */
                    set_opthol_data = await categories_data_to_schema_opthol_param_detail_data_to_create(read_connection, data, date);
                    debug("set_doctor_data", set_opthol_data)
                    // opthol_data = await optholParamDao.createOptholParamData(read_connection, set_opthol_data);
                    if (read_connection) {
                        await optholParamDao.releaseReadConnection(read_connection);
                    }
                    return resolve(data);
                // }
            }
            catch (error) {
                debug("error", error)
                if (read_connection) {
                    await optholParamDao.releaseReadConnection(read_connection);
                }
                return reject(error)
            }
        })
    }

    GetOptholParamDetail(org_id, branch_id, query){
        return new Promise(async (resolve, reject) => {
            var optholParamDao = new OptholParamDao();
            var read_connection = null;
            var get_param, db_name;
            try {
                if(query.filter.param_type) {
                    if(query.filter.param_type.toLowerCase() == 'basic') {
                        db_name = 'Swastha_Opthol_Basic_Visit_Detail';
                    }
                    else if(query.filter.param_type.toLowerCase() == 'refraction') {
                        db_name = 'Swastha_Opthol_Refraction_Visit_Detail'; 
                    }
                    else {
                        db_name = 'Swastha_Opthol_Spex_Visit_Detail';
                    }
                }
                else{
                    var err_code = { status: 404, code: 4001, message: "Please Enter Param Type!.", developerMessage:"Please Enter Param Type!." };
                    if (read_connection) {
                        await optholParamDao.releaseReadConnection(read_connection);
                    }
                    return resolve(err_code);
                }

                read_connection = await optholParamDao.getReadConnection();

                get_param = await optholParamDao.getOptholParamDetail(read_connection, org_id, branch_id, query, db_name);
                if (get_param.hasOwnProperty('status') && get_param.status == 404) {
                    if (read_connection) {
                        await optholParamDao.releaseReadConnection(read_connection);
                    }
                    return resolve(get_param);
                }
                else{
                    if (read_connection) {
                        await optholParamDao.releaseReadConnection(read_connection);
                    }
                    console.log("Param Totalsize :", get_param);
                    /* var total_size = get_param.length;
                    var page_size = get_param.length;
                    var result_size = get_param.length; */
                    var summary = {
                        filteredsize: get_param.length, resultsize: get_param.length, totalsize: get_param.length
                    };
                    var res = {
                        summary, results: get_param
                    }
                    return resolve(res);
                }
            }
            catch (error) {
                debug("Error in get", error)
                if (read_connection) {
                    await optholParamDao.releaseReadConnection(read_connection);
                }
                return reject(error)
            }
        })
    }

    CreateOptholSlitlamp(data,  query) {
        return new Promise(async (resolve, reject) => {
            var optholParamDao = new OptholParamDao();
            var read_connection = null;
            var opthol_data, set_opthol_data;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            try {
                read_connection = await optholParamDao.getReadConnection();

                if(data.hasOwnProperty('visit_no') && (data.visit_no != null && data.visit_no.length >5)) {
                    var get_opthol_param_data = await optholParamDao.getOptholSlitlampData(read_connection, data);
                    if(get_opthol_param_data == null) {
                        set_opthol_data = await categories_data_to_schema_opthol_slitlamp_data_to_create(read_connection, data, date);
                        debug("set_opthol_data", set_opthol_data)
                        if (read_connection) {
                            await optholParamDao.releaseReadConnection(read_connection);
                        }
                        return resolve(opthol_data); 
                    }
                    else{
                        var update_opthol_param_data = await categories_data_to_schema_opthol_slitlamp_to_update(data, get_opthol_param_data, date);
                        opthol_data = await optholParamDao.updateOptholSlitlampData(read_connection, update_opthol_param_data, data);
                        if (read_connection) {
                            await optholParamDao.releaseReadConnection(read_connection);
                        }
                        return resolve(opthol_data); 
                    }
                }
                else{
                    set_opthol_data = await categories_data_to_schema_opthol_slitlamp_data_to_create(read_connection, data, date);
                    debug("set_opthol_data", set_opthol_data)
                    if (read_connection) {
                        await optholParamDao.releaseReadConnection(read_connection);
                    }
                    return resolve(data);
                }
            }
            catch (error) {
                debug("error", error)
                if (read_connection) {
                    await optholParamDao.releaseReadConnection(read_connection);
                }
                return reject(error)
            }
        })
    }

    GetOptholSlitlamp(org_id, branch_id, query){
        return new Promise(async (resolve, reject) => {
            var optholParamDao = new OptholParamDao();
            var read_connection = null;
            var get_param, db_name;
            try {
                db_name = 'Swastha_Slit_Lamp_Exam_Visit_Detail';

                read_connection = await optholParamDao.getReadConnection();

                console.log("Query value in get", query)

                get_param = await optholParamDao.getOptholParamDetail(read_connection, org_id, branch_id, query, db_name);
                if (get_param.hasOwnProperty('status') && get_param.status == 404) {
                    if (read_connection) {
                        await optholParamDao.releaseReadConnection(read_connection);
                    }
                    return resolve(get_param);
                }
                else{
                    if (read_connection) {
                        await optholParamDao.releaseReadConnection(read_connection);
                    }
                    console.log("Param Totalsize :", get_param);
                    /* var total_size = get_param.length;
                    var page_size = get_param.length;
                    var result_size = get_param.length; */
                    var summary = {
                        filteredsize: get_param.length, resultsize: get_param.length, totalsize: get_param.length
                    };
                    var res = {
                        summary, results: get_param
                    }
                    return resolve(res);
                }
            }
            catch (error) {
                debug("Error in get", error)
                if (read_connection) {
                    await optholParamDao.releaseReadConnection(read_connection);
                }
                return reject(error)
            }
        })
    }
}

function generateId(connection, data, seq_type, db_name) {
    return new Promise(async(resolve, reject) => {
        var optholParamDao = new OptholParamDao();
        var check_opthol_visit_no, check_opthol_visit_no;
        
        try{
            check_opthol_visit_no = await optholParamDao.getOpotholParamVisitNo(connection,data, seq_type, db_name);
            if(check_opthol_visit_no != null) {
                var visit_no = check_opthol_visit_no.visit_no + 1;
                return resolve(visit_no);
            }
            else{
               return resolve(1)
            }
        }
        catch(error) {
            return reject(error)
        }
    })
}

function categories_data_to_schema_opthol_param_detail_data_to_create(connection, data, date){
    return new Promise(async(resolve, reject) => {
        try {
            var optholParamDao = new OptholParamDao();
            var visit_date, db_name, set_opthol_data;
            if(data.hasOwnProperty('visit_date')) {
                var visitdate = new Date(data.visit_date);
                visit_date = moment(visitdate).utc().format("YYYY-MM-DD");
            }
            else{  
                visit_date = null;
            }

            if(data.param_type.toLowerCase() == 'basic') {
                db_name = 'Swastha_Opthol_Basic_Visit_Detail';
            }
            else if(data.param_type.toLowerCase() == 'refraction') {
                db_name = 'Swastha_Opthol_Refraction_Visit_Detail'; 
            }
            else {
                db_name = 'Swastha_Opthol_Spex_Visit_Detail';
            }
            var seq_type = 'OPTHAL';
            var visit_no = await generateId(connection, data, seq_type, "Patient_Consult_Header");
            if(data.param_type.toLowerCase() == 'basic') {
                set_opthol_data = {
                    org_id: data.org_id, 
                    branch_id: data.branch_id, 
                    patient_id: data.patient_id, 
                    visit_no: visit_no, 
                    ext_exam_re: data.ext_exam_re,
                    ext_exam_le: data.ext_exam_le,
                    fund_exam_re: data.fund_exam_re,
                    fund_exam_le: data.fund_exam_le,
                    ocular_re: data.ocular_re,
                    ocular_le: data.ocular_le,
                    pupils_re: data.pupils_re,
                    pupils_le: data.pupils_le,
                    slit_exam_re: data.slit_exam_re,
                    slit_exam_le: data.slit_exam_le,
                    vis_act_re: data.vis_act_re,
                    vis_act_le: data.vis_act_le,
                    visit_date: visit_date,
                    updated_by: data.user_id, 
                    updated_date: date, 
                    created_by: data.user_id, 
                    created_date: date
                }
            }
            else if(data.param_type.toLowerCase() == 'refraction') {
                set_opthol_data = {
                    org_id: data.org_id, 
                    branch_id: data.branch_id, 
                    patient_id: data.patient_id, 
                    visit_no: visit_no,
                    final_rx_re: data.final_rx_re,
                    final_rx_le: data.final_rx_le,
                    old_rx_re: data.old_rx_re,
                    old_rx_le: data.old_rx_le,
                    retina_re: data.retina_re,
                    retina_le: data.retina_le,
                    unaided_va_re: data.unaided_va_re,
                    unaided_va_le: data.unaided_va_le,
                    varx_re: data.varx_re,
                    varx_le: data.varx_le,
                    va_newrx_re: data.va_newrx_re,
                    va_newrx_le: data.va_newrx_le,
                    visit_date: visit_date,
                    updated_by: data.user_id, 
                    updated_date: date, 
                    created_by: data.user_id, 
                    created_date: date
                }    
            }
            else {
                set_opthol_data = {
                    org_id: data.org_id, 
                    branch_id: data.branch_id, 
                    patient_id: data.patient_id, 
                    visit_no: visit_no, 
                    add_re: data.add_re,
                    add_le: data.add_le,
                    axis_re: data.axis_re, 
                    axis_le: data.axis_le, 
                    cylinder_re: data.cylinder_re, 
                    cylinder_le: data.cylinder_le,
                    sphere_re: data.sphere_re, 
                    sphere_le: data.sphere_le, 
                    visit_date: visit_date,
                    updated_by: data.user_id, 
                    updated_date: date, 
                    created_by: data.user_id, 
                    created_date: date
                }
    
                    
            }
            var opthol_data = await optholParamDao.createOptholParamData(connection, set_opthol_data, db_name);
            return resolve(opthol_data)
        }
        catch (error) {
            return reject(error);    
        }
    })
}

function categories_data_to_schema_opthol_param_detail_to_update(data, get_opthol_param_data, date){
    return new Promise(async(resolve, reject) => {
        try {
            var visit_date;
            if(data.hasOwnProperty('visit_date')) {
                var visitdate = new Date(data.visit_date);
                visit_date = moment(visitdate).utc().format("YYYY-MM-DD");
            }
            else{  
                visit_date = null;
            }
            var category_data = {
                param_type: (data.hasOwnProperty('param_type'))?data.param_type:get_opthol_param_data.param_type,
                param_value_RE: (data.hasOwnProperty('param_value_RE'))?data.param_value_RE:get_opthol_param_data.param_value_RE,
                param_value_LE: (data.hasOwnProperty('param_value_LE'))?data.param_value_LE:get_opthol_param_data.param_value_LE,
                visit_date: (data.hasOwnProperty('visit_date'))?visit_date:get_opthol_param_data.visit_date,
                updated_by : (data.hasOwnProperty('user_id'))?data.user_id:get_opthol_param_data.user_id,  
                updated_date: date
            }
            return resolve(category_data);
        }
        catch (error) {
            return reject(error);    
        }
    })
}

function categories_data_to_schema_opthol_slitlamp_data_to_create(connection, data, date){
    return new Promise(async(resolve, reject) => {
        try {
            var optholParamDao = new OptholParamDao();
            var visit_date, db_name, set_opthol_data;
            if(data.hasOwnProperty('visit_date')) {
                var visitdate = new Date(data.visit_date);
                visit_date = moment(visitdate).utc().format("YYYY-MM-DD");
            }
            else{
                var visitdate = new Date();
                visit_date = moment(visitdate).utc().format("YYYY-MM-DD");
            }

            db_name = 'Swastha_Slit_Lamp_Exam_Visit_Detail';
            var seq_type = 'OPTHAL';
            var visit_no = await generateId(connection, data, seq_type, db_name);

            set_opthol_data = {
                org_id: data.org_id,
                branch_id: data.branch_id,
                patient_id: data.patient_id, 
                visit_no: visit_no, 
                lids_lashes: data.lids_lashes, 
                conjuctiva: data.conjuctiva, 
                cornea: data.cornea, 
                anterior_chamber: data.anterior_chamber, 
                iris: data.iris, 
                lens: data.lens, 
                anterior_vitrious: data.anterior_vitrious, 
                undilated_fundus: data.undilated_fundus, 
                dilated_fundus: data.dilated_fundus, 
                fundus_findings: data.fundus_findings, 
                lids_lashes_remarks: data.lids_lashes_remarks, 
                conjuctiva_remarks: data.conjuctiva_remarks, 
                cornea_remarks: data.cornea_remarks, 
                anterior_chamber_remarks: data.anterior_chamber_remarks, 
                iris_remarks: data.iris_remarks, 
                lens_remarks: data.lens_remarks, 
                anterior_vitrious_remarks: data.anterior_vitrious_remarks, 
                undilated_fundus_remarks: data.undilated_fundus_remarks, 
                dilated_fundus_remarks: data.dilated_fundus_remarks, 
                fundus_findings_remarks: data.fundus_findings_remarks, 
                visit_date: visit_date, 
                updated_by: data.user_id, 
                updated_date: date, 
                created_by: data.user_id, 
                created_date: date,
            }
            var opthol_data = await optholParamDao.createOptholParamData(connection, set_opthol_data, db_name);
            return resolve(opthol_data)
        }
        catch (error) {
            return reject(error);    
        }
    })
}

function categories_data_to_schema_opthol_slitlamp_to_update(data, get_opthol_param_data, date){
    return new Promise(async(resolve, reject) => {
        try {
            var visit_date;
            if(data.hasOwnProperty('visit_date')) {
                var visitdate = new Date(data.visit_date);
                visit_date = moment(visitdate).utc().format("YYYY-MM-DD");
            }
            else{  
                visit_date = get_opthol_param_data.visit_date;
            }
            
            var category_data = {
                lids_lashes: (data.hasOwnProperty('lids_lashes'))?data.lids_lashes:get_opthol_param_data.lids_lashes,
                conjuctiva: (data.hasOwnProperty('conjuctiva'))?data.conjuctiva:get_opthol_param_data.conjuctiva,
                cornea: (data.hasOwnProperty('cornea'))?data.cornea:get_opthol_param_data.cornea,
                anterior_chamber: (data.hasOwnProperty('anterior_chamber'))?data.anterior_chamber:get_opthol_param_data.anterior_chamber,
                iris: (data.hasOwnProperty('iris'))?data.iris:get_opthol_param_data.iris,
                lens: (data.hasOwnProperty('lens'))?data.lens:get_opthol_param_data.lens,
                anterior_vitrious: (data.hasOwnProperty('anterior_vitrious'))?data.anterior_vitrious:get_opthol_param_data.anterior_vitrious,
                undilated_fundus: (data.hasOwnProperty('undilated_fundus'))?data.undilated_fundus:get_opthol_param_data.undilated_fundus,
                dilated_fundus: (data.hasOwnProperty('dilated_fundus'))?data.dilated_fundus:get_opthol_param_data.dilated_fundus,
                fundus_findings: (data.hasOwnProperty('fundus_findings'))?data.fundus_findings:get_opthol_param_data.fundus_findings,
                lids_lashes_remarks: (data.hasOwnProperty('lids_lashes_remarks'))?data.lids_lashes_remarks:get_opthol_param_data.lids_lashes_remarks,
                conjuctiva_remarks: (data.hasOwnProperty('conjuctiva_remarks'))?data.conjuctiva_remarks:get_opthol_param_data.conjuctiva_remarks,
                cornea_remarks: (data.hasOwnProperty('cornea_remarks'))?data.cornea_remarks:get_opthol_param_data.cornea_remarks, 
                anterior_chamber_remarks: (data.hasOwnProperty('anterior_chamber_remarks'))?data.anterior_chamber_remarks:get_opthol_param_data.anterior_chamber_remarks,
                iris_remarks: (data.hasOwnProperty('iris_remarks'))?data.iris_remarks:get_opthol_param_data.iris_remarks,
                lens_remarks: (data.hasOwnProperty('lens_remarks'))?data.lens_remarks:get_opthol_param_data.lens_remarks,
                anterior_vitrious_remarks: (data.hasOwnProperty('anterior_vitrious_remarks'))?data.anterior_vitrious_remarks:get_opthol_param_data.anterior_vitrious_remarks,
                undilated_fundus_remarks: (data.hasOwnProperty('undilated_fundus_remarks'))?data.undilated_fundus_remarks:get_opthol_param_data.undilated_fundus_remarks,
                dilated_fundus_remarks: (data.hasOwnProperty('dilated_fundus_remarks'))?data.dilated_fundus_remarks:get_opthol_param_data.dilated_fundus_remarks,
                fundus_findings_remarks: (data.hasOwnProperty('fundus_findings_remarks'))?data.fundus_findings_remarks:get_opthol_param_data.fundus_findings_remarks,
                visit_date: visit_date,
                updated_by : (data.hasOwnProperty('user_id'))?data.user_id:get_opthol_param_data.user_id,  
                updated_date: date
            }
            return resolve(category_data);
        }
        catch (error) {
            return reject(error);    
        }
    })
}

module.exports = {
    OptholParamModule
}