const Common = require("../common.js");
const RouteBuilder = require("../route_builder.js");

class TestRoute {
  route() {
    return "foo";
  }

  method() {
    return "get"
  }

  action() {
    return "bar";
  }
}

describe("Testing instance of RouteBuilder()", () => {

  describe("registering routes calls express func", () => {
    let routeBuilder;
    let routeAdded;

    beforeEach(() => {
      routeAdded = jest.fn();
      routeBuilder = new RouteBuilder({
        get: routeAdded
      });
    });

    test("registerRoute adds route", () => {
      routeBuilder.registerRoute(TestRoute);
      expect(routeAdded).toHaveBeenCalled();
    });

    test("registerRoutes adds all routes", () => {
      routeBuilder.registerRoutes([TestRoute]);
      expect(routeAdded).toHaveBeenCalled();
    });
  });

  describe("with stubbed express", () => {
    let routeBuilder;
    let routes = {};

    beforeEach(() => {
      routes = {};
      routeBuilder = new RouteBuilder({
        get: (route, callback) => {
          routes[route] = callback
        }
      });
    });

    test("registered routes are executable", () => {
      routeBuilder.registerRoute(TestRoute);
      expect(routes["/foo"]()).resolves.toEqual("bar");
    });

    test("group correctly prefix routes", () => {
      routeBuilder.group("derp", () => {
        routeBuilder.registerRoute(TestRoute);
      });
      expect(Object.keys(routes)[0]).toEqual("/derp/foo");
    });

    test("nssted groups correctly prefix routes", () => {
      routeBuilder.group("v1", () => {
        routeBuilder.group("derp", () => {
          routeBuilder.registerRoute(TestRoute);
        });
      });
      expect(Object.keys(routes)[0]).toEqual("/v1/derp/foo");
    });
  });
});