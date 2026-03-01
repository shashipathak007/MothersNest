import { Link } from "react-router-dom";
import logo from "../../Assets/logoo.png";

export default function BrandLogo({ showText = true }) {
  return (
    <Link to="/dashboard" className="flex items-center gap-3 shrink-0">
      <div className="w-11 h-11 rounded-full overflow-hidden shadow-md">
        <img
          src={logo}
          alt="MothersNest Logo"
          className="w-full h-full object-cover scale-130"
        />
      </div>

      {showText && (
        <div className="hidden sm:block">
          <p
            className="text-lg font-semibold text-stone-900 leading-none"
            style={{ fontFamily: "var(--font-display)" }}
          >
            MothersNest
          </p>
          <p className="text-[10px] text-stone-400 tracking-wide mt-0.5">
            Antenatal Care Clinic
          </p>
        </div>
      )}
    </Link>
  );
}