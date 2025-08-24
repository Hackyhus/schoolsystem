export type DocumentData = { [key: string]: any };

export type QueryConstraint = {
  type: 'where' | 'orderBy' | 'limit';
  fieldPath: string;
  opStr?: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'array-contains' | 'in' | 'not-in' | 'array-contains-any';
  value?: any;
  direction?: 'asc' | 'desc';
  limitCount?: number;
};
