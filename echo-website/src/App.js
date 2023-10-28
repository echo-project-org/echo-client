import Header from './components/header/Header';
import Footer from './components/footer/Footer';
import Body from './components/body/Body';

import { HashRouter } from "react-router-dom";

function App() {

  const style = {
    width: '100vw',
    height: '100vh',
  }

  return (
    <div style={style}>
      <HashRouter>
        <Header />
        <Body />
        <Footer />
      </HashRouter>
    </div>
  );
}

export default App;
