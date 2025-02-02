import React from 'react'
import { assets } from '../assets/assets_frontend/assets'

const Footer = () => {
  return (
    <div className="md:mx-10">
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-24 text-sm">
        {/* Left */}
        <div>
          <img className="mb-5 w-40" src={assets.logo} alt="" />
          <p className="w-full md:w-2/3 text-gray-600 leading-6">
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Et odit
            incidunt eaque tempore saepe asperiores, veniam atque distinctio ut
            ipsa. Lorem ipsum, dolor sit amet consectetur adipisicing elit.
            Doloremque, dolorem quisquam? Veniam at neque autem dolorum,
            asperiores accusamus aut temporibus.
          </p>
        </div>

        {/* Center  */}
        <div>
          
          <ul className="flex flex-col gap-2 text-gray-600">
            <li>Home</li>
            <li>About Us</li>
            <li>Contact Us</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

        {/* Right */}
        <div>
          <p className="text-xl font-medium mb-5">Get in Touch</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <li>+12-2221-2212-222</li>
            <li>medilink@gmail.com</li>
          </ul>
        </div>
      </div>
      <div>
        <hr />
        <p className='py-5 text-sm text-center'>Copyright 2024 MediLink - All Right Reserved</p>
      </div>
    </div>
  );
}

export default Footer