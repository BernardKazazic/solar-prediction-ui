import { useState, useEffect, useCallback, useMemo } from "react";
import {
  useGetLocale,
  useSetLocale,
  useGetIdentity,
  useTranslate,
  useList,
} from "@refinedev/core";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import debounce from "lodash/debounce";

import {
  Dropdown,
  Input,
  Avatar,
  Typography,
  Space,
  Grid,
  Row,
  Col,
  AutoComplete,
  Layout as AntdLayout,
  Button,
  theme,
  type MenuProps,
} from "antd";
import { SearchOutlined, DownOutlined, UserOutlined } from "@ant-design/icons";

import { useConfigProvider } from "../../context";
import { IconMoon, IconSun } from "../../components/icons";
import type { Plant, LegacyModel, IIdentity } from "../../interfaces";
import { useStyles } from "./styled";

// Constants
const SEARCH_DEBOUNCE_DELAY = 300;
const AVATAR_SIZE_LARGE = 32;
const AVATAR_SIZE_SMALL = 16;
const SEARCH_MAX_WIDTH = 550;

// Component constants
const { Header: AntdHeader } = AntdLayout;
const { useToken } = theme;
const { Text } = Typography;
const { useBreakpoint } = Grid;

// Types
interface IOptionGroup {
  value: string;
  label: string | React.ReactNode;
}

interface IOptions {
  label: string | React.ReactNode;
  options: IOptionGroup[];
}

export const Header: React.FC = () => {
  // Hooks
  const { token } = useToken();
  const { styles } = useStyles();
  const { mode, setMode } = useConfigProvider();
  const { i18n } = useTranslation();
  const locale = useGetLocale();
  const changeLanguage = useSetLocale();
  const { data: user } = useGetIdentity<IIdentity>();
  const screens = useBreakpoint();
  const t = useTranslate();

  // State
  const [value, setValue] = useState<string>("");
  const [options, setOptions] = useState<IOptions[]>([]);

  // Memoized values
  const currentLocale = useMemo(() => locale(), [locale]);

  // Render functions
  const renderTitle = useCallback((title: string) => (
    <div className={styles.headerTitle}>
      <Text style={{ fontSize: "16px" }}>{title}</Text>
      <Link to={`/${title.toLowerCase()}`}>{t("search.more")}</Link>
    </div>
  ), [styles.headerTitle, t]);

  const renderItem = useCallback((title: string, imageUrl: string, link: string) => ({
    value: title,
    label: (
      <Link to={link} style={{ display: "flex", alignItems: "center" }}>
        {imageUrl && (
          <Avatar
            size={AVATAR_SIZE_LARGE}
            src={imageUrl}
            style={{ minWidth: `${AVATAR_SIZE_LARGE}px`, marginRight: "16px" }}
          />
        )}
        <Text>{title}</Text>
      </Link>
    ),
  }), []);

  // API calls
  const { refetch: refetchPlants } = useList<Plant>({
    resource: "power_plant",
    config: {
      filters: [{ field: "q", operator: "contains", value }],
    },
    queryOptions: {
      enabled: false,
      onSuccess: (data) => {
        const plantsOptionGroup = data.data.map((item) =>
          renderItem(`${item.name}`, "", `/plants/show/${item.id}`)
        );
        if (plantsOptionGroup.length > 0) {
          setOptions((prevOptions) => [
            ...prevOptions,
            {
              label: renderTitle(t("power_plant.power_plant")),
              options: plantsOptionGroup,
            },
          ]);
        }
      },
    },
  });

  const { refetch: refetchModels } = useList<LegacyModel>({
    resource: "models",
    config: {
      filters: [{ field: "q", operator: "contains", value }],
    },
    queryOptions: {
      enabled: false,
      onSuccess: (data) => {
        const modelOptionGroup = data.data.map((item) =>
          renderItem(item.model_name, "", `/models/show/${item.model_id}`)
        );
        if (modelOptionGroup.length > 0) {
          setOptions((prevOptions) => [
            ...prevOptions,
            {
              label: renderTitle(t("models.models")),
              options: modelOptionGroup,
            },
          ]);
        }
      },
    },
  });

  // Effects - Keep the original working logic
  useEffect(() => {
    setOptions([]);
    refetchPlants();
    refetchModels();
  }, [value, refetchPlants, refetchModels]);

  // Event handlers
  const handleThemeChange = useCallback(() => {
    setMode(mode === "light" ? "dark" : "light");
  }, [mode, setMode]);

  const handleLanguagePreventDefault = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  // Memoized menu items
  const menuItems: MenuProps["items"] = useMemo(() => 
    [...(i18n.languages || [])]
      .sort()
      .map((lang: string) => ({
        key: lang,
        onClick: () => changeLanguage(lang),
        icon: (
          <span style={{ marginRight: 8 }}>
            <Avatar size={AVATAR_SIZE_SMALL} src={`/images/flags/${lang}.svg`} />
          </span>
        ),
        label: lang === "en" ? "English" : "Hrvatski",
      })),
    [i18n.languages, changeLanguage]
  );

  // Memoized responsive values
  const headerSpaceSize = useMemo(() => screens.md ? 32 : 16, [screens.md]);
  const userSpaceSize = useMemo(() => screens.md ? 16 : 8, [screens.md]);
  const languageText = useMemo(() => 
    currentLocale === "en" ? "English" : "Hrvatski",
    [currentLocale]
  );

  return (
    <AntdHeader
      style={{
        backgroundColor: token.colorBgElevated,
        padding: "0 24px",
      }}
    >
      <Row
        align="middle"
        style={{
          justifyContent: screens.sm ? "space-between" : "end",
        }}
      >
        <Col xs={0} sm={8} md={12}>
          <AutoComplete
            style={{
              width: "100%",
              maxWidth: `${SEARCH_MAX_WIDTH}px`,
            }}
            options={options}
            filterOption={false}
            onSearch={debounce((value: string) => setValue(value), SEARCH_DEBOUNCE_DELAY)}
          >
            <Input
              size="large"
              placeholder={t("search.placeholder")}
              suffix={<div className={styles.inputSuffix}>/</div>}
              prefix={<SearchOutlined className={styles.inputPrefix} />}
            />
          </AutoComplete>
        </Col>
        <Col>
          <Space size={headerSpaceSize} align="center">
            <Dropdown
              menu={{
                items: menuItems,
                selectedKeys: currentLocale ? [currentLocale] : [],
              }}
            >
              <Button onClick={handleLanguagePreventDefault}>
                <Space>
                  <Text className={styles.languageSwitchText}>
                    {languageText}
                  </Text>
                  <DownOutlined className={styles.languageSwitchIcon} />
                </Space>
              </Button>
            </Dropdown>

            <Button
              className={styles.themeSwitch}
              type="text"
              icon={mode === "light" ? <IconMoon /> : <IconSun />}
              onClick={handleThemeChange}
            />

            <Space size={userSpaceSize} align="center">
              <Text ellipsis className={styles.userName}>
                {user?.name}
              </Text>
              {user ? (
                <Avatar size="large" src={user.avatar} alt={user.name} />
              ) : (
                <Avatar size="large" icon={<UserOutlined />} />
              )}
            </Space>
          </Space>
        </Col>
      </Row>
    </AntdHeader>
  );
};
