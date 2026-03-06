import { Flex, Layout } from "antd";
import { Container } from "@/shared/ui/Container";
import { Logo } from "@/shared/ui/Logo";
import { SwitchLang } from "@/shared/ui/SwitchLang";
import { StepsTicket } from "@/shared/ui/StepsTicket";
import { useLocation } from "react-router-dom";
import { appRoutes } from "@/shared/config/router";
import styles from "./HeaderNav.module.scss";
import { useResponsive } from "@/shared/lib/hooks/useResponsive";

const { Header } = Layout;

function HeaderNav() {
  const { pathname } = useLocation();
  const { sm } = useResponsive();

  let currentStep = undefined;
  if (pathname === appRoutes.booking) {
    currentStep = 2;
  }

  return (
    <Header className={styles.header}>
      <Container>
        <Flex flex={1} align="center" justify="space-between" gap={16} wrap="nowrap">
          {/* LEFT: Logo - ensuring it doesn't shrink */}
          <Flex flex="0 0 auto">
            <Logo />
          </Flex>

          {/* CENTER: StepsTicket - taking remaining space but allowing scroll/shrink if needed */}
          {pathname !== appRoutes.home && sm && (
            <Flex flex="1 1 auto" justify="center" style={{ minWidth: 0, paddingInline: '20px' }}>
              <StepsTicket inHeader currentStep={currentStep} />
            </Flex>
          )}

          {/* RIGHT: SwitchLang etc. - ensuring it doesn't shrink */}
          <Flex flex="0 0 auto" align="center" gap={16}>
            <SwitchLang />
          </Flex>
        </Flex>
      </Container>
    </Header>
  );
}

export default HeaderNav;
