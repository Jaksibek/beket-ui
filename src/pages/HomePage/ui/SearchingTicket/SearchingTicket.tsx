import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DatePicker,
  type DatePickerProps,
  notification,
} from "antd";
import {
  SwapOutlined,
} from "@ant-design/icons";
import styles from "./SearchingTicket.module.scss";
import { useTranslation } from "react-i18next";
import { useAppContext } from "@/shared/lib/hooks/useAppContext";
import { StepEnum } from "@/shared/constants";
import { useNavigate } from "react-router-dom";
import { appRoutes } from "@/shared/config/router";
import { useQuery } from "@tanstack/react-query";
import { homeService } from "../../model/services";
import { queryKeys } from "@/shared/constants/queryKeys";
import { useStepParams } from "@/shared/lib/hooks/useStepParams";
import TicketSelect from "./TicketSelect/TicketSelect";
import { LangEnum } from "@/shared/ui/SwitchLang";

import dayjs from "dayjs";
import "dayjs/locale/ru";
import "dayjs/locale/kk";
import "dayjs/locale/en";

import ruLocale from "antd/es/date-picker/locale/ru_RU";
import kkLocale from "antd/es/date-picker/locale/kk_KZ";
import enLocale from "antd/es/date-picker/locale/en_US";

type ValueTypeState = string | undefined;

function SearchingTicket() {
  const { t, i18n } = useTranslation();
  const [api, contextHolder] = notification.useNotification();

  const { searchParams, setSearchParams } = useAppContext();

  const { from, to, date } = useStepParams();

  const [fromVal, setFromVal] = useState<ValueTypeState>(from);
  const [toVal, setToVal] = useState<ValueTypeState>(to);
  const [dateVal, setDateVal] = useState<ValueTypeState>(date);
  const [cityEnabled, setCityEnabled] = useState(false);

  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.city, i18n.language],
    queryFn: homeService.getCity,
    enabled: cityEnabled,
  });

  const changeCityEnabled = useCallback(() => {
    setCityEnabled(true);
  }, []);

  const onChangeFrom = useCallback((value: ValueTypeState) => {
    setFromVal(value);
  }, []);

  const onChangeTo = useCallback((value: ValueTypeState) => {
    setToVal(value);
  }, []);

  // Cities swapper callback
  const handleSwapCities = useCallback(() => {
    const temp = fromVal;
    setFromVal(toVal);
    setToVal(temp);
  }, [fromVal, toVal]);

  const onChangeDate: DatePickerProps["onChange"] = useCallback(
    (value: dayjs.Dayjs | null) => {
      if (value) {
        setDateVal(dayjs(value).format("YYYY.MM.DD"));
      } else {
        setDateVal(undefined);
      }
    },
    []
  );

  const disabledDate = useCallback((current: dayjs.Dayjs) => {
    if (!current) return false;

    const today = dayjs().startOf("day");
    const twoMonthsLater = dayjs().add(2, "month").endOf("day");

    return current < today || current > twoMonthsLater;
  }, []);

  const onClickSearch = useCallback(() => {
    if (!fromVal || !toVal || !dateVal) {
      api.warning({
        title: t("Заполните все поля") || "Заполните все поля",
      });
      return;
    }

    if (fromVal === toVal) {
      api.warning({
        title: t("Станции отправления и прибытия не могут быть одинаковыми") || "Станции отправления и прибытия не могут быть одинаковыми",
      });
      return;
    }

    const params = new URLSearchParams(searchParams);

    params.set(StepEnum.FROM, fromVal);
    params.set(StepEnum.TO, toVal);
    params.set(StepEnum.DATE, dateVal);
    params.set(StepEnum.STEP, "1");

    setSearchParams(params);

    navigate({
      pathname: appRoutes.search,
      search: params.toString(),
    });
  }, [api, fromVal, navigate, searchParams, toVal, dateVal, t]);

  useEffect(() => {
    dayjs.locale(i18n.language === "kz" ? "kk" : i18n.language);
  }, [i18n]);

  const displayDate = dateVal ? dayjs(dateVal, "YYYY.MM.DD") : null;

  const getAntdLocale = useMemo(() => {
    switch (i18n.language) {
      case LangEnum.RU:
        return ruLocale;
      case LangEnum.KZ:
        return kkLocale;
      default:
        return enLocale;
    }
  }, [i18n]);

  return (
    <>
      {contextHolder}
      <div className={styles.unifiedSearchContainer}>
        <div className={styles.searchBar}>
          {/* FROM block with floating swapper */}
          <div className={`${styles.fieldBlock} ${styles.fromBlock}`}>
            <TicketSelect
              placeholder="Откуда"
              fromVal={fromVal}
              onChange={onChangeFrom}
              changeCityEnabled={changeCityEnabled}
              isLoading={isLoading}
              data={data?.data}
            />
            {/* Swap Button sitting centered on the divider */}
            <button type="button" className={styles.swapButton} onClick={handleSwapCities}>
              <SwapOutlined className={styles.swapIcon} />
            </button>
          </div>

          <div className={styles.divider}></div>

          {/* TO block */}
          <div className={`${styles.fieldBlock} ${styles.toBlock}`}>
            <TicketSelect
              placeholder="Куда"
              fromVal={toVal}
              onChange={onChangeTo}
              changeCityEnabled={changeCityEnabled}
              isLoading={isLoading}
              data={data?.data}
            />
          </div>

          <div className={styles.divider}></div>

          {/* DATE block */}
          <div className={`${styles.fieldBlock} ${styles.dateBlock}`}>
            <DatePicker
              placeholder={t("Когда")}
              format="DD MMMM, ddd"
              value={displayDate}
              onChange={onChangeDate}
              className={styles.datePickerInput}
              disabledDate={disabledDate}
              locale={getAntdLocale}
              inputReadOnly
            />
          </div>

          {/* Integrated Search Button */}
          <button
            type="button"
            className={styles.searchButton}
            onClick={onClickSearch}
            disabled={!fromVal || !toVal || !dateVal}
          >
            {t("Найти")}
          </button>
        </div>
      </div>
    </>
  );
}

export default SearchingTicket;
