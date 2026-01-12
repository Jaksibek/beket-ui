import { useTranslation } from "react-i18next";
import { SortTripEnum } from "../types";

export function useGetOptions() {
  const { t } = useTranslation();

  return [
    {
      label: t("By price, cheap first"),
      value: SortTripEnum.PRICE,
    },
    {
      label: t("Departure time"),
      value: SortTripEnum.DEPARTURE_TIME,
    },
    {
      label: t("Arrival time"),
      value: SortTripEnum.ARRIVAL_TIME,
    },
    {
      label: t("Number of seats"),
      value: SortTripEnum.SEATS_COUNT,
    },
  ];
}
