import { useState, useEffect } from "react";
import { Button, Card, Flex, Table, Tag, Typography, Input, Modal, Form, Select, InputNumber, Row, Col, Space, Popconfirm, message, Tabs, Tooltip } from "antd";
import { PlusOutlined, DeleteOutlined, SettingOutlined, EyeOutlined, LayoutOutlined } from "@ant-design/icons";
import { authApi } from "@/shared/api";
import styles from "../ui/CarrierDashboardPage.module.scss";

const { Title, Text } = Typography;

export function BusConfigSection() {
  const [activeTab, setActiveTab] = useState("brands-models");

  // Brands and Models states
  const [brands, setBrands] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [schemes, setSchemes] = useState<any[]>([]);
  const [seatTypes, setSeatTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Modals visibility
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [isSchemeModalOpen, setIsSchemeModalOpen] = useState(false);

  // Form instances
  const [brandForm] = Form.useForm();
  const [modelForm] = Form.useForm();
  const [schemeForm] = Form.useForm();

  // Visual Editor states
  const [rows, setRows] = useState(10);
  const [cols, setCols] = useState(4);
  const [editorGrid, setEditorGrid] = useState<any[][]>([]);
  const [previewScheme, setPreviewScheme] = useState<any | null>(null);
  const [previewSeats, setPreviewSeats] = useState<any[]>([]);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bRes, mRes, sRes, tRes] = await Promise.all([
        authApi.get("/api/v1/carrier/bus-config/brands"),
        authApi.get("/api/v1/carrier/bus-config/models"),
        authApi.get("/api/v1/carrier/bus-config/schemes"),
        authApi.get("/api/v1/carrier/bus-config/seat-types")
      ]);
      setBrands(bRes.data);
      setModels(mRes.data);
      setSchemes(sRes.data);
      setSeatTypes(tRes.data);
    } catch (e) {
      console.error(e);
      message.error("Не удалось загрузить данные конфигурации.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Grid initialization helper for visual editor
  useEffect(() => {
    initializeEditorGrid(rows, cols);
  }, [rows, cols]);

  const initializeEditorGrid = (r: number, c: number) => {
    const grid: any[][] = [];
    for (let i = 0; i < r; i++) {
      const rowArr: any[] = [];
      for (let j = 0; j < c; j++) {
        // Default layout template helper:
        // Column 2 (0-indexed) is typically aisle (проход), except back row
        // Driver top left corner (row 0, col 0)
        // Door bottom right corner (row 0, col c-1)
        let code = "seat";
        if (i === 0 && j === 0) code = "driver";
        else if (i === 0 && j === c - 1) code = "door";
        else if (j === Math.floor(c / 2) && i < r - 1) code = "aisle";

        rowArr.push({
          row: i,
          column: j,
          cellTypeCode: code,
          number: ""
        });
      }
      grid.push(rowArr);
    }
    recalculateSeatNumbers(grid);
  };

  const recalculateSeatNumbers = (grid: any[][]) => {
    let seatNum = 1;
    const updated = grid.map(row => 
      row.map(cell => {
        if (cell.cellTypeCode === "seat") {
          const num = String(seatNum++);
          return { ...cell, number: num };
        }
        return { ...cell, number: "" };
      })
    );
    setEditorGrid(updated);
  };

  // Manage cell click in editor
  const handleCellClick = (rowIndex: number, colIndex: number) => {
    const grid = [...editorGrid];
    const cell = grid[rowIndex][colIndex];
    
    // Cycle cell types: seat -> aisle -> wc -> door -> driver -> empty -> seat
    const cycle = ["seat", "aisle", "wc", "door", "driver", "empty"];
    const currentIndex = cycle.indexOf(cell.cellTypeCode);
    const nextIndex = (currentIndex + 1) % cycle.length;
    cell.cellTypeCode = cycle[nextIndex];
    
    recalculateSeatNumbers(grid);
  };

  // Action methods
  const handleAddBrand = async (values: any) => {
    try {
      await authApi.post("/api/v1/carrier/bus-config/brands", values);
      message.success("Марка успешно добавлена.");
      brandForm.resetFields();
      setIsBrandModalOpen(false);
      fetchData();
    } catch (e: any) {
      message.error(e.response?.data || "Ошибка добавления марки.");
    }
  };

  const handleDeleteBrand = async (id: string) => {
    try {
      await authApi.delete(`/api/v1/carrier/bus-config/brands/${id}`);
      message.success("Марка удалена.");
      fetchData();
    } catch (e: any) {
      message.error(e.response?.data || "Ошибка удаления марки.");
    }
  };

  const handleAddModel = async (values: any) => {
    try {
      await authApi.post("/api/v1/carrier/bus-config/models", values);
      message.success("Модель успешно добавлена.");
      modelForm.resetFields();
      setIsModelModalOpen(false);
      fetchData();
    } catch (e: any) {
      message.error(e.response?.data || "Ошибка добавления модели.");
    }
  };

  const handleDeleteModel = async (id: string) => {
    try {
      await authApi.delete(`/api/v1/carrier/bus-config/models/${id}`);
      message.success("Модель удалена.");
      fetchData();
    } catch (e: any) {
      message.error(e.response?.data || "Ошибка удаления модели.");
    }
  };

  const handleAddScheme = async (values: any) => {
    const flatSeats: any[] = [];
    editorGrid.forEach(row => {
      row.forEach(cell => {
        flatSeats.push({
          number: cell.number || null,
          row: cell.row,
          column: cell.column,
          cellTypeCode: cell.cellTypeCode,
          isWindow: cell.column === 0 || cell.column === cols - 1
        });
      });
    });

    const body = {
      name: values.name,
      row: rows,
      column: cols,
      seatTypeId: values.seatTypeId,
      seats: flatSeats
    };

    try {
      await authApi.post("/api/v1/carrier/bus-config/schemes", body);
      message.success("Схема мест успешно создана.");
      schemeForm.resetFields();
      setIsSchemeModalOpen(false);
      fetchData();
    } catch (e: any) {
      message.error(e.response?.data || "Ошибка сохранения схемы мест.");
    }
  };

  const handleDeleteScheme = async (id: string) => {
    try {
      await authApi.delete(`/api/v1/carrier/bus-config/schemes/${id}`);
      message.success("Схема мест удалена.");
      fetchData();
    } catch (e: any) {
      message.error(e.response?.data || "Ошибка удаления схемы.");
    }
  };

  const handlePreviewScheme = async (scheme: any) => {
    setPreviewScheme(scheme);
    try {
      const res = await authApi.get(`/api/v1/carrier/bus-config/schemes/${scheme.id}/seats`);
      setPreviewSeats(res.data);
      setIsPreviewModalOpen(true);
    } catch (e) {
      message.error("Не удалось загрузить ячейки схемы.");
    }
  };

  // Render Premium Graphical Bus Layout
  const renderGraphicalBus = (gridSeats: any[], rowCount: number, colCount: number, seatTypeStr?: string) => {
    const isVip = seatTypeStr?.toUpperCase() === "VIP" || seatTypeStr === "2";

    // Setup 2D layout representation array
    const layoutGrid: any[][] = [];
    for (let r = 0; r <= rowCount; r++) {
      layoutGrid[r] = new Array(colCount + 1).fill(null);
    }

    gridSeats.forEach(s => {
      if (s.row <= rowCount && s.column <= colCount) {
        layoutGrid[s.row][s.column] = s;
      }
    });

    return (
      <div style={{
        background: "#0f172a",
        borderRadius: "24px",
        padding: "24px 20px 24px 32px",
        display: "inline-block",
        border: "3px solid #334155",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
        position: "relative"
      }}>
        {/* Bus Front windshield bumper visual */}
        <div style={{
          position: "absolute",
          right: 0,
          top: "10px",
          bottom: "10px",
          width: "16px",
          background: "#1e293b",
          borderTopRightRadius: "12px",
          borderBottomRightRadius: "12px",
          borderLeft: "4px solid #3b82f6"
        }} />

        {/* Bus columns wrapper (rendered horizontally: front is right side, rear is left side) */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {[...layoutGrid].reverse().map((rowCells, rIdx) => (
            <div key={rIdx} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {rowCells.map((cell, cIdx) => {
                if (!cell) {
                  return <div key={`null-${rIdx}-${cIdx}`} style={{ width: 40, height: 40 }} />;
                }

                const code = cell.cellTypeCode || cell.CellTypeCode;
                if (code === "aisle" || code === "empty") {
                  return <div key={`aisle-${rIdx}-${cIdx}`} style={{ width: 40, height: 40 }} />;
                }

                if (code === "driver") {
                  return (
                    <div
                      key={`driver-${rIdx}-${cIdx}`}
                      style={{
                        width: 40,
                        height: 40,
                        background: "#334155",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid #475569",
                        color: "#94a3b8"
                      }}
                    >
                      <Tooltip title="Водитель">
                        <div style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          border: "3px dashed #94a3b8",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#94a3b8" }} />
                        </div>
                      </Tooltip>
                    </div>
                  );
                }

                if (code === "door") {
                  return (
                    <div
                      key={`door-${rIdx}-${cIdx}`}
                      style={{
                        width: 40,
                        height: 40,
                        background: "#15803d",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid #166534",
                        color: "#fff",
                        fontSize: 10,
                        fontWeight: "bold"
                      }}
                    >
                      EXIT
                    </div>
                  );
                }

                if (code === "wc") {
                  return (
                    <div
                      key={`wc-${rIdx}-${cIdx}`}
                      style={{
                        width: 40,
                        height: 40,
                        background: "#7f1d1d",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid #991b1b",
                        color: "#fca5a5",
                        fontSize: 11,
                        fontWeight: "bold"
                      }}
                    >
                      WC
                    </div>
                  );
                }

                // Standard or VIP seats
                const seatBg = isVip
                  ? "linear-gradient(135deg, #eab308 0%, #ca8a04 100%)"
                  : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)";
                const borderClr = isVip ? "#ca8a04" : "#1d4ed8";

                return (
                  <div
                    key={`seat-${rIdx}-${cIdx}`}
                    style={{
                      width: 40,
                      height: 40,
                      background: seatBg,
                      borderRadius: "8px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      border: `1px solid ${borderClr}`,
                      boxShadow: "inset 0 2px 4px rgba(255,255,255,0.2), 0 4px 6px rgba(0,0,0,0.15)",
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: "bold",
                      position: "relative"
                    }}
                  >
                    <span>{cell.number || cell.Number}</span>
                    {/* Visual seat cushion lines */}
                    <div style={{
                      position: "absolute",
                      bottom: 4,
                      left: 6,
                      right: 6,
                      height: "4px",
                      background: "rgba(255,255,255,0.3)",
                      borderRadius: "2px"
                    }} />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Columns configurations
  const brandColumns = [
    {
      title: "Наименование марки",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <Text strong style={{ fontSize: 14 }}>{text}</Text>
    },
    {
      title: "Действия",
      key: "actions",
      width: 100,
      render: (_: any, record: any) => (
        <Popconfirm
          title="Вы уверены, что хотите удалить эту марку?"
          onConfirm={() => handleDeleteBrand(record.id)}
          okText="Да"
          cancelText="Нет"
        >
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      )
    }
  ];

  const modelColumns = [
    {
      title: "Марка",
      dataIndex: "brandName",
      key: "brandName",
      render: (text: string) => <span style={{ fontSize: 13 }}>{text}</span>
    },
    {
      title: "Модель",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <Text strong style={{ fontSize: 13 }}>{text}</Text>
    },
    {
      title: "Схема мест",
      dataIndex: "seatSchemeName",
      key: "seatSchemeName",
      render: (text: string, record: any) => (
        <div>
          <Tag color="blue">{text || "—"}</Tag>
          <Text type="secondary" style={{ fontSize: 11, marginLeft: 6 }}>({record.seatCount} мест)</Text>
        </div>
      )
    },
    {
      title: "Действия",
      key: "actions",
      width: 100,
      render: (_: any, record: any) => (
        <Popconfirm
          title="Вы уверены, что хотите удалить эту модель?"
          onConfirm={() => handleDeleteModel(record.id)}
          okText="Да"
          cancelText="Нет"
        >
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      )
    }
  ];

  const schemeColumns = [
    {
      title: "Название схемы",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <Text strong style={{ fontSize: 13 }}>{text}</Text>
    },
    {
      title: "Размерность сетки",
      key: "gridSize",
      render: (_: any, record: any) => (
        <span style={{ fontSize: 13 }}>{record.row} рядов × {record.column} колонок</span>
      )
    },
    {
      title: "Количество мест",
      dataIndex: "count",
      key: "count",
      render: (count: number, record: any) => (
        <Tag color={record.seatTypeName === "2" ? "gold" : "blue"} style={{ fontSize: 12 }}>
          {count} {record.seatTypeName === "2" ? "VIP" : "Стандарт"}
        </Tag>
      )
    },
    {
      title: "Действия",
      key: "actions",
      width: 150,
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="primary"
            ghost
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handlePreviewScheme(record)}
          >
            Схема
          </Button>
          <Popconfirm
            title="Вы уверены, что хотите удалить эту схему?"
            onConfirm={() => handleDeleteScheme(record.id)}
            okText="Да"
            cancelText="Нет"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const tabItems = [
    {
      key: "brands-models",
      label: (
        <span>
          <SettingOutlined />
          Марки и Модели
        </span>
      ),
      children: (
        <Row gutter={[24, 24]}>
          <Col xs={24} md={10}>
            <Card
              className={styles.glassCard}
              title={<Title level={5} style={{ margin: 0 }}>Марки автобусов</Title>}
              extra={
                <Button
                  type="primary"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => setIsBrandModalOpen(true)}
                >
                  Марка
                </Button>
              }
            >
              <Table
                dataSource={brands}
                columns={brandColumns}
                rowKey="id"
                loading={loading}
                size="small"
                bordered
                pagination={{ pageSize: 6 }}
              />
            </Card>
          </Col>

          <Col xs={24} md={14}>
            <Card
              className={styles.glassCard}
              title={<Title level={5} style={{ margin: 0 }}>Модели автобусов</Title>}
              extra={
                <Button
                  type="primary"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => setIsModelModalOpen(true)}
                >
                  Модель
                </Button>
              }
            >
              <Table
                dataSource={models}
                columns={modelColumns}
                rowKey="id"
                loading={loading}
                size="small"
                bordered
                pagination={{ pageSize: 6 }}
              />
            </Card>
          </Col>
        </Row>
      )
    },
    {
      key: "schemes",
      label: (
        <span>
          <LayoutOutlined />
          Схемы мест
        </span>
      ),
      children: (
        <Card
          className={styles.glassCard}
          title={<Title level={5} style={{ margin: 0 }}>Шаблоны схем расположения мест</Title>}
          extra={
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => setIsSchemeModalOpen(true)}
            >
              Создать схему
            </Button>
          }
        >
          <Table
            dataSource={schemes}
            columns={schemeColumns}
            rowKey="id"
            loading={loading}
            size="small"
            bordered
            pagination={{ pageSize: 6 }}
          />
        </Card>
      )
    }
  ];

  return (
    <div>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

      {/* Add Brand Modal */}
      <Modal
        title="Добавить новую марку"
        open={isBrandModalOpen}
        onCancel={() => setIsBrandModalOpen(false)}
        onOk={() => brandForm.submit()}
        destroyOnClose
      >
        <Form form={brandForm} layout="vertical" onFinish={handleAddBrand}>
          <Form.Item
            name="name"
            label="Название марки (например: Mercedes-Benz, Setra, Yutong)"
            rules={[{ required: true, message: "Введите название марки" }]}
          >
            <Input placeholder="Введите название..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Model Modal */}
      <Modal
        title="Добавить новую модель"
        open={isModelModalOpen}
        onCancel={() => setIsModelModalOpen(false)}
        onOk={() => modelForm.submit()}
        destroyOnClose
      >
        <Form form={modelForm} layout="vertical" onFinish={handleAddModel}>
          <Form.Item
            name="brandId"
            label="Марка автобуса"
            rules={[{ required: true, message: "Выберите марку" }]}
          >
            <Select placeholder="Выберите марку из списка...">
              {brands.map(b => (
                <Select.Option key={b.id} value={b.id}>{b.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="name"
            label="Название модели (например: Tourismo, ZK6122H9)"
            rules={[{ required: true, message: "Введите название модели" }]}
          >
            <Input placeholder="Введите название..." />
          </Form.Item>

          <Form.Item
            name="seatSchemeId"
            label="Шаблон схемы мест"
            rules={[{ required: true, message: "Выберите схему мест" }]}
          >
            <Select placeholder="Выберите схему мест...">
              {schemes.map(s => (
                <Select.Option key={s.id} value={s.id}>{s.name} ({s.count} мест)</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Scheme Modal (Interactive Visual Editor) */}
      <Modal
        title="Создание интерактивной схемы мест"
        open={isSchemeModalOpen}
        onCancel={() => setIsSchemeModalOpen(false)}
        onOk={() => schemeForm.submit()}
        width={1000}
        destroyOnClose
      >
        <Form form={schemeForm} layout="vertical" onFinish={handleAddScheme}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="name"
                label="Название шаблона схемы"
                rules={[{ required: true, message: "Введите название схемы" }]}
              >
                <Input placeholder="Например: 49 мест стандарт" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="seatTypeId"
                label="Класс мест (сидений)"
                rules={[{ required: true, message: "Выберите тип сидений" }]}
              >
                <Select placeholder="Класс сидений...">
                  {seatTypes.map(t => (
                    <Select.Option key={t.id} value={t.id}>{t.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="Рядов (длина)">
                <InputNumber min={3} max={18} value={rows} onChange={val => setRows(val || 10)} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="Колонок (ширина)">
                <InputNumber min={2} max={6} value={cols} onChange={val => setCols(val || 4)} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>

        <hr style={{ border: "0.5px solid #cbd5e1", margin: "16px 0" }} />

        <div>
          <Title level={5} style={{ marginTop: 0 }}>Интерактивный конструктор сетки мест</Title>
          <Text type="secondary" style={{ display: "block", marginBottom: 12 }}>
            Кликайте на ячейки сетки, чтобы изменить их назначение. Подсказка: сетка отображает автобус горизонтально (водитель слева сверху, проход по центру).
          </Text>

          <Flex gap={12} wrap="wrap" style={{ marginBottom: 16 }}>
            <Tag color="blue" style={{ padding: "4px 8px" }}>Кресло (Место)</Tag>
            <Tag style={{ padding: "4px 8px", background: "#334155", color: "#94a3b8" }}>Проход / Водитель</Tag>
            <Tag color="success" style={{ padding: "4px 8px" }}>EXIT (Дверь)</Tag>
            <Tag color="error" style={{ padding: "4px 8px" }}>WC (Туалет)</Tag>
            <Tag style={{ padding: "4px 8px", background: "transparent", border: "1px dashed #475569" }}>Пусто</Tag>
          </Flex>

          {/* Interactive Editor Grid */}
          <div style={{
            background: "#0f172a",
            borderRadius: "16px",
            padding: "20px",
            overflowX: "auto",
            border: "2px solid #334155",
            textAlign: "center"
          }}>
            <div style={{ display: "inline-flex", gap: "8px" }}>
              {[...editorGrid].reverse().map((rowCells, rIdx) => (
                <div key={rIdx} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {rowCells.map((cell, cIdx) => {
                    const code = cell.cellTypeCode;
                    let bg = "transparent";
                    let border = "1px dashed #475569";
                    let content: any = "";
                    let color = "#fff";

                    if (code === "seat") {
                      bg = "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)";
                      border = "1px solid #1d4ed8";
                      content = cell.number;
                    } else if (code === "driver") {
                      bg = "#334155";
                      border = "1px solid #475569";
                      color = "#94a3b8";
                      content = "D";
                    } else if (code === "door") {
                      bg = "#15803d";
                      border = "1px solid #166534";
                      content = "EXIT";
                    } else if (code === "wc") {
                      bg = "#7f1d1d";
                      border = "1px solid #991b1b";
                      content = "WC";
                    } else if (code === "aisle") {
                      bg = "#1e293b";
                      border = "1px solid #334155";
                      color = "#64748b";
                      content = "—";
                    }

                    return (
                      <div
                        key={`cell-${rIdx}-${cIdx}`}
                        onClick={() => handleCellClick(rIdx, cIdx)}
                        style={{
                          width: 38,
                          height: 38,
                          background: bg,
                          border: border,
                          color: color,
                          borderRadius: "6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          fontSize: 10,
                          fontWeight: "bold",
                          userSelect: "none",
                          transition: "all 0.2s"
                        }}
                      >
                        {content}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Graphical Preview Modal */}
      <Modal
        title={previewScheme ? `Визуальная схема: ${previewScheme.name}` : "Схема мест"}
        open={isPreviewModalOpen}
        onCancel={() => setIsPreviewModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsPreviewModalOpen(false)}>
            Закрыть
          </Button>
        ]}
        width={900}
        destroyOnClose
      >
        <div style={{ textAlign: "center", padding: "30px 10px", overflowX: "auto" }}>
          {previewScheme && renderGraphicalBus(previewSeats, previewScheme.row, previewScheme.column, previewScheme.seatTypeName)}
        </div>
      </Modal>
    </div>
  );
}
