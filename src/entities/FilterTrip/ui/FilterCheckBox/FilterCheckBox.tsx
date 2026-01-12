import { Checkbox, Flex } from "antd";
import type { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";

interface IProps {
  setHasAC: Dispatch<SetStateAction<boolean>>;
  setHasCharger: Dispatch<SetStateAction<boolean>>;
  setHasWifi: Dispatch<SetStateAction<boolean>>;
  setHasTv: Dispatch<SetStateAction<boolean>>;
}

function FilterCheckBox({
  setHasAC,
  setHasCharger,
  setHasWifi,
  setHasTv,
}: IProps) {
  const { t } = useTranslation();

  return (
    <Flex vertical gap={10}>
      <Checkbox onChange={(e) => setHasAC(e.target.checked)}>
        {t("Air Conditioning")}
      </Checkbox>
      <Checkbox onChange={(e) => setHasCharger(e.target.checked)}>
        {t("Charging Ports")}
      </Checkbox>
      <Checkbox onChange={(e) => setHasWifi(e.target.checked)}>
        {t("Wi-Fi")}
      </Checkbox>
      <Checkbox onChange={(e) => setHasTv(e.target.checked)}>
        {t("On-board TV")}
      </Checkbox>
    </Flex>
  );
}

export default FilterCheckBox;
