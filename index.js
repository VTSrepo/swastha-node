const app = require("./server");

var list = app.listen(process.env.HOST_PORT, function () {
  console.log("Users listening on port " + process.env.HOST_PORT);
})