import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendOrderEmail = async (
    customerEmail,
    customerName,
    orderItems,
    totalAmount,
    orderCode
) => {
    
    const productList = orderItems
        .map(item => `• ${item.name} x ${item.quantity}`)
        .join("<br>");

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: customerEmail,
        subject: "🎉 Đặt hàng thành công - KIZUNA HANDMADE",

        html: `
        <div style="font-family:Arial;padding:20px">

            <h2 style="color:#2e7d32">
                Cảm ơn bạn đã đặt hàng ❤️
            </h2>

            <p>Xin chào <b>${customerName}</b>,</p>

            <p>Đơn hàng của bạn đã được ghi nhận thành công.</p>
            <p style="margin:15px 0;">
                <b>Mã đơn hàng:</b>

                <span style="
                    background:#eef3ff;
                    color:#3f51b5;
                    padding:6px 12px;
                    border-radius:20px;
                    font-weight:bold;
                    margin-left:8px;
                    display:inline-block;
                ">
                    ${orderCode}
                </span>
            </p>

            <hr>

            <h3>Sản phẩm</h3>

            ${productList}

            <br><br>

            <h3>
                Tổng thanh toán:
                ${Number(totalAmount).toLocaleString("vi-VN")} ₫
            </h3>

            <hr>

            <p>
                Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.
            </p>

            <br>

            <b>KIZUNA HANDMADE</b>

        </div>
        `,
    };

    await transporter.sendMail(mailOptions);
};

export const sendStatusEmail = async (
    customerEmail,
    customerName,
    status,
    orderItems,
    totalAmount,
    orderDate,
    orderId,
    cancelReason = ""
) => {
    const statusVN = {
        "Order Placed": "Đơn hàng đã đặt",
        "Packing": "Đang đóng gói",
        "Shipped": "Đang vận chuyển",
        "Out for delivery": "Đang giao hàng",
        "Delivered": "Đã giao thành công",
        "Cancelled": "❌ Đơn hàng đã bị hủy",
    };
const productList = orderItems
    .map(item => `
        <tr>
            <td style="border:1px solid #ddd;padding:8px;">
                ${orderId}
            </td>

            <td style="border:1px solid #ddd;padding:8px;">
                ${item.name}
            </td>

            <td style="border:1px solid #ddd;padding:8px;text-align:center;">
                ${item.quantity}
            </td>
        </tr>
    `)
    .join("");
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: customerEmail,
        subject: "📦 Cập nhật trạng thái đơn hàng",

        html: `
            <div style="font-family:Arial">

                <h2>Xin chào ${customerName}</h2>

                <p>
                    Đơn hàng của bạn vừa được cập nhật.
                </p>

                <h3 style="color:#2e7d32">
                    ${statusVN[status]}
                </h3>
                <p>
                    <b>Ngày đặt:</b>
                        ${new Date(orderDate).toLocaleDateString("vi-VN")}
                    </p>
                    <table
                        style="
                            width:100%;
                            border-collapse:collapse;
                            margin-top:15px;
                        "
                    >
                        <thead>
                            <tr style="background:#f2f2f2">
                                <th style="border:1px solid #ddd;padding:8px;">Mã đơn hàng</th>
                                <th style="border:1px solid #ddd;padding:8px;">Tên sản phẩm</th>
                                <th style="border:1px solid #ddd;padding:8px;">SL</th>
                            </tr>
                        </thead>

                        <tbody>
                            ${productList}
                        </tbody>
                    </table>
                ${
                    status === "Cancelled"
                        ? `
                        <div style="
                            margin-top:20px;
                            padding:15px;
                            background:#fff3f3;
                            border-left:5px solid red;
                        ">
                            <b>Lý do hủy đơn:</b><br>
                            ${cancelReason}
                        </div>
                        `
                        : ""
                }
                <br>
                <h3>
                    Tổng tiền:
                    ${Number(totalAmount).toLocaleString("vi-VN")} ₫
                </h3>
                <p>
                    Cảm ơn bạn đã mua hàng tại
                    <b>KIZUNA HANDMADE</b>.
                </p>

            </div>
        `
    };

    await transporter.sendMail(mailOptions);
}

export const sendCancelEmail = async (
    customerEmail,
    customerName,
    reason
) => {

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: customerEmail,
        subject: "❌ Đơn hàng của bạn đã bị hủy",

        html: `
        <div style="font-family:Arial;padding:20px">

            <h2 style="color:#d32f2f">
                Đơn hàng đã bị hủy
            </h2>

            <p>Xin chào <b>${customerName}</b>,</p>

            <p>
                Rất tiếc, đơn hàng của bạn tại
                <b>KIZUNA HANDMADE</b>
                đã bị hủy.
            </p>

            <hr>

            <h3>Lý do hủy đơn</h3>

            <p style="color:red;font-size:16px">
                ${reason}
            </p>

            <hr>

            <p>
                Nếu có bất kỳ thắc mắc nào,
                vui lòng liên hệ với cửa hàng.
            </p>

            <br>

            <b>KIZUNA HANDMADE</b>

        </div>
        `
    };

    await transporter.sendMail(mailOptions);

};