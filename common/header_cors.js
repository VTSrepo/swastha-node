
exports.headersCors= async ({ app }) => {
	
	const allowCrossDomain = function (req, res, next) {
		
		//console.log(" - Origin header - ", req.headers.origin);

		//res.header("Access-Control-Allow-Origin", req.headers.origin);
        res.header("Access-Control-Allow-Origin", "*")
		/*res.header(
			"Access-Control-Allow-Methods",
			"POST, GET, PUT,PATCH, DELETE, OPTIONS"
		);
		res.header("Access-Control-Allow-Credentials", false);
		res.header("Access-Control-Max-Age", "86400");
		res.header(
			"Access-Control-Allow-Headers",
			"Authorization, X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept"
		);*/
		next();
	};

	app.use(allowCrossDomain);
	
	return app;

};


// const cors = require("cors");

// module.exports = async ({ app }) => {
	
// 	const allowCrossDomain = function (req, res, next) {
		
// 		//console.log("* - Origin header - *", req.headers.origin);

// 		//res.header("Access-Control-Allow-Origin", req.headers.origin);
//         res.header("Access-Control-Allow-Origin", "https://dev1.vibhavatech.com")
// 		res.header(
// 			"Access-Control-Allow-Methods",
// 			"POST, GET, PUT,PATCH, DELETE, OPTIONS"
// 		);
// 		res.header("Access-Control-Allow-Credentials", true);
// 		res.header("Access-Control-Max-Age", "86400");
// 		res.header(
// 			"Access-Control-Allow-Headers",
// 			"Authorization, X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept"
// 		);
// 		next();
// 	};

// 	app.use(allowCrossDomain);
	
// 	return app;

// };