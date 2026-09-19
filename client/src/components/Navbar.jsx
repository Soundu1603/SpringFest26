import { motion } from "framer-motion";
import { FaCode } from "react-icons/fa";

function Navbar() {
  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 w-full z-50 bg-white/70 backdrop-blur-lg shadow-md"
    >

      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">

        {/* Logo */}
        <div className="flex items-center gap-2">
          <FaCode className="text-violet-600 text-3xl" />

          <h1 className="text-2xl font-bold text-violet-600">
            SPRING FEST'26
          </h1>
        </div>


        {/* Menu */}
        <div className="hidden md:flex gap-8 text-gray-700 font-medium">

          <a href="#" className="hover:text-violet-600">
            Home
          </a>

          <a href="#" className="hover:text-violet-600">
            About
          </a>

          <a href="#" className="hover:text-violet-600">
            Events
          </a>

          <a href="#" className="hover:text-violet-600">
            Gallery
          </a>

          <a href="#" className="hover:text-violet-600">
            Contact
          </a>

        </div>


        {/* Button */}
        <button
          className="
          bg-violet-600 
          text-white 
          px-5 
          py-2 
          rounded-full
          hover:bg-violet-700
          transition
          "
        >
          Register Now
        </button>


      </div>

    </motion.nav>
  );
}

export default Navbar;