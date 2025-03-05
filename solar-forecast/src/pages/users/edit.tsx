import React, { useState, useEffect } from "react";
import { useDrawerForm, useSelect } from "@refinedev/antd";
import {
  Form,
  GetProp,
  Input,
  message,
  Select,
  Upload,
  UploadProps,
  Drawer,
  Grid,
  Button,
  Space,
  Switch,
} from "antd";
import { useApiUrl, useNavigation, useTranslate } from "@refinedev/core";
import { getValueFromEvent, SaveButton, DeleteButton } from "@refinedev/antd";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const getBase64 = (img: FileType, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result as string));
  reader.readAsDataURL(img);
};

const beforeUpload = (file: FileType) => {
  const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
  if (!isJpgOrPng) {
    message.error("You can only upload JPG/PNG file!");
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error("Image must smaller than 2MB!");
  }
  return isJpgOrPng && isLt2M;
};

const UserEdit: React.FC = () => {
  const { drawerProps, formProps, saveButtonProps, deleteButtonProps, id } =
    useDrawerForm({
      action: "edit",
    });

  const apiUrl = useApiUrl();
  const { list } = useNavigation();

  const { selectProps: roleSelectProps } = useSelect({
    resource: "users/roles",
    optionLabel: "label",
    optionValue: "value",
  });

  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>();

  useEffect(() => {
    if (formProps.initialValues?.avatar_url) {
      setImageUrl(formProps.initialValues.avatar_url);
    }
  }, [formProps.initialValues]);

  const handleChange: UploadProps["onChange"] = (info) => {
    if (info.file.status === "uploading") {
      setLoading(true);
      return;
    }
    if (info.file.status === "done") {
      getBase64(info.file.originFileObj as FileType, (url) => {
        setLoading(false);
        setImageUrl(url);
        formProps.form?.setFieldsValue({ avatar_url: info.file.response.url });
      });
    }
  };

  const t = useTranslate();

  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>{t("Upload")}</div>
    </button>
  );

  const breakpoint = Grid.useBreakpoint();

  return (
    <Drawer
      open
      title={t("users.editUser")}
      onClose={() => list("users")}
      width={breakpoint.sm ? "500px" : "100%"}
      extra={
        <Space>
          <Button onClick={() => list("users")}>{t("Cancel")}</Button>
          <SaveButton {...saveButtonProps} />
        </Space>
      }
    >
      <Form
        {...formProps}
        layout="vertical"
        style={{ width: "90%", margin: "auto" }}
      >
        <Form.Item
          label={t("users.fields.name")}
          name="full_name"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={t("users.fields.email")}
          name="email"
          rules={[{ required: true, type: "email" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={t("users.fields.username")}
          name="username"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={t("users.fields.role")}
          name="role"
          rules={[{ required: true }]}
        >
          <Select {...roleSelectProps} />
        </Form.Item>
        <Form.Item label={t("users.fields.active")} name="active">
          <Switch />
        </Form.Item>
        <Form.Item
          label="Avatar"
          valuePropName="fileList"
          getValueFromEvent={getValueFromEvent}
        >
          <Upload
            name="avatar"
            listType="picture-circle"
            className="avatar-uploader"
            showUploadList={false}
            action={`${apiUrl}/upload`}
            beforeUpload={beforeUpload}
            onChange={handleChange}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="avatar"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              uploadButton
            )}
          </Upload>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default UserEdit;
