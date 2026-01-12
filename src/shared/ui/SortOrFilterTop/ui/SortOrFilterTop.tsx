import { Button, Flex, Typography } from "antd";
import styles from "./SortOrFilterTop.module.scss";
import { CloseOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const { Title } = Typography;

interface IProps {
  title: string;
  clear: () => void;
}

function SortOrFilterTop({ title, clear }: IProps) {
  const { t } = useTranslation();

  return (
    <Flex align="center" justify="space-between" className={styles.flex}>
      <Title style={{ marginBottom: 0 }} level={5}>
        {t(title)}
      </Title>
      <Button icon={<CloseOutlined />} type="text" onClick={clear} />
    </Flex>
  );
}

export default SortOrFilterTop;
