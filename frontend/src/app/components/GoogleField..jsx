import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useGoogle } from '../hooks/useGoogle';

const GoogleField = () => {
    const { handleGoogle } = useGoogle();
    return (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-xl font-medium shadow-sm transition-all"
        >
          <Image
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            width={20}
            height={20}
          />
          Continue with Google
        </motion.button>
    );
};

export default GoogleField;