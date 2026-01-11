import { StepEnum } from "@/shared/constants";
import { useAppContext } from "@/shared/lib/hooks/useAppContext";
import { Card, Flex, Steps } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

interface IProps {
  inHeader?: boolean;
}

function StepsTicket({ inHeader }: IProps) {
  const { searchParams } = useAppContext();
  const current = Number(searchParams.get(StepEnum.STEP));

  const { t } = useTranslation();

  const items = useMemo(
    () => [
      {
        title: t("Select stations"),
      },
      {
        title: t("Select bus"),
      },
      {
        title: t("Booking"),
      },
      {
        title: t("Payment"),
      },
    ],
    [t]
  );

  if (inHeader) {
    return <Steps current={current} items={items} />;
  }

  return (
    <Card>
      <Flex>
        <div style={{ flex: 1 }}>
          <Steps current={current} items={items} />
        </div>
      </Flex>
    </Card>
  );
}

export default StepsTicket;
