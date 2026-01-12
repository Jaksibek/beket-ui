import { FilterTrip } from "@/entities/FilterTrip";
import { FilterOutlined } from "@ant-design/icons";
import { Button, Drawer } from "antd";
import type { Dispatch, SetStateAction } from "react";
import type { SeatTypeCodeEnum } from "../../model/types";
import { useTranslation } from "react-i18next";

interface IProps {
  showDrawer: () => void;
  onCloseDrawer: () => void;
  openDrawer: boolean;
  filter: "" | SeatTypeCodeEnum;
  setFilter: Dispatch<SetStateAction<"" | SeatTypeCodeEnum>>;

  setHasAC: Dispatch<SetStateAction<boolean>>;
  setHasCharger: Dispatch<SetStateAction<boolean>>;
  setHasWifi: Dispatch<SetStateAction<boolean>>;
  setHasTv: Dispatch<SetStateAction<boolean>>;
}

function FilterAndDrawer({
  showDrawer,
  onCloseDrawer,
  openDrawer,
  filter,
  setFilter,

  setHasAC,
  setHasCharger,
  setHasWifi,
  setHasTv,
}: IProps) {
  const { t } = useTranslation();

  return (
    <>
      <Button type="primary" onClick={showDrawer} icon={<FilterOutlined />}>
        {t("Filter")}
      </Button>

      <Drawer title={t("Filter")} onClose={onCloseDrawer} open={openDrawer}>
        <FilterTrip
          filter={filter}
          setFilter={setFilter}
          isMobile
          onCloseDrawer={onCloseDrawer}
          setHasAC={setHasAC}
          setHasCharger={setHasCharger}
          setHasWifi={setHasWifi}
          setHasTv={setHasTv}
        />
      </Drawer>
    </>
  );
}

export default FilterAndDrawer;
