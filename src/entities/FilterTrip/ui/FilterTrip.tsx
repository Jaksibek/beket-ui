import { Card, Divider, Radio, type RadioChangeEvent } from "antd";
import type { SeatTypeCodeEnum } from "@/pages/SearchPage";
import { useCallback, type Dispatch, type SetStateAction } from "react";
import { SortOrFilterTop } from "@/shared/ui/SortOrFilterTop";
import { useGetOptions } from "../model/hooks/useGetOptions";
import FilterCheckBox from "./FilterCheckBox/FilterCheckBox";

interface IProps {
  filter: "" | SeatTypeCodeEnum;
  setFilter: Dispatch<SetStateAction<"" | SeatTypeCodeEnum>>;
  isMobile?: boolean;
  onCloseDrawer?: () => void;

  setHasAC: Dispatch<SetStateAction<boolean>>;
  setHasCharger: Dispatch<SetStateAction<boolean>>;
  setHasWifi: Dispatch<SetStateAction<boolean>>;
  setHasTv: Dispatch<SetStateAction<boolean>>;
}

function FilterTrip(props: IProps) {
  const {
    filter,
    setFilter,
    isMobile,
    onCloseDrawer,
    setHasAC,
    setHasCharger,
    setHasWifi,
    setHasTv,
  } = props;

  const options = useGetOptions(isMobile);

  const onChange = ({ target: { value } }: RadioChangeEvent) => {
    setFilter(value);

    if (isMobile && onCloseDrawer) {
      onCloseDrawer();
    }
  };

  const onClear = useCallback(() => {
    setFilter("");
  }, [setFilter]);

  if (isMobile) {
    return (
      <>
        <Radio.Group
          value={filter}
          options={options}
          onChange={onChange}
          vertical
        />
        <Divider />
        <FilterCheckBox
          setHasAC={setHasAC}
          setHasCharger={setHasCharger}
          setHasWifi={setHasWifi}
          setHasTv={setHasTv}
        />
      </>
    );
  }

  return (
    <Card>
      <SortOrFilterTop title="Filter" clear={onClear} />
      <Radio.Group
        value={filter}
        options={options}
        onChange={onChange}
        vertical
      />
      <Divider />
      <FilterCheckBox
        setHasAC={setHasAC}
        setHasCharger={setHasCharger}
        setHasWifi={setHasWifi}
        setHasTv={setHasTv}
      />
    </Card>
  );
}

export default FilterTrip;
