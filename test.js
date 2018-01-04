const nock = require('nock');
const client = require('./index');

describe('Client tests', () => {
  beforeAll(() => {
    nock.disableNetConnect();
    nock.enableNetConnect('127.0.0.1');
  });

  afterAll(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('Should get unauthorized 401 status code', () => {
    nock('http://examplesite.org')
      .get('/protected')
      .reply(401);

    return client.get('/protected').catch(({ response }) => {
      expect(response.status).toEqual(401);
    });
  });

  it('Should return response when good access token provided', () => {
    nock('http://examplesite.org', {
      reqheaders: {
        authorization: 'Bearer good_access_token'
      }
    })
      .get('/protected')
      .reply(200);

    client.setAccessToken('good_access_token');

    return client.get('/protected').then(({ status }) => {
      expect(status).toEqual(200);
    });
  });

  it('Should use refresh token and return response', () => {
    // first call -- bad
    nock('http://examplesite.org')
      .get('/protected')
      .reply(401);

    // second call -- success
    nock('http://examplesite.org')
      .post('/token')
      .reply(200, {
        access_token: 'new_good_access_token',
        refresh_token: 'new_good_refresh_token'
      });

    // third call -- success
    nock('http://examplesite.org', {
      reqheaders: {
        authorization: 'Bearer new_good_access_token'
      }
    })
      .get('/protected')
      .reply(200, {
        id: 1,
        name: 'test@test.test',
        email: 'test@test.test'
      });

    client.setAccessToken('wrong_access_token');
    client.setRefreshToken('good_refresh_token');

    return client.get('/protected').then(({ status, data }) => {
      expect(status).toEqual(200);

      expect(data.id).toEqual(1);
      expect(data.name).toEqual('test@test.test');
      expect(data.email).toEqual('test@test.test');
    });
  });

  it('Check if fail when have wrong refresh token', () => {
    // first call -- bad
    nock('http://examplesite.org')
      .get('/protected')
      .reply(401);

    // second call -- bad
    nock('http://examplesite.org')
      .post('/token')
      .reply(401);

    client.setRefreshToken('wrong_refresh_token');

    return client.get('/protected').catch(res => {
      expect(res.response.status).toEqual(401);
    });
  });

  it('Do not try again use refresh token when first was bad', () => {
    nock('http://examplesite.org')
      .get('/protected')
      .reply(401);

    nock('http://examplesite.org')
      .post('/token')
      .reply(401);

    client.setRefreshToken('wrong_refresh_token');

    return client.get('/protected').catch(({ response }) => {
      expect(response.status).toEqual(401);
    });
  });
});
