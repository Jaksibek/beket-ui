import { Link } from "react-router-dom";
import styles from "./Logo.module.scss";
import { appRoutes } from "@/shared/config/router";

function Logo() {
  return (
    <Link to={appRoutes.home} className={styles.logoLink}>
      BEKET
    </Link>
  );
}

export default Logo;
