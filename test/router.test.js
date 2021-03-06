let { fireEvent } = require('../src/ascesis');
let { Router } = require('../src/router');


describe('Base functionality', () => {

  const router = new Router();

  beforeAll(() => {
    //set initial url to /
    window.history.replaceState(null, null, '/');
  });

  afterAll(() => {
    //set initial url to /
    window.history.replaceState(null, null, '/');
    router.destroy();
  });

  it('returns root correctly', () => {
    expect(router.getRoot()).toBe('/');
  });

  it('matches root correctly', () => {
    expect(router.rootMatches()).toBe(true);
  });

  it('returns query string correctly', () => {
    expect(router.getQs()).toBe(false);
    window.history.replaceState(null, null, '/?foo=bar');
    expect(router.getQs()).toBe('foo=bar');
    window.history.replaceState(null, null, '/?foo=bar&bar=baz');
    expect(router.getQs()).toBe('foo=bar&bar=baz');
  });

  it('returns query params correctly', () => {
    window.history.replaceState(null, null, '/');
    expect(router.getParams()).toEqual({});
    window.history.replaceState(null, null, '/?foo');
    expect(router.getParams()).toEqual({ foo: undefined });
    window.history.replaceState(null, null, '/?foo=bar');
    expect(router.getParams()).toEqual({ foo: 'bar' });
    window.history.replaceState(null, null, '/?foo=bar&bar=baz');
    expect(router.getParams()).toEqual({ foo: 'bar', bar: 'baz' });
  });

  it('sets params correctly', () => {
    router.setParams({
      baz: 'q'
    });
    expect(window.location.search).toEqual('?baz=q');

    router.setParams({
      foo: 'bla',
      test: 'ok'
    });
    expect(window.location.search).toEqual('?foo=bla&test=ok');

    router.updateParams({
      foo: 'updated',
      bla: 'added'
    });

    expect(window.location.search).toEqual('?foo=updated&test=ok&bla=added');
  });

  it('returns absolute path correctly', () => {
    expect(router.getGlobalPath()).toEqual('/');
  });

  it('returns relative path correctly', () => {
    expect(router.getPath()).toEqual('/');
  });

  it('adds handlers correctly', () => {
    let handler = jest.fn(() => {});
    router.add('/', handler);
    expect(router.getRoutes().length).toEqual(1);
    expect(typeof router.getRoutes()[0].callback).toEqual('function');
  });

  it('navigates correctly', () => {
    router.navigate('/bar');
    expect(router.getPath()).toEqual('/bar');
  });

  it('handles route correctly', () => {
    let handler = jest.fn(() => {});
    router.add('/foo', handler);
    router.navigate('/foo');
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('handles routes table correctly', () => {
    let handler1 = jest.fn(() => {});
    let handler2 = jest.fn(() => {});
    router.add({
      '/foo': handler1,
      '/bar': handler2
    });
    router.navigate('/foo');
    router.navigate('/bar');
    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  it('handles routes table in constructor', () => {
    let handler1 = jest.fn(() => {});
    let handler2 = jest.fn(() => {});
    const test_router = new Router({
      routes: {
        '/foo': handler1,
        '/bar': handler2
      }
    })
    test_router.navigate('/foo');
    test_router.navigate('/bar');
    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  it('destroys correctly', () => {
    let handler = jest.fn(() => {});
    router.add('/bar', handler);
    router.destroy();
    router.navigate('/bar');
    expect(handler).not.toHaveBeenCalled();
    expect(router.getRoutes()).toEqual([]);
  });
});

describe('Mount on subpath', () => {

  const router = new Router({
    base: '/subpath'
  });

  beforeEach(() => {
    //set initial url to /
    window.history.replaceState(null, null, '/');
  });

  afterEach(() => {
    //set initial url to /
    window.history.replaceState(null, null, '/');
  });

  afterAll(() => {
    router.destroy();
  });

  it('matches root correctly', () => {
    expect(router.rootMatches()).toEqual(false);
    window.history.replaceState(null, null, '/subpath');
    expect(router.rootMatches()).toEqual(true);
    window.history.replaceState(null, null, '/subpath/foo');
    expect(router.rootMatches()).toEqual(true);
    window.history.replaceState(null, null, '/subpath2');
    expect(router.rootMatches()).toEqual(false);
  });

  it('returns absolute path correctly', () => {
    expect(router.getGlobalPath()).toEqual('/');
    window.history.replaceState(null, null, '/subpath');
    expect(router.getGlobalPath()).toEqual('/subpath');
  });

  it('returns relative path correctly', () => {
    expect(router.getPath(), false);
    window.history.replaceState(null, null, '/subpath');
    expect(router.getPath(), '');
    window.history.replaceState(null, null, '/subpath/bar');
    expect(router.getPath(), '/bar');
    window.history.replaceState(null, null, '/subpath_/foo');
    expect(router.getPath(), false);
  });

  it('navigates correctly', () => {
    router.navigate('/bar');
    expect(router.getPath()).toEqual(false);
    window.history.replaceState(null, null, '/subpath');
    router.navigate('/bar');
    expect(router.getPath()).toEqual('/bar');
    expect(router.getGlobalPath()).toEqual('/subpath/bar');
    router.navigate('/subpath/baz', { absolute: true });
    expect(router.getGlobalPath()).toEqual('/subpath/baz');
  });

  it('handles route correctly', () => {
    let handler = jest.fn();
    router.add('/foo', handler);
    window.history.replaceState(null, null, '/subpath/foo');
    router.resolve();
    expect(handler).toHaveBeenCalled();
  });
});

describe('Routes handling', () => {

  const router = new Router();

  beforeEach(() => {
    //set initial url to /
    window.history.replaceState(null, null, '/');
  });

  afterEach(() => {
    //set initial url to /
    window.history.replaceState(null, null, '/');
  });

  afterAll(() => {
    router.destroy();
  });

  it('handles nested routes correctly', () => {
    let handler1 = jest.fn();
    let handler2 = jest.fn();
    let handler3 = jest.fn();
    router.add('/', handler1);
    router.add('/foo', handler2);
    router.add('/*', handler3);
    router.resolve();
    expect(handler1).toHaveBeenCalledTimes(1);
    router.navigate('/foo');
    expect(handler2).toHaveBeenCalledTimes(1);
    expect(handler3).toHaveBeenCalledTimes(2);
  });

  it('doesnt handle silent naviagation', () => {
    let handler1 = jest.fn();
    let handler2 = jest.fn();
    router.add('/', handler1);
    router.add('/foo', handler2);
    router.resolve();
    expect(handler1).toHaveBeenCalledTimes(1);
    router.navigate('/foo', { silent: true });
    expect(handler2).not.toHaveBeenCalled();
  });

  it('passes correct params to handler', () => {
    let args;
    let handler = jest.fn();
    router.add('/:foo', handler);
    router.navigate('/test?foo=bar');
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith('test', { foo: 'bar' });
  });

});

describe('Nested Routers', () => {
  beforeEach(() => {
    window.history.replaceState(null, null, '/');
  });

  afterEach(() => {
    window.history.replaceState(null, null, '/');
  });

  const root_router = new Router();
  const sub_router_1 = new Router();
  const sub_router_2 = new Router();

  root_router.mount('/test1', sub_router_1);
  root_router.mount('/test2', sub_router_2, true);


  it('mounts correctly', () => {
    expect(sub_router_1.getRoot()).toEqual('/test1');
    expect(sub_router_2.getRoot()).toEqual('/test2');
  });

  it('handles routes correctly', () => {
    let handler1 = jest.fn();
    let handler2 = jest.fn();
    let handler3 = jest.fn();
    let handler4 = jest.fn(() => false);
    root_router.add('/test1', handler1);
    root_router.add('/test2', handler2);
    sub_router_1.add('/', handler3);
    sub_router_2.add('/', handler4);
    root_router.navigate('/test1');
    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler3).toHaveBeenCalledTimes(1);
    root_router.navigate('/test2');
    expect(handler2).not.toHaveBeenCalled();
    expect(handler4).toHaveBeenCalledTimes(1);
  });

  it('unmounts correctly', () => {
    root_router.unmount(sub_router_1);
    let handler1 = jest.fn();
    let handler2 = jest.fn();
    sub_router_1.add('/', handler1);
    sub_router_2.add('/', handler2);
    root_router.navigate('/test1');
    expect(handler1).not.toHaveBeenCalledTimes(1);
    root_router.navigate('/test2');
    expect(handler2).toHaveBeenCalledTimes(1);
  });

});

describe('Use existing DOM elements as containers', () => {
  const $sandbox = document.createElement('div');
  let root_router, sub_router_1, sub_router_11, sub_router_2, sub_router_21;

  beforeEach(() => {

    $sandbox.innerHTML = `
      <div id="root-router" router-root="true" router-base='/'>
        <div>
          <div></div>
          <div id="sub-router-1" router-base="/foo">
            <div id="sub-router-1-1" router-base="/"></div>
          </div>
        </div>
        <div id="sub-router-2" router-base="/bar">
          <div id="sub-router-2-1" router-base=""></div>
          <div></div>
        </div>
      </div>
    `;

    root_router = new Router({ container: $sandbox.querySelector('#root-router') });
    sub_router_1 = new Router({ container: $sandbox.querySelector('#sub-router-1') });
    sub_router_11 = new Router({ container: $sandbox.querySelector('#sub-router-1-1') });
    sub_router_2 = new Router({ container: $sandbox.querySelector('#sub-router-2') });
    sub_router_21 = new Router({ container: $sandbox.querySelector('#sub-router-2-1') });

    window.history.replaceState(null, null, '/');
  });

  afterEach(() => {
    window.history.replaceState(null, null, '/');
  });



  it('handles routes correctly', () => {
    let handler1 = jest.fn();
    let handler2 = jest.fn();
    let handler3 = jest.fn();
    let handler4 = jest.fn(() => false);
    root_router.add('/foo', handler1);
    root_router.add('/bar', handler2);
    sub_router_1.add('/', handler3);
    sub_router_2.add('/', handler4);
    root_router.navigate('/foo');
    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler3).toHaveBeenCalledTimes(1);
    root_router.navigate('/bar');
    expect(handler2).not.toHaveBeenCalled();
    expect(handler4).toHaveBeenCalledTimes(1);
  });

  it('handles removed router nodes correctly', () => {
    let handler1 = jest.fn();
    let handler2 = jest.fn();
    root_router.add('/foo', handler1);
    sub_router_1.add('/', handler2);
    root_router.navigate('/foo');
    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
    $sandbox.querySelector('#sub-router-1').remove();
    root_router.navigate('/foo');
    expect(handler2).toHaveBeenCalledTimes(1);
    expect(handler1).toHaveBeenCalledTimes(2);
  });

  it('handles more than 1 nesting level', () => {
    let handler1 = jest.fn();
    let handler2 = jest.fn();
    let handler3 = jest.fn();
    let handler4 = jest.fn();
    let handler5 = jest.fn();
    sub_router_1.add('/', handler2);
    sub_router_11.add('/', handler3);
    sub_router_2.add('/', handler4);
    sub_router_21.add('/', handler5);
    root_router.navigate('/foo');
    expect(handler2).toHaveBeenCalledTimes(1);
    expect(handler3).toHaveBeenCalledTimes(1);
    root_router.navigate('/bar');
    expect(handler4).toHaveBeenCalledTimes(1);
    expect(handler5).toHaveBeenCalledTimes(1);
  });

});
