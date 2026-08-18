export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const validateRequired = (val) => {
  return val !== null && val !== undefined && String(val).trim() !== '';
};
