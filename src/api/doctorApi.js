import axiosClient from "./axiosClient";

export const getDoctorStats = () => axiosClient.get("/doctor/stats");
export const getDoctorAppointments = (params) =>
  axiosClient.get("/doctor/appointments", { params });
export const getTodayAppointments = () =>
  axiosClient.get("/doctor/appointments/today");
export const getUpcomingAppointments = () =>
  axiosClient.get("/doctor/appointments/upcoming");
export const updateAppointmentStatus = (id, data) =>
  axiosClient.put(`/doctor/appointments/${id}`, data);
export const addConsultationNotes = (id, data) =>
  axiosClient.put(`/doctor/appointments/${id}/notes`, data);
export const getDoctorPatients = () => axiosClient.get("/doctor/patients");
export const getPatientById = (userId) =>
  axiosClient.get(`/doctor/patients/${userId}`);
export const getPatientAppointments = (userId) =>
  axiosClient.get(`/doctor/patients/${userId}/appointments`);
export const downloadPatientReport = (id) =>
  axiosClient.get(`/doctor/appointments/${id}/report`, {
    responseType: "blob",
  });
