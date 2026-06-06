export const resolvePatientIdFromUser = async (api, user) => {
  if (!user) return null;
  const searchTerm = user.phone || user.email;
  if (!searchTerm) return null;

  const { data: searchResponse } = await api.get(`/patients/search?q=${encodeURIComponent(searchTerm)}`);
  const patients = searchResponse.data || [];
  return (
    patients.find(
      (p) =>
        (user.email && p.email?.toLowerCase() === user.email.toLowerCase()) ||
        (user.phone && p.phone === user.phone)
    )?._id || null
  );
};
