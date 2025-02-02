import React, { useContext } from 'react'
import Login from './pages/Login'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AdminContext } from './context/AdminContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { Route,Routes } from 'react-router-dom';
import Dashboard from './pages/Admin/Dashboard';
import AllAppointments from './pages/Admin/AllAppointments';
import AddDocter from './pages/Admin/AddDoctor';
import DoctorsList from './pages/Admin/DoctorsList';



import { DoctorContext } from './context/DoctorContext';
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import DoctorAppointment from './pages/Doctor/DoctorAppointment'
import DoctorProfile from './pages/Doctor/DoctorProfile'


const App = () => {
  const { adminToken } = useContext(AdminContext)
  const {doctorToken} = useContext(DoctorContext)

  return adminToken || doctorToken ? (
    <div className='bg-[#F8F9FD] overflow-hidden h-screen w-full'>
      <ToastContainer />
      <Navbar  />
      <div className='flex items-start '>
        <Sidebar />
        <Routes>
          {/* admin route */}
          <Route path='/' element={<></>} />
          <Route path='/admin-dashboard' element={<Dashboard />} />
          <Route path='/all-appointments' element={<AllAppointments />} />
          <Route path='/add-doctor' element={<AddDocter />} />
          <Route path='/doctor-list' element={<DoctorsList />} />

          {/* docter route */}
          <Route path='/doctor-dashboard' element={<DoctorDashboard />} />
          <Route path='/doctor-appointments' element={<DoctorAppointment />} />
          <Route path='/doctor-profile' element={<DoctorProfile />} />
        </Routes>
      </div>
    </div>
  ) : (
    <div>
      <Login />
      <ToastContainer />
    </div>
  )
}

export default App