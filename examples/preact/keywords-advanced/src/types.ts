export interface Person {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  address: { city: string; country: string };
  company: { name: string; location?: { city: string } };
  subscribed: boolean;
}

export interface Game {
  id: number;
  title: string;
  platforms: string[];
  releaseYear: number;
  completed: boolean;
  metadata: { developer: string; publisher: string };
}
