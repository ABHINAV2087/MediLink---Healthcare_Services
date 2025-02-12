import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from 'react-toastify';

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
    const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken') || '');
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [dashData, setDashData] = useState(false);

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    // Create axios instance with default config
    const api = axios.create({
        baseURL: backendUrl,
        headers: {
            'Content-Type': 'application/json'
        }
    });

    // Update axios headers when adminToken changes
    useEffect(() => {
        if (adminToken) {
            api.defaults.headers.common['admintoken'] = adminToken;
        }
    }, [adminToken]);

    const getAllDoctors = async () => {
        try {
            const { data } = await api.get('/api/admin/all-doctors');
            if (data.success) {
                setDoctors(data.doctors);
                console.log(data.doctors);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
            console.error(error);
        }
    };

    const changeAvailability = async (docId) => {
        try {
            const { data } = await api.post('/api/admin/change-availability', { docId });
            if (data.success) {
                toast.success(data.message);
                await getAllDoctors();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    };

    const getAllAppointments = async () => {
        try {
            const { data } = await api.get('/api/admin/appointments');
            if (data.success) {
                setAppointments(data.appointments.reverse());
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
            console.error(error);
        }
    };

    const cancelAppointment = async (appointmentId) => {
        try {
            const { data } = await api.post('/api/admin/cancel-appointment', { appointmentId });
            if (data.success) {
                toast.success(data.message);
                await getAllAppointments();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
            console.error(error);
        }
    };

    const getDashData = async () => {
        try {
            const { data } = await api.get('/api/admin/dashboard');
            if (data.success) {
                setDashData(data.dashData);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
            console.error(error);
        }
    };

    const value = {
        adminToken,
        setAdminToken,
        backendUrl,
        getAllDoctors,
        doctors,
        changeAvailability,
        getAllAppointments,
        appointments,
        cancelAppointment,
        getDashData,
        dashData
    };

    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    );
};

export default AdminContextProvider;