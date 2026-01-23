export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Bigdecimal: { input: number; output: number; }
  Boolean1: { input: boolean; output: boolean; }
  Date: { input: string; output: string; }
  Float32: { input: number; output: number; }
  Float64: { input: number; output: number; }
  Int16: { input: number; output: number; }
  Int64: { input: number; output: number; }
  Json: { input: Record<string, unknown>; output: Record<string, unknown>; }
  String1: { input: string; output: string; }
};

/** @graphql({"aggregate": {"enabled": true}}) */
export type Birds = {
  __typename?: 'Birds';
  encounters?: Maybe<Array<Encounters>>;
  encountersAggregate: EncountersAggExp;
  id: Scalars['Int64']['output'];
  ringNo: Scalars['String1']['output'];
  species?: Maybe<Species>;
  speciesId: Scalars['Int64']['output'];
};


/** @graphql({"aggregate": {"enabled": true}}) */
export type BirdsEncountersArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<EncountersOrderByExp>>;
  where?: InputMaybe<EncountersBoolExp>;
};


/** @graphql({"aggregate": {"enabled": true}}) */
export type BirdsEncountersAggregateArgs = {
  filter_input?: InputMaybe<EncountersFilterInput>;
};

export type BirdsAggExp = {
  __typename?: 'BirdsAggExp';
  _count: Scalars['Int64']['output'];
  id: Int8AggExp;
  ringNo: TextAggExp;
  speciesId: Int8AggExp;
};

export type BirdsBoolExp = {
  _and?: InputMaybe<Array<BirdsBoolExp>>;
  _not?: InputMaybe<BirdsBoolExp>;
  _or?: InputMaybe<Array<BirdsBoolExp>>;
  encounters?: InputMaybe<EncountersBoolExp>;
  id?: InputMaybe<Int8BoolExp>;
  ringNo?: InputMaybe<TextBoolExp>;
  species?: InputMaybe<SpeciesBoolExp>;
  speciesId?: InputMaybe<Int8BoolExp>;
};

export type BirdsFilterInput = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<BirdsOrderByExp>>;
  where?: InputMaybe<BirdsBoolExp>;
};

export type BirdsOrderByExp = {
  id?: InputMaybe<OrderBy>;
  ringNo?: InputMaybe<OrderBy>;
  species?: InputMaybe<SpeciesOrderByExp>;
  speciesId?: InputMaybe<OrderBy>;
};

export type BoolAggExp = {
  __typename?: 'BoolAggExp';
  _count: Scalars['Int64']['output'];
  _count_distinct: Scalars['Int64']['output'];
  bool_and?: Maybe<Scalars['Boolean1']['output']>;
  bool_or?: Maybe<Scalars['Boolean1']['output']>;
  every?: Maybe<Scalars['Boolean1']['output']>;
};

export type BoolBoolExp = {
  _and?: InputMaybe<Array<BoolBoolExp>>;
  _eq?: InputMaybe<Scalars['Boolean1']['input']>;
  _gt?: InputMaybe<Scalars['Boolean1']['input']>;
  _gte?: InputMaybe<Scalars['Boolean1']['input']>;
  _in?: InputMaybe<Array<Scalars['Boolean1']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Boolean1']['input']>;
  _lte?: InputMaybe<Scalars['Boolean1']['input']>;
  _neq?: InputMaybe<Scalars['Boolean1']['input']>;
  _not?: InputMaybe<BoolBoolExp>;
  _or?: InputMaybe<Array<BoolBoolExp>>;
};

export type DateAggExp = {
  __typename?: 'DateAggExp';
  _count: Scalars['Int64']['output'];
  _count_distinct: Scalars['Int64']['output'];
  max?: Maybe<Scalars['Date']['output']>;
  min?: Maybe<Scalars['Date']['output']>;
};

export type DateBoolExp = {
  _and?: InputMaybe<Array<DateBoolExp>>;
  _eq?: InputMaybe<Scalars['Date']['input']>;
  _gt?: InputMaybe<Scalars['Date']['input']>;
  _gte?: InputMaybe<Scalars['Date']['input']>;
  _in?: InputMaybe<Array<Scalars['Date']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Date']['input']>;
  _lte?: InputMaybe<Scalars['Date']['input']>;
  _neq?: InputMaybe<Scalars['Date']['input']>;
  _not?: InputMaybe<DateBoolExp>;
  _or?: InputMaybe<Array<DateBoolExp>>;
};

/** Encounters with individual birds */
export type Encounters = {
  __typename?: 'Encounters';
  age: Scalars['Int16']['output'];
  bird?: Maybe<Birds>;
  birdId: Scalars['Int64']['output'];
  breedingCondition?: Maybe<Scalars['String1']['output']>;
  captureTime: Scalars['String1']['output'];
  extraText?: Maybe<Scalars['String1']['output']>;
  id: Scalars['Int64']['output'];
  isJuv: Scalars['Boolean1']['output'];
  moultCode?: Maybe<Scalars['String1']['output']>;
  oldGreaterCoverts?: Maybe<Scalars['Int16']['output']>;
  recordType: Scalars['String1']['output'];
  scheme: Scalars['String1']['output'];
  session?: Maybe<Sessions>;
  sessionId: Scalars['Int64']['output'];
  sex: Scalars['String1']['output'];
  sexingMethod?: Maybe<Scalars['String1']['output']>;
  weight?: Maybe<Scalars['Float32']['output']>;
  wingLength?: Maybe<Scalars['Int16']['output']>;
};

export type EncountersAggExp = {
  __typename?: 'EncountersAggExp';
  _count: Scalars['Int64']['output'];
  age: Int2AggExp;
  birdId: Int8AggExp;
  breedingCondition: TextAggExp;
  captureTime: TimeAggExp;
  extraText: TextAggExp;
  id: Int8AggExp;
  isJuv: BoolAggExp;
  moultCode: TextAggExp;
  oldGreaterCoverts: Int2AggExp;
  recordType: TextAggExp;
  scheme: TextAggExp;
  sessionId: Int8AggExp;
  sex: TextAggExp;
  sexingMethod: TextAggExp;
  weight: Float4AggExp;
  wingLength: Int2AggExp;
};

export type EncountersBoolExp = {
  _and?: InputMaybe<Array<EncountersBoolExp>>;
  _not?: InputMaybe<EncountersBoolExp>;
  _or?: InputMaybe<Array<EncountersBoolExp>>;
  age?: InputMaybe<Int2BoolExp>;
  bird?: InputMaybe<BirdsBoolExp>;
  birdId?: InputMaybe<Int8BoolExp>;
  breedingCondition?: InputMaybe<TextBoolExp>;
  captureTime?: InputMaybe<TimeBoolExp>;
  extraText?: InputMaybe<TextBoolExp>;
  id?: InputMaybe<Int8BoolExp>;
  isJuv?: InputMaybe<BoolBoolExp>;
  moultCode?: InputMaybe<TextBoolExp>;
  oldGreaterCoverts?: InputMaybe<Int2BoolExp>;
  recordType?: InputMaybe<TextBoolExp>;
  scheme?: InputMaybe<TextBoolExp>;
  session?: InputMaybe<SessionsBoolExp>;
  sessionId?: InputMaybe<Int8BoolExp>;
  sex?: InputMaybe<TextBoolExp>;
  sexingMethod?: InputMaybe<TextBoolExp>;
  weight?: InputMaybe<Float4BoolExp>;
  wingLength?: InputMaybe<Int2BoolExp>;
};

export type EncountersFilterInput = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<EncountersOrderByExp>>;
  where?: InputMaybe<EncountersBoolExp>;
};

export type EncountersOrderByExp = {
  age?: InputMaybe<OrderBy>;
  bird?: InputMaybe<BirdsOrderByExp>;
  birdId?: InputMaybe<OrderBy>;
  breedingCondition?: InputMaybe<OrderBy>;
  captureTime?: InputMaybe<OrderBy>;
  extraText?: InputMaybe<OrderBy>;
  id?: InputMaybe<OrderBy>;
  isJuv?: InputMaybe<OrderBy>;
  moultCode?: InputMaybe<OrderBy>;
  oldGreaterCoverts?: InputMaybe<OrderBy>;
  recordType?: InputMaybe<OrderBy>;
  scheme?: InputMaybe<OrderBy>;
  session?: InputMaybe<SessionsOrderByExp>;
  sessionId?: InputMaybe<OrderBy>;
  sex?: InputMaybe<OrderBy>;
  sexingMethod?: InputMaybe<OrderBy>;
  weight?: InputMaybe<OrderBy>;
  wingLength?: InputMaybe<OrderBy>;
};

export type Float4AggExp = {
  __typename?: 'Float4AggExp';
  _count: Scalars['Int64']['output'];
  _count_distinct: Scalars['Int64']['output'];
  avg?: Maybe<Scalars['Float64']['output']>;
  max?: Maybe<Scalars['Float32']['output']>;
  min?: Maybe<Scalars['Float32']['output']>;
  stddev?: Maybe<Scalars['Float64']['output']>;
  stddev_pop?: Maybe<Scalars['Float64']['output']>;
  stddev_samp?: Maybe<Scalars['Float64']['output']>;
  sum?: Maybe<Scalars['Float32']['output']>;
  var_pop?: Maybe<Scalars['Float64']['output']>;
  var_samp?: Maybe<Scalars['Float64']['output']>;
  variance?: Maybe<Scalars['Float64']['output']>;
};

export type Float4BoolExp = {
  _and?: InputMaybe<Array<Float4BoolExp>>;
  _eq?: InputMaybe<Scalars['Float32']['input']>;
  _gt?: InputMaybe<Scalars['Float32']['input']>;
  _gte?: InputMaybe<Scalars['Float32']['input']>;
  _in?: InputMaybe<Array<Scalars['Float32']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Float32']['input']>;
  _lte?: InputMaybe<Scalars['Float32']['input']>;
  _neq?: InputMaybe<Scalars['Float32']['input']>;
  _not?: InputMaybe<Float4BoolExp>;
  _or?: InputMaybe<Array<Float4BoolExp>>;
};

export type Float8AggExp = {
  __typename?: 'Float8AggExp';
  _count: Scalars['Int64']['output'];
  _count_distinct: Scalars['Int64']['output'];
  avg?: Maybe<Scalars['Float64']['output']>;
  max?: Maybe<Scalars['Float64']['output']>;
  min?: Maybe<Scalars['Float64']['output']>;
  stddev?: Maybe<Scalars['Float64']['output']>;
  stddev_pop?: Maybe<Scalars['Float64']['output']>;
  stddev_samp?: Maybe<Scalars['Float64']['output']>;
  sum?: Maybe<Scalars['Float64']['output']>;
  var_pop?: Maybe<Scalars['Float64']['output']>;
  var_samp?: Maybe<Scalars['Float64']['output']>;
  variance?: Maybe<Scalars['Float64']['output']>;
};

export type Float8BoolExp = {
  _and?: InputMaybe<Array<Float8BoolExp>>;
  _eq?: InputMaybe<Scalars['Float64']['input']>;
  _gt?: InputMaybe<Scalars['Float64']['input']>;
  _gte?: InputMaybe<Scalars['Float64']['input']>;
  _in?: InputMaybe<Array<Scalars['Float64']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Float64']['input']>;
  _lte?: InputMaybe<Scalars['Float64']['input']>;
  _neq?: InputMaybe<Scalars['Float64']['input']>;
  _not?: InputMaybe<Float8BoolExp>;
  _or?: InputMaybe<Array<Float8BoolExp>>;
};

export type Int2AggExp = {
  __typename?: 'Int2AggExp';
  _count: Scalars['Int64']['output'];
  _count_distinct: Scalars['Int64']['output'];
  avg?: Maybe<Scalars['Bigdecimal']['output']>;
  bit_and?: Maybe<Scalars['Int16']['output']>;
  bit_or?: Maybe<Scalars['Int16']['output']>;
  bit_xor?: Maybe<Scalars['Int16']['output']>;
  max?: Maybe<Scalars['Int16']['output']>;
  min?: Maybe<Scalars['Int16']['output']>;
  stddev?: Maybe<Scalars['Bigdecimal']['output']>;
  stddev_pop?: Maybe<Scalars['Bigdecimal']['output']>;
  stddev_samp?: Maybe<Scalars['Bigdecimal']['output']>;
  sum?: Maybe<Scalars['Int64']['output']>;
  var_pop?: Maybe<Scalars['Bigdecimal']['output']>;
  var_samp?: Maybe<Scalars['Bigdecimal']['output']>;
  variance?: Maybe<Scalars['Bigdecimal']['output']>;
};

export type Int2BoolExp = {
  _and?: InputMaybe<Array<Int2BoolExp>>;
  _eq?: InputMaybe<Scalars['Int16']['input']>;
  _gt?: InputMaybe<Scalars['Int16']['input']>;
  _gte?: InputMaybe<Scalars['Int16']['input']>;
  _in?: InputMaybe<Array<Scalars['Int16']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Int16']['input']>;
  _lte?: InputMaybe<Scalars['Int16']['input']>;
  _neq?: InputMaybe<Scalars['Int16']['input']>;
  _not?: InputMaybe<Int2BoolExp>;
  _or?: InputMaybe<Array<Int2BoolExp>>;
};

export type Int8AggExp = {
  __typename?: 'Int8AggExp';
  _count: Scalars['Int64']['output'];
  _count_distinct: Scalars['Int64']['output'];
  avg?: Maybe<Scalars['Bigdecimal']['output']>;
  bit_and?: Maybe<Scalars['Int64']['output']>;
  bit_or?: Maybe<Scalars['Int64']['output']>;
  bit_xor?: Maybe<Scalars['Int64']['output']>;
  max?: Maybe<Scalars['Int64']['output']>;
  min?: Maybe<Scalars['Int64']['output']>;
  stddev?: Maybe<Scalars['Bigdecimal']['output']>;
  stddev_pop?: Maybe<Scalars['Bigdecimal']['output']>;
  stddev_samp?: Maybe<Scalars['Bigdecimal']['output']>;
  sum?: Maybe<Scalars['Bigdecimal']['output']>;
  var_pop?: Maybe<Scalars['Bigdecimal']['output']>;
  var_samp?: Maybe<Scalars['Bigdecimal']['output']>;
  variance?: Maybe<Scalars['Bigdecimal']['output']>;
};

export type Int8BoolExp = {
  _and?: InputMaybe<Array<Int8BoolExp>>;
  _eq?: InputMaybe<Scalars['Int64']['input']>;
  _gt?: InputMaybe<Scalars['Int64']['input']>;
  _gte?: InputMaybe<Scalars['Int64']['input']>;
  _in?: InputMaybe<Array<Scalars['Int64']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Int64']['input']>;
  _lte?: InputMaybe<Scalars['Int64']['input']>;
  _neq?: InputMaybe<Scalars['Int64']['input']>;
  _not?: InputMaybe<Int8BoolExp>;
  _or?: InputMaybe<Array<Int8BoolExp>>;
};

export type Mutation = {
  __typename?: 'Mutation';
  _no_fields_accessible?: Maybe<Scalars['String']['output']>;
};

export type NumericAggExp = {
  __typename?: 'NumericAggExp';
  _count: Scalars['Int64']['output'];
  _count_distinct: Scalars['Int64']['output'];
  avg?: Maybe<Scalars['Bigdecimal']['output']>;
  max?: Maybe<Scalars['Bigdecimal']['output']>;
  min?: Maybe<Scalars['Bigdecimal']['output']>;
  stddev?: Maybe<Scalars['Bigdecimal']['output']>;
  stddev_pop?: Maybe<Scalars['Bigdecimal']['output']>;
  stddev_samp?: Maybe<Scalars['Bigdecimal']['output']>;
  sum?: Maybe<Scalars['Bigdecimal']['output']>;
  var_pop?: Maybe<Scalars['Bigdecimal']['output']>;
  var_samp?: Maybe<Scalars['Bigdecimal']['output']>;
  variance?: Maybe<Scalars['Bigdecimal']['output']>;
};

export type NumericBoolExp = {
  _and?: InputMaybe<Array<NumericBoolExp>>;
  _eq?: InputMaybe<Scalars['Bigdecimal']['input']>;
  _gt?: InputMaybe<Scalars['Bigdecimal']['input']>;
  _gte?: InputMaybe<Scalars['Bigdecimal']['input']>;
  _in?: InputMaybe<Array<Scalars['Bigdecimal']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Bigdecimal']['input']>;
  _lte?: InputMaybe<Scalars['Bigdecimal']['input']>;
  _neq?: InputMaybe<Scalars['Bigdecimal']['input']>;
  _not?: InputMaybe<NumericBoolExp>;
  _or?: InputMaybe<Array<NumericBoolExp>>;
};

export enum OrderBy {
  /** Sorts the data in ascending order */
  Asc = 'Asc',
  /** Sorts the data in descending order */
  Desc = 'Desc'
}

export type Query = {
  __typename?: 'Query';
  /** Selects multiple objects from the model. Model description: @graphql({"aggregate": {"enabled": true}}) */
  birds?: Maybe<Array<Birds>>;
  birdsAggregate?: Maybe<BirdsAggExp>;
  /** Selects a single object from the model. Model description: @graphql({"aggregate": {"enabled": true}}) */
  birdsById?: Maybe<Birds>;
  /** Selects a single object from the model. Model description: @graphql({"aggregate": {"enabled": true}}) */
  birdsByRingNo?: Maybe<Birds>;
  /** Selects multiple objects from the model. Model description: Encounters with individual birds */
  encounters?: Maybe<Array<Encounters>>;
  encountersAggregate?: Maybe<EncountersAggExp>;
  /** Selects a single object from the model. Model description: Encounters with individual birds */
  encountersByEncountersBirdIdSessionIdUnique?: Maybe<Encounters>;
  /** Selects a single object from the model. Model description: Encounters with individual birds */
  encountersById?: Maybe<Encounters>;
  sessions?: Maybe<Array<Sessions>>;
  sessionsAggregate?: Maybe<SessionsAggExp>;
  sessionsById?: Maybe<Sessions>;
  sessionsByVisitDate?: Maybe<Sessions>;
  /** Selects multiple objects from the model. Model description: Bird Species */
  species?: Maybe<Array<Species>>;
  speciesAggregate?: Maybe<SpeciesAggExp>;
  /** Selects a single object from the model. Model description: Bird Species */
  speciesById?: Maybe<Species>;
  /** Selects a single object from the model. Model description: Bird Species */
  speciesBySpeciesName?: Maybe<Species>;
  speciesLeagueTable?: Maybe<Array<SpeciesLeagueTable>>;
  speciesLeagueTableAggregate?: Maybe<SpeciesLeagueTableAggExp>;
  topPeriodsByMetric?: Maybe<Array<TopPeriodsResult>>;
  topPeriodsByMetricAggregate?: Maybe<TopPeriodsResultAggExp>;
};


export type QueryBirdsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<BirdsOrderByExp>>;
  where?: InputMaybe<BirdsBoolExp>;
};


export type QueryBirdsAggregateArgs = {
  filter_input?: InputMaybe<BirdsFilterInput>;
};


export type QueryBirdsByIdArgs = {
  id: Scalars['Int64']['input'];
};


export type QueryBirdsByRingNoArgs = {
  ringNo: Scalars['String1']['input'];
};


export type QueryEncountersArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<EncountersOrderByExp>>;
  where?: InputMaybe<EncountersBoolExp>;
};


export type QueryEncountersAggregateArgs = {
  filter_input?: InputMaybe<EncountersFilterInput>;
};


export type QueryEncountersByEncountersBirdIdSessionIdUniqueArgs = {
  birdId: Scalars['Int64']['input'];
  sessionId: Scalars['Int64']['input'];
};


export type QueryEncountersByIdArgs = {
  id: Scalars['Int64']['input'];
};


export type QuerySessionsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<SessionsOrderByExp>>;
  where?: InputMaybe<SessionsBoolExp>;
};


export type QuerySessionsAggregateArgs = {
  filter_input?: InputMaybe<SessionsFilterInput>;
};


export type QuerySessionsByIdArgs = {
  id: Scalars['Int64']['input'];
};


export type QuerySessionsByVisitDateArgs = {
  visitDate: Scalars['Date']['input'];
};


export type QuerySpeciesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<SpeciesOrderByExp>>;
  where?: InputMaybe<SpeciesBoolExp>;
};


export type QuerySpeciesAggregateArgs = {
  filter_input?: InputMaybe<SpeciesFilterInput>;
};


export type QuerySpeciesByIdArgs = {
  id: Scalars['Int64']['input'];
};


export type QuerySpeciesBySpeciesNameArgs = {
  speciesName: Scalars['String1']['input'];
};


export type QuerySpeciesLeagueTableArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<SpeciesLeagueTableOrderByExp>>;
  where?: InputMaybe<SpeciesLeagueTableBoolExp>;
};


export type QuerySpeciesLeagueTableAggregateArgs = {
  filter_input?: InputMaybe<SpeciesLeagueTableFilterInput>;
};


export type QueryTopPeriodsByMetricArgs = {
  args: TopPeriodsByMetricArguments;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<TopPeriodsResultOrderByExp>>;
  where?: InputMaybe<TopPeriodsResultBoolExp>;
};


export type QueryTopPeriodsByMetricAggregateArgs = {
  args: TopPeriodsByMetricArguments;
  filter_input?: InputMaybe<TopPeriodsResultFilterInput>;
};

export type Sessions = {
  __typename?: 'Sessions';
  encounters?: Maybe<Array<Encounters>>;
  encountersAggregate: EncountersAggExp;
  id: Scalars['Int64']['output'];
  visitDate: Scalars['Date']['output'];
};


export type SessionsEncountersArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<EncountersOrderByExp>>;
  where?: InputMaybe<EncountersBoolExp>;
};


export type SessionsEncountersAggregateArgs = {
  filter_input?: InputMaybe<EncountersFilterInput>;
};

export type SessionsAggExp = {
  __typename?: 'SessionsAggExp';
  _count: Scalars['Int64']['output'];
  id: Int8AggExp;
  visitDate: DateAggExp;
};

export type SessionsBoolExp = {
  _and?: InputMaybe<Array<SessionsBoolExp>>;
  _not?: InputMaybe<SessionsBoolExp>;
  _or?: InputMaybe<Array<SessionsBoolExp>>;
  encounters?: InputMaybe<EncountersBoolExp>;
  id?: InputMaybe<Int8BoolExp>;
  visitDate?: InputMaybe<DateBoolExp>;
};

export type SessionsFilterInput = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<SessionsOrderByExp>>;
  where?: InputMaybe<SessionsBoolExp>;
};

export type SessionsOrderByExp = {
  id?: InputMaybe<OrderBy>;
  visitDate?: InputMaybe<OrderBy>;
};

/** Bird Species */
export type Species = {
  __typename?: 'Species';
  birds?: Maybe<Array<Birds>>;
  birdsAggregate: BirdsAggExp;
  id: Scalars['Int64']['output'];
  speciesName: Scalars['String1']['output'];
};


/** Bird Species */
export type SpeciesBirdsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<BirdsOrderByExp>>;
  where?: InputMaybe<BirdsBoolExp>;
};


/** Bird Species */
export type SpeciesBirdsAggregateArgs = {
  filter_input?: InputMaybe<BirdsFilterInput>;
};

export type SpeciesAggExp = {
  __typename?: 'SpeciesAggExp';
  _count: Scalars['Int64']['output'];
  id: Int8AggExp;
  speciesName: TextAggExp;
};

export type SpeciesBoolExp = {
  _and?: InputMaybe<Array<SpeciesBoolExp>>;
  _not?: InputMaybe<SpeciesBoolExp>;
  _or?: InputMaybe<Array<SpeciesBoolExp>>;
  birds?: InputMaybe<BirdsBoolExp>;
  id?: InputMaybe<Int8BoolExp>;
  speciesName?: InputMaybe<TextBoolExp>;
};

export type SpeciesFilterInput = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<SpeciesOrderByExp>>;
  where?: InputMaybe<SpeciesBoolExp>;
};

export type SpeciesLeagueTable = {
  __typename?: 'SpeciesLeagueTable';
  averageWeight?: Maybe<Scalars['Float64']['output']>;
  averageWingLength?: Maybe<Scalars['Bigdecimal']['output']>;
  encounters?: Maybe<Scalars['Int64']['output']>;
  heaviest?: Maybe<Scalars['Float32']['output']>;
  individuals?: Maybe<Scalars['Int64']['output']>;
  lightest?: Maybe<Scalars['Float32']['output']>;
  longestStay?: Maybe<Scalars['Bigdecimal']['output']>;
  longestWinged?: Maybe<Scalars['Int16']['output']>;
  sessionCount?: Maybe<Scalars['Int64']['output']>;
  shortestWinged?: Maybe<Scalars['Int16']['output']>;
  speciesName?: Maybe<Scalars['String1']['output']>;
  totalWeight?: Maybe<Scalars['Float32']['output']>;
  unluckiest?: Maybe<Scalars['Int64']['output']>;
};

export type SpeciesLeagueTableAggExp = {
  __typename?: 'SpeciesLeagueTableAggExp';
  _count: Scalars['Int64']['output'];
  averageWeight: Float8AggExp;
  averageWingLength: NumericAggExp;
  encounters: Int8AggExp;
  heaviest: Float4AggExp;
  individuals: Int8AggExp;
  lightest: Float4AggExp;
  longestStay: NumericAggExp;
  longestWinged: Int2AggExp;
  sessionCount: Int8AggExp;
  shortestWinged: Int2AggExp;
  speciesName: TextAggExp;
  totalWeight: Float4AggExp;
  unluckiest: Int8AggExp;
};

export type SpeciesLeagueTableBoolExp = {
  _and?: InputMaybe<Array<SpeciesLeagueTableBoolExp>>;
  _not?: InputMaybe<SpeciesLeagueTableBoolExp>;
  _or?: InputMaybe<Array<SpeciesLeagueTableBoolExp>>;
  averageWeight?: InputMaybe<Float8BoolExp>;
  averageWingLength?: InputMaybe<NumericBoolExp>;
  encounters?: InputMaybe<Int8BoolExp>;
  heaviest?: InputMaybe<Float4BoolExp>;
  individuals?: InputMaybe<Int8BoolExp>;
  lightest?: InputMaybe<Float4BoolExp>;
  longestStay?: InputMaybe<NumericBoolExp>;
  longestWinged?: InputMaybe<Int2BoolExp>;
  sessionCount?: InputMaybe<Int8BoolExp>;
  shortestWinged?: InputMaybe<Int2BoolExp>;
  speciesName?: InputMaybe<TextBoolExp>;
  totalWeight?: InputMaybe<Float4BoolExp>;
  unluckiest?: InputMaybe<Int8BoolExp>;
};

export type SpeciesLeagueTableFilterInput = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<SpeciesLeagueTableOrderByExp>>;
  where?: InputMaybe<SpeciesLeagueTableBoolExp>;
};

export type SpeciesLeagueTableOrderByExp = {
  averageWeight?: InputMaybe<OrderBy>;
  averageWingLength?: InputMaybe<OrderBy>;
  encounters?: InputMaybe<OrderBy>;
  heaviest?: InputMaybe<OrderBy>;
  individuals?: InputMaybe<OrderBy>;
  lightest?: InputMaybe<OrderBy>;
  longestStay?: InputMaybe<OrderBy>;
  longestWinged?: InputMaybe<OrderBy>;
  sessionCount?: InputMaybe<OrderBy>;
  shortestWinged?: InputMaybe<OrderBy>;
  speciesName?: InputMaybe<OrderBy>;
  totalWeight?: InputMaybe<OrderBy>;
  unluckiest?: InputMaybe<OrderBy>;
};

export type SpeciesOrderByExp = {
  id?: InputMaybe<OrderBy>;
  speciesName?: InputMaybe<OrderBy>;
};

export type Subscription = {
  __typename?: 'Subscription';
  birds?: Maybe<Array<Birds>>;
  birdsAggregate?: Maybe<BirdsAggExp>;
  birdsById?: Maybe<Birds>;
  birdsByRingNo?: Maybe<Birds>;
  encounters?: Maybe<Array<Encounters>>;
  encountersAggregate?: Maybe<EncountersAggExp>;
  encountersByEncountersBirdIdSessionIdUnique?: Maybe<Encounters>;
  encountersById?: Maybe<Encounters>;
  sessions?: Maybe<Array<Sessions>>;
  sessionsAggregate?: Maybe<SessionsAggExp>;
  sessionsById?: Maybe<Sessions>;
  sessionsByVisitDate?: Maybe<Sessions>;
  species?: Maybe<Array<Species>>;
  speciesAggregate?: Maybe<SpeciesAggExp>;
  speciesById?: Maybe<Species>;
  speciesBySpeciesName?: Maybe<Species>;
  speciesLeagueTable?: Maybe<Array<SpeciesLeagueTable>>;
  speciesLeagueTableAggregate?: Maybe<SpeciesLeagueTableAggExp>;
  topPeriodsByMetric?: Maybe<Array<TopPeriodsResult>>;
  topPeriodsByMetricAggregate?: Maybe<TopPeriodsResultAggExp>;
};


export type SubscriptionBirdsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<BirdsOrderByExp>>;
  where?: InputMaybe<BirdsBoolExp>;
};


export type SubscriptionBirdsAggregateArgs = {
  filter_input?: InputMaybe<BirdsFilterInput>;
};


export type SubscriptionBirdsByIdArgs = {
  id: Scalars['Int64']['input'];
};


export type SubscriptionBirdsByRingNoArgs = {
  ringNo: Scalars['String1']['input'];
};


export type SubscriptionEncountersArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<EncountersOrderByExp>>;
  where?: InputMaybe<EncountersBoolExp>;
};


export type SubscriptionEncountersAggregateArgs = {
  filter_input?: InputMaybe<EncountersFilterInput>;
};


export type SubscriptionEncountersByEncountersBirdIdSessionIdUniqueArgs = {
  birdId: Scalars['Int64']['input'];
  sessionId: Scalars['Int64']['input'];
};


export type SubscriptionEncountersByIdArgs = {
  id: Scalars['Int64']['input'];
};


export type SubscriptionSessionsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<SessionsOrderByExp>>;
  where?: InputMaybe<SessionsBoolExp>;
};


export type SubscriptionSessionsAggregateArgs = {
  filter_input?: InputMaybe<SessionsFilterInput>;
};


export type SubscriptionSessionsByIdArgs = {
  id: Scalars['Int64']['input'];
};


export type SubscriptionSessionsByVisitDateArgs = {
  visitDate: Scalars['Date']['input'];
};


export type SubscriptionSpeciesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<SpeciesOrderByExp>>;
  where?: InputMaybe<SpeciesBoolExp>;
};


export type SubscriptionSpeciesAggregateArgs = {
  filter_input?: InputMaybe<SpeciesFilterInput>;
};


export type SubscriptionSpeciesByIdArgs = {
  id: Scalars['Int64']['input'];
};


export type SubscriptionSpeciesBySpeciesNameArgs = {
  speciesName: Scalars['String1']['input'];
};


export type SubscriptionSpeciesLeagueTableArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<SpeciesLeagueTableOrderByExp>>;
  where?: InputMaybe<SpeciesLeagueTableBoolExp>;
};


export type SubscriptionSpeciesLeagueTableAggregateArgs = {
  filter_input?: InputMaybe<SpeciesLeagueTableFilterInput>;
};


export type SubscriptionTopPeriodsByMetricArgs = {
  args: TopPeriodsByMetricArguments;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<TopPeriodsResultOrderByExp>>;
  where?: InputMaybe<TopPeriodsResultBoolExp>;
};


export type SubscriptionTopPeriodsByMetricAggregateArgs = {
  args: TopPeriodsByMetricArguments;
  filter_input?: InputMaybe<TopPeriodsResultFilterInput>;
};

export type TextAggExp = {
  __typename?: 'TextAggExp';
  _count: Scalars['Int64']['output'];
  _count_distinct: Scalars['Int64']['output'];
  max?: Maybe<Scalars['String1']['output']>;
  min?: Maybe<Scalars['String1']['output']>;
};

export type TextBoolExp = {
  _and?: InputMaybe<Array<TextBoolExp>>;
  _eq?: InputMaybe<Scalars['String1']['input']>;
  _gt?: InputMaybe<Scalars['String1']['input']>;
  _gte?: InputMaybe<Scalars['String1']['input']>;
  _ilike?: InputMaybe<Scalars['String1']['input']>;
  _in?: InputMaybe<Array<Scalars['String1']['input']>>;
  _iregex?: InputMaybe<Scalars['String1']['input']>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _like?: InputMaybe<Scalars['String1']['input']>;
  _lt?: InputMaybe<Scalars['String1']['input']>;
  _lte?: InputMaybe<Scalars['String1']['input']>;
  _neq?: InputMaybe<Scalars['String1']['input']>;
  _nilike?: InputMaybe<Scalars['String1']['input']>;
  _niregex?: InputMaybe<Scalars['String1']['input']>;
  _nlike?: InputMaybe<Scalars['String1']['input']>;
  _not?: InputMaybe<TextBoolExp>;
  _nregex?: InputMaybe<Scalars['String1']['input']>;
  _or?: InputMaybe<Array<TextBoolExp>>;
  _regex?: InputMaybe<Scalars['String1']['input']>;
  starts_with?: InputMaybe<Scalars['String1']['input']>;
  ts_match_tt?: InputMaybe<Scalars['String1']['input']>;
};

export type TimeAggExp = {
  __typename?: 'TimeAggExp';
  _count: Scalars['Int64']['output'];
  _count_distinct: Scalars['Int64']['output'];
  avg?: Maybe<Scalars['Json']['output']>;
  max?: Maybe<Scalars['String1']['output']>;
  min?: Maybe<Scalars['String1']['output']>;
  sum?: Maybe<Scalars['Json']['output']>;
};

export type TimeBoolExp = {
  _and?: InputMaybe<Array<TimeBoolExp>>;
  _eq?: InputMaybe<Scalars['String1']['input']>;
  _gt?: InputMaybe<Scalars['String1']['input']>;
  _gte?: InputMaybe<Scalars['String1']['input']>;
  _in?: InputMaybe<Array<Scalars['String1']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['String1']['input']>;
  _lte?: InputMaybe<Scalars['String1']['input']>;
  _neq?: InputMaybe<Scalars['String1']['input']>;
  _not?: InputMaybe<TimeBoolExp>;
  _or?: InputMaybe<Array<TimeBoolExp>>;
};

export type TopPeriodsByMetricArguments = {
  /** Default: NULL */
  exactMonthsFilter?: InputMaybe<Array<InputMaybe<Scalars['String1']['input']>>>;
  /** Default: 'encounters' */
  metricName?: InputMaybe<Scalars['String1']['input']>;
  /** Default: NULL */
  monthFilter?: InputMaybe<Scalars['Int64']['input']>;
  /** Default: 5 */
  resultLimit?: InputMaybe<Scalars['Int64']['input']>;
  /** Default: 'day' */
  temporalUnit?: InputMaybe<Scalars['String1']['input']>;
  /** Default: NULL */
  yearFilter?: InputMaybe<Scalars['Int64']['input']>;
};

export type TopPeriodsResult = {
  __typename?: 'TopPeriodsResult';
  metricValue?: Maybe<Scalars['Int64']['output']>;
  visitDate?: Maybe<Scalars['Date']['output']>;
};

export type TopPeriodsResultAggExp = {
  __typename?: 'TopPeriodsResultAggExp';
  _count: Scalars['Int64']['output'];
  metricValue: Int8AggExp;
  visitDate: DateAggExp;
};

export type TopPeriodsResultBoolExp = {
  _and?: InputMaybe<Array<TopPeriodsResultBoolExp>>;
  _not?: InputMaybe<TopPeriodsResultBoolExp>;
  _or?: InputMaybe<Array<TopPeriodsResultBoolExp>>;
  metricValue?: InputMaybe<Int8BoolExp>;
  visitDate?: InputMaybe<DateBoolExp>;
};

export type TopPeriodsResultFilterInput = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<TopPeriodsResultOrderByExp>>;
  where?: InputMaybe<TopPeriodsResultBoolExp>;
};

export type TopPeriodsResultOrderByExp = {
  metricValue?: InputMaybe<OrderBy>;
  visitDate?: InputMaybe<OrderBy>;
};

export type LeagueTableQueryVariables = Exact<{
  temporalUnit?: InputMaybe<Scalars['String1']['input']>;
  numberOfEntries?: InputMaybe<Scalars['Int64']['input']>;
  monthFilter?: InputMaybe<Scalars['Int64']['input']>;
  yearFilter?: InputMaybe<Scalars['Int64']['input']>;
}>;


export type LeagueTableQuery = { __typename?: 'Query', byEncounter?: Array<{ __typename?: 'TopPeriodsResult', metricValue?: number | null, visitDate?: string | null }> | null, byIndividual?: Array<{ __typename?: 'TopPeriodsResult', metricValue?: number | null, visitDate?: string | null }> | null, bySpecies?: Array<{ __typename?: 'TopPeriodsResult', metricValue?: number | null, visitDate?: string | null }> | null };

export type SpeciesPageQueryVariables = Exact<{
  speciesName?: InputMaybe<Scalars['String1']['input']>;
}>;


export type SpeciesPageQuery = { __typename?: 'Query', species?: Array<{ __typename?: 'Species', speciesName: string, birdsAggregate: { __typename?: 'BirdsAggExp', _count: number }, birds?: Array<{ __typename?: 'Birds', encounters?: Array<{ __typename?: 'Encounters', session?: { __typename?: 'Sessions', visitDate: string } | null }> | null, encountersAggregate: { __typename?: 'EncountersAggExp', _count: number } }> | null }> | null };

export type AllSpeciesStatsQueryVariables = Exact<{ [key: string]: never; }>;


export type AllSpeciesStatsQuery = { __typename?: 'Query', speciesLeagueTable?: Array<{ __typename?: 'SpeciesLeagueTable', speciesName?: string | null, individuals?: number | null, encounters?: number | null, sessionCount?: number | null, longestStay?: number | null, unluckiest?: number | null, longestWinged?: number | null, averageWingLength?: number | null, shortestWinged?: number | null, heaviest?: number | null, averageWeight?: number | null, lightest?: number | null, totalWeight?: number | null }> | null };
