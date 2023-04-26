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
    <Card sx={{ maxWidth: 200 }}>
      <CardActionArea>
        {volume.coverImage ? (
          <CardMedia
            component="img"
            image={`data:image/jpeg;base64,${volume.coverImage}`}
            sx={{
              objectFit: "contain",
              height: 220,
              paddingBottom: "0%",
              position: "relative",
              top: 0,
            }}
          />
        ) : (
          <CardMedia
            component="img"
            image={imageUrl}
            sx={{
              objectFit: "contain",
            }}
          />
        )}
        <CardContent sx={{ padding: 0 }}>
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
