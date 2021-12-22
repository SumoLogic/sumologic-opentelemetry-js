const fetchJson = async (url) => {
  const resp = await fetch(url);
  return resp.json();
};

const PlanetComponent = {
  data() {
    return {
      planet: null,
      loading: false,
    };
  },
  mounted() {
    const route = window.VueRouter.useRoute();

    const planetId = route.params.id;

    this.loading = true;
    fetchJson(`https://swapi.dev/api/planets/${planetId}`).then((response) => {
      this.loading = false;
      this.planet = Object.entries(response);
    });
  },
  template: `
  <div>
    <a @click="$router.push('/')" href="#">back</a>
    <h1>Planet</h1>
    <div v-if="loading">Loading...</div>
    <dl>
      <template v-for="pair in planet" :key="pair[0]">
        <dt>{{ pair[0] }}</dt>
        <dd>{{ pair[1] }}</dd>
      </template>
    </dl>
  </div>`,
};

const PlanetsComponent = {
  data() {
    return {
      loading: false,
      planets: [],
    };
  },
  components: {},
  template: `
  <div>
    <h1>Planets</h1>
    <div v-if="loading">Loading...</div>
    <ul>
      <li v-for="(planet, index) in planets" :key="planet.name">
        <router-link :to="{ name: 'planet', params: { id: index + 1 } }">{{ planet.name }}</router-link>
      </li>
    </ul>
  </div>`,
  mounted() {
    this.loading = true;
    fetchJson('https://swapi.dev/api/planets').then((response) => {
      this.loading = false;
      this.planets = response.results;
    });
  },
};

const bootstrapApp = ({ useHistoryApi = true }) => {
  const router = window.VueRouter.createRouter({
    history: useHistoryApi
      ? window.VueRouter.createWebHistory('/vuejs/')
      : window.VueRouter.createWebHashHistory('/vuejs/'),
    routes: [
      { path: '/', name: 'home', component: PlanetsComponent },
      { path: '/planets/:id', name: 'planet', component: PlanetComponent },
    ],
  });

  const app = window.Vue.createApp({
    template: `<router-view></router-view>`,
  });

  app.use(router);

  app.mount('#app');
};
