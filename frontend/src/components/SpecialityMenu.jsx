import React from 'react';
import { assets, specialityData, doctors } from "../assets/assets_frontend/assets";
import { Link } from 'react-router-dom';

const SpecialityMenu = () => {
  return (
    <div
      className="flex flex-col items-center gap-4 py-8 md:py-16 px-4 md:px-8 text-gray-800"
      id="speciality"
    >
      <h1 className="text-2xl md:text-3xl font-medium text-center">
        Find by Speciality
      </h1>

      <p className="w-full md:w-2/3 lg:w-1/3 text-center text-sm md:text-base">
        Simply browse through our extensive list of trusted doctors, schedule
        your appointments
      </p>

      <div className="flex flex-row justify-start md:justify-center gap-4 md:gap-10 pt-5 w-full overflow-x-auto pb-4 md:pb-0">
        {specialityData.map((item, index) => (
          <Link
            onClick={() => scrollTo(0, 0)}
            className="flex flex-col items-center text-xs md:text-sm cursor-pointer flex-shrink-0 hover:translate-y-[-10px] transition-all duration-500"
            key={index}
            to={`/doctors/${item.speciality}`}
          >
            <div className="flex items-center justify-center w-20 h-20 md:w-32 md:h-32 rounded-full overflow-hidden p-1">
              <div className="bg-white rounded-full flex items-center justify-center w-full h-full">
                <img
                  src={item.image}
                  className="w-full h-full object-contain"
                  alt={item.speciality}
                />
              </div>
            </div>


            <p className="text-sm md:text-base mt-2 font-bold">{item.speciality}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SpecialityMenu;