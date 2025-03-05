import { FloatButton, Popover } from "antd";
import { CustomerServiceOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const ContactButton = () => {
  const handleClick = () => {
    window.location.href = "mailto:antonio.juricic@fer.hr";
  };
  const { t } = useTranslation();

  return (
    <Popover content={t("contactButton.tooltip", "Support")}>
      <FloatButton
        shape="circle"
        type="primary"
        style={{ insetInlineEnd: 50 }}
        icon={<CustomerServiceOutlined />}
        onClick={handleClick}
      />
    </Popover>
  );
};

export default ContactButton;
