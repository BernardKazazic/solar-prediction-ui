import { Rate } from "antd";
import type { IModel } from "../../../interfaces";

type Props = {
  model?: IModel;
};

export const ModelRating = (props: Props) => {
  const starCount = props.model?.accuracy
    ? (props.model.accuracy / 100) * 5
    : 0;

  return (
    <Rate
      style={{
        minWidth: "132px",
      }}
      key="with-value"
      disabled
      allowHalf
      defaultValue={starCount}
    />
  );
};
