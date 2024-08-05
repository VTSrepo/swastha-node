const { InventoryDao } = require('../dao/inventory_dao');
var debug = require('debug')('v2:users:module');
const {changeLog} = require('../../common/error_handling');
var moment = require('moment-timezone');

class InventoryModule {

    createInventoryConfig(data,  query) {
        return new Promise(async (resolve, reject) => {
            var inventoryDao = new InventoryDao();
            var read_connection = null;
            var inventory_data, set_inventory_data;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            try {
                read_connection = await inventoryDao.getReadConnection();

                if(data.hasOwnProperty('product_id') && (data.product_id != null && data.product_id.length >5)) {
                    var get_inventory_data = await inventoryDao.getInventoryConfigDetail(read_connection, data.product_id, data.org_id, data.branch_id);
                    if(get_inventory_data.hasOwnProperty('status')) {
                        set_inventory_data = await categories_data_to_schema_inventory_config_to_create(read_connection, data, date);
                        debug("set_doctor_data", set_inventory_data)
                        inventory_data = await inventoryDao.createInventoryConfig(read_connection, set_inventory_data);
                        if (read_connection) {
                            await inventoryDao.releaseReadConnection(read_connection);
                        }
                        return resolve(inventory_data); 
                    }
                    else{
                        var update_inventory_config_data = await categories_data_to_schema_inventory_config_to_update(data, get_inventory_data, date);
                        inventory_data = await inventoryDao.updateInventoryConfig(read_connection, update_inventory_config_data, data.product_id, data.org_id, data.branch_id);
                        if (read_connection) {
                            await inventoryDao.releaseReadConnection(read_connection);
                        }
                        return resolve(inventory_data); 
                    }
                }
                else{
                    set_inventory_data = await categories_data_to_schema_inventory_config_to_create(read_connection, data, date);
                    debug("set_doctor_data", set_inventory_data)
                    inventory_data = await inventoryDao.createInventoryConfig(read_connection, set_inventory_data);
                    if (read_connection) {
                        await inventoryDao.releaseReadConnection(read_connection);
                    }
                    return resolve(inventory_data);
                }
            }
            catch (error) {
                debug("error", error)
                if (read_connection) {
                    await inventoryDao.releaseReadConnection(read_connection);
                }
                return reject(error)
            }
        })
    }

    createInventoryProduct(_data,  query) {
        return new Promise(async (resolve, reject) => {
            var inventoryDao = new InventoryDao();
            var read_connection = null;
            var inventory_data, set_inventory_data;
            var today = new Date();
            var date = moment(today).utc().format("YYYY-MM-DD");
            var inventory_products = [];
            try {
                read_connection = await inventoryDao.getReadConnection();
                for(var i in _data.inventory_products) {
                    var data = _data.inventory_products[i];
                    if((data.source_product_id && data.target_product_id)) {
                        var get_inventory_data = await inventoryDao.getInventoryProductMapDetail(read_connection, data.source_product_id, data.target_product_id, _data.org_id, _data.branch_id);
                        if(get_inventory_data.hasOwnProperty('status')) {
                            set_inventory_data = await categories_data_to_schema_inventory_product_map_to_create(read_connection, data, date, _data);
                            debug("set_doctor_data", set_inventory_data)
                            inventory_data = await inventoryDao.createInventoryProductMap(read_connection, set_inventory_data);
                            inventory_products.push(inventory_data);
                        }
                        else{
                            var update_inventory_config_data = await categories_data_to_schema_inventory_product_map_to_update(data, get_inventory_data, date, _data);
                            inventory_data = await inventoryDao.updateInventoryProductMap(read_connection, update_inventory_config_data, data.source_product_id, data.target_product_id, _data.org_id, _data.branch_id);
                            inventory_products.push(inventory_data);
                        }
                    }
                    else{
                        set_inventory_data = await categories_data_to_schema_inventory_product_map_to_create(read_connection, data, date, _data);
                        debug("set_doctor_data", set_inventory_data)
                        inventory_data = await inventoryDao.createInventoryProductMap(read_connection, set_inventory_data);
                        inventory_products.push(inventory_data);
                    } 
                }
                if (read_connection) {
                    await inventoryDao.releaseReadConnection(read_connection);
                }
                return resolve(inventory_products);
            }
            catch (error) {
                debug("error", error)
                if (read_connection) {
                    await inventoryDao.releaseReadConnection(read_connection);
                }
                return reject(error)
            }
        })
    }


    GetInventoryProductList(branch_id,source_product_id, query) {
        return new Promise(async(resolve, reject) => {
            var inventoryDao = new InventoryDao();
            var connection = null;
            var get_inventory_product;
            var eod_date; 
            if(query.filter.hasOwnProperty('eod_date')) {
             eod_date = moment(query.filter.eod_date).format("YYYY-MM-DD");
            }
            try {
                connection = await inventoryDao.getReadConnection();
                get_inventory_product = await inventoryDao.getInventoryProductList(connection, branch_id, source_product_id,query);
                if(get_inventory_product.hasOwnProperty('status') && get_inventory_product.status == 404) {
                    if (connection) {
                        await supplierDao.releaseReadConnection(connection);
                    }
                    return resolve(get_inventory_product);
                }
                else{
                    var total_size = get_inventory_product.length;
                    var page_size = get_inventory_product.length//query.skip ? query.skip : total_size;
                    var result_size = get_inventory_product.length//strLimit;
                    console.log("Totalsize :", total_size);
                    var summary = {
                        filteredsize: page_size, resultsize: result_size, totalsize: total_size
                    };
                    var res = {
                        summary, results: get_inventory_product
                    }
                    debug("GetInventoryProductList", get_inventory_product)
                    if (connection) {
                        await inventoryDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                }
            }
            catch(error) {
                if (connection) {
                    await inventoryDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }
    GetInventoryConfigList(branch_id, query) {
        return new Promise(async(resolve, reject) => {
            var inventoryDao = new InventoryDao();
            var connection = null;
            var get_inventory_product;
            var eod_date; 
            if(query.filter.hasOwnProperty('eod_date')) {
             eod_date = moment(query.filter.eod_date).format("YYYY-MM-DD");
            }
            try {
                connection = await inventoryDao.getReadConnection();
                get_inventory_product = await inventoryDao.getInventoryConfigList(connection, branch_id,query);
                if(get_inventory_product.hasOwnProperty('status') && get_inventory_product.status == 404) {
                    if (connection) {
                        await supplierDao.releaseReadConnection(connection);
                    }
                    return resolve(get_inventory_product);
                }
                else{
                    var total_size = get_inventory_product.length;
                    var page_size = get_inventory_product.length//query.skip ? query.skip : total_size;
                    var result_size = get_inventory_product.length//strLimit;
                    console.log("Totalsize :", total_size);
                    var summary = {
                        filteredsize: page_size, resultsize: result_size, totalsize: total_size
                    };
                    var res = {
                        summary, results: get_inventory_product
                    }
                    debug("GetInventoryProductList", get_inventory_product)
                    if (connection) {
                        await inventoryDao.releaseReadConnection(connection);
                    }
                    return resolve(res)
                }
            }
            catch(error) {
                if (connection) {
                    await inventoryDao.releaseReadConnection(connection);
                }
                return reject(error)
            }
        })
    }

    
   
}

function categories_data_to_schema_inventory_config_to_create(connection, data,  date){
    return new Promise(async(resolve, reject) => {
        try {
            var inventory_data = {
                org_id: data.org_id, 
                branch_id: data.branch_id,
                part_of_inventory: data.part_of_inventory,
                product_id: data.product_id,
                updated_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                updated_date: date, 
                created_by: (data.hasOwnProperty('user_id'))?data.user_id:null, 
                created_date: date
            }
            return resolve(inventory_data)
        }
        catch (error) {
            return reject(error);    
        }
    })
}

function categories_data_to_schema_inventory_config_to_update(data, get_inventory_data, date){
    return new Promise(async(resolve, reject) => {
        try {
         
            var inventory_data = {
                part_of_inventory: (data.hasOwnProperty('part_of_inventory'))?data.part_of_inventory:get_inventory_data.part_of_inventory,
                updated_by : (data.hasOwnProperty('user_id'))?data.user_id:get_inventory_data.user_id,  
                updated_date: date
            }
            return resolve(inventory_data);
        }
        catch (error) {
            return reject(error);    
        }
    })
}

function categories_data_to_schema_inventory_product_map_to_create(connection, data,  date, _data){
    return new Promise(async(resolve, reject) => {
        try {
            var inventory_data = {
                org_id: _data.org_id, 
                branch_id: _data.branch_id,
                source_product_id: data.source_product_id,
                target_product_id: data.target_product_id,
                qty_impact: data.qty_impact,
                active_flag: (data.active_flag)?data.active_flag:"Y",
                updated_by: (_data.hasOwnProperty('user_id'))?_data.user_id:null, 
                updated_date: date, 
                created_by: (_data.hasOwnProperty('user_id'))?_data.user_id:null, 
                created_date: date
            }
            return resolve(inventory_data)
        }
        catch (error) {
            return reject(error);    
        }
    })
}

function categories_data_to_schema_inventory_product_map_to_update(data, get_inventory_data, date, _data){
    return new Promise(async(resolve, reject) => {
        try {
         
            var inventory_data = {
                qty_impact: (data.hasOwnProperty('qty_impact'))?data.qty_impact:get_inventory_data.qty_impact,
                active_flag: (data.hasOwnProperty('active_flag'))?data.active_flag:get_inventory_data.active_flag,
                updated_by : (_data.hasOwnProperty('user_id'))?_data.user_id:get_inventory_data.user_id,  
                updated_date: date
            }
            return resolve(inventory_data);
        }
        catch (error) {
            return reject(error);    
        }
    })
}


module.exports = {
   InventoryModule
}