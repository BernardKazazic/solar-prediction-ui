import React from "react";
import { useTranslate } from "@refinedev/core";
import { Modal, Button, Alert, Typography, Space, message } from "antd";
import { CopyOutlined } from "@ant-design/icons";

interface TicketUrlModalProps {
  visible: boolean;
  ticketUrl?: string;
  onClose: () => void;
}

export const TicketUrlModal: React.FC<TicketUrlModalProps> = ({
  visible,
  ticketUrl,
  onClose,
}) => {
  const t = useTranslate();

  const handleCopy = () => {
    if (ticketUrl) {
      navigator.clipboard.writeText(ticketUrl);
      message.success(t("users.ticketUrl.copySuccess"));
    } else {
      message.error(t("users.ticketUrl.copyError"));
    }
  };

  return (
    <Modal
      title={t("users.ticketUrl.title")}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          {t("buttons.close", "Close")}
        </Button>,
      ]}
      maskClosable={false}
      keyboard={false}
      closable={true}
    >
      <Alert
        message={t("users.ticketUrl.warningTitle")}
        description={
          <>
            <Typography.Paragraph>
              {t("users.ticketUrl.warningDesc")}
            </Typography.Paragraph>
            <Typography.Paragraph>
              {t("users.ticketUrl.validityDesc")}
            </Typography.Paragraph>
          </>
        }
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />
      <Typography.Paragraph strong>
        {t("users.ticketUrl.label")}
      </Typography.Paragraph>
      <Space style={{ width: "100%", justifyContent: "space-between" }}>
        <Typography.Text
          code
          style={{ fontSize: "1.1em", wordBreak: "break-all" }}
        >
          {ticketUrl || t("common.notAvailable", "N/A")}
        </Typography.Text>
        <Button
          icon={<CopyOutlined />}
          onClick={handleCopy}
          disabled={!ticketUrl}
        >
          {t("buttons.copy")}
        </Button>
      </Space>
    </Modal>
  );
};
