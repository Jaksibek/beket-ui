import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Table,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  Select,
  DatePicker,
  message,
  Tag,
  Flex,
  Spin
} from "antd";
import {
  DashboardOutlined,
  CarOutlined,
  CompassOutlined,
  CalendarOutlined,
  LogoutOutlined,
  PlusOutlined,
  CheckOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  SettingOutlined
} from "@ant-design/icons";
import { authApi } from "@/shared/api";
import { appRoutes } from "@/shared/config/router";
import dayjs from "dayjs";
import styles from "./CarrierDashboardPage.module.scss";

const { Title, Text } = Typography;

// 53 seats constant bus scheme layout mapping coordinates
const LAYOUT_COLUMNS = [
  ['driver', null, null, null, 'door'],
  [1, 2, null, 3, 4],
  [5, 6, null, 7, 8],
  [9, 10, null, 11, 12],
  [13, 14, null, 15, 16],
  [17, 18, null, 19, 20],
  [21, 22, null, 23, 24],
  [null, null, null, null, 'door'],
  [25, 26, null, 27, 28],
  [29, 30, null, 31, 32],
  [33, 34, null, 35, 36],
  [37, 38, null, 39, 40],
  [41, 42, null, 43, 44],
  [45, 46, null, 47, 48],
  [49, 50, 51, 52, 53]
];

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
            : "overview";

  const handleMenuClick = (key: string) => {
    if (key === "overview") navigate(appRoutes.carrierDashboard);
    else if (key === "fleet") navigate(appRoutes.carrierFleet);
    else if (key === "routes") navigate(appRoutes.carrierRoutes);
    else if (key === "trips") navigate(appRoutes.carrierTrips);
    else if (key === "sales") navigate(appRoutes.carrierSales);
    else if (key === "employees") navigate(appRoutes.carrierEmployees);
  };

  // React active profile state, pre-filled from local storage but updated dynamically from API
  const [profile, setProfile] = useState<{
    carrierId: string | null;
    carrierName: string | null;
    email: string | null;
    fullName: string | null;
    roles: string[];
    phoneNumber: string | null;
  }>({
    carrierId: localStorage.getItem("carrier_id"),
    carrierName: localStorage.getItem("carrier_name"),
    email: localStorage.getItem("carrier_email"),
    fullName: localStorage.getItem("carrier_fullname"),
    roles: JSON.parse(localStorage.getItem("carrier_roles") || "[]"),
    phoneNumber: localStorage.getItem("carrier_phone"),
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

  // Forms references
  const [busForm] = Form.useForm();
  const [routeForm] = Form.useForm();
  const [tripForm] = Form.useForm();

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

  // Manual booking state
  const [passengerForm] = Form.useForm();
  const [manualBookingLoading, setManualBookingLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Fetching data
  const fetchBuses = async () => {
    try {
      const res = await authApi.get("/api/v1/carrier/buses");
      setBuses(res.data);
    } catch (e) {
      console.error(e);
      handleRequestError(e);
    }
  };

  const fetchRoutes = async () => {
    try {
      const res = await authApi.get("/api/v1/carrier/routes");
      setRoutes(res.data);
    } catch (e) {
      console.error(e);
      handleRequestError(e);
    }
  };

  const fetchTrips = async () => {
    try {
      const res = await authApi.get("/api/v1/carrier/trips");
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

  const handleAddEmployee = async (values: any) => {
    setEmployeeSubmitting(true);
    try {
      await authApi.post("/api/v1/carrier/employees", {
        phoneNumber: values.phoneNumber,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email
      });
      message.success("Агент успешно добавлен!");
      setIsEmployeeModalOpen(false);
      employeeForm.resetFields();
      fetchEmployees();
    } catch (err: any) {
      console.error(err);
      message.error(err.response?.data || "Ошибка при добавлении агента");
    } finally {
      setEmployeeSubmitting(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await authApi.get("/api/Auth/me");
      if (res.data) {
        const { carrierId, carrierName, email, fullName, roles, phoneNumber } = res.data;

        const cachedCarrierId = localStorage.getItem("carrier_id");

        localStorage.setItem("carrier_id", carrierId || "");
        localStorage.setItem("carrier_name", carrierName || "");
        localStorage.setItem("carrier_email", email || "");
        localStorage.setItem("carrier_fullname", fullName || "");
        localStorage.setItem("carrier_roles", JSON.stringify(roles || []));
        localStorage.setItem("carrier_phone", phoneNumber || "");

        setProfile({
          carrierId,
          carrierName,
          email,
          fullName,
          roles: roles || [],
          phoneNumber: phoneNumber || null
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

    // Role-based routing restriction
    const roles: string[] = JSON.parse(localStorage.getItem("carrier_roles") || "[]");
    const userIsCashier = roles.includes("Cashier") && !roles.includes("Admin");
    if (userIsCashier && !location.pathname.includes("/sales")) {
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
    }
  }, [navigate, location.pathname]);

  // Operations
  const handleAddBus = async (values: any) => {
    try {
      await authApi.post("/api/v1/carrier/buses", {
        plateNumber: values.plateNumber,
        brandId: values.brandId,
        modelId: values.modelId,
        colorId: values.colorId,
        hasAC: values.hasAC || false,
        hasCharger: values.hasCharger || false,
        hasWifi: values.hasWifi || false,
        hasTv: values.hasTv || false
      });
      message.success("Автобус успешно добавлен");
      setIsBusModalOpen(false);
      busForm.resetFields();
      fetchBuses();
    } catch (err: any) {
      console.error(err);
      message.error("Ошибка при добавлении автобуса");
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

  const handleAddRoute = async (values: any) => {
    try {
      await authApi.post("/api/v1/carrier/routes", {
        fromStationId: values.fromStationId,
        toStationId: values.toStationId,
        distanceKm: values.distanceKm
      });
      message.success("Маршрут успешно добавлен");
      setIsRouteModalOpen(false);
      routeForm.resetFields();
      fetchRoutes();
    } catch (err: any) {
      console.error(err);
      message.error("Ошибка при добавлении маршрута");
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

  const handleAddTrip = async (values: any) => {
    try {
      const departureTime = values.time[0].toISOString();
      const arrivalTime = values.time[1].toISOString();

      await authApi.post("/api/v1/carrier/trips", {
        routeId: values.routeId,
        busId: values.busId,
        departureTime,
        arrivalTime,
        price: values.price
      });
      message.success("Рейс успешно добавлен в расписание");
      setIsTripModalOpen(false);
      tripForm.resetFields();
      fetchTrips();
    } catch (err: any) {
      console.error(err);
      message.error(err.response?.data || "Ошибка при добавлении рейса");
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
        iin: values.iin
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

  const handleCancelManualBooking = async (seatNumber: string) => {
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
  };

  // Helper getters
  const getSeatState = (seatNum: number) => {
    const s = seatsData.find(x => x.seatNumber === String(seatNum));
    if (!s) return { status: "free", price: 0, passenger: null };

    const isSelected = selectedSeats.includes(seatNum);
    if (isSelected) {
      return { status: "selected", price: s.price, passenger: s.passenger, rawStatus: s.status };
    }

    return { status: s.status.toLowerCase(), price: s.price, passenger: s.passenger, rawStatus: s.status };
  };

  // Render helpers
  const renderBusesTable = () => {
    const columns = [
      {
        title: "Гос. номер",
        dataIndex: "plateNumber",
        key: "plateNumber",
        render: (text: string) => <Text strong style={{ fontSize: 15 }}>{text}</Text>
      },
      {
        title: "Марка",
        dataIndex: "brandName",
        key: "brandName",
        render: (text: string) => text || <Text type="secondary">—</Text>
      },
      {
        title: "Модель",
        dataIndex: "modelName",
        key: "modelName",
        render: (text: string) => text || <Text type="secondary">—</Text>
      },
      {
        title: "Цвет",
        dataIndex: "colorName",
        key: "colorName",
        render: (text: string) => text || <Text type="secondary">—</Text>
      },
      {
        title: "Удобства",
        key: "comfort",
        render: (_: any, record: any) => (
          <Flex gap={4} wrap="wrap">
            {record.hasAC && <Tag color="success" className={styles.comfortTag}>AC</Tag>}
            {record.hasWifi && <Tag color="processing" className={styles.comfortTag}>Wi-Fi</Tag>}
            {record.hasCharger && <Tag color="warning" className={styles.comfortTag}>Зарядки</Tag>}
            {record.hasTv && <Tag color="default" className={styles.comfortTag}>TV</Tag>}
          </Flex>
        )
      },
      {
        title: "Действия",
        key: "action",
        width: 120,
        render: (_: any, record: any) => (
          <Button danger size="middle" onClick={() => handleDeleteBus(record.id)}>
            Удалить
          </Button>
        )
      }
    ];

    return (
      <Card
        className={styles.glassCard}
        title={<Title level={4} style={{ margin: 0 }}>Управление автобусами</Title>}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsBusModalOpen(true)} disabled={!profile.carrierId}>
            Добавить автобус
          </Button>
        }
      >
        <Table
          dataSource={buses}
          columns={columns}
          rowKey="id"
          loading={loading}
          bordered
          pagination={{ pageSize: 8 }}
        />
      </Card>
    );
  };

  const renderRoutesTable = () => {
    const columns = [
      {
        title: "Пункт Отправления",
        key: "from",
        render: (_: any, record: any) => (
          <div>
            <Text strong>{record.fromStationName || "ID: " + record.fromStationId}</Text>
          </div>
        )
      },
      {
        title: "Пункт Назначения",
        key: "to",
        render: (_: any, record: any) => (
          <div>
            <Text strong>{record.toStationName || "ID: " + record.toStationId}</Text>
          </div>
        )
      },
      {
        title: "Дистанция",
        dataIndex: "distanceKm",
        key: "distanceKm",
        render: (val: number) => <Tag color="blue" style={{ fontSize: 13, padding: "2px 8px" }}>{val} км</Tag>
      },
      {
        title: "Действия",
        key: "action",
        width: 120,
        render: (_: any, record: any) => (
          <Button danger size="middle" onClick={() => handleDeleteRoute(record.id)}>
            Удалить
          </Button>
        )
      }
    ];

    return (
      <Card
        className={styles.glassCard}
        title={<Title level={4} style={{ margin: 0 }}>Направления / Маршруты</Title>}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsRouteModalOpen(true)} disabled={!profile.carrierId}>
            Добавить маршрут
          </Button>
        }
      >
        <Table
          dataSource={routes}
          columns={columns}
          rowKey="id"
          loading={loading}
          bordered
          pagination={{ pageSize: 8 }}
        />
      </Card>
    );
  };

  const renderTripsTable = () => {
    const columns = [
      {
        title: "Маршрут",
        key: "routeName",
        render: (_: any, record: any) => {
          // Find route name if route object loaded, or show from record
          const rt = routes.find(r => r.id === record.routeId);
          const name = rt ? `${rt.fromStationName} → ${rt.toStationName}` : record.routeName;
          return <Text strong>{name}</Text>;
        }
      },
      {
        title: "Автобус",
        key: "busPlateNumber",
        render: (_: any, record: any) => {
          const bs = buses.find(b => b.id === record.busId);
          return bs ? <Tag color="purple" style={{ fontSize: 13 }}>{bs.plateNumber}</Tag> : <Tag color="default">{record.busPlateNumber}</Tag>;
        }
      },
      {
        title: "Отправление",
        dataIndex: "departureTime",
        key: "departureTime",
        render: (val: string) => dayjs(val).format("DD.MM.YYYY HH:mm")
      },
      {
        title: "Прибытие",
        dataIndex: "arrivalTime",
        key: "arrivalTime",
        render: (val: string) => dayjs(val).format("DD.MM.YYYY HH:mm")
      },
      {
        title: "Свободные места",
        key: "seatsStat",
        render: (_: any, record: any) => (
          <Tag color={record.freeSeats === 0 ? "error" : "success"} style={{ fontSize: 13 }}>
            {record.freeSeats}
          </Tag>
        )
      },
      {
        title: "Статус",
        key: "status",
        width: 80,
        render: (_: any, record: any) => (
          <Switch 
            size="small"
            checked={record.status === 1} 
            onChange={() => handleToggleTripStatus(record.id)}
            disabled={!profile.carrierId}
          />
        )
      },
      {
        title: "Действия",
        key: "action",
        width: 250,
        render: (_: any, record: any) => (
          <Flex gap={8}>
            {!isCashier && (
              <Button icon={<SettingOutlined />} type="default" onClick={() => openSeatManagement(record)} disabled={!profile.carrierId}>
                Настройка
              </Button>
            )}
            <Button danger onClick={() => handleDeleteTrip(record.id)}>
              Удалить
            </Button>
          </Flex>
        )
      }
    ];

    return (
      <Card
        className={styles.glassCard}
        title={<Title level={4} style={{ margin: 0 }}>Планирование рейсов</Title>}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsTripModalOpen(true)} disabled={!profile.carrierId}>
            Добавить рейс
          </Button>
        }
      >
        <Table
          dataSource={trips}
          columns={columns}
          rowKey="id"
          loading={loading}
          bordered
          pagination={{ pageSize: 8 }}
        />
      </Card>
    );
  };

  const openSalesBooking = (trip: any) => {
    setActiveSalesTrip(trip);
    setSelectedSeats([]);
    setIndividualPrice(null);
    fetchTripSeats(trip.id);
  };

  const renderSalesTable = () => {
    const columns = [
      {
        title: "Маршрут",
        key: "routeName",
        render: (_: any, record: any) => {
          const rt = routes.find(r => r.id === record.routeId);
          const name = rt ? `${rt.fromStationName} → ${rt.toStationName}` : record.routeName;
          return <Text strong style={{ fontSize: 15 }}>{name}</Text>;
        }
      },
      {
        title: "Автобус",
        key: "busPlateNumber",
        render: (_: any, record: any) => {
          const bs = buses.find(b => b.id === record.busId);
          return bs ? <Tag color="purple" style={{ fontSize: 13 }}>{bs.plateNumber}</Tag> : <Tag color="default">{record.busPlateNumber}</Tag>;
        }
      },
      {
        title: "Отправление",
        dataIndex: "departureTime",
        key: "departureTime",
        render: (val: string) => dayjs(val).format("DD.MM.YYYY HH:mm")
      },
      {
        title: "Прибытие",
        dataIndex: "arrivalTime",
        key: "arrivalTime",
        render: (val: string) => dayjs(val).format("DD.MM.YYYY HH:mm")
      },
      {
        title: "Свободные места",
        key: "seatsStat",
        render: (_: any, record: any) => (
          <Tag color={record.freeSeats === 0 ? "error" : "success"} style={{ fontSize: 13 }}>
            {record.freeSeats} из {record.totalSeats} свободно
          </Tag>
        )
      },
      {
        title: "Цена билета",
        dataIndex: "price",
        key: "price",
        render: (val: number) => <Text strong style={{ color: "#2563eb", fontSize: 15 }}>{val} KZT</Text>
      },
      {
        title: "Действия",
        key: "action",
        width: 220,
        render: (_: any, record: any) => (
          <Button icon={<ShoppingCartOutlined />} type="primary" onClick={() => openSalesBooking(record)} disabled={!profile.carrierId}>
            Оформить продажи
          </Button>
        )
      }
    ];

    return (
      <Card
        className={styles.glassCard}
        title={<Title level={4} style={{ margin: 0 }}>Касса — Оформление билетов и продажи</Title>}
      >
        <Table
          dataSource={trips}
          columns={columns}
          rowKey="id"
          loading={loading}
          bordered
          pagination={{ pageSize: 8 }}
        />
      </Card>
    );
  };

  const renderSalesActiveBooking = () => {
    if (!activeSalesTrip) return null;

    return (
      <Card
        className={styles.glassCard}
        title={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", flexWrap: "wrap", gap: 12 }}>
            <div>
              <Title level={4} style={{ margin: 0 }}>Касса — Продажа билетов</Title>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Рейс: {activeSalesTrip.routeName || "Маршрут"} | Отправление: {dayjs(activeSalesTrip.departureTime).format("DD.MM.YYYY HH:mm")}
              </Text>
            </div>
            <Button onClick={() => { setActiveSalesTrip(null); setSelectedSeats([]); }}>
              Назад к списку рейсов
            </Button>
          </div>
        }
      >
        {seatsLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
            <Spin size="large" tip="Загрузка схемы мест..." />
          </div>
        ) : (
          <div className={styles.seatModalContainer}>
            {/* Left: Custom Bus scheme representation */}
            <div className={styles.busLayoutContainer}>
              <div className={styles.schemeContainer}>
                <div className={styles.seatRow}>
                  {[...LAYOUT_COLUMNS].reverse().map((col, colIndex) => (
                    <div key={colIndex} className={styles.seatsGrid}>
                      {col.map((cell, rowIndex) => {
                        if (cell === null) {
                          return <div key={`empty-${colIndex}-${rowIndex}`} className={styles.emptySpace} />;
                        }
                        if (cell === "driver") {
                          return (
                            <div key={`driver-${colIndex}-${rowIndex}`} className={styles.driverCell}>
                              <div className={styles.wheel}></div>
                            </div>
                          );
                        }
                        if (cell === "door") {
                          return <div key={`door-${colIndex}-${rowIndex}`} className={styles.facility}>ВХОД</div>;
                        }

                        const seatNum = cell as number;
                        const { status, price } = getSeatState(seatNum);

                        return (
                          <div
                            key={seatNum}
                            className={`${styles.customSeat} ${styles[status]}`}
                            onClick={() => handleSeatClick(seatNum)}
                          >
                            <span className={styles.seatNum}>{seatNum}</span>
                            {price > 0 && <span className={styles.seatPrice}>{price} ₸</span>}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Side operations pane */}
            <div className={styles.sidePanel}>
              {/* Legend */}
              <div>
                <Text strong style={{ display: "block", marginBottom: 10 }}>Обозначения мест</Text>
                <Flex vertical gap={6}>
                  <Flex align="center" gap={8}>
                    <div className={`${styles.legendBox} ${styles.free}`}></div>
                    <Text>Свободно</Text>
                  </Flex>
                  <Flex align="center" gap={8}>
                    <div className={`${styles.legendBox} ${styles.reserved}`}></div>
                    <Text>Бронь (сессия)</Text>
                  </Flex>
                  <Flex align="center" gap={8}>
                    <div className={`${styles.legendBox} ${styles.booked}`}></div>
                    <Text>Продано / Занято</Text>
                  </Flex>
                  <Flex align="center" gap={8}>
                    <div className={`${styles.legendBox} ${styles.selected}`}></div>
                    <Text>Выбрано вами</Text>
                  </Flex>
                </Flex>
              </div>

              <hr style={{ border: "0.5px solid #e2e8f0", margin: "4px 0" }} />

              {/* Dynamic details / Actions form */}
              {selectedSeats.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <Text type="secondary">Выберите свободные места на схеме автобуса для оформления оффлайн-продажи.</Text>
                </div>
              ) : (() => {
                const firstSeatNum = selectedSeats[0];
                const seatInfo = seatsData.find(s => s.seatNumber === String(firstSeatNum));
                const isBooked = seatInfo && seatInfo.status === "Booked";
                const isReserved = seatInfo && seatInfo.status === "Reserved";

                if (isBooked || isReserved) {
                  const passenger = seatInfo?.passenger;
                  const isManualSale = passenger && passenger.buyerEmail === "manual@beket.kz";

                  return (
                    <div>
                      <Title level={5} style={{ marginBottom: 12 }}>
                        Место {firstSeatNum} ({isBooked ? "Продано" : "Зарезервировано"})
                      </Title>
                      
                      <Card size="small" title="Информация о пассажире" style={{ background: "#fff", marginBottom: 16 }}>
                        {passenger ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <div><Text type="secondary">ФИО:</Text> <strong>{passenger.lastName} {passenger.firstName} {passenger.middleName || ""}</strong></div>
                            <div><Text type="secondary">Документ:</Text> {passenger.documentType === "passport" ? "Удостоверение" : passenger.documentType === "foreign_passport" ? "Паспорт" : passenger.documentType || "—"} №{passenger.documentNumber || "—"}</div>
                            {passenger.iin && <div><Text type="secondary">ИИН:</Text> {passenger.iin}</div>}
                            <div><Text type="secondary">Билет:</Text> <Tag color="blue">{passenger.ticketNumber || "—"}</Tag></div>
                            <div><Text type="secondary">Телефон:</Text> {passenger.buyerPhone || "—"}</div>
                            <div><Text type="secondary">Email:</Text> {passenger.buyerEmail || "—"}</div>
                          </div>
                        ) : (
                          <Text type="secondary">Детали пассажира недоступны (онлайн покупка).</Text>
                        )}
                      </Card>

                      {isManualSale && (
                        <Button 
                          type="primary" 
                          danger 
                          block 
                          loading={cancelLoading} 
                          onClick={() => handleCancelManualBooking(String(firstSeatNum))}
                        >
                          Отменить продажу
                        </Button>
                      )}
                    </div>
                  );
                }

                // If not booked/reserved (i.e. free seats are selected):
                return (
                  <div>
                    <Title level={5}>Выбрано мест: {selectedSeats.length}</Title>
                    <Text style={{ display: "block", marginBottom: 6 }}>Номера: {selectedSeats.join(", ")}</Text>
                    <Text strong style={{ display: "block", marginBottom: 12, fontSize: 15, color: "#2563eb" }}>
                      Итого к оплате: {selectedSeats.reduce((acc, num) => acc + (getSeatState(num).price || 0), 0)} KZT
                    </Text>

                    {/* Manual sale form */}
                    <Card size="small" title="Пассажирские данные" style={{ background: "#fff" }}>
                      <Form form={passengerForm} layout="vertical" onFinish={handleManualBooking}>
                        <Form.Item name="lastName" label="Фамилия" rules={[{ required: true, message: "Введите фамилию" }]}>
                          <Input placeholder="Иванов" size="small" />
                        </Form.Item>
                        <Form.Item name="firstName" label="Имя" rules={[{ required: true, message: "Введите имя" }]}>
                          <Input placeholder="Иван" size="small" />
                        </Form.Item>
                        <Form.Item name="middleName" label="Отчество">
                          <Input placeholder="Иванович" size="small" />
                        </Form.Item>
                        <Form.Item name="documentType" label="Тип документа" initialValue="passport">
                          <Select size="small">
                            <Select.Option value="passport">Удостоверение</Select.Option>
                            <Select.Option value="foreign_passport">Паспорт</Select.Option>
                          </Select>
                        </Form.Item>
                        <Form.Item name="documentNumber" label="Номер документа" rules={[{ required: true, message: "Введите номер документа" }]}>
                          <Input placeholder="012345678" size="small" />
                        </Form.Item>
                        <Form.Item name="iin" label="ИИН (12 цифр)">
                          <Input placeholder="123456789012" maxLength={12} size="small" />
                        </Form.Item>
                        <Button type="primary" htmlType="submit" danger block loading={manualBookingLoading} icon={<CheckOutlined />}>
                          Оформить продажу
                        </Button>
                      </Form>
                    </Card>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </Card>
    );
  };

  const renderEmployeesTable = () => {
    const columns = [
      {
        title: "Имя",
        dataIndex: "firstName",
        key: "firstName",
        render: (text: string) => <Text strong>{text}</Text>
      },
      {
        title: "Фамилия",
        dataIndex: "lastName",
        key: "lastName",
        render: (text: string) => <Text strong>{text}</Text>
      },
      {
        title: "Номер телефона (Логин)",
        dataIndex: "phoneNumber",
        key: "phoneNumber"
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
        render: (text: string) => text || <Text type="secondary">—</Text>
      },
      {
        title: "Роли",
        dataIndex: "roles",
        key: "roles",
        render: (roles: string[]) => (
          <Flex gap={4}>
            {roles.map(r => (
              <Tag key={r} color={r === "Admin" ? "blue" : "green"}>{r}</Tag>
            ))}
          </Flex>
        )
      },
      {
        title: "Статус",
        key: "isActive",
        width: 80,
        render: (_: any, record: any) => (
          <Switch 
            size="small"
            checked={record.isActive} 
            onChange={() => handleToggleEmployeeActive(record.id)}
          />
        )
      },
      {
        title: "Дата создания",
        dataIndex: "createdOn",
        key: "createdOn",
        render: (val: string) => val ? dayjs(val).format("DD.MM.YYYY HH:mm") : "—"
      }
    ];

    return (
      <Card
        className={styles.glassCard}
        title={<Title level={4} style={{ margin: 0 }}>Управление агентами автопарка</Title>}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsEmployeeModalOpen(true)}>
            Добавить агента
          </Button>
        }
      >
        <Table
          dataSource={employees}
          columns={columns}
          rowKey="id"
          loading={employeesLoading}
          bordered
          pagination={{ pageSize: 8 }}
        />
      </Card>
    );
  };

  const renderOverview = () => {
    return (
      <Row gutter={[20, 20]}>
        <Col xs={24} sm={8}>
          <Card className={`${styles.glassCard} ${styles.hoverEffect}`} onClick={() => handleMenuClick("fleet")}>
            <Statistic
              title="Автобусов в парке"
              value={buses.length}
              prefix={<CarOutlined style={{ color: "#3b82f6" }} />}
              valueStyle={{ color: "#3b82f6", fontWeight: "700" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className={`${styles.glassCard} ${styles.hoverEffect}`} onClick={() => handleMenuClick("routes")}>
            <Statistic
              title="Направлений маршрутов"
              value={routes.length}
              prefix={<CompassOutlined style={{ color: "#10b981" }} />}
              valueStyle={{ color: "#10b981", fontWeight: "700" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className={`${styles.glassCard} ${styles.hoverEffect}`} onClick={() => handleMenuClick("trips")}>
            <Statistic
              title="Рейсов в расписании"
              value={trips.length}
              prefix={<CalendarOutlined style={{ color: "#8b5cf6" }} />}
              valueStyle={{ color: "#8b5cf6", fontWeight: "700" }}
            />
          </Card>
        </Col>

        {/* Useful Carrier details card */}
        <Col span={24}>
          <Card className={styles.glassCard} title="Информация об организации">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <div style={{ marginBottom: 12 }}>
                  <Text type="secondary" style={{ fontSize: 13, display: "block" }}>Наименование автопарка</Text>
                  <Text strong style={{ fontSize: 16, color: "#1e293b" }}>{profile.carrierName || "Не привязан"}</Text>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <Text type="secondary" style={{ fontSize: 13, display: "block" }}>Администратор</Text>
                  <Text strong style={{ fontSize: 15, color: "#1e293b" }}>{profile.fullName || "—"}</Text>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div style={{ marginBottom: 12 }}>
                  <Text type="secondary" style={{ fontSize: 13, display: "block" }}>Контактный Email</Text>
                  <Text strong style={{ fontSize: 15, color: "#1e293b" }}>{profile.email || "—"}</Text>
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 13, display: "block" }}>Статус верификации</Text>
                  <Tag color={profile.carrierName ? "success" : "error"} style={{ marginTop: 4 }}>
                    {profile.carrierName ? "Подтвержденная компания" : "Автопарк не настроен"}
                  </Tag>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={24}>
          <Card className={styles.glassCard} title="Добро пожаловать в Кабинет перевозчика">
            <Typography.Paragraph style={{ fontSize: 15 }}>
              Здесь вы можете полноценно управлять автобусным парком вашего предприятия, создавать регулярные маршруты следования, а также планировать расписание поездок.
            </Typography.Paragraph>
            <Typography.Paragraph style={{ fontSize: 15 }}>
              Используйте меню слева для переключения разделов. На вкладке <strong>Рейсы</strong> вы можете управлять свободными местами: переопределять цены для каждого места отдельно и продавать билеты оффлайн пассажирам, обратившимся к вам напрямую.
            </Typography.Paragraph>
          </Card>
        </Col>
      </Row>
    );
  };

  // Build Model list selector helper
  const handleBrandChange = (brandId: string) => {
    busForm.setFieldValue("modelId", undefined);
    const selectedBrand = brands.find(b => b.id === brandId);
    setSelectedBrandModels(selectedBrand?.models || []);
  };

  const getActiveTabTitle = () => {
    switch (activeKey) {
      case "fleet": return "Мой автопарк";
      case "routes": return "Маршруты и Направления";
      case "trips": return "Расписание и Рейсы";
      case "sales": return "Касса";
      case "employees": return "Агенты";
      default: return "Главная";
    }
  };

  return (
    <div className={styles.dashboardLayout}>
      {/* Sidebar navigation */}
      <div className={styles.sidebar}>
        <div className={styles.brandHeader}>
          <h2 className={styles.logoText}>BEKET</h2>
          <div className={styles.logoSubtitle}>Carrier Panel</div>
        </div>

        <div className={styles.menuList}>
          {!isCashier && (
            <>
              <div
                className={`${styles.menuItem} ${activeKey === "overview" ? styles.active : ""}`}
                onClick={() => handleMenuClick("overview")}
              >
                <DashboardOutlined />
                <span>Главная</span>
              </div>

              <div
                className={`${styles.menuItem} ${activeKey === "fleet" ? styles.active : ""}`}
                onClick={() => handleMenuClick("fleet")}
              >
                <CarOutlined />
                <span>Мой автопарк</span>
              </div>

              <div
                className={`${styles.menuItem} ${activeKey === "routes" ? styles.active : ""}`}
                onClick={() => handleMenuClick("routes")}
              >
                <CompassOutlined />
                <span>Направления</span>
              </div>

              <div
                className={`${styles.menuItem} ${activeKey === "trips" ? styles.active : ""}`}
                onClick={() => handleMenuClick("trips")}
              >
                <CalendarOutlined />
                <span>Расписание рейсов</span>
              </div>

              <div
                className={`${styles.menuItem} ${activeKey === "employees" ? styles.active : ""}`}
                onClick={() => handleMenuClick("employees")}
              >
                <TeamOutlined />
                <span>Агенты</span>
              </div>
            </>
          )}

          {/* Cashier view tab (visible to both admin and cashier) */}
          <div
            className={`${styles.menuItem} ${activeKey === "sales" ? styles.active : ""}`}
            onClick={() => handleMenuClick("sales")}
          >
            <ShoppingCartOutlined />
            <span>Касса / Продажи</span>
          </div>

          <div className={styles.logoutBtn} onClick={handleLogout}>
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
                  <>Компания: <strong>{profile.carrierName}</strong></>
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

        {!profile.carrierId && (
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

        {activeKey === "overview" && renderOverview()}
        {activeKey === "fleet" && renderBusesTable()}
        {activeKey === "routes" && renderRoutesTable()}
        {activeKey === "trips" && renderTripsTable()}
        {activeKey === "sales" && (
          activeSalesTrip ? renderSalesActiveBooking() : renderSalesTable()
        )}
        {activeKey === "employees" && renderEmployeesTable()}
      </div>

      {/* 1. Modal: Add Bus */}
      <Modal
        title="Зарегистрировать автобус"
        open={isBusModalOpen}
        onCancel={() => {
          setIsBusModalOpen(false);
          busForm.resetFields();
        }}
        onOk={() => busForm.submit()}
        okText="Добавить"
        cancelText="Отмена"
      >
        <Form form={busForm} layout="vertical" onFinish={handleAddBus}>
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
        title="Создать направление"
        open={isRouteModalOpen}
        onCancel={() => {
          setIsRouteModalOpen(false);
          routeForm.resetFields();
        }}
        onOk={() => routeForm.submit()}
        okText="Добавить"
        cancelText="Отмена"
      >
        <Form form={routeForm} layout="vertical" onFinish={handleAddRoute}>
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

        </Form>
      </Modal>

      {/* 3. Modal: Add Trip */}
      <Modal
        title="Запланировать рейс"
        open={isTripModalOpen}
        onCancel={() => {
          setIsTripModalOpen(false);
          tripForm.resetFields();
        }}
        onOk={() => tripForm.submit()}
        okText="Создать"
        cancelText="Отмена"
      >
        <Form form={tripForm} layout="vertical" onFinish={handleAddTrip}>
          <Form.Item
            name="routeId"
            label="Маршрут следования"
            rules={[{ required: true, message: "Выберите маршрут" }]}
          >
            <Select placeholder="Выберите маршрут">
              {routes.map(r => (
                <Select.Option key={r.id} value={r.id}>
                  {r.fromStationName} → {r.toStationName} ({r.distanceKm} км)
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
      <Modal
        title={
          selectedTrip ? (
            <div style={{ paddingBottom: 10 }}>
              <Title level={4} style={{ margin: 0 }}>Управление ценами на рейсе</Title>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Рейс: {selectedTrip.routeName || "Маршрут"} | Отправление: {dayjs(selectedTrip.departureTime).format("DD.MM.YYYY HH:mm")}
              </Text>
            </div>
          ) : ""
        }
        open={isSeatModalOpen}
        onCancel={() => setIsSeatModalOpen(false)}
        footer={null}
        width={1100}
        destroyOnClose
      >
        {seatsLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
            <Spin size="large" tip="Загрузка схемы мест..." />
          </div>
        ) : (
          <div className={styles.seatModalContainer}>
            {/* Left: Custom Bus scheme representation */}
            <div className={styles.busLayoutContainer}>
              <div className={styles.schemeContainer}>
                <div className={styles.seatRow}>
                  {[...LAYOUT_COLUMNS].reverse().map((col, colIndex) => (
                    <div key={colIndex} className={styles.seatsGrid}>
                      {col.map((cell, rowIndex) => {
                        if (cell === null) {
                          return <div key={`empty-${colIndex}-${rowIndex}`} className={styles.emptySpace} />;
                        }
                        if (cell === "driver") {
                          return (
                            <div key={`driver-${colIndex}-${rowIndex}`} className={styles.driverCell}>
                              <div className={styles.wheel}></div>
                            </div>
                          );
                        }
                        if (cell === "door") {
                          return <div key={`door-${colIndex}-${rowIndex}`} className={styles.facility}>ВХОД</div>;
                        }

                        const seatNum = cell as number;
                        const { status, price } = getSeatState(seatNum);

                        return (
                          <div
                            key={seatNum}
                            className={`${styles.customSeat} ${styles[status]}`}
                            onClick={() => handleSeatClick(seatNum)}
                          >
                            <span className={styles.seatNum}>{seatNum}</span>
                            {price > 0 && <span className={styles.seatPrice}>{price} ₸</span>}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Side operations pane */}
            <div className={styles.sidePanel}>
              <div>
                <Title level={5} style={{ marginTop: 0 }}>Управление ценами</Title>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Выберите свободные места на схеме для изменения стоимости.
                </Text>
              </div>

              <hr style={{ border: "0.5px solid #e2e8f0", margin: "8px 0" }} />

              {selectedSeats.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <Text type="secondary">Выберите одно или несколько мест на схеме для установки тарифа.</Text>
                </div>
              ) : (
                <div>
                  <Title level={5}>Выбрано мест: {selectedSeats.length}</Title>
                  <Text style={{ display: "block", marginBottom: 12 }}>Номера: {selectedSeats.join(", ")}</Text>

                  <Card size="small" title="Изменение цен" style={{ background: "#fff" }}>
                    <Form layout="vertical">
                      <Form.Item label="Установить цену (KZT)">
                        <InputNumber
                          style={{ width: "100%" }}
                          value={individualPrice}
                          onChange={setIndividualPrice}
                          min={0}
                        />
                      </Form.Item>
                      <Button
                        type="primary"
                        block
                        onClick={handleUpdatePrices}
                        loading={priceSubmitting}
                        disabled={individualPrice === null}
                      >
                        Применить цены
                      </Button>
                    </Form>
                  </Card>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* 5. Modal: Add Employee */}
      <Modal
        title="Добавить агента"
        open={isEmployeeModalOpen}
        onCancel={() => {
          setIsEmployeeModalOpen(false);
          employeeForm.resetFields();
        }}
        onOk={() => employeeForm.submit()}
        okText="Добавить"
        cancelText="Отмена"
        confirmLoading={employeeSubmitting}
      >
        <Form form={employeeForm} layout="vertical" onFinish={handleAddEmployee}>
          <Form.Item
            name="phoneNumber"
            label="Номер телефона (Логин для входа)"
            rules={[{ required: true, message: "Введите номер телефона" }]}
          >
            <Input placeholder="+7 (7xx) xxx-xx-xx" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Пароль для входа"
            rules={[
              { required: true, message: "Введите пароль" },
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
        </Form>
      </Modal>
    </div>
  );
}

export default CarrierDashboardPage;
