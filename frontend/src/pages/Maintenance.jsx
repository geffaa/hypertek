import React from "react";
import "../styles/maintenance.css";
import logo from "../assets/logo1.webp";

export default function Maintenance() {
    return (
        <div className="maintenance-bg fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden font-inter">
            <div className="maintenance-glow" />
            <div className="flex flex-col items-center z-10">
                <div className="flex items-center lg:gap-2">
                    <img
                        src={logo}
                        alt="Hyper Tek Logo"
                        className="w-[140px] h-[140px] md:w-[200px] md:h-[200px] lg:w-[360px] lg:h-[360px] shrink-0 drop-shadow-[0_0_60px_rgba(80,160,255,0.2)] maintenance-float"
                    />

                    <div className="flex flex-col">
                        <h1 className="font-orbitron font-black text-white text-3xl md:text-7xl lg:text-[88px] leading-[1.1] tracking-[0.25em] maintenance-title-in">
                            HYPER
                        </h1>
                        <h1 className="font-orbitron font-black text-white text-3xl md:text-7xl lg:text-[88px] leading-[1.1] tracking-[0.25em] maintenance-title-in delay-150">
                            TEK
                        </h1>
                        <p className="text-white font-inter font-medium text-[5px] md:text-lg lg:text-xl tracking-[0.3em] uppercase mt-3 md:mt-5 maintenance-fade-up delay-400">
                            Building Worlds, One Game At A Time
                        </p>
                    </div>
                </div>

                <div className="w-16 md:w-20 lg:w-24 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-10 md:my-14 lg:my-16 maintenance-fade-up delay-600" />

                <h2 className="font-orbitron font-bold text-white text-2xl md:text-4xl lg:text-5xl tracking-[0.18em] uppercase maintenance-fade-up delay-700">
                    Coming Soon
                </h2>
            </div>
        </div>
    );
}
