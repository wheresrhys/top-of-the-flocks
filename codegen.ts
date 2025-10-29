import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: [
    {
      [`${process.env.NEXT_PUBLIC_HASURA_ENDPOINT}`]: {
        headers: {
          'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET || '',
        },
      },
    },
  ],
  documents: 'queries/**/*.graphql',
  generates: {
    'types/graphql.types.ts': {
      plugins: ['typescript', 'typescript-operations'],
      config: {
        scalars: {
          timestamptz: 'string',
          uuid: 'string',
          Bigdecimal: 'number',
          Boolean1: 'boolean',
          Date: 'string',
          Float32: 'number',
          Float64: 'number',
          Int16: 'number',
          Int64: 'number',
          Json: 'Record<string, unknown>',
          String1: 'string',
        },
      },
    },
    './graphql.schema.json': {
      plugins: ['introspection'],
    },
  },
};

export default config;
