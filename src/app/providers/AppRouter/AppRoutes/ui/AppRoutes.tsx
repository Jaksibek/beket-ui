import { Route, Routes, Navigate } from "react-router-dom";
import { AppLayout } from "../../AppLayout";
import { HomePageAsync } from "@/pages/HomePage";
import { AboutPageAsync } from "@/pages/AboutPage";
import { appRoutes } from "@/shared/config/router";
import { SearchPageAsync } from "@/pages/SearchPage";
import { BookingPageAsync } from "@/pages/BookingPage";
import { CarrierLoginPage } from "@/pages/CarrierLoginPage";
import { CarrierDashboardPage } from "@/pages/CarrierDashboardPage";
import { ProtectedRoute } from "@/shared/ui/ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path={appRoutes.home} element={<HomePageAsync />} />
        <Route path={appRoutes.about} element={<AboutPageAsync />} />
        <Route path={appRoutes.search} element={<SearchPageAsync />} />
        <Route path={appRoutes.booking} element={<BookingPageAsync />} />

        {/* Carrier Public */}
        <Route path={appRoutes.carrierLogin} element={<CarrierLoginPage />} />

        {/* Carrier Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/carrier" element={<Navigate to={appRoutes.carrierDashboard} replace />} />
          <Route path={appRoutes.carrierDashboard} element={<CarrierDashboardPage />} />
          <Route path={appRoutes.carrierFleet} element={<CarrierDashboardPage />} />
          <Route path={appRoutes.carrierRoutes} element={<CarrierDashboardPage />} />
          <Route path={appRoutes.carrierTrips} element={<CarrierDashboardPage />} />
          <Route path={appRoutes.carrierSales} element={<CarrierDashboardPage />} />
          <Route path={appRoutes.carrierPassengers} element={<CarrierDashboardPage />} />
          <Route path={appRoutes.carrierEmployees} element={<CarrierDashboardPage />} />
          <Route path={appRoutes.carrierStats} element={<CarrierDashboardPage />} />
          <Route path={appRoutes.carrierHistory} element={<CarrierDashboardPage />} />
          <Route path={appRoutes.carrierBusConfig} element={<CarrierDashboardPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default AppRoutes;
