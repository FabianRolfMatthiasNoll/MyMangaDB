import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActionArea,
} from "@mui/material";
import { Volume } from "../../../api/models";

interface VolumeCardProps {
  volume: Volume;
}
const imageUrl = "/static/images/basic_cover.jpg";

export default function VolumeCard({ volume }: VolumeCardProps) {
  return (
    <Card
      sx={{
        minWidth: 80,
        maxWidth: 200,
        minHeight: 150,
        maxHeight: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardActionArea
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {volume.coverImage ? (
          <CardMedia
            component="img"
            image={`data:image/jpeg;base64,${volume.coverImage}`}
            sx={{
              objectFit: "contain",
              maxHeight: "100%",
            }}
          />
        ) : (
          <CardMedia
            component="img"
            image={imageUrl}
            sx={{
              objectFit: "contain",
              maxHeight: "100%",
            }}
          />
        )}
        <CardContent sx={{ padding: 0, maxHeight: "10%" }}>
          <Typography
            gutterBottom
            variant="h6"
            component="div"
            textAlign={"center"}
          >
            Volume {volume.volumeNum}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
