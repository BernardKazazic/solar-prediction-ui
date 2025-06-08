import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Plant } from "../../../interfaces";
type Props = {
  plant?: Plant;
};
export const PlantLocation = ({ plant }: Props) => {
  return (
    <MapContainer
      center={[44.4737849, 16.3688717]}
      zoom={6}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <TileLayer
        url="https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=523c79891a229b1a91756770f201b921"
        attribution="&copy; OpenWeatherMap"
      />

      <Marker
        key={plant?.id}
        position={[plant?.latitude ?? 0, plant?.longitude ?? 0]}
      >
        <Popup>
          <h3>{plant?.name}</h3>
          <p></p>
        </Popup>
      </Marker>
    </MapContainer>
  );
};
