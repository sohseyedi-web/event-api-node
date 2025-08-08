import { transporter } from './functions';

export const emailStyleOtpVerification = async (email: string, otp: string) => {
  await transporter.sendMail({
    from: `"ایونتیکت" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'کد ورود شما به ایونتیکت',
    text: `کد ورود شما: ${otp}\nاین کد به مدت ۵ دقیقه معتبر است.`,
    html: `
      <div style="direction: rtl; font-family: 'Tahoma', sans-serif; background: #f4f6f8; padding: 30px;">
        <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); overflow: hidden;">

          <!-- Header -->
          <div style="background: linear-gradient(90deg, #ff6f61, #ff3c3c); padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 22px; color: #fff;">🎟 ایونتیکت</h1>
          </div>

          <!-- Body -->
          <div style="padding: 25px; color: #333;">
            <h2 style="font-size: 20px; margin-bottom: 10px;">کد ورود شما</h2>
            <p style="font-size: 14px; margin: 0 0 20px;">
              کاربر گرامی، برای ورود به حساب کاربری خود در <strong>ایونتیکت</strong> از کد زیر استفاده کنید:
            </p>

            <div style="font-size: 28px; font-weight: bold; color: #ff3c3c; text-align: center; letter-spacing: 3px; margin: 20px 0;">
              ${otp}
            </div>

            <p style="font-size: 13px; margin: 0 0 15px; color: #555;">
              این کد فقط به مدت <strong>۵ دقیقه</strong> معتبر است.
            </p>

            <div style="text-align: center; margin-top: 25px;">
              <a href="https://eventicket.com/login" style="background: #ff3c3c; color: white; text-decoration: none; padding: 10px 25px; border-radius: 6px; font-size: 14px; font-weight: bold;">
                ورود به ایونتیکت
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #fafafa; padding: 15px; font-size: 12px; text-align: center; color: #888;">
            اگر این درخواست توسط شما نبوده است، این پیام را نادیده بگیرید.
          </div>
        </div>
      </div>
    `,
  });
};
