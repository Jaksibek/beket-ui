import { DownOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Button, Dropdown } from "antd";
import { useTranslation } from "react-i18next";
import { LangEnum } from "../types";

const items: MenuProps["items"] = [
  {
    label: "Қазақша",
    key: LangEnum.KZ,
  },
  {
    label: "Русский",
    key: LangEnum.RU,
  },
];

function SwitchLang() {
  const { i18n } = useTranslation();

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    i18n.changeLanguage(e.key);
  };

  return (
    <Dropdown
      menu={{
        items,
        selectable: true,
        onClick: handleMenuClick,
        defaultSelectedKeys: [i18n.language],
      }}
      trigger={["click"]}
    >
      <a onClick={(e) => e.preventDefault()}>
        <Button type="primary" icon={<DownOutlined />} iconPlacement="end">
          {i18n.language.toUpperCase()}
        </Button>
      </a>
    </Dropdown>
  );
}

export default SwitchLang;
