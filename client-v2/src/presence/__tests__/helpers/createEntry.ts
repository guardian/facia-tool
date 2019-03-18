import { Entry } from '../../types';

const createEntry = ({ connId = Math.random().toString() } = {}): Entry => ({
  location: 'some',
  lastAction: '0',
  clientId: {
    connId,
    person: {
      browserId: 'Chrome',
      firstName: 'R',
      lastName: 'B',
      email: 'r@b.com',
      googleId: 'abc'
    }
  }
});

export { createEntry };
