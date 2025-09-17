import { defineAuth } from "@aws-amplify/backend";

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: {
      verificationEmailStyle: "CODE",
      verificationEmailSubject: "Welcome to RecapAI - AI Meeting Intelligence!",
      verificationEmailBody: (createCode) =>
        `<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #113359 0%, #0f2a4a 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🎙️ RecapAI</h1>
    <p style="color: #31CCEC; margin: 10px 0 0 0;">AI-Powered Meeting Intelligence Platform</p>
  </div>
  
  <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">
    <h2 style="color: #113359; margin-top: 0;">Welcome to RecapAI!</h2>
    
    <p>Thank you for joining RecapAI, the serverless platform that transforms every meeting into instantly digestible, visual summaries with the power of AI.</p>
    
    <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border-left: 4px solid #FF6B35;">
      <p style="margin: 0 0 10px 0; font-weight: bold; color: #113359;">Your verification code:</p>
      <div style="font-size: 32px; font-weight: bold; color: #FF6B35; letter-spacing: 4px;">${createCode()}</div>
    </div>
    
    <p>Enter this code to confirm your account and start transforming your meetings into intelligent summaries.</p>
    
    <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #113359; margin-top: 0; font-size: 16px;">✨ What you can do with RecapAI:</h3>
      <ul style="margin: 10px 0; padding-left: 20px; color: #555;">
        <li>🎵 Record meetings directly in your browser</li>
        <li>📝 Get AI-powered transcriptions with speaker detection</li>
        <li>🧠 Generate intelligent summaries with key insights</li>
        <li>📊 Create visual diagrams and mind maps automatically</li>
        <li>🔄 Real-time processing with serverless scalability</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://recapai.awslearn.cloud" style="background: linear-gradient(135deg, #113359 0%, #FF6B35 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
        Start Using RecapAI
      </a>
    </div>
    
    <p style="text-align: center; color: #666; font-size: 14px; margin: 20px 0;">
      If the button doesn't work, copy and paste this link:<br>
      <a href="https://recapai.awslearn.cloud" style="color: #113359; word-break: break-all;">https://recapai.awslearn.cloud</a>
    </p>
    
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
    
    <p style="color: #666; font-size: 14px; margin: 0;">
      Best regards,<br>
      <strong style="color: #FF6B35;">The RecapAI Team</strong>
    </p>
  </div>
</body>
</html>`,
      userInvitation: {
        emailSubject:
          "You're invited to RecapAI - Transform Your Meetings with AI",
        emailBody: (user, code) =>
          `<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #113359 0%, #0f2a4a 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🎙️ RecapAI</h1>
    <p style="color: #31CCEC; margin: 10px 0 0 0;">AI-Powered Meeting Intelligence Platform</p>
  </div>
  
  <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">
    <h2 style="color: #113359; margin-top: 0;">You've been invited to RecapAI!</h2>
    
    <p>Welcome to RecapAI, the serverless platform that transforms every meeting into instantly digestible, visual summaries using AI. You've been invited to experience the future of meeting intelligence.</p>
    
    <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FF6B35;">
      <h3 style="color: #113359; margin-top: 0;">Your login credentials:</h3>
      <p style="margin: 10px 0;"><strong>Username:</strong> <code style="background: #f5f5f5; padding: 2px 6px; border-radius: 4px; color: #113359;">${user()}</code></p>
      <p style="margin: 10px 0;"><strong>Temporary password:</strong> <code style="background: #f5f5f5; padding: 2px 6px; border-radius: 4px; color: #FF6B35;">${code()}</code></p>
    </div>
    
    <div style="background: #fff3cd; border: 1px solid #F2C037; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; color: #856404;"><strong>⚠️ Important:</strong> Please log in and change your password on first access for security.</p>
    </div>
    
    <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #113359; margin-top: 0; font-size: 16px;">🚀 Get started with RecapAI:</h3>
      <ul style="margin: 10px 0; padding-left: 20px; color: #555;">
        <li>🎵 Upload or record your meeting audio</li>
        <li>📝 Watch AI transcribe with speaker identification</li>
        <li>🧠 Get intelligent summaries with key insights</li>
        <li>📊 View auto-generated visual diagrams</li>
        <li>💾 Access your meeting library anytime</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://recapai.awslearn.cloud" style="background: linear-gradient(135deg, #113359 0%, #FF6B35 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
        Access RecapAI Platform
      </a>
    </div>
    
    <p style="text-align: center; color: #666; font-size: 14px; margin: 20px 0;">
      If the button doesn't work, copy and paste this link:<br>
      <a href="https://recapai.awslearn.cloud" style="color: #113359; word-break: break-all;">https://recapai.awslearn.cloud</a>
    </p>
    
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
    
    <p style="color: #666; font-size: 14px; margin: 0;">
      Best regards,<br>
      <strong style="color: #FF6B35;">The RecapAI Team</strong><br>
      <em style="color: #31CCEC;">Transforming meetings with serverless AI</em>
    </p>
  </div>
</body>
</html>`,
      },
    },
  },
});
