/**
 * Welcome email sent to every new user on signup.
 * Includes their wallet address and private key backup warning.
 */
export const welcomeEmailTemplate = ({ name, walletAddress, encryptedPrivateKey }) => ({
  subject: "Welcome to HyperTek — Your Wallet is Ready",
  html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#0a0a1a;font-family:'Helvetica Neue',Arial,sans-serif;color:#ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a1a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#0f0f2a;border-radius:12px;overflow:hidden;border:1px solid #1e1e4a;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#002AA8,#0047d4);padding:36px 40px;text-align:center;">
              <h1 style="margin:0;font-size:28px;font-weight:800;color:#ffffff;letter-spacing:1px;">HYPER<span style="color:#60a5fa;">TEK</span></h1>
              <p style="margin:8px 0 0;font-size:14px;color:#bfdbfe;letter-spacing:2px;">GAME MARKETPLACE</p>
            </td>
          </tr>

          <!-- Welcome -->
          <tr>
            <td style="padding:36px 40px 24px;">
              <h2 style="margin:0 0 12px;font-size:22px;color:#ffffff;">Welcome${name ? `, ${name}` : ""}!</h2>
              <p style="margin:0;font-size:15px;color:#94a3b8;line-height:1.6;">
                Your HyperTek account is ready. We've automatically created a crypto wallet for you — it's how you'll buy, sell, and hold NFAs on the platform.
              </p>
            </td>
          </tr>

          <!-- Wallet Address -->
          <tr>
            <td style="padding:0 40px 24px;">
              <div style="background-color:#1a1a3a;border:1px solid #2e2e6a;border-radius:8px;padding:20px;">
                <p style="margin:0 0 8px;font-size:12px;color:#60a5fa;font-weight:600;letter-spacing:1px;text-transform:uppercase;">Your Wallet Address</p>
                <p style="margin:0;font-size:13px;color:#e2e8f0;font-family:'Courier New',monospace;word-break:break-all;">${walletAddress}</p>
                <p style="margin:10px 0 0;font-size:12px;color:#64748b;">This is your public address — safe to share. Use it to receive crypto or NFAs.</p>
              </div>
            </td>
          </tr>

          <!-- How to view private key -->
          <tr>
            <td style="padding:0 40px 24px;">
              <div style="background-color:#0a1a0a;border:1px solid #1a4a1a;border-radius:8px;padding:20px;">
                <p style="margin:0 0 10px;font-size:12px;color:#4ade80;font-weight:700;letter-spacing:1px;text-transform:uppercase;">🔑 How to View Your Private Key</p>
                <p style="margin:0 0 12px;font-size:13px;color:#e2e8f0;line-height:1.7;">
                  Your private key is securely stored and can be revealed anytime from your profile settings:
                </p>
                <table cellpadding="0" cellspacing="0" width="100%">
                  <tr><td style="padding:4px 0;font-size:13px;color:#86efac;">1.&nbsp; Go to <strong style="color:#ffffff;">Profile → Edit Profile</strong></td></tr>
                  <tr><td style="padding:4px 0;font-size:13px;color:#86efac;">2.&nbsp; Scroll to <strong style="color:#ffffff;">Embedded Wallet Settings</strong></td></tr>
                  <tr><td style="padding:4px 0;font-size:13px;color:#86efac;">3.&nbsp; Click <strong style="color:#ffffff;">"View Private Key"</strong></td></tr>
                  <tr><td style="padding:4px 0;font-size:13px;color:#86efac;">4.&nbsp; Enter your account password to reveal it</td></tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Warning -->
          <tr>
            <td style="padding:0 40px 24px;">
              <div style="background-color:#1a0a0a;border:1px solid #6b2020;border-radius:8px;padding:16px;">
                <p style="margin:0;font-size:13px;color:#fca5a5;line-height:1.6;">
                  ⚠️ <strong>Never share your private key with anyone.</strong> Anyone who has your private key has full control of your wallet and all your assets. HyperTek will never ask for your private key.
                </p>
              </div>
            </td>
          </tr>

          <!-- Next Steps -->
          <tr>
            <td style="padding:0 40px 36px;">
              <p style="margin:0 0 12px;font-size:14px;color:#94a3b8;">What to do next:</p>
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="padding:6px 0;font-size:14px;color:#e2e8f0;">→&nbsp; Save your private key from your profile settings</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:14px;color:#e2e8f0;">→&nbsp; Browse NFAs on the marketplace</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:14px;color:#e2e8f0;">→&nbsp; Fund your wallet to start buying</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#080818;padding:24px 40px;text-align:center;border-top:1px solid #1e1e4a;">
              <p style="margin:0;font-size:12px;color:#475569;">HyperTek Game Marketplace &nbsp;·&nbsp; <a href="https://www.hypertek100.com" style="color:#60a5fa;text-decoration:none;">hypertek100.com</a></p>
              <p style="margin:8px 0 0;font-size:11px;color:#334155;">Do not reply to this email. For support, visit our website.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `,
});
