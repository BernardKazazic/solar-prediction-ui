import { Rate } from "antd";
import type { Model } from "../../../interfaces";

type Props = {
  model?: Model;
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
