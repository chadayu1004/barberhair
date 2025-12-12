import api from "./client";

export const getBarbers = async () => {
  const { data } = await api.get("/catalog/barbers");
  return data;
};

export const getServices = async () => {
  const { data } = await api.get("/catalog/services");
  return data;
};
