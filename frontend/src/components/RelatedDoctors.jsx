import React, { useContext, useState, useEffect } from 'react'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'

const RelatedDoctors = ({speciality, docId}) => {
    const {doctors} = useContext(AppContext)
    const [relDocs, setRelDocs] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
      if(doctors.length > 0 && speciality){
        const doctorsData = doctors.filter((doc) => doc.speciality === speciality && doc._id !== docId)
        setRelDocs(doctorsData)
      }
    }, [doctors, speciality, docId])
    
    return (
        <div className="flex flex-col items-center gap-2 sm:gap-4 my-8 sm:my-16 text-gray-900 md:mx-10">
            <h1 className="text-2xl sm:text-3xl font-medium">Top Doctors to Book</h1>
            <p className="sm:w-1/3 text-center text-xs sm:text-sm px-4 sm:px-0">
                Simply browse through our extensive list of trusted doctors.
            </p>
            <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4 pt-3 sm:pt-5 gap-y-3 sm:gap-y-6 px-2 sm:px-0">
                {relDocs.slice(0, 5).map((item, index) => (
                    <div
                        onClick={() => {
                            navigate(`/appointment/${item._id}`);
                            scrollTo(0, 0);
                        }}
                        className="border border-blue-200 rounded-lg sm:rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-5px] sm:hover:translate-y-[-10px] transition-all duration-500"
                        key={index}
                    >
                        <img 
                            className="w-full h-24 sm:h-32 md:h-40 object-cover bg-blue-50" 
                            src={item.image} 
                            alt={item.name} 
                        />
                        <div className="p-2 sm:p-4">
                            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-green-500">
                                <p className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></p>
                                <p>Available</p>
                            </div>
                            <p className="text-gray-900 text-sm sm:text-lg font-medium mt-0.5 sm:mt-1 truncate">
                                {item.name}
                            </p>
                            <p className="text-gray-600 text-xs sm:text-sm truncate">
                                {item.speciality}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
            <button
                onClick={() => {
                    navigate("/doctors");
                    scrollTo(0, 0);
                }}
                className="text-gray-600 px-8 sm:px-12 py-2 sm:py-3 rounded-full mt-6 sm:mt-10 bg-cyan-200 text-sm sm:text-base"
            >
                More
            </button>
        </div>
    )
}

export default RelatedDoctors