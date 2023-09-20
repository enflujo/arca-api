export const obtenerMensajeError = (error: any) => {
  if (error && error.message) return error.message;
  if (error && error.response && error.response.data && error.response.data.error) return error.response.data.error;
  return error.toString();
};
