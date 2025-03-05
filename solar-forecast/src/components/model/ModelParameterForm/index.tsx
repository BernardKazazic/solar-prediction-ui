import { Form, Checkbox, Divider } from "antd";

import { CheckboxOptionType } from "antd/lib/checkbox/Group";

const ParameterForm = ({ options }: { options: CheckboxOptionType[] }) => {
  return (
    <Form.Item name="parameters">
      <Checkbox.Group options={options} />
    </Form.Item>
  );
};

export default ParameterForm;
