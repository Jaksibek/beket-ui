import { useState, useEffect } from "react";
import { Button, Card, Flex, Table, Tag, Typography, Input, Modal, Spin, message, Tooltip } from "antd";
import { TeamOutlined, SearchOutlined, UndoOutlined, DownloadOutlined, PrinterOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { authApi } from "@/shared/api";
import styles from "../ui/CarrierDashboardPage.module.scss";

const { Title, Text } = Typography;

interface HistorySectionProps {
  buses: any[];
  profileCarrierId: string | null;
}

export function HistorySection({
  buses,
  profileCarrierId,
}: HistorySectionProps) {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchCarrier, setSearchCarrier] = useState("");

  // Passenger Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any | null>(null);
  const [seatsData, setSeatsData] = useState<any[]>([]);
  const [seatsLoading, setSeatsLoading] = useState(false);

  const fetchTrips = async (searchParams?: { search?: string; carrierName?: string }) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("onlyCompleted", "true");
      if (searchParams?.search) params.append("search", searchParams.search);
      if (searchParams?.carrierName) params.append("carrierName", searchParams.carrierName);

      const res = await authApi.get(`/api/v1/carrier/trips?${params.toString()}`);
      setTrips(res.data);
    } catch (e) {
      console.error(e);
      message.error("Не удалось загрузить историю рейсов");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleSearch = () => {
    fetchTrips({
      search: searchText,
      carrierName: searchCarrier,
    });
  };

  const handleReset = () => {
    setSearchText("");
    setSearchCarrier("");
    fetchTrips({ search: "", carrierName: "" });
  };

  const fetchTripSeats = async (tripId: string) => {
    setSeatsLoading(true);
    try {
      const res = await authApi.get(`/api/v1/carrier/trips/${tripId}/seats`);
      setSeatsData(res.data);
    } catch (e) {
      console.error(e);
      message.error("Не удалось загрузить данные пассажиров рейса");
    } finally {
      setSeatsLoading(false);
    }
  };

  const openPassengerModal = (trip: any) => {
    setSelectedTrip(trip);
    setIsModalOpen(true);
    fetchTripSeats(trip.id);
  };

  // CSV Export Functionality (UTF-8 BOM)
  const handleExportCSV = (trip: any, seats: any[]) => {
    const passengersOnly = seats.filter(s => s.passenger);
    
    // Header section
    let csvContent = "\uFEFF"; // UTF-8 BOM
    csvContent += "Пассажирская ведомость рейса\r\n";
    csvContent += `Маршрут;${trip.routeName}\r\n`;
    csvContent += `Автобус;${trip.busPlateNumber}\r\n`;
    csvContent += `Отправление;${dayjs(trip.departureTime).format("DD.MM.YYYY HH:mm")}\r\n`;
    csvContent += `Прибытие;${dayjs(trip.arrivalTime).format("DD.MM.YYYY HH:mm")}\r\n`;
    csvContent += `Автопарк;${trip.carrierName || "—"}\r\n`;
    csvContent += `Дата выгрузки;${dayjs().format("DD.MM.YYYY HH:mm")}\r\n\r\n`;
    
    // Table Columns
    csvContent += "Место;Фамилия;Имя;Отчество;ИИН;Тип документа;Номер документа;Телефон;Номер билета;Стоимость (KZT);Кем куплен;Статус\r\n";
    
    // Rows
    passengersOnly.forEach(s => {
      const p = s.passenger;
      const docTypeStr = p.documentType === "passport" ? "Удостоверение" : p.documentType === "foreign_passport" ? "Паспорт" : p.documentType || "—";
      const agentName = p.buyerEmail === "manual@beket.kz" 
        ? (p.createdByName ? `Агент ${p.createdByName}` : "Касса / Агент")
        : "Покупатель (Сайт)";
      
      csvContent += `${s.seatNumber};${p.lastName || ""};${p.firstName || ""};${p.middleName || ""};${p.iin || ""};${docTypeStr};${p.documentNumber || ""};${p.buyerPhone || ""};${p.ticketNumber || ""};${s.price || 0};${agentName};${s.status === "Booked" ? "Продано" : "Забронировано"}\r\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const safeRouteName = trip.routeName.replace(/[^a-zA-Z0-9а-яА-Я]/g, "_");
    const filename = `ведомость_${safeRouteName}_${dayjs(trip.departureTime).format("YYYYMMDD_HHmm")}.csv`;

    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Printable HTML Window Trigger
  const handlePrint = (trip: any, seats: any[]) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const passengersOnly = seats.filter(s => s.passenger);
    const rowsHtml = passengersOnly.map(s => {
      const p = s.passenger;
      const docTypeStr = p.documentType === "passport" ? "Удост." : p.documentType === "foreign_passport" ? "Паспорт" : p.documentType || "—";
      const agentName = p.buyerEmail === "manual@beket.kz" 
        ? (p.createdByName ? `Агент ${p.createdByName}` : "Касса / Агент")
        : "Покупатель (Сайт)";
      
      return `
        <tr>
          <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">${s.seatNumber}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px;">${p.lastName || ""} ${p.firstName || ""} ${p.middleName || ""}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">${p.iin || "—"}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px;">${docTypeStr} №${p.documentNumber || "—"}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px;">${p.buyerPhone || "—"}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">${p.ticketNumber || "—"}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: right;">${s.price || 0} ₸</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px;">${agentName}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">${s.status === "Booked" ? "Продано" : "Забронировано"}</td>
        </tr>
      `;
    }).join("");

    const content = `
      <html>
        <head>
          <title>Пассажирская ведомость рейса</title>
          <style>
            body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 20px; color: #1e293b; }
            .header { margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; }
            .title { margin: 0 0 10px 0; font-size: 22px; font-weight: bold; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; font-size: 13px; }
            .meta-item { margin-bottom: 5px; }
            .meta-label { color: #64748b; font-weight: 500; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
            th { background-color: #f1f5f9; border: 1px solid #cbd5e1; padding: 8px; text-align: left; font-weight: 600; }
            td { border: 1px solid #cbd5e1; padding: 8px; }
            .summary { margin-top: 20px; text-align: right; font-weight: bold; font-size: 13px; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">ПАССАЖИРСКАЯ ВЕДОМОСТЬ РЕЙСА</div>
            <div class="meta-grid">
              <div>
                <div class="meta-item"><span class="meta-label">Маршрут:</span> <strong>${trip.routeName}</strong></div>
                <div class="meta-item"><span class="meta-label">Автобус:</span> <strong>${trip.busPlateNumber}</strong></div>
                <div class="meta-item"><span class="meta-label">Автопарк:</span> <strong>${trip.carrierName || "—"}</strong></div>
              </div>
              <div>
                <div class="meta-item"><span class="meta-label">Отправление:</span> <strong>${dayjs(trip.departureTime).format("DD.MM.YYYY HH:mm")}</strong></div>
                <div class="meta-item"><span class="meta-label">Прибытие:</span> <strong>${dayjs(trip.arrivalTime).format("DD.MM.YYYY HH:mm")}</strong></div>
                <div class="meta-item"><span class="meta-label">Дата печати:</span> <strong>${dayjs().format("DD.MM.YYYY HH:mm")}</strong></div>
              </div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 40px; text-align: center;">Место</th>
                <th>ФИО пассажира</th>
                <th style="width: 90px; text-align: center;">ИИН</th>
                <th style="width: 130px;">Документ</th>
                <th style="width: 100px;">Телефон</th>
                <th style="width: 80px; text-align: center;">Билет</th>
                <th style="width: 70px; text-align: right;">Стоимость</th>
                <th style="width: 130px;">Кем куплен</th>
                <th style="width: 80px; text-align: center;">Статус</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || '<tr><td colspan="9" style="text-align: center; padding: 20px; color: #64748b;">Пассажиры отсутствуют</td></tr>'}
            </tbody>
          </table>
          <div class="summary">
            Итого пассажиров: ${passengersOnly.length} | Общая сумма продаж: ${passengersOnly.reduce((acc, s) => acc + (s.price || 0), 0)} ₸
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
  };

  const columns = [
    {
      title: "Маршрут",
      key: "routeName",
      render: (_: any, record: any) => {
        const name = record.routeName || "";
        const parts = name.split(" → ");
        if (parts.length < 2) return <Text strong style={{ fontSize: 13 }}>{name}</Text>;
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 1, lineHeight: "1.2", minWidth: 150 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{parts[0]}</span>
            <span style={{ fontSize: 10, color: "#94a3b8", display: "inline-block", margin: "2px 0 2px 4px" }}>↓</span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{parts[1]}</span>
          </div>
        );
      }
    },
    ...(!profileCarrierId ? [
      {
        title: "Автопарк",
        dataIndex: "carrierName",
        key: "carrierName",
        render: (_: any, record: any) => {
          const name = record.carrierName || record.CarrierName;
          return name ? <span style={{ fontSize: 13 }}>{name}</span> : <Text type="secondary" style={{ fontSize: 13 }}>—</Text>;
        }
      }
    ] : []),
    {
      title: "Автобус",
      key: "busPlateNumber",
      render: (_: any, record: any) => {
        const bs = buses.find(b => b.id === record.busId);
        return bs ? (
          <Tag color="purple" style={{ fontSize: 11, padding: "0 6px", margin: 0 }}>
            {bs.plateNumber}
          </Tag>
        ) : (
          <Tag color="default" style={{ fontSize: 11, padding: "0 6px", margin: 0 }}>
            {record.busPlateNumber}
          </Tag>
        );
      }
    },
    {
      title: "Отправление",
      dataIndex: "departureTime",
      key: "departureTime",
      render: (val: string) => <span style={{ fontSize: 13 }}>{dayjs(val).format("DD.MM.YYYY HH:mm")}</span>
    },
    {
      title: "Прибытие",
      dataIndex: "arrivalTime",
      key: "arrivalTime",
      render: (val: string) => <span style={{ fontSize: 13 }}>{dayjs(val).format("DD.MM.YYYY HH:mm")}</span>
    },
    {
      title: "Продано мест",
      key: "bookedSeats",
      render: (_: any, record: any) => {
        const total = record.totalSeats || 0;
        const booked = record.bookedSeats || 0;
        return (
          <Tag color={booked > 0 ? "blue" : "default"} style={{ fontSize: 11, padding: "0 6px", margin: 0 }}>
            {booked} из {total}
          </Tag>
        );
      }
    },
    {
      title: "Стоимость билета",
      dataIndex: "price",
      key: "price",
      render: (val: number) => <span style={{ fontSize: 13, fontWeight: "bold" }}>{val} ₸</span>
    },
    {
      title: "Статус",
      key: "status",
      render: () => <Tag color="default" style={{ fontSize: 11, margin: 0 }}>Завершен</Tag>
    },
    {
      title: "Действия",
      key: "action",
      width: 80,
      align: "center" as const,
      render: (_: any, record: any) => (
        <Tooltip title="Ведомость пассажиров">
          <Button
            type="primary"
            ghost
            shape="circle"
            size="small"
            icon={<TeamOutlined style={{ fontSize: 12 }} />}
            onClick={() => openPassengerModal(record)}
          />
        </Tooltip>
      )
    }
  ];

  // Passenger Modal columns
  const passengerColumns = [
    {
      title: "Место",
      dataIndex: "seatNumber",
      key: "seatNumber",
      width: 60,
      render: (text: string) => <Tag color="blue" style={{ fontSize: 12, margin: 0 }}>{text}</Tag>,
      sorter: (a: any, b: any) => Number(a.seatNumber) - Number(b.seatNumber)
    },
    {
      title: "ФИО пассажира",
      key: "name",
      render: (_: any, record: any) => {
        const p = record.passenger;
        if (!p) return <Text type="secondary" style={{ fontSize: 13 }}>—</Text>;
        const isOnline = p.buyerEmail !== "manual@beket.kz";
        return (
          <div>
            <Text strong style={{ fontSize: 13 }}>{p.lastName || ""} {p.firstName || ""} {p.middleName || ""}</Text>
            {isOnline && <Tag color="blue" style={{ marginLeft: 6, fontSize: 10, padding: "0 4px" }}>Сайт</Tag>}
          </div>
        );
      }
    },
    {
      title: "ИИН",
      key: "iin",
      width: 110,
      render: (_: any, record: any) => {
        const p = record.passenger;
        if (!p || !p.iin) return <Text type="secondary" style={{ fontSize: 13 }}>—</Text>;
        return <span style={{ fontSize: 13 }}>{p.iin}</span>;
      }
    },
    {
      title: "Документ",
      key: "document",
      width: 150,
      render: (_: any, record: any) => {
        const p = record.passenger;
        if (!p) return <Text type="secondary" style={{ fontSize: 13 }}>—</Text>;
        const docTypeStr = p.documentType === "passport" ? "Удост." : p.documentType === "foreign_passport" ? "Паспорт" : p.documentType || "—";
        return <span style={{ fontSize: 13 }}>{docTypeStr} №{p.documentNumber}</span>;
      }
    },
    {
      title: "Телефон",
      key: "phone",
      width: 120,
      render: (_: any, record: any) => {
        const p = record.passenger;
        if (!p || !p.buyerPhone) return <Text type="secondary" style={{ fontSize: 13 }}>—</Text>;
        return <a href={`tel:${p.buyerPhone}`} style={{ color: "#2563eb", fontWeight: "bold", fontSize: 13 }}>{p.buyerPhone}</a>;
      }
    },
    {
      title: "Билет",
      key: "ticket",
      width: 100,
      render: (_: any, record: any) => {
        const p = record.passenger;
        if (!p) return <Text type="secondary" style={{ fontSize: 13 }}>—</Text>;
        return <Tag color="purple" style={{ fontSize: 11, margin: 0 }}>{p.ticketNumber || "—"}</Tag>;
      }
    },
    {
      title: "Стоимость",
      dataIndex: "price",
      key: "price",
      width: 90,
      render: (val: number) => <span style={{ fontSize: 13 }}>{val} ₸</span>
    },
    {
      title: "Кем куплен",
      key: "createdByName",
      width: 140,
      render: (_: any, record: any) => {
        const p = record.passenger;
        if (!p) return <Text type="secondary" style={{ fontSize: 12 }}>Покупатель (Сайт)</Text>;
        const isManual = p.buyerEmail === "manual@beket.kz";
        if (!isManual) return <Tag color="cyan" style={{ fontSize: 11, margin: 0 }}>Покупатель (Сайт)</Tag>;
        if (p.createdByName) return <Tag color="purple" style={{ fontSize: 11, margin: 0 }}>Агент {p.createdByName}</Tag>;
        return <Tag color="default" style={{ fontSize: 11, margin: 0 }}>Касса / Агент</Tag>;
      }
    },
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      width: 90,
      render: (status: string) => (
        <Tag color={status === "Booked" ? "success" : "warning"} style={{ fontSize: 11, margin: 0 }}>
          {status === "Booked" ? "Продано" : "Бронь"}
        </Tag>
      )
    }
  ];

  const passengersOnly = seatsData.filter(s => s.passenger);

  return (
    <Card
      className={styles.glassCard}
      title={<Title level={4} style={{ margin: 0 }}>История рейсов (Завершенные)</Title>}
    >
      <Flex gap={12} style={{ marginBottom: 20 }} wrap="wrap" align="center">
        <Input
          placeholder="Поиск рейса / станции"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 220 }}
          onPressEnter={handleSearch}
        />
        {!profileCarrierId && (
          <Input
            placeholder="Автопарк"
            value={searchCarrier}
            onChange={e => setSearchCarrier(e.target.value)}
            style={{ width: 180 }}
            onPressEnter={handleSearch}
          />
        )}
        <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>Найти</Button>
        <Button icon={<UndoOutlined />} onClick={handleReset}>Сбросить</Button>
      </Flex>

      <Table
        dataSource={trips}
        columns={columns}
        rowKey="id"
        loading={loading}
        bordered
        size="small"
        scroll={{ x: "max-content" }}
        pagination={{ pageSize: 8 }}
      />

      {/* Passenger Manifest Modal */}
      <Modal
        title={
          selectedTrip ? (
            <div style={{ paddingBottom: 10 }}>
              <Title level={4} style={{ margin: 0 }}>Пассажирская ведомость</Title>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Рейс: {selectedTrip.routeName} | Отправление: {dayjs(selectedTrip.departureTime).format("DD.MM.YYYY HH:mm")}
              </Text>
            </div>
          ) : ""
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button 
            key="print" 
            icon={<PrinterOutlined />} 
            onClick={() => handlePrint(selectedTrip, seatsData)}
            disabled={passengersOnly.length === 0}
          >
            Печать ведомости
          </Button>,
          <Button 
            key="csv" 
            type="primary" 
            icon={<DownloadOutlined />} 
            onClick={() => handleExportCSV(selectedTrip, seatsData)}
            disabled={passengersOnly.length === 0}
          >
            Экспорт в Excel (CSV)
          </Button>,
          <Button key="close" onClick={() => setIsModalOpen(false)}>
            Закрыть
          </Button>
        ]}
        width={1200}
        destroyOnClose
      >
        {seatsLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
            <Spin size="large" tip="Загрузка списка пассажиров..." />
          </div>
        ) : (
          <Table
            dataSource={passengersOnly}
            columns={passengerColumns}
            rowKey="id"
            bordered
            size="small"
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: "Пассажиры на этом рейсе отсутствуют" }}
          />
        )}
      </Modal>
    </Card>
  );
}
