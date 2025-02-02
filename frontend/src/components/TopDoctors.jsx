import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { Star } from 'lucide-react';

const TopDoctors = () => {
  const navigate = useNavigate();
  const { doctors } = useContext(AppContext);

  const handleClick = (id) => {
    navigate(`/appointment/${id}`);
    window.scrollTo(0, 0);
  };

  return (
    <div className="flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10">
      <h1 className="text-3xl font-medium">Top Doctors to Book</h1>
      <p className="sm:w-1/3 text-center text-sm">
        Simply browse through our extensive list of trusted doctors.
      </p>
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-5 px-3 sm:px-0">
        {doctors.slice(0, 10).map((item, index) => (
          <div
            className="relative bg-white border border-blue-100 shadow-lg rounded-xl p-6 flex flex-col items-center text-center 
            transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl group cursor-pointer"
            key={index}
            onClick={() => handleClick(item._id)}
          >
            {/* Subtle gradient overlay */}
            <div
              className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 opacity-50 rounded-xl -z-10 
              group-hover:opacity-75 transition-all duration-300"
            ></div>

            {/* Availability Badge */}
            <div className="absolute top-4 left-4">
              {item.available ? (
                <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full border border-green-200">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-green-700 text-xs font-medium">Available</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 bg-red-50 px-2 py-1 rounded-full border border-red-200">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span className="text-red-700 text-xs font-medium">Not Available</span>
                </div>
              )}
            </div>

            {/* Rating Badge */}
            <div className="absolute top-4 right-4">
              <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full border border-yellow-200">
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                <span className="text-yellow-700 text-xs font-medium">
                  {item.rating || 4.8}
                </span>
              </div>
            </div>

            {/* Doctor Image with enhanced border and shadow */}
            <div className="relative w-28 h-28 mb-4 mt-4">
              <div className="absolute -inset-1 bg-blue-200 rounded-full blur-sm group-hover:opacity-75 transition-all duration-300"></div>
              <img
                className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg relative z-10"
                src={item.image}
                alt={item.name}
              />
            </div>

            {/* Doctor Details */}
            <h3 className="text-xl font-bold text-gray-800 mb-1">{item.name}</h3>
            <p className="text-sm text-gray-600 mb-1">{item.speciality}</p>
            <p className="text-sm text-gray-600 mb-3">{item.location}</p>

            {/* Experience Badge */}
            <div
              className="mt-auto px-3 py-2 bg-blue-50 text-blue-700 text-sm font-semibold rounded-full 
              flex items-center shadow-md group-hover:bg-blue-100 transition-all duration-300 text-xs border border-blue-300 group-hover:border-blue-400"
            >
              100+ Patients served on MediLink
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          navigate("/doctors");
          window.scrollTo(0, 0);
        }}
        className="bg-blue-50 text-gray-600 px-12 py-3 rounded-full mt-10 hover:bg-blue-100 transition-colors"
      >
        More
      </button>
    </div>
  );
};

export default TopDoctors;