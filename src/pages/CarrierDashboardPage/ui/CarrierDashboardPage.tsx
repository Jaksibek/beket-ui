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
  SettingOutlined,
  UserOutlined
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
    : "overview";

  const handleMenuClick = (key: string) => {
    if (key === "overview") navigate(appRoutes.carrierDashboard);
    else if (key === "fleet") navigate(appRoutes.carrierFleet);
    else if (key === "routes") navigate(appRoutes.carrierRoutes);
    else if (key === "trips") navigate(appRoutes.carrierTrips);
  };

  // React active profile state, pre-filled from local storage but updated dynamically from API
  const [profile, setProfile] = useState<{
    carrierId: string | null;
    carrierName: string | null;
    email: string | null;
    fullName: string | null;
  }>({
    carrierId: localStorage.getItem("carrier_id"),
    carrierName: localStorage.getItem("carrier_name"),
    email: localStorage.getItem("carrier_email"),
    fullName: localStorage.getItem("carrier_fullname"),
  });

  const handleLogout = () => {
    localStorage.removeItem("carrier_token");
    localStorage.removeItem("carrier_name");
    localStorage.removeItem("carrier_id");
    localStorage.removeItem("carrier_email");
    localStorage.removeItem("carrier_fullname");
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

  const fetchProfile = async () => {
    try {
      const res = await authApi.get("/api/Auth/me");
      if (res.data) {
        const { carrierId, carrierName, email, fullName } = res.data;
        
        const cachedCarrierId = localStorage.getItem("carrier_id");
        
        localStorage.setItem("carrier_id", carrierId || "");
        localStorage.setItem("carrier_name", carrierName || "");
        localStorage.setItem("carrier_email", email || "");
        localStorage.setItem("carrier_fullname", fullName || "");
        
        setProfile({
          carrierId,
          carrierName,
          email,
          fullName
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

    fetchProfile();
    fetchCatalogs();
    fetchBuses();
    fetchRoutes();
    fetchTrips();
  }, [navigate]);

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
    setSelectedSeats(prev => {
      if (prev.includes(seatNum)) {
        const next = prev.filter(x => x !== seatNum);
        if (next.length === 1) {
          const singleSeat = seatsData.find(s => s.seatNumber === String(next[0]));
          setIndividualPrice(singleSeat?.price || null);
        } else {
          setIndividualPrice(null);
        }
        return next;
      } else {
        const next = [...prev, seatNum];
        if (next.length === 1) {
          const singleSeat = seatsData.find(s => s.seatNumber === String(seatNum));
          setIndividualPrice(singleSeat?.price || null);
        } else {
          setIndividualPrice(null);
        }
        return next;
      }
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
    if (selectedSeats.length === 0) return;
    setManualBookingLoading(true);
    try {
      await authApi.post(`/api/v1/carrier/trips/${selectedTrip.id}/sell-manual`, {
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
      fetchTripSeats(selectedTrip.id);
    } catch (err: any) {
      console.error(err);
      message.error(err.response?.data || "Ошибка при ручной продаже билетов");
    } finally {
      setManualBookingLoading(false);
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
        title: "Базовая цена",
        dataIndex: "price",
        key: "price",
        render: (val: number) => <Text strong style={{ color: "#2563eb" }}>{val} KZT</Text>
      },
      {
        title: "Действия",
        key: "action",
        width: 250,
        render: (_: any, record: any) => (
          <Flex gap={8}>
            <Button icon={<SettingOutlined />} type="default" onClick={() => openSeatManagement(record)}>
              Места и цены
            </Button>
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
              title="Направлений компании"
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
              <Title level={4} style={{ margin: 0 }}>Управление местами на рейсе</Title>
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
                        const { status } = getSeatState(seatNum);

                        return (
                          <div
                            key={seatNum}
                            className={`${styles.customSeat} ${styles[status]}`}
                            onClick={() => handleSeatClick(seatNum)}
                          >
                            <span>{seatNum}</span>
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
                <Text strong style={{ display: "block", marginBottom: 10 }}>Легенда мест</Text>
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
                  <Text type="secondary">Выберите места на схеме автобуса для изменения цен или оформления ручной оффлайн-продажи.</Text>
                </div>
              ) : selectedSeats.length === 1 ? (
                // Single seat details
                <div>
                  <Title level={5}>Выбрано место {selectedSeats[0]}</Title>
                  {(() => {
                    const seatInfo = getSeatState(selectedSeats[0]);

                    return (
                      <Flex vertical gap={12} style={{ marginTop: 10 }}>
                        <div>
                          <Text type="secondary" style={{ display: "block", fontSize: 12 }}>Текущий тариф</Text>
                          <Text strong style={{ fontSize: 16 }}>{seatInfo.price} KZT</Text>
                        </div>

                        <div>
                          <Text type="secondary" style={{ display: "block", fontSize: 12 }}>Текущий статус</Text>
                          <Tag color={seatInfo.status === "booked" ? "red" : seatInfo.status === "reserved" ? "orange" : "green"}>
                            {seatInfo.rawStatus || "Свободно"}
                          </Tag>
                        </div>

                        {/* Passenger Details */}
                        {seatInfo.passenger && (
                          <Card size="small" title="Пассажирские данные" style={{ marginTop: 4 }}>
                            <Text strong style={{ display: "block" }}>{seatInfo.passenger.lastName} {seatInfo.passenger.firstName}</Text>
                            {seatInfo.passenger.middleName && <Text style={{ display: "block" }}>{seatInfo.passenger.middleName}</Text>}
                            <Text type="secondary" style={{ display: "block", fontSize: 12 }}>Документ: {seatInfo.passenger.documentType === "foreign_passport" ? "Иностранный паспорт" : "Удостоверение"} - {seatInfo.passenger.documentNumber}</Text>
                            {seatInfo.passenger.iin && <Text type="secondary" style={{ display: "block", fontSize: 12 }}>ИИН: {seatInfo.passenger.iin}</Text>}
                            <Text type="secondary" style={{ display: "block", fontSize: 12 }}>Билет: {seatInfo.passenger.ticketNumber}</Text>
                            {seatInfo.passenger.buyerPhone && <Text style={{ display: "block", fontSize: 12, marginTop: 4 }}>Тел: {seatInfo.passenger.buyerPhone}</Text>}
                            {seatInfo.passenger.buyerEmail && <Text style={{ display: "block", fontSize: 12 }}>Email: {seatInfo.passenger.buyerEmail}</Text>}
                          </Card>
                        )}

                        {/* Actions for single seat */}
                        {seatInfo.status !== "booked" && seatInfo.status !== "reserved" && (
                          <Card size="small" title="Настройки места" style={{ background: "#fff" }}>
                            {/* Update Price form */}
                            <Form layout="vertical">
                              <Form.Item label="Индивидуальная цена (KZT)">
                                <InputNumber
                                  style={{ width: "100%" }}
                                  value={individualPrice}
                                  onChange={setIndividualPrice}
                                />
                              </Form.Item>
                              <Button
                                type="primary"
                                block
                                onClick={handleUpdatePrices}
                                loading={priceSubmitting}
                              >
                                Обновить цену
                              </Button>
                            </Form>

                            <hr style={{ border: "0.5px solid #f1f5f9", margin: "16px 0" }} />

                            {/* Manual sale form */}
                            <Form form={passengerForm} layout="vertical" onFinish={handleManualBooking}>
                              <Text strong style={{ fontSize: 13, display: "block", marginBottom: 8 }}>Оформить оффлайн-продажу</Text>
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
                                Продать на месте
                              </Button>
                            </Form>
                          </Card>
                        )}
                      </Flex>
                    );
                  })()}
                </div>
              ) : (
                // Multiple seats selected
                <div>
                  <Title level={5}>Выбрано мест: {selectedSeats.length}</Title>
                  <Text style={{ display: "block", marginBottom: 12 }}>Номера: {selectedSeats.join(", ")}</Text>

                  <Card size="small" title="Групповое изменение цен" style={{ background: "#fff", marginBottom: 14 }}>
                    <Form layout="vertical">
                      <Form.Item label="Установить цену на выбранные (KZT)">
                        <InputNumber
                          style={{ width: "100%" }}
                          value={individualPrice}
                          onChange={setIndividualPrice}
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

                  <Card size="small" title="Быстрая оффлайн-продажа группы" style={{ background: "#fff" }}>
                    <Form form={passengerForm} layout="vertical" onFinish={handleManualBooking}>
                      <Form.Item name="lastName" label="Фамилия лидера группы" rules={[{ required: true, message: "Введите фамилию" }]}>
                        <Input placeholder="Иванов" size="small" />
                      </Form.Item>
                      <Form.Item name="firstName" label="Имя лидера группы" rules={[{ required: true, message: "Введите имя" }]}>
                        <Input placeholder="Иван" size="small" />
                      </Form.Item>
                      <Form.Item name="documentNumber" label="Номер документа" rules={[{ required: true, message: "Введите номер документа" }]}>
                        <Input placeholder="012345678" size="small" />
                      </Form.Item>
                      <Button type="primary" htmlType="submit" danger block loading={manualBookingLoading} icon={<CheckOutlined />}>
                        Продать всю группу
                      </Button>
                    </Form>
                  </Card>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default CarrierDashboardPage;
