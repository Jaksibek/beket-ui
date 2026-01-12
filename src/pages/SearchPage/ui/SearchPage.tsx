import { useStepParams } from "@/shared/lib/hooks/useStepParams";
import { EmptyData } from "@/shared/ui/EmptyData";
import { ErrorContent } from "@/shared/ui/ErrorContent";
import { TripItems } from "@/entities/TripItems";
import { LoadingPage } from "@/shared/ui/LoadingPage";
import SearchPageLayout from "./SearchPageLayout/SearchPageLayout";
import { Col, Flex, Row } from "antd";
import styles from "./SearchPage.module.scss";
import { SortTrip, SortTripEnum } from "@/entities/SortTrip";
import { useCallback, useState } from "react";
import { useResponsive } from "@/shared/lib/hooks/useResponsive";
import SortAndDrawer from "./SortAndDrawer/SortAndDrawer";
import { FilterTrip } from "@/entities/FilterTrip";
import type { SeatTypeCodeEnum } from "../model/types";
import FilterAndDrawer from "./FilterAndDrawer/FilterAndDrawer";
import { useGetTrips } from "../model/hooks/useGetTrips";

const GAP_DESKTOP = 15;
const GAP_MOBILE = 5;

function SearchPage() {
  const [sort, setSort] = useState<SortTripEnum | "">("");
  const [filter, setFilter] = useState<SeatTypeCodeEnum | "">("");
  const [openDrawer, setOpenDrawer] = useState(false);
  const [filterDrawer, setFilterDrawer] = useState(false);

  const [hasAC, setHasAC] = useState<boolean>(false);
  const [hasCharger, setHasCharger] = useState<boolean>(false);
  const [hasWifi, setHasWifi] = useState<boolean>(false);
  const [hasTv, setHasTv] = useState<boolean>(false);

  const { from, to, date } = useStepParams();
  const { sm } = useResponsive();

  const showDrawer = useCallback(() => {
    setOpenDrawer(true);
  }, []);

  const showFilterDrawer = useCallback(() => {
    setFilterDrawer(true);
  }, []);

  const onCloseDrawer = useCallback(() => {
    setOpenDrawer(false);
  }, []);

  const onCloseFilterDrawer = useCallback(() => {
    setFilterDrawer(false);
  }, []);

  const { data, isLoading, isError, error } = useGetTrips({ from, to, date });

  if (isLoading) {
    return <LoadingPage />;
  }

  if (isError && error) {
    return (
      <SearchPageLayout>
        <ErrorContent title="error" />
      </SearchPageLayout>
    );
  }

  if (!data?.data.length) {
    return (
      <SearchPageLayout>
        <EmptyData />
      </SearchPageLayout>
    );
  }

  return (
    <SearchPageLayout>
      <Row className={styles.rowWrapper} gutter={[GAP_DESKTOP, GAP_DESKTOP]}>
        {/* For Desktop */}
        {sm && (
          <Col span={7}>
            <Flex vertical gap={10}>
              <FilterTrip
                filter={filter}
                setFilter={setFilter}
                setHasAC={setHasAC}
                setHasCharger={setHasCharger}
                setHasWifi={setHasWifi}
                setHasTv={setHasTv}
              />
              <SortTrip sort={sort} setSort={setSort} />
            </Flex>
          </Col>
        )}

        {/* For Mobile */}
        {!sm && (
          <Col span={24}>
            <Flex gap={GAP_MOBILE}>
              <FilterAndDrawer
                filter={filter}
                setFilter={setFilter}
                showDrawer={showFilterDrawer}
                openDrawer={filterDrawer}
                onCloseDrawer={onCloseFilterDrawer}
               
                setHasAC={setHasAC}
                setHasCharger={setHasCharger}
                setHasWifi={setHasWifi}
                setHasTv={setHasTv}
              />
              <SortAndDrawer
                showDrawer={showDrawer}
                onCloseDrawer={onCloseDrawer}
                openDrawer={openDrawer}
                sort={sort}
                setSort={setSort}
              />
            </Flex>
          </Col>
        )}

        <Col span={sm ? 17 : 24}>
          <TripItems
            data={data.data}
            sort={sort}
            filter={filter}
            hasAC={hasAC}
            hasCharger={hasCharger}
            hasWifi={hasWifi}
            hasTv={hasTv}
          />
        </Col>
      </Row>
    </SearchPageLayout>
  );
}

export default SearchPage;
