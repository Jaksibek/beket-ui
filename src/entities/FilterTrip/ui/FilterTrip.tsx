import { Card, Radio, type RadioChangeEvent } from "antd";
import type { SeatTypeCodeEnum } from "@/pages/SearchPage";
import { useCallback, type Dispatch, type SetStateAction } from "react";
import { SortOrFilterTop } from "@/shared/ui/SortOrFilterTop";
import { useGetOptions } from "../model/hooks/useGetOptions";

interface IProps {
  filter: "" | SeatTypeCodeEnum;
  setFilter: Dispatch<SetStateAction<"" | SeatTypeCodeEnum>>;
  isMobile?: boolean;
  onCloseDrawer?: () => void;
}

function FilterTrip({ filter, setFilter, isMobile, onCloseDrawer }: IProps) {
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
      <Radio.Group
        value={filter}
        options={options}
        onChange={onChange}
        vertical
      />
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
    </Card>
  );
}

export default FilterTrip;
