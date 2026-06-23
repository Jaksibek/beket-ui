import type { ReactNode } from "react";
import { ConfigProvider } from "antd";
import { useResponsive } from "@/shared/lib/hooks/useResponsive";

interface IProps {
  children: ReactNode;
}

function AppConfigProvider({ children }: IProps) {
  const { sm } = useResponsive();

  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: "var(--font-roboto)",
          fontSize: sm ? 16 : 14,
          borderRadius: 12,
          colorPrimary: "#0091FF", // Vibrant sky-blue primary color
          colorSuccess: "#0091FF",
          colorLink: "#0091FF",
          colorLinkHover: "#0077e6",
        },
        components: {
          Layout: {
            colorBgLayout: "var(--color-gray-light)",
            headerBg: "var(--color-white)",
            headerHeight: "var(--header-height)",
          },
          Button: {
            controlHeight: 37,
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}

export default AppConfigProvider;
