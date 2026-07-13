export const randomEmail = () => {
  const randomString = Math.random().toString(36).substring(2, 10);
  return `${randomString}@example.com`;
};

export const randomUsername = () => {
  const randomString = Math.random().toString(36).substring(2, 10);
  return `user_${randomString}`;
};

export const randomPassword = () => {
  const randomString = Math.random().toString(36).substring(2, 10);
  return `pass_${randomString}`;
};
