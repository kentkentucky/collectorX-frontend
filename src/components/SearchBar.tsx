import { IonSearchbar } from "@ionic/react";
import { Hourglass } from "lucide-react";

import "./SearchBar.css";

function SearchBar() {
  return (
    <div className="searchbar-container">
      <IonSearchbar
        className="searchbar"
        showCancelButton="focus"
        debounce={500}
      ></IonSearchbar>
      <Hourglass className="hourglass-icon" />
    </div>
  );
}

export default SearchBar;
