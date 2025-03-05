import { CreateButton, List } from "@refinedev/antd";
import { AllPlantsMap, PlantListTable } from "../../components";
import { Flex, Segmented } from "antd";
import { useState } from "react";
import { useApiUrl, useCustom, useTranslate } from "@refinedev/core";
import { EnvironmentOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { IPlantMapItem } from "../../interfaces";

type View = "table" | "map";

export const PlantList = () => {
  const [view, setView] = useState<View>(
    (localStorage.getItem("plant-view") as View) || "table"
  );

  const handleViewChange = (value: View) => {
    setView(value);
    localStorage.setItem("plant-view", value);
  };

  const t = useTranslate();
  const API_URL = useApiUrl();

  const { data: mapData } = useCustom({
    url: `${API_URL}/dashboard/plant_overview`,
    method: "get",
  });

  return (
    <>
      <List
        breadcrumb={false}
        headerButtons={(props) => [
          <Segmented<View>
            key="view"
            size="large"
            value={view}
            style={{ marginRight: 24 }}
            options={[
              {
                label: "",
                value: "table",
                icon: <UnorderedListOutlined />,
              },
              {
                label: "",
                value: "map",
                icon: <EnvironmentOutlined />,
              },
            ]}
            onChange={handleViewChange}
          />,
          <CreateButton {...props.createButtonProps} key="create" size="middle">
            {t("plants.addNewPlant")}
          </CreateButton>,
        ]}
      >
        {view === "table" && <PlantListTable />}
        {view === "map" && (
          <Flex
            style={{
              height: "calc(100dvh - 290px)",
              marginTop: "32px",
            }}
          >
            <AllPlantsMap data={mapData?.data as IPlantMapItem[]} />
          </Flex>
        )}
      </List>
    </>
  );
};
