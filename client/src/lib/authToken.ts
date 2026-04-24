let currentAccessToken: string | null = null;

export function setAuthAccessToken(token: string | null) {
  currentAccessToken = token;
}

export function getAuthAccessToken() {
  return currentAccessToken;
}
