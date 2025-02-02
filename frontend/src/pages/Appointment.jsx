import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets_frontend/assets";
import RelatedDoctors from "../components/RelatedDoctors";
import { toast } from "react-toastify";
import axios from "axios";
import { Calendar, Clock, MapPin, User, Video } from "lucide-react";

const Appointment = () => {
    const { docId } = useParams();
    const { doctors, currencySymbol, backendUrl, token, getDoctorsData } = useContext(AppContext);
    const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const navigate = useNavigate();

    const [docInfo, setDocInfo] = useState(null);
    const [docSlots, setDocSlots] = useState([]);
    const [slotIndex, setSlotIndex] = useState(0);
    const [slotTime, setSlotTime] = useState("");
    const [appointmentType, setAppointmentType] = useState("");

    // Helper function to format time in HH:MM format
    const formatTimeToHHMM = (date) => {
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${hours}:${minutes}`;
    };

    // Helper function to format date in DD_MM_YYYY format
    const formatDateToDDMMYYYY = (date) => {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}_${month}_${year}`;
    };

    // Fetch doctor information
    const fetchDocInfo = async () => {
        const docInfo = doctors.find((doc) => doc._id === docId);
        setDocInfo(docInfo);
    };

    // Get available slots for the doctor
    const getAvailableSlots = async () => {
        setDocSlots([]);
        let today = new Date();
        let isAfter9PM = today.getHours() >= 21;

        // Start from tomorrow if it's after 9 PM
        let startDate = isAfter9PM ? new Date(today.setDate(today.getDate() + 1)) : today;

        for (let i = 0; i < 7; i++) {
            let currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);

            let endTime = new Date(currentDate);
            endTime.setHours(21, 0, 0, 0); // Doctor's working hours end at 9 PM

            if (i === 0 && !isAfter9PM) {
                // If it's today and before 9 PM, start from the current time
                currentDate.setHours(
                    currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10
                );
                currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
            } else {
                // Otherwise, start from 10 AM
                currentDate.setHours(10);
                currentDate.setMinutes(0);
            }

            let timeSlots = [];

            while (currentDate < endTime) {
                const time = formatTimeToHHMM(currentDate);
                const displayTime = currentDate.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                });

                const slotDate = formatDateToDDMMYYYY(currentDate);

                // Check if the slot is available
                const isSlotAvailable = !(docInfo.slots_booked[slotDate]?.includes(time));

                if (isSlotAvailable) {
                    timeSlots.push({
                        datetime: new Date(currentDate),
                        time: time,
                        displayTime: displayTime,
                    });
                }

                // Increment by 30 minutes
                currentDate.setMinutes(currentDate.getMinutes() + 30);
            }

            setDocSlots((prev) => [...prev, timeSlots]);
        }
    };

    // Book appointment
    const bookAppointment = async () => {
        if (!token) {
            toast.warning("Login to book appointment");
            return navigate("/login");
        }

        if (!appointmentType) {
            toast.warning("Please select appointment type");
            return;
        }

        if (!slotTime) {
            toast.warning("Please select appointment time");
            return;
        }

        const date = docSlots[slotIndex][0].datetime;
        const slotDate = formatDateToDDMMYYYY(date);

        try {
            const { data } = await axios.post(
                `${backendUrl}/api/user/book-appointment`,
                {
                    docId,
                    slotDate,
                    slotTime,
                    appointmentType,
                },
                { headers: { token } }
            );

            if (data.success) {
                toast.success(data.message);
                getDoctorsData();
                navigate("/my-appointments");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Error booking appointment:", error);
            toast.error(error.message);
        }
    };

    // Fetch doctor info and slots on component mount
    useEffect(() => {
        fetchDocInfo();
    }, [doctors, docId]);

    useEffect(() => {
        if (docInfo) {
            getAvailableSlots();
        }
    }, [docInfo]);

    return (
        docInfo && (
            <div className="container mx-auto px-4">
                {/* Doctor Details Section */}
                <div className="flex flex-col sm:flex-row-reverse gap-4">
                    <div className="sm:ml-4">
                        <img
                            className="h-52 sm:h-64 md:h-auto sm:max-w-xs md:max-w-72 rounded-lg mx-auto sm:mx-0"
                            src={docInfo.image}
                            alt="Doctor's portrait"
                        />
                    </div>

                    <div className="flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-30px] sm:mt-0">
                        <p className="flex items-center gap-2 text-3xl font-medium text-gray-900">
                            {docInfo.name}
                            <img className="w-5" src={assets.verified_icon} alt="Verified icon" />
                        </p>

                        <div className="flex items-center gap-2 text-sm mt-2 text-gray-600">
                            <p>
                                {docInfo.degree} - {docInfo.speciality}
                            </p>
                            <button className="py-1 px-4 border text-xs rounded-full bg-red-100">
                                {docInfo.experience}
                            </button>
                        </div>

                        <div>
                            <p className="flex items-center gap-2 text-sm font-medium text-gray-900 mt-6 mb-3">
                                About <img src={assets.info_icon} alt="Info icon" />
                            </p>
                            <p className="text-sm text-gray-500 max-w-[700px] mt-1">
                                {docInfo.about}
                            </p>
                        </div>

                        <p className="text-gray-500 font-medium mt-6 gap-3 flex">
                            Appointment fee:
                            <span className="text-gray-600">
                                {currencySymbol}&nbsp;{docInfo.fees}/-
                            </span>
                        </p>
                    </div>
                </div>

                {/* Appointment Type Selection */}
                <div className="mt-12 font-medium text-gray-700">
                    <p className="text-2xl mb-6">Select Appointment Type</p>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => setAppointmentType("virtual")}
                            className={`px-8 py-4 rounded-full text-sm transition-colors duration-200 ${
                                appointmentType === "virtual"
                                    ? "bg-primary text-white"
                                    : "border border-gray-500 hover:bg-gray-50"
                            }`}
                        >
                            Virtual Meeting
                        </button>
                        <button
                            onClick={() => setAppointmentType("in-person")}
                            className={`px-8 py-4 rounded-full text-sm transition-colors duration-200 ${
                                appointmentType === "in-person"
                                    ? "bg-primary text-white"
                                    : "border border-gray-500 hover:bg-gray-50"
                            }`}
                        >
                            In-Person Visit
                        </button>
                    </div>
                </div>

                {/* Date Selection */}
                <div className="mt-12 font-medium text-gray-700">
                    <p className="text-2xl mb-6">Select Date & Time</p>
                    <div className="flex gap-3 items-center w-full overflow-x-auto pb-2">
                        {docSlots.length > 0 &&
                            docSlots.map((item, index) => (
                                <div
                                    onClick={() => setSlotIndex(index)}
                                    key={index}
                                    className={`text-center py-4 min-w-20 rounded-full cursor-pointer transition-colors duration-200 ${
                                        slotIndex === index
                                            ? "bg-primary text-white"
                                            : "border border-gray-500 hover:bg-gray-50"
                                    }`}
                                >
                                    <p>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
                                    <p>{item[0] && item[0].datetime.getDate()}</p>
                                </div>
                            ))}
                    </div>

                    {/* Time Selection */}
                    <div className="flex items-center gap-3 w-full overflow-x-auto mt-6 pb-2">
                        {docSlots.length > 0 &&
                            docSlots[slotIndex].map((item, index) => (
                                <p
                                    onClick={() => setSlotTime(item.time)}
                                    className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer transition-colors duration-200 ${
                                        item.time === slotTime
                                            ? "bg-primary text-white"
                                            : "text-gray-400 border border-gray-300 hover:bg-gray-50"
                                    }`}
                                    key={index}
                                >
                                    {item.displayTime.toLowerCase()}
                                </p>
                            ))}
                    </div>

                    <div className="flex justify-center mt-12">
                        <button
                            onClick={bookAppointment}
                            className="bg-primary text-white text-sm font-light px-14 py-3 rounded-full transition-opacity hover:opacity-90"
                        >
                            Book Appointment
                        </button>
                    </div>
                </div>

                {/* Related Doctors */}
                <div className="mt-16">
                    <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
                </div>
            </div>
        )
    );
};

export default Appointment;