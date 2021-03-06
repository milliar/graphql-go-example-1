$(function (global) {
  /**
   * This GraphiQL example illustrates how to use some of GraphiQL's props
   * in order to enable reading and updating the URL parameters, making
   * link sharing of queries a little bit easier.
   *
   * This is only one example of this kind of feature, GraphiQL exposes
   * various React params to enable interesting integrations.
   */

  // Parse the search string to get url parameters.
  var search = window.location.search;
  var parameters = {};
  search.substr(1).split('&').forEach(function (entry) {
    var eq = entry.indexOf('=');
    if (eq >= 0) {
      parameters[decodeURIComponent(entry.slice(0, eq))] =
          decodeURIComponent(entry.slice(eq + 1));
    }
  });

  // if variables was provided, try to format it.
  if (parameters.variables) {
    try {
      parameters.variables =
          JSON.stringify(JSON.parse(query.variables), null, 2);
    } catch (e) {
      // Do nothing
    }
  }

  // When the query and variables string is edited, update the URL bar so
  // that it can be easily shared
  function onEditQuery(newQuery) {
    parameters.query = newQuery;
    updateURL();
  }

  function onEditVariables(newVariables) {
    parameters.variables = newVariables;
    updateURL();
  }

  function updateURL() {
    var newSearch = '?' + Object.keys(parameters).map(function (key) {
          return encodeURIComponent(key) + '=' +
              encodeURIComponent(parameters[key]);
        }).join('&');
    history.replaceState(null, null, newSearch);
  }

  // Defines a GraphQL fetcher using the fetch API.
  function graphQLFetcher(graphQLParams) {
    return fetch(window.location.origin + '/graphql/v1', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(graphQLParams)
    }).then(function (response) {
      return response.json()
    });
  }

  global.renderGraphiql = function (elem) {
    // Render <GraphiQL /> into the body.
    var toolbar = React.createElement(GraphiQL.Toolbar, {}, [
      "Source available at ",
      React.createElement("a", {
        href: "https://github.com/sogko/golang-graphql-playground",
      }, "github")
    ]);
    React.render(
        React.createElement(GraphiQL, {
          fetcher: graphQLFetcher,
          query: parameters.query,
          variables: parameters.variables,
          onEditQuery: onEditQuery,
          onEditVariables: onEditVariables,
          defaultQuery:
            "# Welcome to GraphiQL-GO by Example\n" +
            "#\n" +
            "# mutation Root { createUser(email:\"user1@x.co\"){id, email} }\n" + 
            "# curl -XPOST http://127.0.0.1:8080/graphql/v1 -H \"Content-Type: application/json\" -d '{\"query\":\"{user(id:1) {id, email} }\"}' \n"+
            "query Root {\n user(id:1) {id, email} \n}\n"
        }, toolbar),
        elem
    );
  }
}(window))
