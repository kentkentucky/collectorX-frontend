import { IonIcon } from "@ionic/react";
import { hammer } from "ionicons/icons";
import { IonSearchbar } from "@ionic/react";

import "./SearchBar.css";

function SearchBar() {
  return (
    <div className="searchbar-container">
      <IonSearchbar
        className="searchbar"
        showCancelButton="focus"
        debounce={500}
      ></IonSearchbar>
      <IonIcon icon={hammer} className="hammer-icon" />
    </div>
  );
}

export default SearchBar;
