import { useTranslation } from "react-i18next";
import type { FilterTripItem } from "../types";

export function useGetOptions(isMobile?: boolean) {
  const { t } = useTranslation();

  const options: FilterTripItem[] = [
    { value: "1", label: t("Sedentary") },
    { value: "2", label: t("Sleeper") },
  ];

  return isMobile ? [...options, { value: "", label: t("All") }] : options;
}
