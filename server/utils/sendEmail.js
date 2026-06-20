const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to,
    subject,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

const orderConfirmationTemplate = (order, user) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #6366f1;">Order Confirmed! 🎉</h2>
    <p>Hi ${user.name},</p>
    <p>Your order <strong>#${order._id}</strong> has been placed successfully.</p>
    <h3>Order Summary</h3>
    <table style="width:100%; border-collapse:collapse;">
      ${order.orderItems
        .map(
          (item) => `
        <tr>
          <td style="padding:8px; border-bottom:1px solid #eee;">${item.name}</td>
          <td style="padding:8px; border-bottom:1px solid #eee;">x${item.quantity}</td>
          <td style="padding:8px; border-bottom:1px solid #eee;">₹${item.price}</td>
        </tr>
      `
        )
        .join('')}
    </table>
    <p><strong>Total: ₹${order.totalPrice}</strong></p>
    <p>Thank you for shopping with us!</p>
  </div>
`;

module.exports = { sendEmail, orderConfirmationTemplate };
