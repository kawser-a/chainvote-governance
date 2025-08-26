import { useState } from 'react';

export default function CustomDropdown({ options, value, onChange, placeholder }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <div
                className="w-full bg-[#242424] border border-gray-700 rounded-lg px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-[#C9F300] focus:border-transparent cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                {value || placeholder}
            </div>

            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-[#242424] border border-gray-700 rounded-lg shadow-lg">
                    {options.map((option) => (
                        <div
                            key={option}
                            className={`px-4 py-3 cursor-pointer hover:bg-[#C9F300] hover:text-[#121212] ${value === option ? 'bg-[#9EFF00] text-[#121212]' : 'text-white'
                                }`}
                            onClick={() => {
                                onChange(option);
                                setIsOpen(false);
                            }}
                        >
                            {option}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
