const DEV_TOKEN_EMAIL = "vishrutsn@gmail.com";

export function hasDevToken(email?: string | null) {
  return email?.trim().toLowerCase() === DEV_TOKEN_EMAIL;
}
