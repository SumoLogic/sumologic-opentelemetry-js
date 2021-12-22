const { BrowserRouter, HashRouter, Switch, Routes, Route, Link } =
  ReactRouterDOM;

const BASE_NAME = '/demoApps/react/';

const fetchJson = async (url) => {
  const resp = await fetch(url);
  return resp.json();
};

const PlanetPage = () => {
  const { planetId } = ReactRouter.useParams();
  const [planet, setPlanet] = React.useState({});

  React.useEffect(() => {
    fetchJson(`https://swapi.dev/api/planets/${planetId}`).then(setPlanet);
  }, [planetId]);

  return (
    <div>
      <Link to="/">Back</Link>
      <h1>Planet</h1>
      <dl>
        {Object.entries(planet).map(([key, value]) => (
          <React.Fragment key={key}>
            <dt>{key}</dt>
            <dd>{value}</dd>
          </React.Fragment>
        ))}
      </dl>
    </div>
  );
};

const PlanetsPage = () => {
  const [items, setItems] = React.useState({ results: [] });

  React.useEffect(() => {
    fetchJson('https://swapi.dev/api/planets').then(setItems);
  }, []);

  return (
    <div>
      <h1>Planets</h1>
      <ul>
        {items.results.map((item, index) => (
          <li key={item.name}>
            <Link to={`/planet/${index + 1}`}>{item.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

const App = ({ useHistoryApi }) => {
  const Router = useHistoryApi ? BrowserRouter : HashRouter;
  const basename = useHistoryApi ? BASE_NAME : '';

  return (
    <div className="App">
      <Router basename={basename}>
        <Routes>
          <Route exact path="/" element={<PlanetsPage />}></Route>
          <Route
            exact
            path="/planet/:planetId"
            element={<PlanetPage />}
          ></Route>
        </Routes>
      </Router>
    </div>
  );
};

const bootstrapApp = ({ useHistoryApi = true }) => {
  const rootElement = document.querySelector('#root');

  ReactDOM.render(<App useHistoryApi={useHistoryApi} />, rootElement);
};
