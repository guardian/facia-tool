// @flow

type PriorityName = 'editorial' | 'commercial' | 'training' | 'email';

type Priorities = {
  editorial: Object,
  commercial: Object,
  training: Object,
  email: Object
};

export type { PriorityName, Priorities };
