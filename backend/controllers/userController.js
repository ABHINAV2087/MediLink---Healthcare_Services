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

  const emailContent = `
    <p>Dear <strong>${userData.name}</strong>,</p>
    <p>Thank you for choosing <strong>MediLink</strong> for your healthcare needs. Your appointment has been successfully scheduled and confirmed.</p>
    <hr>
    <h2>🏥 Appointment Details</h2>
    <ul>
      <li><strong>Doctor:</strong> ${docData.name}</li>
      <li><strong>Specialization:</strong> ${formatSpecialization(docData.specialization)}</li>
      <li><strong>Date:</strong> ${formatDate(slotDate)}</li>
      <li><strong>Time:</strong> ${slotTime}</li>
      <li><strong>Type:</strong> ${appointmentType === 'virtual' ? 'Video Consultation' : 'In-Person Visit'}</li>
      <li><strong>Amount Paid:</strong> ₹${appointmentData.amount}</li>
    </ul>
    ${appointmentType === 'virtual' ? `
      <h3>🎥 Video Consultation Preparation</h3>
      <ul>
        <li><strong>Technical Setup (15 minutes before):</strong></li>
        <ul>
          <li>✅ Test your internet connection</li>
          <li>✅ Check camera and microphone</li>
        </ul>
        <li><strong>Meeting Access:</strong></li>
        <ul>
          <li>🔗 Video link will be sent after payment</li>
          <li>⏳ Join 5 minutes early</li>
        </ul>
      </ul>
    ` : `
      <h3>📍 Clinic Location & Directions</h3>
      <ul>
        <li><strong>Address:</strong> ${formatAddress(docData.address)}</li>
        <li><strong>Landmark:</strong> ${docData.landmark || 'Not specified'}</li>
      </ul>
      <h3>⏰ Arrival Instructions</h3>
      <ul>
        <li>🚪 Arrive 15 minutes early</li>
        <li>🚸 Follow clinic signage</li>
        <li>📑 Report to reception desk</li>
        <li>🆔 Keep your appointment ID handy</li>
      </ul>
    `}
    <h3>📋 What to Bring</h3>
    <ul>
      <li>📄 Previous consultation reports</li>
      <li>🩺 Recent test results</li>
      <li>🖼️ X-rays or scan reports</li>
      <li>💊 List of current medications</li>
    </ul>
    <p>For further assistance, please contact us via email or chat through the MediLink app.</p>
    <p>We look forward to serving you!</p>
    <p><strong>Team MediLink</strong></p>
    <hr>
    <p style="font-size: 12px; color: gray;">This is an automated email. Please do not reply.</p>
  `;

  const mailOptions = {
    from: {
      name: 'MediLink Healthcare',
      address: process.env.EMAIL_USER,
    },
    to: userData.email,
    subject: `Appointment Confirmed - Your ${appointmentType === 'virtual' ? 'Video Consultation' : 'Visit'} with ${docData.name}`,
    html: emailContent, // Use the HTML format here
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Appointment confirmation email sent successfully');
  } catch (error) {
    console.error('❌ Error sending email:', error);
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