import { Rate } from "antd";
import type { LegacyModel } from "../../../interfaces";

type Props = {
  model?: LegacyModel;
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
