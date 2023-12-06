const mailer = require('nodemailer');
const  goodbye  = require('./goodbye_template');
const  welcome  = require('./welcome_template');

const getEmailData = (to, name, template) => {
    let data = null;

    switch (template) {
        case "welcome":
            data = {
                from: '보내는 사람 이름 <userId@gmail.com>',
                to,
                subject: `Hello ${name}`,
                html: welcome()
            }
            break;

        case "goodbye":
            data = {
                from: '보내는 사람 이름 <userId@gmail.com>',
                to,
                subject: `Goodbye ${name}`,
                html: goodbye()
            }
            break;
        default:
            data;
    }

    return data;
}


const sendMail = (to, name, type) => {
    const transporter = mailer.createTransporter({
        service: 'Gmail',
        auth: {
            user: 'test@google.com',
            pass: process.env.EMAIL_PASSWORD
        }
    })

    const mail = getEmailData(to, name, type);

    transporter.sendEmail(mail, (error, response) => {
        if (error) {
            console.log(error);
        } else {
            console.log('email sent successfully');
        }

        transporter.close();
    })
}


module.exports = sendMail;