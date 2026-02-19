export interface Person {
  firstName: string;
  lastName: string;
  email: string;
}

export const people: Person[] = [
  { firstName: 'Alice', lastName: 'Johnson', email: 'alice@acme.com' },
  { firstName: 'Bob', lastName: 'Smith', email: 'bob@globex.com' },
];

export const defaultOptions: {
  collection: Person[];
  fields: string[];
} = {
  collection: people,
  fields: ['firstName', 'lastName'],
};
