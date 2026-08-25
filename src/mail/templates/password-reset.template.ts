export const passwordResetTemplate = (
    appName: string,
    otp: string,
): string => {
    return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
        <title>Reset your password</title>
      </head>

      <body
        style="
          margin: 0;
          padding: 0;
          background-color: #f4f6f8;
          font-family: Arial, Helvetica, sans-serif;
          color: #1f2937;
        "
      >
        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="background-color: #f4f6f8; padding: 40px 16px;"
        >
          <tr>
            <td align="center">

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  max-width: 560px;
                  background-color: #ffffff;
                  border-radius: 12px;
                  overflow: hidden;
                "
              >

                <!-- Header -->
                <tr>
                  <td
                    style="
                      padding: 28px 32px;
                      border-bottom: 1px solid #e5e7eb;
                    "
                  >
                    <div
                      style="
                        font-size: 22px;
                        font-weight: 700;
                        color: #111827;
                      "
                    >
                      ${appName}
                    </div>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px 32px;">

                    <h1
                      style="
                        margin: 0 0 16px;
                        font-size: 26px;
                        color: #111827;
                      "
                    >
                      Reset your password
                    </h1>

                    <p
                      style="
                        margin: 0 0 24px;
                        font-size: 15px;
                        line-height: 1.7;
                        color: #4b5563;
                      "
                    >
                      We received a request to reset the password
                      associated with your account.
                    </p>

                    <p
                      style="
                        margin: 0 0 12px;
                        font-size: 14px;
                        font-weight: 600;
                        color: #374151;
                      "
                    >
                      Your verification code is:
                    </p>

                    <!-- OTP -->
                    <div
                      style="
                        margin: 0 0 24px;
                        padding: 20px;
                        background-color: #f3f4f6;
                        border: 1px solid #e5e7eb;
                        border-radius: 10px;
                        text-align: center;
                      "
                    >
                      <span
                        style="
                          font-size: 32px;
                          font-weight: 700;
                          letter-spacing: 8px;
                          color: #111827;
                        "
                      >
                        ${otp}
                      </span>
                    </div>

                    <p
                      style="
                        margin: 0 0 24px;
                        font-size: 14px;
                        color: #6b7280;
                      "
                    >
                      This code will expire in
                      <strong style="color: #374151;">
                        10 minutes
                      </strong>.
                    </p>

                    <div
                      style="
                        padding: 16px;
                        background-color: #fff7ed;
                        border: 1px solid #fed7aa;
                        border-radius: 8px;
                      "
                    >
                      <p
                        style="
                          margin: 0;
                          font-size: 13px;
                          line-height: 1.6;
                          color: #9a3412;
                        "
                      >
                        If you didn't request a password reset,
                        you can safely ignore this email.
                      </p>
                    </div>

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td
                    style="
                      padding: 24px 32px;
                      background-color: #f9fafb;
                      border-top: 1px solid #e5e7eb;
                    "
                  >
                    <p
                      style="
                        margin: 0;
                        font-size: 12px;
                        color: #9ca3af;
                        text-align: center;
                      "
                    >
                      This is an automated message.
                      Please do not reply to this email.
                    </p>

                    <p
                      style="
                        margin: 8px 0 0;
                        font-size: 12px;
                        color: #9ca3af;
                        text-align: center;
                      "
                    >
                      © ${new Date().getFullYear()} ${appName}.
                      All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>

            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};