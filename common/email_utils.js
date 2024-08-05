var nodemailer = require('nodemailer');
const ejs = require('ejs');
var debug = require('debug')('v2:emailutils');

function SendEmailData(email_params) {
  return new Promise((resolve, reject) => {
    var htmlStream;
    debug('EMAIL PARAMS :', email_params);
    var from_email_data = `${email_params.get_from_email_data.branch_name} \n\r ${email_params.get_from_email_data.branch_address} \n\r ${email_params.get_from_email_data.branch_contact_num} \n\r ${email_params.get_from_email_data.branch_email_id}`;
    var to_email = `${email_params.get_to_email_data.supplier_email_id}`;
    var to_email_data = `${email_params.get_to_email_data.supplier_name} \n\r ${email_params.get_to_email_data.supplier_address} \n\r ${email_params.get_to_email_data.supplier_contact_num} \n\r ${email_params.get_to_email_data.supplier_email_id}`;
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'swastha.krc@gmail.com',
        pass: 'qsbrjjfytrwywswq'
      }
    });

    ejs.renderFile(__dirname + "/email_template.ejs", { email_params: email_params, from_email_data: from_email_data, to_email_data: to_email_data})
      .then(function (html_stream) {
        htmlStream = html_stream;

        var mailOptions = {
          from: `swastha.krc@gmail.com`,
          to: `rlnsimha2000@yahoo.com`,
          //cc: 'ssanmugam@gmail.com',
          subject: 'Mail From Swastha',
          // text: 'KRC',
          html: htmlStream
        };
        return transporter.sendMail(mailOptions)
      })
      .then(function (_mail_return_val) {
        console.log('Email sending result :', _mail_return_val)
        return resolve(_mail_return_val)
      })
      .catch(function (err) {
        console.log('Error :', err)
        return reject(err)
      })
  })
}

module.exports = {
    SendEmailData
}