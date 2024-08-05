const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const app = express();

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });
//const upload = multer({ storage: storage });

//const { headersCors } = require('./common/header_cors');
const cors = require('cors');
//var upload = multer({ dest: 'upload/'});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: '100mb' }))
// var request = require("request");
// 	request("https://dev1.vibhavatech.com",function(error,response,body)
// 	{
// 	//	console.log(body);
//   console.log("Start");
// 	});
app.use(cors({
  'Access-Control-Allow-Origin': ['https://dev1.vibhavatech.com','https://dev2.vibhavatech.com','https://vibhavatech.com', 'http://localhost:4200', 'http://localhost:4003','https://krc.vibhavatech.com']
}));
//app.use(cors("Access-Control-Allow-Origin", "*"));
const aqp = require('api-query-params');
const { UserAction } = require('./lib/action/user_action');
const { DoctorAction } = require('./lib/action/doctor_action');
const { PatientAction } = require('./lib/action/patient_action');
const { AppointmentAction } = require('./lib/action/appointment_action');
const { BusinessAction } = require('./lib/action/business_action');
const { ProductAction } = require('./lib/action/product_action');
const { BillingAction } = require('./lib/action/billing_action');
const { BillingTempAction } = require('./lib/action/billingtemp_action');
const { MasterAction } = require('./lib/action/master_action');
const { ConsultAction } = require('./lib/action/consulting_action');
const { AdvancePaymentAction } = require('./lib/action/advance_payment_action');
const { PatientInsAction } = require('./lib/action/patient_ins_action');
const { PoAction } = require('./lib/action/po_action');
const { SupplierAction } = require('./lib/action/supplier_action');
const { InventoryAction } = require('./lib/action/inventory_action');
const { OptholParamAction } = require('./lib/action/opthol_param_action');
var debug = require('debug')('v2:app:app');
var event = {
  stageVariables: {
    'env': process.env.ENV
  }
}

var userAction = new UserAction();
var doctorAction = new DoctorAction();
var patientAction = new PatientAction();
var appointmentAction = new AppointmentAction();
var businessAction = new BusinessAction();
var productAction = new ProductAction();
var billingAction = new BillingAction();
var billingTempAction = new BillingTempAction();
var masterAction = new MasterAction();
var consultAction = new ConsultAction();
var advancePaymentAction = new AdvancePaymentAction();
var patientInsAction = new PatientInsAction();
var poAction = new PoAction();
var supplierAction = new SupplierAction();
var inventoryAction = new InventoryAction();
var optholParamAction = new OptholParamAction();
app.use(express.static('vts/'));
app.use(express.static('assets/'));
//app.use(express.static('VTS-LATEST/'));
const path = require('path');
app.get('/', function(req,res) {
  console.log("Angular-->");
  res.sendFile(path.join(__dirname, 'vts/index.html'));
});

app.post('/login', function (req, res) {
  event.headers = req.headers;
  event.body = req.body;
  event.queryParameters = aqp(req.query);
  userAction.getUserLogin(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.post('/createpatient', function (req, res) {
  event.headers = req.headers;
  event.body = req.body;
  event.queryParameters = aqp(req.query);
  patientAction.CreatePatients(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})





app.put('/updatepatient/:patient_id', function (req, res) {
  event.headers = req.headers;
  event.body = req.body;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  patientAction.UpdatePatient(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.get('/patients/:branch_id', function (req, res) {
  event.headers = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  patientAction.GetPatients(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.post('/bookappointments', function (req, res) {
  event.headers = req.headers;
  event.body = req.body;
  event.queryParameters = aqp(req.query);
  appointmentAction.BookAppointments(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.put('/updateappointment/:appoint_id', function (req, res) {
  event.headers = req.headers;
  event.body = req.body;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  appointmentAction.UpdateAppointment(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.get('/appointments/:branch_id', function (req, res){
  event.header = req.headers;
  event.body = req.body;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  appointmentAction.GetAppointments(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})

app.get('/appointment/:appointment_id', function (req, res){
  event.header = req.headers;
  event.body = req.body;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  appointmentAction.GetAppointment(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})

app.get('/doctor/:doctor_id', function (req, res) {
  event.headers = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  doctorAction.GetDoctorDetail(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.get('/doctors/:branch_id', function (req, res) {
  event.headers = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  doctorAction.GetDoctors(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.get('/business/:org_id', function (req, res) {
  event.headers = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  businessAction.GetBusiness(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.get('/business/:org_id/:bu_id', function (req, res) {
  event.headers = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  businessAction.GetBusinessDetail(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.get('/products/:branch_id', function (req, res) {
  event.headers = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  productAction.GetProducts(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.get('/productstemp/:branch_id', function (req, res) {
  event.headers = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  productAction.GetProducts(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})
app.get('/productsorg/:org_id', function (req, res) {
  event.headers = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  productAction.GetProductsOrgId(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})


app.get('/prodsellingprice/:org_id/:branch_id/:product_id', function (req, res) {
  event.headers = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  productAction.GetProductSellingPrice(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.get('/productmaster/:org_id', function (req, res) {
  event.headers = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  productAction.GetProductMasterOrgId(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})



app.get('/prodsellingprice/:product_id', function (req, res) {
  event.headers = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  productAction.GetProductMasterOrgId(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})


app.get('/product/:product_id', function (req, res) {
  event.headers = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  productAction.GetProductDetail(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})


app.get('/supplierproductdetail/:product_id', function (req, res) {
  event.headers = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  supplierAction.GetSupplierProductpriceByProductId(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})
app.post('/billing', function (req, res) {
  event.headers = req.headers;
  event.body = req.body;
  event.queryParameters = aqp(req.query);
  billingAction.CreateBilling(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.post('/tempbilling', function (req, res) {
  event.headers = req.headers;
  event.body = req.body;
  event.queryParameters = aqp(req.query);
  billingTempAction.CreateBilling(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.get('/billings/:branch_id', function (req, res){
  event.header = req.headers;
  event.body = req.body;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  billingAction.GetBillingListsByBranchId(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})

app.get('/billingsorg/:org_id', function (req, res){
  event.header = req.headers;
  event.body = req.body;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  billingAction.GetBillingListsByOrgId(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})

app.get('/billing/:invoice_no', function (req, res){
  event.header = req.headers;
  event.body = req.body;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  billingAction.GetBillingDetail(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})

app.get('/billingbudetails/:invoice_no', function (req, res){
  event.header = req.headers;
  event.body = req.body;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  billingAction.GetBillingBUDetail(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})


app.get('/patientheader/:patient_id', function (req, res){
  event.header = req.headers;
  event.body = req.body;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  billingAction.GetPatientHeaderDetail(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})

app.get('/references/:ref_type', function (req, res){
  event.header = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  masterAction.GetReferenceList(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})


app.get('/optholparam/:org_id/:param_type', function (req, res){
  event.header = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  masterAction.GetOptholParamList(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})

app.post('/paymentcreation', function (req, res){
  event.header = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  event.body = req.body;
  billingAction.CreatePaymentsDetail(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})

app.put('/cancelbilling', function (req, res) {
  event.headers = req.headers;
  event.body = req.body;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  billingAction.UpdateBilling(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.put('/cancelbillingdtl', function (req, res) {
  event.headers = req.headers;
  event.body = req.body;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  billingAction.UpdateBillingdtl(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.post('/consulting', function (req, res) {
  event.headers = req.headers;
  event.body = req.body;
  event.queryParameters = aqp(req.query);
  consultAction.CreateConsulting(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.post('/dialysisconsulting', function (req, res) {
  event.headers = req.headers;
  event.body = req.body;
  event.queryParameters = aqp(req.query);
  consultAction.CreateDialysisConsulting(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.post('/labconsulting', function (req, res) {
  event.headers = req.headers;
  event.body = req.body;
  event.queryParameters = aqp(req.query);
  consultAction.CreateLabConsulting(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.post('/pharmconsulting', function (req, res) {
  event.headers = req.headers;
  event.body = req.body;
  event.queryParameters = aqp(req.query);
  consultAction.CreatePharmConsulting(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.post('/healthconsulting', function (req, res) {
  event.headers = req.headers;
  event.body = req.body;
  event.queryParameters = aqp(req.query);
  consultAction.CreateHealthConsulting(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.post('/optholvisualacuity', function (req, res) {
  event.headers = req.headers;
  event.body = req.body;
  event.queryParameters = aqp(req.query);
  consultAction.CreatePatientOptholVisualAcuity(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.post('/optholpgp', function (req, res) {
  event.headers = req.headers;
  event.body = req.body;
  event.queryParameters = aqp(req.query);
  consultAction.CreatePatientOptholPGP(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.post('/optholobjrefraction', function (req, res) {
  event.headers = req.headers;
  event.body = req.body;
  event.queryParameters = aqp(req.query);
  consultAction.CreatePatientOptholObjrefraction(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.post('/optholsubaccept', function (req, res) {
  event.headers = req.headers;
  event.body = req.body;
  event.queryParameters = aqp(req.query);
  consultAction.CreatePatientOptholSubjAccept(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.post('/optholexamination', function (req, res) {
  event.headers = req.headers;
  event.body = req.body;
  event.queryParameters = aqp(req.query);
  consultAction.CreatePatientOptholExamination(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})
app.post('/optholintraocularpressure', function (req, res) {
  event.headers = req.headers;
  event.body = req.body;
  event.queryParameters = aqp(req.query);
  consultAction.CreatePatientIntraocularpressure(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.post('/optholdiagadvise', function (req, res) {
  event.headers = req.headers;
  event.body = req.body;
  event.queryParameters = aqp(req.query);
  consultAction.CreatePatientDiagadvise(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})
app.post('/optholimagestorage', function (req, res) {
  event.headers = req.headers;
  event.body = req.body;
  event.queryParameters = aqp(req.query);
  consultAction.CreatePatientImagestorage(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.post('/optholglassprescription', function (req, res) {
  event.headers = req.headers;
  event.body = req.body;
  event.queryParameters = aqp(req.query);
  consultAction.CreatePatientGlassprescription(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})


// Get cosult header
app.get('/consult/:branch_id', function (req, res){
  event.header = req.headers;
  event.body = req.body;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  consultAction.GetConsultingListsByBranchId(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})

app.get('/consultorg/:org_id', function (req, res){
  event.header = req.headers;
  event.body = req.body;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  consultAction.GetConsultingListsByOrgId(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})

app.get('/consultdetail/:visit_no', function (req, res){
  event.header = req.headers;
  event.body = req.body;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  consultAction.GetConsultingDetail(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})

app.get('/labtests', function (req, res){
  event.header = req.headers;
  event.queryParameters = aqp(req.query);
  masterAction.LabTestList(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})

app.get('/dialysis/:patient_id', function (req, res){
  event.header = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  consultAction.getPatientDialysisList(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})

app.get('/lablists/:patient_id', function (req, res){
  event.header = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  consultAction.getPatientLabLists(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})

app.get('/optholvisualacuitylist/:patient_id', function (req, res){
  event.header = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  consultAction.getoptholvisualacuityLists(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})
app.get('/optholpgplist/:patient_id', function (req, res){
  event.header = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  consultAction.getoptholpgpLists(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})

app.get('/optholobjrefractionlist/:patient_id', function (req, res){
  event.header = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  consultAction.getoptholobjrefractionLists(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})

app.get('/optholsubacceptlist/:patient_id', function (req, res){
  event.header = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  consultAction.getoptholsubacceptLists(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})

app.get('/optholexaminationlist/:patient_id', function (req, res){
  event.header = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  consultAction.getoptholexaminationLists(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})

app.get('/optholintraocularpressurelist/:patient_id', function (req, res){
  event.header = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  consultAction.getoptholintraocularpressureLists(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})

app.get('/optholdiagadviselist/:patient_id', function (req, res){
  event.header = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  consultAction.getoptholdiagadviseLists(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})


app.get('/optholimagestoragelist/:patient_id', function (req, res){
  event.header = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  consultAction.getoptholimagestorageLists(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})


app.get('/optholglassprescriptionlist/:patient_id', function (req, res){
  event.header = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  consultAction.getoptholglassprescriptionLists(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})


app.get('/pharmlists/:patient_id', function (req, res){
  event.header = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  consultAction.getPatientPharmLists(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})

app.get('/previouspharma/:patient_id', function (req, res){
  event.header = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  consultAction.getPatientPharmaLists(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})

app.get('/healthlists/:patient_id', function (req, res){
  event.header = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  consultAction.getPatientHealthLists(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})


app.post('/advancepayment', function (req, res){
  event.header = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  event.body = req.body;
  console.log('in app');
  advancePaymentAction.CreateAdvancePayment(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})
app.get('/vitalparams', function (req, res){
  event.header = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  event.body = req.body;
  
  masterAction.fetchVitalParams(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})

app.get('/invoicereport/:patient_id/:invoice_no', function (req, res){
  event.header = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  billingAction.getPatientInvoiceDetail(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})

app.post('/patientinsurance', function (req, res) {
  event.headers = req.headers;
  event.body = req.body;
  event.queryParameters = aqp(req.query);
  patientInsAction.createPatientInsHeader(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.post('/patientinsurancedetail', function (req, res) {
  event.headers = req.headers;
  event.body = req.body;
  event.queryParameters = aqp(req.query);
  patientInsAction.createPatientInsDetail(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.get('/patientinslists', function (req, res) {
  event.headers = req.headers;
  event.body = req.body;
  event.queryParameters = aqp(req.query);
  patientInsAction.getPatientInsHeaderList(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.get('/patientinsdetail/:patient_id', function (req, res) {
  event.headers = req.headers;
  event.pathParameters = req.params;
  event.body = req.body;
  event.queryParameters = aqp(req.query);
  patientInsAction.getPatientInsDetailList(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})


app.get('/insentrystatus/:org_id/:branch_id', function (req, res) {
  event.headers = req.headers;
  event.pathParameters = req.params;
  event.body = req.body;
  event.queryParameters = aqp(req.query);
  patientInsAction.getInsentrystatus(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.get('/invoicebymonth/:patient_id', function (req, res){
  event.header = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  billingAction.getInvoiceByMonth(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})

app.get('/patienttypereport/:org_id/:branch_id', function (req, res) {
  event.headers = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  billingAction.getReportPatientTypewise(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.get('/patientoutstandingreport/:org_id/:branch_id', function (req, res) {
  event.headers = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  billingAction.getReportPatientOutstanding(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.get('/invoiceoutstandingreport/:org_id/:branch_id', function (req, res) {
  event.headers = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  billingAction.getReportInvoiceOutstanding(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.get('/collectionwisereport/:org_id/:branch_id', function (req, res) {
  event.headers = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  billingAction.getCollectionWiseReport(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})
app.get('/krc-collectionwisereport/:org_id/:branch_id', function (req, res) {
  event.headers = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  billingAction.getKRCCollectionWiseReport(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.get('/paymentwisereport/:org_id/:branch_id', function (req, res) {
  event.headers = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  billingAction.getPaymentWiseReport(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})


app.get('/receiptpaymentreport/:org_id/:branch_id', function (req, res) {
  event.headers = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  billingAction.getReceiptPaymentReport(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})


app.get('/stockregisterreport/:org_id/:branch_id', function (req, res) {
  event.headers = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  billingAction.getStockRegisterReport(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})
app.post('/patientinsurancereport', function (req, res) {
  event.headers = req.headers;
  event.body = req.body;
  event.queryParameters = aqp(req.query);
  patientInsAction.getPatientInsurancereport(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.post('/po', function (req, res) {
  event.headers = req.headers;
  event.body = req.body;
  event.queryParameters = aqp(req.query);
  poAction.createPo(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})


app.post('/posubmission', function (req, res) {
  event.headers = req.headers;
  event.body = req.body;
  event.queryParameters = aqp(req.query);
  poAction.poSubmission(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.get('/pos/:branch_id/:supplier_id', function (req, res){
  event.header = req.headers;
  event.body = req.body;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  poAction.GetPoListsByBranchId(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})

app.get('/posorg/:org_id', function (req, res){
  event.header = req.headers;
  event.body = req.body;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  poAction.GetPoListsByOrgId(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})

app.get('/po/:po_number', function (req, res){
  event.header = req.headers;
  event.body = req.body;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  poAction.GetPoDetail(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})


app.get('/suppliers/:org_id/:branch_id', function (req, res) {
  event.headers = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  supplierAction.GetSupplierListByBranchId(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})


app.get('/supplierproducts/:branch_id/:supplier_id', function (req, res) {
  event.headers = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  supplierAction.GetSupplierProductList(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.post('/suppliers', function (req, res) {
  event.headers = req.headers;
  event.body = req.body;
  event.queryParameters = aqp(req.query);
  supplierAction.createSupplier(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.get('/eodinfo/:org_id/:branch_id', function (req, res) {
  event.headers = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  masterAction.GetEOD(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})


app.post('/eod', function (req, res) {
  event.headers = req.headers;
  event.body = req.body;
  event.queryParameters = aqp(req.query);
  masterAction.createEOD(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.post('/supplierprods', function (req, res) {
  event.headers = req.headers;
  event.body = req.body;
  event.queryParameters = aqp(req.query);
  supplierAction.createSupplierProd(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})


app.get('/branches/:org_id', function (req, res){
  event.header = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  masterAction.GetBranchList(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})

app.post('/pogoodsreceipt', function (req, res) {
  event.headers = req.headers;
  event.body = req.body;
  event.queryParameters = aqp(req.query);
  poAction.poGoodsReceipt(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})


app.get('/goodreceipt/:org_id/:branch_id/:supplier_id', function (req, res) {
  event.headers = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  poAction.GetGoodReceiptList(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.post('/schedule', function (req, res) {
  event.headers = req.headers;
  event.body = req.body;
  event.queryParameters = aqp(req.query);
  patientAction.CreateSchedule(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.get('/schedules/:org_id/:branch_id/:patient_id', function (req, res) {
  event.headers = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  patientAction.GetScheduleList(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})


app.get('/popayschedulelists/:org_id/:branch_id/:supplier_id', function (req, res) {
 event.headers = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  poAction.GetPoSuppScheduleList(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.post('/createposupplierpayment', function (req, res) {
  event.headers = req.headers;
  event.body = req.body;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  poAction.CreatePoSuppScheduleList(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.get('/users/:org_id/:branch_id', function (req, res) {
  event.headers = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  userAction.GetUserListByBranchId(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.get('/userpassword/:org_id/:branch_id/:user_id', function (req, res) {
  event.headers = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  userAction.GetUserPassword(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.post('/createreceiptspayments', function (req, res) {
  event.headers = req.headers;
  event.body = req.body;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  poAction.CreateReceiptsPayments(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})


app.get('/accounts/:org_id', function (req, res) {
  event.headers = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  masterAction.GetAccountListByOrgId(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})


app.get('/receiptspayments/:org_id/:branch_id', function (req, res) {
  event.headers = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  poAction.GetReceiptsPayments(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.get('/posupplierpayments/:org_id/:branch_id/:supplier_id', function (req, res) {
  event.headers = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  poAction.GetPoSupplierPayments(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.post('/createproduct', function (req, res) { 
  event.headers = req.headers;
  event.body = req.body;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  productAction.CreateProduct(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.get('/goodreceiptreport/:org_id/:branch_id', function (req, res) {
  event.headers = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  poAction.GetGoodReceiptReportList(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.get('/supplierpaymentreport/:org_id/:branch_id', function (req, res) {
  event.headers = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  poAction.GetSupplierPaymentReportList(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.get('/poinvoicesummaryreport/:org_id/:branch_id', function (req, res) {
  event.headers = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  poAction.GetPoInvoiceSummaryReportList(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.post('/createproductpricing', function (req, res) { 
  event.headers = req.headers;
  event.body = req.body;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  productAction.CreateProductPricing(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.post('/createproductinsurance', function (req, res) { 
  event.headers = req.headers;
  event.body = req.body;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  productAction.CreateProductInsurancePricing(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.post('/createuser', function (req, res) {
  event.headers = req.headers;
  event.body = req.body;
  event.queryParameters = aqp(req.query);
   userAction.CreateUser(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})


app.post('/changepassword', function (req, res) {
  event.headers = req.headers;
  event.body = req.body;
  event.queryParameters = aqp(req.query);
   userAction.ChanagePassword(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})
app.post('/createdoctor', function (req, res) {
  event.headers = req.headers;
  event.body = req.body;
  event.queryParameters = aqp(req.query);
   doctorAction.createDoctor(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.post('/createaccount', function (req, res) {
  event.headers = req.headers;
  event.body = req.body;
  event.queryParameters = aqp(req.query);
  masterAction.createAccount(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.post('/createinventoryconfig', function (req, res) {
  event.headers = req.headers;
  event.body = req.body;
  event.queryParameters = aqp(req.query);
  inventoryAction.createInventoryConfig(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.post('/createinventoryproduct', function (req, res) {
  event.headers = req.headers;
  event.body = req.body;
  event.queryParameters = aqp(req.query);
  inventoryAction.createInventoryProduct(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})


app.get('/inventoryproduct/:branch_id/:source_product_id', function (req, res) {
  event.headers = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  inventoryAction.GetInventoryProducts(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})


app.get('/inventoryconfig/:branch_id', function (req, res) {
  event.headers = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  inventoryAction.GetInventoryConfigs(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})



app.get('/patientreport/:org_id/:branch_id/:patient_id', function (req, res) {
  event.headers = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  patientAction.GetPatientReportList(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})


app.get('/D0004patientreport/:org_id/:branch_id/:patient_id', function (req, res) {
  event.headers = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  patientAction.GetD0004PatientReportList(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})


app.get('/D0002patientreport/:org_id/:branch_id/:patient_id', function (req, res) {
  event.headers = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  patientAction.GetD0002PatientReportList(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})


app.get('/doctorsummaryreport/:org_id/:branch_id', function (req, res){
  event.header = req.headers;
  event.body = req.body;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  billingAction.getReportDoctorSummary(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})

app.post('/createoptholparam', function (req, res){
  event.header = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  event.body = req.body;
  optholParamAction.CreateOptholParam(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})

app.get('/optholparamdetail/:org_id/:branch_id', function (req, res){
  console.log("Call optholparamdetail")
  event.header = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  optholParamAction.GetOptholParam(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})

app.post('/createoptholslitlamp', function (req, res){
  event.header = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  event.body = req.body;
  optholParamAction.CreateOptholSlitlamp(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})

app.get('/optholslitlamp/:org_id/:branch_id', function (req, res){
  event.header = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  optholParamAction.GetOptholSLitlamp(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})

app.get('/invoiceproductreport/:org_id/:branch_id', function (req, res) {
  event.headers = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  billingAction.invoiceproductreport(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})
app.get('/invoicepaymentreport/:org_id/:branch_id', function (req, res) {
  event.headers = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  billingAction.invoicepaymentreport(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})


app.get('/patientvisit360report/:org_id/:branch_id/:patient_id', function (req, res){
  event.header = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  billingAction.patient360report(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})

app.get('/fetchbranchdept/:org_id/:branch_id', function (req, res) {
  event.headers = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  doctorAction.FetchBranchDept(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})
app.get('/fetchdeptdoctor/:org_id/:branch_id/:dept_id', function (req, res) {
  event.headers = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  doctorAction.FetchDeptDoctor(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.get('/fetchpatientschedule/:org_id/:branch_id', function (req, res) {
  event.headers = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  patientAction.FetchPatientSchedule(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.get('/supplierwiseproduct/:org_id/:branch_id', function (req, res) {
  event.headers = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  supplierAction.supplierwiseProduct(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })
})

app.get('/allvisithealthparaminformation/:org_id/:branch_id/:patient_id', function (req, res){
  event.header = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  consultAction.allvisithealthparamInformation(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})


app.get('/allvisitlabinformation/:org_id/:branch_id/:patient_id', function (req, res){
  event.header = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  consultAction.allvisitlabInformation(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})

app.get('/petconsultdetail/:org_id/:branch_id/:patient_id', function (req, res){
  event.header = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  consultAction.petconsultdetail(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})

app.get('/petlist/:org_id/:branch_id/:patient_id', function (req, res){
  event.header = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  consultAction.petlist(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})

app.post('/petconsulting', function (req, res){
  event.header = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  event.body = req.body;
  consultAction.CreatepetConsulting(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})

app.get('/pettreatment/:org_id/:branch_id/:patient_id', function (req, res){
  event.header = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  consultAction.pettreatmentlist(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})

app.get('/petdiagnosis/:org_id/:branch_id/:patient_id', function (req, res){
  event.header = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  consultAction.petdiagnosislist(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})

app.get('/fetchfiles/:org_id/:branch_id/:patient_id', function (req, res){
  event.header = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  patientAction.GetFileList(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})

app.post('/petdiagnosis', function (req, res){
  event.header = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  event.body = req.body;
  consultAction.CreatepetDiagnosis(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})

app.post('/pettreatment', function (req, res){
  event.header = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  event.body = req.body;
  consultAction.CreatepetTreatment(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})




app.post('/upload', upload.single('image'),async (req, res) => {
  event.header = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  event.body = req.body;
  consultAction.UploadImagetoLocal(event, req,{
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  

});



app.get('/getuploadimage/:patient_id', function (req, res){
  event.header = req.headers;
  event.pathParameters = req.params;
  event.queryParameters = aqp(req.query);
  consultAction.getUploadImage(event, {
    done: function (rescode, resmsg) {
      res.header(resmsg.headers);
      res.status(resmsg.statusCode);
      res.send(resmsg.body)
    }
  })  
})

module.exports = app;

