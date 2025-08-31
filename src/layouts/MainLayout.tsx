import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { type Container, type ISourceOptions, MoveDirection, OutMode } from "@tsparticles/engine";
import { useEffect, useState, useCallback } from 'react';
import CustomCursor from '@/components/CustomCursor';
import Footer from '@/components/Footer';

interface MainLayoutProps {
  children: ReactNode;
}

const particlesOptions: ISourceOptions = {
  background: {
    color: {
      value: "transparent",
    },
  },
  fpsLimit: 60,
  interactivity: {
    events: {
      onClick: {
        enable: true, 
        mode: "push", 
      },
      onHover: {
        enable: true,

        mode: ["repulse", "bubble"], 
      },
      resize: true, 
    },
    modes: {
      push: {
        quantity: 4, 
      },
      repulse: {
        distance: 80, 
        duration: 0.4,
      },
      bubble: { 
        distance: 150,
        size: 8, 
        duration: 2,
        opacity: 0.8, 
      }
    },
  },
  particles: {
    color: {
      value: "#FFA500", 
    },
    links: {
      color: "#000000",
      distance: 150,
      enable: true,
      opacity: 0.3,
      width: 1,
    },
    move: {
      direction: MoveDirection.none,
      enable: true,
      outModes: {
        default: OutMode.out,
      },
      random: false,
      speed: 0.5,
      straight: false,
    },
    number: {
      density: {
        enable: true,
        area: 800,
      },
      value: 80,
    },
    opacity: {
      value: 0.5,
    },
    shape: {
      type: "circle",
    },
    size: {
      value: { min: 1, max: 3 },
    },
  },
  detectRetina: true,
};

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [particlesInit, setParticlesInit] = useState(false);

  const particlesInitFunction = useCallback(async (engine: any) => {
    await loadSlim(engine);
    setParticlesInit(true);
  }, []);

  const particlesLoaded = async (container?: Container) => {
    // console.log(container);
  };

  return (
    <div className="relative min-h-screen bg-jay-black overflow-hidden font-poppins flex flex-col">

      <motion.div
        className="absolute inset-0 z-0 opacity-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ duration: 1, ease: "easeOut" }}
        style={{
          background: `
            radial-gradient(at 20% 80%, var(--color-jay-orange) 0px, transparent 50%),
            radial-gradient(at 80% 20%, var(--color-jay-white) 0px, transparent 50%),
            radial-gradient(at 50% 50%, var(--color-jay-gray-dark) 0px, transparent 50%)
          `,
          backgroundSize: '150% 150%',
          backgroundPosition: '50% 50%',
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{
          repeat: Infinity,
          duration: 60,
          ease: "linear",
        }}
      />
      {/* Glitch Overlay */}
      <div className="absolute inset-0 z-5 pointer-events-none opacity-5 hex-grid-overlay"></div> {/* Corrected z-index for hex-grid */}


      {particlesInit && (
        <Particles
          id="tsparticles"
          className="absolute inset-0 z-15"
          init={particlesInitFunction}
          particlesLoaded={particlesLoaded}
          options={particlesOptions}
        />
      )}

      <CustomCursor />

      <div className="relative z-20 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </div>


      <style jsx>{`
        .noise-overlay {
          background-image: url('data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBpxcCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDEwMCAxMDAiIHhtbDpzcGFjZT0icHJlc2VydmUiPjxkZWxzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuMCIgcGF0dGVybldpZHRoPSIyIiBwYXR0ZXJuSGVpZ2h0PSIyIiB4PSIwIiB5PSIwIj48cmVjdCB3aWR0aD0iMiIgaGVpZ2h0PSIyIiBmaWxsPSJibGFjayIvPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IndoaXRlIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0idXJsKCNwYXR0ZXJuMCkiLz48L3N2Zz4=');
          background-size: 2px 2px;
          animation: grain 8s steps(10) infinite;
        }

        @keyframes grain {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-5%, -10%); }
          20% { transform: translate(-15%, 10%); }
          30% { transform: translate(7%, -8%); }
          40% { transform: translate(-10%, 12%); }
          50% { transform: translate(15%, -5%); }
          60% { transform: translate(-20%, 8%); }
          70% { transform: translate(5%, -15%); }
          80% { transform: translate(-12%, 7%); }
          90% { transform: translate(10%, -10%); }
        }

        .hex-grid-overlay {
          background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE4LjM5MjMgNi43NTdMMjAuNzU4MSA4Ljk5MDM4QzIxLjEzNzggOS4zMzU5NiAyMS4zMzg0IDkuODA0ODcgMjEuMzM4NCAxMC4zMTU0VjEzLjY4NDZDMjEuMzM4NCAxNC4xOTUyIDIxLjEzNzggMTQuNjY0MSAyMC43NTgxIDE1LjAwOTZMMTguMzkyMyAxNy4yNDI2QzE4LjAxMjYgMTcuNTg4MiAxNy41MTE5IDE3Ljc4ODUgMTYuOTk2NyAxNy43ODg1SDcuMDAzMjlDMuM2MjM4IDE3Ljc4ODUuOTUyMDEgMTQuNjY0MSAxLjQ5MDI4IDE0LjU0MTJMMTIgMy44NzUwNkwxOC4zOTIzIDYuNzU3WiIgc3Ryb2tlPSIjRkZBNTAwIiBzdHJva2Utd2lkdGg9IjAuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik03LjAwMzI5IDYuNzU3TDIuNjYxNTggOS4zMDUyQzIuMjI0NzYgOS43OTYzIDIuMTM4NCAxMC4yMTQxIDIuMTM4NCAxMC42ODY3VjEzLjMxMzNDMi4xMzg0IDEzLjk4NTkgMi4yMjQ3NiAxNC42NDI5IDIuNjYxNTggMTUuMjA5M0w3LjAwMzI5IDE3Ljk3MDgiIHN0cm9rZT0iI0ZGRTUwMCIgc3Ryb2tlLXdpZHRoPSIwLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBkPSJNMTEuOTk2NyAzLjg3NTA2TDE2Ljk5NjcgNi4wMDM5OEMxNy4xNjQxIDYuNTUzNzYgMTcuMjEzNCA3LjA1MjY3IDE3LjIzMzMgNy42OTAzOFYxMC4yMTQxQzE3LjIzMzMgMTAuNTEzNCAxNy4xOTU5IDExLjAyMTMgMTcuMDgzOCAxMS41MTM0TDE1LjU2OTkgMTIuODc1M0MxNS4xMjkxIDEzLjQ0MTcgMTQuNTA4MiAxMy43ODU5IDE0LjM4OTggMTMuODc0NVYxMS45OTYzQzE0LjM4OTggMTIuNTY1MyAxNC4xOTU5IDEzLjA5MTkgMTMuOTM5OCAxMy42Mjg3TDEyLjU2OTkgMTQuMDI0N0MxMi4yNjUxIDE0LjI3NTMgMTEuOTA5MyAxNC41NTI3IDExLjYyODcgMTQuNzQ5NUwxMC40Mzk4IDE1LjQ4ODdDMTAuMTE4MiAxNS44MDYzIDkuNjMzMzMgMTYuMDA2IDkuMTkwMDcgMTYuMDA2SDYuODc0NVY3LjAyOTYyQzcuMDE0MjYgOC41ODUzIDYuOTU4NTMgOC44ODkzIDYuODY5MzggOS4xMDI3MUw1LjU3MzQxIDEwLjE4OTRDNS4yOTYwNyAxMC41MTk3IDUuMTgzOTkgMTEuMDg5OSAxMS45OTY3IDMuODc1MDZaIiBzdHJva2U9IiNGRkE1MDAiIHN0cm9rZS13aWR0aD0iMC41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+');
          background-size: 80px 80px;
          animation: hex-grid-pan 120s linear infinite;
          transform-origin: 0 0;
        }

        @keyframes hex-grid-pan {
          from { background-position: 0 0; }
          to { background-position: -8000px -8000px; }
        }
      `}</style>
    </div>
  );
};

export default MainLayout;