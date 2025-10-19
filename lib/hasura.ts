export const hasuraConfig = {
  endpoint: process.env.NEXT_PUBLIC_HASURA_ENDPOINT || '',
  adminSecret: process.env.HASURA_ADMIN_SECRET || '',
};

export const hasuraHeaders = {
  'Content-Type': 'application/json',
  ...(hasuraConfig.adminSecret && {
    'x-hasura-admin-secret': hasuraConfig.adminSecret,
  }),
};
