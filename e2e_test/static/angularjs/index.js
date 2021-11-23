const bootstrapApp = ({ useHistoryApi = true }) => {
  angular
    .module('planets', ['ui.router'])
    .config([
      '$locationProvider',
      function ($locationProvider) {
        $locationProvider.html5Mode({
          enabled: useHistoryApi,
          requireBase: false,
        });
      },
    ])
    .config([
      '$stateProvider',
      function ($stateProvider) {
        const helloState = {
          name: 'planets',
          url: useHistoryApi ? '/angularjs/' : '',
          template: `
      <div>
        <h1>Planets</h1>
        <div ng-if="loading">Loading...</div>
        <ul>
          <li ng-repeat="planet in planets track by $index">
            <a ui-sref="planet({ id: $index + 1 })" ui-sref-active="current" href="">{{ planet.name }}</a>
          </li>
        </ul>
      </div>`,
          controller: [
            '$scope',
            '$http',
            function ($scope, $http) {
              $scope.loading = false;
              $scope.planets = [];

              this.$onInit = () => {
                $scope.loading = true;

                $http.get('https://swapi.dev/api/planets').then((response) => {
                  $scope.loading = false;
                  $scope.planets = response.data.results;
                });
              };
            },
          ],
        };

        const aboutState = {
          name: 'planet',
          url: '/angularjs/planet/:id',
          template: `
      <div>
        <a ng-click="goBack()" href="">back</a>
        <h1>Planet</h1>
        <div ng-if="loading">Loading...</div>
        <dl>
          <ng-container ng-repeat="pair in planet">
            <dt>{{ pair[0] }}</dt>
            <dd>{{ pair[1] }}</dd>
          </template>
        </dl>
      </div>`,
          controller: [
            '$state',
            '$scope',
            '$http',
            function ($state, $scope, $http) {
              const planetId = $state.params.id;

              $scope.loading = false;
              $scope.planet = null;

              this.$onInit = () => {
                $http
                  .get('https://swapi.dev/api/planets/' + planetId)
                  .then((response) => {
                    $scope.loading = false;
                    $scope.planet = Object.entries(response.data);
                  });
              };

              $scope.goBack = () => {
                $state.go('planets');
              };
            },
          ],
        };

        $stateProvider.state(helloState);
        $stateProvider.state(aboutState);
      },
    ]);
};
