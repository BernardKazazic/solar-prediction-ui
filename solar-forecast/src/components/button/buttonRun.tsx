import {
  type ButtonProps,
  Dropdown,
  message,
  Modal,
  Upload,
  UploadFile,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useTranslate } from "@refinedev/core";

type Props = {
  style?: React.CSSProperties;
  disabled?: boolean;
  children?: React.ReactNode;
  setFile: (file: any) => void;
  forecastFile?: UploadFile<any>[] | never[];
  onCustomRun: () => void;
} & ButtonProps;

export const ButtonRun = ({
  style,
  disabled,
  children,
  setFile,
  forecastFile,
  onCustomRun,
  ...props
}: Props) => {
  const [loadings, setLoadings] = useState<boolean[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const t = useTranslate();

  const enterLoading = (index: number) => {
    setIsRunning(true);
    setLoadings((prevLoadings) => {
      const newLoadings = [...prevLoadings];
      newLoadings[index] = true;
      return newLoadings;
    });

    setTimeout(() => {
      setLoadings((prevLoadings) => {
        const newLoadings = [...prevLoadings];
        newLoadings[index] = false;
        return newLoadings;
      });
      setIsRunning(false);
      message.success("Run completed");
    }, 6000);
  };

  const cancelLoading = (index: number) => {
    setIsRunning(false);
    setLoadings((prevLoadings) => {
      const newLoadings = [...prevLoadings];
      newLoadings[index] = false;
      return newLoadings;
    });
    message.info("Run canceled");
  };

  const onMenuClick = (e: any) => {
    if (e.key === "cancel") {
      cancelLoading(0);
    } else if (e.key === "1") {
      setIsModalOpen(true);
    }
  };

  const handleModalOk = () => {
    if (forecastFile?.length === 0) {
      message.error("Please upload a dataset before running.");
      return;
    }
    setIsModalOpen(false);
    onCustomRun();
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    setFile([]);
  };

  const items = isRunning
    ? [
        {
          key: "cancel",
          label: t("Cancel run"),
        },
      ]
    : [
        {
          key: "1",
          label: t("Run with custom dataset"),
          disabled: loadings[0],
        },
      ];

  return (
    <>
      <Dropdown.Button
        loading={loadings[0]}
        onClick={() => enterLoading(0)}
        type="primary"
        disabled={disabled}
        size="large"
        menu={{ items, onClick: onMenuClick }}
        {...props}
      >
        {loadings[0] ? "Running" : children}
      </Dropdown.Button>

      <Modal
        title={t("Upload custom dataset")}
        visible={isModalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={t("Run")}
        cancelText={t("Cancel")}
      >
        <Upload.Dragger
          accept=".csv"
          beforeUpload={(file) => {
            setFile([file]);
            message.success(`${file.name} selected`);
            return false;
          }}
          fileList={forecastFile}
          onRemove={() => setFile([])}
          multiple={false}
          showUploadList={{ showPreviewIcon: false, showRemoveIcon: true }}
          style={{
            marginTop: "30px",
          }}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">
            {t("Drag and drop the forecast file here or click to upload")}
          </p>
        </Upload.Dragger>
      </Modal>
    </>
  );
};
