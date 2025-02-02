import validator from 'validator';
import bcrypt from 'bcrypt';
import userModel from '../models/userModel.js';
import doctorModel from '../models/doctorModel.js';
import appointmentModel from '../models/appointmentModel.js';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';
import razorpay from 'razorpay';
import nodemailer from 'nodemailer';
import { createGoogleMeetEvent, sendMeetLinkEmail } from '../utils/googleCalendar.js';

// Configure Razorpay
const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Helper function to format date
const formatDate = (dateString) => {
  const [day, month, year] = dateString.split('_');
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${day} ${months[parseInt(month) - 1]} ${year}`;
};

// Helper function to format address
const formatAddress = (address) => {
  if (!address) return 'Address not available';

  const addressParts = [];
  if (address.line1) addressParts.push(address.line1);
  if (address.line2) addressParts.push(address.line2);

  return addressParts.join(', ').trim() || 'Address not available';
};

// Helper function to format specialization
const formatSpecialization = (specialization) => {
  return specialization ? specialization : 'General Physician';
};

// API to register user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation checks
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
    }

    // Hashing the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = { name, email, password: hashedPassword };
    const newUser = new userModel(userData);
    const user = await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({ success: true, token });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ success: false, message: 'This email is already registered. Please try another email.' });
    } else {
      res.status(500).json({ success: false, message: 'An unexpected error occurred. Please try again later.' });
    }
  }
};

// API to login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User does not exist' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
      res.status(200).json({ success: true, token });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to get user profile data
const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.body;
    const userData = await userModel.findById(userId).select('-password');

    res.status(200).json({ success: true, userData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to update user profile
const updateUserProfile = async (req, res) => {
  try {
    const { userId, name, phone, address, dob, gender } = req.body;
    const imageFile = req.file;

    if (!name || !phone || !dob || !gender) {
      return res.status(400).json({ success: false, message: 'Data Missing' });
    }

    await userModel.findByIdAndUpdate(userId, {
      name,
      phone,
      address: JSON.parse(address),
      dob,
      gender,
    });

    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' });
      const imageURL = imageUpload.secure_url;

      await userModel.findByIdAndUpdate(userId, { image: imageURL });
    }

    res.status(200).json({ success: true, message: 'Profile Updated' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to book an appointment
const bookAppointment = async (req, res) => {
  try {
    const { userId, docId, slotDate, slotTime, appointmentType } = req.body;

    // Validate appointment type
    if (!appointmentType || !['virtual', 'in-person'].includes(appointmentType)) {
      return res.status(400).json({ success: false, message: 'Invalid appointment type' });
    }

    const docData = await doctorModel.findById(docId).select('-password');

    if (!docData.available) {
      return res.status(400).json({ success: false, message: 'Doctor Not Available' });
    }

    let slots_booked = docData.slots_booked;

    // Check for slot availability
    if (slots_booked[slotDate] && slots_booked[slotDate].includes(slotTime)) {
      return res.status(400).json({ success: false, message: 'Slot Not Available' });
    }

    // Book the slot
    if (!slots_booked[slotDate]) {
      slots_booked[slotDate] = [];
    }
    slots_booked[slotDate].push(slotTime);

    const userData = await userModel.findById(userId).select('-password');

    const appointmentData = {
      userId,
      docId,
      userData,
      docData,
      amount: docData.fees,
      slotTime,
      slotDate,
      appointmentType,
      date: Date.now(),
    };

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    // Save updated slots data in docData
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    // Debug log
    console.log('New Appointment Data:', newAppointment);

    // If it's a virtual appointment, create a Google Meet event
    if (appointmentType === 'virtual') {
      const meetLink = await createGoogleMeetEvent(newAppointment);
      await sendMeetLinkEmail(userData, meetLink, newAppointment);
    }

    // Send appointment confirmation email
    await sendAppointmentEmail(newAppointment);

    res.status(200).json({ success: true, message: 'Appointment Booked' });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const { userId, appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    // Verify appointment user
    if (appointmentData.userId !== userId) {
      return res.json({ success: false, message: 'Unauthorized action' });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

    // Releasing doctor slot
    const { docId, slotDate, slotTime } = appointmentData;

    const doctorData = await doctorModel.findById(docId);

    let slots_booked = doctorData.slots_booked;

    slots_booked[slotDate] = slots_booked[slotDate].filter((e) => e !== slotTime);

    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({ success: true, message: 'Appointment Cancelled' });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get user appointments
const listAppointment = async (req, res) => {
  try {
    const { userId } = req.body;
    const appointments = await appointmentModel.find({ userId });

    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to make payment of appointment using Razorpay
const paymentRazorpay = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData || appointmentData.cancelled) {
      return res.json({ success: false, message: 'Appointment Cancelled or not found' });
    }

    // Creating options for Razorpay payment
    const options = {
      amount: appointmentData.amount * 100,
      currency: process.env.CURRENCY,
      receipt: appointmentId,
    };

    // Creation of an order
    const order = await razorpayInstance.orders.create(options);

    res.json({ success: true, order });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to verify Razorpay payment
const verifyRazorpay = async (req, res) => {
    try {
      const { razorpay_order_id } = req.body;
      const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);
  
      if (orderInfo.status === 'paid') {
        // Update appointment payment status
        const appointmentId = orderInfo.receipt;
        const appointmentData = await appointmentModel.findByIdAndUpdate(
          appointmentId,
          { payment: true },
          { new: true }
        ).populate('userData').populate('docData');
  
        // If it's a virtual appointment, create a Google Meet event and send an email
        if (appointmentData.appointmentType === 'virtual') {
          const meetLink = await createGoogleMeetEvent(appointmentData);
          await sendMeetLinkEmail(appointmentData.userData, meetLink, appointmentData);
  
          // Update the appointment with the meeting link
          await appointmentModel.findByIdAndUpdate(appointmentId, { meetLink });
        }
  
        // Send payment confirmation email
        await sendPaymentConfirmationEmail(appointmentData);
  
        res.json({ success: true, message: 'Payment Successful' });
      } else {
        res.json({ success: false, message: 'Payment Failed' });
      }
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: error.message });
    }
  };

// Function to send appointment confirmation email
const sendAppointmentEmail = async (appointmentData) => {
  const { userData, docData, slotDate, slotTime, appointmentType } = appointmentData;

  const emailContent = `Dear ${userData.name},

Thank you for choosing MediLink for your healthcare needs. Your appointment has been successfully scheduled and confirmed.

🏥 APPOINTMENT DETAILS
━━━━━━━━━━━━━━━━━━━━
• Doctor: Dr. ${docData.name}
• Specialization: ${formatSpecialization(docData.specialization)}
• Date: ${formatDate(slotDate)}
• Time: ${slotTime}
• Type: ${appointmentType === 'virtual' ? 'Video Consultation' : 'In-Person Visit'}
• Amount Paid: ₹${appointmentData.amount}

${appointmentType === 'virtual' ? `
🎥 VIDEO CONSULTATION PREPARATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Technical Setup (15 minutes before)
   • Test your internet connection
   • Check camera and microphone
   • Ensure device is fully charged
   • Find a quiet, well-lit space

2. Meeting Access
   • Video link will be sent 30 minutes before
   • Join 5 minutes early
   • Allow camera/microphone permissions
   • Keep a backup device ready

3. For Best Experience
   • Use a stable internet connection
   • Ensure good lighting on your face
   • Minimize background noise
   • Have a stable surface for your device` 
: `
📍 CLINIC LOCATION & DIRECTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━
• Address: ${formatAddress(docData.address)}
• Landmark: ${docData.landmark || 'Not specified'}

⏰ ARRIVAL INSTRUCTIONS
━━━━━━━━━━━━━━━━━━━━
• Please arrive 15 minutes early
• Follow clinic signage
• Report to reception desk
• Keep your appointment ID handy`}

📋 WHAT TO BRING
━━━━━━━━━━━━━━
1. Medical Records
   • Previous consultation reports
   • Recent test results
   • X-rays or scan reports
   • List of current medications

2. Personal Items
   • Valid photo ID
   • Insurance card (if applicable)
   • Method of payment
   • Water and light snacks if needed

📝 PREPARATION GUIDELINES
━━━━━━━━━━━━━━━━━━━━━━
1. Medical Information
   • List your current symptoms
   • Note duration of symptoms
   • Write down your questions
   • Record any allergies

2. Health Updates
   • Recent health changes
   • New medications
   • Recent procedures
   • Lifestyle changes

❗ IMPORTANT POLICIES
━━━━━━━━━━━━━━━━━
• Cancellation: 24-hour notice required
• Rescheduling: Use app or website
• Late arrival: May require rescheduling
• Follow-up: Book through the app

📱 MEDILINK APP FEATURES
━━━━━━━━━━━━━━━━━━━━
• View appointment details
• Access medical records
• Chat with support team
• Download prescriptions
• Book follow-ups
• Set reminders

💁 NEED ASSISTANCE?
━━━━━━━━━━━━━━━━
• 📞 Phone: +91-XXXXXXXXXX
• 📧 Email: support@medilink.com
• 💬 Chat: Available in MediLink App
• ⏰ Hours: Mon-Sat (9:00 AM - 6:00 PM)

For emergencies after hours, please visit your nearest emergency room.

We look forward to providing you with excellent healthcare service.

Best regards,
Team MediLink

Note: This is an automated email. Please do not reply.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MediLink Healthcare Services
Download our app: [App Store] | [Play Store]
Follow us: [Facebook] | [Twitter] | [Instagram]
Privacy Policy | Terms of Service | Contact Us`;

  const mailOptions = {
    from: {
      name: 'MediLink Healthcare',
      address: process.env.EMAIL_USER,
    },
    to: userData.email,
    subject: `Appointment Confirmed - Your ${appointmentType === 'virtual' ? 'Video Consultation' : 'Visit'} with Dr. ${docData.name}`,
    text: emailContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Appointment confirmation email sent successfully');
    console.log('====================================');
    console.log('Email sent to:', userData.email);
    console.log('Appointment ID:', appointmentData._id);
    console.log('====================================');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  paymentRazorpay,
  verifyRazorpay,
};