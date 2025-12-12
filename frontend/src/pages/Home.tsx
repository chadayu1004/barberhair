// src/pages/Home.tsx
import React from "react";
import { Card, CardContent, Typography, Button, Stack } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export default function Home() {
  return (
    <Card className="!rounded-2xl">
      <CardContent className="p-6">
        <Typography variant="h5">Welcome to BarberHair</Typography>
        <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
          ระบบจองคิวร้านตัดผมแบบเรียลไทม์
        </Typography>

        <Stack direction="row" spacing={1} sx={{ mt: 3, flexWrap: "wrap" }} useFlexGap>
          <Button component={RouterLink} to="/login" variant="contained">
            Login
          </Button>
          <Button component={RouterLink} to="/register" variant="outlined">
            Register
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
