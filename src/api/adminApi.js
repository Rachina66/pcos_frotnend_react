import axiosClient from "./axiosClient";

export const getStats = () => axiosClient.get("/admin/stats");
export const getAllUsers = () => axiosClient.get("/admin/users");
export const getAllDoctors = () => axiosClient.get("/admin/doctors");
export const createDoctor = (data) => axiosClient.post("/admin/doctors", data);
export const updateDoctor = (id, data) =>
  axiosClient.put(`/admin/doctors/${id}`, data);
export const deleteDoctor = (id) => axiosClient.delete(`/admin/doctors/${id}`);
export const getAllContent = () => axiosClient.get("/admin/content");
export const createContent = (data) => axiosClient.post("/admin/content", data);
export const updateContent = (id, data) =>
  axiosClient.put(`/admin/content/${id}`, data);
export const deleteContent = (id) => axiosClient.delete(`/admin/content/${id}`);
export const getAllAppointments = () => axiosClient.get("/admin/appointments");
export const getAppointmentById = (id) =>
  axiosClient.get(`/admin/appointments/${id}`);
export const registerDoctorAccount = (data) =>
  axiosClient.post("/auth/register-doctor", data);
