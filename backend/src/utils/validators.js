// Input validation utilities

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // At least 6 characters
  return password && password.length >= 6;
};

const validateAmount = (amount) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return typeof num === 'number' && !isNaN(num) && num > 0;
};

const validateDate = (date) => {
  return date instanceof Date && !isNaN(date);
};

module.exports = {
  validateEmail,
  validatePassword,
  validateAmount,
  validateDate
};

