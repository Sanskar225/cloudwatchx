export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'cloudwatchx-secret-key-change-in-production',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'cloudwatchx-refresh-secret-change-in-production',
  expiresIn: '15m' as string,
  refreshExpiresIn: '7d' as string,
};