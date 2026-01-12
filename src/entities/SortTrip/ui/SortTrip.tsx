import { Card, Radio, type RadioChangeEvent } from "antd";
import { useCallback, type Dispatch, type SetStateAction } from "react";
import { SortTripEnum } from "../model/types";
import { SortOrFilterTop } from "@/shared/ui/SortOrFilterTop";
import { useGetOptions } from "../model/hooks/useGetOptions";

interface IProps {
  sort: string;
  setSort: Dispatch<SetStateAction<"" | SortTripEnum>>;
  isMobile?: boolean;
  onCloseDrawer?: () => void;
}

function SortTrip({ sort, setSort, isMobile, onCloseDrawer }: IProps) {
  const options = useGetOptions();

  const onChange = ({ target: { value } }: RadioChangeEvent) => {
    setSort(value);

    if (isMobile && onCloseDrawer) {
      onCloseDrawer();
    }
  };

  const onClear = useCallback(() => {
    setSort("");
  }, [setSort]);

  if (isMobile) {
    return (
      <Radio.Group
        value={sort}
        options={options}
        onChange={onChange}
        vertical
      />
    );
  }

  return (
    <Card>
      <SortOrFilterTop title="Sort" clear={onClear} />
      <Radio.Group
        value={sort}
        options={options}
        onChange={onChange}
        vertical
      />
    </Card>
  );
}

export default SortTrip;
