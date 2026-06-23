import { Link } from "react-router-dom";
import styles from "./Logo.module.scss";
import { appRoutes } from "@/shared/config/router";

function Logo() {
  return (
    <Link to={appRoutes.home} className={styles.logoContainer}>
      <svg
        width="34"
        height="34"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.logoIcon}
      >
        <rect width="32" height="32" rx="9" fill="url(#blueLogoGradient)" />
        {/* Dynamic swooping ribbon arrow representing path routes */}
        <path
          d="M8 16C8 11.58 11.58 8 16 8C20.42 8 24 11.58 24 16C24 18.5 22 21.5 19 23"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15 23H23"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <circle cx="16" cy="16" r="3" fill="white" />
        <defs>
          <linearGradient
            id="blueLogoGradient"
            x1="0"
            y1="0"
            x2="32"
            y2="32"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#00C6FF" />
            <stop offset="1" stopColor="#0072FF" />
          </linearGradient>
        </defs>
      </svg>
      <span className={styles.logoText}>
        BEKET<span className={styles.logoSubtext}>travel</span>
      </span>
    </Link>
  );
}

export default Logo;
