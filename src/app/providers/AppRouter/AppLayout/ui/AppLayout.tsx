import { Layout } from "antd";
import styles from "./AppLayout.module.scss";
import { Outlet, useLocation } from "react-router-dom";
import { Suspense } from "react";
import { AppConfigProvider } from "@/app/providers/AppConfigProvider";
import { HeaderNav } from "@/widgets/HeaderNav";
import { FooterNav } from "@/widgets/FooterNav";
import { LoadingPage } from "@/shared/ui/LoadingPage";

const { Content } = Layout;

function AppLayout() {
  const location = useLocation();
  const isCarrierRoute = location.pathname.startsWith("/carrier");

  return (
    <AppConfigProvider>
      <Layout className={styles.layout}>
        {!isCarrierRoute && <HeaderNav />}
        <Content className={styles.content}>
          <Suspense fallback={<LoadingPage />}>
            <Outlet />
          </Suspense>
        </Content>
        <FooterNav />
      </Layout>
    </AppConfigProvider>
  );
}

export default AppLayout;
