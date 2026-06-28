import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Tag,
  Flex,
  Row,
  Col,
  Switch,
  InputNumber
} from "antd";
import {
  DashboardOutlined,
  CarOutlined,
  CompassOutlined,
  CalendarOutlined,
  LogoutOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  BarChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from "@ant-design/icons";
import { authApi } from "@/shared/api";
import { appRoutes } from "@/shared/config/router";
import dayjs from "dayjs";
import styles from "./CarrierDashboardPage.module.scss";

// Modular Sections
import { OverviewSection } from "../components/OverviewSection";
import { FleetSection } from "../components/FleetSection";
import { RoutesSection } from "../components/RoutesSection";
import { TripsSection } from "../components/TripsSection";
import { EmployeesSection } from "../components/EmployeesSection";
import { SalesSection } from "../components/SalesSection";
import { SeatManagementModal } from "../components/SeatManagementModal";
import { SalesStatsSection } from "../components/SalesStatsSection";



function CarrierDashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation tabs sync with URL
  const activeKey = location.pathname.includes("/fleet")
    ? "fleet"
    : location.pathname.includes("/routes")
      ? "routes"
      : location.pathname.includes("/trips")
        ? "trips"
        : location.pathname.includes("/sales")
          ? "sales"
          : location.pathname.includes("/employees")
            ? "employees"
            : location.pathname.includes("/stats")
              ? "stats"
              : "overview";

  const handleMenuClick = (key: string) => {
    if (key === "overview") navigate(appRoutes.carrierDashboard);
    else if (key === "fleet") navigate(appRoutes.carrierFleet);
    else if (key === "routes") navigate(appRoutes.carrierRoutes);
    else if (key === "trips") navigate(appRoutes.carrierTrips);
    else if (key === "sales") navigate(appRoutes.carrierSales);
    else if (key === "employees") navigate(appRoutes.carrierEmployees);
    else if (key === "stats") navigate(appRoutes.carrierStats);
  };

  // React active profile state, pre-filled from local storage but updated dynamically from API
  const [profile, setProfile] = useState<{
    carrierId: string | null;
    carrierName: string | null;
    email: string | null;
    fullName: string | null;
    roles: string[];
    phoneNumber: string | null;
    contactId: string | null;
  }>({
    carrierId: localStorage.getItem("carrier_id"),
    carrierName: localStorage.getItem("carrier_name"),
    email: localStorage.getItem("carrier_email"),
    fullName: localStorage.getItem("carrier_fullname"),
    roles: JSON.parse(localStorage.getItem("carrier_roles") || "[]"),
    phoneNumber: localStorage.getItem("carrier_phone"),
    contactId: localStorage.getItem("carrier_contact_id"),
  });

  const isCashier = (profile.roles.includes("Cashier") || profile.roles.includes("Agent")) && !profile.roles.includes("Admin");

  const handleLogout = () => {
    localStorage.removeItem("carrier_token");
    localStorage.removeItem("carrier_name");
    localStorage.removeItem("carrier_id");
    localStorage.removeItem("carrier_email");
    localStorage.removeItem("carrier_fullname");
    localStorage.removeItem("carrier_roles");
    localStorage.removeItem("carrier_phone");
    message.success("Вы вышли из системы");
    navigate(appRoutes.carrierLogin);
  };

  const handleRequestError = (err: any) => {
    if (err.response?.status === 401) {
      message.error("Сессия истекла или недействительна. Пожалуйста, войдите снова.");
      handleLogout();
    }
  };

  // Main State
  const [buses, setBuses] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Employees state
  const [employees, setEmployees] = useState<any[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [employeeForm] = Form.useForm();
  const [employeeSubmitting, setEmployeeSubmitting] = useState(false);

  // Active sales trip state (for cashier dedicated page flow)
  const [activeSalesTrip, setActiveSalesTrip] = useState<any>(null);

  // Catalogs
  const [brands, setBrands] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);

  // Modals state
  const [isBusModalOpen, setIsBusModalOpen] = useState(false);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);

  // Editing state
  const [editingBus, setEditingBus] = useState<any | null>(null);
  const [editingRoute, setEditingRoute] = useState<any | null>(null);
  const [editingTrip, setEditingTrip] = useState<any | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);

  // Forms references
  const [busForm] = Form.useForm();
  const [routeForm] = Form.useForm();
  const [tripForm] = Form.useForm();

  // Passenger lists & edits state
  const [activeSalesTab, setActiveSalesTab] = useState<string>("scheme");
  const [isPassengerEditModalOpen, setIsPassengerEditModalOpen] = useState(false);
  const [editingPassenger, setEditingPassenger] = useState<any | null>(null);
  const [passengerEditForm] = Form.useForm();

  // Selected brand's models dynamic listing in form
  const [selectedBrandModels, setSelectedBrandModels] = useState<any[]>([]);

  // Seat management modal
  const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [seatsData, setSeatsData] = useState<any[]>([]);
  const [seatsLoading, setSeatsLoading] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);

  // Price overrides state
  const [individualPrice, setIndividualPrice] = useState<number | null>(null);
  const [priceSubmitting, setPriceSubmitting] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Manual booking state
  const [passengerForm] = Form.useForm();
  const [manualBookingLoading, setManualBookingLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const localRoles: string[] = JSON.parse(localStorage.getItem("carrier_roles") || "[]");
  const isAdmin = localRoles.some((r: string) => r.toLowerCase() === "admin") || profile?.roles?.some((r: string) => r.toLowerCase() === "admin");
  const isCarrierRoleOnly = localRoles.includes("Carrier") && !localRoles.includes("Admin");

  // Fetching data
  const fetchBuses = async (searchParams?: { search?: string; carrierName?: string; city?: string }) => {
    try {
      const params = new URLSearchParams();
      if (searchParams?.search) params.append("search", searchParams.search);
      if (searchParams?.carrierName) params.append("carrierName", searchParams.carrierName);
      if (searchParams?.city) params.append("city", searchParams.city);

      const res = await authApi.get(`/api/v1/carrier/buses?${params.toString()}`);
      setBuses(res.data);
    } catch (e) {
      console.error(e);
      handleRequestError(e);
    }
  };
  const fetchRoutes = async (searchParams?: { search?: string; carrierName?: string }) => {
    try {
      const params = new URLSearchParams();
      if (searchParams?.search) params.append("search", searchParams.search);
      if (searchParams?.carrierName) params.append("carrierName", searchParams.carrierName);

      const res = await authApi.get(`/api/v1/carrier/routes?${params.toString()}`);
      setRoutes(res.data);
    } catch (e) {
      console.error(e);
      handleRequestError(e);
    }
  };

  const fetchTrips = async (searchParams?: { search?: string; carrierName?: string }) => {
    try {
      const params = new URLSearchParams();
      if (searchParams?.search) params.append("search", searchParams.search);
      if (searchParams?.carrierName) params.append("carrierName", searchParams.carrierName);

      const res = await authApi.get(`/api/v1/carrier/trips?${params.toString()}`);
      setTrips(res.data);
    } catch (e) {
      console.error(e);
      handleRequestError(e);
    }
  };

  const fetchCatalogs = async () => {
    setLoading(true);
    try {
      const [brandsRes, colorsRes, stationsRes] = await Promise.all([
        authApi.get("/api/v1/carrier/buses/brands"),
        authApi.get("/api/v1/carrier/buses/colors"),
        authApi.get("/api/v1/carrier/routes/stations")
      ]);
      setBrands(brandsRes.data);
      setColors(colorsRes.data);
      setStations(stationsRes.data);
    } catch (e) {
      console.error("Error loading catalogs:", e);
      message.error("Не удалось загрузить справочники");
      handleRequestError(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    setEmployeesLoading(true);
    try {
      const res = await authApi.get("/api/v1/carrier/employees");
      setEmployees(res.data);
    } catch (e) {
      console.error(e);
      handleRequestError(e);
    } finally {
      setEmployeesLoading(false);
    }
  };

  const [carrierCompanies, setCarrierCompanies] = useState<any[]>([]);

  const fetchCarrierCompanies = async () => {
    try {
      const res = await authApi.get("/api/v1/carrier/employees/carriers");
      setCarrierCompanies(res.data || []);
    } catch (e) {
      console.error("Error loading carrier companies:", e);
    }
  };

  const openAddEmployeeModal = () => {
    employeeForm.resetFields();
    employeeForm.setFieldValue("carrierId", profile.carrierId);
    setEditingEmployee(null);
    setIsEmployeeModalOpen(true);
  };

  const startEditEmployee = (emp: any) => {
    setEditingEmployee(emp);
    employeeForm.setFieldsValue({
      phoneNumber: emp.phoneNumber,
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      role: emp.roles?.[0] || "Agent",
      carrierId: emp.carrierId || null,
      password: "" // Blank by default
    });
    setIsEmployeeModalOpen(true);
  };

  const handleSaveEmployee = async (values: any) => {
    setEmployeeSubmitting(true);
    try {
      const payload = {
        phoneNumber: values.phoneNumber,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        role: values.role || "Agent",
        carrierId: values.carrierId || null,
        password: values.password || null
      };

      if (editingEmployee) {
        await authApi.put(`/api/v1/carrier/employees/${editingEmployee.id}`, payload);
        message.success("Данные сотрудника успешно обновлены!");
      } else {
        await authApi.post("/api/v1/carrier/employees", payload);
        message.success("Сотрудник успешно добавлен!");
      }
      setIsEmployeeModalOpen(false);
      setEditingEmployee(null);
      employeeForm.resetFields();
      fetchEmployees();
    } catch (err: any) {
      console.error(err);
      let errorMsg = "Ошибка при сохранении сотрудника";
      if (err.response?.data) {
        if (typeof err.response.data === "string") {
          errorMsg = err.response.data;
        } else if (Array.isArray(err.response.data)) {
          errorMsg = err.response.data.map((e: any) => e.description || e.Description).join(", ");
        } else if (err.response.data.errors) {
          errorMsg = Object.values(err.response.data.errors).flat().join(", ");
        } else if (err.response.data.message) {
          errorMsg = err.response.data.message;
        }
      }
      message.error(errorMsg);
    } finally {
      setEmployeeSubmitting(false);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!window.confirm("Вы уверены, что хотите удалить этого агента?")) return;
    try {
      await authApi.delete(`/api/v1/carrier/employees/${id}`);
      message.success("Агент успешно удален!");
      fetchEmployees();
    } catch (err: any) {
      console.error(err);
      message.error(err.response?.data || "Ошибка при удалении агента");
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await authApi.get("/api/Auth/me");
      if (res.data) {
        const { carrierId, carrierName, email, fullName, roles, phoneNumber, contactId } = res.data;

        const cachedCarrierId = localStorage.getItem("carrier_id");

        localStorage.setItem("carrier_id", carrierId || "");
        localStorage.setItem("carrier_name", carrierName || "");
        localStorage.setItem("carrier_email", email || "");
        localStorage.setItem("carrier_fullname", fullName || "");
        localStorage.setItem("carrier_roles", JSON.stringify(roles || []));
        localStorage.setItem("carrier_phone", phoneNumber || "");
        localStorage.setItem("carrier_contact_id", contactId || "");

        setProfile({
          carrierId,
          carrierName,
          email,
          fullName,
          roles: roles || [],
          phoneNumber: phoneNumber || null,
          contactId: contactId || null
        });

        // If user was not linked in cache, but is now linked in database,
        // their JWT token lacks the CarrierId claim. Force re-login to update JWT claims.
        if (carrierId && !cachedCarrierId) {
          message.warning("Ваш аккаунт привязан к автопарку. Пожалуйста, войдите снова для обновления сессии.");
          handleLogout();
        }
      }
    } catch (e) {
      console.error("Error loading profile:", e);
      handleRequestError(e);
    }
  };

  useEffect(() => {
    // Check auth token
    const token = localStorage.getItem("carrier_token");
    if (!token) {
      navigate(appRoutes.carrierLogin);
      return;
    }

    if (location.pathname.includes("/passengers")) {
      navigate(appRoutes.carrierSales);
      return;
    }

    // Role-based routing restriction
    const roles: string[] = JSON.parse(localStorage.getItem("carrier_roles") || "[]");
    const userIsCashier = roles.includes("Cashier") && !roles.includes("Admin");
    if (userIsCashier && !location.pathname.includes("/sales") && !location.pathname.includes("/stats")) {
      navigate(appRoutes.carrierSales);
      return;
    }

    fetchProfile();
    fetchCatalogs();
    
    fetchBuses();
    fetchRoutes();
    fetchTrips();
    if (!userIsCashier) {
      fetchEmployees();
      fetchCarrierCompanies();
    }
  }, [navigate, location.pathname]);

  // Operations
  const startEditBus = (bus: any) => {
    setEditingBus(bus);
    const selectedBrand = brands.find(b => b.id === bus.brandId);
    setSelectedBrandModels(selectedBrand?.models || []);
    busForm.setFieldsValue({
      plateNumber: bus.plateNumber,
      brandId: bus.brandId,
      modelId: bus.modelId,
      colorId: bus.colorId,
      hasAC: bus.hasAC,
      hasWifi: bus.hasWifi,
      hasCharger: bus.hasCharger,
      hasTv: bus.hasTv,
      carrierId: bus.carrierId
    });
    setIsBusModalOpen(true);
  };

  const handleSaveBus = async (values: any) => {
    try {
      const payload = {
        plateNumber: values.plateNumber,
        brandId: values.brandId,
        modelId: values.modelId,
        colorId: values.colorId,
        hasAC: values.hasAC || false,
        hasCharger: values.hasCharger || false,
        hasWifi: values.hasWifi || false,
        hasTv: values.hasTv || false,
        carrierId: values.carrierId
      };

      if (editingBus) {
        await authApi.put(`/api/v1/carrier/buses/${editingBus.id}`, payload);
        message.success("Автобус успешно обновлен");
      } else {
        await authApi.post("/api/v1/carrier/buses", payload);
        message.success("Автобус успешно добавлен");
      }
      setIsBusModalOpen(false);
      setEditingBus(null);
      busForm.resetFields();
      fetchBuses();
    } catch (err: any) {
      console.error(err);
      message.error(editingBus ? "Ошибка при обновлении автобуса" : "Ошибка при добавлении автобуса");
    }
  };

  const handleDeleteBus = async (id: string) => {
    if (!window.confirm("Удалить этот автобус?")) return;
    try {
      await authApi.delete(`/api/v1/carrier/buses/${id}`);
      message.success("Автобус удален");
      fetchBuses();
    } catch (err: any) {
      console.error(err);
      message.error(err.response?.data?.title || err.response?.data || "Ошибка удаления");
    }
  };

  const startEditRoute = (route: any) => {
    setEditingRoute(route);
    routeForm.setFieldsValue({
      fromStationId: route.fromStationId,
      toStationId: route.toStationId,
      distanceKm: route.distanceKm,
      carrierId: route.carrierId
    });
    setIsRouteModalOpen(true);
  };

  const handleSaveRoute = async (values: any) => {
    try {
      const payload = {
        fromStationId: values.fromStationId,
        toStationId: values.toStationId,
        distanceKm: values.distanceKm,
        carrierId: values.carrierId
      };

      if (editingRoute) {
        await authApi.put(`/api/v1/carrier/routes/${editingRoute.id}`, payload);
        message.success("Маршрут успешно обновлен");
      } else {
        await authApi.post("/api/v1/carrier/routes", payload);
        message.success("Маршрут успешно добавлен");
      }
      setIsRouteModalOpen(false);
      setEditingRoute(null);
      routeForm.resetFields();
      fetchRoutes();
    } catch (err: any) {
      console.error(err);
      message.error(editingRoute ? "Ошибка при обновлении маршрута" : "Ошибка при добавлении маршрута");
    }
  };

  const handleDeleteRoute = async (id: string) => {
    if (!window.confirm("Удалить этот маршрут?")) return;
    try {
      await authApi.delete(`/api/v1/carrier/routes/${id}`);
      message.success("Маршрут удален");
      fetchRoutes();
    } catch (err: any) {
      console.error(err);
      message.error(err.response?.data?.title || err.response?.data || "Ошибка удаления");
    }
  };

  const startEditTrip = (trip: any) => {
    setEditingTrip(trip);
    tripForm.setFieldsValue({
      routeId: trip.routeId,
      busId: trip.busId,
      time: [dayjs(trip.departureTime), dayjs(trip.arrivalTime)],
      price: trip.price,
      carrierId: trip.carrierId
    });
    setIsTripModalOpen(true);
  };

  const handleSaveTrip = async (values: any) => {
    try {
      const departureTime = values.time[0].toISOString();
      const arrivalTime = values.time[1].toISOString();

      const payload = {
        routeId: values.routeId,
        busId: values.busId,
        departureTime,
        arrivalTime,
        price: values.price,
        carrierId: values.carrierId
      };

      if (editingTrip) {
        await authApi.put(`/api/v1/carrier/trips/${editingTrip.id}`, payload);
        message.success("Рейс успешно обновлен");
      } else {
        await authApi.post("/api/v1/carrier/trips", payload);
        message.success("Рейс успешно добавлен в расписание");
      }
      setIsTripModalOpen(false);
      setEditingTrip(null);
      tripForm.resetFields();
      fetchTrips();
    } catch (err: any) {
      console.error(err);
      message.error(editingTrip ? (err.response?.data || "Ошибка при обновлении рейса") : "Ошибка при добавлении рейса");
    }
  };

  const handleDeleteTrip = async (id: string) => {
    if (!window.confirm("Отменить и удалить этот рейс?")) return;
    try {
      await authApi.delete(`/api/v1/carrier/trips/${id}`);
      message.success("Рейс отменен");
      fetchTrips();
    } catch (err: any) {
      console.error(err);
      message.error(err.response?.data || "Ошибка при отмене рейса");
    }
  };

  const handleToggleTripStatus = async (tripId: string) => {
    try {
      await authApi.post(`/api/v1/carrier/trips/${tripId}/toggle-status`);
      message.success("Статус рейса успешно изменен!");
      fetchTrips();
    } catch (e) {
      console.error(e);
      message.error("Ошибка при изменении статуса рейса");
    }
  };

  const handleToggleEmployeeActive = async (employeeId: string) => {
    try {
      await authApi.post(`/api/v1/carrier/employees/${employeeId}/toggle-active`);
      message.success("Статус агента успешно изменен!");
      fetchEmployees();
    } catch (e) {
      console.error(e);
      message.error("Ошибка при изменении статуса агента");
    }
  };

  // Seat map handlers
  const fetchTripSeats = async (tripId: string) => {
    setSeatsLoading(true);
    try {
      const res = await authApi.get(`/api/v1/carrier/trips/${tripId}/seats`);
      setSeatsData(res.data);
    } catch (e) {
      console.error(e);
      message.error("Не удалось загрузить схему мест рейса");
    } finally {
      setSeatsLoading(false);
    }
  };

  const openSeatManagement = (trip: any) => {
    setSelectedTrip(trip);
    setSelectedSeats([]);
    setIndividualPrice(null);
    setIsSeatModalOpen(true);
    fetchTripSeats(trip.id);
  };

  const handleSeatClick = (seatNum: number) => {
    const seatInfo = seatsData.find(s => s.seatNumber === String(seatNum));
    const isBookedOrReserved = seatInfo && (seatInfo.status === "Booked" || seatInfo.status === "Reserved");

    if (isSeatModalOpen && isBookedOrReserved) {
      message.warning("Нельзя изменить цену на проданное или зарезервированное место.");
      return;
    }

    setSelectedSeats(prev => {
      if (isBookedOrReserved) {
        // Booked or reserved seats can only be selected individually to inspect passenger details
        setIndividualPrice(null);
        return [seatNum];
      }

      // Free seats logic: filter out any booked/reserved seats from the selection
      const freePrev = prev.filter(num => {
        const info = seatsData.find(s => s.seatNumber === String(num));
        return !info || (info.status !== "Booked" && info.status !== "Reserved");
      });

      let next: number[];
      if (freePrev.includes(seatNum)) {
        next = freePrev.filter(x => x !== seatNum);
      } else {
        next = [...freePrev, seatNum];
      }

      if (next.length >= 1) {
        const firstSeat = seatsData.find(s => s.seatNumber === String(next[0]));
        setIndividualPrice(firstSeat?.price || null);
      } else {
        setIndividualPrice(null);
      }
      return next;
    });
  };

  const handleUpdatePrices = async () => {
    if (selectedSeats.length === 0 || individualPrice === null) return;
    setPriceSubmitting(true);
    try {
      await authApi.put(`/api/v1/carrier/trips/${selectedTrip.id}/seats/prices`, {
        seatPrices: selectedSeats.map(num => ({
          seatNumber: String(num),
          price: individualPrice
        }))
      });
      message.success("Цены успешно обновлены");
      fetchTripSeats(selectedTrip.id);
    } catch (e) {
      console.error(e);
      message.error("Ошибка обновления цен");
    } finally {
      setPriceSubmitting(false);
    }
  };

  const handleManualBooking = async (values: any) => {
    const tripId = selectedTrip?.id || activeSalesTrip?.id;
    if (!tripId || selectedSeats.length === 0) return;
    setManualBookingLoading(true);
    try {
      await authApi.post(`/api/v1/carrier/trips/${tripId}/sell-manual`, {
        seatNumbers: selectedSeats.map(String),
        passengerFirstName: values.firstName,
        passengerLastName: values.lastName,
        passengerMiddleName: values.middleName,
        documentType: values.documentType,
        documentNumber: values.documentNumber,
        iin: values.iin,
        passengerPhoneNumber: values.phoneNumber
      });
      message.success("Билеты успешно проданы вручную!");
      passengerForm.resetFields();
      setSelectedSeats([]);
      fetchTripSeats(tripId);
      fetchTrips();
    } catch (err: any) {
      console.error(err);
      message.error(err.response?.data || "Ошибка при ручной продаже билетов");
    } finally {
      setManualBookingLoading(false);
    }
  };

  const handleCancelManualBooking = (seatNumber: string) => {
    Modal.confirm({
      title: "Подтверждение отмены",
      content: `Вы действительно хотите отменить продажу билета на место ${seatNumber}?`,
      okText: "Да, отменить",
      okType: "danger",
      cancelText: "Отмена",
      onOk: async () => {
        const tripId = selectedTrip?.id || activeSalesTrip?.id;
        if (!tripId) return;
        setCancelLoading(true);
        try {
          await authApi.post(`/api/v1/carrier/trips/${tripId}/seats/${seatNumber}/cancel-manual`);
          message.success("Продажа билета успешно отменена!");
          setSelectedSeats([]);
          fetchTripSeats(tripId);
          fetchTrips();
        } catch (err: any) {
          console.error(err);
          message.error(err.response?.data || "Ошибка при отмене продажи билета");
        } finally {
          setCancelLoading(false);
        }
      }
    });
  };

  const startEditPassengerDetails = (seatNumber: string, passenger: any) => {
    setEditingPassenger({ seatNumber, passenger });
    passengerEditForm.setFieldsValue({
      firstName: passenger.firstName,
      lastName: passenger.lastName,
      middleName: passenger.middleName,
      documentType: passenger.documentType || "passport",
      documentNumber: passenger.documentNumber,
      iin: passenger.iin,
      phoneNumber: passenger.buyerPhone || ""
    });
    setIsPassengerEditModalOpen(true);
  };

  const handleSavePassengerDetails = async (values: any) => {
    const tripId = selectedTrip?.id || activeSalesTrip?.id;
    if (!tripId || !editingPassenger) return;
    try {
      await authApi.put(`/api/v1/carrier/trips/${tripId}/seats/${editingPassenger.seatNumber}/passenger`, {
        firstName: values.firstName,
        lastName: values.lastName,
        middleName: values.middleName,
        documentType: values.documentType,
        documentNumber: values.documentNumber,
        iin: values.iin,
        phoneNumber: values.phoneNumber
      });
      message.success("Данные пассажира успешно обновлены!");
      setIsPassengerEditModalOpen(false);
      setEditingPassenger(null);
      fetchTripSeats(tripId);
      fetchTrips();
    } catch (err: any) {
      console.error(err);
      message.error(err.response?.data || "Ошибка при обновлении данных пассажира");
    }
  };



  const openSalesBooking = (trip: any) => {
    setActiveSalesTrip(trip);
    setSelectedSeats([]);
    setIndividualPrice(null);
    setActiveSalesTab("scheme");
    fetchTripSeats(trip.id);
  };

  const openSalesPassengers = (trip: any) => {
    setActiveSalesTrip(trip);
    setSelectedSeats([]);
    setIndividualPrice(null);
    setActiveSalesTab("passengers");
    fetchTripSeats(trip.id);
  };



  // Build Model list selector helper
  const handleBrandChange = (brandId: string) => {
    busForm.setFieldValue("modelId", undefined);
    const selectedBrand = brands.find(b => b.id === brandId);
    setSelectedBrandModels(selectedBrand?.models || []);
  };

  const getActiveTabTitle = () => {
    switch (activeKey) {
      case "fleet": return "Автопарк";
      case "routes": return "Маршруты и Направления";
      case "trips": return "Расписание и Рейсы";
      case "sales": return "Продажа билетов";
      case "employees": return "Сотрудники";
      case "stats": return "Статистика продаж";
      default: return "Главная";
    }
  };

  return (
    <div className={styles.dashboardLayout}>
      {/* Sidebar navigation */}
      <div className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
        <div className={styles.brandHeader}>
          {!collapsed ? (
            <div style={{ flex: 1, textAlign: "left" }}>
              <h2 className={styles.logoText}>BEKET</h2>
              <div className={styles.logoSubtitle}>Carrier Panel</div>
            </div>
          ) : (
            <div style={{ flex: 1, textAlign: "center" }}>
              <h2 className={styles.logoText} style={{ fontSize: 24, margin: 0 }}>B</h2>
            </div>
          )}
          <span 
            className={styles.collapseToggle} 
            onClick={() => setCollapsed(!collapsed)}
            style={{ cursor: "pointer", fontSize: 18, color: "rgba(255, 255, 255, 0.65)", display: "flex", alignItems: "center" }}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </span>
        </div>

        <div className={styles.menuList}>
          {!isCashier && (
            <>
              <div
                className={`${styles.menuItem} ${activeKey === "overview" ? styles.active : ""}`}
                onClick={() => handleMenuClick("overview")}
                title={collapsed ? "Главная" : undefined}
              >
                <DashboardOutlined />
                <span>Главная</span>
              </div>

              <div
                className={`${styles.menuItem} ${activeKey === "fleet" ? styles.active : ""}`}
                onClick={() => handleMenuClick("fleet")}
                title={collapsed ? "Автопарк" : undefined}
              >
                <CarOutlined />
                <span>Автопарк</span>
              </div>

              <div
                className={`${styles.menuItem} ${activeKey === "routes" ? styles.active : ""}`}
                onClick={() => handleMenuClick("routes")}
                title={collapsed ? "Направления" : undefined}
              >
                <CompassOutlined />
                <span>Направления</span>
              </div>

              <div
                className={`${styles.menuItem} ${activeKey === "trips" ? styles.active : ""}`}
                onClick={() => handleMenuClick("trips")}
                title={collapsed ? "Расписание рейсов" : undefined}
              >
                <CalendarOutlined />
                <span>Расписание рейсов</span>
              </div>

              <div
                className={`${styles.menuItem} ${activeKey === "employees" ? styles.active : ""}`}
                onClick={() => handleMenuClick("employees")}
                title={collapsed ? "Сотрудники" : undefined}
              >
                <TeamOutlined />
                <span>Сотрудники</span>
              </div>
            </>
          )}

          {/* Sales / Cashier tab */}
          <div
            className={`${styles.menuItem} ${activeKey === "sales" ? styles.active : ""}`}
            onClick={() => handleMenuClick("sales")}
            title={collapsed ? "Продажа билетов" : undefined}
          >
            <ShoppingCartOutlined />
            <span>Продажа билетов</span>
          </div>

          {/* Stats tab */}
          <div
            className={`${styles.menuItem} ${activeKey === "stats" ? styles.active : ""}`}
            onClick={() => handleMenuClick("stats")}
            title={collapsed ? "Статистика продаж" : undefined}
          >
            <BarChartOutlined />
            <span>Статистика продаж</span>
          </div>

          <div 
            className={styles.logoutBtn} 
            onClick={handleLogout}
            title={collapsed ? "Выйти" : undefined}
          >
            <LogoutOutlined />
            <span>Выйти</span>
          </div>
        </div>
      </div>

      {/* Workspace content window */}
      <div className={styles.contentWrapper}>
        <div className={styles.header}>
          <h1 className={styles.headerTitle}>{getActiveTabTitle()}</h1>
          <Flex align="center" gap={12}>
            <div className={styles.carrierInfo}>
              <UserOutlined style={{ marginRight: 6 }} />
              <span>
                {profile.carrierName ? (
                  <>Автопарк: <strong>{profile.carrierName}</strong></>
                ) : isAdmin ? (
                  <strong>Администратор платформы</strong>
                ) : (
                  <span style={{ color: "#ef4444", fontWeight: "bold" }}>Внимание: Автопарк не привязан!</span>
                )}
              </span>
            </div>

            {profile.phoneNumber && (
              <Tag color="blue" style={{ fontSize: 13, padding: "4px 12px", borderRadius: 16 }}>
                Логин: <strong>{profile.phoneNumber}</strong> | Роль: <strong>{profile.roles.includes("Admin") ? "Администратор" : (profile.roles.includes("Cashier") || profile.roles.includes("Agent")) ? "Агент" : profile.roles.includes("Carrier") ? "Перевозчик" : profile.roles.join(", ") || "Пользователь"}</strong>
              </Tag>
            )}
          </Flex>
        </div>

        {!profile.carrierId && !isAdmin && (
          <div style={{ padding: "0 24px", marginBottom: 16 }}>
            <div style={{
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid #ef4444",
              borderRadius: 8,
              padding: "12px 16px",
              color: "#f87171"
            }}>
              <strong>Внимание!</strong> Ваша учетная запись администратора не связана ни с одним автопарком в системе.
              Вы не можете добавлять автобусы, маршруты или планировать рейсы. Обратитесь к администратору платформы для привязки.
            </div>
          </div>
        )}

        {activeKey === "overview" && (
          <OverviewSection
            busesCount={buses.length}
            routesCount={routes.length}
            tripsCount={trips.length}
            profile={profile}
            onNavigateTab={handleMenuClick}
          />
        )}
        {activeKey === "fleet" && (
          <FleetSection
            buses={buses}
            loading={loading}
            profileCarrierId={profile.carrierId}
            isAdmin={isAdmin}
            onStartEdit={startEditBus}
            onDelete={handleDeleteBus}
            onOpenAddModal={() => setIsBusModalOpen(true)}
            onSearch={fetchBuses}
          />
        )}
        {activeKey === "routes" && (
          <RoutesSection
            routes={routes}
            loading={loading}
            profileCarrierId={profile.carrierId}
            isAdmin={isAdmin}
            onStartEdit={startEditRoute}
            onDelete={handleDeleteRoute}
            onOpenAddModal={() => setIsRouteModalOpen(true)}
            onSearch={fetchRoutes}
          />
        )}
        {activeKey === "trips" && (
          <TripsSection
            trips={trips}
            buses={buses}
            isCashier={isCashier}
            loading={loading}
            profileCarrierId={profile.carrierId}
            isAdmin={isAdmin}
            onToggleTripStatus={handleToggleTripStatus}
            onOpenSeatManagement={openSeatManagement}
            onStartEdit={startEditTrip}
            onDelete={handleDeleteTrip}
            onOpenAddModal={() => setIsTripModalOpen(true)}
            onSearch={fetchTrips}
          />
        )}
        {activeKey === "sales" && (
          <SalesSection
            trips={trips}
            buses={buses}
            loading={loading}
            profile={profile}
            isAdmin={isAdmin}
            activeSalesTrip={activeSalesTrip}
            setActiveSalesTrip={setActiveSalesTrip}
            activeSalesTab={activeSalesTab}
            setActiveSalesTab={setActiveSalesTab}
            seatsLoading={seatsLoading}
            seatsData={seatsData}
            selectedSeats={selectedSeats}
            setSelectedSeats={setSelectedSeats}
            passengerForm={passengerForm}
            manualBookingLoading={manualBookingLoading}
            cancelLoading={cancelLoading}
            openSalesBooking={openSalesBooking}
            openSalesPassengers={openSalesPassengers}
            handleSeatClick={handleSeatClick}
            handleManualBooking={handleManualBooking}
            handleCancelManualBooking={handleCancelManualBooking}
            startEditPassengerDetails={startEditPassengerDetails}
          />
        )}
        {activeKey === "employees" && (
          <EmployeesSection
            employees={employees}
            employeesLoading={employeesLoading}
            onToggleActive={handleToggleEmployeeActive}
            onStartEdit={startEditEmployee}
            onDelete={handleDeleteEmployee}
            onOpenAddModal={openAddEmployeeModal}
          />
        )}
        {activeKey === "stats" && (
          <SalesStatsSection
            trips={trips}
            buses={buses}
            loading={loading}
            profile={profile}
          />
        )}
      </div>

      {/* 1. Modal: Add Bus */}
      <Modal
        title={editingBus ? "Редактировать автобус" : "Зарегистрировать автобус"}
        open={isBusModalOpen}
        onCancel={() => {
          setIsBusModalOpen(false);
          setEditingBus(null);
          busForm.resetFields();
        }}
        onOk={() => busForm.submit()}
        okText={editingBus ? "Сохранить" : "Добавить"}
        cancelText="Отмена"
      >
        <Form form={busForm} layout="vertical" onFinish={handleSaveBus}>
          {isAdmin && (
            <Form.Item
              name="carrierId"
              label="Автопарк"
              rules={[{ required: true, message: "Выберите автопарк" }]}
            >
              <Select placeholder="Выберите автопарк">
                {carrierCompanies.map(c => (
                  <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item
            name="plateNumber"
            label="Государственный регистрационный номер"
            rules={[{ required: true, message: "Введите гос. номер автобуса" }]}
          >
            <Input placeholder="Например: 777AAA01" />
          </Form.Item>

          <Form.Item
            name="brandId"
            label="Марка автобуса"
            rules={[{ required: true, message: "Выберите марку" }]}
          >
            <Select placeholder="Выберите марку" onChange={handleBrandChange}>
              {brands.map(b => (
                <Select.Option key={b.id} value={b.id}>{b.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="modelId"
            label="Модель автобуса (Определяет схему мест!)"
            rules={[{ required: true, message: "Выберите модель" }]}
          >
            <Select placeholder="Сначала выберите марку" disabled={selectedBrandModels.length === 0}>
              {selectedBrandModels.map(m => (
                <Select.Option key={m.id} value={m.id}>{m.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="colorId"
            label="Цвет кузова"
            rules={[{ required: true, message: "Выберите цвет" }]}
          >
            <Select placeholder="Выберите цвет">
              {colors.map(c => (
                <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Row>
            <Col span={12}>
              <Form.Item name="hasAC" valuePropName="checked" label="Кондиционер">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="hasWifi" valuePropName="checked" label="Wi-Fi">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="hasCharger" valuePropName="checked" label="USB-зарядки">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="hasTv" valuePropName="checked" label="Телевизор">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 2. Modal: Add Route */}
      <Modal
        title={editingRoute ? "Редактировать направление" : "Создать направление"}
        open={isRouteModalOpen}
        onCancel={() => {
          setIsRouteModalOpen(false);
          setEditingRoute(null);
          routeForm.resetFields();
        }}
        onOk={() => routeForm.submit()}
        okText={editingRoute ? "Сохранить" : "Добавить"}
        cancelText="Отмена"
      >
        <Form form={routeForm} layout="vertical" onFinish={handleSaveRoute}>
          {isAdmin && (
            <Form.Item
              name="carrierId"
              label="Автопарк"
              rules={[{ required: true, message: "Выберите автопарк" }]}
            >
              <Select placeholder="Выберите автопарк">
                {carrierCompanies.map(c => (
                  <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item
            name="fromStationId"
            label="Пункт Отправления"
            rules={[{ required: true, message: "Выберите пункт отправления" }]}
          >
            <Select placeholder="Откуда">
              {stations.map(s => (
                <Select.Option key={s.id} value={s.id}>
                  {s.cityName} — {s.stationName} ({s.stationCode})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="toStationId"
            label="Пункт Назначения"
            rules={[{ required: true, message: "Выберите пункт назначения" }]}
          >
            <Select placeholder="Куда">
              {stations.map(s => (
                <Select.Option key={s.id} value={s.id}>
                  {s.cityName} — {s.stationName} ({s.stationCode})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="distanceKm"
            label="Дистанция (км, необязательно)"
          >
            <InputNumber min={1} style={{ width: "100%" }} placeholder="Например: 450" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 3. Modal: Add Trip */}
      <Modal
        title={editingTrip ? "Редактировать рейс" : "Запланировать рейс"}
        open={isTripModalOpen}
        onCancel={() => {
          setIsTripModalOpen(false);
          setEditingTrip(null);
          tripForm.resetFields();
        }}
        onOk={() => tripForm.submit()}
        okText={editingTrip ? "Сохранить" : "Создать"}
        cancelText="Отмена"
      >
        <Form form={tripForm} layout="vertical" onFinish={handleSaveTrip}>
          {isAdmin && (
            <Form.Item
              name="carrierId"
              label="Автопарк"
              rules={[{ required: true, message: "Выберите автопарк" }]}
            >
              <Select placeholder="Выберите автопарк">
                {carrierCompanies.map(c => (
                  <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item
            name="routeId"
            label="Маршрут следования"
            rules={[{ required: true, message: "Выберите маршрут" }]}
          >
            <Select placeholder="Выберите маршрут">
              {routes.map(r => (
                <Select.Option key={r.id} value={r.id}>
                  {r.fromCityName ? `${r.fromCityName} (${r.fromStationName})` : r.fromStationName} → {r.toCityName ? `${r.toCityName} (${r.toStationName})` : r.toStationName} ({r.distanceKm} км)
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="busId"
            label="Назначить автобус"
            rules={[{ required: true, message: "Назначьте автобус" }]}
          >
            <Select placeholder="Выберите автобус">
              {buses.map(b => (
                <Select.Option key={b.id} value={b.id}>
                  {b.plateNumber} ({b.brandName || ""} {b.modelName || ""})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="time"
            label="Даты и время рейса (Отправление и Прибытие)"
            rules={[{ required: true, message: "Укажите временной интервал рейса" }]}
          >
            <DatePicker.RangePicker showTime format="DD.MM.YYYY HH:mm" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="price"
            label="Базовая стоимость билета (KZT)"
            rules={[{ required: true, message: "Укажите базовую цену" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} placeholder="5000" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 4. Modal: Seat & Price Management on Trip */}
      <SeatManagementModal
        isOpen={isSeatModalOpen}
        onCancel={() => setIsSeatModalOpen(false)}
        selectedTrip={selectedTrip}
        seatsLoading={seatsLoading}
        seatsData={seatsData}
        selectedSeats={selectedSeats}
        onSeatClick={handleSeatClick}
        individualPrice={individualPrice}
        setIndividualPrice={setIndividualPrice}
        handleUpdatePrices={handleUpdatePrices}
        priceSubmitting={priceSubmitting}
      />

      {/* 5. Modal: Add Employee */}
      <Modal
        title={editingEmployee ? "Редактировать сотрудника" : "Добавить сотрудника"}
        open={isEmployeeModalOpen}
        onCancel={() => {
          setIsEmployeeModalOpen(false);
          setEditingEmployee(null);
          employeeForm.resetFields();
        }}
        onOk={() => employeeForm.submit()}
        okText={editingEmployee ? "Сохранить" : "Добавить"}
        cancelText="Отмена"
        confirmLoading={employeeSubmitting}
      >
        <Form form={employeeForm} layout="vertical" onFinish={handleSaveEmployee}>
          <Form.Item
            name="phoneNumber"
            label="Номер телефона (Логин для входа)"
            rules={[{ required: true, message: "Введите номер телефона" }]}
          >
            <Input placeholder="+7 (7xx) xxx-xx-xx" />
          </Form.Item>

          <Form.Item
            name="password"
            label={editingEmployee ? "Пароль для входа (оставьте пустым, чтобы не менять)" : "Пароль для входа"}
            rules={[
              { required: !editingEmployee, message: "Введите пароль" },
              { min: 6, message: "Пароль должен быть не менее 6 символов" }
            ]}
          >
            <Input.Password placeholder="Минимум 6 символов" />
          </Form.Item>

          <Form.Item
            name="firstName"
            label="Имя"
            rules={[{ required: true, message: "Введите имя" }]}
          >
            <Input placeholder="Иван" />
          </Form.Item>

          <Form.Item
            name="lastName"
            label="Фамилия"
            rules={[{ required: true, message: "Введите фамилию" }]}
          >
            <Input placeholder="Иванов" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email (необязательно)"
            rules={[{ type: "email", message: "Некорректный формат email" }]}
          >
            <Input placeholder="agent@example.com" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Роль сотрудника"
            initialValue="Agent"
            rules={[{ required: true, message: "Выберите роль" }]}
          >
            <Select disabled={isCarrierRoleOnly}>
              <Select.Option value="Agent">Агент</Select.Option>
              <Select.Option value="Admin">Администратор</Select.Option>
              <Select.Option value="Carrier">Перевозчик</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="carrierId"
            label="Автопарк"
            dependencies={["role"]}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const role = getFieldValue("role");
                  if ((role === "Agent" || role === "Carrier") && !value) {
                    return Promise.reject(new Error("Выберите автопарк"));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Select placeholder="Выберите автопарк" allowClear disabled={isCarrierRoleOnly}>
              {carrierCompanies.map(c => (
                <Select.Option key={c.id || c.Id} value={c.id || c.Id}>
                  {c.name || c.Name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 6. Modal: Edit Passenger Details */}
      <Modal
        title={`Редактирование пассажира (Место ${editingPassenger?.seatNumber})`}
        open={isPassengerEditModalOpen}
        onCancel={() => {
          setIsPassengerEditModalOpen(false);
          setEditingPassenger(null);
          passengerEditForm.resetFields();
        }}
        onOk={() => passengerEditForm.submit()}
        okText="Сохранить"
        cancelText="Отмена"
      >
        <Form form={passengerEditForm} layout="vertical" onFinish={handleSavePassengerDetails}>
          <Form.Item name="lastName" label="Фамилия" rules={[{ required: true, message: "Введите фамилию" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="firstName" label="Имя" rules={[{ required: true, message: "Введите имя" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="middleName" label="Отчество">
            <Input />
          </Form.Item>
          <Form.Item name="documentType" label="Тип документа" rules={[{ required: true, message: "Выберите тип документа" }]}>
            <Select>
              <Select.Option value="passport">Удостоверение</Select.Option>
              <Select.Option value="foreign_passport">Паспорт</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="documentNumber" label="Номер документа" rules={[{ required: true, message: "Введите номер документа" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="iin" label="ИИН">
            <Input maxLength={12} placeholder="12 цифр" />
          </Form.Item>
          <Form.Item name="phoneNumber" label="Номер телефона">
            <Input placeholder="+7 (7xx) xxx-xx-xx" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default CarrierDashboardPage;
