const nodeMailer = require("nodemailer");
const { MailtrapTransport } = require("mailtrap");

const sendEmail = async (options) => {

    try {
        const transporter = nodeMailer.createTransport(
            MailtrapTransport({
                token: process.env.MAILTRAP_TOKEN
            })
        );


        const sender = {
            address: "hello@demomailtrap.co",
            name: "Mailtrap Test",
        };
        

        // 2- define the email options
        await transporter.sendMail({
            from: sender,
            to: options.to,
            subject: options.subject,
            text: options.text,
            category: "Password Reset",
        })

    } catch (error) {
        console.log("[sendEmail] Error while sending email");
        console.log("Message:", error.message);
        console.log("Code:", error.code);
        console.log("Command:", error.command);
        console.log("Stack:", error.stack);

        throw new Error(`error message: ${error.message} , code: ${error.code}`);
 }
}



module.exports = sendEmail;


