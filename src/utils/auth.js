export const logout = (router) => {
  // Remove all user-related data from localStorage
  localStorage.removeItem("userToken");
  localStorage.removeItem("userType");
  localStorage.removeItem("userInfo");
  router.push({ name: "login" });
};
