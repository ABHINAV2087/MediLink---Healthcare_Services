import { google } from 'googleapis';
import nodemailer from 'nodemailer';

// Google OAuth2 Client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Set OAuth2 credentials (refresh token)
oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

// Google Calendar API instance
const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

/**
 * Function to create a Google Calendar event with a Meet link.
 */
export const createGoogleMeetEvent = async (appointmentData) => {
  const { userData, docData, slotDate, slotTime } = appointmentData;

  // Validate slotDate and slotTime formats
  if (!slotDate || !slotDate.match(/^\d{2}_\d{2}_\d{4}$/)) {
    throw new Error('Invalid slotDate format. Expected format: DD_MM_YYYY');
  }

  if (!slotTime || !slotTime.match(/^\d{2}:\d{2}$/)) {
    throw new Error('Invalid slotTime format. Expected format: HH:MM');
  }

  // Parse slot date and time
  const [day, month, year] = slotDate.split('_').map(Number);
  const [startHour, startMinute] = slotTime.split(':').map(Number);

  // Validate parsed values
  if (isNaN(day) || isNaN(month) || isNaN(year) || isNaN(startHour) || isNaN(startMinute)) {
    throw new Error('Invalid date or time values');
  }

  if (month < 1 || month > 12) throw new Error('Invalid month. Expected value between 1 and 12');
  if (day < 1 || day > 31) throw new Error('Invalid day. Expected value between 1 and 31');
  if (startHour < 0 || startHour > 23) throw new Error('Invalid hour. Expected value between 0 and 23');
  if (startMinute < 0 || startMinute > 59) throw new Error('Invalid minute. Expected value between 0 and 59');

  // Create start and end times
  const startTime = new Date(year, month - 1, day, startHour, startMinute);
  const endTime = new Date(startTime.getTime() + 30 * 60000); // 30 minutes duration

  const event = {
    summary: `Appointment with ${docData.name}`,
    description: `Virtual appointment with Dr. ${docData.name} (${docData.speciality}).`,
    start: {
      dateTime: startTime.toISOString(),
      timeZone: 'UTC',
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: 'UTC',
    },
    conferenceData: {
      createRequest: {
        requestId: `appointment-${appointmentData._id}`,
        conferenceSolutionKey: {
          type: 'hangoutsMeet',
        },
      },
    },
    attendees: [{ email: userData.email }],
    reminders: {
      useDefault: true,
    },
  };

  try {
    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      conferenceDataVersion: 1,
    });

    const meetLink = response.data.hangoutLink;
    return meetLink;
  } catch (error) {
    console.error('Error creating Google Meet event:', error);
    throw error;
  }
};

/**
 * Function to send the Google Meet link via email.
 */
export const sendMeetLinkEmail = async (userData, meetLink, appointmentData) => {
  if (!appointmentData || !appointmentData.docData) {
    throw new Error('Invalid appointment data: docData is missing');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const emailContent = `Dear ${userData.name},

Your virtual consultation with MediLink is scheduled to begin soon. Please find your secure video consultation link below.

🎥 VIDEO CONSULTATION ACCESS
━━━━━━━━━━━━━━━━━━━━━━━━
• Join Link: ${meetLink}
• Doctor: ${appointmentData.docData.name}
• Date: ${formatDate(appointmentData.slotDate)}
• Time: ${formatTime(appointmentData.slotTime)} 
• Duration: 30 minutes

⚡ QUICK TECHNICAL CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━
✓ Test your internet connection
✓ Check camera and microphone

📝 JOINING INSTRUCTIONS
━━━━━━━━━━━━━━━━━━━━
1. Click the join link above
2. Allow camera and microphone access
3. Enter your name if prompted
4. Doctor will admit you at appointment time

💡 FOR BEST EXPERIENCE
━━━━━━━━━━━━━━━━━━
• Join 5 minutes before scheduled time
• Use Chrome or Firefox browser

• Have medical documents ready

❗ NEED HELP?
━━━━━━━━━━━
Having technical issues?

• Email: support@medilink.com


We're looking forward to your virtual consultation.

Best regards,
Team MediLink

Note: This is a secure link. Please do not share it with others.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MediLink Healthcare Services | Privacy Policy | Terms of Service`;

  const mailOptions = {
    from: {
      name: 'MediLink Healthcare',
      address: process.env.EMAIL_USER,
    },
    to: userData.email,
    subject: `Your Video Consultation Link - Appointment with Dr. ${appointmentData.docData.name}`,
    text: emailContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Meet link email sent successfully');
    console.log('====================================');
    console.log('Email sent to:', userData.email);
    console.log('Appointment ID:', appointmentData._id);
    console.log('====================================');
  } catch (error) {
    console.error('Error sending Meet link email:', error);
    throw error;
  }
};

// Helper function to format date
const formatDate = (dateString) => {
  const [day, month, year] = dateString.split('_');
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${day} ${months[parseInt(month) - 1]} ${year}`;
};

// Helper function to format time with AM/PM
const formatTime = (timeString) => {
  const [hour, minute] = timeString.split(':').map(Number);
  const period = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12; // Convert 0 to 12 for 12-hour format
  return `${formattedHour}:${minute.toString().padStart(2, '0')} ${period}`;
};