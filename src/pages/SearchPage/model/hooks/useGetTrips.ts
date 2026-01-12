import { queryKeys } from "@/shared/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getTripSearch } from "../services";

interface IProps {
  from?: string;
  to?: string;
  date?: string;
}

export function useGetTrips({ from, to, date }: IProps) {
  const { i18n } = useTranslation();

  return useQuery({
    queryKey: [queryKeys.tripSearch, i18n.language, from, to, date],
    queryFn: () => {
      if (from && to && date) {
        return getTripSearch(from, to, date);
      }
    },
    enabled: !!from && !!to && !!date,
  });
}
